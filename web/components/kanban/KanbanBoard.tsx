"use client";

import { useState, useCallback } from "react";
import { DragDropContext, type DropResult } from "@hello-pangea/dnd";
import {
  APPLICATION_STATUSES,
  APPLICATION_TYPES,
  APPLICATION_TYPE_LABELS,
  INDUSTRIES,
  type Application,
  type ApplicationStatus,
  type ApplicationType,
  type Industry,
} from "@/types";
import { KanbanColumn } from "./KanbanColumn";
import { ApplicationFormModal } from "./ApplicationFormModal";
import { ApplicationDetailModal } from "./ApplicationDetailModal";
import { useApplications } from "@/hooks/useApplications";

export function KanbanBoard() {
  const {
    applications,
    isLoading,
    error,
    updateStatus,
    createApp,
    updateApp,
    deleteApp,
  } = useApplications();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingApplication, setEditingApplication] =
    useState<Application | null>(null);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [filterType, setFilterType] = useState<ApplicationType | "all">("all");
  const [filterIndustry, setFilterIndustry] = useState<Industry | "all">("all");
  const [filterWebTestNotTaken, setFilterWebTestNotTaken] = useState(false);

  const filteredApplications = applications
    .filter((a) => filterType === "all" || a.application_type === filterType)
    .filter((a) => filterIndustry === "all" || a.industry === filterIndustry)
    .filter((a) => !filterWebTestNotTaken || a.web_test_status === "not_taken");

  const grouped = APPLICATION_STATUSES.reduce<
    Record<ApplicationStatus, Application[]>
  >(
    (acc, s) => {
      acc[s] = filteredApplications.filter((a) => a.status === s);
      return acc;
    },
    {} as Record<ApplicationStatus, Application[]>
  );

  const handleDragEnd = useCallback(
    (result: DropResult) => {
      if (!result.destination) return;
      const newStatus = result.destination.droppableId as ApplicationStatus;
      const appId = result.draggableId;
      const app = applications.find((a) => a.id === appId);
      if (app && app.status !== newStatus) {
        updateStatus(appId, newStatus);
      }
    },
    [applications, updateStatus]
  );

  function handleCardClick(app: Application) {
    setSelectedApp(app);
  }

  function handleEditFromDetail(app: Application) {
    setSelectedApp(null);
    setEditingApplication(app);
    setIsFormOpen(true);
  }

  function handleCloseForm() {
    setIsFormOpen(false);
    setEditingApplication(null);
  }

  function handleOpenNew() {
    setEditingApplication(null);
    setIsFormOpen(true);
  }

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div
            className="w-12 h-12 rounded-full border-4 border-t-transparent animate-spin"
            style={{ borderColor: "var(--md-primary-container)", borderTopColor: "var(--md-primary)" }}
          />
          <p className="md-body-large" style={{ color: "var(--md-on-surface-variant)" }}>
            読み込み中...
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* ── Toolbar + Filters ── */}
      <div className="flex items-center gap-2 px-4 sm:px-6 py-2">
        <p className="md-body-small shrink-0" style={{ color: "var(--md-on-surface-variant)" }}>
          {applications.length} 社 管理中
        </p>
        <div className="flex flex-wrap items-center gap-2 flex-1 min-w-0">
          <select
            value={filterType}
            onChange={(e) =>
              setFilterType(e.target.value as ApplicationType | "all")
            }
            className="md-label-small px-3 py-1 rounded-full border"
            style={{
              borderColor: "var(--md-outline-variant)",
              background: "var(--md-surface-container)",
              color: "var(--md-on-surface)",
              cursor: "pointer",
            }}
            aria-label="応募種別でフィルタ"
          >
            <option value="all">すべての種別</option>
            {APPLICATION_TYPES.map((t) => (
              <option key={t} value={t}>
                {APPLICATION_TYPE_LABELS[t]}
              </option>
            ))}
          </select>
          <select
            value={filterIndustry}
            onChange={(e) => setFilterIndustry(e.target.value as Industry | "all")}
            className="md-label-small px-3 py-1 rounded-full border"
            style={{
              borderColor: "var(--md-outline-variant)",
              background: "var(--md-surface-container)",
              color: "var(--md-on-surface)",
              cursor: "pointer",
            }}
            aria-label="業界でフィルタ"
          >
            <option value="all">すべての業界</option>
            {INDUSTRIES.map((ind) => (
              <option key={ind} value={ind}>
                {ind}
              </option>
            ))}
          </select>
          <label
            className="md-label-small inline-flex items-center gap-1.5 cursor-pointer"
            style={{ color: "var(--md-on-surface-variant)" }}
          >
            <input
              type="checkbox"
              checked={filterWebTestNotTaken}
              onChange={(e) => setFilterWebTestNotTaken(e.target.checked)}
              className="rounded"
            />
            未受験のみ
          </label>
        </div>
        <button
          onClick={handleOpenNew}
          className="md-btn md-btn-filled hidden sm:inline-flex shrink-0"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          企業を追加
        </button>
      </div>

      {/* Error banner */}
      {error && (
        <div
          className="mx-4 sm:mx-6 mt-3 px-4 py-3 rounded-xl flex items-center gap-3"
          style={{ background: "var(--md-error-container)", color: "var(--md-on-error-container)" }}
        >
          <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="md-body-medium">{error.message}</p>
        </div>
      )}

      {/* ── Kanban ── */}
      <DragDropContext onDragEnd={handleDragEnd}>
        {/*
          Mobile : horizontal snap-scroll, each column ≈ 85vw
          Desktop: horizontal flex with fixed column width
        */}
        <div
          className="flex-1 flex gap-3 px-4 sm:px-6 py-4 overflow-x-auto"
          style={{
            scrollSnapType: "x mandatory",
            WebkitOverflowScrolling: "touch",
            alignItems: "flex-start",
          }}
        >
          {APPLICATION_STATUSES.map((status) => (
            <KanbanColumn
              key={status}
              status={status}
              applications={grouped[status]}
              onCardClick={handleCardClick}
            />
          ))}
        </div>
      </DragDropContext>

      {/* Mobile FAB */}
      <button
        onClick={handleOpenNew}
        className="md-fab sm:hidden"
        aria-label="企業を追加"
        style={{ animation: "md-fab-in 300ms cubic-bezier(.2,0,0,1) forwards" }}
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
        </svg>
      </button>

      {/* Detail modal */}
      {selectedApp && (
        <ApplicationDetailModal
          application={selectedApp}
          onClose={() => setSelectedApp(null)}
          onEdit={handleEditFromDetail}
          onDelete={(id) => {
            deleteApp(id);
            setSelectedApp(null);
          }}
        />
      )}

      {/* Edit modal */}
      {isFormOpen && (
        <ApplicationFormModal
          application={editingApplication}
          onClose={handleCloseForm}
          onCreate={createApp}
          onUpdate={updateApp}
        />
      )}
    </>
  );
}

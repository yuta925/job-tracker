"use client";

import { useState, useCallback } from "react";
import { DragDropContext, type DropResult } from "@hello-pangea/dnd";
import {
  APPLICATION_STATUSES,
  type Application,
  type ApplicationStatus,
} from "@/types";
import { KanbanColumn } from "./KanbanColumn";
import { ApplicationFormModal } from "./ApplicationFormModal";
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

  const grouped = APPLICATION_STATUSES.reduce<
    Record<ApplicationStatus, Application[]>
  >(
    (acc, s) => {
      acc[s] = applications.filter((a) => a.status === s);
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

  function handleEdit(app: Application) {
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
      {/* ── Toolbar ── */}
      <div
        className="flex items-center justify-between px-4 sm:px-6 py-3 border-b"
        style={{ borderColor: "var(--md-outline-variant)" }}
      >
        <div>
          <p className="md-title-medium" style={{ color: "var(--md-on-surface)" }}>
            選考ボード
          </p>
          <p className="md-body-small mt-0.5" style={{ color: "var(--md-on-surface-variant)" }}>
            {applications.length} 社 管理中
          </p>
        </div>

        {/* Desktop: standard button */}
        <button
          onClick={handleOpenNew}
          className="md-btn md-btn-filled hidden sm:inline-flex"
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
              onEdit={handleEdit}
              onDelete={deleteApp}
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

      {/* Modal */}
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

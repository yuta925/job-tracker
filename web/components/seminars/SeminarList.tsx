"use client";

import { useState } from "react";
import type { Seminar, SeminarInsert, SeminarUpdate } from "@/types";
import { SeminarCard } from "./SeminarCard";
import { SeminarDetailModal } from "./SeminarDetailModal";
import { SeminarFormModal } from "./SeminarFormModal";

interface SeminarListProps {
  seminars: Seminar[];
  isLoading: boolean;
  error: Error | null;
  onCreate: (data: SeminarInsert) => Promise<void>;
  onUpdate: (id: string, data: SeminarUpdate) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

function SeminarSection({
  title,
  seminars,
  onCardClick,
  onEdit,
  onDelete,
}: {
  title: string;
  seminars: Seminar[];
  onCardClick: (s: Seminar) => void;
  onEdit: (s: Seminar) => void;
  onDelete: (id: string) => Promise<void>;
}) {
  if (seminars.length === 0) return null;
  return (
    <section className="mb-6">
      <h2
        className="md-title-small mb-3"
        style={{ color: "var(--md-on-surface-variant)" }}
      >
        {title}（{seminars.length}件）
      </h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {seminars.map((seminar) => (
          <SeminarCard
            key={seminar.id}
            seminar={seminar}
            onCardClick={onCardClick}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
    </section>
  );
}

export function SeminarList({
  seminars,
  isLoading,
  error,
  onCreate,
  onUpdate,
  onDelete,
}: SeminarListProps) {
  const [selectedSeminar, setSelectedSeminar] = useState<Seminar | undefined>(undefined);
  const [modalSeminar, setModalSeminar] = useState<Seminar | null | undefined>(
    undefined
  );

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const upcoming = seminars.filter(
    (s) => !s.event_date || new Date(s.event_date + "T00:00:00") >= today
  );
  const past = seminars.filter(
    (s) => s.event_date && new Date(s.event_date + "T00:00:00") < today
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div
          className="w-8 h-8 rounded-full border-2 animate-spin"
          style={{
            borderColor: "var(--md-primary)",
            borderTopColor: "transparent",
          }}
        />
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="mx-4 mt-4 flex items-start gap-3 px-4 py-3 rounded-xl"
        style={{
          background: "var(--md-error-container)",
          color: "var(--md-on-error-container)",
        }}
      >
        <p className="md-body-medium">{error.message}</p>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 py-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4">
        <p className="md-body-medium" style={{ color: "var(--md-on-surface-variant)" }}>
          {seminars.length > 0 ? `${seminars.length} 件` : ""}
        </p>
        <button onClick={() => setModalSeminar(null)} className="md-btn md-btn-filled">
          <svg className="w-4 h-4 mr-1 -ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          説明会を追加
        </button>
      </div>

      {seminars.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-16 gap-3"
          style={{ color: "var(--md-on-surface-variant)" }}
        >
          <svg className="w-12 h-12 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
          </svg>
          <p className="md-body-medium">説明会の記録がありません</p>
          <button
            onClick={() => setModalSeminar(null)}
            className="md-btn md-btn-outlined md-state"
            style={{ borderColor: "var(--md-outline)", color: "var(--md-primary)" }}
          >
            最初の説明会を追加する
          </button>
        </div>
      ) : (
        <>
          <SeminarSection
            title="今後の説明会"
            seminars={upcoming}
            onCardClick={(s) => setSelectedSeminar(s)}
            onEdit={(s) => setModalSeminar(s)}
            onDelete={onDelete}
          />
          <SeminarSection
            title="終了した説明会"
            seminars={past}
            onCardClick={(s) => setSelectedSeminar(s)}
            onEdit={(s) => setModalSeminar(s)}
            onDelete={onDelete}
          />
        </>
      )}

      {selectedSeminar !== undefined && (
        <SeminarDetailModal
          seminar={selectedSeminar}
          onClose={() => setSelectedSeminar(undefined)}
          onEdit={(s) => {
            setSelectedSeminar(undefined);
            setModalSeminar(s);
          }}
          onDelete={async (id) => {
            await onDelete(id);
          }}
        />
      )}

      {modalSeminar !== undefined && (
        <SeminarFormModal
          seminar={modalSeminar}
          onClose={() => setModalSeminar(undefined)}
          onCreate={onCreate}
          onUpdate={onUpdate}
        />
      )}
    </div>
  );
}

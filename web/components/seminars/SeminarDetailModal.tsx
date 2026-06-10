"use client";

import type { Seminar } from "@/types";
import { getRelativeDateLabel } from "@/lib/date";
import { AddToCalendarButton } from "@/components/google_calendar/AddToCalendarButton";
import { addSeminarToCalendar } from "@/lib/google_calendar/actions";

interface SeminarDetailModalProps {
  seminar: Seminar;
  onClose: () => void;
  onEdit: (seminar: Seminar) => void;
  onDelete: (id: string) => void;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <p className="md-label-small" style={{ color: "var(--md-on-surface-variant)" }}>
        {label}
      </p>
      <div className="md-body-medium" style={{ color: "var(--md-on-surface)" }}>
        {children}
      </div>
    </div>
  );
}

export function SeminarDetailModal({
  seminar,
  onClose,
  onEdit,
  onDelete,
}: SeminarDetailModalProps) {
  const relativeLabel = getRelativeDateLabel(seminar.event_date);
  const formattedDate = seminar.event_date
    ? new Date(seminar.event_date + "T00:00:00").toLocaleDateString("ja-JP", {
        year: "numeric",
        month: "numeric",
        day: "numeric",
      })
    : null;

  const isUpcoming =
    seminar.event_date !== null &&
    new Date(seminar.event_date + "T00:00:00") >= new Date(new Date().setHours(0, 0, 0, 0));

  return (
    <div
      className="md-scrim"
      role="dialog"
      aria-modal="true"
      aria-label="説明会詳細"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="md-dialog">
        {/* Header */}
        <div
          className="flex items-start justify-between px-6 pt-6 pb-4"
          style={{ borderBottom: "1px solid var(--md-outline-variant)" }}
        >
          <div className="flex-1 min-w-0 pr-4">
            <h2
              className="md-headline-small truncate"
              style={{ color: "var(--md-on-surface)" }}
            >
              {seminar.title}
            </h2>
            {formattedDate && (
              <span
                className="mt-2 inline-block md-label-small px-2.5 py-0.5 rounded-full"
                style={{
                  background: isUpcoming
                    ? "var(--md-primary-container)"
                    : "var(--md-surface-container-high)",
                  color: isUpcoming
                    ? "var(--md-on-primary-container)"
                    : "var(--md-on-surface-variant)",
                }}
              >
                {formattedDate}（{relativeLabel}）
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full flex items-center justify-center md-state shrink-0"
            style={{ color: "var(--md-on-surface-variant)" }}
            aria-label="閉じる"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-4 space-y-4 overflow-y-auto" style={{ maxHeight: "55vh" }}>
          {seminar.url && (
            <Field label="URL">
              <a
                href={seminar.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 underline"
                style={{ color: "var(--md-primary)" }}
              >
                <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                リンクを開く
              </a>
            </Field>
          )}

          {seminar.memo && (
            <Field label="メモ">
              <p className="whitespace-pre-wrap leading-relaxed">{seminar.memo}</p>
            </Field>
          )}
        </div>

        {/* Footer actions */}
        <div
          className="flex items-center gap-2 px-6 py-4"
          style={{ borderTop: "1px solid var(--md-outline-variant)" }}
        >
          <button
            onClick={() => onEdit(seminar)}
            className="md-btn md-btn-filled"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            編集
          </button>

          <AddToCalendarButton onAdd={() => addSeminarToCalendar(seminar.id)} />

          <button
            onClick={() => {
              if (confirm(`「${seminar.title}」を削除しますか？`)) {
                onDelete(seminar.id);
                onClose();
              }
            }}
            className="md-btn md-btn-text ml-auto"
            style={{ color: "var(--md-error)" }}
            aria-label="削除"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            削除
          </button>
        </div>
      </div>
    </div>
  );
}

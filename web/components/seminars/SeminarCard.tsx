"use client";

import type { Seminar } from "@/types";
import { getRelativeDateLabel } from "@/lib/date";

interface SeminarCardProps {
  seminar: Seminar;
  onEdit: (seminar: Seminar) => void;
  onDelete: (id: string) => void;
}

export function SeminarCard({ seminar, onEdit, onDelete }: SeminarCardProps) {
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
    <div className="md-card group" style={{ boxShadow: "var(--md-elev-1)" }}>
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start gap-2">
          <div className="flex-1 min-w-0">
            <p
              className="md-title-small truncate"
              style={{ color: "var(--md-on-surface)" }}
            >
              {seminar.title}
            </p>
          </div>

          {/* Actions */}
          <div className="flex shrink-0 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onEdit(seminar)}
              className="w-8 h-8 rounded-full flex items-center justify-center md-state"
              style={{ color: "var(--md-on-surface-variant)" }}
              aria-label="編集"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              onClick={() => {
                if (confirm(`「${seminar.title}」を削除しますか？`)) {
                  onDelete(seminar.id);
                }
              }}
              className="w-8 h-8 rounded-full flex items-center justify-center md-state"
              style={{ color: "var(--md-error)" }}
              aria-label="削除"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Meta */}
        <div className="mt-2 flex flex-wrap gap-2 items-center">
          <span
            className="md-label-small inline-flex items-center gap-1 px-2 py-0.5 rounded-full"
            style={{
              background: isUpcoming
                ? "var(--md-primary-container)"
                : "var(--md-surface-container-high)",
              color: isUpcoming
                ? "var(--md-on-primary-container)"
                : "var(--md-on-surface-variant)",
            }}
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {formattedDate ? `${formattedDate}（${relativeLabel}）` : relativeLabel}
          </span>

          {seminar.url && (
            <a
              href={seminar.url}
              target="_blank"
              rel="noopener noreferrer"
              className="md-label-small inline-flex items-center gap-1 px-2 py-0.5 rounded-full md-state"
              style={{
                background: "var(--md-secondary-container)",
                color: "var(--md-on-secondary-container)",
              }}
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              リンクを開く
            </a>
          )}
        </div>

        {seminar.memo && (
          <p
            className="md-body-small mt-2 line-clamp-2 leading-relaxed"
            style={{ color: "var(--md-on-surface-variant)" }}
          >
            {seminar.memo}
          </p>
        )}
      </div>
    </div>
  );
}

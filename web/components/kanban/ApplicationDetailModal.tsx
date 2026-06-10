"use client";

import type { Application } from "@/types";
import {
  STATUS_LABELS,
  APPLICATION_TYPE_LABELS,
} from "@/types";
import { getDeadlineUrgency } from "@/lib/date";
import { AddToCalendarButton } from "@/components/google_calendar/AddToCalendarButton";
import { addApplicationToCalendar } from "@/lib/google_calendar/actions";

interface ApplicationDetailModalProps {
  application: Application;
  onClose: () => void;
  onEdit: (app: Application) => void;
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

export function ApplicationDetailModal({
  application,
  onClose,
  onEdit,
  onDelete,
}: ApplicationDetailModalProps) {
  const formattedInterviewDate = application.next_interview_at
    ? new Date(application.next_interview_at).toLocaleDateString("ja-JP", {
        year: "numeric",
        month: "numeric",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  const deadlineLabel = application.deadline
    ? new Date(application.deadline + "T00:00:00").toLocaleDateString("ja-JP", {
        year: "numeric",
        month: "numeric",
        day: "numeric",
      })
    : null;

  const deadlineUrgency = application.deadline
    ? getDeadlineUrgency(application.deadline)
    : null;

  return (
    <div
      className="md-scrim"
      role="dialog"
      aria-modal="true"
      aria-label="応募詳細"
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
              {application.company_name}
            </h2>
            {application.position_name && (
              <p
                className="md-body-medium mt-0.5 truncate"
                style={{ color: "var(--md-on-surface-variant)" }}
              >
                {application.position_name}
              </p>
            )}
            <span
              className="mt-2 inline-block md-label-small px-2.5 py-0.5 rounded-full"
              style={{
                background: "var(--md-primary-container)",
                color: "var(--md-on-primary-container)",
              }}
            >
              {STATUS_LABELS[application.status]}
            </span>
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
          {/* Type / Industry */}
          {(application.application_type || application.industry) && (
            <div className="grid grid-cols-2 gap-3">
              {application.application_type && (
                <Field label="応募種別">
                  {APPLICATION_TYPE_LABELS[application.application_type]}
                </Field>
              )}
              {application.industry && (
                <Field label="業界">{application.industry}</Field>
              )}
            </div>
          )}

          {/* Screening labels */}
          {application.screening_labels && application.screening_labels.length > 0 && (
            <Field label="選考ラベル">
              <div className="flex flex-wrap gap-1 mt-0.5">
                {application.screening_labels.map((label) => (
                  <span
                    key={label}
                    className="md-label-small inline-flex items-center px-2 py-0.5 rounded-full"
                    style={{
                      background: "var(--md-secondary-container)",
                      color: "var(--md-on-secondary-container)",
                    }}
                  >
                    {label}
                  </span>
                ))}
              </div>
            </Field>
          )}

          {/* Deadline / Interview */}
          {(deadlineLabel || formattedInterviewDate) && (
            <div className="grid grid-cols-2 gap-3">
              {deadlineLabel && (
                <Field label="締切日">
                  <span
                    style={{
                      color:
                        deadlineUrgency === "expired"
                          ? "var(--md-error)"
                          : deadlineUrgency === "soon"
                            ? "#8B4000"
                            : "inherit",
                    }}
                  >
                    {deadlineLabel}
                    {deadlineUrgency === "expired" && " ⚠"}
                    {deadlineUrgency === "soon" && " ⚡"}
                  </span>
                </Field>
              )}
              {formattedInterviewDate && (
                <Field label="次回面接">{formattedInterviewDate}</Field>
              )}
            </div>
          )}

          {/* Memo */}
          {application.memo && (
            <Field label="メモ">
              <p className="whitespace-pre-wrap leading-relaxed">{application.memo}</p>
            </Field>
          )}
        </div>

        {/* Footer actions */}
        <div
          className="flex items-center gap-2 px-6 py-4"
          style={{ borderTop: "1px solid var(--md-outline-variant)" }}
        >
          <button
            onClick={() => onEdit(application)}
            className="md-btn md-btn-filled"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            編集
          </button>

          {application.application_url && (
            <a
              href={application.application_url}
              target="_blank"
              rel="noopener noreferrer"
              className="md-btn md-btn-outlined"
              style={{ borderColor: "var(--md-outline)", color: "var(--md-primary)" }}
              aria-label="マイページを開く"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              マイページ
            </a>
          )}

          {application.next_interview_at && (
            <AddToCalendarButton onAdd={() => addApplicationToCalendar(application.id)} />
          )}

          <button
            onClick={() => {
              if (confirm(`「${application.company_name}」を削除しますか？`)) {
                onDelete(application.id);
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

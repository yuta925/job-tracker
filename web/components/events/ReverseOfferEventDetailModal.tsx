"use client";

import type { ReverseOfferEvent } from "@/types";
import { getRelativeDateLabel } from "@/lib/date";
import { AddToCalendarButton } from "@/components/google_calendar/AddToCalendarButton";
import { addReverseOfferEventToCalendar } from "@/lib/google_calendar/actions";

interface ReverseOfferEventDetailModalProps {
  event: ReverseOfferEvent;
  onClose: () => void;
  onEdit: (event: ReverseOfferEvent) => void;
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

export function ReverseOfferEventDetailModal({
  event,
  onClose,
  onEdit,
  onDelete,
}: ReverseOfferEventDetailModalProps) {
  const relativeLabel = getRelativeDateLabel(event.event_date);
  const formattedDate = event.event_date
    ? new Date(event.event_date + "T00:00:00").toLocaleDateString("ja-JP", {
        year: "numeric",
        month: "numeric",
        day: "numeric",
      })
    : null;

  const isUpcoming =
    event.event_date !== null &&
    new Date(event.event_date + "T00:00:00") >= new Date(new Date().setHours(0, 0, 0, 0));

  const timeLabel =
    event.start_time
      ? event.end_time
        ? `${event.start_time} 〜 ${event.end_time}`
        : event.start_time
      : null;

  return (
    <div
      className="md-scrim"
      role="dialog"
      aria-modal="true"
      aria-label="逆求人イベント詳細"
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
              {event.company_name}
            </h2>
            <p className="md-body-medium mt-0.5" style={{ color: "var(--md-on-surface-variant)" }}>
              {event.event_name}
            </p>
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
                {formattedDate}（{relativeLabel}）{timeLabel && ` · ${timeLabel}`}
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
          {event.contact_name && (
            <Field label="担当者名">{event.contact_name}</Field>
          )}
          {event.next_action && (
            <Field label="次アクション">
              <p style={{ color: "var(--md-primary)" }}>→ {event.next_action}</p>
            </Field>
          )}
          {event.memo && (
            <Field label="メモ">
              <p className="whitespace-pre-wrap leading-relaxed">{event.memo}</p>
            </Field>
          )}
        </div>

        {/* Footer */}
        <div
          className="flex items-center gap-2 px-6 py-4"
          style={{ borderTop: "1px solid var(--md-outline-variant)" }}
        >
          <button onClick={() => onEdit(event)} className="md-btn md-btn-filled">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            編集
          </button>

          <AddToCalendarButton onAdd={() => addReverseOfferEventToCalendar(event.id)} />

          <button
            onClick={() => {
              if (confirm(`「${event.company_name}」のイベント記録を削除しますか？`)) {
                onDelete(event.id);
                onClose();
              }
            }}
            className="md-btn md-btn-text ml-auto"
            style={{ color: "var(--md-error)" }}
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

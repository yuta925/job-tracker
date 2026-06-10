"use client";

import { useState, useTransition } from "react";
import { disconnectGoogleCalendar } from "@/lib/google_calendar/connection";

interface GoogleCalendarSectionProps {
  initialConnected: boolean;
}

export function GoogleCalendarSection({ initialConnected }: GoogleCalendarSectionProps) {
  const [connected, setConnected] = useState(initialConnected);
  const [isPending, startTransition] = useTransition();

  const handleDisconnect = () => {
    startTransition(async () => {
      await disconnectGoogleCalendar();
      setConnected(false);
    });
  };

  return (
    <div
      className="rounded-2xl p-6"
      style={{ background: "var(--md-surface-container-low)" }}
    >
      <h3
        className="md-title-medium mb-1"
        style={{ color: "var(--md-on-surface)" }}
      >
        Googleカレンダー連携
      </h3>
      <p
        className="md-body-small mb-4"
        style={{ color: "var(--md-on-surface-variant)" }}
      >
        連携すると、各イベントの詳細画面から「Googleカレンダーに追加」ボタンでイベントを登録できます。
      </p>

      {connected ? (
        <div className="flex items-center gap-3">
          <span
            className="inline-flex items-center gap-1.5 md-label-small px-3 py-1 rounded-full"
            style={{
              background: "var(--md-primary-container)",
              color: "var(--md-on-primary-container)",
            }}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            連携中
          </span>
          <button
            onClick={handleDisconnect}
            disabled={isPending}
            className="md-btn md-btn-text md-label-small"
            style={{ color: "var(--md-error)" }}
          >
            {isPending ? "解除中..." : "連携を解除"}
          </button>
        </div>
      ) : (
        <a
          href="/api/google-calendar/auth"
          className="md-btn md-btn-outlined inline-flex"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z" />
          </svg>
          Googleカレンダーと連携する
        </a>
      )}
    </div>
  );
}

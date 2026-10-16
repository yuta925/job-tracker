"use client";

import { useState } from "react";
import type {
  ScheduleEvent,
  ScheduleEventInsert,
} from "@/types/schedule_event";

interface Props {
  event: ScheduleEvent | null;
  onClose: () => void;
  onSave: (input: ScheduleEventInsert, id?: string) => Promise<void>;
}

export function ScheduleEventForm({ event, onClose, onSave }: Props) {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const value = (key: string) => String(data.get(key) ?? "").trim() || null;
    const title = value("title");
    const start = value("start_time");
    const end = value("end_time");
    if (!title) {
      setError("予定名を入力してください");
      return;
    }
    if (end && (!start || end <= start)) {
      setError("終了時刻は開始時刻より後にしてください");
      return;
    }
    setPending(true);
    setError(null);
    try {
      await onSave(
        {
          title,
          event_date: value("event_date"),
          start_time: start,
          end_time: end,
          url: value("url"),
          memo: value("memo"),
        },
        event?.id,
      );
      onClose();
    } catch {
      setError("予定を保存できませんでした。再度お試しください。");
    } finally {
      setPending(false);
    }
  }
  return (
    <div
      className="md-scrim"
      role="dialog"
      aria-modal="true"
      aria-label={event ? "予定を編集" : "予定を追加"}
    >
      <form className="md-dialog p-6 space-y-4" onSubmit={submit}>
        <h2 className="md-headline-small">
          {event ? "予定を編集" : "予定を追加"}
        </h2>
        {error && (
          <p role="alert" style={{ color: "var(--md-error)" }}>
            {error}
          </p>
        )}
        <label className="md-field-label">
          予定名
          <input
            className="md-field-input mt-1"
            name="title"
            required
            defaultValue={event?.title}
            placeholder="会社説明会、面談など"
          />
        </label>
        <label className="md-field-label">
          日付
          <input
            className="md-field-input mt-1"
            name="event_date"
            type="date"
            defaultValue={event?.event_date ?? ""}
          />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="md-field-label">
            開始時刻
            <input
              className="md-field-input mt-1"
              name="start_time"
              type="time"
              defaultValue={event?.start_time?.slice(0, 5) ?? ""}
            />
          </label>
          <label className="md-field-label">
            終了時刻
            <input
              className="md-field-input mt-1"
              name="end_time"
              type="time"
              defaultValue={event?.end_time?.slice(0, 5) ?? ""}
            />
          </label>
        </div>
        <label className="md-field-label">
          URL
          <input
            className="md-field-input mt-1"
            name="url"
            type="url"
            defaultValue={event?.url ?? ""}
            placeholder="https://..."
          />
        </label>
        <label className="md-field-label">
          メモ
          <textarea
            className="md-field-input mt-1"
            name="memo"
            rows={4}
            defaultValue={event?.memo ?? ""}
          />
        </label>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            className="md-btn md-btn-text"
            disabled={pending}
            onClick={onClose}
          >
            キャンセル
          </button>
          <button className="md-btn md-btn-filled" disabled={pending}>
            {pending ? "保存中..." : "保存する"}
          </button>
        </div>
      </form>
    </div>
  );
}

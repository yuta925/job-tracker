"use client";

import { useMemo, useState } from "react";
import type { Application } from "@/types/application";
import type { ScheduleEvent } from "@/types/schedule_event";
import type { useScheduleEvents } from "@/hooks/useScheduleEvents";
import { buildAgenda, localDateKey } from "@/lib/home/summary";
import { ScheduleEventForm } from "./ScheduleEventForm";
import { AddToCalendarButton } from "@/components/google_calendar/AddToCalendarButton";
import { addScheduleEventToCalendar } from "@/lib/google_calendar/actions";

interface Props {
  state: ReturnType<typeof useScheduleEvents>;
  initialDate?: string;
  applications: Application[];
  onOpenApplication: (application: Application) => void;
}

export function ScheduleCalendar({
  state,
  applications,
  onOpenApplication,
  initialDate,
}: Props) {
  const today = new Date();
  const initial = initialDate ? new Date(`${initialDate}T00:00:00`) : today;
  const [month, setMonth] = useState(
    new Date(initial.getFullYear(), initial.getMonth(), 1),
  );
  const [selected, setSelected] = useState(localDateKey(initial));
  const [editing, setEditing] = useState<ScheduleEvent | null | undefined>(
    undefined,
  );
  const [detail, setDetail] = useState<ScheduleEvent | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const agenda = useMemo(
    () => buildAgenda(applications, state.events),
    [applications, state.events],
  );
  const start = new Date(
    month.getFullYear(),
    month.getMonth(),
    1 - month.getDay(),
  );
  const days = Array.from(
    { length: 42 },
    (_, index) =>
      new Date(start.getFullYear(), start.getMonth(), start.getDate() + index),
  );
  const selectedItems = agenda.filter((item) => item.date === selected);
  const undated = state.events.filter((event) => !event.event_date);

  return (
    <section className="max-w-6xl mx-auto p-4 sm:p-6 space-y-5">
      <div className="flex flex-wrap justify-between gap-3 items-center">
        <div>
          <p className="home-eyebrow">YOUR SCHEDULE</p>
          <h2 className="md-headline-medium">予定を、ひとつに。</h2>
          <p className="md-body-small mt-1">
            面接は選考情報から自動表示。説明会や面談もここにまとめられます。
          </p>
        </div>
        <button
          className="md-btn md-btn-filled"
          onClick={() => setEditing(null)}
        >
          ＋ 予定を追加
        </button>
      </div>
      {state.error && (
        <p role="alert" className="home-error">
          予定を読み込めませんでした。
          <button
            className="md-btn md-btn-text"
            onClick={() => void state.reload()}
          >
            再試行
          </button>
        </p>
      )}
      {state.isLoading ? (
        <p role="status">予定を読み込み中...</p>
      ) : (
        <div className="schedule-layout">
          <div className="home-panel">
            <div className="flex items-center justify-between gap-2 mb-4">
              <button
                className="md-btn md-btn-text"
                aria-label="前月"
                onClick={() =>
                  setMonth(
                    new Date(month.getFullYear(), month.getMonth() - 1, 1),
                  )
                }
              >
                ←
              </button>
              <h3 className="md-title-large">
                {month.getFullYear()}年{month.getMonth() + 1}月
              </h3>
              <button
                className="md-btn md-btn-text"
                aria-label="次月"
                onClick={() =>
                  setMonth(
                    new Date(month.getFullYear(), month.getMonth() + 1, 1),
                  )
                }
              >
                →
              </button>
            </div>
            <div className="grid grid-cols-7 gap-1">
              {["日", "月", "火", "水", "木", "金", "土"].map((day) => (
                <span key={day} className="text-center md-label-small py-2">
                  {day}
                </span>
              ))}
              {days.map((date) => {
                const key = localDateKey(date);
                const count = agenda.filter((item) => item.date === key).length;
                return (
                  <button
                    key={key}
                    aria-label={`${key}${count ? ` 予定${count}件` : ""}`}
                    aria-pressed={selected === key}
                    className="schedule-day"
                    data-outside={date.getMonth() !== month.getMonth()}
                    data-today={key === localDateKey(today)}
                    onClick={() => setSelected(key)}
                  >
                    <span>{date.getDate()}</span>
                    <span className="schedule-dot" aria-hidden="true">
                      {count ? "●" : ""}
                    </span>
                  </button>
                );
              })}
            </div>
            <button
              className="md-btn md-btn-text mt-3"
              onClick={() => {
                setMonth(new Date(today.getFullYear(), today.getMonth(), 1));
                setSelected(localDateKey(today));
              }}
            >
              今日に戻る
            </button>
          </div>
          <div className="home-panel">
            <h3 className="md-title-medium mb-3">
              {new Date(`${selected}T00:00:00`).toLocaleDateString("ja-JP", {
                month: "long",
                day: "numeric",
                weekday: "short",
              })}
            </h3>
            {selectedItems.length === 0 && (
              <p className="home-empty">この日の予定はありません。</p>
            )}
            {selectedItems.map((item) => (
              <button
                className="home-list-row w-full text-left"
                key={item.id}
                onClick={() => {
                  if (item.kind === "interview") {
                    const app = applications.find(
                      (app) => app.id === item.sourceId,
                    );
                    if (app) onOpenApplication(app);
                  } else {
                    setError(null);
                    setDetail(
                      state.events.find(
                        (event) => event.id === item.sourceId,
                      ) ?? null,
                    );
                  }
                }}
              >
                <span className="home-time">{item.time ?? "終日"}</span>
                <span className="min-w-0 break-words">{item.title}</span>
                <span aria-hidden="true">↗</span>
              </button>
            ))}
            {undated.length > 0 && (
              <>
                <h3 className="md-title-medium mt-6 mb-2">日程未定</h3>
                {undated.map((event) => (
                  <button
                    key={event.id}
                    className="home-list-row w-full text-left"
                    onClick={() => {
                      setError(null);
                      setDetail(event);
                    }}
                  >
                    {event.title}
                  </button>
                ))}
              </>
            )}
          </div>
        </div>
      )}
      {editing !== undefined && (
        <ScheduleEventForm
          event={editing}
          onClose={() => setEditing(undefined)}
          onSave={state.save}
        />
      )}
      {detail && (
        <div
          className="md-scrim"
          role="dialog"
          aria-modal="true"
          aria-label="予定の詳細"
        >
          <div className="md-dialog p-6 space-y-4">
            <h2 className="md-headline-small break-words">{detail.title}</h2>
            <p>
              {detail.event_date ?? "日程未定"} {detail.start_time?.slice(0, 5)}
              {detail.end_time ? `〜${detail.end_time.slice(0, 5)}` : ""}
            </p>
            {detail.url && /^https?:\/\//i.test(detail.url) && (
              <a
                className="underline break-all"
                href={detail.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                予定のリンクを開く ↗
              </a>
            )}
            {detail.memo && (
              <p className="whitespace-pre-wrap break-words">{detail.memo}</p>
            )}
            {detail.event_date && (
              <AddToCalendarButton
                onAdd={() => addScheduleEventToCalendar(detail.id)}
              />
            )}
            {error && (
              <p role="alert" className="home-error">
                {error}
              </p>
            )}
            <div className="flex flex-wrap justify-end gap-2">
              <button
                className="md-btn md-btn-text"
                disabled={deleting}
                onClick={async () => {
                  if (!window.confirm("この予定を削除しますか？")) return;
                  setDeleting(true);
                  try {
                    await state.remove(detail.id);
                    setDetail(null);
                  } catch {
                    setError("削除できませんでした。再度お試しください。");
                  } finally {
                    setDeleting(false);
                  }
                }}
              >
                削除
              </button>
              <button
                className="md-btn md-btn-tonal"
                disabled={deleting}
                onClick={() => {
                  setEditing(detail);
                  setDetail(null);
                }}
              >
                編集
              </button>
              <button
                className="md-btn md-btn-filled"
                disabled={deleting}
                onClick={() => setDetail(null)}
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

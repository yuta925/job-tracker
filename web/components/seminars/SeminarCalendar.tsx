"use client";

import { useMemo, useState } from "react";
import type { Application, Seminar, SeminarInsert, SeminarUpdate } from "@/types";
import { useApplications } from "@/hooks/useApplications";
import { SeminarDetailModal } from "./SeminarDetailModal";
import { SeminarFormModal } from "./SeminarFormModal";

interface SeminarCalendarProps {
  seminars: Seminar[];
  isLoading: boolean;
  error: Error | null;
  onCreate: (data: SeminarInsert) => Promise<void>;
  onUpdate: (id: string, data: SeminarUpdate) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

type CalendarEvent =
  | { kind: "seminar"; date: string; seminar: Seminar }
  | { kind: "interview"; date: string; application: Application };

const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];

function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function buildCalendarGrid(year: number, month: number): Date[][] {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const start = new Date(firstDay);
  start.setDate(firstDay.getDate() - firstDay.getDay());

  const weeks: Date[][] = [];
  const current = new Date(start);
  while (weeks.length < 6) {
    const week: Date[] = [];
    for (let i = 0; i < 7; i++) {
      week.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    weeks.push(week);
    if (current > lastDay && weeks.length >= 5) break;
  }
  return weeks;
}

function EventDots({ events }: { events: CalendarEvent[] }) {
  const hasSeminar = events.some((e) => e.kind === "seminar");
  const hasInterview = events.some((e) => e.kind === "interview");
  if (!hasSeminar && !hasInterview) return null;
  return (
    <div className="flex justify-center gap-0.5 mt-0.5">
      {hasSeminar && (
        <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--md-primary)" }} />
      )}
      {hasInterview && (
        <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--md-tertiary, #7c3aed)" }} />
      )}
    </div>
  );
}

function ChevronRight() {
  return (
    <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
    </svg>
  );
}

function SelectedDayPanel({
  date,
  events,
  onSeminarClick,
}: {
  date: Date;
  events: CalendarEvent[];
  onSeminarClick: (seminar: Seminar) => void;
}) {
  const label = date.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
  });

  return (
    <div className="mt-6 px-4 sm:px-6 pb-6">
      <p className="md-label-medium mb-2" style={{ color: "var(--md-on-surface-variant)" }}>
        {label}
      </p>

      <div
        className="rounded-2xl overflow-hidden"
        style={{ border: "1px solid var(--md-outline-variant)" }}
      >
        {events.length === 0 ? (
          <p className="px-4 py-4 md-body-medium" style={{ color: "var(--md-on-surface-variant)" }}>
            この日のイベントはありません
          </p>
        ) : (
          events.map((event, i) => {
            const isLast = i === events.length - 1;

            if (event.kind === "seminar") {
              return (
                <button
                  key={i}
                  onClick={() => onSeminarClick(event.seminar)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors"
                  style={{
                    borderBottom: isLast ? undefined : "1px solid var(--md-outline-variant)",
                    color: "var(--md-on-surface)",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background = "var(--md-surface-container)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background = "";
                  }}
                >
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ background: "var(--md-primary)" }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="md-label-small mb-0.5" style={{ color: "var(--md-on-surface-variant)" }}>
                      説明会
                    </p>
                    <p className="md-body-medium truncate">{event.seminar.title}</p>
                  </div>
                  <ChevronRight />
                </button>
              );
            }

            return (
              <div
                key={i}
                className="flex items-center gap-3 px-4 py-3"
                style={{
                  borderBottom: isLast ? undefined : "1px solid var(--md-outline-variant)",
                  color: "var(--md-on-surface)",
                }}
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ background: "var(--md-tertiary, #7c3aed)" }}
                />
                <div className="flex-1 min-w-0">
                  <p className="md-label-small mb-0.5" style={{ color: "var(--md-on-surface-variant)" }}>
                    面接 · {event.application.company_name}
                  </p>
                  <p className="md-body-medium truncate">
                    {event.application.position_name ?? "（職種未設定）"}
                  </p>
                </div>
                {event.application.next_interview_at && (
                  <p className="md-label-small shrink-0" style={{ color: "var(--md-on-surface-variant)" }}>
                    {new Date(event.application.next_interview_at).toLocaleTimeString("ja-JP", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export function SeminarCalendar({
  seminars,
  isLoading,
  error,
  onCreate,
  onUpdate,
  onDelete,
}: SeminarCalendarProps) {
  const { applications } = useApplications();

  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSeminar, setSelectedSeminar] = useState<Seminar | undefined>(undefined);
  const [modalSeminar, setModalSeminar] = useState<Seminar | null | undefined>(undefined);

  const eventMap = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const seminar of seminars) {
      if (!seminar.event_date) continue;
      const list = map.get(seminar.event_date) ?? [];
      list.push({ kind: "seminar", date: seminar.event_date, seminar });
      map.set(seminar.event_date, list);
    }
    for (const app of applications) {
      if (!app.next_interview_at) continue;
      const key = app.next_interview_at.slice(0, 10);
      const list = map.get(key) ?? [];
      list.push({ kind: "interview", date: key, application: app });
      map.set(key, list);
    }
    return map;
  }, [seminars, applications]);

  const weeks = useMemo(
    () => buildCalendarGrid(currentYear, currentMonth),
    [currentYear, currentMonth]
  );

  function prevMonth() {
    if (currentMonth === 0) { setCurrentYear((y) => y - 1); setCurrentMonth(11); }
    else setCurrentMonth((m) => m - 1);
    setSelectedDate(null);
  }

  function nextMonth() {
    if (currentMonth === 11) { setCurrentYear((y) => y + 1); setCurrentMonth(0); }
    else setCurrentMonth((m) => m + 1);
    setSelectedDate(null);
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div
          className="w-8 h-8 rounded-full border-2 animate-spin"
          style={{ borderColor: "var(--md-primary)", borderTopColor: "transparent" }}
        />
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="mx-4 mt-4 px-4 py-3 rounded-xl"
        style={{ background: "var(--md-error-container)", color: "var(--md-on-error-container)" }}
      >
        <p className="md-body-medium">{error.message}</p>
      </div>
    );
  }

  const todayKey = toDateKey(today);
  const selectedKey = selectedDate ? toDateKey(selectedDate) : null;
  const selectedEvents = selectedKey ? (eventMap.get(selectedKey) ?? []) : [];

  return (
    <div className="py-4">
      {/* ヘッダー */}
      <div className="flex items-center justify-between px-4 sm:px-6 mb-4">
        <div className="flex items-center gap-1">
          <button
            onClick={prevMonth}
            className="w-9 h-9 rounded-full flex items-center justify-center transition-colors"
            style={{ color: "var(--md-on-surface-variant)" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "var(--md-surface-container-high)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = ""; }}
            aria-label="前月"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <h2
            className="md-title-large min-w-[8rem] text-center select-none"
            style={{ color: "var(--md-on-surface)" }}
          >
            {currentYear}年{currentMonth + 1}月
          </h2>

          <button
            onClick={nextMonth}
            className="w-9 h-9 rounded-full flex items-center justify-center transition-colors"
            style={{ color: "var(--md-on-surface-variant)" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "var(--md-surface-container-high)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = ""; }}
            aria-label="次月"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <button
            onClick={() => {
              setCurrentYear(today.getFullYear());
              setCurrentMonth(today.getMonth());
              setSelectedDate(null);
            }}
            className="ml-1 px-3 py-1 rounded-full text-sm transition-colors"
            style={{
              border: "1px solid var(--md-outline-variant)",
              color: "var(--md-on-surface-variant)",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "var(--md-surface-container-high)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = ""; }}
          >
            今月
          </button>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-3">
            <span className="flex items-center gap-1.5 md-label-small" style={{ color: "var(--md-on-surface-variant)" }}>
              <span className="w-2 h-2 rounded-full" style={{ background: "var(--md-primary)" }} />
              説明会
            </span>
            <span className="flex items-center gap-1.5 md-label-small" style={{ color: "var(--md-on-surface-variant)" }}>
              <span className="w-2 h-2 rounded-full" style={{ background: "var(--md-tertiary, #7c3aed)" }} />
              面接
            </span>
          </div>
          <button
            onClick={() => setModalSeminar(null)}
            className="md-btn md-btn-filled"
          >
            <svg className="w-4 h-4 mr-1 -ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            説明会を追加
          </button>
        </div>
      </div>

      {/* カレンダーグリッド */}
      <div className="px-4 sm:px-6">
        <div className="rounded-2xl overflow-hidden" style={{ background: "var(--md-surface-container)" }}>
          {/* 曜日ヘッダー */}
          <div
            className="grid grid-cols-7"
            style={{ borderBottom: "1px solid var(--md-outline-variant)" }}
          >
            {WEEKDAYS.map((day, i) => (
              <div
                key={day}
                className="py-2 text-center text-xs font-medium select-none"
                style={{
                  color:
                    i === 0 ? "var(--md-error)"
                    : i === 6 ? "var(--md-primary)"
                    : "var(--md-on-surface-variant)",
                }}
              >
                {day}
              </div>
            ))}
          </div>

          {/* 日付グリッド */}
          <div className="grid grid-cols-7 p-1 gap-0.5">
            {weeks.map((week, wi) =>
              week.map((date, di) => {
                const dateKey = toDateKey(date);
                const isCurrentMonth = date.getMonth() === currentMonth;
                const isToday = dateKey === todayKey;
                const isSelected = dateKey === selectedKey;
                const events = eventMap.get(dateKey) ?? [];

                return (
                  <button
                    key={`${wi}-${di}`}
                    onClick={() => setSelectedDate(isSelected ? null : date)}
                    className="flex flex-col items-center py-2 rounded-xl transition-colors"
                    style={{
                      background: isSelected
                        ? "var(--md-surface-container-highest)"
                        : undefined,
                      opacity: isCurrentMonth ? 1 : 0.3,
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected)
                        (e.currentTarget as HTMLButtonElement).style.background =
                          "var(--md-surface-container-high)";
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected)
                        (e.currentTarget as HTMLButtonElement).style.background = "";
                    }}
                  >
                    <span
                      className="w-8 h-8 flex items-center justify-center text-sm rounded-full leading-none"
                      style={
                        isToday
                          ? { background: "var(--md-primary)", color: "var(--md-on-primary)", fontWeight: 700 }
                          : { color: "var(--md-on-surface)" }
                      }
                    >
                      {date.getDate()}
                    </span>
                    <EventDots events={events} />
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* 選択した日のイベントリスト */}
      {selectedDate && (
        <SelectedDayPanel
          date={selectedDate}
          events={selectedEvents}
          onSeminarClick={setSelectedSeminar}
        />
      )}

      {/* モーダル */}
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
            setSelectedDate(null);
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

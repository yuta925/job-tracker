"use client";

import { createContext, useContext, useMemo, useState } from "react";
import { DayPicker } from "react-day-picker";
import { ja } from "react-day-picker/locale";
import type { DayButtonProps } from "react-day-picker";
import "react-day-picker/style.css";
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

type EventMap = Map<string, CalendarEvent[]>;

const EventMapContext = createContext<EventMap>(new Map());

function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function CalendarDayButton({ day, modifiers, children, ...buttonProps }: DayButtonProps) {
  const eventMap = useContext(EventMapContext);
  const dateStr = toDateKey(day.date);
  const events = eventMap.get(dateStr) ?? [];
  const hasSeminar = events.some((e) => e.kind === "seminar");
  const hasInterview = events.some((e) => e.kind === "interview");

  return (
    <button
      {...buttonProps}
      style={{
        ...buttonProps.style,
        ...(modifiers.selected
          ? { background: "var(--md-primary)", color: "var(--md-on-primary)" }
          : modifiers.today
            ? { color: "var(--md-primary)", fontWeight: "bold" }
            : {}),
      }}
    >
      <span>{children}</span>
      {(hasSeminar || hasInterview) && (
        <span className="flex gap-0.5 justify-center mt-0.5">
          {hasSeminar && (
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: "var(--md-primary)" }}
            />
          )}
          {hasInterview && (
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: "var(--md-tertiary, #6750a4)" }}
            />
          )}
        </span>
      )}
    </button>
  );
}

function SelectedDayEvents({
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
    <div className="mt-4 border-t pt-4" style={{ borderColor: "var(--md-outline-variant)" }}>
      <p className="md-title-small mb-3" style={{ color: "var(--md-on-surface-variant)" }}>
        {label}
      </p>
      {events.length === 0 ? (
        <p className="md-body-medium" style={{ color: "var(--md-on-surface-variant)" }}>
          この日のイベントはありません
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {events.map((event, i) => {
            if (event.kind === "seminar") {
              return (
                <button
                  key={i}
                  onClick={() => onSeminarClick(event.seminar)}
                  className="text-left p-3 rounded-xl md-state"
                  style={{
                    background: "var(--md-primary-container)",
                    color: "var(--md-on-primary-container)",
                  }}
                >
                  <p className="md-label-small mb-0.5" style={{ opacity: 0.7 }}>
                    説明会
                  </p>
                  <p className="md-title-small">{event.seminar.title}</p>
                  {event.seminar.url && (
                    <p className="md-body-small mt-0.5 truncate" style={{ opacity: 0.7 }}>
                      {event.seminar.url}
                    </p>
                  )}
                </button>
              );
            }
            return (
              <div
                key={i}
                className="p-3 rounded-xl"
                style={{
                  background: "var(--md-tertiary-container, #eaddff)",
                  color: "var(--md-on-tertiary-container, #21005d)",
                }}
              >
                <p className="md-label-small mb-0.5" style={{ opacity: 0.7 }}>
                  面接 — {event.application.company_name}
                </p>
                <p className="md-title-small">
                  {event.application.position_name ?? "（職種未設定）"}
                </p>
                {event.application.next_interview_at && (
                  <p className="md-body-small mt-0.5" style={{ opacity: 0.7 }}>
                    {new Date(event.application.next_interview_at).toLocaleTimeString("ja-JP", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
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

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedSeminar, setSelectedSeminar] = useState<Seminar | undefined>(undefined);
  const [modalSeminar, setModalSeminar] = useState<Seminar | null | undefined>(undefined);

  const eventMap = useMemo<EventMap>(() => {
    const map = new Map<string, CalendarEvent[]>();

    for (const seminar of seminars) {
      if (!seminar.event_date) continue;
      const key = seminar.event_date;
      const list = map.get(key) ?? [];
      list.push({ kind: "seminar", date: key, seminar });
      map.set(key, list);
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

  const selectedDayEvents = useMemo<CalendarEvent[]>(() => {
    if (!selectedDate) return [];
    return eventMap.get(toDateKey(selectedDate)) ?? [];
  }, [selectedDate, eventMap]);

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
      <div className="flex items-center justify-end mb-4">
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

      {/* Calendar */}
      <div className="calendar-wrapper">
        <EventMapContext.Provider value={eventMap}>
          <DayPicker
            locale={ja}
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            components={{ DayButton: CalendarDayButton }}
            classNames={{
              root: "rdp-calendar",
            }}
          />
        </EventMapContext.Provider>
      </div>

      {/* Selected day events */}
      {selectedDate && (
        <SelectedDayEvents
          date={selectedDate}
          events={selectedDayEvents}
          onSeminarClick={(seminar) => setSelectedSeminar(seminar)}
        />
      )}

      {/* Modals */}
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

"use client";

import { useMemo, useState } from "react";
import type {
  Application,
  CaMeeting,
  CaMeetingInsert,
  CaMeetingUpdate,
  ReverseOfferEvent,
  ReverseOfferEventInsert,
  ReverseOfferEventUpdate,
  Seminar,
  SeminarInsert,
  SeminarUpdate,
} from "@/types";
import { useApplications } from "@/hooks/useApplications";
import { SeminarDetailModal } from "@/components/seminars/SeminarDetailModal";
import { SeminarFormModal } from "@/components/seminars/SeminarFormModal";
import { ReverseOfferEventDetailModal } from "@/components/events/ReverseOfferEventDetailModal";
import { ReverseOfferEventFormModal } from "@/components/events/ReverseOfferEventFormModal";
import { CaMeetingDetailModal } from "@/components/ca_meetings/CaMeetingDetailModal";
import { CaMeetingFormModal } from "@/components/ca_meetings/CaMeetingFormModal";

interface ScheduleCalendarProps {
  seminars: Seminar[];
  reverseOfferEvents: ReverseOfferEvent[];
  caMeetings: CaMeeting[];
  isLoading: boolean;
  error: Error | null;
  onCreateSeminar: (data: SeminarInsert) => Promise<void>;
  onUpdateSeminar: (id: string, data: SeminarUpdate) => Promise<void>;
  onDeleteSeminar: (id: string) => Promise<void>;
  onCreateReverseOffer: (data: ReverseOfferEventInsert) => Promise<void>;
  onUpdateReverseOffer: (id: string, data: ReverseOfferEventUpdate) => Promise<void>;
  onDeleteReverseOffer: (id: string) => Promise<void>;
  onCreateCaMeeting: (data: CaMeetingInsert) => Promise<void>;
  onUpdateCaMeeting: (id: string, data: CaMeetingUpdate) => Promise<void>;
  onDeleteCaMeeting: (id: string) => Promise<void>;
}

type CalendarEvent =
  | { kind: "seminar";       date: string; seminar: Seminar }
  | { kind: "interview";     date: string; application: Application }
  | { kind: "reverse_offer"; date: string; event: ReverseOfferEvent }
  | { kind: "ca_meeting";    date: string; meeting: CaMeeting };

const EVENT_COLORS = {
  seminar:       "var(--md-primary)",
  interview:     "var(--md-tertiary, #65587A)",
  reverse_offer: "#16a34a",
  ca_meeting:    "var(--md-error)",
} as const;

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
  const kinds = [...new Set(events.map((e) => e.kind))];
  if (kinds.length === 0) return null;
  return (
    <div className="flex justify-center gap-0.5 mt-0.5">
      {kinds.map((kind) => (
        <span
          key={kind}
          className="w-1.5 h-1.5 rounded-full"
          style={{ background: EVENT_COLORS[kind] }}
        />
      ))}
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

function eventLabel(event: CalendarEvent): string {
  switch (event.kind) {
    case "seminar": return "説明会";
    case "interview": return "面接";
    case "reverse_offer": return "逆求人";
    case "ca_meeting": return "CA面談";
  }
}

function eventTitle(event: CalendarEvent): string {
  switch (event.kind) {
    case "seminar": return event.seminar.title;
    case "interview": return event.application.position_name ?? event.application.company_name;
    case "reverse_offer": return `${event.event.company_name} · ${event.event.event_name}`;
    case "ca_meeting": return `${event.meeting.advisor_name}${event.meeting.agency_name ? ` · ${event.meeting.agency_name}` : ""}`;
  }
}

function eventTime(event: CalendarEvent): string | null {
  switch (event.kind) {
    case "seminar": return event.seminar.start_time ?? null;
    case "interview":
      return event.application.next_interview_at
        ? new Date(event.application.next_interview_at).toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" })
        : null;
    case "reverse_offer": return event.event.start_time ?? null;
    case "ca_meeting": return event.meeting.start_time ?? null;
  }
}

function SelectedDayPanel({
  date,
  events,
  onSeminarClick,
  onReverseOfferClick,
  onCaMeetingClick,
}: {
  date: Date;
  events: CalendarEvent[];
  onSeminarClick: (s: Seminar) => void;
  onReverseOfferClick: (e: ReverseOfferEvent) => void;
  onCaMeetingClick: (m: CaMeeting) => void;
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
            const isClickable = event.kind !== "interview";
            const time = eventTime(event);

            const handleClick = () => {
              if (event.kind === "seminar") onSeminarClick(event.seminar);
              else if (event.kind === "reverse_offer") onReverseOfferClick(event.event);
              else if (event.kind === "ca_meeting") onCaMeetingClick(event.meeting);
            };

            const rowStyle = {
              borderBottom: isLast ? undefined : "1px solid var(--md-outline-variant)",
              color: "var(--md-on-surface)" as const,
            };

            if (isClickable) {
              return (
                <button
                  key={i}
                  onClick={handleClick}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors"
                  style={rowStyle}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "var(--md-surface-container)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = ""; }}
                >
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ background: EVENT_COLORS[event.kind] }} />
                  <div className="flex-1 min-w-0">
                    <p className="md-label-small mb-0.5" style={{ color: "var(--md-on-surface-variant)" }}>
                      {eventLabel(event)}
                    </p>
                    <p className="md-body-medium truncate">{eventTitle(event)}</p>
                  </div>
                  {time && <p className="md-label-small shrink-0" style={{ color: "var(--md-on-surface-variant)" }}>{time}</p>}
                  <ChevronRight />
                </button>
              );
            }

            return (
              <div key={i} className="flex items-center gap-3 px-4 py-3" style={rowStyle}>
                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: EVENT_COLORS[event.kind] }} />
                <div className="flex-1 min-w-0">
                  <p className="md-label-small mb-0.5" style={{ color: "var(--md-on-surface-variant)" }}>
                    {eventLabel(event)}
                    {event.kind === "interview" && ` · ${event.application.company_name}`}
                  </p>
                  <p className="md-body-medium truncate">{eventTitle(event)}</p>
                </div>
                {time && <p className="md-label-small shrink-0" style={{ color: "var(--md-on-surface-variant)" }}>{time}</p>}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

type ModalSeminar = Seminar | null | undefined;
type ModalReverseOffer = ReverseOfferEvent | null | undefined;
type ModalCaMeeting = CaMeeting | null | undefined;

export function ScheduleCalendar({
  seminars,
  reverseOfferEvents,
  caMeetings,
  isLoading,
  error,
  onCreateSeminar,
  onUpdateSeminar,
  onDeleteSeminar,
  onCreateReverseOffer,
  onUpdateReverseOffer,
  onDeleteReverseOffer,
  onCreateCaMeeting,
  onUpdateCaMeeting,
  onDeleteCaMeeting,
}: ScheduleCalendarProps) {
  const { applications } = useApplications();

  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Detail modal state
  const [selectedSeminar, setSelectedSeminar] = useState<Seminar | undefined>(undefined);
  const [selectedReverseOffer, setSelectedReverseOffer] = useState<ReverseOfferEvent | undefined>(undefined);
  const [selectedCaMeeting, setSelectedCaMeeting] = useState<CaMeeting | undefined>(undefined);

  // Form modal state
  const [modalSeminar, setModalSeminar] = useState<ModalSeminar>(undefined);
  const [modalReverseOffer, setModalReverseOffer] = useState<ModalReverseOffer>(undefined);
  const [modalCaMeeting, setModalCaMeeting] = useState<ModalCaMeeting>(undefined);

  const eventMap = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();

    const push = (key: string, ev: CalendarEvent) => {
      const list = map.get(key) ?? [];
      list.push(ev);
      map.set(key, list);
    };

    for (const seminar of seminars) {
      if (seminar.event_date) push(seminar.event_date, { kind: "seminar", date: seminar.event_date, seminar });
    }
    for (const app of applications) {
      if (app.next_interview_at) {
        const key = app.next_interview_at.slice(0, 10);
        push(key, { kind: "interview", date: key, application: app });
      }
    }
    for (const event of reverseOfferEvents) {
      if (event.event_date) push(event.event_date, { kind: "reverse_offer", date: event.event_date, event });
    }
    for (const meeting of caMeetings) {
      if (meeting.meeting_date) push(meeting.meeting_date, { kind: "ca_meeting", date: meeting.meeting_date, meeting });
    }

    return map;
  }, [seminars, applications, reverseOfferEvents, caMeetings]);

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
            onClick={() => { setCurrentYear(today.getFullYear()); setCurrentMonth(today.getMonth()); setSelectedDate(null); }}
            className="ml-1 px-3 py-1 rounded-full text-sm transition-colors"
            style={{ border: "1px solid var(--md-outline-variant)", color: "var(--md-on-surface-variant)" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "var(--md-surface-container-high)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = ""; }}
          >
            今月
          </button>
        </div>

        {/* 凡例＋追加ボタン */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-3">
            {(["seminar", "reverse_offer", "ca_meeting", "interview"] as const).map((kind) => (
              <span key={kind} className="flex items-center gap-1.5 md-label-small" style={{ color: "var(--md-on-surface-variant)" }}>
                <span className="w-2 h-2 rounded-full" style={{ background: EVENT_COLORS[kind] }} />
                {kind === "seminar" ? "説明会" : kind === "reverse_offer" ? "逆求人" : kind === "ca_meeting" ? "CA面談" : "面接"}
              </span>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setModalSeminar(null)} className="md-btn md-btn-filled">
              <svg className="w-4 h-4 mr-1 -ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              説明会
            </button>
            <button onClick={() => setModalReverseOffer(null)} className="md-btn md-btn-tonal">
              <svg className="w-4 h-4 mr-1 -ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              逆求人
            </button>
            <button onClick={() => setModalCaMeeting(null)} className="md-btn md-btn-tonal">
              <svg className="w-4 h-4 mr-1 -ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              CA面談
            </button>
          </div>
        </div>
      </div>

      {/* カレンダーグリッド */}
      <div className="px-4 sm:px-6">
        <div className="rounded-2xl overflow-hidden" style={{ background: "var(--md-surface-container)" }}>
          {/* 曜日ヘッダー */}
          <div className="grid grid-cols-7" style={{ borderBottom: "1px solid var(--md-outline-variant)" }}>
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
                      background: isSelected ? "var(--md-surface-container-highest)" : undefined,
                      opacity: isCurrentMonth ? 1 : 0.3,
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) (e.currentTarget as HTMLButtonElement).style.background = "var(--md-surface-container-high)";
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) (e.currentTarget as HTMLButtonElement).style.background = "";
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

      {/* 選択日イベントリスト */}
      {selectedDate && (
        <SelectedDayPanel
          date={selectedDate}
          events={selectedEvents}
          onSeminarClick={setSelectedSeminar}
          onReverseOfferClick={setSelectedReverseOffer}
          onCaMeetingClick={setSelectedCaMeeting}
        />
      )}

      {/* 説明会モーダル */}
      {selectedSeminar !== undefined && (
        <SeminarDetailModal
          seminar={selectedSeminar}
          onClose={() => setSelectedSeminar(undefined)}
          onEdit={(s) => { setSelectedSeminar(undefined); setModalSeminar(s); }}
          onDelete={async (id) => { await onDeleteSeminar(id); setSelectedDate(null); }}
        />
      )}
      {modalSeminar !== undefined && (
        <SeminarFormModal
          seminar={modalSeminar}
          onClose={() => setModalSeminar(undefined)}
          onCreate={onCreateSeminar}
          onUpdate={onUpdateSeminar}
        />
      )}

      {/* 逆求人モーダル */}
      {selectedReverseOffer !== undefined && (
        <ReverseOfferEventDetailModal
          event={selectedReverseOffer}
          onClose={() => setSelectedReverseOffer(undefined)}
          onEdit={(e) => { setSelectedReverseOffer(undefined); setModalReverseOffer(e); }}
          onDelete={async (id) => { await onDeleteReverseOffer(id); setSelectedDate(null); }}
        />
      )}
      {modalReverseOffer !== undefined && (
        <ReverseOfferEventFormModal
          event={modalReverseOffer}
          onClose={() => setModalReverseOffer(undefined)}
          onCreate={onCreateReverseOffer}
          onUpdate={onUpdateReverseOffer}
        />
      )}

      {/* CA面談モーダル */}
      {selectedCaMeeting !== undefined && (
        <CaMeetingDetailModal
          meeting={selectedCaMeeting}
          onClose={() => setSelectedCaMeeting(undefined)}
          onEdit={(m) => { setSelectedCaMeeting(undefined); setModalCaMeeting(m); }}
          onDelete={async (id) => { await onDeleteCaMeeting(id); setSelectedDate(null); }}
        />
      )}
      {modalCaMeeting !== undefined && (
        <CaMeetingFormModal
          meeting={modalCaMeeting}
          onClose={() => setModalCaMeeting(undefined)}
          onCreate={onCreateCaMeeting}
          onUpdate={onUpdateCaMeeting}
        />
      )}
    </div>
  );
}

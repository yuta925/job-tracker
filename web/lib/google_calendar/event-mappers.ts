import type { Seminar } from "@/types/seminar";
import type { CaMeeting } from "@/types/ca_meeting";
import type { ReverseOfferEvent } from "@/types/reverse_offer_event";
import type { Application } from "@/types/application";
import type { GoogleCalendarEventRequest, GoogleCalendarDateTime } from "@/types/google_calendar";

const TIMEZONE = "Asia/Tokyo";

function buildDateTimeWithTime(date: string, time: string): GoogleCalendarDateTime {
  // Supabase TIME カラムは "HH:MM:SS" 形式で返すため、":00" の二重付与を防ぐ
  const normalizedTime = time.length === 5 ? `${time}:00` : time.slice(0, 8);
  return {
    dateTime: `${date}T${normalizedTime}`,
    timeZone: TIMEZONE,
  };
}

function buildAllDayDate(date: string): GoogleCalendarDateTime {
  return { date };
}

function buildStartEnd(
  date: string | null,
  startTime: string | null,
  endTime: string | null
): { start: GoogleCalendarDateTime; end: GoogleCalendarDateTime } {
  if (!date) {
    const today = new Date().toISOString().slice(0, 10);
    return {
      start: buildAllDayDate(today),
      end: buildAllDayDate(today),
    };
  }
  if (startTime && endTime) {
    return {
      start: buildDateTimeWithTime(date, startTime),
      end: buildDateTimeWithTime(date, endTime),
    };
  }
  if (startTime) {
    const [h, m] = startTime.split(":").map(Number);
    const endH = String(Math.min(h + 1, 23)).padStart(2, "0");
    return {
      start: buildDateTimeWithTime(date, startTime),
      end: buildDateTimeWithTime(date, `${endH}:${String(m).padStart(2, "0")}`),
    };
  }
  return {
    start: buildAllDayDate(date),
    end: buildAllDayDate(date),
  };
}

export function seminarToCalendarEvent(seminar: Seminar): GoogleCalendarEventRequest {
  const { start, end } = buildStartEnd(seminar.event_date, seminar.start_time, seminar.end_time);
  const lines: string[] = [];
  if (seminar.url) lines.push(`URL: ${seminar.url}`);
  if (seminar.memo) lines.push(seminar.memo);

  return {
    summary: seminar.title,
    description: lines.join("\n"),
    start,
    end,
    ...(seminar.url
      ? { source: { title: seminar.title, url: seminar.url } }
      : {}),
  };
}

export function caMeetingToCalendarEvent(meeting: CaMeeting): GoogleCalendarEventRequest {
  const { start, end } = buildStartEnd(meeting.meeting_date, meeting.start_time, meeting.end_time);
  const agencyPart = meeting.agency_name ? `（${meeting.agency_name}）` : "";
  const lines: string[] = [];
  if (meeting.memo) lines.push(meeting.memo);
  if (meeting.next_action) lines.push(`次アクション: ${meeting.next_action}`);

  return {
    summary: `${meeting.advisor_name}${agencyPart} CA面談`,
    description: lines.join("\n"),
    start,
    end,
  };
}

export function reverseOfferEventToCalendarEvent(event: ReverseOfferEvent): GoogleCalendarEventRequest {
  const { start, end } = buildStartEnd(event.event_date, event.start_time, event.end_time);
  const lines: string[] = [];
  if (event.contact_name) lines.push(`担当: ${event.contact_name}`);
  if (event.memo) lines.push(event.memo);
  if (event.next_action) lines.push(`次アクション: ${event.next_action}`);

  return {
    summary: `${event.event_name} - ${event.company_name}`,
    description: lines.join("\n"),
    start,
    end,
  };
}

export function applicationToCalendarEvent(application: Application): GoogleCalendarEventRequest {
  if (!application.next_interview_at) {
    throw new Error("面接日時が設定されていません");
  }

  const startDt = new Date(application.next_interview_at);
  const endDt = new Date(startDt.getTime() + 60 * 60 * 1000);

  const lines: string[] = [];
  if (application.memo) lines.push(application.memo);
  if (application.application_url) lines.push(`応募URL: ${application.application_url}`);

  return {
    summary: `${application.company_name} 面接`,
    description: lines.join("\n"),
    start: { dateTime: startDt.toISOString(), timeZone: TIMEZONE },
    end: { dateTime: endDt.toISOString(), timeZone: TIMEZONE },
  };
}

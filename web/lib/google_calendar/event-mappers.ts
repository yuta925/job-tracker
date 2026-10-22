import type { Application } from "@/types/application";
import type { ScheduleEvent } from "@/types/schedule_event";
import type { GoogleCalendarEventRequest } from "@/types/google_calendar";

const TIMEZONE = "Asia/Tokyo";

export function scheduleEventToCalendarEvent(
  event: ScheduleEvent,
): GoogleCalendarEventRequest {
  if (!event.event_date) throw new Error("日付を設定してください");
  const description = [event.url ? `URL: ${event.url}` : null, event.memo]
    .filter(Boolean)
    .join("\n");
  if (!event.start_time) {
    const end = new Date(`${event.event_date}T00:00:00Z`);
    end.setUTCDate(end.getUTCDate() + 1);
    return {
      summary: event.title,
      description,
      start: { date: event.event_date },
      end: { date: end.toISOString().slice(0, 10) },
    };
  }
  const start = new Date(
    `${event.event_date}T${event.start_time.slice(0, 5)}:00+09:00`,
  );
  const end = event.end_time
    ? new Date(`${event.event_date}T${event.end_time.slice(0, 5)}:00+09:00`)
    : new Date(start.getTime() + 60 * 60 * 1000);
  if (end <= start) throw new Error("終了時刻は開始時刻より後にしてください");
  return {
    summary: event.title,
    description,
    start: { dateTime: start.toISOString(), timeZone: TIMEZONE },
    end: { dateTime: end.toISOString(), timeZone: TIMEZONE },
  };
}

export function applicationToCalendarEvent(
  application: Application,
): GoogleCalendarEventRequest {
  if (!application.next_interview_at)
    throw new Error("面接日時が設定されていません");
  const start = new Date(application.next_interview_at);
  const end = new Date(start.getTime() + 60 * 60 * 1000);
  return {
    summary: `${application.company_name} 面接`,
    description: [
      application.memo,
      application.application_url
        ? `応募URL: ${application.application_url}`
        : null,
    ]
      .filter(Boolean)
      .join("\n"),
    start: { dateTime: start.toISOString(), timeZone: TIMEZONE },
    end: { dateTime: end.toISOString(), timeZone: TIMEZONE },
  };
}

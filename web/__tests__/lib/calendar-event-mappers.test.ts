import { describe, expect, it } from "vitest";
import { scheduleEventToCalendarEvent } from "@/lib/google_calendar/event-mappers";
import type { ScheduleEvent } from "@/types/schedule_event";

const event: ScheduleEvent = {
  id: "e",
  user_id: "u",
  title: "説明会",
  event_date: "2026-10-31",
  start_time: null,
  end_time: null,
  memo: null,
  url: null,
  created_at: "",
  updated_at: "",
};
describe("統合予定のGoogleカレンダー変換", () => {
  it("終日は月末を越えて翌日を終了日にする", () => {
    expect(scheduleEventToCalendarEvent(event)).toMatchObject({
      start: { date: "2026-10-31" },
      end: { date: "2026-11-01" },
    });
  });
  it("終了時刻未指定なら深夜でも1時間後を設定する", () => {
    expect(
      scheduleEventToCalendarEvent({ ...event, start_time: "23:30:00" }),
    ).toMatchObject({
      start: { dateTime: "2026-10-31T14:30:00.000Z" },
      end: { dateTime: "2026-10-31T15:30:00.000Z" },
    });
  });
  it("時刻と日程を検証する", () => {
    expect(() =>
      scheduleEventToCalendarEvent({ ...event, event_date: null }),
    ).toThrow();
    expect(() =>
      scheduleEventToCalendarEvent({
        ...event,
        start_time: "10:00",
        end_time: "09:00",
      }),
    ).toThrow();
  });
});

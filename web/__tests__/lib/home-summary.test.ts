import { describe, expect, it } from "vitest";
import { buildAgenda, buildHomeSummary } from "@/lib/home/summary";
import type { Application } from "@/types/application";
import type { ScheduleEvent } from "@/types/schedule_event";

const app: Application = {
  id: "a",
  user_id: "u",
  company_name: "テスト",
  position_name: null,
  status: "applied",
  next_interview_at: null,
  memo: null,
  application_url: null,
  application_type: "winter_intern",
  screening_labels: null,
  deadline: null,
  industry: null,
  created_at: "",
  updated_at: "",
};
const event: ScheduleEvent = {
  id: "e",
  user_id: "u",
  title: "説明会",
  event_date: "2026-10-15",
  start_time: "09:00:00",
  end_time: null,
  url: null,
  memo: null,
  created_at: "",
  updated_at: "",
};

describe("ホームの集計", () => {
  it("期限超過・今日・7日先を含め、8日先と完了選考を除外する", () => {
    const applications = [
      { ...app, id: "expired", deadline: "2026-10-14" },
      { ...app, id: "today", deadline: "2026-10-15" },
      { ...app, id: "week", deadline: "2026-10-22" },
      { ...app, id: "later", deadline: "2026-10-23" },
      { ...app, id: "offer", deadline: "2026-10-15", status: "offer" as const },
      {
        ...app,
        id: "rejected",
        deadline: "2026-10-15",
        status: "rejected" as const,
      },
    ];
    const result = buildHomeSummary(
      applications,
      [event],
      new Date(2026, 9, 15, 12),
    );
    expect(result.deadlines.map((item) => item.id)).toEqual([
      "expired",
      "today",
      "week",
    ]);
    expect(result.overdueCount).toBe(1);
    expect(result.activeCount).toBe(4);
    expect(result.todayCount).toBe(1);
  });
  it("UTCの日付境界をローカル時刻へ変換し、予定を時刻順に並べる", () => {
    const localInterview = new Date(2026, 9, 15, 0, 30).toISOString();
    const result = buildAgenda(
      [{ ...app, next_interview_at: localInterview }],
      [event],
    );
    expect(result[0]).toMatchObject({
      date: "2026-10-15",
      time: "00:30",
      kind: "interview",
    });
    expect(result[1]).toMatchObject({ time: "09:00", kind: "event" });
  });
  it("日程未定・無効な面接日時・終了した選考の面接を除外する", () => {
    expect(
      buildAgenda(
        [
          { ...app, next_interview_at: "invalid" },
          {
            ...app,
            status: "rejected",
            next_interview_at: new Date().toISOString(),
          },
        ],
        [{ ...event, event_date: null }],
      ),
    ).toEqual([]);
  });
});

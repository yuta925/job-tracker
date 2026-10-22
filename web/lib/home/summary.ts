import type { Application } from "@/types/application";
import type { ScheduleEvent } from "@/types/schedule_event";

export function localDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export interface AgendaItem {
  id: string;
  title: string;
  date: string;
  time: string | null;
  kind: "interview" | "event";
  sourceId: string;
}

export function buildAgenda(
  applications: Application[],
  events: ScheduleEvent[],
): AgendaItem[] {
  const interviews: AgendaItem[] = applications.flatMap((app) => {
    if (
      !app.next_interview_at ||
      app.status === "offer" ||
      app.status === "rejected"
    )
      return [];
    const date = new Date(app.next_interview_at);
    if (!Number.isFinite(date.getTime())) return [];
    return [
      {
        id: `interview-${app.id}`,
        title: `${app.company_name} · 面接`,
        date: localDateKey(date),
        time: date.toLocaleTimeString("ja-JP", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }),
        kind: "interview",
        sourceId: app.id,
      },
    ];
  });
  const scheduled: AgendaItem[] = events.flatMap((event) =>
    event.event_date
      ? [
          {
            id: `event-${event.id}`,
            title: event.title,
            date: event.event_date,
            time: event.start_time?.slice(0, 5) ?? null,
            kind: "event",
            sourceId: event.id,
          },
        ]
      : [],
  );
  return [...interviews, ...scheduled].sort((a, b) =>
    `${a.date}T${a.time ?? "00:00"}`.localeCompare(
      `${b.date}T${b.time ?? "00:00"}`,
    ),
  );
}

export function buildHomeSummary(
  applications: Application[],
  events: ScheduleEvent[],
  now: Date,
) {
  const today = localDateKey(now);
  const end = new Date(now);
  end.setDate(end.getDate() + 7);
  const endKey = localDateKey(end);
  const active = applications.filter(
    (app) => app.status !== "offer" && app.status !== "rejected",
  );
  const deadlines = active
    .filter((app) => app.deadline && app.deadline <= endKey)
    .sort((a, b) => a.deadline!.localeCompare(b.deadline!));
  const agenda = buildAgenda(applications, events).filter(
    (item) => item.date >= today && item.date <= endKey,
  );
  return {
    deadlines,
    agenda,
    overdueCount: deadlines.filter((app) => app.deadline! < today).length,
    activeCount: active.filter((app) => app.status !== "interest").length,
    todayCount: agenda.filter((item) => item.date === today).length,
  };
}

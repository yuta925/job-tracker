export interface ScheduleEvent {
  id: string;
  user_id: string;
  title: string;
  event_date: string | null;
  start_time: string | null;
  end_time: string | null;
  url: string | null;
  memo: string | null;
  created_at: string;
  updated_at: string;
}

export type ScheduleEventInsert = Omit<
  ScheduleEvent,
  "id" | "user_id" | "created_at" | "updated_at"
>;
export type ScheduleEventUpdate = Partial<ScheduleEventInsert>;

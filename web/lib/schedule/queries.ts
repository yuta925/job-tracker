import { createClient } from "@/lib/supabase/client";
import type {
  ScheduleEvent,
  ScheduleEventInsert,
  ScheduleEventUpdate,
} from "@/types/schedule_event";

export async function fetchScheduleEvents(): Promise<ScheduleEvent[]> {
  const { data, error } = await createClient()
    .from("schedule_events")
    .select("*")
    .order("event_date", { ascending: true, nullsFirst: false });
  if (error) throw error;
  return data as ScheduleEvent[];
}

export async function saveScheduleEvent(
  input: ScheduleEventInsert | ScheduleEventUpdate,
  id?: string,
): Promise<ScheduleEvent> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("ログインが必要です");
  const query = id
    ? supabase
        .from("schedule_events")
        .update({ ...input, updated_at: new Date().toISOString() })
        .eq("id", id)
    : supabase.from("schedule_events").insert({ ...input, user_id: user.id });
  const { data, error } = await query.select().single();
  if (error) throw error;
  return data as ScheduleEvent;
}

export async function deleteScheduleEvent(id: string): Promise<void> {
  const { error } = await createClient()
    .from("schedule_events")
    .delete()
    .eq("id", id);
  if (error) throw error;
}

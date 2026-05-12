import { createClient } from "@/lib/supabase/client";
import type { CaMeeting, CaMeetingInsert, CaMeetingUpdate } from "@/types";

export async function fetchCaMeetings(): Promise<CaMeeting[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("ca_meetings")
    .select("*")
    .order("meeting_date", { ascending: false, nullsFirst: true });

  if (error) throw error;
  return data as CaMeeting[];
}

export async function createCaMeeting(
  input: CaMeetingInsert
): Promise<CaMeeting> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("ログインが必要です");

  const { data, error } = await supabase
    .from("ca_meetings")
    .insert({ ...input, user_id: user.id })
    .select()
    .single();

  if (error) throw error;
  return data as CaMeeting;
}

export async function updateCaMeeting(
  id: string,
  input: CaMeetingUpdate
): Promise<CaMeeting> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("ca_meetings")
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as CaMeeting;
}

export async function deleteCaMeeting(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("ca_meetings").delete().eq("id", id);
  if (error) throw error;
}

import { createClient } from "@/lib/supabase/client";
import type { Seminar, SeminarInsert, SeminarUpdate } from "@/types";

export async function fetchSeminars(): Promise<Seminar[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("seminars")
    .select("*")
    .order("event_date", { ascending: true, nullsFirst: false });

  if (error) throw error;
  return data as Seminar[];
}

export async function createSeminar(input: SeminarInsert): Promise<Seminar> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("ログインが必要です");

  const { data, error } = await supabase
    .from("seminars")
    .insert({ ...input, user_id: user.id })
    .select()
    .single();

  if (error) throw error;
  return data as Seminar;
}

export async function updateSeminar(
  id: string,
  input: SeminarUpdate
): Promise<Seminar> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("seminars")
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as Seminar;
}

export async function deleteSeminar(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("seminars").delete().eq("id", id);
  if (error) throw error;
}

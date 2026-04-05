import { createClient } from "@/lib/supabase/client";
import type { ResumeProfile, ResumeProfileUpsert } from "@/types";

export async function fetchResumeProfile(): Promise<ResumeProfile | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("resume_profiles")
    .select("*")
    .maybeSingle();

  if (error) throw error;
  return data as ResumeProfile | null;
}

export async function upsertResumeProfile(
  input: ResumeProfileUpsert
): Promise<ResumeProfile> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("ログインが必要です");

  const { data, error } = await supabase
    .from("resume_profiles")
    .upsert(
      { ...input, user_id: user.id, updated_at: new Date().toISOString() },
      { onConflict: "user_id" }
    )
    .select()
    .single();

  if (error) throw error;
  return data as ResumeProfile;
}

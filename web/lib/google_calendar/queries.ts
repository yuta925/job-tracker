import { createClient } from "@/lib/supabase/server";
import type { GoogleCalendarToken } from "@/types";

export async function fetchGoogleCalendarToken(): Promise<GoogleCalendarToken | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("google_calendar_tokens")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) throw error;
  return data as GoogleCalendarToken | null;
}

export async function upsertGoogleCalendarToken(
  userId: string,
  tokens: { access_token: string; refresh_token: string; expiry_date: number }
): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("google_calendar_tokens").upsert(
    {
      user_id: userId,
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expiry_date: tokens.expiry_date,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );
  if (error) throw error;
}

export async function updateAccessToken(
  userId: string,
  access_token: string,
  expiry_date: number
): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("google_calendar_tokens")
    .update({ access_token, expiry_date, updated_at: new Date().toISOString() })
    .eq("user_id", userId);
  if (error) throw error;
}

export async function deleteGoogleCalendarToken(userId: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("google_calendar_tokens")
    .delete()
    .eq("user_id", userId);
  if (error) throw error;
}

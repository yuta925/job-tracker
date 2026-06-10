"use server";

import { createClient } from "@/lib/supabase/server";
import {
  fetchGoogleCalendarToken,
  deleteGoogleCalendarToken,
} from "./queries";
import type { GoogleCalendarConnectionStatus } from "@/types";

export async function fetchGoogleCalendarStatus(): Promise<GoogleCalendarConnectionStatus> {
  const token = await fetchGoogleCalendarToken();
  return { connected: token !== null };
}

export async function disconnectGoogleCalendar(): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("ログインが必要です");

  await deleteGoogleCalendarToken(user.id);
}

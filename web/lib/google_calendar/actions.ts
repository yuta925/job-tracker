"use server";

import { google } from "googleapis";
import { createClient } from "@/lib/supabase/server";
import { fetchGoogleCalendarToken } from "./queries";
import { getAuthenticatedClient } from "./client";
import {
  scheduleEventToCalendarEvent,
  applicationToCalendarEvent,
} from "./event-mappers";
import type {
  AddToCalendarResult,
  GoogleCalendarEventRequest,
} from "@/types/google_calendar";
import type { Application } from "@/types/application";
import type { ScheduleEvent } from "@/types/schedule_event";

async function insertCalendarEvent(
  userId: string,
  request: GoogleCalendarEventRequest,
): Promise<AddToCalendarResult> {
  const token = await fetchGoogleCalendarToken();
  if (!token) return { success: false, error: "google_not_connected" };
  const auth = await getAuthenticatedClient(token, userId);
  const { data } = await google
    .calendar({ version: "v3", auth })
    .events.insert({ calendarId: "primary", requestBody: request });
  if (!data.id || !data.htmlLink)
    return { success: false, error: "予定の登録に失敗しました" };
  return { success: true, eventId: data.id, htmlLink: data.htmlLink };
}

async function addEvent(
  kind: "application" | "schedule",
  id: string,
): Promise<AddToCalendarResult> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "ログインが必要です" };
    const { data, error } = await supabase
      .from(kind === "application" ? "applications" : "schedule_events")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();
    if (error || !data)
      return { success: false, error: "予定が見つかりません" };
    const request =
      kind === "application"
        ? applicationToCalendarEvent(data as Application)
        : scheduleEventToCalendarEvent(data as ScheduleEvent);
    return await insertCalendarEvent(user.id, request);
  } catch {
    return {
      success: false,
      error:
        "カレンダーに登録できませんでした。日程と連携状態を確認してください。",
    };
  }
}

export async function addScheduleEventToCalendar(
  id: string,
): Promise<AddToCalendarResult> {
  return addEvent("schedule", id);
}

export async function addApplicationToCalendar(
  id: string,
): Promise<AddToCalendarResult> {
  return addEvent("application", id);
}

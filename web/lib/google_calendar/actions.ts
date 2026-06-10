"use server";

import { google } from "googleapis";
import { createClient } from "@/lib/supabase/server";
import { fetchGoogleCalendarToken } from "./queries";
import { getAuthenticatedClient } from "./client";
import {
  seminarToCalendarEvent,
  caMeetingToCalendarEvent,
  reverseOfferEventToCalendarEvent,
  applicationToCalendarEvent,
} from "./event-mappers";
import type { AddToCalendarResult } from "@/types";
import type { Seminar } from "@/types/seminar";
import type { CaMeeting } from "@/types/ca_meeting";
import type { ReverseOfferEvent } from "@/types/reverse_offer_event";
import type { Application } from "@/types/application";

async function getAuthContext(): Promise<
  { userId: string } | { error: AddToCalendarResult }
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: { success: false, error: "ログインが必要です" } };
  }
  return { userId: user.id };
}

async function insertCalendarEvent(
  userId: string,
  eventRequest: ReturnType<typeof seminarToCalendarEvent>
): Promise<AddToCalendarResult> {
  const token = await fetchGoogleCalendarToken();
  if (!token) {
    return { success: false, error: "google_not_connected" };
  }

  const auth = await getAuthenticatedClient(token, userId);
  const calendar = google.calendar({ version: "v3", auth });

  const { data } = await calendar.events.insert({
    calendarId: "primary",
    requestBody: eventRequest,
  });

  if (!data.id || !data.htmlLink) {
    return { success: false, error: "イベントの登録に失敗しました" };
  }

  return { success: true, eventId: data.id, htmlLink: data.htmlLink };
}

export async function addSeminarToCalendar(
  seminarId: string
): Promise<AddToCalendarResult> {
  const ctx = await getAuthContext();
  if ("error" in ctx) return ctx.error;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("seminars")
    .select("*")
    .eq("id", seminarId)
    .single();
  if (error || !data) return { success: false, error: "説明会が見つかりません" };

  const eventRequest = seminarToCalendarEvent(data as Seminar);
  return insertCalendarEvent(ctx.userId, eventRequest);
}

export async function addCaMeetingToCalendar(
  meetingId: string
): Promise<AddToCalendarResult> {
  const ctx = await getAuthContext();
  if ("error" in ctx) return ctx.error;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("ca_meetings")
    .select("*")
    .eq("id", meetingId)
    .single();
  if (error || !data) return { success: false, error: "CA面談が見つかりません" };

  const eventRequest = caMeetingToCalendarEvent(data as CaMeeting);
  return insertCalendarEvent(ctx.userId, eventRequest);
}

export async function addReverseOfferEventToCalendar(
  eventId: string
): Promise<AddToCalendarResult> {
  const ctx = await getAuthContext();
  if ("error" in ctx) return ctx.error;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reverse_offer_events")
    .select("*")
    .eq("id", eventId)
    .single();
  if (error || !data) return { success: false, error: "逆求人イベントが見つかりません" };

  const eventRequest = reverseOfferEventToCalendarEvent(data as ReverseOfferEvent);
  return insertCalendarEvent(ctx.userId, eventRequest);
}

export async function addApplicationToCalendar(
  applicationId: string
): Promise<AddToCalendarResult> {
  const ctx = await getAuthContext();
  if ("error" in ctx) return ctx.error;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("applications")
    .select("*")
    .eq("id", applicationId)
    .single();
  if (error || !data) return { success: false, error: "応募企業が見つかりません" };

  const application = data as Application;
  if (!application.next_interview_at) {
    return { success: false, error: "面接日時が設定されていません" };
  }

  const eventRequest = applicationToCalendarEvent(application);
  return insertCalendarEvent(ctx.userId, eventRequest);
}

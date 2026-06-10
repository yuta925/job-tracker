import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getOAuth2Client } from "@/lib/google_calendar/client";
import { upsertGoogleCalendarToken } from "@/lib/google_calendar/queries";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const cookieState = request.cookies.get("google_oauth_state")?.value;

  if (!code || !state || !cookieState || state !== cookieState) {
    return NextResponse.redirect(`${origin}/profile?error=oauth_failed`);
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(`${origin}/login`);
  }

  const oauth2Client = getOAuth2Client();
  const { tokens } = await oauth2Client.getToken(code);

  if (!tokens.refresh_token || !tokens.access_token || !tokens.expiry_date) {
    return NextResponse.redirect(`${origin}/profile?error=no_refresh_token`);
  }

  await upsertGoogleCalendarToken(user.id, {
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
    expiry_date: tokens.expiry_date,
  });

  const response = NextResponse.redirect(`${origin}/profile?connected=true`);
  response.cookies.delete("google_oauth_state");
  return response;
}

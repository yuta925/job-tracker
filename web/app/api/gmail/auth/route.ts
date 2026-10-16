import { randomBytes } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  gmailOAuthClient,
  GMAIL_SCOPE,
  isGmailConfigured,
} from "@/lib/gmail/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(new URL("/login", request.url));
  if (!isGmailConfigured())
    return NextResponse.redirect(
      new URL("/dashboard?gmail=not_configured", request.url),
    );
  const state = randomBytes(32).toString("hex");
  const url = gmailOAuthClient().generateAuthUrl({
    access_type: "offline",
    prompt: "consent select_account",
    scope: [GMAIL_SCOPE],
    state,
  });
  const response = NextResponse.redirect(url);
  response.cookies.set("gmail_oauth_state", `${user.id}:${state}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600,
    path: "/api/gmail",
  });
  return response;
}

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  gmailOAuthClient,
  GMAIL_SCOPE,
  saveGmailToken,
} from "@/lib/gmail/server";

export async function GET(request: NextRequest) {
  const finish = (status: string) => {
    const response = NextResponse.redirect(
      new URL(`/dashboard?gmail=${status}`, request.url),
    );
    response.cookies.set("gmail_oauth_state", "", {
      path: "/api/gmail",
      maxAge: 0,
    });
    return response;
  };
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(new URL("/login", request.url));
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  if (
    !state ||
    request.cookies.get("gmail_oauth_state")?.value !== `${user.id}:${state}`
  )
    return finish("oauth_failed");
  if (request.nextUrl.searchParams.has("error")) return finish("cancelled");
  if (!code) return finish("oauth_failed");
  try {
    const { tokens } = await gmailOAuthClient().getToken(code);
    if (
      !tokens.refresh_token ||
      !tokens.scope?.split(" ").includes(GMAIL_SCOPE)
    )
      return finish("oauth_failed");
    await saveGmailToken(user.id, tokens.refresh_token);
    return finish("connected");
  } catch {
    return finish("oauth_failed");
  }
}

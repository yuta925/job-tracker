import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const finish = (path: string) => {
    const response = NextResponse.redirect(new URL(path, request.url));
    response.headers.set("Cache-Control", "private, no-store");
    response.headers.set("Referrer-Policy", "no-referrer");
    return response;
  };
  const failure = () => finish("/forgot-password?error=expired");
  const code = request.nextUrl.searchParams.get("code");
  const tokenHash = request.nextUrl.searchParams.get("token_hash");
  const type = request.nextUrl.searchParams.get("type");
  if (request.nextUrl.searchParams.has("error") || (!code && !tokenHash))
    return failure();
  try {
    const supabase = await createClient();
    if (tokenHash) {
      if (type !== "recovery") return failure();
      const { data, error } = await supabase.auth.verifyOtp({
        token_hash: tokenHash,
        type: "recovery",
      });
      if (error || !data.session) return failure();
    } else if (code) {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      if (error || !data.session) return failure();
    }
    // 遷移先を固定し、外部サイトへの転送やトークンの引き継ぎを防ぐ。
    return finish("/reset-password");
  } catch {
    return failure();
  }
}

"use server";

import { createClient } from "@/lib/supabase/server";
import type { PasswordResetResult } from "@/lib/auth/password-reset";
import { validateSupabaseUrl } from "@/lib/supabase/config";
import { passwordResetErrorMessage } from "@/lib/auth/reset-error";

export async function requestPasswordReset(
  formData: FormData,
): Promise<PasswordResetResult> {
  const value = formData.get("email");
  const email = typeof value === "string" ? value.trim() : "";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return { error: "メールアドレスを正しく入力してください。" };
  const configError = validateSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL);
  if (configError) return { error: configError };
  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
    return {
      error:
        "Supabaseの公開用APIキーが未設定です。接続設定を確認してください。",
    };
  try {
    const siteUrl = new URL(
      process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
    ).origin;
    const supabase = await createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${siteUrl}/auth/recovery`,
    });
    if (error) return { error: passwordResetErrorMessage(error) };
    // アカウントが存在するかどうかは画面に表示しない。
    return { success: true };
  } catch {
    return {
      error:
        "再設定メールを送信できませんでした。時間をおいて再度お試しください。",
    };
  }
}

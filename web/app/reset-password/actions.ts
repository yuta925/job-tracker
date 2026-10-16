"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  validateNewPassword,
  type PasswordResetResult,
} from "@/lib/auth/password-reset";

export async function updatePassword(
  formData: FormData,
): Promise<PasswordResetResult> {
  const password = formData.get("password");
  const confirmation = formData.get("confirmation");
  if (typeof password !== "string" || typeof confirmation !== "string")
    return { error: "新しいパスワードと確認用パスワードを入力してください。" };
  const validation = validateNewPassword(password, confirmation);
  if (validation) return { error: validation };
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user)
      return {
        error:
          "再設定の有効期限が切れています。再設定メールをもう一度リクエストしてください。",
      };
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      if (error.code === "same_password")
        return { error: "現在と異なるパスワードを設定してください。" };
      if (error.code === "weak_password")
        return {
          error: "より長く、推測されにくいパスワードを設定してください。",
        };
      return {
        error:
          "パスワードを更新できませんでした。再設定メールをもう一度リクエストしてください。",
      };
    }
    revalidatePath("/", "layout");
    return { success: true };
  } catch {
    return {
      error:
        "パスワードを更新できませんでした。時間をおいて再度お試しください。",
    };
  }
}

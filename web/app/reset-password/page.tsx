import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AuthPanel } from "@/components/auth/AuthPanel";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

export const metadata = { title: "新しいパスワード | 就活トラッカー" };

export default async function ResetPasswordPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/forgot-password?error=expired");
  return (
    <AuthPanel
      title="新しいパスワードを設定"
      description="8文字以上の新しいパスワードを入力してください。"
    >
      <ResetPasswordForm />
    </AuthPanel>
  );
}

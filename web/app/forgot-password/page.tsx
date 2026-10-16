import { AuthPanel } from "@/components/auth/AuthPanel";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

export const metadata = { title: "パスワード再設定 | 就活トラッカー" };

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  return (
    <AuthPanel
      title="パスワードを再設定"
      description="登録したメールアドレスに、新しいパスワードを設定するためのリンクを送ります。"
    >
      <ForgotPasswordForm expired={params.error === "expired"} />
    </AuthPanel>
  );
}

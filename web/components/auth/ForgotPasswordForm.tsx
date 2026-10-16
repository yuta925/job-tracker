"use client";

import { useState, useTransition } from "react";
import { requestPasswordReset } from "@/app/forgot-password/actions";
import { recoveryErrorMessage } from "@/lib/auth/recovery-error";

export function ForgotPasswordForm({
  recoveryError,
}: {
  recoveryError?: string;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const linkError = recoveryErrorMessage(recoveryError);
  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setError(null);
    setSent(false);
    startTransition(async () => {
      try {
        const result = await requestPasswordReset(data);
        if (result.error) setError(result.error);
        else setSent(true);
      } catch {
        setError("通信に失敗しました。再度お試しください。");
      }
    });
  }
  return (
    <form onSubmit={submit} className="space-y-5">
      {linkError && !sent && (
        <p role="alert" className="home-error">
          {linkError}
        </p>
      )}
      <div className="md-field">
        <label htmlFor="reset-email" className="md-field-label">
          登録したメールアドレス
        </label>
        <input
          id="reset-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="md-field-input"
          placeholder="you@example.com"
        />
      </div>
      {error && (
        <p role="alert" className="home-error">
          {error}
        </p>
      )}
      {sent && (
        <p role="status" className="home-notice">
          このアドレスが登録されていれば、再設定用のメールが届きます。受信トレイと迷惑メールフォルダを確認してください。
        </p>
      )}
      <button
        className="md-btn md-btn-filled w-full"
        type="submit"
        disabled={pending}
      >
        {pending
          ? "送信中..."
          : sent
            ? "再設定メールを再送する"
            : "再設定メールを送信"}
      </button>
    </form>
  );
}

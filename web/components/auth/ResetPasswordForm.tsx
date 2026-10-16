"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { updatePassword } from "@/app/reset-password/actions";
import {
  RESET_PASSWORD_MIN_LENGTH,
  validateNewPassword,
} from "@/lib/auth/password-reset";

export function ResetPasswordForm() {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const validation = validateNewPassword(
      String(data.get("password") ?? ""),
      String(data.get("confirmation") ?? ""),
    );
    setError(validation);
    if (validation) return;
    startTransition(async () => {
      try {
        const result = await updatePassword(data);
        if (result.error) setError(result.error);
        else setSuccess(true);
      } catch {
        setError("通信に失敗しました。再度お試しください。");
      }
    });
  }
  if (success)
    return (
      <div>
        <p role="status" className="home-notice">
          パスワードを更新しました。次回から新しいパスワードでログインできます。
        </p>
        <Link className="md-btn md-btn-filled w-full mt-4" href="/dashboard">
          ホームへ進む
        </Link>
      </div>
    );
  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="md-field">
        <label htmlFor="new-password" className="md-field-label">
          新しいパスワード
        </label>
        <input
          id="new-password"
          name="password"
          type="password"
          required
          minLength={RESET_PASSWORD_MIN_LENGTH}
          autoComplete="new-password"
          placeholder={`${RESET_PASSWORD_MIN_LENGTH}文字以上`}
          className="md-field-input"
        />
      </div>
      <div className="md-field">
        <label htmlFor="confirm-password" className="md-field-label">
          新しいパスワード（確認）
        </label>
        <input
          id="confirm-password"
          name="confirmation"
          type="password"
          required
          minLength={RESET_PASSWORD_MIN_LENGTH}
          autoComplete="new-password"
          className="md-field-input"
        />
      </div>
      {error && (
        <div role="alert" className="home-error">
          <p>{error}</p>
          <Link className="underline" href="/forgot-password">
            再設定メールをリクエスト
          </Link>
        </div>
      )}
      <button
        className="md-btn md-btn-filled w-full"
        type="submit"
        disabled={pending}
      >
        {pending ? "更新中..." : "パスワードを更新"}
      </button>
    </form>
  );
}

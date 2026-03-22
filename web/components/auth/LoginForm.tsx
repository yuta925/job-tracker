"use client";

import { useTransition, useState } from "react";
import { login, signup } from "@/app/login/actions";

export function LoginForm() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"login" | "signup">("login");

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const action = mode === "login" ? login : signup;
      const result = await action(formData);
      if (result?.error) {
        setError(result.error);
      }
    });
  }

  function switchMode(next: "login" | "signup") {
    setMode(next);
    setError(null);
  }

  return (
    <div className="p-6 sm:p-8">
      {/* Tabs */}
      <div
        className="flex rounded-full p-1 mb-8"
        style={{ background: "var(--md-surface-container)" }}
      >
        {(["login", "signup"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => switchMode(m)}
            className="flex-1 py-2 rounded-full md-label-large transition-all duration-200"
            style={
              mode === m
                ? {
                    background: "var(--md-surface-container-lowest)",
                    color: "var(--md-primary)",
                    boxShadow: "var(--md-elev-1)",
                  }
                : { color: "var(--md-on-surface-variant)", background: "transparent" }
            }
          >
            {m === "login" ? "ログイン" : "新規登録"}
          </button>
        ))}
      </div>

      <form action={handleSubmit} className="space-y-5">
        {/* Email */}
        <div className="md-field">
          <label htmlFor="email" className="md-field-label">
            メールアドレス
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@example.com"
            className="md-field-input"
          />
        </div>

        {/* Password */}
        <div className="md-field">
          <label htmlFor="password" className="md-field-label">
            パスワード
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={6}
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            placeholder="6文字以上"
            className="md-field-input"
          />
        </div>

        {/* Error banner */}
        {error && (
          <div
            className="flex items-start gap-3 p-4 rounded-xl"
            style={{
              background: "var(--md-error-container)",
              color: "var(--md-on-error-container)",
            }}
          >
            <svg className="w-5 h-5 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="md-body-medium">{error}</p>
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={isPending}
          className="md-btn md-btn-filled w-full justify-center"
          style={{ height: "48px", fontSize: "16px" }}
        >
          {isPending
            ? "処理中..."
            : mode === "login"
              ? "ログイン"
              : "アカウントを作成"}
        </button>
      </form>
    </div>
  );
}

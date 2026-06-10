"use client";

import { useState } from "react";
import type { AddToCalendarResult } from "@/types";

type ButtonState = "idle" | "loading" | "success" | "error";

interface AddToCalendarButtonProps {
  onAdd: () => Promise<AddToCalendarResult>;
  disabled?: boolean;
}

export function AddToCalendarButton({ onAdd, disabled }: AddToCalendarButtonProps) {
  const [state, setState] = useState<ButtonState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isNotConnected, setIsNotConnected] = useState(false);

  const handleClick = async () => {
    setState("loading");
    setErrorMessage(null);
    setIsNotConnected(false);

    const result = await onAdd();

    if (result.success) {
      setState("success");
      setTimeout(() => setState("idle"), 2000);
    } else {
      if (result.error === "google_not_connected") {
        setIsNotConnected(true);
      } else {
        setErrorMessage(result.error);
      }
      setState("error");
    }
  };

  return (
    <div className="flex flex-col gap-1">
      <button
        onClick={handleClick}
        disabled={disabled || state === "loading"}
        className="md-btn md-btn-outlined"
        style={{
          color: state === "success" ? "var(--md-primary)" : undefined,
          borderColor: state === "success" ? "var(--md-primary)" : undefined,
        }}
      >
        {state === "loading" && (
          <svg
            className="w-4 h-4 animate-spin"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"
            />
          </svg>
        )}
        {state === "success" && (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        )}
        {(state === "idle" || state === "error") && (
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z" />
          </svg>
        )}
        {state === "loading"
          ? "登録中..."
          : state === "success"
          ? "登録済み"
          : "Googleカレンダーに追加"}
      </button>

      {state === "error" && isNotConnected && (
        <p className="md-body-small" style={{ color: "var(--md-error)" }}>
          Googleカレンダーと連携していません。
          <a
            href="/profile"
            className="underline ml-1"
            style={{ color: "var(--md-primary)" }}
          >
            プロフィールページ
          </a>
          から連携してください。
        </p>
      )}

      {state === "error" && errorMessage && (
        <p className="md-body-small" style={{ color: "var(--md-error)" }}>
          {errorMessage}
        </p>
      )}
    </div>
  );
}

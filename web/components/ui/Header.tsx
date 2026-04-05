"use client";

import { useTransition, useEffect, useState } from "react";
import Link from "next/link";
import { logout } from "@/app/login/actions";

interface HeaderProps {
  userEmail: string;
}

export function Header({ userEmail }: HeaderProps) {
  const [isPending, startTransition] = useTransition();
  const [elevated, setElevated] = useState(false);

  useEffect(() => {
    const onScroll = () => setElevated(window.scrollY > 0);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function handleLogout() {
    startTransition(async () => {
      await logout();
    });
  }

  return (
    <header
      className={`md-app-bar${elevated ? " elevated" : ""}`}
      style={{ background: "var(--md-surface-container-low)" }}
    >
      {/* Leading icon */}
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
        style={{ color: "var(--md-primary)" }}
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      </div>

      {/* Title */}
      <h1
        className="md-title-large flex-1"
        style={{ color: "var(--md-on-surface)" }}
      >
        就活トラッカー
      </h1>

      {/* Trailing actions */}
      <div className="flex items-center gap-1">
        {/* Profile link */}
        <Link
          href="/profile"
          className="w-10 h-10 rounded-full flex items-center justify-center md-state"
          style={{ color: "var(--md-on-surface-variant)" }}
          aria-label="プロフィール"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </Link>
        {/* User avatar chip */}
        <div
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full"
          style={{
            background: "var(--md-surface-container)",
            color: "var(--md-on-surface-variant)",
          }}
        >
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium"
            style={{ background: "var(--md-primary)", color: "var(--md-on-primary)" }}
          >
            {userEmail.charAt(0).toUpperCase()}
          </div>
          <span className="md-label-medium hidden md:block">{userEmail}</span>
        </div>

        {/* Logout button */}
        <button
          onClick={handleLogout}
          disabled={isPending}
          className="md-btn md-btn-text md-state"
          style={{ color: "var(--md-on-surface-variant)", padding: "8px 12px" }}
          aria-label="ログアウト"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span className="hidden sm:inline md-label-large">
            {isPending ? "..." : "ログアウト"}
          </span>
        </button>
      </div>
    </header>
  );
}

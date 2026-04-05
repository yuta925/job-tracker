"use client";

import Link from "next/link";
import { useResumeProfile } from "@/hooks/useResumeProfile";
import { ResumeProfileForm } from "./ResumeProfileForm";

export function ProfilePageClient() {
  const { profile, isLoading, error, saveProfile } = useResumeProfile();

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      {/* Back link */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1 mb-6 md-label-large md-state rounded-full px-2 py-1"
        style={{ color: "var(--md-on-surface-variant)" }}
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        ダッシュボードに戻る
      </Link>

      {/* Page header */}
      <div className="mb-6">
        <h2
          className="md-headline-medium"
          style={{ color: "var(--md-on-surface)" }}
        >
          プロフィール
        </h2>
        <p
          className="md-body-medium mt-1"
          style={{ color: "var(--md-on-surface-variant)" }}
        >
          自己PRやガクチカなどの定型項目を保存しておくと、応募時に再利用できます。
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div
            className="w-8 h-8 rounded-full border-2 animate-spin"
            style={{
              borderColor: "var(--md-primary)",
              borderTopColor: "transparent",
            }}
          />
        </div>
      ) : error ? (
        <div
          className="flex items-start gap-3 px-4 py-3 rounded-xl"
          style={{
            background: "var(--md-error-container)",
            color: "var(--md-on-error-container)",
          }}
        >
          <p className="md-body-medium">{error.message}</p>
        </div>
      ) : (
        <ResumeProfileForm profile={profile} onSave={saveProfile} />
      )}
    </div>
  );
}

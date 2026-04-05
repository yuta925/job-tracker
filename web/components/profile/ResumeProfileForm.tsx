"use client";

import { useState } from "react";
import type { ResumeProfile, ResumeProfileUpsert } from "@/types";

interface ResumeProfileFormProps {
  profile: ResumeProfile | null;
  onSave: (data: ResumeProfileUpsert) => Promise<void>;
}

const FIELDS: {
  name: keyof ResumeProfileUpsert;
  label: string;
  placeholder: string;
  rows: number;
}[] = [
  {
    name: "self_pr",
    label: "自己PR",
    placeholder: "強みや経験を活かして貢献できることを記述...",
    rows: 5,
  },
  {
    name: "gakuchika",
    label: "学生時代に力を入れたこと（ガクチカ）",
    placeholder: "具体的なエピソードと学びを記述...",
    rows: 5,
  },
  {
    name: "research_summary",
    label: "研究概要",
    placeholder: "研究テーマ、手法、成果を簡潔に...",
    rows: 4,
  },
  {
    name: "intern_experience",
    label: "長期インターン経験",
    placeholder: "会社名、期間、担当業務、成果など...",
    rows: 4,
  },
  {
    name: "hackathon_experience",
    label: "ハッカソン・コンテスト経験",
    placeholder: "大会名、チーム、成果など...",
    rows: 3,
  },
];

export function ResumeProfileForm({ profile, onSave }: ResumeProfileFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<Date | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaveError(null);
    setIsSubmitting(true);

    try {
      const formData = new FormData(e.currentTarget);
      const fields: ResumeProfileUpsert = {
        self_pr: (formData.get("self_pr") as string) || null,
        gakuchika: (formData.get("gakuchika") as string) || null,
        research_summary: (formData.get("research_summary") as string) || null,
        intern_experience: (formData.get("intern_experience") as string) || null,
        hackathon_experience: (formData.get("hackathon_experience") as string) || null,
      };
      await onSave(fields);
      setSavedAt(new Date());
    } catch (err) {
      setSaveError(
        err instanceof Error ? err.message : "保存に失敗しました。再度お試しください。"
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {saveError && (
        <div
          className="flex items-start gap-3 px-4 py-3 rounded-xl"
          style={{
            background: "var(--md-error-container)",
            color: "var(--md-on-error-container)",
          }}
        >
          <svg className="w-5 h-5 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="md-body-medium">{saveError}</p>
        </div>
      )}

      {savedAt && !saveError && (
        <div
          className="flex items-center gap-2 px-4 py-3 rounded-xl"
          style={{
            background: "var(--md-surface-container-high)",
            color: "var(--md-on-surface-variant)",
          }}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <p className="md-body-small">
            {savedAt.toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" })} に保存しました
          </p>
        </div>
      )}

      {FIELDS.map((field) => (
        <div key={field.name} className="md-field">
          <label className="md-field-label">{field.label}</label>
          <textarea
            name={field.name}
            rows={field.rows}
            defaultValue={profile?.[field.name] ?? ""}
            className="md-field-input"
            style={{ resize: "vertical" }}
            placeholder={field.placeholder}
          />
        </div>
      ))}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="md-btn md-btn-filled"
        >
          {isSubmitting ? "保存中..." : "保存する"}
        </button>
      </div>
    </form>
  );
}

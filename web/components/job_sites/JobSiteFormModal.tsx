"use client";

import { useState } from "react";
import type { JobSite, JobSiteInsert, JobSiteUpdate } from "@/types";
import { JOB_SITE_CATEGORIES } from "@/types";

interface JobSiteFormModalProps {
  jobSite: JobSite | null;
  onClose: () => void;
  onCreate: (data: JobSiteInsert) => Promise<void>;
  onUpdate: (id: string, data: JobSiteUpdate) => Promise<void>;
}

export function JobSiteFormModal({
  jobSite,
  onClose,
  onCreate,
  onUpdate,
}: JobSiteFormModalProps) {
  const isEditing = jobSite !== null;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const formData = new FormData(e.currentTarget);
      const fields: JobSiteInsert = {
        name: formData.get("name") as string,
        url: (formData.get("url") as string) || null,
        category: formData.get("category") as JobSiteInsert["category"],
        memo: (formData.get("memo") as string) || null,
      };

      if (isEditing) {
        await onUpdate(jobSite.id, fields);
      } else {
        await onCreate(fields);
      }
      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "保存に失敗しました。再度お試しください。"
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div
      className="md-scrim"
      role="dialog"
      aria-modal="true"
      aria-label={isEditing ? "就活サイトを編集" : "就活サイトを追加"}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="md-dialog">
        {/* Header */}
        <div
          className="flex items-start justify-between px-6 pt-6 pb-4"
          style={{ borderBottom: "1px solid var(--md-outline-variant)" }}
        >
          <div>
            <h2 className="md-headline-small" style={{ color: "var(--md-on-surface)" }}>
              {isEditing ? "就活サイトを編集" : "就活サイトを追加"}
            </h2>
            <p className="md-body-medium mt-1" style={{ color: "var(--md-on-surface-variant)" }}>
              {isEditing ? "内容を変更して更新してください" : "登録している就活サイトを追加します"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-full flex items-center justify-center md-state shrink-0 ml-4"
            style={{ color: "var(--md-on-surface-variant)" }}
            aria-label="閉じる"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="px-6 py-4 space-y-4">
            {error && (
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
                <p className="md-body-medium">{error}</p>
              </div>
            )}

            <div className="md-field">
              <label className="md-field-label">
                サイト名 <span style={{ color: "var(--md-error)" }}>*</span>
              </label>
              <input
                name="name"
                type="text"
                required
                defaultValue={jobSite?.name ?? ""}
                className="md-field-input"
                placeholder="マイナビ2026"
              />
            </div>

            <div className="md-field">
              <label className="md-field-label">
                カテゴリ <span style={{ color: "var(--md-error)" }}>*</span>
              </label>
              <select
                name="category"
                required
                defaultValue={jobSite?.category ?? "ナビサイト"}
                className="md-field-input"
                style={{ cursor: "pointer" }}
              >
                {JOB_SITE_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="md-field">
              <label className="md-field-label">URL</label>
              <input
                name="url"
                type="url"
                defaultValue={jobSite?.url ?? ""}
                className="md-field-input"
                placeholder="https://..."
              />
            </div>

            <div className="md-field">
              <label className="md-field-label">メモ</label>
              <textarea
                name="memo"
                rows={3}
                defaultValue={jobSite?.memo ?? ""}
                className="md-field-input"
                style={{ resize: "vertical" }}
                placeholder="ログイン情報の保管場所、使用状況など..."
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 px-6 pb-6 pt-2">
            <button type="button" onClick={onClose} className="md-btn md-btn-text md-state">
              キャンセル
            </button>
            <button type="submit" disabled={isSubmitting} className="md-btn md-btn-filled">
              {isSubmitting ? "保存中..." : isEditing ? "更新する" : "追加する"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

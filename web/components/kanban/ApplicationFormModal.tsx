"use client";

import { useState } from "react";
import type { Application, ApplicationInsert, ApplicationUpdate } from "@/types";
import { APPLICATION_STATUSES, STATUS_LABELS } from "@/types";
import { toDatetimeLocalValue } from "@/lib/date";

interface ApplicationFormModalProps {
  application: Application | null;
  onClose: () => void;
  onCreate: (data: ApplicationInsert) => Promise<void>;
  onUpdate: (id: string, data: ApplicationUpdate) => Promise<void>;
}

export function ApplicationFormModal({
  application,
  onClose,
  onCreate,
  onUpdate,
}: ApplicationFormModalProps) {
  const isEditing = application !== null;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const data = new FormData(e.currentTarget);
      const fields = {
        company_name: data.get("company_name") as string,
        position_name: (data.get("position_name") as string) || null,
        status: data.get("status") as Application["status"],
        next_interview_at: (() => {
          const raw = data.get("next_interview_at") as string;
          return raw ? new Date(raw).toISOString() : null;
        })(),
        memo: (data.get("memo") as string) || null,
        application_url: (data.get("application_url") as string) || null,
      };

      if (isEditing) {
        await onUpdate(application.id, fields);
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
    /* MD3 Scrim */
    <div
      className="md-scrim"
      role="dialog"
      aria-modal="true"
      aria-label={isEditing ? "企業情報を編集" : "企業を追加"}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* MD3 Dialog */}
      <div className="md-dialog">
        {/* ── Dialog Header ── */}
        <div
          className="flex items-start justify-between px-6 pt-6 pb-4"
          style={{ borderBottom: "1px solid var(--md-outline-variant)" }}
        >
          <div>
            <h2
              className="md-headline-small"
              style={{ color: "var(--md-on-surface)" }}
            >
              {isEditing ? "企業情報を編集" : "企業を追加"}
            </h2>
            <p
              className="md-body-medium mt-1"
              style={{ color: "var(--md-on-surface-variant)" }}
            >
              {isEditing
                ? "内容を変更して更新してください"
                : "選考中・気になっている企業を追加します"}
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* ── Dialog Content ── */}
        <form onSubmit={handleSubmit}>
          <div className="px-6 py-4 space-y-4">
            {/* Error */}
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

            {/* Company name */}
            <div className="md-field">
              <label className="md-field-label">
                企業名 <span style={{ color: "var(--md-error)" }}>*</span>
              </label>
              <input
                name="company_name"
                type="text"
                required
                defaultValue={application?.company_name ?? ""}
                className="md-field-input"
                placeholder="株式会社〇〇"
              />
            </div>

            {/* Position */}
            <div className="md-field">
              <label className="md-field-label">職種・ポジション</label>
              <input
                name="position_name"
                type="text"
                defaultValue={application?.position_name ?? ""}
                className="md-field-input"
                placeholder="ソフトウェアエンジニア"
              />
            </div>

            {/* Status */}
            <div className="md-field">
              <label className="md-field-label">
                ステータス <span style={{ color: "var(--md-error)" }}>*</span>
              </label>
              <select
                name="status"
                required
                defaultValue={application?.status ?? "interest"}
                className="md-field-input"
                style={{ cursor: "pointer" }}
              >
                {APPLICATION_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
            </div>

            {/* Interview date */}
            <div className="md-field">
              <label className="md-field-label">次回面接日時</label>
              <input
                name="next_interview_at"
                type="datetime-local"
                defaultValue={
                  application?.next_interview_at
                    ? toDatetimeLocalValue(application.next_interview_at)
                    : ""
                }
                className="md-field-input"
              />
            </div>

            {/* URL */}
            <div className="md-field">
              <label className="md-field-label">求人 URL</label>
              <input
                name="application_url"
                type="url"
                defaultValue={application?.application_url ?? ""}
                className="md-field-input"
                placeholder="https://..."
              />
            </div>

            {/* Memo */}
            <div className="md-field">
              <label className="md-field-label">メモ</label>
              <textarea
                name="memo"
                rows={3}
                defaultValue={application?.memo ?? ""}
                className="md-field-input"
                style={{ resize: "none" }}
                placeholder="備考、担当者名など..."
              />
            </div>
          </div>

          {/* ── Dialog Actions ── */}
          <div
            className="flex items-center justify-end gap-2 px-6 pb-6 pt-2"
          >
            <button
              type="button"
              onClick={onClose}
              className="md-btn md-btn-text md-state"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="md-btn md-btn-filled"
            >
              {isSubmitting ? "保存中..." : isEditing ? "更新する" : "追加する"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

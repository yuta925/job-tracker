"use client";

import { useState } from "react";
import type { Seminar, SeminarInsert, SeminarUpdate } from "@/types";

interface SeminarFormModalProps {
  seminar: Seminar | null;
  onClose: () => void;
  onCreate: (data: SeminarInsert) => Promise<void>;
  onUpdate: (id: string, data: SeminarUpdate) => Promise<void>;
}

export function SeminarFormModal({
  seminar,
  onClose,
  onCreate,
  onUpdate,
}: SeminarFormModalProps) {
  const isEditing = seminar !== null;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const formData = new FormData(e.currentTarget);
      const fields: SeminarInsert = {
        title: formData.get("title") as string,
        event_date: (formData.get("event_date") as string) || null,
        url: (formData.get("url") as string) || null,
        memo: (formData.get("memo") as string) || null,
      };

      if (isEditing) {
        await onUpdate(seminar.id, fields);
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
      aria-label={isEditing ? "説明会を編集" : "説明会を追加"}
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
              {isEditing ? "説明会を編集" : "説明会を追加"}
            </h2>
            <p className="md-body-medium mt-1" style={{ color: "var(--md-on-surface-variant)" }}>
              {isEditing
                ? "内容を変更して更新してください"
                : "会社説明会・セミナーを登録します"}
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
                タイトル <span style={{ color: "var(--md-error)" }}>*</span>
              </label>
              <input
                name="title"
                type="text"
                required
                defaultValue={seminar?.title ?? ""}
                className="md-field-input"
                placeholder="〇〇会社 会社説明会"
              />
            </div>

            <div className="md-field">
              <label className="md-field-label">開催日</label>
              <input
                name="event_date"
                type="date"
                defaultValue={seminar?.event_date ?? ""}
                className="md-field-input"
              />
            </div>

            <div className="md-field">
              <label className="md-field-label">URL（Zoom など）</label>
              <input
                name="url"
                type="url"
                defaultValue={seminar?.url ?? ""}
                className="md-field-input"
                placeholder="https://..."
              />
            </div>

            <div className="md-field">
              <label className="md-field-label">メモ</label>
              <textarea
                name="memo"
                rows={3}
                defaultValue={seminar?.memo ?? ""}
                className="md-field-input"
                style={{ resize: "vertical" }}
                placeholder="持ち物、確認事項など..."
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

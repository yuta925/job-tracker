"use client";

import { useState } from "react";
import type { CaMeeting, CaMeetingInsert, CaMeetingUpdate } from "@/types";

interface CaMeetingFormModalProps {
  meeting: CaMeeting | null;
  onClose: () => void;
  onCreate: (data: CaMeetingInsert) => Promise<void>;
  onUpdate: (id: string, data: CaMeetingUpdate) => Promise<void>;
}

export function CaMeetingFormModal({
  meeting,
  onClose,
  onCreate,
  onUpdate,
}: CaMeetingFormModalProps) {
  const isEditing = meeting !== null;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const formData = new FormData(e.currentTarget);
      const fields: CaMeetingInsert = {
        advisor_name: formData.get("advisor_name") as string,
        agency_name: (formData.get("agency_name") as string) || null,
        meeting_date: (formData.get("meeting_date") as string) || null,
        memo: (formData.get("memo") as string) || null,
        next_action: (formData.get("next_action") as string) || null,
      };

      if (isEditing) {
        await onUpdate(meeting.id, fields);
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
      aria-label={isEditing ? "面談記録を編集" : "面談記録を追加"}
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
              {isEditing ? "面談記録を編集" : "面談記録を追加"}
            </h2>
            <p className="md-body-medium mt-1" style={{ color: "var(--md-on-surface-variant)" }}>
              {isEditing
                ? "内容を変更して更新してください"
                : "キャリアアドバイザーとの面談を記録します"}
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
                アドバイザー名 <span style={{ color: "var(--md-error)" }}>*</span>
              </label>
              <input
                name="advisor_name"
                type="text"
                required
                defaultValue={meeting?.advisor_name ?? ""}
                className="md-field-input"
                placeholder="山田 太郎"
              />
            </div>

            <div className="md-field">
              <label className="md-field-label">エージェント名</label>
              <input
                name="agency_name"
                type="text"
                defaultValue={meeting?.agency_name ?? ""}
                className="md-field-input"
                placeholder="リクルートエージェント"
              />
            </div>

            <div className="md-field">
              <label className="md-field-label">面談日</label>
              <input
                name="meeting_date"
                type="date"
                defaultValue={meeting?.meeting_date ?? ""}
                className="md-field-input"
              />
            </div>

            <div className="md-field">
              <label className="md-field-label">次アクション</label>
              <input
                name="next_action"
                type="text"
                defaultValue={meeting?.next_action ?? ""}
                className="md-field-input"
                placeholder="志望理由書を送付する、OB訪問を依頼する…"
              />
            </div>

            <div className="md-field">
              <label className="md-field-label">面談メモ</label>
              <textarea
                name="memo"
                rows={4}
                defaultValue={meeting?.memo ?? ""}
                className="md-field-input"
                style={{ resize: "vertical" }}
                placeholder="話した内容、もらったアドバイスなど..."
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

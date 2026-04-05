"use client";

import { useState } from "react";
import type {
  ReverseOfferEvent,
  ReverseOfferEventInsert,
  ReverseOfferEventUpdate,
} from "@/types";

interface ReverseOfferEventFormModalProps {
  event: ReverseOfferEvent | null;
  onClose: () => void;
  onCreate: (data: ReverseOfferEventInsert) => Promise<void>;
  onUpdate: (id: string, data: ReverseOfferEventUpdate) => Promise<void>;
}

export function ReverseOfferEventFormModal({
  event,
  onClose,
  onCreate,
  onUpdate,
}: ReverseOfferEventFormModalProps) {
  const isEditing = event !== null;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const formData = new FormData(e.currentTarget);
      const fields = {
        event_name: formData.get("event_name") as string,
        event_date: (formData.get("event_date") as string) || null,
        company_name: formData.get("company_name") as string,
        contact_name: (formData.get("contact_name") as string) || null,
        memo: (formData.get("memo") as string) || null,
        next_action: (formData.get("next_action") as string) || null,
      };

      if (isEditing) {
        await onUpdate(event.id, fields);
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
      aria-label={isEditing ? "イベントを編集" : "イベントを追加"}
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
            <h2
              className="md-headline-small"
              style={{ color: "var(--md-on-surface)" }}
            >
              {isEditing ? "イベントを編集" : "逆求人イベントを追加"}
            </h2>
            <p
              className="md-body-medium mt-1"
              style={{ color: "var(--md-on-surface-variant)" }}
            >
              {isEditing
                ? "内容を変更して更新してください"
                : "逆求人イベントでの接点情報を記録します"}
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
                イベント名 <span style={{ color: "var(--md-error)" }}>*</span>
              </label>
              <input
                name="event_name"
                type="text"
                required
                defaultValue={event?.event_name ?? ""}
                className="md-field-input"
                placeholder="〇〇就活フェア 2025"
              />
            </div>

            <div className="md-field">
              <label className="md-field-label">開催日</label>
              <input
                name="event_date"
                type="date"
                defaultValue={event?.event_date ?? ""}
                className="md-field-input"
              />
            </div>

            <div className="md-field">
              <label className="md-field-label">
                企業名 <span style={{ color: "var(--md-error)" }}>*</span>
              </label>
              <input
                name="company_name"
                type="text"
                required
                defaultValue={event?.company_name ?? ""}
                className="md-field-input"
                placeholder="株式会社〇〇"
              />
            </div>

            <div className="md-field">
              <label className="md-field-label">担当者名</label>
              <input
                name="contact_name"
                type="text"
                defaultValue={event?.contact_name ?? ""}
                className="md-field-input"
                placeholder="田中 太郎"
              />
            </div>

            <div className="md-field">
              <label className="md-field-label">会話メモ</label>
              <textarea
                name="memo"
                rows={3}
                defaultValue={event?.memo ?? ""}
                className="md-field-input"
                style={{ resize: "vertical" }}
                placeholder="話した内容、印象など..."
              />
            </div>

            <div className="md-field">
              <label className="md-field-label">次アクション</label>
              <input
                name="next_action"
                type="text"
                defaultValue={event?.next_action ?? ""}
                className="md-field-input"
                placeholder="OB訪問を申し込む"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 px-6 pb-6 pt-2">
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

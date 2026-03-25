"use client";

import { useState } from "react";
import type {
  Application,
  ApplicationInsert,
  ApplicationType,
  ApplicationUpdate,
  WebTestStatus,
} from "@/types";
import {
  APPLICATION_STATUSES,
  APPLICATION_TYPES,
  APPLICATION_TYPE_LABELS,
  STATUS_LABELS,
  WEB_TEST_STATUSES,
  WEB_TEST_STATUS_LABELS,
} from "@/types";
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
  const [memo, setMemo] = useState(application?.memo ?? "");

  function parseApplicationType(val: string): ApplicationType | null {
    return APPLICATION_TYPES.includes(val as ApplicationType)
      ? (val as ApplicationType)
      : null;
  }

  function parseWebTestStatus(val: string): WebTestStatus | null {
    return WEB_TEST_STATUSES.includes(val as WebTestStatus)
      ? (val as WebTestStatus)
      : null;
  }

  const MEMO_TEMPLATE =
    "## 感想\n\n## 魅力点\n\n## 懸念点\n\n## 次回聞きたいこと\n";

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
        application_type: parseApplicationType(
          (data.get("application_type") as string) ?? ""
        ),
        web_test_status: parseWebTestStatus(
          (data.get("web_test_status") as string) ?? ""
        ),
        deadline: (data.get("deadline") as string) || null,
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

            {/* Application type */}
            <div className="md-field">
              <label className="md-field-label">応募種別</label>
              <select
                name="application_type"
                aria-label="応募種別"
                defaultValue={application?.application_type ?? ""}
                className="md-field-input"
                style={{ cursor: "pointer" }}
              >
                <option value="">未選択</option>
                {APPLICATION_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {APPLICATION_TYPE_LABELS[t]}
                  </option>
                ))}
              </select>
            </div>

            {/* Web test status */}
            <div className="md-field">
              <label className="md-field-label">Webテスト</label>
              <select
                name="web_test_status"
                aria-label="Webテスト"
                defaultValue={application?.web_test_status ?? ""}
                className="md-field-input"
                style={{ cursor: "pointer" }}
              >
                <option value="">未選択</option>
                {WEB_TEST_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {WEB_TEST_STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
            </div>

            {/* Deadline */}
            <div className="md-field">
              <label className="md-field-label">締切日</label>
              <input
                name="deadline"
                type="date"
                aria-label="締切日"
                defaultValue={application?.deadline ?? ""}
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
              <div className="flex items-center justify-between mb-1">
                <label className="md-field-label" style={{ marginBottom: 0 }}>
                  メモ
                </label>
                <button
                  type="button"
                  onClick={() => setMemo(MEMO_TEMPLATE)}
                  className="md-label-small px-2 py-0.5 rounded-full md-state"
                  style={{
                    color: "var(--md-primary)",
                    border: "1px solid var(--md-outline-variant)",
                  }}
                >
                  テンプレを挿入
                </button>
              </div>
              <textarea
                name="memo"
                rows={4}
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                className="md-field-input"
                style={{ resize: "vertical" }}
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

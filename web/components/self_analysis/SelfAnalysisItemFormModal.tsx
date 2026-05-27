"use client";

import { useState } from "react";
import type {
  SelfAnalysisItem,
  SelfAnalysisItemInsert,
  SelfAnalysisItemType,
  SelfAnalysisItemUpdate,
} from "@/types";

const TYPE_LABELS: Record<SelfAnalysisItemType, string> = {
  strength: "強み",
  weakness: "弱み",
  episode: "エピソード",
};

interface SelfAnalysisItemFormModalProps {
  item: SelfAnalysisItem | null;
  defaultType: SelfAnalysisItemType;
  onClose: () => void;
  onCreate: (data: SelfAnalysisItemInsert) => Promise<void>;
  onUpdate: (id: string, data: SelfAnalysisItemUpdate) => Promise<void>;
}

export function SelfAnalysisItemFormModal({
  item,
  defaultType,
  onClose,
  onCreate,
  onUpdate,
}: SelfAnalysisItemFormModalProps) {
  const isEditing = item !== null;
  const itemType = item?.item_type ?? defaultType;

  const [title, setTitle] = useState(item?.title ?? "");
  const [description, setDescription] = useState(item?.description ?? "");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>(item?.tags ?? []);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addTag = (value: string) => {
    const trimmed = value.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags((prev) => [...prev, trimmed]);
    }
    setTagInput("");
  };

  const removeTag = (tag: string) => {
    setTags((prev) => prev.filter((t) => t !== tag));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    setError(null);
    try {
      if (isEditing) {
        await onUpdate(item.id, {
          title: title.trim(),
          description: description.trim() || null,
          tags,
        });
      } else {
        await onCreate({
          item_type: itemType,
          title: title.trim(),
          description: description.trim() || null,
          tags,
        });
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "保存に失敗しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  const descriptionLabel =
    itemType === "episode"
      ? "メモ（STAR形式など自由に記述）"
      : "説明（任意）";

  return (
    <div
      className="md-scrim"
      role="dialog"
      aria-modal="true"
      aria-label={`${TYPE_LABELS[itemType]}を${isEditing ? "編集" : "追加"}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="md-dialog">
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 pt-6 pb-4"
          style={{ borderBottom: "1px solid var(--md-outline-variant)" }}
        >
          <h2
            className="md-headline-small"
            style={{ color: "var(--md-on-surface)" }}
          >
            {TYPE_LABELS[itemType]}を{isEditing ? "編集" : "追加"}
          </h2>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full flex items-center justify-center md-state shrink-0"
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
          <div className="px-6 py-4 space-y-4 overflow-y-auto" style={{ maxHeight: "55vh" }}>
            {/* Title */}
            <div className="flex flex-col gap-1">
              <label
                htmlFor="sa-title"
                className="md-label-medium"
                style={{ color: "var(--md-on-surface-variant)" }}
              >
                タイトル <span style={{ color: "var(--md-error)" }}>*</span>
              </label>
              <input
                id="sa-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="md-input"
                placeholder={
                  itemType === "episode"
                    ? "例: チーム開発でのリーダー経験"
                    : itemType === "strength"
                      ? "例: 課題発見力"
                      : "例: 優柔不断"
                }
              />
            </div>

            {/* Description */}
            <div className="flex flex-col gap-1">
              <label
                htmlFor="sa-description"
                className="md-label-medium"
                style={{ color: "var(--md-on-surface-variant)" }}
              >
                {descriptionLabel}
              </label>
              <textarea
                id="sa-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={itemType === "episode" ? 6 : 3}
                className="md-input resize-none"
                placeholder={
                  itemType === "episode"
                    ? "S: 状況...\nT: 課題...\nA: 行動...\nR: 結果..."
                    : "補足説明を入力..."
                }
              />
            </div>

            {/* Tags (episodes only) */}
            {itemType === "episode" && (
              <div className="flex flex-col gap-1">
                <label
                  className="md-label-medium"
                  style={{ color: "var(--md-on-surface-variant)" }}
                >
                  関連タグ（任意）
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addTag(tagInput);
                      }
                    }}
                    className="md-input flex-1"
                    placeholder="タグを入力して Enter"
                  />
                  <button
                    type="button"
                    onClick={() => addTag(tagInput)}
                    className="md-btn md-btn-outlined"
                    style={{ borderColor: "var(--md-outline)", color: "var(--md-primary)" }}
                  >
                    追加
                  </button>
                </div>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="md-label-small inline-flex items-center gap-1 px-2 py-0.5 rounded-full"
                        style={{
                          background: "var(--md-tertiary-container)",
                          color: "var(--md-on-tertiary-container)",
                        }}
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="w-3.5 h-3.5 rounded-full flex items-center justify-center hover:opacity-70"
                          aria-label={`${tag}を削除`}
                        >
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {error && (
              <p
                className="md-body-small px-3 py-2 rounded-lg"
                style={{
                  background: "var(--md-error-container)",
                  color: "var(--md-on-error-container)",
                }}
              >
                {error}
              </p>
            )}
          </div>

          {/* Footer */}
          <div
            className="flex items-center justify-end gap-2 px-6 py-4"
            style={{ borderTop: "1px solid var(--md-outline-variant)" }}
          >
            <button
              type="button"
              onClick={onClose}
              className="md-btn md-btn-text"
              style={{ color: "var(--md-on-surface-variant)" }}
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !title.trim()}
              className="md-btn md-btn-filled"
            >
              {isSubmitting ? "保存中..." : "保存"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

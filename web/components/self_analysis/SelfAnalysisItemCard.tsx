"use client";

import { useState } from "react";
import type { SelfAnalysisItem } from "@/types";

interface SelfAnalysisItemCardProps {
  item: SelfAnalysisItem;
  onEdit: (item: SelfAnalysisItem) => void;
  onDelete: (id: string) => void;
}

const TYPE_COLORS: Record<
  SelfAnalysisItem["item_type"],
  { bg: string; text: string }
> = {
  strength: {
    bg: "var(--md-primary-container)",
    text: "var(--md-on-primary-container)",
  },
  weakness: {
    bg: "var(--md-secondary-container)",
    text: "var(--md-on-secondary-container)",
  },
  episode: {
    bg: "var(--md-tertiary-container)",
    text: "var(--md-on-tertiary-container)",
  },
};

export function SelfAnalysisItemCard({
  item,
  onEdit,
  onDelete,
}: SelfAnalysisItemCardProps) {
  const [expanded, setExpanded] = useState(false);
  const colors = TYPE_COLORS[item.item_type];
  const hasContent = !!item.description || (item.item_type === "episode" && item.tags.length > 0);

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ border: "1px solid var(--md-outline-variant)" }}
    >
      {/* Header row — クリックで展開 */}
      <button
        onClick={() => hasContent && setExpanded((v) => !v)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors"
        style={{ color: "var(--md-on-surface)", cursor: hasContent ? "pointer" : "default" }}
        onMouseEnter={(e) => {
          if (hasContent) (e.currentTarget as HTMLButtonElement).style.background = "var(--md-surface-container)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = "";
        }}
      >
        {/* Chevron */}
        <span style={{ color: "var(--md-on-surface-variant)" }}>
          {hasContent ? (
            expanded ? (
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            ) : (
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            )
          ) : (
            <span className="w-4 h-4 shrink-0 block" />
          )}
        </span>

        <p className="flex-1 md-title-small truncate">{item.title}</p>

        {/* Actions */}
        <span className="flex shrink-0 gap-0.5" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => onEdit(item)}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
            style={{ color: "var(--md-on-surface-variant)" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "var(--md-surface-container-high)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = ""; }}
            aria-label="編集"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={() => {
              if (confirm(`「${item.title}」を削除しますか？`)) onDelete(item.id);
            }}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
            style={{ color: "var(--md-error)" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "var(--md-surface-container-high)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = ""; }}
            aria-label="削除"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </span>
      </button>

      {/* 展開コンテンツ */}
      {expanded && hasContent && (
        <div
          className="px-4 pb-4"
          style={{ borderTop: "1px solid var(--md-outline-variant)" }}
        >
          {item.description && (
            <p
              className="md-body-small mt-3 leading-relaxed whitespace-pre-wrap"
              style={{ color: "var(--md-on-surface-variant)" }}
            >
              {item.description}
            </p>
          )}
          {item.item_type === "episode" && item.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {item.tags.map((tag) => (
                <span
                  key={tag}
                  className="md-label-small px-2 py-0.5 rounded-full"
                  style={{ background: colors.bg, color: colors.text }}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

"use client";

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
  const colors = TYPE_COLORS[item.item_type];

  return (
    <div className="md-card group" style={{ boxShadow: "var(--md-elev-1)" }}>
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start gap-2">
          <div className="flex-1 min-w-0">
            <p
              className="md-title-small truncate"
              style={{ color: "var(--md-on-surface)" }}
            >
              {item.title}
            </p>
          </div>

          {/* Actions */}
          <div className="flex shrink-0 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onEdit(item)}
              className="w-8 h-8 rounded-full flex items-center justify-center md-state"
              style={{ color: "var(--md-on-surface-variant)" }}
              aria-label="編集"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              onClick={() => {
                if (confirm(`「${item.title}」を削除しますか？`)) {
                  onDelete(item.id);
                }
              }}
              className="w-8 h-8 rounded-full flex items-center justify-center md-state"
              style={{ color: "var(--md-error)" }}
              aria-label="削除"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Description */}
        {item.description && (
          <p
            className="md-body-small mt-2 line-clamp-3 leading-relaxed whitespace-pre-wrap"
            style={{ color: "var(--md-on-surface-variant)" }}
          >
            {item.description}
          </p>
        )}

        {/* Tags (episodes only) */}
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
    </div>
  );
}

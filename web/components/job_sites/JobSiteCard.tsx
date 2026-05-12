"use client";

import type { JobSite } from "@/types";

const CATEGORY_COLORS: Record<string, { bg: string; color: string }> = {
  ナビサイト: {
    bg: "var(--md-primary-container)",
    color: "var(--md-on-primary-container)",
  },
  スカウト: {
    bg: "var(--md-secondary-container)",
    color: "var(--md-on-secondary-container)",
  },
  エージェント: {
    bg: "var(--md-tertiary-container, var(--md-secondary-container))",
    color: "var(--md-on-tertiary-container, var(--md-on-secondary-container))",
  },
  その他: {
    bg: "var(--md-surface-container-high)",
    color: "var(--md-on-surface-variant)",
  },
};

interface JobSiteCardProps {
  jobSite: JobSite;
  onEdit: (jobSite: JobSite) => void;
  onDelete: (id: string) => void;
}

export function JobSiteCard({ jobSite, onEdit, onDelete }: JobSiteCardProps) {
  const categoryColor =
    CATEGORY_COLORS[jobSite.category] ?? CATEGORY_COLORS["その他"];

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
              {jobSite.name}
            </p>
          </div>

          {/* Actions */}
          <div className="flex shrink-0 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onEdit(jobSite)}
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
                if (confirm(`「${jobSite.name}」を削除しますか？`)) {
                  onDelete(jobSite.id);
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

        {/* Meta */}
        <div className="mt-2 flex flex-wrap gap-2 items-center">
          <span
            className="md-label-small px-2 py-0.5 rounded-full"
            style={{ background: categoryColor.bg, color: categoryColor.color }}
          >
            {jobSite.category}
          </span>

          {jobSite.url && (
            <a
              href={jobSite.url}
              target="_blank"
              rel="noopener noreferrer"
              className="md-label-small inline-flex items-center gap-1 px-2 py-0.5 rounded-full md-state"
              style={{
                background: "var(--md-surface-container-high)",
                color: "var(--md-on-surface-variant)",
              }}
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              サイトを開く
            </a>
          )}
        </div>

        {jobSite.memo && (
          <p
            className="md-body-small mt-2 line-clamp-2 leading-relaxed"
            style={{ color: "var(--md-on-surface-variant)" }}
          >
            {jobSite.memo}
          </p>
        )}
      </div>
    </div>
  );
}

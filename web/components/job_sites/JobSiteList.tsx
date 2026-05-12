"use client";

import { useState } from "react";
import type { JobSite, JobSiteInsert, JobSiteUpdate } from "@/types";
import { JOB_SITE_CATEGORIES } from "@/types";
import { JobSiteCard } from "./JobSiteCard";
import { JobSiteFormModal } from "./JobSiteFormModal";

interface JobSiteListProps {
  jobSites: JobSite[];
  isLoading: boolean;
  error: Error | null;
  onCreate: (data: JobSiteInsert) => Promise<void>;
  onUpdate: (id: string, data: JobSiteUpdate) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function JobSiteList({
  jobSites,
  isLoading,
  error,
  onCreate,
  onUpdate,
  onDelete,
}: JobSiteListProps) {
  const [modalJobSite, setModalJobSite] = useState<
    JobSite | null | undefined
  >(undefined);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div
          className="w-8 h-8 rounded-full border-2 animate-spin"
          style={{
            borderColor: "var(--md-primary)",
            borderTopColor: "transparent",
          }}
        />
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="mx-4 mt-4 flex items-start gap-3 px-4 py-3 rounded-xl"
        style={{
          background: "var(--md-error-container)",
          color: "var(--md-on-error-container)",
        }}
      >
        <p className="md-body-medium">{error.message}</p>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 py-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4">
        <p className="md-body-medium" style={{ color: "var(--md-on-surface-variant)" }}>
          {jobSites.length > 0 ? `${jobSites.length} 件` : ""}
        </p>
        <button onClick={() => setModalJobSite(null)} className="md-btn md-btn-filled">
          <svg className="w-4 h-4 mr-1 -ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          サイトを追加
        </button>
      </div>

      {jobSites.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-16 gap-3"
          style={{ color: "var(--md-on-surface-variant)" }}
        >
          <svg className="w-12 h-12 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
          </svg>
          <p className="md-body-medium">登録している就活サイトがありません</p>
          <button
            onClick={() => setModalJobSite(null)}
            className="md-btn md-btn-outlined md-state"
            style={{ borderColor: "var(--md-outline)", color: "var(--md-primary)" }}
          >
            最初のサイトを追加する
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {JOB_SITE_CATEGORIES.map((category) => {
            const sites = jobSites.filter((s) => s.category === category);
            if (sites.length === 0) return null;
            return (
              <section key={category}>
                <h2
                  className="md-title-small mb-3"
                  style={{ color: "var(--md-on-surface-variant)" }}
                >
                  {category}（{sites.length}件）
                </h2>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {sites.map((site) => (
                    <JobSiteCard
                      key={site.id}
                      jobSite={site}
                      onEdit={(s) => setModalJobSite(s)}
                      onDelete={onDelete}
                    />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}

      {modalJobSite !== undefined && (
        <JobSiteFormModal
          jobSite={modalJobSite}
          onClose={() => setModalJobSite(undefined)}
          onCreate={onCreate}
          onUpdate={onUpdate}
        />
      )}
    </div>
  );
}

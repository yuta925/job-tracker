export const JOB_SITE_CATEGORIES = [
  "ナビサイト",
  "スカウト",
  "エージェント",
  "その他",
] as const;

export type JobSiteCategory = (typeof JOB_SITE_CATEGORIES)[number];

export const JOB_SITE_CATEGORY_LABELS: Record<JobSiteCategory, string> = {
  ナビサイト: "ナビサイト",
  スカウト: "スカウト",
  エージェント: "エージェント",
  その他: "その他",
};

export interface JobSite {
  id: string;
  user_id: string;
  name: string;
  url: string | null;
  category: JobSiteCategory;
  memo: string | null;
  created_at: string;
  updated_at: string;
}

export type JobSiteInsert = Omit<
  JobSite,
  "id" | "user_id" | "created_at" | "updated_at"
>;
export type JobSiteUpdate = Partial<JobSiteInsert>;

export const APPLICATION_STATUSES = [
  "interest",
  "applied",
  "document_passed",
  "interviewing",
  "offer",
  "rejected",
] as const;

export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export const STATUS_LABELS: Record<ApplicationStatus, string> = {
  interest: "興味あり",
  applied: "エントリー済み",
  document_passed: "書類通過",
  interviewing: "面接中",
  offer: "内定",
  rejected: "お見送り",
};

export interface Application {
  id: string;
  user_id: string;
  company_name: string;
  position_name: string | null;
  status: ApplicationStatus;
  next_interview_at: string | null;
  memo: string | null;
  application_url: string | null;
  created_at: string;
  updated_at: string;
}

export type ApplicationInsert = Omit<
  Application,
  "id" | "user_id" | "created_at" | "updated_at"
>;

export type ApplicationUpdate = Partial<ApplicationInsert>;

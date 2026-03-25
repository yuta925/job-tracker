export const APPLICATION_TYPES = [
  "summer_intern",
  "main",
  "fulltime_intern",
] as const;

export type ApplicationType = (typeof APPLICATION_TYPES)[number];

export const APPLICATION_TYPE_LABELS: Record<ApplicationType, string> = {
  summer_intern: "夏インターン",
  main: "本選考",
  fulltime_intern: "内定者インターン",
};

export const WEB_TEST_STATUSES = [
  "not_taken",
  "taken",
  "not_required",
] as const;

export type WebTestStatus = (typeof WEB_TEST_STATUSES)[number];

export const WEB_TEST_STATUS_LABELS: Record<WebTestStatus, string> = {
  not_taken: "未受験",
  taken: "受験済み",
  not_required: "不要",
};

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
  application_type: ApplicationType | null;
  web_test_status: WebTestStatus | null;
  deadline: string | null;
  created_at: string;
  updated_at: string;
}

export type ApplicationInsert = Omit<
  Application,
  "id" | "user_id" | "created_at" | "updated_at"
>;

export type ApplicationUpdate = Partial<ApplicationInsert>;

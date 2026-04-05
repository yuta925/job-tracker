export interface ResumeProfile {
  id: string;
  user_id: string;
  self_pr: string | null;
  gakuchika: string | null;
  research_summary: string | null;
  intern_experience: string | null;
  hackathon_experience: string | null;
  created_at: string;
  updated_at: string;
}

export type ResumeProfileUpsert = Pick<
  ResumeProfile,
  | "self_pr"
  | "gakuchika"
  | "research_summary"
  | "intern_experience"
  | "hackathon_experience"
>;

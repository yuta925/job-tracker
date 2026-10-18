export type SelfAnalysisItemType =
  | "strength"
  | "weakness"
  | "episode"
  | "career_axis"
  | "values"
  | "interests"
  | "skills"
  | "challenges"
  | "roles"
  | "learnings"
  | "setbacks"
  | "future_vision"
  | "external_feedback"
  | "company_criteria";

export interface SelfAnalysisItem {
  id: string;
  user_id: string;
  item_type: SelfAnalysisItemType;
  title: string;
  description: string | null;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export type SelfAnalysisItemInsert = Omit<
  SelfAnalysisItem,
  "id" | "user_id" | "created_at" | "updated_at"
>;

export type SelfAnalysisItemUpdate = Partial<SelfAnalysisItemInsert>;

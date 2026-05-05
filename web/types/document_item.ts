export const DOCUMENT_CATEGORIES = [
  "document",
  "interview_1",
  "interview_2",
  "interview_final",
  "other",
] as const;

export type DocumentCategory = (typeof DOCUMENT_CATEGORIES)[number];

export const DOCUMENT_CATEGORY_LABELS: Record<DocumentCategory, string> = {
  document: "書類選考",
  interview_1: "一次面接",
  interview_2: "二次面接",
  interview_final: "最終面接",
  other: "その他",
};

export interface DocumentItem {
  id: string;
  user_id: string;
  category: DocumentCategory;
  title: string;
  content: string | null;
  feedback: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export type DocumentItemInsert = Omit<
  DocumentItem,
  "id" | "user_id" | "created_at" | "updated_at"
>;
export type DocumentItemUpdate = Partial<DocumentItemInsert>;

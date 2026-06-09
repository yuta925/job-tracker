export interface Seminar {
  id: string;
  user_id: string;
  title: string;
  event_date: string | null; // YYYY-MM-DD
  start_time: string | null; // HH:MM
  end_time: string | null;   // HH:MM
  url: string | null;
  memo: string | null;
  created_at: string;
  updated_at: string;
}

export type SeminarInsert = Omit<Seminar, "id" | "user_id" | "created_at" | "updated_at">;
export type SeminarUpdate = Partial<SeminarInsert>;

export interface CaMeeting {
  id: string;
  user_id: string;
  advisor_name: string;
  agency_name: string | null;
  meeting_date: string | null; // YYYY-MM-DD
  start_time: string | null;   // HH:MM
  end_time: string | null;     // HH:MM
  memo: string | null;
  next_action: string | null;
  created_at: string;
  updated_at: string;
}

export type CaMeetingInsert = Omit<
  CaMeeting,
  "id" | "user_id" | "created_at" | "updated_at"
>;
export type CaMeetingUpdate = Partial<CaMeetingInsert>;

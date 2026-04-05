export interface ReverseOfferEvent {
  id: string;
  user_id: string;
  event_name: string;
  event_date: string | null; // YYYY-MM-DD
  company_name: string;
  contact_name: string | null;
  memo: string | null;
  next_action: string | null;
  created_at: string;
  updated_at: string;
}

export type ReverseOfferEventInsert = Omit<
  ReverseOfferEvent,
  "id" | "user_id" | "created_at" | "updated_at"
>;

export type ReverseOfferEventUpdate = Partial<ReverseOfferEventInsert>;

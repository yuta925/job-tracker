import { createClient } from "@/lib/supabase/client";
import type {
  ReverseOfferEvent,
  ReverseOfferEventInsert,
  ReverseOfferEventUpdate,
} from "@/types";

export async function fetchReverseOfferEvents(): Promise<ReverseOfferEvent[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("reverse_offer_events")
    .select("*")
    .order("event_date", { ascending: false });

  if (error) throw error;
  return data as ReverseOfferEvent[];
}

export async function createReverseOfferEvent(
  input: ReverseOfferEventInsert
): Promise<ReverseOfferEvent> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("ログインが必要です");

  const { data, error } = await supabase
    .from("reverse_offer_events")
    .insert({ ...input, user_id: user.id })
    .select()
    .single();

  if (error) throw error;
  return data as ReverseOfferEvent;
}

export async function updateReverseOfferEvent(
  id: string,
  input: ReverseOfferEventUpdate
): Promise<ReverseOfferEvent> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("reverse_offer_events")
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as ReverseOfferEvent;
}

export async function deleteReverseOfferEvent(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from("reverse_offer_events")
    .delete()
    .eq("id", id);

  if (error) throw error;
}

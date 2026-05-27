import { createClient } from "@/lib/supabase/client";
import type {
  SelfAnalysisItem,
  SelfAnalysisItemInsert,
  SelfAnalysisItemUpdate,
} from "@/types";

export async function fetchSelfAnalysisItems(): Promise<SelfAnalysisItem[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("self_analysis_items")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data as SelfAnalysisItem[];
}

export async function createSelfAnalysisItem(
  input: SelfAnalysisItemInsert
): Promise<SelfAnalysisItem> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("ログインが必要です");

  const { data, error } = await supabase
    .from("self_analysis_items")
    .insert({ ...input, user_id: user.id })
    .select()
    .single();

  if (error) throw error;
  return data as SelfAnalysisItem;
}

export async function updateSelfAnalysisItem(
  id: string,
  input: SelfAnalysisItemUpdate
): Promise<SelfAnalysisItem> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("self_analysis_items")
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as SelfAnalysisItem;
}

export async function deleteSelfAnalysisItem(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from("self_analysis_items")
    .delete()
    .eq("id", id);
  if (error) throw error;
}

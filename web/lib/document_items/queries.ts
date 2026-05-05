import { createClient } from "@/lib/supabase/client";
import type {
  DocumentItem,
  DocumentItemInsert,
  DocumentItemUpdate,
} from "@/types";

export async function fetchDocumentItems(): Promise<DocumentItem[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("document_items")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data as DocumentItem[];
}

export async function createDocumentItem(
  input: DocumentItemInsert
): Promise<DocumentItem> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("ログインが必要です");

  const { data, error } = await supabase
    .from("document_items")
    .insert({ ...input, user_id: user.id })
    .select()
    .single();

  if (error) throw error;
  return data as DocumentItem;
}

export async function updateDocumentItem(
  id: string,
  input: DocumentItemUpdate
): Promise<DocumentItem> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("document_items")
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as DocumentItem;
}

export async function deleteDocumentItem(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("document_items").delete().eq("id", id);
  if (error) throw error;
}

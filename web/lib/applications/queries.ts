import { createClient } from "@/lib/supabase/client";
import type {
  Application,
  ApplicationInsert,
  ApplicationStatus,
  ApplicationUpdate,
} from "@/types";

export async function fetchApplications(): Promise<Application[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("applications")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as Application[];
}

export async function createApplication(
  input: ApplicationInsert
): Promise<Application> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("ログインが必要です");

  const { data, error } = await supabase
    .from("applications")
    .insert({ ...input, user_id: user.id })
    .select()
    .single();

  if (error) throw error;
  return data as Application;
}

export async function updateApplication(
  id: string,
  input: ApplicationUpdate
): Promise<Application> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("applications")
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as Application;
}

export async function updateApplicationStatus(
  id: string,
  status: ApplicationStatus
): Promise<Application> {
  return updateApplication(id, { status });
}

export async function deleteApplication(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from("applications")
    .delete()
    .eq("id", id);

  if (error) throw error;
}

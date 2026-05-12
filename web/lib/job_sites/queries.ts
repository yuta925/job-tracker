import { createClient } from "@/lib/supabase/client";
import type { JobSite, JobSiteInsert, JobSiteUpdate } from "@/types";

export async function fetchJobSites(): Promise<JobSite[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("job_sites")
    .select("*")
    .order("category", { ascending: true })
    .order("name", { ascending: true });

  if (error) throw error;
  return data as JobSite[];
}

export async function createJobSite(input: JobSiteInsert): Promise<JobSite> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("ログインが必要です");

  const { data, error } = await supabase
    .from("job_sites")
    .insert({ ...input, user_id: user.id })
    .select()
    .single();

  if (error) throw error;
  return data as JobSite;
}

export async function updateJobSite(
  id: string,
  input: JobSiteUpdate
): Promise<JobSite> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("job_sites")
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as JobSite;
}

export async function deleteJobSite(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("job_sites").delete().eq("id", id);
  if (error) throw error;
}

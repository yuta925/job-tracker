"use client";

import { useState, useEffect, useCallback } from "react";
import type { JobSite, JobSiteInsert, JobSiteUpdate } from "@/types";
import {
  fetchJobSites,
  createJobSite,
  updateJobSite,
  deleteJobSite,
} from "@/lib/job_sites/queries";

export function useJobSites() {
  const [jobSites, setJobSites] = useState<JobSite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await fetchJobSites();
      setJobSites(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("不明なエラー"));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const createItem = useCallback(async (data: JobSiteInsert) => {
    const newSite = await createJobSite(data);
    setJobSites((prev) =>
      [...prev, newSite].sort((a, b) =>
        a.category !== b.category
          ? a.category.localeCompare(b.category)
          : a.name.localeCompare(b.name)
      )
    );
  }, []);

  const updateItem = useCallback(async (id: string, data: JobSiteUpdate) => {
    const updated = await updateJobSite(id, data);
    setJobSites((prev) =>
      prev
        .map((s) => (s.id === id ? updated : s))
        .sort((a, b) =>
          a.category !== b.category
            ? a.category.localeCompare(b.category)
            : a.name.localeCompare(b.name)
        )
    );
  }, []);

  const deleteItem = useCallback(
    async (id: string) => {
      setJobSites((prev) => prev.filter((s) => s.id !== id));
      try {
        await deleteJobSite(id);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("削除に失敗しました"));
        await load();
      }
    },
    [load]
  );

  return {
    jobSites,
    isLoading,
    error,
    createItem,
    updateItem,
    deleteItem,
    reload: load,
  };
}

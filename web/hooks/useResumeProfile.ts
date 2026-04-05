"use client";

import { useState, useEffect, useCallback } from "react";
import type { ResumeProfile, ResumeProfileUpsert } from "@/types";
import { fetchResumeProfile, upsertResumeProfile } from "@/lib/resume_profile/queries";

export function useResumeProfile() {
  const [profile, setProfile] = useState<ResumeProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await fetchResumeProfile();
      setProfile(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("不明なエラー"));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const saveProfile = useCallback(async (data: ResumeProfileUpsert) => {
    const updated = await upsertResumeProfile(data);
    setProfile(updated);
  }, []);

  return {
    profile,
    isLoading,
    error,
    saveProfile,
  };
}

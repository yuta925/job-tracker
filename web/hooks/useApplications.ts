"use client";

import { useState, useEffect, useCallback } from "react";
import type { Application, ApplicationInsert, ApplicationStatus, ApplicationUpdate } from "@/types";
import {
  fetchApplications,
  createApplication,
  updateApplication,
  updateApplicationStatus,
  deleteApplication,
} from "@/lib/applications/queries";

export function useApplications() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await fetchApplications();
      setApplications(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("不明なエラー"));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const updateStatus = useCallback(
    async (id: string, status: ApplicationStatus) => {
      setApplications((prev) =>
        prev.map((app) => (app.id === id ? { ...app, status } : app))
      );
      try {
        await updateApplicationStatus(id, status);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("更新に失敗しました"));
        await load();
      }
    },
    [load]
  );

  const createApp = useCallback(async (data: ApplicationInsert) => {
    const newApp = await createApplication(data);
    setApplications((prev) => [newApp, ...prev]);
    // エラーは呼び出し元に伝播させる（モーダル側で表示）
  }, []);

  const updateApp = useCallback(
    async (id: string, data: ApplicationUpdate) => {
      const updated = await updateApplication(id, data);
      setApplications((prev) =>
        prev.map((app) => (app.id === id ? updated : app))
      );
    },
    []
  );

  const deleteApp = useCallback(async (id: string) => {
    setApplications((prev) => prev.filter((app) => app.id !== id));
    try {
      await deleteApplication(id);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("削除に失敗しました"));
      await load();
    }
  }, [load]);

  return {
    applications,
    isLoading,
    error,
    updateStatus,
    createApp,
    updateApp,
    deleteApp,
    reload: load,
  };
}

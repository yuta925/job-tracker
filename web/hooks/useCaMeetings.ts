"use client";

import { useState, useEffect, useCallback } from "react";
import type { CaMeeting, CaMeetingInsert, CaMeetingUpdate } from "@/types";
import {
  fetchCaMeetings,
  createCaMeeting,
  updateCaMeeting,
  deleteCaMeeting,
} from "@/lib/ca_meetings/queries";

export function useCaMeetings() {
  const [meetings, setMeetings] = useState<CaMeeting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await fetchCaMeetings();
      setMeetings(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("不明なエラー"));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const sortDesc = (list: CaMeeting[]) =>
    [...list].sort((a, b) => {
      if (!a.meeting_date) return -1;
      if (!b.meeting_date) return 1;
      return b.meeting_date.localeCompare(a.meeting_date);
    });

  const createItem = useCallback(async (data: CaMeetingInsert) => {
    const newMeeting = await createCaMeeting(data);
    setMeetings((prev) => sortDesc([...prev, newMeeting]));
  }, []);

  const updateItem = useCallback(async (id: string, data: CaMeetingUpdate) => {
    const updated = await updateCaMeeting(id, data);
    setMeetings((prev) =>
      sortDesc(prev.map((m) => (m.id === id ? updated : m)))
    );
  }, []);

  const deleteItem = useCallback(
    async (id: string) => {
      setMeetings((prev) => prev.filter((m) => m.id !== id));
      try {
        await deleteCaMeeting(id);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("削除に失敗しました"));
        await load();
      }
    },
    [load]
  );

  return {
    meetings,
    isLoading,
    error,
    createItem,
    updateItem,
    deleteItem,
    reload: load,
  };
}

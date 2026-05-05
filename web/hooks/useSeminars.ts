"use client";

import { useState, useEffect, useCallback } from "react";
import type { Seminar, SeminarInsert, SeminarUpdate } from "@/types";
import {
  fetchSeminars,
  createSeminar,
  updateSeminar,
  deleteSeminar,
} from "@/lib/seminars/queries";

export function useSeminars() {
  const [seminars, setSeminars] = useState<Seminar[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await fetchSeminars();
      setSeminars(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("不明なエラー"));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const createItem = useCallback(async (data: SeminarInsert) => {
    const newSeminar = await createSeminar(data);
    setSeminars((prev) => {
      const updated = [...prev, newSeminar];
      return updated.sort((a, b) => {
        if (!a.event_date) return 1;
        if (!b.event_date) return -1;
        return a.event_date.localeCompare(b.event_date);
      });
    });
  }, []);

  const updateItem = useCallback(async (id: string, data: SeminarUpdate) => {
    const updated = await updateSeminar(id, data);
    setSeminars((prev) =>
      prev
        .map((s) => (s.id === id ? updated : s))
        .sort((a, b) => {
          if (!a.event_date) return 1;
          if (!b.event_date) return -1;
          return a.event_date.localeCompare(b.event_date);
        })
    );
  }, []);

  const deleteItem = useCallback(
    async (id: string) => {
      setSeminars((prev) => prev.filter((s) => s.id !== id));
      try {
        await deleteSeminar(id);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("削除に失敗しました"));
        await load();
      }
    },
    [load]
  );

  return {
    seminars,
    isLoading,
    error,
    createItem,
    updateItem,
    deleteItem,
    reload: load,
  };
}

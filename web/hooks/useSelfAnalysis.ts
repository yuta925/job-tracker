"use client";

import { useState, useEffect, useCallback } from "react";
import type {
  SelfAnalysisItem,
  SelfAnalysisItemInsert,
  SelfAnalysisItemUpdate,
} from "@/types";
import {
  fetchSelfAnalysisItems,
  createSelfAnalysisItem,
  updateSelfAnalysisItem,
  deleteSelfAnalysisItem,
} from "@/lib/self_analysis/queries";

export function useSelfAnalysis() {
  const [items, setItems] = useState<SelfAnalysisItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await fetchSelfAnalysisItems();
      setItems(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("不明なエラー"));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const createItem = useCallback(async (data: SelfAnalysisItemInsert) => {
    const newItem = await createSelfAnalysisItem(data);
    setItems((prev) => [...prev, newItem]);
  }, []);

  const updateItem = useCallback(
    async (id: string, data: SelfAnalysisItemUpdate) => {
      const updated = await updateSelfAnalysisItem(id, data);
      setItems((prev) => prev.map((item) => (item.id === id ? updated : item)));
    },
    []
  );

  const deleteItem = useCallback(
    async (id: string) => {
      setItems((prev) => prev.filter((item) => item.id !== id));
      try {
        await deleteSelfAnalysisItem(id);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("削除に失敗しました"));
        await load();
      }
    },
    [load]
  );

  return {
    items,
    isLoading,
    error,
    createItem,
    updateItem,
    deleteItem,
    reload: load,
  };
}

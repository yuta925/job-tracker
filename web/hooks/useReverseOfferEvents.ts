"use client";

import { useState, useEffect, useCallback } from "react";
import type {
  ReverseOfferEvent,
  ReverseOfferEventInsert,
  ReverseOfferEventUpdate,
} from "@/types";
import {
  fetchReverseOfferEvents,
  createReverseOfferEvent,
  updateReverseOfferEvent,
  deleteReverseOfferEvent,
} from "@/lib/reverse_offer_events/queries";

export function useReverseOfferEvents() {
  const [events, setEvents] = useState<ReverseOfferEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await fetchReverseOfferEvents();
      setEvents(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("不明なエラー"));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const createEvent = useCallback(async (data: ReverseOfferEventInsert) => {
    const newEvent = await createReverseOfferEvent(data);
    setEvents((prev) => [newEvent, ...prev]);
  }, []);

  const updateEvent = useCallback(
    async (id: string, data: ReverseOfferEventUpdate) => {
      const updated = await updateReverseOfferEvent(id, data);
      setEvents((prev) => prev.map((e) => (e.id === id ? updated : e)));
    },
    []
  );

  const deleteEvent = useCallback(
    async (id: string) => {
      setEvents((prev) => prev.filter((e) => e.id !== id));
      try {
        await deleteReverseOfferEvent(id);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("削除に失敗しました"));
        await load();
      }
    },
    [load]
  );

  return {
    events,
    isLoading,
    error,
    createEvent,
    updateEvent,
    deleteEvent,
    reload: load,
  };
}

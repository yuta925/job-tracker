"use client";

import { useCallback, useEffect, useState } from "react";
import {
  fetchScheduleEvents,
  saveScheduleEvent,
  deleteScheduleEvent,
} from "@/lib/schedule/queries";
import type {
  ScheduleEvent,
  ScheduleEventInsert,
} from "@/types/schedule_event";

export function useScheduleEvents() {
  const [events, setEvents] = useState<ScheduleEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const reload = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      setEvents(await fetchScheduleEvents());
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("予定を取得できませんでした"),
      );
    } finally {
      setIsLoading(false);
    }
  }, []);
  useEffect(() => {
    void reload();
  }, [reload]);

  async function save(input: ScheduleEventInsert, id?: string) {
    const saved = await saveScheduleEvent(input, id);
    setEvents((prev) =>
      id
        ? prev.map((event) => (event.id === id ? saved : event))
        : [...prev, saved],
    );
  }
  async function remove(id: string) {
    await deleteScheduleEvent(id);
    setEvents((prev) => prev.filter((event) => event.id !== id));
  }
  return { events, isLoading, error, reload, save, remove };
}

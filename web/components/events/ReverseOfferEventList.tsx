"use client";

import { useState } from "react";
import type {
  ReverseOfferEvent,
  ReverseOfferEventInsert,
  ReverseOfferEventUpdate,
} from "@/types";
import { ReverseOfferEventCard } from "./ReverseOfferEventCard";
import { ReverseOfferEventFormModal } from "./ReverseOfferEventFormModal";

interface ReverseOfferEventListProps {
  events: ReverseOfferEvent[];
  isLoading: boolean;
  error: Error | null;
  onCreate: (data: ReverseOfferEventInsert) => Promise<void>;
  onUpdate: (id: string, data: ReverseOfferEventUpdate) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function ReverseOfferEventList({
  events,
  isLoading,
  error,
  onCreate,
  onUpdate,
  onDelete,
}: ReverseOfferEventListProps) {
  const [modalEvent, setModalEvent] = useState<ReverseOfferEvent | null | undefined>(
    undefined // undefined = closed, null = new, ReverseOfferEvent = editing
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div
          className="w-8 h-8 rounded-full border-2 animate-spin"
          style={{
            borderColor: "var(--md-primary)",
            borderTopColor: "transparent",
          }}
        />
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="mx-4 mt-4 flex items-start gap-3 px-4 py-3 rounded-xl"
        style={{
          background: "var(--md-error-container)",
          color: "var(--md-on-error-container)",
        }}
      >
        <p className="md-body-medium">{error.message}</p>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 py-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4">
        <p
          className="md-body-medium"
          style={{ color: "var(--md-on-surface-variant)" }}
        >
          {events.length > 0 ? `${events.length} 件` : ""}
        </p>
        <button
          onClick={() => setModalEvent(null)}
          className="md-btn md-btn-filled"
        >
          <svg className="w-4 h-4 mr-1 -ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          イベントを追加
        </button>
      </div>

      {/* List */}
      {events.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-16 gap-3"
          style={{ color: "var(--md-on-surface-variant)" }}
        >
          <svg className="w-12 h-12 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="md-body-medium">逆求人イベントの記録がありません</p>
          <button
            onClick={() => setModalEvent(null)}
            className="md-btn md-btn-outlined md-state"
            style={{ borderColor: "var(--md-outline)", color: "var(--md-primary)" }}
          >
            最初のイベントを追加する
          </button>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <ReverseOfferEventCard
              key={event.id}
              event={event}
              onEdit={(e) => setModalEvent(e)}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      {modalEvent !== undefined && (
        <ReverseOfferEventFormModal
          event={modalEvent}
          onClose={() => setModalEvent(undefined)}
          onCreate={onCreate}
          onUpdate={onUpdate}
        />
      )}
    </div>
  );
}

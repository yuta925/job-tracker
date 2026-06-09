"use client";

import { useState } from "react";
import type { CaMeeting, CaMeetingInsert, CaMeetingUpdate } from "@/types";
import { CaMeetingCard } from "./CaMeetingCard";
import { CaMeetingDetailModal } from "./CaMeetingDetailModal";
import { CaMeetingFormModal } from "./CaMeetingFormModal";

interface CaMeetingListProps {
  meetings: CaMeeting[];
  isLoading: boolean;
  error: Error | null;
  onCreate: (data: CaMeetingInsert) => Promise<void>;
  onUpdate: (id: string, data: CaMeetingUpdate) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function CaMeetingList({
  meetings,
  isLoading,
  error,
  onCreate,
  onUpdate,
  onDelete,
}: CaMeetingListProps) {
  const [selectedMeeting, setSelectedMeeting] = useState<CaMeeting | undefined>(undefined);
  const [modalMeeting, setModalMeeting] = useState<CaMeeting | null | undefined>(undefined);

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
        <p className="md-body-medium" style={{ color: "var(--md-on-surface-variant)" }}>
          {meetings.length > 0 ? `${meetings.length} 件` : ""}
        </p>
        <button onClick={() => setModalMeeting(null)} className="md-btn md-btn-filled">
          <svg className="w-4 h-4 mr-1 -ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          面談を追加
        </button>
      </div>

      {meetings.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-16 gap-3"
          style={{ color: "var(--md-on-surface-variant)" }}
        >
          <svg className="w-12 h-12 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <p className="md-body-medium">CA面談の記録がありません</p>
          <button
            onClick={() => setModalMeeting(null)}
            className="md-btn md-btn-outlined md-state"
            style={{ borderColor: "var(--md-outline)", color: "var(--md-primary)" }}
          >
            最初の面談を追加する
          </button>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {meetings.map((meeting) => (
            <CaMeetingCard
              key={meeting.id}
              meeting={meeting}
              onCardClick={setSelectedMeeting}
              onEdit={(m) => setModalMeeting(m)}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}

      {selectedMeeting !== undefined && (
        <CaMeetingDetailModal
          meeting={selectedMeeting}
          onClose={() => setSelectedMeeting(undefined)}
          onEdit={(m) => {
            setSelectedMeeting(undefined);
            setModalMeeting(m);
          }}
          onDelete={async (id) => {
            await onDelete(id);
            setSelectedMeeting(undefined);
          }}
        />
      )}
      {modalMeeting !== undefined && (
        <CaMeetingFormModal
          meeting={modalMeeting}
          onClose={() => setModalMeeting(undefined)}
          onCreate={onCreate}
          onUpdate={onUpdate}
        />
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import type {
  SelfAnalysisItem,
  SelfAnalysisItemInsert,
  SelfAnalysisItemType,
  SelfAnalysisItemUpdate,
} from "@/types";
import { SelfAnalysisItemCard } from "./SelfAnalysisItemCard";
import { SelfAnalysisItemFormModal } from "./SelfAnalysisItemFormModal";

interface SelfAnalysisTabProps {
  items: SelfAnalysisItem[];
  isLoading: boolean;
  error: Error | null;
  onCreate: (data: SelfAnalysisItemInsert) => Promise<void>;
  onUpdate: (id: string, data: SelfAnalysisItemUpdate) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

type ModalState =
  | { open: false }
  | { open: true; item: SelfAnalysisItem | null; defaultType: SelfAnalysisItemType };

function Section({
  title,
  items,
  onAdd,
  onEdit,
  onDelete,
}: {
  title: string;
  items: SelfAnalysisItem[];
  onAdd: () => void;
  onEdit: (item: SelfAnalysisItem) => void;
  onDelete: (id: string) => Promise<void>;
}) {
  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-3">
        <h2
          className="md-title-medium"
          style={{ color: "var(--md-on-surface)" }}
        >
          {title}
          {items.length > 0 && (
            <span
              className="ml-2 md-label-small px-1.5 py-0.5 rounded-full"
              style={{
                background: "var(--md-surface-container-high)",
                color: "var(--md-on-surface-variant)",
              }}
            >
              {items.length}
            </span>
          )}
        </h2>
        <button
          onClick={onAdd}
          className="md-btn md-btn-outlined md-state"
          style={{ borderColor: "var(--md-outline)", color: "var(--md-primary)" }}
        >
          <svg className="w-4 h-4 mr-1 -ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          追加
        </button>
      </div>

      {items.length === 0 ? (
        <p
          className="md-body-medium py-4 text-center"
          style={{ color: "var(--md-on-surface-variant)" }}
        >
          まだ{title}がありません
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <SelfAnalysisItemCard
              key={item.id}
              item={item}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export function SelfAnalysisTab({
  items,
  isLoading,
  error,
  onCreate,
  onUpdate,
  onDelete,
}: SelfAnalysisTabProps) {
  const [modal, setModal] = useState<ModalState>({ open: false });

  const strengths = items.filter((i) => i.item_type === "strength");
  const weaknesses = items.filter((i) => i.item_type === "weakness");
  const episodes = items.filter((i) => i.item_type === "episode");

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
      <Section
        title="強み"
        items={strengths}
        onAdd={() => setModal({ open: true, item: null, defaultType: "strength" })}
        onEdit={(item) => setModal({ open: true, item, defaultType: "strength" })}
        onDelete={onDelete}
      />
      <Section
        title="弱み"
        items={weaknesses}
        onAdd={() => setModal({ open: true, item: null, defaultType: "weakness" })}
        onEdit={(item) => setModal({ open: true, item, defaultType: "weakness" })}
        onDelete={onDelete}
      />
      <Section
        title="エピソード"
        items={episodes}
        onAdd={() => setModal({ open: true, item: null, defaultType: "episode" })}
        onEdit={(item) => setModal({ open: true, item, defaultType: "episode" })}
        onDelete={onDelete}
      />

      {modal.open && (
        <SelfAnalysisItemFormModal
          item={modal.item}
          defaultType={modal.defaultType}
          onClose={() => setModal({ open: false })}
          onCreate={onCreate}
          onUpdate={onUpdate}
        />
      )}
    </div>
  );
}

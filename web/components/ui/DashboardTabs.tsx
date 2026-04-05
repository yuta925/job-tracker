"use client";

import { useState } from "react";
import { KanbanBoard } from "@/components/kanban/KanbanBoard";
import { ReverseOfferEventList } from "@/components/events/ReverseOfferEventList";
import { useReverseOfferEvents } from "@/hooks/useReverseOfferEvents";

type Tab = "kanban" | "events";

export function DashboardTabs() {
  const [activeTab, setActiveTab] = useState<Tab>("kanban");
  const { events, isLoading, error, createEvent, updateEvent, deleteEvent } =
    useReverseOfferEvents();

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Tab bar */}
      <div
        className="flex gap-1 px-4 sm:px-6 pt-3 pb-0"
        style={{ borderBottom: "1px solid var(--md-outline-variant)" }}
      >
        <button
          onClick={() => setActiveTab("kanban")}
          className="px-4 py-2 md-label-large rounded-t-lg transition-colors"
          style={
            activeTab === "kanban"
              ? {
                  color: "var(--md-primary)",
                  borderBottom: "2px solid var(--md-primary)",
                }
              : {
                  color: "var(--md-on-surface-variant)",
                }
          }
          aria-selected={activeTab === "kanban"}
          role="tab"
        >
          選考管理
        </button>
        <button
          onClick={() => setActiveTab("events")}
          className="px-4 py-2 md-label-large rounded-t-lg transition-colors"
          style={
            activeTab === "events"
              ? {
                  color: "var(--md-primary)",
                  borderBottom: "2px solid var(--md-primary)",
                }
              : {
                  color: "var(--md-on-surface-variant)",
                }
          }
          aria-selected={activeTab === "events"}
          role="tab"
        >
          逆求人イベント
          {events.length > 0 && (
            <span
              className="ml-2 px-1.5 py-0.5 rounded-full md-label-small"
              style={{
                background:
                  activeTab === "events"
                    ? "var(--md-primary)"
                    : "var(--md-surface-container-high)",
                color:
                  activeTab === "events"
                    ? "var(--md-on-primary)"
                    : "var(--md-on-surface-variant)",
              }}
            >
              {events.length}
            </span>
          )}
        </button>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-auto">
        {activeTab === "kanban" ? (
          <KanbanBoard />
        ) : (
          <ReverseOfferEventList
            events={events}
            isLoading={isLoading}
            error={error}
            onCreate={createEvent}
            onUpdate={updateEvent}
            onDelete={deleteEvent}
          />
        )}
      </div>
    </div>
  );
}

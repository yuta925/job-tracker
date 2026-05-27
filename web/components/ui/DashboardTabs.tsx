"use client";

import { useState } from "react";
import { KanbanBoard } from "@/components/kanban/KanbanBoard";
import { ReverseOfferEventList } from "@/components/events/ReverseOfferEventList";
import { SeminarCalendar } from "@/components/seminars/SeminarCalendar";
import { JobSiteList } from "@/components/job_sites/JobSiteList";
import { CaMeetingList } from "@/components/ca_meetings/CaMeetingList";
import { SelfAnalysisTab } from "@/components/self_analysis/SelfAnalysisTab";
import { useReverseOfferEvents } from "@/hooks/useReverseOfferEvents";
import { useSeminars } from "@/hooks/useSeminars";
import { useJobSites } from "@/hooks/useJobSites";
import { useCaMeetings } from "@/hooks/useCaMeetings";
import { useSelfAnalysis } from "@/hooks/useSelfAnalysis";

type Tab = "kanban" | "events" | "seminars" | "job_sites" | "ca_meetings" | "self_analysis";

const TAB_STYLE_ACTIVE = {
  color: "var(--md-primary)",
  borderBottom: "2px solid var(--md-primary)",
};
const TAB_STYLE_INACTIVE = {
  color: "var(--md-on-surface-variant)",
};

interface TabButtonProps {
  label: string;
  badge?: number;
  isActive: boolean;
  onClick: () => void;
}

function TabButton({ label, badge, isActive, onClick }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className="shrink-0 px-4 py-2 md-label-large rounded-t-lg transition-colors"
      style={isActive ? TAB_STYLE_ACTIVE : TAB_STYLE_INACTIVE}
      aria-selected={isActive}
      role="tab"
    >
      {label}
      {badge !== undefined && badge > 0 && (
        <span
          className="ml-2 px-1.5 py-0.5 rounded-full md-label-small"
          style={{
            background: isActive
              ? "var(--md-primary)"
              : "var(--md-surface-container-high)",
            color: isActive
              ? "var(--md-on-primary)"
              : "var(--md-on-surface-variant)",
          }}
        >
          {badge}
        </span>
      )}
    </button>
  );
}

export function DashboardTabs() {
  const [activeTab, setActiveTab] = useState<Tab>("kanban");

  const {
    events,
    isLoading: eventsLoading,
    error: eventsError,
    createEvent,
    updateEvent,
    deleteEvent,
  } = useReverseOfferEvents();

  const {
    seminars,
    isLoading: seminarsLoading,
    error: seminarsError,
    createItem: createSeminar,
    updateItem: updateSeminar,
    deleteItem: deleteSeminar,
  } = useSeminars();

  const {
    jobSites,
    isLoading: jobSitesLoading,
    error: jobSitesError,
    createItem: createJobSite,
    updateItem: updateJobSite,
    deleteItem: deleteJobSite,
  } = useJobSites();

  const {
    meetings,
    isLoading: meetingsLoading,
    error: meetingsError,
    createItem: createMeeting,
    updateItem: updateMeeting,
    deleteItem: deleteMeeting,
  } = useCaMeetings();

  const {
    items: selfAnalysisItems,
    isLoading: selfAnalysisLoading,
    error: selfAnalysisError,
    createItem: createSelfAnalysisItem,
    updateItem: updateSelfAnalysisItem,
    deleteItem: deleteSelfAnalysisItem,
  } = useSelfAnalysis();

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Tab bar — overflow-x-auto for mobile */}
      <div
        className="flex gap-1 px-4 sm:px-6 pt-3 pb-0 overflow-x-auto"
        style={{ borderBottom: "1px solid var(--md-outline-variant)" }}
      >
        <TabButton
          label="選考管理"
          isActive={activeTab === "kanban"}
          onClick={() => setActiveTab("kanban")}
        />
        <TabButton
          label="説明会"
          badge={seminars.length}
          isActive={activeTab === "seminars"}
          onClick={() => setActiveTab("seminars")}
        />
        <TabButton
          label="逆求人イベント"
          badge={events.length}
          isActive={activeTab === "events"}
          onClick={() => setActiveTab("events")}
        />
        <TabButton
          label="就活サイト"
          badge={jobSites.length}
          isActive={activeTab === "job_sites"}
          onClick={() => setActiveTab("job_sites")}
        />
        <TabButton
          label="CA面談"
          badge={meetings.length}
          isActive={activeTab === "ca_meetings"}
          onClick={() => setActiveTab("ca_meetings")}
        />
        <TabButton
          label="自己分析"
          badge={selfAnalysisItems.length}
          isActive={activeTab === "self_analysis"}
          onClick={() => setActiveTab("self_analysis")}
        />
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-auto">
        {activeTab === "kanban" && <KanbanBoard />}
        {activeTab === "seminars" && (
          <SeminarCalendar
            seminars={seminars}
            isLoading={seminarsLoading}
            error={seminarsError}
            onCreate={createSeminar}
            onUpdate={updateSeminar}
            onDelete={deleteSeminar}
          />
        )}
        {activeTab === "events" && (
          <ReverseOfferEventList
            events={events}
            isLoading={eventsLoading}
            error={eventsError}
            onCreate={createEvent}
            onUpdate={updateEvent}
            onDelete={deleteEvent}
          />
        )}
        {activeTab === "job_sites" && (
          <JobSiteList
            jobSites={jobSites}
            isLoading={jobSitesLoading}
            error={jobSitesError}
            onCreate={createJobSite}
            onUpdate={updateJobSite}
            onDelete={deleteJobSite}
          />
        )}
        {activeTab === "ca_meetings" && (
          <CaMeetingList
            meetings={meetings}
            isLoading={meetingsLoading}
            error={meetingsError}
            onCreate={createMeeting}
            onUpdate={updateMeeting}
            onDelete={deleteMeeting}
          />
        )}
        {activeTab === "self_analysis" && (
          <SelfAnalysisTab
            items={selfAnalysisItems}
            isLoading={selfAnalysisLoading}
            error={selfAnalysisError}
            onCreate={createSelfAnalysisItem}
            onUpdate={updateSelfAnalysisItem}
            onDelete={deleteSelfAnalysisItem}
          />
        )}
      </div>
    </div>
  );
}

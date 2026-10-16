"use client";

import { useState } from "react";
import { KanbanBoard } from "@/components/kanban/KanbanBoard";
import { ScheduleCalendar } from "@/components/schedule/ScheduleCalendar";
import { JobSiteList } from "@/components/job_sites/JobSiteList";
import { SelfAnalysisTab } from "@/components/self_analysis/SelfAnalysisTab";
import { ApplicationDetailModal } from "@/components/kanban/ApplicationDetailModal";
import { ApplicationFormModal } from "@/components/kanban/ApplicationFormModal";
import { HomeOverview } from "@/components/home/HomeOverview";
import { useApplications } from "@/hooks/useApplications";
import { useScheduleEvents } from "@/hooks/useScheduleEvents";
import { useJobSites } from "@/hooks/useJobSites";
import { useSelfAnalysis } from "@/hooks/useSelfAnalysis";
import type { Application } from "@/types/application";

type Tab = "home" | "kanban" | "schedule" | "job_sites" | "self_analysis";
const TABS: { id: Tab; label: string; symbol: string }[] = [
  { id: "home", label: "ホーム", symbol: "⌂" },
  { id: "kanban", label: "選考管理", symbol: "▦" },
  { id: "schedule", label: "スケジュール", symbol: "◷" },
  { id: "job_sites", label: "就活サイト", symbol: "↗" },
  { id: "self_analysis", label: "自己分析", symbol: "✎" },
];

// 補助機能は開いたときだけ取得する。
function JobSitesPanel() {
  const state = useJobSites();
  return (
    <JobSiteList
      jobSites={state.jobSites}
      isLoading={state.isLoading}
      error={state.error}
      onCreate={state.createItem}
      onUpdate={state.updateItem}
      onDelete={state.deleteItem}
    />
  );
}
function SelfAnalysisPanel() {
  const state = useSelfAnalysis();
  return (
    <SelfAnalysisTab
      items={state.items}
      isLoading={state.isLoading}
      error={state.error}
      onCreate={state.createItem}
      onUpdate={state.updateItem}
      onDelete={state.deleteItem}
    />
  );
}

export function DashboardTabs() {
  const [activeTab, setActiveTab] = useState<Tab>("home");
  const applicationsState = useApplications();
  const scheduleState = useScheduleEvents();
  const [scheduleDate, setScheduleDate] = useState<string | undefined>();
  const [selected, setSelected] = useState<Application | null>(null);
  const [editing, setEditing] = useState<Application | null | undefined>(
    undefined,
  );

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <nav className="dashboard-nav" aria-label="メインメニュー">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className="dashboard-nav-item"
            aria-current={activeTab === tab.id ? "page" : undefined}
            onClick={() => setActiveTab(tab.id)}
          >
            <span aria-hidden="true">{tab.symbol}</span>
            {tab.label}
          </button>
        ))}
      </nav>
      <div className="flex-1 overflow-auto">
        {activeTab === "home" && (
          <HomeOverview
            applicationsState={applicationsState}
            scheduleState={scheduleState}
            onOpenApplication={setSelected}
            onNavigate={(tab, date) => {
              setScheduleDate(date);
              setActiveTab(tab);
            }}
            onAdd={() => setEditing(null)}
          />
        )}
        {activeTab === "kanban" && <KanbanBoard state={applicationsState} />}
        {activeTab === "schedule" && (
          <ScheduleCalendar
            initialDate={scheduleDate}
            state={scheduleState}
            applications={applicationsState.applications}
            onOpenApplication={setSelected}
          />
        )}
        {activeTab === "job_sites" && <JobSitesPanel />}
        {activeTab === "self_analysis" && <SelfAnalysisPanel />}
      </div>
      {selected && (
        <ApplicationDetailModal
          application={selected}
          onClose={() => setSelected(null)}
          onEdit={(app) => {
            setSelected(null);
            setEditing(app);
          }}
          onDelete={(id) => {
            void applicationsState.deleteApp(id);
            setSelected(null);
          }}
        />
      )}
      {editing !== undefined && (
        <ApplicationFormModal
          application={editing}
          onClose={() => setEditing(undefined)}
          onCreate={applicationsState.createApp}
          onUpdate={applicationsState.updateApp}
        />
      )}
    </div>
  );
}

import { describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { hydrateRoot } from "react-dom/client";
import { HomeOverview } from "@/components/home/HomeOverview";
import type { ScheduleEvent } from "@/types/schedule_event";
import { localDateKey } from "@/lib/home/summary";

vi.mock("@/components/home/ImportantInbox", () => ({
  ImportantInbox: () => <div>重要メール</div>,
}));
const applicationState = {
  applications: [],
  isLoading: false,
  error: null,
  reload: vi.fn(),
  createApp: vi.fn(),
  updateApp: vi.fn(),
  updateStatus: vi.fn(),
  deleteApp: vi.fn(),
};
const scheduleState = {
  events: [],
  isLoading: false,
  error: null,
  reload: vi.fn(),
  save: vi.fn(),
  remove: vi.fn(),
};

describe("ホームの操作", () => {
  it("サーバーとブラウザで日付が違っても初期描画が一致する", async () => {
    const props = {
      applicationsState: applicationState,
      scheduleState,
      onNavigate: vi.fn(),
      onAdd: vi.fn(),
      onOpenApplication: vi.fn(),
    };
    vi.useFakeTimers();
    const container = document.createElement("div");
    document.body.appendChild(container);
    try {
      vi.setSystemTime(new Date(2026, 9, 15, 23, 59));
      container.innerHTML = renderToString(<HomeOverview {...props} />);
      vi.setSystemTime(new Date(2026, 9, 16, 0, 1));
      const recover = vi.fn();
      let root: ReturnType<typeof hydrateRoot> | undefined;
      await act(async () => {
        root = hydrateRoot(container, <HomeOverview {...props} />, {
          onRecoverableError: recover,
        });
      });
      expect(container).toHaveTextContent("10月16日金曜日");
      expect(recover).not.toHaveBeenCalled();
      await act(async () => root?.unmount());
    } finally {
      container.remove();
      vi.useRealTimers();
    }
  });
  it("予定を押すと、その日付のカレンダーへ移動する", () => {
    const date = new Date();
    date.setDate(date.getDate() + 2);
    const event: ScheduleEvent = {
      id: "e",
      user_id: "u",
      title: "次回面談",
      event_date: localDateKey(date),
      start_time: "10:00",
      end_time: null,
      memo: null,
      url: null,
      created_at: "",
      updated_at: "",
    };
    const navigate = vi.fn();
    render(
      <HomeOverview
        applicationsState={applicationState}
        scheduleState={{ ...scheduleState, events: [event] }}
        onNavigate={navigate}
        onAdd={vi.fn()}
        onOpenApplication={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /次回面談/ }));
    expect(navigate).toHaveBeenCalledWith("schedule", event.event_date);
  });
  it("読み込み失敗を空データと区別し、再試行できる", () => {
    const reload = vi.fn();
    render(
      <HomeOverview
        applicationsState={{
          ...applicationState,
          error: new Error("fetch failed"),
          reload,
        }}
        scheduleState={scheduleState}
        onNavigate={vi.fn()}
        onAdd={vi.fn()}
        onOpenApplication={vi.fn()}
      />,
    );
    expect(screen.getByRole("alert")).toHaveTextContent(
      "選考情報を取得できませんでした",
    );
    expect(screen.queryByText(/まずは気になる企業/)).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "再試行" }));
    expect(reload).toHaveBeenCalled();
  });
});

import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ApplicationCard } from "@/components/kanban/ApplicationCard";
import type { Application } from "@/types";

// @hello-pangea/dnd のモック
vi.mock("@hello-pangea/dnd", () => ({
  Draggable: ({
    children,
  }: {
    children: (provided: unknown, snapshot: { isDragging: boolean }) => React.ReactNode;
  }) =>
    children(
      {
        innerRef: vi.fn(),
        draggableProps: {},
        dragHandleProps: {},
      },
      { isDragging: false }
    ),
}));

const mockApplication: Application = {
  id: "test-id-1",
  user_id: "user-1",
  company_name: "株式会社テスト",
  position_name: "エンジニア",
  status: "applied",
  next_interview_at: "2026-03-25T10:00:00Z",
  memo: "テストメモ",
  application_url: "https://example.com",
  application_type: null,
  screening_labels: null,
  deadline: null,
  industry: null,
  created_at: "2026-03-01T00:00:00Z",
  updated_at: "2026-03-01T00:00:00Z",
};

describe("ApplicationCard", () => {
  it("企業名を表示する", () => {
    render(
      <ApplicationCard
        application={mockApplication}
        index={0}
        onCardClick={vi.fn()}
      />
    );
    expect(screen.getByText("株式会社テスト")).toBeInTheDocument();
  });

  it("職種名を表示する", () => {
    render(
      <ApplicationCard
        application={mockApplication}
        index={0}
        onCardClick={vi.fn()}
      />
    );
    expect(screen.getByText("エンジニア")).toBeInTheDocument();
  });

  it("次回面接日を表示する", () => {
    render(
      <ApplicationCard
        application={mockApplication}
        index={0}
        onCardClick={vi.fn()}
      />
    );
    expect(screen.getByText(/3\/25|3月25/)).toBeInTheDocument();
  });

  it("カードクリックで onCardClick が呼ばれる", () => {
    const onCardClick = vi.fn();
    render(
      <ApplicationCard
        application={mockApplication}
        index={0}
        onCardClick={onCardClick}
      />
    );
    // ドラッグ判別のため pointerDown → click の順で発火する
    const card = screen.getByText("株式会社テスト").closest(".md-card") as HTMLElement;
    fireEvent.pointerDown(card, { clientX: 0, clientY: 0 });
    fireEvent.click(card, { clientX: 0, clientY: 0 });
    expect(onCardClick).toHaveBeenCalledWith(mockApplication);
  });

  it("カードに編集・削除ボタンが表示されない", () => {
    render(
      <ApplicationCard
        application={mockApplication}
        index={0}
        onCardClick={vi.fn()}
      />
    );
    expect(screen.queryByLabelText("編集")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("削除")).not.toBeInTheDocument();
  });

  it("application_type が 'main' のとき '本選考' チップを表示する", () => {
    render(
      <ApplicationCard
        application={{ ...mockApplication, application_type: "main" }}
        index={0}
        onCardClick={vi.fn()}
      />
    );
    expect(screen.getByText("本選考")).toBeInTheDocument();
  });

  it("application_type が null のとき種別チップを表示しない", () => {
    render(
      <ApplicationCard
        application={{ ...mockApplication, application_type: null }}
        index={0}
        onCardClick={vi.fn()}
      />
    );
    expect(screen.queryByText("本選考")).not.toBeInTheDocument();
    expect(screen.queryByText("夏インターン")).not.toBeInTheDocument();
  });

  it("screening_labels があるときラベルチップを表示する", () => {
    render(
      <ApplicationCard
        application={{ ...mockApplication, screening_labels: ["コーディングテスト", "GD"] }}
        index={0}
        onCardClick={vi.fn()}
      />
    );
    expect(screen.getByText("コーディングテスト")).toBeInTheDocument();
    expect(screen.getByText("GD")).toBeInTheDocument();
  });

  it("screening_labels が null のときラベルチップを表示しない", () => {
    render(
      <ApplicationCard
        application={{ ...mockApplication, screening_labels: null }}
        index={0}
        onCardClick={vi.fn()}
      />
    );
    expect(screen.queryByText("コーディングテスト")).not.toBeInTheDocument();
  });

  it("deadline が null のとき締切チップを表示しない", () => {
    render(
      <ApplicationCard
        application={{ ...mockApplication, deadline: null }}
        index={0}
        onCardClick={vi.fn()}
      />
    );
    expect(screen.queryByText(/締切/)).not.toBeInTheDocument();
  });

  it("deadline が過去日のとき ⚠ 付き締切チップを表示する", () => {
    render(
      <ApplicationCard
        application={{ ...mockApplication, deadline: "2020-01-01" }}
        index={0}
        onCardClick={vi.fn()}
      />
    );
    expect(screen.getByText(/締切.*⚠/)).toBeInTheDocument();
  });

  it("UTC ISO 文字列の面接日時がローカル時刻で表示される（TZズレ再発防止）", () => {
    const utcDate = new Date("2026-03-26T06:00:00.000Z");
    const localMonth = utcDate.getMonth() + 1;
    const localDay = utcDate.getDate();

    render(
      <ApplicationCard
        application={{ ...mockApplication, next_interview_at: "2026-03-26T06:00:00.000Z" }}
        index={0}
        onCardClick={vi.fn()}
      />
    );

    const pattern = new RegExp(`${localMonth}[/月]${localDay}`);
    expect(screen.getByText(pattern)).toBeInTheDocument();
  });
});

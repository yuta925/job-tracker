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
  created_at: "2026-03-01T00:00:00Z",
  updated_at: "2026-03-01T00:00:00Z",
};

describe("ApplicationCard", () => {
  it("企業名を表示する", () => {
    render(
      <ApplicationCard
        application={mockApplication}
        index={0}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    );
    expect(screen.getByText("株式会社テスト")).toBeInTheDocument();
  });

  it("職種名を表示する", () => {
    render(
      <ApplicationCard
        application={mockApplication}
        index={0}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    );
    expect(screen.getByText("エンジニア")).toBeInTheDocument();
  });

  it("次回面接日を表示する", () => {
    render(
      <ApplicationCard
        application={mockApplication}
        index={0}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    );
    // 日付が表示されることを確認（数字形式: "3/25 ..." など）
    expect(screen.getByText(/3\/25|3月25/)).toBeInTheDocument();
  });

  it("編集ボタンクリックで onEdit が呼ばれる", () => {
    const onEdit = vi.fn();
    render(
      <ApplicationCard
        application={mockApplication}
        index={0}
        onEdit={onEdit}
        onDelete={vi.fn()}
      />
    );
    fireEvent.click(screen.getByLabelText("編集"));
    expect(onEdit).toHaveBeenCalledWith(mockApplication);
  });

  it("削除ボタンクリックで確認後 onDelete が呼ばれる", () => {
    const onDelete = vi.fn();
    vi.spyOn(window, "confirm").mockReturnValue(true);
    render(
      <ApplicationCard
        application={mockApplication}
        index={0}
        onEdit={vi.fn()}
        onDelete={onDelete}
      />
    );
    fireEvent.click(screen.getByLabelText("削除"));
    expect(onDelete).toHaveBeenCalledWith("test-id-1");
  });

  it("削除キャンセル時は onDelete が呼ばれない", () => {
    const onDelete = vi.fn();
    vi.spyOn(window, "confirm").mockReturnValue(false);
    render(
      <ApplicationCard
        application={mockApplication}
        index={0}
        onEdit={vi.fn()}
        onDelete={onDelete}
      />
    );
    fireEvent.click(screen.getByLabelText("削除"));
    expect(onDelete).not.toHaveBeenCalled();
  });
});

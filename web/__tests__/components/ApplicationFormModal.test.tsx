import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ApplicationFormModal } from "@/components/kanban/ApplicationFormModal";
import type { Application } from "@/types";

const mockApplication: Application = {
  id: "test-id-1",
  user_id: "user-1",
  company_name: "株式会社テスト",
  position_name: "エンジニア",
  status: "applied",
  next_interview_at: null,
  memo: "既存メモ",
  application_url: null,
  application_type: "main",
  web_test_status: "not_taken",
  deadline: "2026-05-01",
  created_at: "2026-03-01T00:00:00Z",
  updated_at: "2026-03-01T00:00:00Z",
};

const defaultProps = {
  application: null,
  onClose: vi.fn(),
  onCreate: vi.fn(),
  onUpdate: vi.fn(),
};

describe("ApplicationFormModal", () => {
  it("応募種別セレクトを表示する", () => {
    render(<ApplicationFormModal {...defaultProps} />);
    expect(screen.getByLabelText(/応募種別/)).toBeInTheDocument();
  });

  it("Webテストセレクトを表示する", () => {
    render(<ApplicationFormModal {...defaultProps} />);
    expect(screen.getByLabelText(/Webテスト/)).toBeInTheDocument();
  });

  it("締切日インプットを表示する", () => {
    render(<ApplicationFormModal {...defaultProps} />);
    const input = screen.getByLabelText(/締切日/);
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute("type", "date");
  });

  it("テンプレを挿入ボタンを表示する", () => {
    render(<ApplicationFormModal {...defaultProps} />);
    expect(screen.getByText("テンプレを挿入")).toBeInTheDocument();
  });

  it("テンプレを挿入ボタンクリックでメモにテンプレートが入力される", () => {
    render(<ApplicationFormModal {...defaultProps} />);
    fireEvent.click(screen.getByText("テンプレを挿入"));
    const textarea = screen.getByPlaceholderText(/備考、担当者名など/);
    expect((textarea as HTMLTextAreaElement).value).toContain("## 感想");
    expect((textarea as HTMLTextAreaElement).value).toContain("## 魅力点");
    expect((textarea as HTMLTextAreaElement).value).toContain("## 懸念点");
    expect((textarea as HTMLTextAreaElement).value).toContain("## 次回聞きたいこと");
  });

  it("編集モード時に応募種別の初期値が選択されている", () => {
    render(<ApplicationFormModal {...defaultProps} application={mockApplication} />);
    const select = screen.getByLabelText(/応募種別/) as HTMLSelectElement;
    expect(select.value).toBe("main");
  });

  it("編集モード時にWebテスト初期値が選択されている", () => {
    render(<ApplicationFormModal {...defaultProps} application={mockApplication} />);
    const select = screen.getByLabelText(/Webテスト/) as HTMLSelectElement;
    expect(select.value).toBe("not_taken");
  });

  it("編集モード時に締切日の初期値が設定されている", () => {
    render(<ApplicationFormModal {...defaultProps} application={mockApplication} />);
    const input = screen.getByLabelText(/締切日/) as HTMLInputElement;
    expect(input.value).toBe("2026-05-01");
  });

  it("編集モード時に既存メモが表示される", () => {
    render(<ApplicationFormModal {...defaultProps} application={mockApplication} />);
    const textarea = screen.getByPlaceholderText(/備考、担当者名など/) as HTMLTextAreaElement;
    expect(textarea.value).toBe("既存メモ");
  });
});

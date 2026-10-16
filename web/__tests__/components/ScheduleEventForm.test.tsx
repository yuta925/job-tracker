import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { ScheduleEventForm } from "@/components/schedule/ScheduleEventForm";

describe("統合予定フォーム", () => {
  it("1つのフォームから予定を保存する", async () => {
    const save = vi.fn().mockResolvedValue(undefined);
    const close = vi.fn();
    render(<ScheduleEventForm event={null} onSave={save} onClose={close} />);
    fireEvent.change(screen.getByLabelText("予定名"), {
      target: { value: "会社説明会" },
    });
    fireEvent.change(screen.getByLabelText("日付"), {
      target: { value: "2026-10-16" },
    });
    fireEvent.click(screen.getByText("保存する"));
    await waitFor(() =>
      expect(save).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "会社説明会",
          event_date: "2026-10-16",
        }),
        undefined,
      ),
    );
    expect(close).toHaveBeenCalled();
  });
  it("終了が開始より前なら保存せずエラーを表示する", () => {
    const save = vi.fn();
    render(<ScheduleEventForm event={null} onSave={save} onClose={vi.fn()} />);
    fireEvent.change(screen.getByLabelText("予定名"), {
      target: { value: "面談" },
    });
    fireEvent.change(screen.getByLabelText("開始時刻"), {
      target: { value: "12:00" },
    });
    fireEvent.change(screen.getByLabelText("終了時刻"), {
      target: { value: "11:00" },
    });
    fireEvent.click(screen.getByText("保存する"));
    expect(screen.getByRole("alert")).toHaveTextContent(
      "終了時刻は開始時刻より後",
    );
    expect(save).not.toHaveBeenCalled();
  });
});

import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import { requestPasswordReset } from "@/app/forgot-password/actions";
import { updatePassword } from "@/app/reset-password/actions";

vi.mock("@/app/forgot-password/actions", () => ({
  requestPasswordReset: vi.fn(),
}));
vi.mock("@/app/reset-password/actions", () => ({ updatePassword: vi.fn() }));
beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(requestPasswordReset).mockResolvedValue({ success: true });
  vi.mocked(updatePassword).mockResolvedValue({ success: true });
});

describe("再設定メールの画面", () => {
  it("別ブラウザでの旧リンク検証失敗を、期限切れと区別して案内する", () => {
    render(<ForgotPasswordForm recoveryError="browser_mismatch" />);
    expect(screen.getByRole("alert")).toHaveTextContent("同じブラウザ");
    expect(screen.getByRole("alert")).not.toHaveTextContent("有効期限");
  });
  it("登録の有無を明かさず、送信完了を案内する", async () => {
    render(<ForgotPasswordForm />);
    fireEvent.change(screen.getByLabelText("登録したメールアドレス"), {
      target: { value: "user@example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: "再設定メールを送信" }));
    await waitFor(() =>
      expect(screen.getByRole("status")).toHaveTextContent(
        "このアドレスが登録されていれば",
      ),
    );
    expect(requestPasswordReset).toHaveBeenCalled();
  });
  it("期限切れのリンクから来た場合は再送を案内する", () => {
    render(<ForgotPasswordForm recoveryError="expired" />);
    expect(screen.getByRole("alert")).toHaveTextContent(
      "有効期限が切れています",
    );
  });
  it("送信失敗を表示して再試行できる", async () => {
    vi.mocked(requestPasswordReset).mockResolvedValue({
      error: "送信できませんでした",
    });
    render(<ForgotPasswordForm />);
    fireEvent.change(screen.getByLabelText("登録したメールアドレス"), {
      target: { value: "user@example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: "再設定メールを送信" }));
    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(
        "送信できませんでした",
      ),
    );
    expect(screen.getByRole("button")).toBeEnabled();
  });
});

describe("新しいパスワードの画面", () => {
  it("確認用パスワードが一致しない場合は更新しない", () => {
    render(<ResetPasswordForm />);
    fireEvent.change(screen.getByLabelText("新しいパスワード"), {
      target: { value: "new-password" },
    });
    fireEvent.change(screen.getByLabelText("新しいパスワード（確認）"), {
      target: { value: "different-password" },
    });
    fireEvent.click(screen.getByRole("button", { name: "パスワードを更新" }));
    expect(screen.getByRole("alert")).toHaveTextContent("一致しません");
    expect(updatePassword).not.toHaveBeenCalled();
  });
  it("更新成功後にホームへのリンクを表示する", async () => {
    render(<ResetPasswordForm />);
    fireEvent.change(screen.getByLabelText("新しいパスワード"), {
      target: { value: "new-password" },
    });
    fireEvent.change(screen.getByLabelText("新しいパスワード（確認）"), {
      target: { value: "new-password" },
    });
    fireEvent.click(screen.getByRole("button", { name: "パスワードを更新" }));
    await waitFor(() =>
      expect(screen.getByRole("status")).toHaveTextContent(
        "パスワードを更新しました",
      ),
    );
    expect(screen.getByRole("link", { name: "ホームへ進む" })).toHaveAttribute(
      "href",
      "/dashboard",
    );
    expect(screen.queryByLabelText("新しいパスワード")).not.toBeInTheDocument();
  });
});

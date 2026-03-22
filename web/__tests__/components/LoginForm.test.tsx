import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { LoginForm } from "@/components/auth/LoginForm";

// Server Actions のモック
vi.mock("@/app/login/actions", () => ({
  login: vi.fn().mockResolvedValue(undefined),
  signup: vi.fn().mockResolvedValue(undefined),
}));

describe("LoginForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("メールアドレスとパスワードフィールドを表示する", () => {
    render(<LoginForm />);
    expect(screen.getByLabelText("メールアドレス")).toBeInTheDocument();
    expect(screen.getByLabelText("パスワード")).toBeInTheDocument();
  });

  it("初期状態でサブミットボタンが「ログイン」を表示する", () => {
    render(<LoginForm />);
    const form = document.querySelector("form");
    expect(form).toBeInTheDocument();
    expect(form?.querySelector('button[type="submit"]')?.textContent).toBe("ログイン");
  });

  it("「新規登録」タブをクリックするとサブミットボタンが切り替わる", () => {
    render(<LoginForm />);
    const signupTab = screen.getByRole("button", { name: "新規登録" });
    fireEvent.click(signupTab);
    const form = document.querySelector("form");
    expect(form?.querySelector('button[type="submit"]')?.textContent).toBe(
      "アカウントを作成"
    );
  });

  it("サーバーエラー時にエラーメッセージを表示する", async () => {
    const { login } = await import("@/app/login/actions");
    vi.mocked(login).mockResolvedValue({ error: "認証エラー" });

    render(<LoginForm />);

    const form = document.querySelector("form")!;
    fireEvent.submit(form);

    await vi.waitFor(() => {
      expect(screen.queryByText("認証エラー")).toBeInTheDocument();
    });
  });
});

// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createClient: vi.fn(),
  reset: vi.fn(),
  getUser: vi.fn(),
  update: vi.fn(),
  revalidate: vi.fn(),
}));
vi.mock("@/lib/supabase/server", () => ({ createClient: mocks.createClient }));
vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidate }));
import { requestPasswordReset } from "@/app/forgot-password/actions";
import { updatePassword } from "@/app/reset-password/actions";

function form(values: Record<string, string>) {
  const data = new FormData();
  Object.entries(values).forEach(([key, value]) => data.set(key, value));
  return data;
}
beforeEach(() => {
  vi.resetAllMocks();
  mocks.createClient.mockResolvedValue({
    auth: {
      resetPasswordForEmail: mocks.reset,
      getUser: mocks.getUser,
      updateUser: mocks.update,
    },
  });
  mocks.reset.mockResolvedValue({ error: null });
  mocks.getUser.mockResolvedValue({
    data: { user: { id: "owner" } },
    error: null,
  });
  mocks.update.mockResolvedValue({ error: null });
  vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://job.example.com/");
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://project.supabase.co");
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "test-key");
});
afterEach(() => vi.unstubAllEnvs());

describe("再設定メール", () => {
  it("管理画面URLの誤設定を送信前に検出する", async () => {
    vi.stubEnv(
      "NEXT_PUBLIC_SUPABASE_URL",
      "https://supabase.com/dashboard/project/project",
    );
    const result = await requestPasswordReset(
      form({ email: "user@example.com" }),
    );
    expect(result.error).toContain("管理画面URL");
    expect(mocks.reset).not.toHaveBeenCalled();
  });
  it("公開キーがなければ接続設定を案内する", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "");
    expect(
      (await requestPasswordReset(form({ email: "user@example.com" }))).error,
    ).toContain("APIキーが未設定");
    expect(mocks.reset).not.toHaveBeenCalled();
  });
  it.each([
    ["email_address_not_authorized", 403, "SMTP"],
    ["over_email_send_rate_limit", 429, "回数制限"],
    ["unexpected_failure", 500, "Authログ"],
  ])("%sの原因と対処を表示する", async (code, status, message) => {
    mocks.reset.mockResolvedValue({
      error: { code, status, message: "private details" },
    });
    const result = await requestPasswordReset(
      form({ email: "user@example.com" }),
    );
    expect(result.error).toContain(message);
    expect(result.error).not.toContain("private details");
  });
  it("アドレスを検証してから送信する", async () => {
    expect(await requestPasswordReset(form({ email: "bad" }))).toHaveProperty(
      "error",
    );
    expect(mocks.reset).not.toHaveBeenCalled();
  });
  it("設定済みの戻り先を使い、存在確認用の情報を返さない", async () => {
    expect(
      await requestPasswordReset(
        form({
          email: " user@example.com ",
          redirectTo: "https://evil.example/",
        }),
      ),
    ).toEqual({ success: true });
    expect(mocks.reset).toHaveBeenCalledWith("user@example.com", {
      redirectTo: "https://job.example.com/auth/recovery",
    });
  });
  it("送信制限などの内部エラーをそのまま公開しない", async () => {
    mocks.reset.mockResolvedValue({
      error: { message: "internal-detail", status: 429 },
    });
    const result = await requestPasswordReset(
      form({ email: "user@example.com" }),
    );
    expect(result.error).toContain("時間をおいて");
    expect(result.error).not.toContain("internal-detail");
  });
});

describe("パスワード更新", () => {
  it.each([
    ["short", "short", "8文字以上"],
    ["new-password", "different-password", "一致しません"],
  ])(
    "入力不備ならSupabaseへ更新しない",
    async (password, confirmation, message) => {
      const result = await updatePassword(form({ password, confirmation }));
      expect(result.error).toContain(message);
      expect(mocks.update).not.toHaveBeenCalled();
    },
  );
  it("未認証なら更新しない", async () => {
    mocks.getUser.mockResolvedValue({ data: { user: null }, error: null });
    expect(
      (
        await updatePassword(
          form({ password: "new-password", confirmation: "new-password" }),
        )
      ).error,
    ).toContain("ログイン情報");
    expect(mocks.update).not.toHaveBeenCalled();
  });
  it("検証済みユーザー本人のパスワードだけ更新する", async () => {
    expect(
      await updatePassword(
        form({
          password: "new-password",
          confirmation: "new-password",
          user_id: "someone-else",
        }),
      ),
    ).toEqual({ success: true });
    expect(mocks.update).toHaveBeenCalledWith({ password: "new-password" });
    expect(mocks.revalidate).toHaveBeenCalledWith("/", "layout");
  });
  it.each(["same_password", "weak_password"])(
    "Supabaseの%s拒否を画面に伝える",
    async (code) => {
      mocks.update.mockResolvedValue({ error: { code, message: "internal" } });
      expect(
        await updatePassword(
          form({ password: "new-password", confirmation: "new-password" }),
        ),
      ).toHaveProperty("error");
      expect(mocks.revalidate).not.toHaveBeenCalled();
    },
  );
});

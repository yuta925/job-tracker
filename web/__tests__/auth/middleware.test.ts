// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({ getUser: vi.fn() }));
vi.mock("@supabase/ssr", () => ({
  createServerClient: () => ({ auth: { getUser: mocks.getUser } }),
}));
import { updateSession } from "@/lib/supabase/middleware";
beforeEach(() => {
  mocks.getUser.mockResolvedValue({ data: { user: null } });
});

describe("認証ガード", () => {
  it.each([
    "/forgot-password",
    "/auth/recovery?token_hash=token&type=recovery",
    "/auth/callback?code=code",
  ])("未認証でも認証用のルートを開ける: %s", async (path) => {
    const response = await updateSession(
      new NextRequest(`https://job.example.com${path}`),
    );
    expect(response.headers.get("location")).toBeNull();
  });
  it("再設定画面を直接開いた未認証ユーザーを再送画面へ案内する", async () => {
    const response = await updateSession(
      new NextRequest("https://job.example.com/reset-password"),
    );
    expect(response.headers.get("location")).toBe(
      "https://job.example.com/forgot-password?error=expired",
    );
  });
  it("ホームの認証保護を維持する", async () => {
    expect(
      (
        await updateSession(
          new NextRequest("https://job.example.com/dashboard"),
        )
      ).headers.get("location"),
    ).toBe("https://job.example.com/login");
  });
  it("認証済みならパスワード更新画面を開ける", async () => {
    mocks.getUser.mockResolvedValue({ data: { user: { id: "owner" } } });
    expect(
      (
        await updateSession(
          new NextRequest("https://job.example.com/reset-password"),
        )
      ).headers.get("location"),
    ).toBeNull();
  });
});

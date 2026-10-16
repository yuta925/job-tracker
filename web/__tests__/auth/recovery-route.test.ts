// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({ verify: vi.fn(), exchange: vi.fn() }));
vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({
    auth: { verifyOtp: mocks.verify, exchangeCodeForSession: mocks.exchange },
  }),
}));
import { GET } from "@/app/auth/recovery/route";

beforeEach(() => {
  vi.resetAllMocks();
  mocks.verify.mockResolvedValue({
    data: { session: { user: { id: "owner" } } },
    error: null,
  });
  mocks.exchange.mockResolvedValue({
    data: { session: { user: { id: "owner" } } },
    error: null,
  });
});
const request = (query: string) =>
  new NextRequest(`https://job.example.com/auth/recovery?${query}`);

describe("再設定リンクの検証", () => {
  it("recovery種別のトークンを検証し、固定の再設定画面へ転送する", async () => {
    const response = await GET(
      request("token_hash=secret&type=recovery&next=https://evil.example/"),
    );
    expect(mocks.verify).toHaveBeenCalledWith({
      token_hash: "secret",
      type: "recovery",
    });
    expect(response.headers.get("location")).toBe(
      "https://job.example.com/reset-password",
    );
    expect(response.headers.get("Referrer-Policy")).toBe("no-referrer");
    expect(response.headers.get("Cache-Control")).toContain("no-store");
  });
  it("標準メールのPKCEコードも交換できる", async () => {
    expect((await GET(request("code=code"))).headers.get("location")).toBe(
      "https://job.example.com/reset-password",
    );
    expect(mocks.exchange).toHaveBeenCalledWith("code");
  });
  it.each(["", "token_hash=secret&type=signup", "error=access_denied"])(
    "無効なリンクを拒否する: %s",
    async (query) => {
      expect((await GET(request(query))).headers.get("location")).toBe(
        "https://job.example.com/forgot-password?error=expired",
      );
      expect(mocks.verify).not.toHaveBeenCalled();
      expect(mocks.exchange).not.toHaveBeenCalled();
    },
  );
  it("期限切れ・使用済みトークンでは更新画面を表示しない", async () => {
    mocks.verify.mockResolvedValue({
      data: { session: null },
      error: { message: "expired" },
    });
    expect(
      (await GET(request("token_hash=secret&type=recovery"))).headers.get(
        "location",
      ),
    ).toContain("error=expired");
  });
  it("コード交換に失敗した場合も再送画面へ案内する", async () => {
    mocks.exchange.mockResolvedValue({
      data: { session: null },
      error: { message: "bad code" },
    });
    expect(
      (await GET(request("code=invalid"))).headers.get("location"),
    ).toContain("error=expired");
  });
});

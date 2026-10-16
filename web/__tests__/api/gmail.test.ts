// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({
  getUser: vi.fn(),
  from: vi.fn(),
  getGmailClient: vi.fn(),
  configured: vi.fn(),
  getToken: vi.fn(),
  save: vi.fn(),
  list: vi.fn(),
  get: vi.fn(),
  profile: vi.fn(),
}));
vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({
    auth: { getUser: mocks.getUser },
    from: mocks.from,
  }),
}));
vi.mock("@/lib/gmail/server", () => ({
  GMAIL_SCOPE: "gmail.readonly",
  isGmailConfigured: mocks.configured,
  getGmailClient: mocks.getGmailClient,
  gmailOAuthClient: () => ({ getToken: mocks.getToken }),
  saveGmailToken: mocks.save,
}));
import { GET, DELETE } from "@/app/api/gmail/important/route";
import { GET as callback } from "@/app/api/gmail/callback/route";

beforeEach(() => {
  vi.resetAllMocks();
  mocks.getUser.mockResolvedValue({ data: { user: { id: "owner" } } });
  mocks.configured.mockReturnValue(true);
  mocks.getGmailClient.mockResolvedValue({
    users: {
      messages: { list: mocks.list, get: mocks.get },
      getProfile: mocks.profile,
    },
  });
  mocks.profile.mockResolvedValue({
    data: { emailAddress: "owner@example.com" },
  });
  mocks.from.mockReturnValue({
    select: () => ({
      eq: async () => ({ data: [{ company_name: "テスト社" }], error: null }),
    }),
  });
});

describe("Gmail APIの認証と取得", () => {
  it("未ログインならGmailへアクセスしない", async () => {
    mocks.getUser.mockResolvedValue({ data: { user: null } });
    expect((await GET()).status).toBe(401);
    expect(mocks.getGmailClient).not.toHaveBeenCalled();
  });
  it("未設定と未連携を区別する", async () => {
    mocks.configured.mockReturnValue(false);
    expect(await (await GET()).json()).toEqual({ status: "not_configured" });
    mocks.configured.mockReturnValue(true);
    mocks.getGmailClient.mockResolvedValue(null);
    expect(await (await GET()).json()).toEqual({ status: "disconnected" });
  });
  it("一部取得失敗でも残りを表示し、キャッシュとトークンの露出を防ぐ", async () => {
    mocks.list.mockResolvedValue({
      data: { messages: [{ id: "mail1" }, { id: "mail2" }] },
    });
    mocks.get.mockImplementation(async ({ id }: { id: string }) => {
      if (id === "mail2") throw new Error("provider-error");
      return {
        data: {
          threadId: "thread1",
          internalDate: "1792022400000",
          labelIds: ["UNREAD"],
          snippet: "テスト社の面接日程です",
          payload: {
            headers: [
              { name: "Subject", value: "テスト社 面接日程のご案内" },
              { name: "From", value: "recruit@example.com" },
            ],
          },
        },
      };
    });
    const response = await GET();
    const body = await response.json();
    expect(response.headers.get("Cache-Control")).toBe("private, no-store");
    expect(body.partial).toBe(true);
    expect(body.messages).toHaveLength(1);
    expect(body.messages[0].url).toBe(
      "https://mail.google.com/mail/?authuser=owner%40example.com#inbox/thread1",
    );
    expect(JSON.stringify(body)).not.toContain("token");
  });
  it("異なるOriginからの連携解除を拒否する", async () => {
    const response = await DELETE(
      new NextRequest("https://example.com/api/gmail/important", {
        method: "DELETE",
        headers: { origin: "https://evil.example" },
      }),
    );
    expect(response.status).toBe(403);
    expect(mocks.from).not.toHaveBeenCalled();
  });
});

describe("Gmail OAuth callback", () => {
  function request(cookie: string, search = "code=code&state=state") {
    return new NextRequest(`https://example.com/api/gmail/callback?${search}`, {
      headers: { cookie: `gmail_oauth_state=${cookie}` },
    });
  }
  it("stateが同じでも別ユーザーのセッションなら拒否する", async () => {
    const response = await callback(request("another-user:state"));
    expect(response.headers.get("location")).toContain("gmail=oauth_failed");
    expect(mocks.getToken).not.toHaveBeenCalled();
  });
  it("読み取りスコープが不足していると保存しない", async () => {
    mocks.getToken.mockResolvedValue({
      tokens: { refresh_token: "secret", scope: "calendar" },
    });
    expect(
      (await callback(request("owner:state"))).headers.get("location"),
    ).toContain("oauth_failed");
    expect(mocks.save).not.toHaveBeenCalled();
  });
  it("必要なスコープがある場合だけ本人のトークンを保存しstateを消す", async () => {
    mocks.getToken.mockResolvedValue({
      tokens: { refresh_token: "secret", scope: "gmail.readonly" },
    });
    const response = await callback(request("owner:state"));
    expect(mocks.save).toHaveBeenCalledWith("owner", "secret");
    expect(response.headers.get("location")).toContain("gmail=connected");
    expect(response.cookies.get("gmail_oauth_state")?.value).toBe("");
  });
});

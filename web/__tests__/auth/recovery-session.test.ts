// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const state = vi.hoisted(() => ({ jar: new Map<string, string>() }));
vi.mock("next/headers", () => ({
  cookies: async () => ({
    getAll: () => [...state.jar].map(([name, value]) => ({ name, value })),
    set: (name: string, value: string) => {
      state.jar.set(name, value);
    },
  }),
}));
import { GET } from "@/app/auth/recovery/route";
import { createClient } from "@/lib/supabase/server";

beforeEach(() => {
  state.jar.clear();
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://recovery-test.supabase.co");
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "test-key");
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("別ブラウザの再設定セッション", () => {
  it("事前Cookieなしでトークンを検証し、次のリクエストでも本人を確認できる", async () => {
    const user = {
      id: "00000000-0000-0000-0000-000000000001",
      aud: "authenticated",
      app_metadata: {},
      user_metadata: {},
      created_at: "2026-01-01T00:00:00Z",
    };
    const encode = (value: object) =>
      Buffer.from(JSON.stringify(value)).toString("base64url");
    const token = `${encode({ alg: "HS256", typ: "JWT" })}.${encode({ sub: user.id, aud: "authenticated", exp: Math.floor(Date.now() / 1000) + 3600 })}.test-signature`;
    const calls: string[] = [];
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: string | URL | Request) => {
        const url = new URL(
          typeof input === "string" || input instanceof URL ? input : input.url,
        );
        calls.push(url.pathname);
        if (url.pathname === "/auth/v1/verify")
          return Response.json({
            access_token: token,
            refresh_token: "test-refresh",
            token_type: "bearer",
            expires_in: 3600,
            user,
          });
        if (url.pathname === "/auth/v1/user") return Response.json(user);
        throw new Error("Unexpected network request");
      }),
    );
    expect(state.jar.size).toBe(0);
    const response = await GET(
      new NextRequest(
        "http://localhost:3000/auth/recovery?token_hash=test-token&type=recovery",
      ),
    );
    expect(response.headers.get("location")).toBe(
      "http://localhost:3000/reset-password",
    );
    expect(
      [...state.jar.keys()].some((name) => name.includes("auth-token")),
    ).toBe(true);
    // 新しいSSRクライアントを作り、次のページリクエストを再現する。
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getUser();
    expect(error).toBeNull();
    expect(data.user?.id).toBe(user.id);
    expect(calls).toContain("/auth/v1/verify");
    expect(calls).toContain("/auth/v1/user");
  });
});

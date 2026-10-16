// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";
import { decryptToken, encryptToken } from "@/lib/gmail/token-crypto";

afterEach(() => vi.unstubAllEnvs());
describe("Gmailトークンの暗号化", () => {
  it("毎回異なる暗号文を生成し、復元できる", () => {
    vi.stubEnv(
      "GMAIL_TOKEN_ENCRYPTION_KEY",
      Buffer.alloc(32, 7).toString("base64"),
    );
    const a = encryptToken("refresh-token");
    const b = encryptToken("refresh-token");
    expect(a).not.toEqual(b);
    expect(a).not.toContain("refresh-token");
    expect(decryptToken(a)).toBe("refresh-token");
  });
  it("改ざん・異なるキーでの復元を拒否する", () => {
    vi.stubEnv(
      "GMAIL_TOKEN_ENCRYPTION_KEY",
      Buffer.alloc(32, 7).toString("base64"),
    );
    const value = encryptToken("token");
    const [iv, tag, data] = value.split(".");
    expect(() =>
      decryptToken(
        `${iv}.${tag}.${Buffer.from("tampered").toString("base64url")}`,
      ),
    ).toThrow();
    expect(data).toBeTruthy();
    vi.stubEnv(
      "GMAIL_TOKEN_ENCRYPTION_KEY",
      Buffer.alloc(32, 8).toString("base64"),
    );
    expect(() => decryptToken(value)).toThrow();
  });
  it("不正なキーを拒否する", () => {
    vi.stubEnv("GMAIL_TOKEN_ENCRYPTION_KEY", "invalid");
    expect(() => encryptToken("token")).toThrow();
  });
});

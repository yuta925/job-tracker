import { describe, expect, it } from "vitest";
import { applicationSaveMessage } from "@/lib/applications/errors";

describe("企業保存エラーの案内", () => {
  it("DB未更新とログイン・入力エラーを区別する", () => {
    expect(applicationSaveMessage({code:"PGRST204"})).toContain("移行SQL");
    expect(applicationSaveMessage({code:"42501"})).toContain("ログインし直して");
    expect(applicationSaveMessage({code:"23502"})).toContain("必須項目");
  });
  it("不明なエラーの生の情報は表示しない", () => {
    expect(applicationSaveMessage(new Error("private internal details"))).toBe("保存に失敗しました。再度お試しください。");
  });
});

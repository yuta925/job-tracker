import { describe, expect, it } from "vitest";
import { validateSupabaseUrl } from "@/lib/supabase/config";

describe("Supabase接続先の検証", () => {
  it.each([
    "https://project.supabase.co",
    "http://localhost:54321",
    "https://auth.example.com",
  ])("接続先として%sを許可する", (url) => {
    expect(validateSupabaseUrl(url)).toBeNull();
  });
  it.each([
    undefined,
    "",
    "not-a-url",
    "javascript:alert(1)",
    "https://supabase.com/dashboard/project/project",
  ])("誤設定を検出する: %s", (url) => {
    expect(validateSupabaseUrl(url)).toEqual(expect.any(String));
  });
});

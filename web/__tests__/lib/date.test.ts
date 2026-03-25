import { describe, it, expect } from "vitest";
import { toDatetimeLocalValue } from "@/lib/date";

describe("toDatetimeLocalValue", () => {
  it("UTC ISO 文字列をローカル datetime-local 形式に変換する", () => {
    // UTC 06:00 は JST(+9) では 15:00
    const utcIso = "2026-03-26T06:00:00.000Z";
    const result = toDatetimeLocalValue(utcIso);

    // ローカル時刻で new Date を使って期待値を構築（テスト環境のTZに依存しない）
    const d = new Date(utcIso);
    const pad = (n: number): string => String(n).padStart(2, "0");
    const expected =
      `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
      `T${pad(d.getHours())}:${pad(d.getMinutes())}`;

    expect(result).toBe(expected);
  });

  it("返り値が 'YYYY-MM-DDTHH:mm' のフォーマットである", () => {
    const result = toDatetimeLocalValue("2026-06-01T00:00:00.000Z");
    // YYYY-MM-DDTHH:mm の形式チェック
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/);
  });

  it("タイムゾーンオフセット付き ISO 文字列を正しく変換する", () => {
    // +09:00 オフセット付きの文字列
    const isoWithOffset = "2026-03-26T15:00:00+09:00";
    const result = toDatetimeLocalValue(isoWithOffset);

    const d = new Date(isoWithOffset);
    const pad = (n: number): string => String(n).padStart(2, "0");
    const expected =
      `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
      `T${pad(d.getHours())}:${pad(d.getMinutes())}`;

    expect(result).toBe(expected);
  });

  it("分が 1 桁の場合もゼロパディングする", () => {
    // UTC 00:05 → ローカル時刻の分部分が "05" となること
    const result = toDatetimeLocalValue("2026-01-01T00:05:00.000Z");
    // 分は必ず 2 桁
    expect(result).toMatch(/T\d{2}:\d{2}$/);
    const minutes = result.slice(-2);
    expect(minutes.length).toBe(2);
  });
});

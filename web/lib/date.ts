/**
 * UTC ISO 文字列を datetime-local input 用のローカル時刻文字列に変換する。
 * 例: "2026-03-26T06:00:00+00:00" (JST+9 環境) → "2026-03-26T15:00"
 */
export function toDatetimeLocalValue(isoString: string): string {
  const d = new Date(isoString);
  const pad = (n: number): string => String(n).padStart(2, "0");
  return (
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
    `T${pad(d.getHours())}:${pad(d.getMinutes())}`
  );
}

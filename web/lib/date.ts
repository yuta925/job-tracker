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

export type DeadlineUrgency = "expired" | "soon" | "normal";

/**
 * 締切日 ('YYYY-MM-DD') に対して視覚状態を返す。
 * - 'expired': 今日より前
 * - 'soon': 今日から3日以内
 * - 'normal': それ以外
 *
 * 注意: 'YYYY-MM-DD' 文字列に 'T00:00:00' を付けてローカルmidnight として解釈する。
 * new Date('YYYY-MM-DD') は UTC midnight 解釈になりJSTでずれるため。
 */
export function getDeadlineUrgency(deadline: string): DeadlineUrgency {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(deadline + "T00:00:00");
  const diffDays = (d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
  if (diffDays < 0) return "expired";
  if (diffDays <= 3) return "soon";
  return "normal";
}

export function applicationSaveMessage(error: unknown): string {
  const value = error !== null && typeof error === "object"
    ? error as Record<string, unknown>
    : {};
  const message = typeof value.message === "string" ? value.message : "";
  if (value.code === "23514" && message.includes("applications_application_type_check"))
    return "応募種別のDB設定が未更新のため保存できません。冬インターン・早期選考に対応する移行SQL（0014）を適用してください。";
  if (["PGRST204", "PGRST205", "42703", "42P01"].includes(String(value.code)))
    return "保存先のDB設定がアプリと一致していません。Supabaseの移行SQLの適用状況を確認してください。";
  if (value.code === "42501" || message === "ログインが必要です")
    return "保存する権限を確認できませんでした。ログインし直してからお試しください。";
  if (value.code === "PGRST116")
    return "更新対象の企業情報が見つかりませんでした。画面を更新してから確認してください。";
  if (value.code === "23514" || value.code === "23502" || value.code === "22P02")
    return "入力内容を保存できませんでした。必須項目と選択内容を確認してください。";
  if (error instanceof TypeError)
    return "サーバーに接続できませんでした。通信状態を確認してから再度お試しください。";
  return "保存に失敗しました。再度お試しください。";
}

export function validateSupabaseUrl(value: string | undefined): string | null {
  if (!value)
    return "Supabaseの接続先が未設定です。NEXT_PUBLIC_SUPABASE_URLにProject URLを設定してください。";
  try {
    const url = new URL(value);
    if (!["https:", "http:"].includes(url.protocol))
      return "Supabaseの接続先URLが不正です。Project URLを確認してください。";
    if (url.hostname === "supabase.com" || url.hostname === "www.supabase.com")
      return "Supabaseの管理画面URLが設定されています。NEXT_PUBLIC_SUPABASE_URLには https://プロジェクトID.supabase.co のProject URLを設定してください。";
    return null;
  } catch {
    return "Supabaseの接続先URLが不正です。Project URLを確認してください。";
  }
}

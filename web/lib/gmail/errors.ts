function object(value: unknown): Record<string, unknown> {
  return value !== null && typeof value === "object"
    ? value as Record<string, unknown>
    : {};
}

export function gmailFailure(error: unknown) {
  const root = object(error);
  const response = object(root.response);
  const data = object(response.data);
  const provider = object(data.error);
  const entries = [provider.errors, provider.details].flatMap(value =>
    Array.isArray(value) ? value : [],
  );
  const reasons = entries.map(value => object(value).reason);
  const status = response.status ?? provider.code ?? root.code;
  const result = (code: string, message: string, reconnect = false) => ({
    code, error: message, reconnect,
  });

  if (reasons.includes("SERVICE_DISABLED") || reasons.includes("accessNotConfigured"))
    return result("gmail_api_disabled", "Google CloudでGmail APIが有効になっていません。OAuthクライアントと同じプロジェクトでGmail APIを有効にしてから、更新してください。");
  if (reasons.includes("ACCESS_TOKEN_SCOPE_INSUFFICIENT") || reasons.includes("insufficientPermissions"))
    return result("gmail_scope_missing", "Gmailの読み取り権限が不足しています。Gmailを再連携し、メールの読み取りを許可してください。", true);
  if (data.error === "invalid_grant" || status === 401)
    return result("gmail_authorization_expired", "Googleの連携許可が失効しています。Gmailを再連携してください。", true);
  if (root.message === "GMAIL_TOKEN_DECRYPTION_FAILED")
    return result("gmail_token_unreadable", "保存済みのGmail連携情報を読み取れません。暗号化キーの変更がないか確認し、Gmailを再連携してください。", true);
  if (root.code === "PGRST205" || root.code === "42P01")
    return result("gmail_database_missing", "Gmail連携に必要なDBテーブルが見つかりません。Supabaseの移行SQLの適用状況を確認してください。");
  if (status === 429 || reasons.includes("rateLimitExceeded") || reasons.includes("userRateLimitExceeded"))
    return result("gmail_rate_limited", "Gmail APIの取得回数制限に達しました。しばらく待ってから更新してください。");
  if (reasons.includes("domainPolicy"))
    return result("gmail_domain_policy", "Google Workspaceの管理ポリシーによってGmailへのアクセスが制限されています。管理者の設定を確認してください。");
  return result("gmail_fetch_failed", "Gmailを取得できませんでした。時間をおいて更新してください。改善しない場合は連携設定を確認してください。", true);
}

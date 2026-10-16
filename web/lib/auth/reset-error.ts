interface ResetError {
  code?: string;
  status?: number;
}

export function passwordResetErrorMessage(error: ResetError): string {
  if (error.code === "email_address_not_authorized")
    return "Supabaseの既定メール送信では、この宛先へ送信できません。管理者がAuthenticationのメール設定でSMTPを構成してください。";
  if (
    error.code === "over_email_send_rate_limit" ||
    error.code === "over_request_rate_limit" ||
    error.status === 429
  )
    return "メール送信の回数制限に達しています。時間をおいて再度お試しください。";
  if (error.code === "captcha_failed")
    return "SupabaseのCAPTCHA設定により送信できません。管理者が認証設定を確認してください。";
  if (
    error.code === "email_provider_disabled" ||
    error.code === "provider_disabled"
  )
    return "Supabaseのメール認証が無効になっています。管理者が認証設定を確認してください。";
  if (
    error.code === "unexpected_failure" ||
    (error.status !== undefined && error.status >= 500)
  )
    return "Supabaseのメール送信処理でエラーが発生しました。管理者がAuthログとSMTP・メールテンプレート設定を確認してください。";
  return "再設定メールを送信できませんでした。接続設定を確認し、時間をおいて再度お試しください。";
}

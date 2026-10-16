export const RECOVERY_ERROR_MESSAGES = {
  expired:
    "リンクが無効か、有効期限が切れています。再設定メールをもう一度リクエストしてください。",
  browser_mismatch:
    "このリンクは、メールをリクエストしたのと同じブラウザで開く必要があります。元のブラウザで開くか、新しい再設定メールをリクエストしてください。",
  invalid_link:
    "再設定リンクに必要な情報がありません。メール内のリンクを開くか、新しい再設定メールをリクエストしてください。",
  verification_failed:
    "再設定リンクを確認できませんでした。新しい再設定メールをリクエストしてください。",
  session_missing:
    "再設定用のログイン情報を確認できませんでした。メール内のリンクから開き直すか、新しい再設定メールをリクエストしてください。",
} as const;

export type RecoveryErrorReason = keyof typeof RECOVERY_ERROR_MESSAGES;

export function classifyRecoveryError(error: unknown): RecoveryErrorReason {
  const code =
    error && typeof error === "object" && "code" in error
      ? error.code
      : undefined;
  if (code === "pkce_code_verifier_not_found" || code === "bad_code_verifier")
    return "browser_mismatch";
  if (code === "otp_expired" || code === "flow_state_expired") return "expired";
  return "verification_failed";
}

export function recoveryErrorMessage(
  reason: string | undefined,
): string | null {
  return reason && Object.hasOwn(RECOVERY_ERROR_MESSAGES, reason)
    ? RECOVERY_ERROR_MESSAGES[reason as RecoveryErrorReason]
    : null;
}

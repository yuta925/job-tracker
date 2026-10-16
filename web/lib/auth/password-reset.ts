export const RESET_PASSWORD_MIN_LENGTH = 8;

export type PasswordResetResult =
  { success: true; error?: never } | { error: string; success?: never };

export function validateNewPassword(
  password: string,
  confirmation: string,
): string | null {
  if (password.length < RESET_PASSWORD_MIN_LENGTH)
    return `パスワードは${RESET_PASSWORD_MIN_LENGTH}文字以上で入力してください。`;
  if (password !== confirmation) return "確認用パスワードが一致しません。";
  return null;
}

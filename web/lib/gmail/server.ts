import { google } from "googleapis";
import { createClient } from "@/lib/supabase/server";
import { decryptToken, encryptToken } from "./token-crypto";

export const GMAIL_SCOPE = "https://www.googleapis.com/auth/gmail.readonly";

export function isGmailConfigured(): boolean {
  return Boolean(
    process.env.GOOGLE_CLIENT_ID &&
    process.env.GOOGLE_CLIENT_SECRET &&
    process.env.GMAIL_REDIRECT_URI &&
    process.env.GMAIL_TOKEN_ENCRYPTION_KEY,
  );
}

export function gmailOAuthClient() {
  if (!isGmailConfigured()) throw new Error("Gmail連携の設定が必要です");
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GMAIL_REDIRECT_URI,
  );
}

export async function saveGmailToken(userId: string, refreshToken: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("gmail_connections")
    .upsert({
      user_id: userId,
      encrypted_token: encryptToken(refreshToken),
      updated_at: new Date().toISOString(),
    });
  if (error) throw error;
}

export async function getGmailClient(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("gmail_connections")
    .select("encrypted_token")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const auth = gmailOAuthClient();
  auth.setCredentials({
    refresh_token: decryptToken(data.encrypted_token as string),
  });
  return google.gmail({ version: "v1", auth });
}

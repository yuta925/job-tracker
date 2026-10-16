import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

function encryptionKey(): Buffer {
  const raw = process.env.GMAIL_TOKEN_ENCRYPTION_KEY;
  if (!raw) throw new Error("Gmail連携の暗号化設定が必要です");
  const key = Buffer.from(raw, "base64");
  if (key.length !== 32) throw new Error("Gmail連携の暗号化キーが不正です");
  return key;
}

export function encryptToken(value: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", encryptionKey(), iv);
  const data = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  return [iv, cipher.getAuthTag(), data]
    .map((part) => part.toString("base64url"))
    .join(".");
}

export function decryptToken(value: string): string {
  const parts = value.split(".");
  if (parts.length !== 3) throw new Error("Gmail連携情報が不正です");
  const [iv, tag, data] = parts.map((part) => Buffer.from(part, "base64url"));
  const decipher = createDecipheriv("aes-256-gcm", encryptionKey(), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(data), decipher.final()]).toString(
    "utf8",
  );
}

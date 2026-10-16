import type { ImportantMail } from "@/types/gmail";

export interface MailCandidate {
  id: string;
  subject: string;
  from: string;
  snippet: string;
  receivedAt: string;
  unread: boolean;
}

function normalize(value: string): string {
  return value
    .normalize("NFKC")
    .toLowerCase()
    .replace(/株式会社|合同会社|有限会社|[\s・･]/g, "");
}

// 判定は件名と抜粋だけを使用する。本文を保存・外部AIへ送信しない。
export function classifyImportantMail(
  mail: MailCandidate,
  companyNames: string[],
): ImportantMail | null {
  const text = `${mail.subject} ${mail.snippet}`;
  const haystack = normalize(`${text} ${mail.from}`);
  const companyName =
    companyNames.find((name) => {
      const normalized = normalize(name);
      return normalized.length >= 2 && haystack.includes(normalized);
    }) ?? null;
  // 未登録企業のメールは、採用の個別連絡を示す明確な件名だけを対象とする。
  const directRecruiting =
    /選考結果|書類選考.{0,8}(結果|通過)|面接.{0,8}(日程|ご案内|予約)|内定.{0,8}(通知|ご連絡|ご案内)|採用.{0,8}(結果|面接)/.test(
      mail.subject,
    );
  if (!companyName && !directRecruiting) return null;
  let reason: string;
  let priority: number;
  if (/選考結果|合否|書類通過|内定|不採用|見送り/.test(text)) {
    reason = "選考結果";
    priority = 4;
  } else if (
    /締切|〆切|提出期限|回答期限|本日中|明日まで|期限延長/.test(text)
  ) {
    reason = "締切・提出";
    priority = 3;
  } else if (/面接|面談|日程調整|予約確定/.test(text)) {
    reason = "面接・日程調整";
    priority = 2;
  } else if (/要返信|要対応|ご返信|ご回答|対応.{0,5}お願い/.test(text)) {
    reason = "返信・対応依頼";
    priority = 1;
  } else return null;
  return {
    ...mail,
    companyName,
    reason,
    priority,
    url: `https://mail.google.com/mail/#inbox/${encodeURIComponent(mail.id)}`,
  };
}

export function rankImportantMail(messages: ImportantMail[]): ImportantMail[] {
  return [...messages].sort(
    (a, b) =>
      Number(b.unread) - Number(a.unread) ||
      b.priority - a.priority ||
      b.receivedAt.localeCompare(a.receivedAt),
  );
}

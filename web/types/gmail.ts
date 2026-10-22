export interface ImportantMail {
  id: string;
  subject: string;
  from: string;
  snippet: string;
  receivedAt: string;
  unread: boolean;
  reason: string;
  companyName: string | null;
  url: string;
  priority: number;
}

export type GmailInbox =
  | { status: "not_configured" | "disconnected" }
  | {
      status: "connected";
      messages: ImportantMail[];
      checkedAt: string;
      partial: boolean;
    };

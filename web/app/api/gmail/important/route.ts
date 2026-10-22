import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getGmailClient, isGmailConfigured } from "@/lib/gmail/server";
import { gmailFailure } from "@/lib/gmail/errors";
import {
  classifyImportantMail,
  rankImportantMail,
} from "@/lib/gmail/importance";

export const dynamic = "force-dynamic";
const headers = { "Cache-Control": "private, no-store" };

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json(
      { error: "ログインが必要です" },
      { status: 401, headers },
    );
  if (!isGmailConfigured())
    return NextResponse.json({ status: "not_configured" }, { headers });
  try {
    const gmail = await getGmailClient(user.id);
    if (!gmail)
      return NextResponse.json({ status: "disconnected" }, { headers });
    const { data: applications, error } = await supabase
      .from("applications")
      .select("company_name")
      .eq("user_id", user.id);
    if (error) throw error;
    const companies = (applications ?? []).map((app) =>
      String(app.company_name),
    );
    const [listing, profile] = await Promise.all([
      gmail.users.messages.list({
        userId: "me",
        q: "in:inbox newer_than:14d -category:promotions -category:social",
        maxResults: 50,
      }),
      gmail.users.getProfile({ userId: "me" }),
    ]);
    const list = listing.data;
    if (!profile.data.emailAddress)
      throw new Error("アカウントを確認できませんでした");
    // metadata形式でも件名・送信者を取得できる。抜粋はGmailが返すものをそのままテキストとして扱う。
    const results = await Promise.allSettled(
      (list.messages ?? []).map(async (message) => {
        if (!message.id) return null;
        const { data } = await gmail.users.messages.get({
          userId: "me",
          id: message.id,
          format: "metadata",
          metadataHeaders: ["Subject", "From"],
        });
        const header = (name: string) =>
          data.payload?.headers?.find(
            (h) => h.name?.toLowerCase() === name.toLowerCase(),
          )?.value ?? "";
        const received = Number(data.internalDate);
        if (!Number.isFinite(received) || received <= 0) return null;
        const mail = classifyImportantMail(
          {
            id: message.id,
            subject: header("Subject") || "（件名なし）",
            from: header("From"),
            snippet: data.snippet ?? "",
            receivedAt: new Date(received).toISOString(),
            unread: data.labelIds?.includes("UNREAD") ?? false,
          },
          companies,
        );
        // GmailのAPI IDはRFC Message-IDではない。アカウント指定付きの受信メールURLを使う。
        return mail
          ? {
              ...mail,
              url: `https://mail.google.com/mail/?authuser=${encodeURIComponent(profile.data.emailAddress!)}#inbox/${encodeURIComponent(data.threadId ?? message.id)}`,
            }
          : null;
      }),
    );
    const messages = results.flatMap((result) =>
      result.status === "fulfilled" && result.value ? [result.value] : [],
    );
    return NextResponse.json(
      {
        status: "connected",
        messages: rankImportantMail(messages).slice(0, 6),
        checkedAt: new Date().toISOString(),
        partial: results.some((result) => result.status === "rejected"),
      },
      { headers },
    );
  } catch (error) {
    return NextResponse.json(
      gmailFailure(error),
      { status: 502, headers },
    );
  }
}

export async function DELETE(request: NextRequest) {
  if (request.headers.get("origin") !== request.nextUrl.origin)
    return NextResponse.json(
      { error: "不正なリクエストです" },
      { status: 403, headers },
    );
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json(
      { error: "ログインが必要です" },
      { status: 401, headers },
    );
  const { error } = await supabase
    .from("gmail_connections")
    .delete()
    .eq("user_id", user.id);
  if (error)
    return NextResponse.json(
      { error: "連携を解除できませんでした" },
      { status: 500, headers },
    );
  return NextResponse.json({ status: "disconnected" }, { headers });
}

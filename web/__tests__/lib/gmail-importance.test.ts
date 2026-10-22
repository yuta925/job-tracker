import { describe, expect, it } from "vitest";
import {
  classifyImportantMail,
  rankImportantMail,
} from "@/lib/gmail/importance";

const mail = {
  id: "m",
  subject: "テスト社 面接日程のご案内",
  from: "recruit@example.com",
  snippet: "面接の日程をお知らせします。",
  receivedAt: "2026-10-15T00:00:00Z",
  unread: true,
};

describe("重要メールの抽出", () => {
  it("表記揺れを吸収し、登録企業と判定理由を返す", () => {
    expect(classifyImportantMail(mail, ["株式会社 テスト社"])).toMatchObject({
      companyName: "株式会社 テスト社",
      reason: "面接・日程調整",
    });
  });
  it("企業が未登録でも個別の選考結果を表示する", () => {
    expect(
      classifyImportantMail({ ...mail, subject: "選考結果のご連絡" }, [])
        ?.reason,
    ).toBe("選考結果");
  });
  it("無関係な請求期限や一般的な面接対策ニュースを表示しない", () => {
    expect(
      classifyImportantMail(
        {
          ...mail,
          subject: "請求書の提出期限",
          snippet: "明日までにお支払いください",
        },
        [],
      ),
    ).toBeNull();
    expect(
      classifyImportantMail(
        {
          ...mail,
          subject: "面接対策セミナー開催",
          snippet: "採用担当者が語る面接のコツ",
        },
        [],
      ),
    ).toBeNull();
  });
  it("企業名から法人格を除去した結果が空なら一致としない", () => {
    expect(
      classifyImportantMail({ ...mail, subject: "締切", snippet: "提出期限" }, [
        "株式会社",
      ]),
    ).toBeNull();
  });
  it("未読を優先し、重要度・受信日時の順で並べる", () => {
    const result = classifyImportantMail({ ...mail, subject: "選考結果" }, [])!;
    const interview = classifyImportantMail(mail, [])!;
    expect(
      rankImportantMail([
        { ...result, id: "read", unread: false },
        { ...interview, id: "interview" },
        { ...result, id: "result" },
      ]).map((item) => item.id),
    ).toEqual(["result", "interview", "read"]);
  });
});

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { GmailInbox } from "@/types/gmail";

export function ImportantInbox() {
  const [inbox, setInbox] = useState<GmailInbox | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reconnect, setReconnect] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const requestNumber = useRef(0);
  const reload = useCallback(async (disconnect = false) => {
    const request = ++requestNumber.current;
    setLoading(true);
    setError(null);
    setReconnect(false);
    try {
      const response = await fetch("/api/gmail/important", {
        method: disconnect ? "DELETE" : "GET",
        cache: "no-store",
      });
      if (!response.ok) {
        const failure: { error?: string; reconnect?: boolean } = await response.json();
        if (request === requestNumber.current) {
          setError(failure.error || "Gmailを取得できませんでした。更新して再度お試しください。");
          setReconnect(failure.reconnect === true);
        }
        return;
      }
      const result: GmailInbox = await response.json();
      if (request === requestNumber.current) setInbox(result);
    } catch (err) {
      if (request === requestNumber.current)
        setError(err instanceof Error ? err.message : "取得に失敗しました");
    } finally {
      if (request === requestNumber.current) setLoading(false);
    }
  }, []);
  useEffect(() => {
    const status = new URLSearchParams(window.location.search).get("gmail");
    const notices: Record<string, string> = {
      connected: "Gmailと連携しました。",
      cancelled: "Gmailの連携をキャンセルしました。",
      oauth_failed: "Gmailと連携できませんでした。もう一度お試しください。",
      not_configured: "Gmail連携は準備中です。",
    };
    if (status && notices[status]) setNotice(notices[status]);
    void reload();
    return () => {
      requestNumber.current += 1;
    };
  }, [reload]);

  return (
    <section className="home-panel home-inbox" aria-labelledby="inbox-heading">
      <div className="home-section-heading">
        <div>
          <p className="home-eyebrow">IN THE LOOP</p>
          <h3 id="inbox-heading" className="md-title-large">
            見逃したくないメール
          </h3>
        </div>
        <button
          className="md-btn md-btn-text"
          disabled={loading}
          onClick={() => void reload()}
        >
          {loading ? "確認中..." : "更新 ↻"}
        </button>
      </div>
      {notice && !error && (
        <p role="status" className="home-notice">
          {notice}
        </p>
      )}
      {error && (
        <div role="alert" className="home-error">
          <p>{error}</p>
          {reconnect && <a className="underline" href="/api/gmail/auth">
            Gmailを再連携
          </a>}
        </div>
      )}
      {loading && !inbox && (
        <p className="home-empty" role="status">
          メールを確認しています...
        </p>
      )}
      {!loading && inbox?.status === "not_configured" && (
        <div className="home-empty">
          <span className="home-stamp" aria-hidden="true">
            ✉
          </span>
          <p className="md-title-medium">重要な連絡を、ここに。</p>
          <p className="mt-2">
            Gmail連携は準備中です。連携できるようになると、選考結果・面接案内・締切の連絡をまとめて確認できます。
          </p>
        </div>
      )}
      {!loading && inbox?.status === "disconnected" && (
        <div className="home-empty">
          <span className="home-stamp" aria-hidden="true">
            ✉
          </span>
          <p className="md-title-medium">メールの確認を、もっと軽く。</p>
          <p className="mt-2 mb-4">
            Gmailと連携すると、選考に関する大切な連絡をここにまとめます。メールの読み取り権限を使用します。
          </p>
          <a className="md-btn md-btn-filled" href="/api/gmail/auth">
            Gmailと連携する
          </a>
        </div>
      )}
      {inbox?.status === "connected" && (
        <>
          <p
            className="md-body-small mb-2"
            style={{ color: "var(--md-on-surface-variant)" }}
          >
            受信トレイの直近14日・最新50通から抽出。件名と抜粋による判定です。
          </p>
          {inbox.partial && (
            <p className="home-notice" role="status">
              一部のメールを取得できませんでした。更新して再度確認してください。
            </p>
          )}
          {inbox.messages.length === 0 && (
            <p className="home-empty">
              今回確認した範囲に、重要な選考メールはありません。
            </p>
          )}
          {inbox.messages.slice(0, 3).map((mail) => (
            <a
              key={mail.id}
              className="home-mail"
              href={mail.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="home-pill">{mail.reason}</span>
                {mail.unread && <span className="home-unread">未読</span>}
                <span className="md-label-small">
                  {mail.companyName ?? mail.from}
                </span>
                <time
                  className="md-label-small ml-auto"
                  dateTime={mail.receivedAt}
                >
                  {new Date(mail.receivedAt).toLocaleDateString("ja-JP", {
                    month: "numeric",
                    day: "numeric",
                  })}
                </time>
              </div>
              <p className="md-title-small mt-2 break-words">
                {mail.subject} ↗
              </p>
              <p className="home-mail-snippet">{mail.snippet}</p>
            </a>
          ))}
          {inbox.messages.length > 3 && (
            <p className="md-body-small mt-2">
              ほか{inbox.messages.length - 3}件。Gmailで確認してください。
            </p>
          )}
          <div className="flex flex-wrap justify-between items-center gap-2 mt-3">
            <span className="md-label-small">
              最終確認{" "}
              {new Date(inbox.checkedAt).toLocaleTimeString("ja-JP", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
            <button
              className="md-btn md-btn-text"
              disabled={loading}
              onClick={() => {
                if (window.confirm("Gmailとの連携を解除しますか？"))
                  void reload(true);
              }}
            >
              連携を解除
            </button>
          </div>
        </>
      )}
    </section>
  );
}

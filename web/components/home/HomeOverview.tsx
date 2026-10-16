"use client";

import { useLocalClock } from "@/hooks/useLocalClock";
import type { useApplications } from "@/hooks/useApplications";
import type { useScheduleEvents } from "@/hooks/useScheduleEvents";
import type { Application } from "@/types/application";
import { APPLICATION_TYPE_LABELS } from "@/types/application";
import { buildHomeSummary, localDateKey } from "@/lib/home/summary";
import { ImportantInbox } from "./ImportantInbox";

interface Props {
  applicationsState: ReturnType<typeof useApplications>;
  scheduleState: ReturnType<typeof useScheduleEvents>;
  onOpenApplication: (app: Application) => void;
  onNavigate: (tab: "kanban" | "schedule", date?: string) => void;
  onAdd: () => void;
}

export function HomeOverview({
  applicationsState,
  scheduleState,
  onOpenApplication,
  onNavigate,
  onAdd,
}: Props) {
  const now = useLocalClock();
  // サーバーと利用者のタイムゾーンが違っても初期HTMLを一致させる。
  if (!now)
    return (
      <p role="status" className="home-overview">
        ホームを読み込み中...
      </p>
    );
  const summary = buildHomeSummary(
    applicationsState.applications,
    scheduleState.events,
    now,
  );
  const loading = applicationsState.isLoading || scheduleState.isLoading;
  const today = localDateKey(now);
  const dateLabel = (date: string) =>
    date === today
      ? "今日"
      : new Date(`${date}T00:00:00`).toLocaleDateString("ja-JP", {
          month: "numeric",
          day: "numeric",
        });
  return (
    <div className="home-overview">
      <div className="home-intro">
        <div>
          <p className="home-eyebrow">
            {now.toLocaleDateString("ja-JP", {
              month: "long",
              day: "numeric",
              weekday: "long",
            })}
          </p>
          <h2>今日の一歩を、ここから。</h2>
          <p>大切な連絡と、次にやることをひと目で。</p>
        </div>
        <button className="md-btn md-btn-filled" onClick={onAdd}>
          ＋ 企業を追加
        </button>
        <span className="home-spark" aria-hidden="true">
          ✳
        </span>
      </div>
      <div className="home-summary" aria-label="選考の概要">
        <div>
          <span>進行中の選考</span>
          <strong>
            {applicationsState.isLoading || applicationsState.error
              ? "—"
              : summary.activeCount}
            <small>件</small>
          </strong>
        </div>
        <div>
          <span>今日の予定</span>
          <strong>
            {loading || applicationsState.error || scheduleState.error
              ? "—"
              : summary.todayCount}
            <small>件</small>
          </strong>
        </div>
        <div>
          <span>
            7日先までの締切
            {summary.overdueCount > 0 ? "（期限超過を含む）" : ""}
          </span>
          <strong>
            {applicationsState.isLoading || applicationsState.error
              ? "—"
              : summary.deadlines.length}
            <small>件</small>
          </strong>
        </div>
      </div>
      {applicationsState.error && (
        <p role="alert" className="home-error">
          選考情報を取得できませんでした。
          <button
            className="md-btn md-btn-text"
            onClick={() => void applicationsState.reload()}
          >
            再試行
          </button>
        </p>
      )}
      {scheduleState.error && (
        <p role="alert" className="home-error">
          予定を取得できませんでした。
          <button
            className="md-btn md-btn-text"
            onClick={() => void scheduleState.reload()}
          >
            再試行
          </button>
        </p>
      )}
      <div className="home-columns">
        <div className="home-action-column">
          <section className="home-panel" aria-labelledby="deadlines-heading">
            <div className="home-section-heading">
              <div>
                <p className="home-eyebrow">NEXT ACTION</p>
                <h3 id="deadlines-heading" className="md-title-large">
                  先に確認する締切
                </h3>
              </div>
              <button
                className="md-btn md-btn-text"
                onClick={() => onNavigate("kanban")}
              >
                選考を見る ↗
              </button>
            </div>
            {applicationsState.isLoading ? (
              <p role="status">選考を読み込み中...</p>
            ) : applicationsState.error ? (
              <p className="home-empty">読み込めると、締切を確認できます。</p>
            ) : summary.deadlines.length === 0 ? (
              <p className="home-empty">
                7日先までの締切はありません。少し先の準備を進めておこう。
              </p>
            ) : (
              summary.deadlines.slice(0, 4).map((app) => (
                <button
                  className="home-list-row w-full text-left"
                  key={app.id}
                  onClick={() => onOpenApplication(app)}
                >
                  <span
                    className={`home-due${app.deadline! < today ? " overdue" : ""}`}
                  >
                    {app.deadline! < today
                      ? "期限超過"
                      : dateLabel(app.deadline!)}
                    <small>
                      {app.deadline! < today
                        ? dateLabel(app.deadline!)
                        : "締切"}
                    </small>
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="md-title-medium block break-words">
                      {app.company_name}
                    </span>
                    <span className="md-label-small">
                      {app.application_type
                        ? APPLICATION_TYPE_LABELS[app.application_type]
                        : "応募区分未設定"}
                    </span>
                  </span>
                  <span aria-hidden="true">↗</span>
                </button>
              ))
            )}
            {summary.deadlines.length > 4 && (
              <p className="md-body-small mt-3">
                ほか{summary.deadlines.length - 4}件。選考管理で確認できます。
              </p>
            )}
          </section>
          <section className="home-panel" aria-labelledby="agenda-heading">
            <div className="home-section-heading">
              <div>
                <p className="home-eyebrow">COMING UP</p>
                <h3 id="agenda-heading" className="md-title-large">
                  これからの予定
                </h3>
              </div>
              <button
                className="md-btn md-btn-text"
                onClick={() => onNavigate("schedule")}
              >
                予定を見る ↗
              </button>
            </div>
            {loading ? (
              <p role="status">予定を読み込み中...</p>
            ) : scheduleState.error || applicationsState.error ? (
              <p className="home-empty">予定をすべて読み込めませんでした。</p>
            ) : summary.agenda.length === 0 ? (
              <p className="home-empty">7日先までの予定はありません。</p>
            ) : (
              summary.agenda.slice(0, 4).map((item) => (
                <button
                  className="home-list-row w-full text-left"
                  key={item.id}
                  onClick={() => {
                    if (item.kind === "interview") {
                      const app = applicationsState.applications.find(
                        (app) => app.id === item.sourceId,
                      );
                      if (app) onOpenApplication(app);
                    } else onNavigate("schedule", item.date);
                  }}
                >
                  <span className="home-time">
                    {dateLabel(item.date)}
                    <small>{item.time ?? "終日"}</small>
                  </span>
                  <span className="flex-1 min-w-0 break-words">
                    {item.title}
                  </span>
                  <span aria-hidden="true">↗</span>
                </button>
              ))
            )}
            {summary.agenda.length > 4 && (
              <p className="md-body-small mt-3">
                ほか{summary.agenda.length - 4}件。スケジュールで確認できます。
              </p>
            )}
          </section>
        </div>
        <ImportantInbox />
      </div>
      {!applicationsState.isLoading &&
        applicationsState.applications.length === 0 &&
        !applicationsState.error && (
          <p className="home-welcome">
            まずは気になる企業をひとつ追加してみよう。締切と面接予定がここに集まります。
          </p>
        )}
    </div>
  );
}

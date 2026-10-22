"use client";

import type { JobSite } from "@/types";

interface JobSiteCardProps {
  jobSite: JobSite;
  onEdit: (jobSite: JobSite) => void;
  onDelete: (id: string) => void;
}

export function JobSiteCard({ jobSite, onEdit, onDelete }: JobSiteCardProps) {
  let domain = "";
  try {
    domain = jobSite.url ? new URL(jobSite.url).hostname : "";
  } catch {
    // 古いデータのURLが不正でも、一覧と編集は利用できるようにする。
  }
  const canOpen = !!domain && /^https?:\/\//i.test(jobSite.url ?? "");

  return (
    <article className="collection-card">
      <div className="collection-site-heading">
        <span className="collection-monogram" aria-hidden="true">{jobSite.name.slice(0, 1)}</span>
        <div className="min-w-0">
          <h3 className="md-title-medium break-words">{jobSite.name}</h3>
          <p className="collection-muted md-body-small break-all">{domain || "URL未登録"}</p>
        </div>
      </div>
      <span className="collection-tag">{jobSite.category}</span>
      <p className="collection-description">{jobSite.memo || "メモはまだありません。使い方や確認したいことを残せます。"}</p>
      <div className="collection-card-footer">
        {canOpen ? (
          <a href={jobSite.url!} target="_blank" rel="noopener noreferrer" className="md-btn md-btn-tonal" aria-label={`${jobSite.name}を開く（新しいタブ）`}>
            サイトを開く ↗
          </a>
        ) : <span className="collection-muted md-body-small">編集からURLを設定</span>}
        <div className="collection-actions">
          <button className="md-btn md-btn-text" onClick={() => onEdit(jobSite)} aria-label={`${jobSite.name}を編集`}>編集</button>
          <button className="md-btn md-btn-text collection-delete" aria-label={`${jobSite.name}を削除`} onClick={() => {
            if (confirm(`「${jobSite.name}」を削除しますか？`)) onDelete(jobSite.id);
          }}>削除</button>
        </div>
      </div>
    </article>
  );
}

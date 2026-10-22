"use client";

import { useId, useState } from "react";
import type { SelfAnalysisItem } from "@/types";

interface SelfAnalysisItemCardProps {
  item: SelfAnalysisItem;
  onEdit: (item: SelfAnalysisItem) => void;
  onDelete: (id: string) => void;
}

export function SelfAnalysisItemCard({ item, onEdit, onDelete }: SelfAnalysisItemCardProps) {
  const [expanded, setExpanded] = useState(false);
  const contentId = useId();
  const description = item.description ?? "";
  const canExpand = description.length > 140 || description.split("\n").length > 3;

  return (
    <article className="collection-card">
      <h3 className="md-title-medium break-words">{item.title}</h3>
      <p id={contentId} className={`collection-description whitespace-pre-wrap${expanded || !canExpand ? " collection-description-expanded" : ""}`}>
        {description || "説明はまだありません。具体的な経験や気づきを書き足してみましょう。"}
      </p>
      {item.tags.length > 0 && <div className="collection-tags" aria-label="関連タグ">{item.tags.map(tag => <span className="collection-tag" key={tag}>{tag}</span>)}</div>}
      <div className="collection-card-footer">
        {canExpand && <button className="md-btn md-btn-text" aria-expanded={expanded} aria-controls={contentId} onClick={() => setExpanded(value => !value)} aria-label={`${item.title}の${expanded ? "本文を閉じる" : "全文を読む"}`}>{expanded ? "閉じる" : "全文を読む"}</button>}
        <div className="collection-actions ml-auto">
          <button className="md-btn md-btn-text" onClick={() => onEdit(item)} aria-label={`${item.title}を編集`}>編集</button>
          <button className="md-btn md-btn-text collection-delete" aria-label={`${item.title}を削除`} onClick={() => {if (confirm(`「${item.title}」を削除しますか？`)) onDelete(item.id);}}>削除</button>
        </div>
      </div>
    </article>
  );
}

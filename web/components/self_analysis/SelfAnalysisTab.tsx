"use client";

import { useState } from "react";
import type { SelfAnalysisItem, SelfAnalysisItemInsert, SelfAnalysisItemType, SelfAnalysisItemUpdate } from "@/types";
import { SelfAnalysisItemCard } from "./SelfAnalysisItemCard";
import { SelfAnalysisItemFormModal } from "./SelfAnalysisItemFormModal";

interface SelfAnalysisTabProps {
  items: SelfAnalysisItem[];
  isLoading: boolean;
  error: Error | null;
  onCreate: (data: SelfAnalysisItemInsert) => Promise<void>;
  onUpdate: (id: string, data: SelfAnalysisItemUpdate) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

const SECTIONS: {type: SelfAnalysisItemType; title: string; description: string; prompt: string}[] = [
  {type:"strength", title:"強み", description:"自分らしく力を発揮できること", prompt:"周りから感謝されたことや、自然と頼まれることは？"},
  {type:"weakness", title:"弱み", description:"苦手なことと、工夫していること", prompt:"つまずきやすい場面と、そのときに試している工夫は？"},
  {type:"episode", title:"エピソード", description:"ESや面接で伝えたい具体的な経験", prompt:"取り組んだこと、そこでの行動、変わったことを残してみましょう。"},
];
type ModalState = {item: SelfAnalysisItem | null; type: SelfAnalysisItemType} | null;

export function SelfAnalysisTab({ items, isLoading, error, onCreate, onUpdate, onDelete }: SelfAnalysisTabProps) {
  const [modal, setModal] = useState<ModalState>(null);
  const [category, setCategory] = useState<SelfAnalysisItemType | "all">("all");
  const [query, setQuery] = useState("");
  const term = query.trim().toLocaleLowerCase();
  const filtered = items.filter(item => [item.title, item.description, ...item.tags].some(value => value?.toLocaleLowerCase().includes(term)));
  const visible = SECTIONS.filter(section => category === "all" || section.type === category);
  const resultCount = filtered.filter(item => category === "all" || item.item_type === category).length;

  if (isLoading) return <p role="status" className="collection-page">自己分析を読み込み中...</p>;
  if (error) return <p role="alert" className="collection-page home-error">{error.message}</p>;

  return (
    <div className="collection-page">
      <header className="collection-heading"><div><p className="home-eyebrow">KNOW YOURSELF</p><h2>自己分析</h2><p className="collection-muted">自分の言葉で、少しずつ。ESや面接につながる材料を残そう。</p></div></header>
      <div className="collection-toolbar">
        <div className="collection-filters" role="group" aria-label="自己分析の種類">
          <button aria-pressed={category === "all"} onClick={() => setCategory("all")}>すべて <span>{items.length}</span></button>
          {SECTIONS.map(section => <button key={section.type} aria-pressed={category === section.type} onClick={() => setCategory(section.type)}>{section.title} <span>{items.filter(item => item.item_type === section.type).length}</span></button>)}
        </div>
        <label className="collection-search"><span>自己分析を検索</span><input type="search" className="md-field-input" value={query} onChange={event => setQuery(event.target.value)} placeholder="タイトル・本文・タグ" /></label>
      </div>
      <p className="collection-result" role="status">{resultCount}件を表示 / 全{items.length}件</p>
      {term && resultCount === 0 ? <div className="collection-empty"><h3 className="md-title-medium">条件に合うメモがありません</h3><p>種類や検索する言葉を変えてみてください。</p><button className="md-btn md-btn-text" onClick={() => {setCategory("all");setQuery("");}}>絞り込みを解除</button></div> : visible.map(section => {
        const sectionItems = filtered.filter(item => item.item_type === section.type);
        if (term && sectionItems.length === 0) return null;
        return <section className="collection-section" key={section.type} aria-label={section.title}>
          <div className="collection-section-heading"><div><h3 className="md-title-large">{section.title} <span className="collection-muted md-label-medium">{sectionItems.length}件</span></h3><p className="collection-muted md-body-small">{section.description}</p></div><button className="md-btn md-btn-outlined" onClick={() => setModal({item:null,type:section.type})}>＋ {section.title}を追加</button></div>
          {sectionItems.length === 0 ? <div className="collection-prompt"><p>{section.prompt}</p><span className="collection-muted md-body-small">一言からでも大丈夫。あとで編集できます。</span></div> : <div className="collection-grid">{sectionItems.map(item => <SelfAnalysisItemCard key={item.id} item={item} onEdit={value => setModal({item:value,type:value.item_type})} onDelete={onDelete} />)}</div>}
        </section>;
      })}
      {modal && <SelfAnalysisItemFormModal item={modal.item} defaultType={modal.type} onClose={() => setModal(null)} onCreate={onCreate} onUpdate={onUpdate} />}
    </div>
  );
}

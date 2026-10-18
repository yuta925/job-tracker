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
  {type:"episode", title:"ガクチカ・エピソード", description:"ESや面接で伝えたい具体的な経験", prompt:"取り組んだこと、そこでの行動、変わったことを残してみましょう。"},
  {type:"career_axis", title:"就活の軸", description:"仕事や企業を選ぶときに大切にしたいこと", prompt:"仕事選びで譲れない条件や、実現したいことは？"},
  {type:"values", title:"価値観", description:"判断や行動のよりどころになる考え方", prompt:"どんなときにやりがいを感じ、何を大切にしている？"},
  {type:"interests", title:"興味・関心", description:"気になる分野や、深く知りたいテーマ", prompt:"時間を忘れて調べたり、つい話したくなることは？"},
  {type:"skills", title:"得意なこと・スキル", description:"経験を通じて身につけた知識や技術", prompt:"具体的にできることと、それを身につけた経験は？"},
  {type:"challenges", title:"苦手なこと", description:"課題に感じていることと向き合い方", prompt:"苦手な場面は？うまく付き合うためにしている工夫は？"},
  {type:"roles", title:"経験・役割", description:"経験の中で担った役割や、自分なりの工夫", prompt:"チームや活動の中でどんな役割を担い、何を工夫した？"},
  {type:"learnings", title:"成果・学び", description:"行動の結果と、そこから得た気づき", prompt:"どんな変化や成果があり、次に活かせる学びは？"},
  {type:"setbacks", title:"失敗・挫折経験", description:"困難に向き合い、乗り越えた経験", prompt:"困難にどう向き合い、その後どんな変化があった？"},
  {type:"future_vision", title:"将来像", description:"これから実現したい働き方やキャリア", prompt:"将来どんな人・働き方を目指したい？"},
  {type:"external_feedback", title:"他者から見た自分", description:"周囲からよく言われることや評価された点", prompt:"友人や同僚から、どんな人だと言われる？"},
  {type:"company_criteria", title:"企業選びの条件", description:"企業を比較するときに確認したい具体的な条件", prompt:"勤務地・働き方・事業内容など、確認したい条件は？"},
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

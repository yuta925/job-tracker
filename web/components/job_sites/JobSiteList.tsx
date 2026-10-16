"use client";

import { useState } from "react";
import type { JobSite, JobSiteCategory, JobSiteInsert, JobSiteUpdate } from "@/types";
import { JOB_SITE_CATEGORIES } from "@/types";
import { JobSiteCard } from "./JobSiteCard";
import { JobSiteFormModal } from "./JobSiteFormModal";

interface JobSiteListProps {
  jobSites: JobSite[];
  isLoading: boolean;
  error: Error | null;
  onCreate: (data: JobSiteInsert) => Promise<void>;
  onUpdate: (id: string, data: JobSiteUpdate) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function JobSiteList({ jobSites, isLoading, error, onCreate, onUpdate, onDelete }: JobSiteListProps) {
  const [modalJobSite, setModalJobSite] = useState<JobSite | null | undefined>(undefined);
  const [category, setCategory] = useState<JobSiteCategory | "all">("all");
  const [query, setQuery] = useState("");
  const term = query.trim().toLocaleLowerCase();
  const filtered = jobSites.filter(site =>
    (category === "all" || site.category === category) &&
    [site.name, site.url, site.memo].some(value => value?.toLocaleLowerCase().includes(term))
  );

  if (isLoading) return <p role="status" className="collection-page">就活サイトを読み込み中...</p>;
  if (error) return <p role="alert" className="collection-page home-error">{error.message}</p>;

  return (
    <div className="collection-page">
      <header className="collection-heading">
        <div><p className="home-eyebrow">YOUR LINKS</p><h2>就活サイト</h2><p className="collection-muted">求人探しも、スカウトの確認も。使うサイトをひとまとめに。</p></div>
        <button onClick={() => setModalJobSite(null)} className="md-btn md-btn-filled">＋ サイトを追加</button>
      </header>
      {jobSites.length === 0 ? (
        <div className="collection-empty"><h3 className="md-title-large">いつも使うサイトを、ここに。</h3><p>サイト名とURLを登録して、すぐに開ける自分用のリンク集を作りましょう。</p></div>
      ) : (
        <>
          <div className="collection-toolbar">
            <div className="collection-filters" role="group" aria-label="サイトのカテゴリ">
              <button aria-pressed={category === "all"} onClick={() => setCategory("all")}>すべて <span>{jobSites.length}</span></button>
              {JOB_SITE_CATEGORIES.map(value => <button key={value} aria-pressed={category === value} onClick={() => setCategory(value)}>{value} <span>{jobSites.filter(site => site.category === value).length}</span></button>)}
            </div>
            <label className="collection-search"><span>サイトを検索</span><input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="サイト名・URL・メモ" className="md-field-input" /></label>
          </div>
          <p className="collection-result" role="status">{filtered.length}件を表示 / 全{jobSites.length}件</p>
          {filtered.length === 0 ? <div className="collection-empty"><h3 className="md-title-medium">条件に合うサイトがありません</h3><p>カテゴリや検索する言葉を変えてみてください。</p><button className="md-btn md-btn-text" onClick={() => {setCategory("all");setQuery("");}}>絞り込みを解除</button></div> : (
            <div className="collection-grid">{filtered.map(site => <JobSiteCard key={site.id} jobSite={site} onEdit={setModalJobSite} onDelete={onDelete} />)}</div>
          )}
        </>
      )}
      {modalJobSite !== undefined && <JobSiteFormModal jobSite={modalJobSite} onClose={() => setModalJobSite(undefined)} onCreate={onCreate} onUpdate={onUpdate} />}
    </div>
  );
}

import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { JobSiteList } from "@/components/job_sites/JobSiteList";
import { SelfAnalysisTab } from "@/components/self_analysis/SelfAnalysisTab";
import { SelfAnalysisItemCard } from "@/components/self_analysis/SelfAnalysisItemCard";
import type { JobSite, SelfAnalysisItem } from "@/types";

const handlers = {onCreate:vi.fn(),onUpdate:vi.fn(),onDelete:vi.fn()};
const sites: JobSite[] = [
  {id:"one",user_id:"u",name:"求人サービス",category:"ナビサイト",url:"https://example.com",memo:"締切を毎週確認",created_at:"",updated_at:""},
  {id:"two",user_id:"u",name:"スカウトサービス",category:"スカウト",url:null,memo:"面談の連絡",created_at:"",updated_at:""},
];
const note: SelfAnalysisItem = {id:"n",user_id:"u",item_type:"episode",title:"チーム開発",description:"具体的な経験。".repeat(40),tags:["協調性"],created_at:"",updated_at:""};

describe("就活サイトと自己分析の一覧操作", () => {
  it("サイトのカテゴリと検索を組み合わせ、条件を解除できる", () => {
    render(<JobSiteList {...handlers} jobSites={sites} isLoading={false} error={null} />);
    fireEvent.click(screen.getByRole("button",{name:"スカウト 1"}));
    expect(screen.queryByRole("heading",{name:"求人サービス"})).not.toBeInTheDocument();
    fireEvent.change(screen.getByRole("searchbox",{name:"サイトを検索"}),{target:{value:"締切"}});
    expect(screen.getByText("条件に合うサイトがありません")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button",{name:"絞り込みを解除"}));
    expect(screen.getByRole("heading",{name:"求人サービス"})).toBeInTheDocument();
    expect(screen.getByRole("heading",{name:"スカウトサービス"})).toBeInTheDocument();
  });
  it("自己分析をタグでも検索でき、該当する本文を読める", () => {
    render(<SelfAnalysisTab {...handlers} items={[note]} isLoading={false} error={null} />);
    fireEvent.change(screen.getByRole("searchbox",{name:"自己分析を検索"}),{target:{value:"協調性"}});
    expect(screen.getByRole("heading",{name:note.title})).toBeInTheDocument();
    const expand = screen.getByRole("button",{name:`${note.title}の全文を読む`});
    fireEvent.click(expand);
    expect(screen.getByRole("button",{name:`${note.title}の本文を閉じる`})).toHaveAttribute("aria-expanded","true");
  });
  it("自己分析の編集操作が本文展開と干渉しない", () => {
    const edit = vi.fn();
    render(<SelfAnalysisItemCard item={note} onEdit={edit} onDelete={vi.fn()} />);
    fireEvent.click(screen.getByRole("button",{name:`${note.title}を編集`}));
    expect(edit).toHaveBeenCalledWith(note);
    expect(screen.getByRole("button",{name:`${note.title}の全文を読む`})).toHaveAttribute("aria-expanded","false");
  });
});

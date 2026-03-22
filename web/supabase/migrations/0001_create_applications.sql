-- applications テーブル作成
create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  company_name text not null,
  position_name text,
  status text not null check (
    status in ('interest', 'applied', 'document_passed', 'interviewing', 'offer', 'rejected')
  ),
  next_interview_at timestamptz,
  memo text,
  application_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- RLS 有効化
alter table public.applications enable row level security;

-- ポリシー: ユーザーは自分のデータのみ操作可能
create policy "users can view own applications"
  on public.applications for select
  using (auth.uid() = user_id);

create policy "users can insert own applications"
  on public.applications for insert
  with check (auth.uid() = user_id);

create policy "users can update own applications"
  on public.applications for update
  using (auth.uid() = user_id);

create policy "users can delete own applications"
  on public.applications for delete
  using (auth.uid() = user_id);

-- updated_at 自動更新トリガー
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger handle_applications_updated_at
  before update on public.applications
  for each row
  execute function public.handle_updated_at();

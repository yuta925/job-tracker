-- 応募種別
alter table public.applications
  add column application_type text
    check (application_type in ('summer_intern', 'main', 'fulltime_intern'));

-- Webテスト受験状況
alter table public.applications
  add column web_test_status text
    check (web_test_status in ('not_taken', 'taken', 'not_required'));

-- 締切日 (date-only, タイムゾーンなし)
alter table public.applications
  add column deadline date;

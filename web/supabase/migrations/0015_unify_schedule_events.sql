-- 個別管理を「予定」に統合。元テーブルはロールバック用に保持する。
BEGIN;
CREATE TABLE public.schedule_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL CHECK (length(trim(title)) > 0),
  event_date DATE,
  start_time TIME,
  end_time TIME,
  url TEXT,
  memo TEXT,
  legacy_source TEXT,
  legacy_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (legacy_source, legacy_id)
);
CREATE INDEX schedule_events_user_date_idx ON public.schedule_events (user_id, event_date);
ALTER TABLE public.schedule_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "schedule_events: select own" ON public.schedule_events FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "schedule_events: insert own" ON public.schedule_events FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "schedule_events: update own" ON public.schedule_events FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "schedule_events: delete own" ON public.schedule_events FOR DELETE USING (auth.uid() = user_id);

INSERT INTO public.schedule_events (user_id, title, event_date, start_time, end_time, url, memo, legacy_source, legacy_id, created_at, updated_at)
SELECT user_id, title, event_date, start_time, end_time, url, memo, 'seminars', id, created_at, updated_at FROM public.seminars;

INSERT INTO public.schedule_events (user_id, title, event_date, start_time, end_time, memo, legacy_source, legacy_id, created_at, updated_at)
SELECT user_id, concat_ws(' · ', nullif(event_name, ''), nullif(company_name, '')), event_date, start_time, end_time,
  concat_ws(E'\n', nullif(contact_name, ''), nullif(memo, ''), CASE WHEN next_action IS NOT NULL THEN '次のアクション: ' || next_action END),
  'reverse_offer_events', id, created_at, updated_at FROM public.reverse_offer_events;

INSERT INTO public.schedule_events (user_id, title, event_date, start_time, end_time, memo, legacy_source, legacy_id, created_at, updated_at)
SELECT user_id, concat_ws(' · ', advisor_name, nullif(agency_name, ''), 'CA面談'), meeting_date, start_time, end_time,
  concat_ws(E'\n', nullif(memo, ''), CASE WHEN next_action IS NOT NULL THEN '次のアクション: ' || next_action END),
  'ca_meetings', id, created_at, updated_at FROM public.ca_meetings;
COMMIT;

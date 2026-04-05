-- Phase 3: 逆求人イベント記録テーブル
CREATE TABLE public.reverse_offer_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_name TEXT NOT NULL,
  event_date DATE,
  company_name TEXT NOT NULL,
  contact_name TEXT,
  memo TEXT,
  next_action TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.reverse_offer_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can select own reverse_offer_events"
  ON public.reverse_offer_events FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reverse_offer_events"
  ON public.reverse_offer_events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reverse_offer_events"
  ON public.reverse_offer_events FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reverse_offer_events"
  ON public.reverse_offer_events FOR DELETE
  USING (auth.uid() = user_id);

-- updated_at 自動更新トリガー
CREATE OR REPLACE FUNCTION handle_reverse_offer_events_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_reverse_offer_events_updated_at
  BEFORE UPDATE ON public.reverse_offer_events
  FOR EACH ROW
  EXECUTE FUNCTION handle_reverse_offer_events_updated_at();

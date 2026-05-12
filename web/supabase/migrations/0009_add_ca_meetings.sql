CREATE TABLE public.ca_meetings (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  advisor_name TEXT NOT NULL,
  agency_name  TEXT,
  meeting_date DATE,
  memo         TEXT,
  next_action  TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.ca_meetings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ca_meetings: select own" ON public.ca_meetings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "ca_meetings: insert own" ON public.ca_meetings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "ca_meetings: update own" ON public.ca_meetings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "ca_meetings: delete own" ON public.ca_meetings
  FOR DELETE USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION handle_ca_meetings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ca_meetings_updated_at
  BEFORE UPDATE ON public.ca_meetings
  FOR EACH ROW EXECUTE FUNCTION handle_ca_meetings_updated_at();

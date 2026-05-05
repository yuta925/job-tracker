CREATE TABLE public.seminars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  event_date DATE,
  url TEXT,
  memo TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.seminars ENABLE ROW LEVEL SECURITY;

CREATE POLICY "seminars: select own" ON public.seminars
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "seminars: insert own" ON public.seminars
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "seminars: update own" ON public.seminars
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "seminars: delete own" ON public.seminars
  FOR DELETE USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION handle_seminars_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER seminars_updated_at
  BEFORE UPDATE ON public.seminars
  FOR EACH ROW EXECUTE FUNCTION handle_seminars_updated_at();

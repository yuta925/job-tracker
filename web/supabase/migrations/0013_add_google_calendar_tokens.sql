CREATE TABLE public.google_calendar_tokens (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  access_token  TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  expiry_date   BIGINT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id)
);

ALTER TABLE public.google_calendar_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "google_calendar_tokens: select own" ON public.google_calendar_tokens
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "google_calendar_tokens: insert own" ON public.google_calendar_tokens
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "google_calendar_tokens: update own" ON public.google_calendar_tokens
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "google_calendar_tokens: delete own" ON public.google_calendar_tokens
  FOR DELETE USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION handle_google_calendar_tokens_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER google_calendar_tokens_updated_at
  BEFORE UPDATE ON public.google_calendar_tokens
  FOR EACH ROW EXECUTE FUNCTION handle_google_calendar_tokens_updated_at();

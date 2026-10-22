CREATE TABLE public.job_sites (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  url        TEXT,
  category   TEXT NOT NULL,
  memo       TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.job_sites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "job_sites: select own" ON public.job_sites
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "job_sites: insert own" ON public.job_sites
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "job_sites: update own" ON public.job_sites
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "job_sites: delete own" ON public.job_sites
  FOR DELETE USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION handle_job_sites_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER job_sites_updated_at
  BEFORE UPDATE ON public.job_sites
  FOR EACH ROW EXECUTE FUNCTION handle_job_sites_updated_at();

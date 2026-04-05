-- Phase 3: 履歴書定型項目テーブル（1ユーザー1レコード）
CREATE TABLE public.resume_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  self_pr TEXT,
  gakuchika TEXT,
  research_summary TEXT,
  intern_experience TEXT,
  hackathon_experience TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.resume_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can select own resume_profile"
  ON public.resume_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own resume_profile"
  ON public.resume_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own resume_profile"
  ON public.resume_profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own resume_profile"
  ON public.resume_profiles FOR DELETE
  USING (auth.uid() = user_id);

-- updated_at 自動更新トリガー
CREATE OR REPLACE FUNCTION handle_resume_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_resume_profiles_updated_at
  BEFORE UPDATE ON public.resume_profiles
  FOR EACH ROW
  EXECUTE FUNCTION handle_resume_profiles_updated_at();

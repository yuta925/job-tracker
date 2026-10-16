CREATE TABLE public.gmail_connections (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  encrypted_token TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.gmail_connections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "gmail_connections: select own" ON public.gmail_connections FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "gmail_connections: insert own" ON public.gmail_connections FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "gmail_connections: update own" ON public.gmail_connections FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "gmail_connections: delete own" ON public.gmail_connections FOR DELETE USING (auth.uid() = user_id);

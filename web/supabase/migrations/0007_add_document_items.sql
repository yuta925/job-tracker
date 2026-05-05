CREATE TABLE public.document_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  feedback TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.document_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "document_items: select own" ON public.document_items
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "document_items: insert own" ON public.document_items
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "document_items: update own" ON public.document_items
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "document_items: delete own" ON public.document_items
  FOR DELETE USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION handle_document_items_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER document_items_updated_at
  BEFORE UPDATE ON public.document_items
  FOR EACH ROW EXECUTE FUNCTION handle_document_items_updated_at();

CREATE TABLE self_analysis_items (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_type   TEXT        NOT NULL CHECK (item_type IN ('strength', 'weakness', 'episode')),
  title       TEXT        NOT NULL,
  description TEXT,
  tags        TEXT[]      NOT NULL DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE self_analysis_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own self_analysis_items"
  ON self_analysis_items FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION handle_self_analysis_items_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER self_analysis_items_updated_at
  BEFORE UPDATE ON self_analysis_items
  FOR EACH ROW EXECUTE FUNCTION handle_self_analysis_items_updated_at();

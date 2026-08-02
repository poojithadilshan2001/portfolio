-- Create gallery_categories table (replaces static CATEGORIES array)
CREATE TABLE IF NOT EXISTS gallery_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Insert the four categories with stable sort order
INSERT INTO gallery_categories (name, sort_order) VALUES
  ('IEEE & Club Work', 0),
  ('Sports', 1),
  ('Music', 2),
  ('Visits', 3)
ON CONFLICT (name) DO NOTHING;

-- Migrate existing gallery_photos into entity_media
-- (safe to run multiple times — ON CONFLICT skips duplicates)
INSERT INTO entity_media (entity_type, entity_id, media_url, media_type, caption, is_cover, sort_order)
SELECT
  'gallery',
  gc.id,
  gp.media_url,
  gp.media_type,
  gp.caption,
  COALESCE(gp.is_cover, false),
  gp.sort_order
FROM gallery_photos gp
JOIN gallery_categories gc ON gc.name = gp.category;

-- RLS: allow authenticated users to manage gallery_categories
ALTER TABLE gallery_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Auth users manage gallery_categories"
  ON gallery_categories FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Public read gallery_categories"
  ON gallery_categories FOR SELECT TO anon USING (true);

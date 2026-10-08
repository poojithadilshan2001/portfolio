/*
# Research media + project cover images

## Overview
Extends the admin panel's reach to the Research page and Projects page:
- `research_media` stores photos/videos with captions for a research entry's
  gallery, replacing the hardcoded placeholder grid on the Researches page.
- `projects.image_url` stores each category's cover image, replacing the
  hardcoded placeholder image shown when a category is expanded.

Both are managed from /#admin like the existing gallery_photos and
site_settings tables — public read, authenticated-only writes. Media files
reuse the existing `portfolio-media` storage bucket.
*/

ALTER TABLE projects ADD COLUMN IF NOT EXISTS image_url text;

CREATE TABLE IF NOT EXISTS research_media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  research_id uuid NOT NULL REFERENCES researches(id) ON DELETE CASCADE,
  media_url text NOT NULL,
  media_type text NOT NULL DEFAULT 'image',
  caption text,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE research_media ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_select_research_media" ON research_media;
CREATE POLICY "public_select_research_media" ON research_media FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "auth_insert_research_media" ON research_media;
CREATE POLICY "auth_insert_research_media" ON research_media FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_research_media" ON research_media;
CREATE POLICY "auth_update_research_media" ON research_media FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_research_media" ON research_media;
CREATE POLICY "auth_delete_research_media" ON research_media FOR DELETE
  TO authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_research_media_research_id ON research_media (research_id, sort_order);

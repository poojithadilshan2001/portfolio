/*
# Gallery, site settings, and RLS lockdown

## Overview
Adds the tables needed to manage the photo/video gallery and profile photo
through the new admin panel instead of code edits, and locks down write
access on all public content tables to authenticated users only (previously
anon/public could insert, update, and delete this data through the exposed
anon key, which is a real vulnerability on a public portfolio site).

## New Tables

1. `gallery_photos`
   - `id` (uuid, primary key)
   - `category` (text, not null) — e.g. "IEEE & Club Work", "Sports", "Music"
   - `caption` (text)
   - `media_url` (text, not null) — public Storage URL
   - `media_type` (text, not null, default 'image') — 'image' or 'video'
   - `sort_order` (int, default 0)
   - `created_at` (timestamptz)

2. `site_settings`
   - Single-row key/value table for site-wide settings managed via the admin
     panel (currently just the home page profile photo).
   - `id` (uuid, primary key)
   - `key` (text, unique, not null)
   - `value` (text)
   - `updated_at` (timestamptz)

## Storage
- New public bucket `portfolio-media` for gallery photos/videos and the
  profile photo. Public read, authenticated-only write.

## Security changes
- `projects`, `subprojects`, `researches`: dropped the anon insert/update/
  delete policies; write access is now `authenticated` only. Public SELECT
  is unchanged so the site keeps working for visitors.
- `gallery_photos`, `site_settings`: public SELECT, authenticated-only
  writes, same pattern.
*/

-- gallery_photos
CREATE TABLE IF NOT EXISTS gallery_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL,
  caption text,
  media_url text NOT NULL,
  media_type text NOT NULL DEFAULT 'image',
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE gallery_photos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_select_gallery_photos" ON gallery_photos;
CREATE POLICY "public_select_gallery_photos" ON gallery_photos FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "auth_insert_gallery_photos" ON gallery_photos;
CREATE POLICY "auth_insert_gallery_photos" ON gallery_photos FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_gallery_photos" ON gallery_photos;
CREATE POLICY "auth_update_gallery_photos" ON gallery_photos FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_gallery_photos" ON gallery_photos;
CREATE POLICY "auth_delete_gallery_photos" ON gallery_photos FOR DELETE
  TO authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_gallery_photos_category ON gallery_photos (category, sort_order);

-- site_settings
CREATE TABLE IF NOT EXISTS site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value text,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_select_site_settings" ON site_settings;
CREATE POLICY "public_select_site_settings" ON site_settings FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "auth_insert_site_settings" ON site_settings;
CREATE POLICY "auth_insert_site_settings" ON site_settings FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_site_settings" ON site_settings;
CREATE POLICY "auth_update_site_settings" ON site_settings FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_site_settings" ON site_settings;
CREATE POLICY "auth_delete_site_settings" ON site_settings FOR DELETE
  TO authenticated USING (true);

INSERT INTO site_settings (key, value)
VALUES ('profile_photo_url', NULL)
ON CONFLICT (key) DO NOTHING;

-- Storage bucket for gallery + profile media
INSERT INTO storage.buckets (id, name, public)
VALUES ('portfolio-media', 'portfolio-media', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "public_read_portfolio_media" ON storage.objects;
CREATE POLICY "public_read_portfolio_media" ON storage.objects FOR SELECT
  TO anon, authenticated USING (bucket_id = 'portfolio-media');

DROP POLICY IF EXISTS "auth_insert_portfolio_media" ON storage.objects;
CREATE POLICY "auth_insert_portfolio_media" ON storage.objects FOR INSERT
  TO authenticated WITH CHECK (bucket_id = 'portfolio-media');

DROP POLICY IF EXISTS "auth_update_portfolio_media" ON storage.objects;
CREATE POLICY "auth_update_portfolio_media" ON storage.objects FOR UPDATE
  TO authenticated USING (bucket_id = 'portfolio-media') WITH CHECK (bucket_id = 'portfolio-media');

DROP POLICY IF EXISTS "auth_delete_portfolio_media" ON storage.objects;
CREATE POLICY "auth_delete_portfolio_media" ON storage.objects FOR DELETE
  TO authenticated USING (bucket_id = 'portfolio-media');

-- Lock down existing content tables to authenticated-only writes
DROP POLICY IF EXISTS "anon_insert_projects" ON projects;
DROP POLICY IF EXISTS "anon_update_projects" ON projects;
DROP POLICY IF EXISTS "anon_delete_projects" ON projects;
CREATE POLICY "auth_insert_projects" ON projects FOR INSERT
  TO authenticated WITH CHECK (true);
CREATE POLICY "auth_update_projects" ON projects FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_delete_projects" ON projects FOR DELETE
  TO authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_subprojects" ON subprojects;
DROP POLICY IF EXISTS "anon_update_subprojects" ON subprojects;
DROP POLICY IF EXISTS "anon_delete_subprojects" ON subprojects;
CREATE POLICY "auth_insert_subprojects" ON subprojects FOR INSERT
  TO authenticated WITH CHECK (true);
CREATE POLICY "auth_update_subprojects" ON subprojects FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_delete_subprojects" ON subprojects FOR DELETE
  TO authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_researches" ON researches;
DROP POLICY IF EXISTS "anon_update_researches" ON researches;
DROP POLICY IF EXISTS "anon_delete_researches" ON researches;
CREATE POLICY "auth_insert_researches" ON researches FOR INSERT
  TO authenticated WITH CHECK (true);
CREATE POLICY "auth_update_researches" ON researches FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_delete_researches" ON researches FOR DELETE
  TO authenticated USING (true);

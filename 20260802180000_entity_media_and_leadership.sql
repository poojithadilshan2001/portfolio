/*
# Multi-photo support with a chosen cover (+ still-pending leadership table)

## Overview
Generalizes the single `image_url` field on projects, subprojects,
certifications, and leadership into a proper one-to-many photo gallery per
item, each with a chosen "cover" photo shown on the site. Clicking the cover
on the live site opens a lightbox showing every photo for that item.

One polymorphic table (`entity_media`) covers all four entity types instead
of four near-identical tables, since they share the exact same shape.

Also creates the `leadership` table, in case the earlier migration for it
was never run — this file is safe to run either way.

## New Tables

1. `leadership` (created only if missing)
2. `entity_media`
   - `entity_type` (text) — 'project' | 'subproject' | 'certification' | 'leadership'
   - `entity_id` (uuid) — id of the row in the corresponding table
   - `media_url`, `caption`, `is_cover`, `sort_order`

## Data migration
Existing `image_url` values on projects/subprojects/certifications/leadership
are copied into `entity_media` as each item's initial cover photo.
*/

-- ============================================================
-- leadership (safe to re-run if already created)
-- ============================================================

CREATE TABLE IF NOT EXISTS leadership (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role text NOT NULL,
  org text,
  period text,
  image_url text,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE leadership ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_select_leadership" ON leadership;
CREATE POLICY "public_select_leadership" ON leadership FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "auth_insert_leadership" ON leadership;
CREATE POLICY "auth_insert_leadership" ON leadership FOR INSERT
  TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_update_leadership" ON leadership;
CREATE POLICY "auth_update_leadership" ON leadership FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "auth_delete_leadership" ON leadership;
CREATE POLICY "auth_delete_leadership" ON leadership FOR DELETE
  TO authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_leadership_sort_order ON leadership (sort_order);

INSERT INTO leadership (role, org, period, sort_order) VALUES
('Head of Membership Development', 'IEEE UWU Student Branch — RAS Chapter', '2025 – 2026', 1),
('Project Chair — TechTalk', 'IEEE UWU Student Branch', '2025', 2),
('Team Lead, Logistics & Finance', 'Maze Masters 2025', '2025', 3),
('Member', 'UWU Music Circle & UWU Chess Team', 'Ongoing', 4)
ON CONFLICT DO NOTHING;

-- ============================================================
-- entity_media
-- ============================================================

CREATE TABLE IF NOT EXISTS entity_media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type text NOT NULL,
  entity_id uuid NOT NULL,
  media_url text NOT NULL,
  caption text,
  is_cover boolean NOT NULL DEFAULT false,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE entity_media ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_select_entity_media" ON entity_media;
CREATE POLICY "public_select_entity_media" ON entity_media FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "auth_insert_entity_media" ON entity_media;
CREATE POLICY "auth_insert_entity_media" ON entity_media FOR INSERT
  TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_update_entity_media" ON entity_media;
CREATE POLICY "auth_update_entity_media" ON entity_media FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "auth_delete_entity_media" ON entity_media;
CREATE POLICY "auth_delete_entity_media" ON entity_media FOR DELETE
  TO authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_entity_media_entity ON entity_media (entity_type, entity_id, sort_order);

-- ============================================================
-- Carry over existing single image_url values as each item's cover photo
-- ============================================================

INSERT INTO entity_media (entity_type, entity_id, media_url, is_cover, sort_order)
SELECT 'project', id, image_url, true, 0 FROM projects WHERE image_url IS NOT NULL
ON CONFLICT DO NOTHING;

INSERT INTO entity_media (entity_type, entity_id, media_url, is_cover, sort_order)
SELECT 'subproject', id, image_url, true, 0 FROM subprojects WHERE image_url IS NOT NULL
ON CONFLICT DO NOTHING;

INSERT INTO entity_media (entity_type, entity_id, media_url, is_cover, sort_order)
SELECT 'certification', id, image_url, true, 0 FROM certifications WHERE image_url IS NOT NULL
ON CONFLICT DO NOTHING;

INSERT INTO entity_media (entity_type, entity_id, media_url, is_cover, sort_order)
SELECT 'leadership', id, image_url, true, 0 FROM leadership WHERE image_url IS NOT NULL
ON CONFLICT DO NOTHING;

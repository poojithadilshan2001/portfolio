/*
# Create subprojects table

## Overview
Adds a `subprojects` table that stores individual project entries belonging to a parent
project category (e.g. "Length-Adjustable Miter Saw Work Desk" under "Mechanical & CAD").
Visitors see these as cards inside each expanded accordion section on the Projects page.

## New Tables

1. `subprojects`
   - `id` (uuid, primary key)
   - `project_id` (uuid, foreign key -> projects.id ON DELETE CASCADE)
   - `title` (text, not null) — sub-project name
   - `description` (text) — what it is / what it does
   - `image_url` (text, nullable) — optional image
   - `sort_order` (int, default 0) — display ordering within parent
   - `created_at` (timestamptz)

## Security
- RLS enabled on `subprojects`.
- Full anon+authenticated CRUD (public portfolio content, same as parent projects table).
*/

CREATE TABLE IF NOT EXISTS subprojects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  image_url text,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE subprojects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_subprojects" ON subprojects;
CREATE POLICY "anon_select_subprojects" ON subprojects FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_subprojects" ON subprojects;
CREATE POLICY "anon_insert_subprojects" ON subprojects FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_subprojects" ON subprojects;
CREATE POLICY "anon_update_subprojects" ON subprojects FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_subprojects" ON subprojects;
CREATE POLICY "anon_delete_subprojects" ON subprojects FOR DELETE
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_subprojects_project_id ON subprojects (project_id);
CREATE INDEX IF NOT EXISTS idx_subprojects_sort_order ON subprojects (project_id, sort_order);

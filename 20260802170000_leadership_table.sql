/*
# Leadership table

## Overview
Replaces the hardcoded "University Life & Leadership" array in data.ts with
an admin-manageable table, each entry with an optional photo uploaded via
/#admin (falls back to a generic icon when empty).

Seeded with the four existing leadership entries.
*/

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

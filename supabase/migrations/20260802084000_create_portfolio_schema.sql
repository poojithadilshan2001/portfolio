/*
# Create portfolio database schema

## Overview
Sets up the database tables for Poojitha Dilshan Jayathilaka's engineering portfolio website.
This is a single-tenant application with no sign-in screen, so content tables use public
anon+authenticated access. The contact_messages table allows visitors to submit messages
(INSERT only) while reads are restricted to authenticated users (the site owner via dashboard).

## New Tables

1. `projects`
   - Stores the 5 accordion project categories shown on the Projects page.
   - `id` (uuid, primary key)
   - `title` (text, not null) — e.g. "Mechanical & CAD"
   - `icon_name` (text) — lucide-react icon identifier
   - `overview` (text) — section overview paragraph
   - `areas` (text) — areas covered
   - `tools` (text) — tools & software (nullable)
   - `techniques` (text) — techniques & systems (nullable)
   - `featured` (text) — featured projects (nullable)
   - `languages` (text) — languages & frameworks (nullable)
   - `key_focus` (text) — key focus (nullable)
   - `sort_order` (int, default 0) — display ordering
   - `created_at` (timestamptz)

2. `researches`
   - Stores research project entries shown on the Researches page.
   - `id` (uuid, primary key)
   - `title` (text, not null) — e.g. "Modular Smart Electric Skateboard"
   - `period` (text) — e.g. "2025 - Present"
   - `description` (text) — project description
   - `hardware_architecture` (text) — hardware details
   - `software_integration` (text) — software details
   - `created_at` (timestamptz)

3. `contact_messages`
   - Stores messages submitted by visitors through the Contact form.
   - `id` (uuid, primary key)
   - `name` (text, not null) — sender name
   - `email` (text, not null) — sender email
   - `message` (text, not null) — message body
   - `is_read` (boolean, default false) — read tracking
   - `created_at` (timestamptz)

## Security
- RLS enabled on all tables.
- `projects` and `researches`: full anon+authenticated CRUD (public portfolio content).
- `contact_messages`: anon+authenticated INSERT only (visitors can submit); SELECT/UPDATE/DELETE
  restricted to authenticated (site owner reads/manages via Supabase dashboard).
*/

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  icon_name text,
  overview text,
  areas text,
  tools text,
  techniques text,
  featured text,
  languages text,
  key_focus text,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_projects" ON projects;
CREATE POLICY "anon_select_projects" ON projects FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_projects" ON projects;
CREATE POLICY "anon_insert_projects" ON projects FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_projects" ON projects;
CREATE POLICY "anon_update_projects" ON projects FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_projects" ON projects;
CREATE POLICY "anon_delete_projects" ON projects FOR DELETE
  TO anon, authenticated USING (true);

-- Researches table
CREATE TABLE IF NOT EXISTS researches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  period text,
  description text,
  hardware_architecture text,
  software_integration text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE researches ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_researches" ON researches;
CREATE POLICY "anon_select_researches" ON researches FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_researches" ON researches;
CREATE POLICY "anon_insert_researches" ON researches FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_researches" ON researches;
CREATE POLICY "anon_update_researches" ON researches FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_researches" ON researches;
CREATE POLICY "anon_delete_researches" ON researches FOR DELETE
  TO anon, authenticated USING (true);

-- Contact messages table
CREATE TABLE IF NOT EXISTS contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  message text NOT NULL,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_insert_contact_messages" ON contact_messages;
CREATE POLICY "anon_insert_contact_messages" ON contact_messages FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_select_contact_messages" ON contact_messages;
CREATE POLICY "auth_select_contact_messages" ON contact_messages FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "auth_update_contact_messages" ON contact_messages;
CREATE POLICY "auth_update_contact_messages" ON contact_messages FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_contact_messages" ON contact_messages;
CREATE POLICY "auth_delete_contact_messages" ON contact_messages FOR DELETE
  TO authenticated USING (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_projects_sort_order ON projects (sort_order);
CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at ON contact_messages (created_at DESC);

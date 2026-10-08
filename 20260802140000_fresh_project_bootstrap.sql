/*
# Fresh project bootstrap — run this once on a brand-new Supabase project

## Overview
Use this single file when moving the portfolio to a new Supabase project
(e.g. because you don't have dashboard access to the original one Bolt.new
created). It creates every table this app needs, locks write access down to
authenticated users only from the start, and re-seeds all the real content
that previously lived only in the old project's live database (it was never
captured in seed files, only inserted directly).

Run the whole file once in the new project's SQL Editor
(Project > SQL Editor > New query), then update your local `.env` with the
new project's URL and anon key from Project Settings > API.
*/

-- ============================================================
-- Tables
-- ============================================================

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

CREATE TABLE IF NOT EXISTS subprojects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  image_url text,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS researches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  period text,
  description text,
  hardware_architecture text,
  software_integration text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  message text NOT NULL,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS gallery_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL,
  caption text,
  media_url text NOT NULL,
  media_type text NOT NULL DEFAULT 'image',
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value text,
  updated_at timestamptz DEFAULT now()
);

-- ============================================================
-- RLS — public read, authenticated-only writes (owner logs in via /#admin)
-- ============================================================

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE subprojects ENABLE ROW LEVEL SECURITY;
ALTER TABLE researches ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_select_projects" ON projects;
CREATE POLICY "public_select_projects" ON projects FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "auth_insert_projects" ON projects;
CREATE POLICY "auth_insert_projects" ON projects FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_update_projects" ON projects;
CREATE POLICY "auth_update_projects" ON projects FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "auth_delete_projects" ON projects;
CREATE POLICY "auth_delete_projects" ON projects FOR DELETE TO authenticated USING (true);

DROP POLICY IF EXISTS "public_select_subprojects" ON subprojects;
CREATE POLICY "public_select_subprojects" ON subprojects FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "auth_insert_subprojects" ON subprojects;
CREATE POLICY "auth_insert_subprojects" ON subprojects FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_update_subprojects" ON subprojects;
CREATE POLICY "auth_update_subprojects" ON subprojects FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "auth_delete_subprojects" ON subprojects;
CREATE POLICY "auth_delete_subprojects" ON subprojects FOR DELETE TO authenticated USING (true);

DROP POLICY IF EXISTS "public_select_researches" ON researches;
CREATE POLICY "public_select_researches" ON researches FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "auth_insert_researches" ON researches;
CREATE POLICY "auth_insert_researches" ON researches FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_update_researches" ON researches;
CREATE POLICY "auth_update_researches" ON researches FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "auth_delete_researches" ON researches;
CREATE POLICY "auth_delete_researches" ON researches FOR DELETE TO authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_contact_messages" ON contact_messages;
CREATE POLICY "anon_insert_contact_messages" ON contact_messages FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_select_contact_messages" ON contact_messages;
CREATE POLICY "auth_select_contact_messages" ON contact_messages FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "auth_update_contact_messages" ON contact_messages;
CREATE POLICY "auth_update_contact_messages" ON contact_messages FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "auth_delete_contact_messages" ON contact_messages;
CREATE POLICY "auth_delete_contact_messages" ON contact_messages FOR DELETE TO authenticated USING (true);

DROP POLICY IF EXISTS "public_select_gallery_photos" ON gallery_photos;
CREATE POLICY "public_select_gallery_photos" ON gallery_photos FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "auth_insert_gallery_photos" ON gallery_photos;
CREATE POLICY "auth_insert_gallery_photos" ON gallery_photos FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_update_gallery_photos" ON gallery_photos;
CREATE POLICY "auth_update_gallery_photos" ON gallery_photos FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "auth_delete_gallery_photos" ON gallery_photos;
CREATE POLICY "auth_delete_gallery_photos" ON gallery_photos FOR DELETE TO authenticated USING (true);

DROP POLICY IF EXISTS "public_select_site_settings" ON site_settings;
CREATE POLICY "public_select_site_settings" ON site_settings FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "auth_insert_site_settings" ON site_settings;
CREATE POLICY "auth_insert_site_settings" ON site_settings FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_update_site_settings" ON site_settings;
CREATE POLICY "auth_update_site_settings" ON site_settings FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "auth_delete_site_settings" ON site_settings;
CREATE POLICY "auth_delete_site_settings" ON site_settings FOR DELETE TO authenticated USING (true);

-- ============================================================
-- Storage bucket for gallery + profile media
-- ============================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('portfolio-media', 'portfolio-media', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "public_read_portfolio_media" ON storage.objects;
CREATE POLICY "public_read_portfolio_media" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'portfolio-media');
DROP POLICY IF EXISTS "auth_insert_portfolio_media" ON storage.objects;
CREATE POLICY "auth_insert_portfolio_media" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'portfolio-media');
DROP POLICY IF EXISTS "auth_update_portfolio_media" ON storage.objects;
CREATE POLICY "auth_update_portfolio_media" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'portfolio-media') WITH CHECK (bucket_id = 'portfolio-media');
DROP POLICY IF EXISTS "auth_delete_portfolio_media" ON storage.objects;
CREATE POLICY "auth_delete_portfolio_media" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'portfolio-media');

-- ============================================================
-- Indexes
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_projects_sort_order ON projects (sort_order);
CREATE INDEX IF NOT EXISTS idx_subprojects_project_id ON subprojects (project_id);
CREATE INDEX IF NOT EXISTS idx_subprojects_sort_order ON subprojects (project_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at ON contact_messages (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_gallery_photos_category ON gallery_photos (category, sort_order);

-- ============================================================
-- Seed data — carried over from the original live project
-- ============================================================

INSERT INTO projects (id, title, icon_name, overview, areas, tools, techniques, featured, languages, key_focus, sort_order) VALUES
('f7126685-e0bf-4f4c-863d-dfee8ebbca85', 'Mechanical & CAD', 'Wrench',
 'Transforming theoretical kinematics and mechanical concepts into physical, manufacturable hardware.',
 '3D modeling, 2D fabrication-ready drafting, parametric assemblies, structural safety validation, and hands-on workshop fabrication.',
 'SolidWorks (Weldments, FEA, Motion Simulation), AutoCAD, CNC Machining, FDM/SLA 3D Printing, and steel welding.',
 NULL,
 'Length-Adjustable Miter Saw Work Desk, Slider-Crank Generator, Industrial Oven for Drying Coconut Dust, Plastic Injection Molding Machine, Bucket Conveyor System, Tomato Sorting Machine, and Single Storey Council Architectural Drawing.',
 NULL, NULL, 2),
('f2772266-9137-4c08-9954-f14e306556ad', 'Production Management', 'Factory',
 'Applying industrial engineering principles to optimize factory floor workflows, oversee production pipelines, and ensure manufacturing precision. Expanding this hands-on experience through a Production Engineering Internship at Alumex PLC.',
 'Production line management, Lean manufacturing, Kaizen practices, quality assurance, and integrating design with manufacturing constraints.',
 NULL,
 'Managing industrial workflows and applying Process Capability Index (Cpk) principles.',
 NULL, NULL, NULL, 3),
('d8acf595-90b9-48af-bfe8-6a8edfccafd7', 'IoT & Embedded Systems', 'CircuitBoard',
 'Designing custom circuits and integrating smart electronics into mechanical frameworks to build automated, responsive systems.',
 'PCB schematic layout, routing, component sourcing, hand-soldering, and hardware debugging.',
 'Proteus (PCB Design), ESP32, Arduino, and VESC motor controllers.',
 NULL,
 'Music-Reactive LED Lighting System on a custom etched copper board.',
 NULL, NULL, 4),
('3b868c48-76b3-4219-9ba6-0ee2407ce4e6', 'Software & Programming', 'Code2',
 'Developing user-facing applications and scripting custom software to interface with mechatronic systems and track real-time hardware data.',
 'Cross-platform mobile application development, UI design, and real-time data visualization (telemetry, speed, and tilt tracking).',
 NULL, NULL, NULL,
 'Flutter, Python, and C/C++.', NULL, 5)
ON CONFLICT (id) DO NOTHING;

INSERT INTO subprojects (id, project_id, title, description, sort_order) VALUES
('42d3dd6d-c152-4ef5-9655-a994b58d2dfc', 'f7126685-e0bf-4f4c-863d-dfee8ebbca85', 'Length-Adjustable Miter Saw Work Desk', 'A height- and length-adjustable work desk designed for miter saw operations, improving ergonomics and material support across varying workpiece sizes.', 1),
('edd3b0d1-8c6f-4121-80f2-4d3e2149030a', 'f7126685-e0bf-4f4c-863d-dfee8ebbca85', 'Slider-Crank Generator', 'A mechanical slider-crank mechanism coupled to a generator to convert linear reciprocating motion into electrical energy.', 2),
('796df34e-3419-42a3-ba3e-10daaa811be3', 'f7126685-e0bf-4f4c-863d-dfee8ebbca85', 'Industrial Oven for Drying Coconut Dust', 'Designed the structural frame using SolidWorks weldment with box bar sections for industrial-scale drying; produced detailed part models, full assembly, and manufacturing-ready fabrication drawings.', 3),
('bff8e37f-2132-445d-9197-6c11831dfe95', 'f7126685-e0bf-4f4c-863d-dfee8ebbca85', 'Plastic Injection Molding Machine', 'Modeled the complete machine assembly with precise component detailing and part relationships in SolidWorks.', 5),
('3c1a0e5e-27ad-498e-b7eb-d3de7e00a01f', 'f7126685-e0bf-4f4c-863d-dfee8ebbca85', 'Bucket Conveyor System', 'Designed a full bucket conveyor assembly including structural frame, drive components, and bucket arrangement.', 6),
('c4a3d24b-a0af-482a-bb5a-922f52c5f651', 'f7126685-e0bf-4f4c-863d-dfee8ebbca85', 'Tomato Sorting Machine', 'Designed an automated tomato sorting conveyor system, modeling the mechanical structure and sorting mechanism.', 7),
('8485f95c-5a59-46c6-9eb9-9181a79451f4', 'f7126685-e0bf-4f4c-863d-dfee8ebbca85', 'Single Storey Council Architectural Drawing', 'Produced floor plan and site plan to council standards in AutoCAD, including all building services, correct wall thickness, and plotting standards.', 8),
('df4bdf99-484f-449f-9cd5-206b7c93587b', 'd8acf595-90b9-48af-bfe8-6a8edfccafd7', 'Music-Reactive LED Lighting System', 'A custom-etched copper PCB driving LED arrays that react to audio frequency input in real time.', 1),
('1ccca932-7ec0-465d-8a4b-ae61052e4bb6', 'd8acf595-90b9-48af-bfe8-6a8edfccafd7', 'ESP32 Wireless Remote Control', 'A custom wireless remote built on ESP32 for throttle and braking control of the electric skateboard.', 2),
('1df30de9-3ac3-4331-bd42-8bf088baa88a', '3b868c48-76b3-4219-9ba6-0ee2407ce4e6', 'Skateboard Telemetry App', 'A Flutter cross-platform app displaying real-time speed, tilt angle, and ride metrics streamed from the skateboard ESP32.', 1)
ON CONFLICT (id) DO NOTHING;

INSERT INTO researches (id, title, period, description, hardware_architecture, software_integration) VALUES
('d300d6d3-2440-42f7-a4f4-dffd9900dd3d', 'Modular Smart Electric Skateboard', '2025 - Present',
 'Designing, developing, and physically building a modular electric skateboard featuring three riding modes: standard, adjustable handle, and handle with seat.',
 'Integration of electric dual hub motors, VESC controllers, an ESP32 microcontroller, and a custom-built wireless remote control for throttle and braking.',
 'Developing performance monitoring software and an onboard visualization display to track real-time speed, tilt angle, and key ride metrics.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO site_settings (key, value) VALUES ('profile_photo_url', NULL)
ON CONFLICT (key) DO NOTHING;

-- DESMEN startup projects table

CREATE TABLE IF NOT EXISTS desmen_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE desmen_projects ENABLE ROW LEVEL SECURITY;

-- Anyone can read
CREATE POLICY "desmen_projects_public_read" ON desmen_projects
  FOR SELECT USING (true);

-- Only authenticated users can write
CREATE POLICY "desmen_projects_auth_insert" ON desmen_projects
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "desmen_projects_auth_update" ON desmen_projects
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "desmen_projects_auth_delete" ON desmen_projects
  FOR DELETE USING (auth.role() = 'authenticated');

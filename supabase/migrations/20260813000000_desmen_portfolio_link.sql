-- Link DESMEN projects to a portfolio category so they appear in the Projects page
ALTER TABLE desmen_projects
  ADD COLUMN IF NOT EXISTS portfolio_project_id uuid REFERENCES projects(id) ON DELETE SET NULL;

-- Add richer fields to DESMEN projects

ALTER TABLE desmen_projects
  ADD COLUMN IF NOT EXISTS our_role     text,
  ADD COLUMN IF NOT EXISTS technologies text,
  ADD COLUMN IF NOT EXISTS project_type text DEFAULT 'Engineering Project';

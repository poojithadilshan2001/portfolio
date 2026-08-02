-- Add sort_order to researches table for admin ordering support
ALTER TABLE researches ADD COLUMN IF NOT EXISTS sort_order int NOT NULL DEFAULT 0;

-- Initialize sort_order based on creation order
WITH ordered AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at ASC) - 1 AS rn
  FROM researches
)
UPDATE researches SET sort_order = ordered.rn FROM ordered WHERE researches.id = ordered.id;

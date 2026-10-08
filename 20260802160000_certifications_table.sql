/*
# Certifications table

## Overview
Replaces the hardcoded certification name chips in the site's data.ts with a
real, admin-manageable table — each certification gets its own thumbnail
image (uploaded via /#admin), issuer, issue date, and credential ID, matching
what's shown on LinkedIn.

Seeded with the six real certifications the owner provided.
*/

CREATE TABLE IF NOT EXISTS certifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  issuer text,
  issued_date text,
  credential_id text,
  credential_url text,
  image_url text,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE certifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_select_certifications" ON certifications;
CREATE POLICY "public_select_certifications" ON certifications FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "auth_insert_certifications" ON certifications;
CREATE POLICY "auth_insert_certifications" ON certifications FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_certifications" ON certifications;
CREATE POLICY "auth_update_certifications" ON certifications FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_certifications" ON certifications;
CREATE POLICY "auth_delete_certifications" ON certifications FOR DELETE
  TO authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_certifications_sort_order ON certifications (sort_order);

INSERT INTO certifications (title, issuer, issued_date, credential_id, sort_order) VALUES
('SolidWorks: Basic to Industrial Level Certification', 'Udemy', 'Nov 2025', 'UC-86d90360-ef27-4d1d-931a-16721d9b4802', 1),
('Professional Certificate in Project and Process Management', 'Udemy', 'Sep 2025', 'UC-b8c3ef38-0fd9-4d77-91b5-7d37a9922dd5', 2),
('Lean & Quality Management, Six Sigma, Continuous Improvement', 'Udemy', 'Nov 2025', 'UC-058769db-4731-43f0-a972-0b7545794054', 3),
('Professional Certificate in Marketing and Advertising', 'Udemy', 'Sep 2025', 'UC-5628fb98-8377-4a88-a163-c4f44c3bfa4a', 4),
('Foundations of Project Management', 'University of Moratuwa', 'Jan 2025', 's40vpx4zem', 5),
('Python for Beginners', 'University of Moratuwa', 'Sep 2022', 'Dqrlp8SQNE', 6)
ON CONFLICT DO NOTHING;

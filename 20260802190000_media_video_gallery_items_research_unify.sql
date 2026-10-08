/*
# Video support, gallery items, and unifying research under entity_media

## Overview
1. Adds `media_type` to `entity_media` so any photo slot (projects,
   subprojects, certifications, leadership, gallery, research) can also hold
   a short video, consistent with how research/gallery already worked.
2. Introduces `gallery_items` — the IEEE/Sports/Music gallery becomes a set
   of titled items (like sub-projects) instead of a flat photo list, each
   with its own cover + full photo/video set managed the same way as
   everything else. Existing `gallery_photos` rows are migrated over
   (safe to re-run — skips if gallery_items already has data).
3. Migrates existing `research_media` rows into `entity_media` so research
   uses the same shared cover/reorder/video system as everything else
   (safe to re-run — skips rows already migrated).
*/

ALTER TABLE entity_media ADD COLUMN IF NOT EXISTS media_type text NOT NULL DEFAULT 'image';

-- ============================================================
-- gallery_items
-- ============================================================

CREATE TABLE IF NOT EXISTS gallery_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL,
  title text NOT NULL,
  description text,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE gallery_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_select_gallery_items" ON gallery_items;
CREATE POLICY "public_select_gallery_items" ON gallery_items FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "auth_insert_gallery_items" ON gallery_items;
CREATE POLICY "auth_insert_gallery_items" ON gallery_items FOR INSERT
  TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_update_gallery_items" ON gallery_items;
CREATE POLICY "auth_update_gallery_items" ON gallery_items FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "auth_delete_gallery_items" ON gallery_items;
CREATE POLICY "auth_delete_gallery_items" ON gallery_items FOR DELETE
  TO authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_gallery_items_category ON gallery_items (category, sort_order);

DO $$
DECLARE
  gp RECORD;
  new_id uuid;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM gallery_items) AND EXISTS (SELECT 1 FROM gallery_photos) THEN
    FOR gp IN SELECT * FROM gallery_photos ORDER BY category, sort_order LOOP
      INSERT INTO gallery_items (category, title, sort_order)
      VALUES (gp.category, COALESCE(NULLIF(gp.caption, ''), 'Photo'), gp.sort_order)
      RETURNING id INTO new_id;

      INSERT INTO entity_media (entity_type, entity_id, media_url, media_type, caption, is_cover, sort_order)
      VALUES ('gallery_item', new_id, gp.media_url, gp.media_type, gp.caption, true, 0);
    END LOOP;
  END IF;
END $$;

-- ============================================================
-- Migrate research_media -> entity_media (entity_type = 'research')
-- ============================================================

INSERT INTO entity_media (entity_type, entity_id, media_url, media_type, caption, is_cover, sort_order)
SELECT 'research', rm.research_id, rm.media_url, rm.media_type, rm.caption, (rm.sort_order = 0), rm.sort_order
FROM research_media rm
WHERE NOT EXISTS (
  SELECT 1 FROM entity_media em
  WHERE em.entity_type = 'research' AND em.entity_id = rm.research_id AND em.media_url = rm.media_url
);

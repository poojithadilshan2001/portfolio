-- Add is_cover to gallery_photos for cover selection per category
ALTER TABLE gallery_photos ADD COLUMN IF NOT EXISTS is_cover boolean NOT NULL DEFAULT false;

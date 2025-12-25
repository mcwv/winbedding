-- Migration: Add V3 Enrichment Columns
-- Description: Adds adams_description (text), reddit_morsels (jsonb), and ensures alternatives/related_tools exist.

-- 1. Adams Description (The "Don't Panic" Guide)
ALTER TABLE tools 
ADD COLUMN IF NOT EXISTS adams_description TEXT;

-- 2. Reddit Morsels (Social Proof / Quotes)
-- JSONB allows us to store an array of objects like { "quote": "...", "author": "...", "source": "..." }
ALTER TABLE tools 
ADD COLUMN IF NOT EXISTS reddit_morsels JSONB;

-- 3. Alternatives (Ensure it exists and is the correct type)
-- We use TEXT[] for a list of strings.
ALTER TABLE tools 
ADD COLUMN IF NOT EXISTS alternatives TEXT[];

-- 4. Related Tools (Ensure it exists, though we might prioritize Alternatives)
ALTER TABLE tools 
ADD COLUMN IF NOT EXISTS related_tools TEXT[];

-- 5. Force refresh the views to pick up new columns (if they did SELECT *)
-- Dropping and recreating is the safest way to ensure the view schema updates.
DROP VIEW IF EXISTS published_tools;

CREATE OR REPLACE VIEW published_tools AS
SELECT 
    t.*,
    c.name as category_name,
    c.slug as category_slug,
    c.icon as category_icon
FROM tools t
LEFT JOIN categories c ON t.category_id = c.id
WHERE t.is_published = TRUE
ORDER BY t.quality_score DESC, t.rating_value DESC;

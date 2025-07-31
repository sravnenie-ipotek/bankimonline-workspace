-- Phase 1.3: Categories and Indexes Migration
-- Sets proper categories and creates performance indexes
-- Author: System
-- Date: 2025-01-30

BEGIN;

-- Show current category distribution
SELECT 
    category,
    COUNT(*) as count
FROM content_items
WHERE screen_location LIKE 'mortgage_%' OR screen_location LIKE 'refinance_%'
GROUP BY category
ORDER BY count DESC;

-- Set category='form' for all mortgage & credit dropdown-related items
UPDATE content_items 
SET category = 'form'
WHERE (screen_location LIKE 'mortgage_%' OR screen_location LIKE 'refinance_%' OR screen_location LIKE 'credit_%')
  AND component_type IN ('dropdown', 'option', 'placeholder', 'label')
  AND (category IS NULL OR category != 'form');

-- Verify the update
SELECT 
    category,
    COUNT(*) as count,
    STRING_AGG(DISTINCT component_type, ', ' ORDER BY component_type) as component_types
FROM content_items
WHERE screen_location LIKE 'mortgage_%' OR screen_location LIKE 'refinance_%'
GROUP BY category
ORDER BY count DESC;

-- Create index for API performance
CREATE INDEX IF NOT EXISTS idx_screen_type ON content_items (screen_location, component_type);

-- Create additional indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_screen_category ON content_items (screen_location, category);
CREATE INDEX IF NOT EXISTS idx_content_key ON content_items (content_key);
CREATE INDEX IF NOT EXISTS idx_component_type ON content_items (component_type);

-- Show index creation results
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'content_items'
  AND indexname IN ('idx_screen_type', 'idx_screen_category', 'idx_content_key', 'idx_component_type')
ORDER BY indexname;

COMMIT;
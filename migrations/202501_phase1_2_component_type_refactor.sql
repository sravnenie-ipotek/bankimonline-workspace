-- Phase 1.2: Component Type Refactor Migration
-- Standardizes component types according to dropDownsInDBLogic rules
-- Author: System
-- Date: 2025-01-30

BEGIN;

-- Show current state
SELECT 
    component_type,
    COUNT(*) as count
FROM content_items
WHERE screen_location LIKE 'mortgage_%' OR screen_location LIKE 'refinance_%'
GROUP BY component_type
ORDER BY count DESC;

-- Refactor component types
UPDATE content_items
SET component_type = 'label'
WHERE component_type = 'field_label'
  AND (screen_location LIKE 'mortgage_%' OR screen_location LIKE 'refinance_%');

UPDATE content_items
SET component_type = 'placeholder'
WHERE component_type = 'field_placeholder'
  AND (screen_location LIKE 'mortgage_%' OR screen_location LIKE 'refinance_%');

UPDATE content_items
SET component_type = 'option'
WHERE component_type IN ('field_option', 'dropdown_option')
  AND (screen_location LIKE 'mortgage_%' OR screen_location LIKE 'refinance_%');

-- Verify the results
SELECT 
    component_type,
    COUNT(*) as count
FROM content_items
WHERE screen_location LIKE 'mortgage_%' OR screen_location LIKE 'refinance_%'
GROUP BY component_type
ORDER BY count DESC;

-- Check for any non-standard component types remaining
SELECT DISTINCT component_type 
FROM content_items
WHERE (screen_location LIKE 'mortgage_%' OR screen_location LIKE 'refinance_%')
  AND component_type NOT IN ('dropdown', 'option', 'placeholder', 'label', 'text', 'button', 'title', 'section_header', 'tooltip', 'hint', 'disclaimer', 'header', 'notice', 'unit')
ORDER BY component_type;

COMMIT;
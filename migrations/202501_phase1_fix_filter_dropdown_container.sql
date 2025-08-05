-- Add missing filter dropdown container for mortgage_step4
-- Author: System
-- Date: 2025-01-30

BEGIN;

-- Add filter dropdown container
INSERT INTO content_items (content_key, screen_location, component_type, category, value, language_code, status)
VALUES 
    ('mortgage_step4_filter', 'mortgage_step4', 'dropdown', 'form', 'Filter Programs', 'en', 'approved'),
    ('mortgage_step4_filter', 'mortgage_step4', 'dropdown', 'form', 'סנן תוכניות', 'he', 'approved'),
    ('mortgage_step4_filter', 'mortgage_step4', 'dropdown', 'form', 'Фильтр программ', 'ru', 'approved')
ON CONFLICT (content_key, language_code) DO NOTHING;

-- Verify the dropdown container was added
SELECT content_key, component_type, value, language_code
FROM content_items
WHERE screen_location = 'mortgage_step4' 
  AND content_key = 'mortgage_step4_filter'
ORDER BY language_code;

-- Verify we have both dropdown and options
SELECT 
    CASE 
        WHEN component_type = 'dropdown' THEN 'Container'
        WHEN component_type = 'option' THEN 'Option'
        ELSE component_type
    END as type,
    COUNT(*) as count
FROM content_items
WHERE screen_location = 'mortgage_step4' 
  AND content_key LIKE '%filter%'
GROUP BY component_type
ORDER BY type;

COMMIT;
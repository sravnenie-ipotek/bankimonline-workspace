-- Phase 1.4: Simple Integrity Checks
-- Runs validation queries without inserts
-- Author: System
-- Date: 2025-01-30

-- Integrity Check 1: Find duplicate keys
SELECT 
    content_key, 
    COUNT(*) as count,
    STRING_AGG(DISTINCT screen_location, ', ' ORDER BY screen_location) as screens
FROM content_items
WHERE screen_location LIKE 'mortgage_%' OR screen_location LIKE 'refinance_%'
GROUP BY content_key 
HAVING COUNT(*) > 1
ORDER BY count DESC, content_key
LIMIT 10;

-- Integrity Check 2: Summary of missing translations by screen
SELECT 
    screen_location,
    COUNT(*) as items_missing_translations
FROM (
    SELECT DISTINCT
        ci.screen_location,
        ci.id
    FROM content_items ci
    WHERE ci.screen_location IN ('cooperation', 'mortgage_step3', 'mortgage_step4', 
                                 'refinance_step1', 'refinance_step2', 'refinance_step3', 'refinance_step4')
        AND ci.is_active = true
        AND NOT EXISTS (
            SELECT 1 FROM content_translations ct 
            WHERE ct.content_item_id = ci.id 
                AND ct.status = 'approved'
                AND ct.language_code IN ('en', 'he', 'ru')
        )
) AS missing
GROUP BY screen_location
ORDER BY screen_location;

-- Integrity Check 3: Summary of dropdown structure
SELECT 
    screen_location,
    COUNT(CASE WHEN component_type = 'dropdown' THEN 1 END) as dropdown_count,
    COUNT(CASE WHEN component_type = 'option' THEN 1 END) as option_count,
    COUNT(CASE WHEN component_type = 'label' THEN 1 END) as label_count,
    COUNT(CASE WHEN component_type = 'placeholder' THEN 1 END) as placeholder_count,
    COUNT(*) as total_items
FROM content_items
WHERE screen_location LIKE 'mortgage_step%' OR screen_location LIKE 'refinance_%'
GROUP BY screen_location
ORDER BY screen_location;

-- Integrity Check 4: Categories overview
SELECT 
    category,
    COUNT(*) as count
FROM content_items
WHERE (screen_location LIKE 'mortgage_%' OR screen_location LIKE 'refinance_%')
GROUP BY category
ORDER BY count DESC
LIMIT 10;
-- Phase 1.4: Integrity Checks and Missing Dropdown Containers
-- Creates missing containers and runs validation queries
-- Author: System
-- Date: 2025-01-30

BEGIN;

-- Create missing dropdown container for bank in mortgage_step3
INSERT INTO content_items (screen_location, content_key, component_type, category, status, created_at, updated_at)
VALUES ('mortgage_step3', 'mortgage_step3.field.bank', 'dropdown', 'form', 'approved', NOW(), NOW())
ON CONFLICT (screen_location, content_key) DO NOTHING;

-- Also add label and placeholder for bank dropdown
INSERT INTO content_items (screen_location, content_key, component_type, category, status, created_at, updated_at)
VALUES 
  ('mortgage_step3', 'mortgage_step3.field.bank_label', 'label', 'form', 'approved', NOW(), NOW()),
  ('mortgage_step3', 'mortgage_step3.field.bank_ph', 'placeholder', 'form', 'approved', NOW(), NOW())
ON CONFLICT (screen_location, content_key) DO NOTHING;

-- Integrity Check 1: Find duplicate keys within same screen
SELECT 
    screen_location,
    content_key, 
    COUNT(*) as count
FROM content_items
WHERE screen_location LIKE 'mortgage_%' OR screen_location LIKE 'refinance_%'
GROUP BY screen_location, content_key 
HAVING COUNT(*) > 1
ORDER BY count DESC, screen_location, content_key;

-- Integrity Check 2: Find missing translations
SELECT 
    ci.screen_location,
    ci.content_key,
    ci.component_type,
    COALESCE(
        STRING_AGG(DISTINCT ct.language_code, ', ' ORDER BY ct.language_code),
        'NO TRANSLATIONS'
    ) as languages
FROM content_items ci
LEFT JOIN content_translations ct 
    ON ci.id = ct.content_item_id 
    AND ct.status = 'approved'
WHERE ci.screen_location LIKE 'mortgage_step%'
    AND ci.status = 'approved'
GROUP BY ci.screen_location, ci.content_key, ci.component_type
HAVING COUNT(DISTINCT ct.language_code) < 3 OR COUNT(ct.id) = 0
ORDER BY ci.screen_location, ci.component_type, ci.content_key
LIMIT 20;

-- Integrity Check 3: Find wrong component types
SELECT DISTINCT 
    component_type,
    COUNT(*) as count
FROM content_items
WHERE (screen_location LIKE 'mortgage_%' OR screen_location LIKE 'refinance_%')
  AND component_type NOT IN ('dropdown', 'option', 'placeholder', 'label', 'text', 'button', 
                             'title', 'section_header', 'tooltip', 'hint', 'disclaimer', 
                             'header', 'notice', 'unit', 'heading', 'help_text', 
                             'modal_subtitle', 'modal_title', 'progress_label', 
                             'section_title', 'subtitle', 'table_header')
GROUP BY component_type
ORDER BY count DESC;

-- Integrity Check 4: Check for NULL categories
SELECT 
    screen_location,
    component_type,
    COUNT(*) as count
FROM content_items
WHERE (screen_location LIKE 'mortgage_%' OR screen_location LIKE 'refinance_%')
  AND category IS NULL
GROUP BY screen_location, component_type
ORDER BY count DESC;

-- Summary of dropdown containers
SELECT 
    screen_location,
    COUNT(CASE WHEN component_type = 'dropdown' THEN 1 END) as dropdown_count,
    COUNT(CASE WHEN component_type = 'option' THEN 1 END) as option_count,
    COUNT(CASE WHEN component_type = 'label' THEN 1 END) as label_count,
    COUNT(CASE WHEN component_type = 'placeholder' THEN 1 END) as placeholder_count
FROM content_items
WHERE screen_location LIKE 'mortgage_step%'
GROUP BY screen_location
ORDER BY screen_location;

COMMIT;
-- Phase 1.4: Integrity Checks and Missing Dropdown Containers (Final)
-- Creates missing containers and runs validation queries
-- Author: System
-- Date: 2025-01-30

BEGIN;

-- Create missing dropdown container for bank in mortgage_step3
INSERT INTO content_items (screen_location, content_key, component_type, category, is_active, created_at, updated_at)
VALUES ('mortgage_step3', 'mortgage_step3.field.bank', 'dropdown', 'form', true, NOW(), NOW())
ON CONFLICT (content_key) DO NOTHING;

-- Also add label and placeholder for bank dropdown
INSERT INTO content_items (screen_location, content_key, component_type, category, is_active, created_at, updated_at)
VALUES 
  ('mortgage_step3', 'mortgage_step3.field.bank_label', 'label', 'form', true, NOW(), NOW()),
  ('mortgage_step3', 'mortgage_step3.field.bank_ph', 'placeholder', 'form', true, NOW(), NOW())
ON CONFLICT (content_key) DO NOTHING;

-- Add corresponding translations for the new items
INSERT INTO content_translations (content_item_id, language_code, translation_value, status, created_at, updated_at)
SELECT 
    ci.id,
    lang.code,
    CASE 
        WHEN ci.content_key = 'mortgage_step3.field.bank_label' THEN
            CASE 
                WHEN lang.code = 'en' THEN 'Bank'
                WHEN lang.code = 'he' THEN 'בנק'
                WHEN lang.code = 'ru' THEN 'Банк'
            END
        WHEN ci.content_key = 'mortgage_step3.field.bank_ph' THEN
            CASE 
                WHEN lang.code = 'en' THEN 'Select bank'
                WHEN lang.code = 'he' THEN 'בחר בנק'
                WHEN lang.code = 'ru' THEN 'Выберите банк'
            END
    END as translation_value,
    'approved',
    NOW(),
    NOW()
FROM content_items ci
CROSS JOIN (VALUES ('en'), ('he'), ('ru')) as lang(code)
WHERE ci.content_key IN ('mortgage_step3.field.bank_label', 'mortgage_step3.field.bank_ph')
  AND NOT EXISTS (
    SELECT 1 FROM content_translations ct 
    WHERE ct.content_item_id = ci.id AND ct.language_code = lang.code
  );

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

-- Integrity Check 2: Find missing translations (summary by screen)
SELECT 
    ci.screen_location,
    COUNT(DISTINCT ci.id) as total_items,
    COUNT(DISTINCT CASE WHEN ct.id IS NOT NULL THEN ci.id END) as items_with_translations,
    COUNT(DISTINCT ci.id) - COUNT(DISTINCT CASE WHEN ct.id IS NOT NULL THEN ci.id END) as items_missing_translations
FROM content_items ci
LEFT JOIN content_translations ct 
    ON ci.id = ct.content_item_id 
    AND ct.status = 'approved'
WHERE ci.screen_location LIKE 'mortgage_step%'
    AND ci.is_active = true
GROUP BY ci.screen_location
ORDER BY ci.screen_location;

-- Integrity Check 3: Count by component type
SELECT 
    component_type,
    COUNT(*) as count
FROM content_items
WHERE (screen_location LIKE 'mortgage_%' OR screen_location LIKE 'refinance_%')
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
ORDER BY count DESC
LIMIT 10;

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
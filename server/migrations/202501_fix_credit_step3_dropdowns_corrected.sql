-- Fix Credit Step 3 Dropdown Issues (Corrected Version)
-- Date: 2025-01-13
-- Author: Claude Code Specialist  
-- Purpose: Add missing professional field dropdown, fix field mappings, and resolve UI issues

BEGIN;

-- =========================================
-- 1. Add Missing Professional Field (Field of Activity) to credit_step3
-- =========================================

-- Copy field_of_activity content from mortgage_step3 to credit_step3 if not exists
-- This ensures consistency between screens and avoids duplication

-- First, add the missing field_of_activity dropdown for credit_step3
INSERT INTO content_items (
    content_key, 
    component_type, 
    screen_location, 
    category, 
    is_active, 
    created_at, 
    updated_at,
    migration_status
)
SELECT 
    REPLACE(content_key, 'mortgage_step3', 'credit_step3') as content_key,
    component_type,
    'credit_step3' as screen_location,
    category,
    is_active,
    NOW() as created_at,
    NOW() as updated_at,
    'migrate_20250113' as migration_status
FROM content_items 
WHERE screen_location = 'mortgage_step3' 
AND content_key LIKE '%field_of_activity%'
AND NOT EXISTS (
    SELECT 1 FROM content_items ci2 
    WHERE ci2.screen_location = 'credit_step3' 
    AND ci2.content_key = REPLACE(content_items.content_key, 'mortgage_step3', 'credit_step3')
);

-- Copy translations for the new content items
INSERT INTO content_translations (
    content_item_id, 
    language_code, 
    content_value, 
    status, 
    created_at, 
    updated_at
)
SELECT 
    ci_new.id as content_item_id,
    ct.language_code,
    ct.content_value,
    ct.status,
    NOW() as created_at,
    NOW() as updated_at
FROM content_items ci_old
JOIN content_translations ct ON ci_old.id = ct.content_item_id
JOIN content_items ci_new ON REPLACE(ci_old.content_key, 'mortgage_step3', 'credit_step3') = ci_new.content_key
WHERE ci_old.screen_location = 'mortgage_step3' 
AND ci_old.content_key LIKE '%field_of_activity%'
AND ci_new.screen_location = 'credit_step3'
AND NOT EXISTS (
    SELECT 1 FROM content_translations ct2
    WHERE ct2.content_item_id = ci_new.id
    AND ct2.language_code = ct.language_code
);

-- =========================================
-- 2. Fix Field Name Mappings - Add Professional Sphere Aliases  
-- =========================================

-- The FieldOfActivity component looks for 'professional_sphere' but we have 'field_of_activity'
-- Add alias content items with professional_sphere key that point to the same translations

-- Create professional_sphere aliases for field_of_activity content
INSERT INTO content_items (
    content_key, 
    component_type, 
    screen_location, 
    category, 
    is_active, 
    created_at, 
    updated_at,
    migration_status
)
SELECT 
    REPLACE(content_key, 'field_of_activity', 'professional_sphere') as content_key,
    component_type,
    screen_location,
    category,
    is_active,
    NOW() as created_at,
    NOW() as updated_at,
    'alias_20250113' as migration_status
FROM content_items 
WHERE screen_location = 'credit_step3' 
AND content_key LIKE '%field_of_activity%'
AND NOT EXISTS (
    SELECT 1 FROM content_items ci2 
    WHERE ci2.screen_location = 'credit_step3' 
    AND ci2.content_key = REPLACE(content_items.content_key, 'field_of_activity', 'professional_sphere')
);

-- Copy translations to professional_sphere aliases
INSERT INTO content_translations (
    content_item_id, 
    language_code, 
    content_value, 
    status, 
    created_at, 
    updated_at
)
SELECT 
    ci_new.id as content_item_id,
    ct.language_code,
    ct.content_value,
    ct.status,
    NOW() as created_at,
    NOW() as updated_at
FROM content_items ci_old
JOIN content_translations ct ON ci_old.id = ct.content_item_id
JOIN content_items ci_new ON REPLACE(ci_old.content_key, 'field_of_activity', 'professional_sphere') = ci_new.content_key
WHERE ci_old.screen_location = 'credit_step3' 
AND ci_old.content_key LIKE '%field_of_activity%'
AND ci_new.screen_location = 'credit_step3'
AND NOT EXISTS (
    SELECT 1 FROM content_translations ct2
    WHERE ct2.content_item_id = ci_new.id
    AND ct2.language_code = ct.language_code
);

-- =========================================
-- 3. Fix API Field Name Mapping for existing_debts vs obligations
-- =========================================

-- The Obligation component looks for 'existing_debts' but API returns 'obligations'
-- Add existing_debts aliases for obligations content

-- Create existing_debts aliases for obligations content
INSERT INTO content_items (
    content_key, 
    component_type, 
    screen_location, 
    category, 
    is_active, 
    created_at, 
    updated_at,
    migration_status
)
SELECT 
    REPLACE(content_key, 'obligations', 'existing_debts') as content_key,
    component_type,
    screen_location,
    category,
    is_active,
    NOW() as created_at,
    NOW() as updated_at,
    'alias_20250113' as migration_status
FROM content_items 
WHERE screen_location = 'credit_step3' 
AND content_key LIKE '%obligations%'
AND NOT EXISTS (
    SELECT 1 FROM content_items ci2 
    WHERE ci2.screen_location = 'credit_step3' 
    AND ci2.content_key = REPLACE(content_items.content_key, 'obligations', 'existing_debts')
);

-- Copy translations to existing_debts aliases
INSERT INTO content_translations (
    content_item_id, 
    language_code, 
    content_value, 
    status, 
    created_at, 
    updated_at
)
SELECT 
    ci_new.id as content_item_id,
    ct.language_code,
    ct.content_value,
    ct.status,
    NOW() as created_at,
    NOW() as updated_at
FROM content_items ci_old
JOIN content_translations ct ON ci_old.id = ct.content_item_id
JOIN content_items ci_new ON REPLACE(ci_old.content_key, 'obligations', 'existing_debts') = ci_new.content_key
WHERE ci_old.screen_location = 'credit_step3' 
AND ci_old.content_key LIKE '%obligations%'
AND ci_new.screen_location = 'credit_step3'
AND NOT EXISTS (
    SELECT 1 FROM content_translations ct2
    WHERE ct2.content_item_id = ci_new.id
    AND ct2.language_code = ct.language_code
);

-- =========================================
-- 4. Verification Queries
-- =========================================

-- Show credit_step3 dropdown summary
SELECT 
    'credit_step3 dropdowns summary' as info,
    COUNT(*) as total_items,
    COUNT(CASE WHEN content_key LIKE '%field_of_activity%' THEN 1 END) as field_of_activity_items,
    COUNT(CASE WHEN content_key LIKE '%professional_sphere%' THEN 1 END) as professional_sphere_items,
    COUNT(CASE WHEN content_key LIKE '%additional_income%' THEN 1 END) as additional_income_items,
    COUNT(CASE WHEN content_key LIKE '%main_source%' THEN 1 END) as main_source_items,
    COUNT(CASE WHEN content_key LIKE '%obligations%' THEN 1 END) as obligations_items,
    COUNT(CASE WHEN content_key LIKE '%existing_debts%' THEN 1 END) as existing_debts_items
FROM content_items 
WHERE screen_location = 'credit_step3' 
AND component_type IN ('dropdown', 'option', 'placeholder', 'label', 'dropdown_container', 'dropdown_option');

COMMIT;

-- Report completion
SELECT 
    'Migration completed successfully' as status,
    'Added missing professional field dropdown and fixed field name mappings' as details,
    NOW() as completed_at;
-- ========================================================================
-- Credit Step 4 Content Fix Migration (Production Ready)
-- ========================================================================
-- Purpose: Add missing credit_step4 content items without conflicts
-- Date: 2025-08-17
-- Author: System
-- 
-- This migration handles existing data properly
-- ========================================================================

BEGIN;

-- ========================================================================
-- STEP 1: Check what exists
-- ========================================================================
DO $$
DECLARE
    existing_count INTEGER;
    correct_keys_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO existing_count 
    FROM content_items 
    WHERE screen_location = 'credit_step4';
    
    SELECT COUNT(*) INTO correct_keys_count
    FROM content_items 
    WHERE screen_location = 'credit_step4' 
    AND content_key LIKE 'credit_%'
    AND content_key NOT LIKE 'calculate_credit_%';
    
    RAISE NOTICE 'Found % existing credit_step4 items', existing_count;
    RAISE NOTICE 'Found % correct credit_ keys', correct_keys_count;
    
    IF correct_keys_count > 0 THEN
        RAISE NOTICE 'Correct keys already exist - skipping insertion';
    END IF;
END $$;

-- ========================================================================
-- STEP 2: Insert missing credit_step4 content items (skip if exists)
-- ========================================================================
INSERT INTO content_items (
    content_key, 
    component_type, 
    category, 
    screen_location, 
    status, 
    is_active, 
    created_at, 
    updated_at
)
SELECT 
    content_key,
    component_type,
    category,
    screen_location,
    status,
    is_active,
    created_at,
    updated_at
FROM (VALUES
    ('credit_final', 'title', 'results', 'credit_step4', 'active', true, NOW(), NOW()),
    ('credit_warning', 'warning', 'results', 'credit_step4', 'active', true, NOW(), NOW())
) AS new_items(content_key, component_type, category, screen_location, status, is_active, created_at, updated_at)
WHERE NOT EXISTS (
    SELECT 1 FROM content_items ci 
    WHERE ci.content_key = new_items.content_key 
    AND ci.screen_location = 'credit_step4'
);

-- ========================================================================
-- STEP 3: Create translations for the new items
-- ========================================================================
INSERT INTO content_translations (
    content_item_id, 
    language_code, 
    content_value, 
    status, 
    created_at, 
    updated_at
)
SELECT 
    ci.id,
    lang.code,
    CASE 
        -- ENGLISH TRANSLATIONS
        WHEN ci.content_key = 'credit_final' AND lang.code = 'en' 
            THEN 'Credit Calculation Results'
        WHEN ci.content_key = 'credit_warning' AND lang.code = 'en' 
            THEN 'The displayed offers are preliminary and subject to final bank approval. Actual terms may vary based on your complete financial profile.'
            
        -- HEBREW TRANSLATIONS
        WHEN ci.content_key = 'credit_final' AND lang.code = 'he' 
            THEN 'סיכום בקשת אשראי'
        WHEN ci.content_key = 'credit_warning' AND lang.code = 'he' 
            THEN 'התוצאות המפורטות לעיל הן הערכה בלבד לבקשת אשראי ואינן מהוות התחייבות. לקבלת הצעות מחייבות מהבנקים, נדרש להשלים את תהליך הרישום.'
            
        -- RUSSIAN TRANSLATIONS
        WHEN ci.content_key = 'credit_final' AND lang.code = 'ru' 
            THEN 'Итоги заявки на кредит'
        WHEN ci.content_key = 'credit_warning' AND lang.code = 'ru' 
            THEN 'Приведенные выше результаты являются только оценкой заявки на кредит и не являются обязательством. Для получения обязывающих предложений от банков необходимо завершить процесс регистрации.'
    END AS content_value,
    'active',
    NOW(),
    NOW()
FROM content_items ci
CROSS JOIN (VALUES ('en'), ('he'), ('ru')) AS lang(code)
WHERE ci.screen_location = 'credit_step4'
    AND ci.content_key IN ('credit_final', 'credit_warning')
    AND NOT EXISTS (
        SELECT 1 FROM content_translations ct 
        WHERE ct.content_item_id = ci.id 
        AND ct.language_code = lang.code
    );

-- ========================================================================
-- STEP 4: Create or replace the view
-- ========================================================================
DROP VIEW IF EXISTS public.view_credit_step4 CASCADE;

CREATE VIEW public.view_credit_step4 AS
SELECT 
    ci.id AS content_item_id,
    ci.content_key,
    ci.component_type,
    ci.category,
    ci.screen_location,
    ct.language_code,
    ct.content_value,
    ci.status AS item_status,
    ct.status AS translation_status,
    ci.is_active,
    ci.created_at,
    ci.updated_at
FROM content_items ci
LEFT JOIN content_translations ct ON ci.id = ct.content_item_id
WHERE ci.screen_location = 'credit_step4' 
    AND ci.is_active = true
ORDER BY 
    ci.category,
    ci.component_type,
    ci.content_key,
    ct.language_code;

-- Grant permissions
ALTER VIEW public.view_credit_step4 OWNER TO postgres;
GRANT SELECT ON public.view_credit_step4 TO PUBLIC;

-- ========================================================================
-- STEP 5: Verification
-- ========================================================================
DO $$
DECLARE
    final_count INTEGER;
    credit_final_count INTEGER;
    credit_warning_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO final_count 
    FROM content_items 
    WHERE screen_location = 'credit_step4';
    
    SELECT COUNT(*) INTO credit_final_count
    FROM content_items 
    WHERE screen_location = 'credit_step4' 
    AND content_key = 'credit_final';
    
    SELECT COUNT(*) INTO credit_warning_count
    FROM content_items 
    WHERE screen_location = 'credit_step4' 
    AND content_key = 'credit_warning';
    
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Credit Step 4 Migration Complete:';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Total content items: %', final_count;
    RAISE NOTICE 'credit_final exists: %', CASE WHEN credit_final_count > 0 THEN 'YES' ELSE 'NO' END;
    RAISE NOTICE 'credit_warning exists: %', CASE WHEN credit_warning_count > 0 THEN 'YES' ELSE 'NO' END;
    RAISE NOTICE '========================================';
    
    IF credit_final_count = 0 OR credit_warning_count = 0 THEN
        RAISE WARNING 'Critical keys are missing!';
    ELSE
        RAISE NOTICE '✅ Migration successful - critical keys added';
    END IF;
END $$;

-- Show the critical content
SELECT 
    ci.content_key,
    ct.language_code,
    LEFT(ct.content_value, 60) || '...' as content_preview
FROM content_items ci
JOIN content_translations ct ON ci.id = ct.content_item_id
WHERE ci.screen_location = 'credit_step4'
    AND ci.content_key IN ('credit_final', 'credit_warning')
ORDER BY ci.content_key, ct.language_code;

COMMIT;

-- ========================================================================
-- SUCCESS MESSAGE
-- ========================================================================
-- Migration adds the critical credit_final and credit_warning keys
-- that the frontend FourthStepForm.tsx expects to find
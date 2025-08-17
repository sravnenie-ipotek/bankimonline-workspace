-- ========================================================================
-- Credit Step 4 Content Creation Migration
-- ========================================================================
-- Purpose: Create missing credit_step4 content in database
-- Date: 2025-01-17
-- Author: System
-- 
-- This migration:
-- 1. Creates credit_step4 content items with proper structure
-- 2. Adds translations for English, Hebrew, and Russian
-- 3. Creates database view for easy access
-- 4. Ensures no regression by checking existing data first
-- ========================================================================

BEGIN;

-- ========================================================================
-- STEP 1: Safety Check - Backup existing data if any
-- ========================================================================
CREATE TEMP TABLE IF NOT EXISTS credit_step4_backup AS
SELECT * FROM content_items WHERE screen_location = 'credit_step4';

CREATE TEMP TABLE IF NOT EXISTS credit_step4_translations_backup AS
SELECT ct.* 
FROM content_translations ct
JOIN content_items ci ON ct.content_item_id = ci.id
WHERE ci.screen_location = 'credit_step4';

-- Log existing data count for rollback verification
DO $$
DECLARE
    existing_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO existing_count 
    FROM content_items 
    WHERE screen_location = 'credit_step4';
    
    IF existing_count > 0 THEN
        RAISE NOTICE 'Found % existing credit_step4 items - will preserve them', existing_count;
    ELSE
        RAISE NOTICE 'No existing credit_step4 items found - safe to create new ones';
    END IF;
END $$;

-- ========================================================================
-- STEP 2: Create credit_step4 content items
-- ========================================================================
-- Using ON CONFLICT to prevent duplicates and ensure idempotency
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
VALUES
    -- Main title and subtitle
    ('credit_step4_title', 'title', 'header', 'credit_step4', 'active', true, NOW(), NOW()),
    ('credit_step4_subtitle', 'subtitle', 'header', 'credit_step4', 'active', true, NOW(), NOW()),
    
    -- Final calculation display
    ('credit_final', 'title', 'results', 'credit_step4', 'active', true, NOW(), NOW()),
    ('credit_warning', 'warning', 'results', 'credit_step4', 'active', true, NOW(), NOW()),
    
    -- User information section
    ('credit_step4_user_info_title', 'title', 'user_info', 'credit_step4', 'active', true, NOW(), NOW()),
    ('credit_step4_name_label', 'label', 'user_info', 'credit_step4', 'active', true, NOW(), NOW()),
    ('credit_step4_phone_label', 'label', 'user_info', 'credit_step4', 'active', true, NOW(), NOW()),
    ('credit_step4_amount_label', 'label', 'user_info', 'credit_step4', 'active', true, NOW(), NOW()),
    
    -- Filter section
    ('credit_step4_filter_title', 'title', 'filter', 'credit_step4', 'active', true, NOW(), NOW()),
    ('credit_step4_filter_all', 'option', 'filter', 'credit_step4', 'active', true, NOW(), NOW()),
    ('credit_step4_filter_banks', 'option', 'filter', 'credit_step4', 'active', true, NOW(), NOW()),
    ('credit_step4_filter_insurance', 'option', 'filter', 'credit_step4', 'active', true, NOW(), NOW()),
    
    -- Bank offers section
    ('credit_step4_offers_title', 'title', 'offers', 'credit_step4', 'active', true, NOW(), NOW()),
    ('credit_step4_no_offers', 'message', 'offers', 'credit_step4', 'active', true, NOW(), NOW()),
    ('credit_step4_loading', 'message', 'offers', 'credit_step4', 'active', true, NOW(), NOW()),
    
    -- Action buttons
    ('credit_step4_back_button', 'button', 'navigation', 'credit_step4', 'active', true, NOW(), NOW()),
    ('credit_step4_submit_button', 'button', 'navigation', 'credit_step4', 'active', true, NOW(), NOW()),
    ('credit_step4_compare_button', 'button', 'actions', 'credit_step4', 'active', true, NOW(), NOW())
ON CONFLICT (content_key) DO UPDATE 
SET 
    updated_at = NOW(),
    -- Preserve existing active status if record exists
    is_active = COALESCE(content_items.is_active, EXCLUDED.is_active);

-- ========================================================================
-- STEP 3: Create translations for all languages
-- ========================================================================
-- Get the IDs and create translations
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
        WHEN ci.content_key = 'credit_step4_title' AND lang.code = 'en' 
            THEN 'Credit Application - Step 4'
        WHEN ci.content_key = 'credit_step4_subtitle' AND lang.code = 'en' 
            THEN 'Review and Submit Your Application'
        WHEN ci.content_key = 'credit_final' AND lang.code = 'en' 
            THEN 'Credit Calculation Results'
        WHEN ci.content_key = 'credit_warning' AND lang.code = 'en' 
            THEN 'The displayed offers are preliminary and subject to final bank approval. Actual terms may vary based on your complete financial profile.'
        WHEN ci.content_key = 'credit_step4_user_info_title' AND lang.code = 'en' 
            THEN 'Your Information'
        WHEN ci.content_key = 'credit_step4_name_label' AND lang.code = 'en' 
            THEN 'Name'
        WHEN ci.content_key = 'credit_step4_phone_label' AND lang.code = 'en' 
            THEN 'Phone'
        WHEN ci.content_key = 'credit_step4_amount_label' AND lang.code = 'en' 
            THEN 'Loan Amount'
        WHEN ci.content_key = 'credit_step4_filter_title' AND lang.code = 'en' 
            THEN 'Filter Offers'
        WHEN ci.content_key = 'credit_step4_filter_all' AND lang.code = 'en' 
            THEN 'All Offers'
        WHEN ci.content_key = 'credit_step4_filter_banks' AND lang.code = 'en' 
            THEN 'Banks Only'
        WHEN ci.content_key = 'credit_step4_filter_insurance' AND lang.code = 'en' 
            THEN 'Insurance Companies'
        WHEN ci.content_key = 'credit_step4_offers_title' AND lang.code = 'en' 
            THEN 'Available Credit Offers'
        WHEN ci.content_key = 'credit_step4_no_offers' AND lang.code = 'en' 
            THEN 'No offers available at this time. Please try adjusting your criteria.'
        WHEN ci.content_key = 'credit_step4_loading' AND lang.code = 'en' 
            THEN 'Loading offers...'
        WHEN ci.content_key = 'credit_step4_back_button' AND lang.code = 'en' 
            THEN 'Back'
        WHEN ci.content_key = 'credit_step4_submit_button' AND lang.code = 'en' 
            THEN 'Submit Application'
        WHEN ci.content_key = 'credit_step4_compare_button' AND lang.code = 'en' 
            THEN 'Compare Selected'
            
        -- HEBREW TRANSLATIONS
        WHEN ci.content_key = 'credit_step4_title' AND lang.code = 'he' 
            THEN 'בקשת אשראי - שלב 4'
        WHEN ci.content_key = 'credit_step4_subtitle' AND lang.code = 'he' 
            THEN 'סקירה והגשת הבקשה שלך'
        WHEN ci.content_key = 'credit_final' AND lang.code = 'he' 
            THEN 'סיכום בקשת אשראי'
        WHEN ci.content_key = 'credit_warning' AND lang.code = 'he' 
            THEN 'התוצאות המפורטות לעיל הן הערכה בלבד לבקשת אשראי ואינן מהוות התחייבות. לקבלת הצעות מחייבות מהבנקים, נדרש להשלים את תהליך הרישום.'
        WHEN ci.content_key = 'credit_step4_user_info_title' AND lang.code = 'he' 
            THEN 'הפרטים שלך'
        WHEN ci.content_key = 'credit_step4_name_label' AND lang.code = 'he' 
            THEN 'שם'
        WHEN ci.content_key = 'credit_step4_phone_label' AND lang.code = 'he' 
            THEN 'טלפון'
        WHEN ci.content_key = 'credit_step4_amount_label' AND lang.code = 'he' 
            THEN 'סכום הלוואה'
        WHEN ci.content_key = 'credit_step4_filter_title' AND lang.code = 'he' 
            THEN 'סינון הצעות'
        WHEN ci.content_key = 'credit_step4_filter_all' AND lang.code = 'he' 
            THEN 'כל ההצעות'
        WHEN ci.content_key = 'credit_step4_filter_banks' AND lang.code = 'he' 
            THEN 'בנקים בלבד'
        WHEN ci.content_key = 'credit_step4_filter_insurance' AND lang.code = 'he' 
            THEN 'חברות ביטוח'
        WHEN ci.content_key = 'credit_step4_offers_title' AND lang.code = 'he' 
            THEN 'הצעות אשראי זמינות'
        WHEN ci.content_key = 'credit_step4_no_offers' AND lang.code = 'he' 
            THEN 'אין הצעות זמינות כרגע. אנא נסה להתאים את הקריטריונים שלך.'
        WHEN ci.content_key = 'credit_step4_loading' AND lang.code = 'he' 
            THEN 'טוען הצעות...'
        WHEN ci.content_key = 'credit_step4_back_button' AND lang.code = 'he' 
            THEN 'חזור'
        WHEN ci.content_key = 'credit_step4_submit_button' AND lang.code = 'he' 
            THEN 'הגש בקשה'
        WHEN ci.content_key = 'credit_step4_compare_button' AND lang.code = 'he' 
            THEN 'השווה נבחרים'
            
        -- RUSSIAN TRANSLATIONS
        WHEN ci.content_key = 'credit_step4_title' AND lang.code = 'ru' 
            THEN 'Заявка на кредит - Шаг 4'
        WHEN ci.content_key = 'credit_step4_subtitle' AND lang.code = 'ru' 
            THEN 'Просмотр и отправка вашей заявки'
        WHEN ci.content_key = 'credit_final' AND lang.code = 'ru' 
            THEN 'Итоги заявки на кредит'
        WHEN ci.content_key = 'credit_warning' AND lang.code = 'ru' 
            THEN 'Приведенные выше результаты являются только оценкой заявки на кредит и не являются обязательством. Для получения обязывающих предложений от банков необходимо завершить процесс регистрации.'
        WHEN ci.content_key = 'credit_step4_user_info_title' AND lang.code = 'ru' 
            THEN 'Ваша информация'
        WHEN ci.content_key = 'credit_step4_name_label' AND lang.code = 'ru' 
            THEN 'Имя'
        WHEN ci.content_key = 'credit_step4_phone_label' AND lang.code = 'ru' 
            THEN 'Телефон'
        WHEN ci.content_key = 'credit_step4_amount_label' AND lang.code = 'ru' 
            THEN 'Сумма кредита'
        WHEN ci.content_key = 'credit_step4_filter_title' AND lang.code = 'ru' 
            THEN 'Фильтр предложений'
        WHEN ci.content_key = 'credit_step4_filter_all' AND lang.code = 'ru' 
            THEN 'Все предложения'
        WHEN ci.content_key = 'credit_step4_filter_banks' AND lang.code = 'ru' 
            THEN 'Только банки'
        WHEN ci.content_key = 'credit_step4_filter_insurance' AND lang.code = 'ru' 
            THEN 'Страховые компании'
        WHEN ci.content_key = 'credit_step4_offers_title' AND lang.code = 'ru' 
            THEN 'Доступные кредитные предложения'
        WHEN ci.content_key = 'credit_step4_no_offers' AND lang.code = 'ru' 
            THEN 'В настоящее время нет доступных предложений. Попробуйте изменить критерии.'
        WHEN ci.content_key = 'credit_step4_loading' AND lang.code = 'ru' 
            THEN 'Загрузка предложений...'
        WHEN ci.content_key = 'credit_step4_back_button' AND lang.code = 'ru' 
            THEN 'Назад'
        WHEN ci.content_key = 'credit_step4_submit_button' AND lang.code = 'ru' 
            THEN 'Отправить заявку'
        WHEN ci.content_key = 'credit_step4_compare_button' AND lang.code = 'ru' 
            THEN 'Сравнить выбранные'
    END AS content_value,
    'active',
    NOW(),
    NOW()
FROM content_items ci
CROSS JOIN (VALUES ('en'), ('he'), ('ru')) AS lang(code)
WHERE ci.screen_location = 'credit_step4'
ON CONFLICT (content_item_id, language_code) DO UPDATE 
SET 
    content_value = EXCLUDED.content_value,
    updated_at = NOW(),
    -- Preserve existing status if record exists
    status = COALESCE(content_translations.status, EXCLUDED.status);

-- ========================================================================
-- STEP 4: Create database view for credit_step4
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
-- STEP 5: Verification Queries
-- ========================================================================
DO $$
DECLARE
    content_count INTEGER;
    translation_count INTEGER;
    view_count INTEGER;
BEGIN
    -- Check content items
    SELECT COUNT(*) INTO content_count 
    FROM content_items 
    WHERE screen_location = 'credit_step4';
    
    -- Check translations
    SELECT COUNT(*) INTO translation_count
    FROM content_items ci
    JOIN content_translations ct ON ci.id = ct.content_item_id
    WHERE ci.screen_location = 'credit_step4';
    
    -- Check view
    SELECT COUNT(*) INTO view_count
    FROM view_credit_step4;
    
    -- Report results
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Credit Step 4 Migration Results:';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Content items created: %', content_count;
    RAISE NOTICE 'Translations created: %', translation_count;
    RAISE NOTICE 'View records available: %', view_count;
    RAISE NOTICE '========================================';
    
    -- Validation
    IF content_count < 18 THEN
        RAISE WARNING 'Expected at least 18 content items, found %', content_count;
    END IF;
    
    IF translation_count < 54 THEN -- 18 items * 3 languages
        RAISE WARNING 'Expected at least 54 translations, found %', translation_count;
    END IF;
END $$;

-- ========================================================================
-- STEP 6: Create indexes for performance
-- ========================================================================
CREATE INDEX IF NOT EXISTS idx_content_items_credit_step4 
ON content_items(screen_location) 
WHERE screen_location = 'credit_step4';

CREATE INDEX IF NOT EXISTS idx_content_key_credit_step4 
ON content_items(content_key) 
WHERE screen_location = 'credit_step4';

-- ========================================================================
-- STEP 7: Summary Report
-- ========================================================================
SELECT 
    'Migration Summary' as report_section,
    COUNT(DISTINCT ci.id) as total_items,
    COUNT(DISTINCT ct.id) as total_translations,
    COUNT(DISTINCT ct.language_code) as languages_supported
FROM content_items ci
LEFT JOIN content_translations ct ON ci.id = ct.content_item_id
WHERE ci.screen_location = 'credit_step4';

-- Show sample of created content
SELECT 
    ci.content_key,
    ci.component_type,
    ct.language_code,
    LEFT(ct.content_value, 50) || '...' as content_preview
FROM content_items ci
JOIN content_translations ct ON ci.id = ct.content_item_id
WHERE ci.screen_location = 'credit_step4'
    AND ct.language_code = 'en'
ORDER BY ci.content_key
LIMIT 5;

COMMIT;

-- ========================================================================
-- ROLLBACK INSTRUCTIONS (if needed)
-- ========================================================================
-- To rollback this migration, run:
-- BEGIN;
-- DELETE FROM content_translations WHERE content_item_id IN (
--     SELECT id FROM content_items WHERE screen_location = 'credit_step4'
-- );
-- DELETE FROM content_items WHERE screen_location = 'credit_step4';
-- DROP VIEW IF EXISTS public.view_credit_step4;
-- COMMIT;
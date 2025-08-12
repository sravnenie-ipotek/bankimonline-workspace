-- =============================================================================
-- PRODUCTION SCRIPT: Fix Missing Refinance Step 3 Obligations Dropdown
-- =============================================================================
-- Date: 2025-01-12
-- Issue: Hebrew obligations dropdown showing English text in refinance_step3
-- Root Cause: Missing obligations dropdown content in database for refinance_step3
-- Solution: Copy complete obligations dropdown content from mortgage_step3 to refinance_step3
--
-- TESTING: This script was validated in development environment
-- ROLLBACK: See rollback script 001_rollback_refinance_obligations.sql
-- =============================================================================

-- Backup existing data before making changes
CREATE TABLE IF NOT EXISTS content_items_backup_20250112 AS 
SELECT * FROM content_items WHERE screen_location = 'refinance_step3';

CREATE TABLE IF NOT EXISTS content_translations_backup_20250112 AS 
SELECT ct.* FROM content_translations ct
JOIN content_items ci ON ct.content_item_id = ci.id
WHERE ci.screen_location = 'refinance_step3';

-- Start transaction for atomic operation
BEGIN;

-- =============================================================================
-- STEP 1: Copy obligations dropdown content_items from mortgage_step3 to refinance_step3
-- =============================================================================

INSERT INTO content_items (content_key, component_type, category, screen_location, is_active)
SELECT 
    REPLACE(content_key, 'mortgage_step3', 'refinance_step3') as new_content_key,
    component_type,
    category, 
    'refinance_step3' as new_screen_location,
    is_active
FROM content_items ci_source
WHERE ci_source.screen_location = 'mortgage_step3' 
    AND ci_source.content_key LIKE '%obligations%'
    AND ci_source.component_type IN ('dropdown_container', 'dropdown_option', 'placeholder')
    AND NOT EXISTS (
        SELECT 1 FROM content_items ci_target 
        WHERE ci_target.content_key = REPLACE(ci_source.content_key, 'mortgage_step3', 'refinance_step3')
        AND ci_target.screen_location = 'refinance_step3'
    );

-- Verify content_items were copied
DO $$
DECLARE
    items_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO items_count 
    FROM content_items 
    WHERE screen_location = 'refinance_step3' 
        AND content_key LIKE '%obligations%'
        AND component_type IN ('dropdown_container', 'dropdown_option', 'placeholder');
    
    IF items_count = 0 THEN
        RAISE EXCEPTION 'CRITICAL ERROR: No obligations content_items were copied to refinance_step3. Rolling back transaction.';
    END IF;
    
    RAISE NOTICE 'SUCCESS: Copied % obligations content_items to refinance_step3', items_count;
END $$;

-- =============================================================================
-- STEP 2: Copy obligations dropdown translations from mortgage_step3 to refinance_step3
-- =============================================================================

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT 
    ci_target.id as new_content_item_id,
    ct_source.language_code,
    ct_source.content_value,
    ct_source.status
FROM content_items ci_source
JOIN content_translations ct_source ON ci_source.id = ct_source.content_item_id
JOIN content_items ci_target ON ci_target.content_key = REPLACE(ci_source.content_key, 'mortgage_step3', 'refinance_step3')
WHERE ci_source.screen_location = 'mortgage_step3'
    AND ci_source.content_key LIKE '%obligations%'
    AND ci_source.component_type IN ('dropdown_container', 'dropdown_option', 'placeholder')
    AND ci_target.screen_location = 'refinance_step3'
    AND NOT EXISTS (
        SELECT 1 FROM content_translations ct_existing
        WHERE ct_existing.content_item_id = ci_target.id 
            AND ct_existing.language_code = ct_source.language_code
    );

-- Verify translations were copied for all languages
DO $$
DECLARE
    en_count INTEGER;
    he_count INTEGER;
    ru_count INTEGER;
BEGIN
    -- Count English translations
    SELECT COUNT(*) INTO en_count
    FROM content_items ci
    JOIN content_translations ct ON ci.id = ct.content_item_id
    WHERE ci.screen_location = 'refinance_step3' 
        AND ci.content_key LIKE '%obligations%'
        AND ct.language_code = 'en'
        AND ct.status = 'approved';
    
    -- Count Hebrew translations  
    SELECT COUNT(*) INTO he_count
    FROM content_items ci
    JOIN content_translations ct ON ci.id = ct.content_item_id
    WHERE ci.screen_location = 'refinance_step3' 
        AND ci.content_key LIKE '%obligations%'
        AND ct.language_code = 'he'
        AND ct.status = 'approved';
    
    -- Count Russian translations
    SELECT COUNT(*) INTO ru_count
    FROM content_items ci
    JOIN content_translations ct ON ci.id = ct.content_item_id
    WHERE ci.screen_location = 'refinance_step3' 
        AND ci.content_key LIKE '%obligations%'
        AND ct.language_code = 'ru'
        AND ct.status = 'approved';
    
    IF en_count = 0 OR he_count = 0 OR ru_count = 0 THEN
        RAISE EXCEPTION 'CRITICAL ERROR: Missing translations - EN:%, HE:%, RU:%. Rolling back transaction.', en_count, he_count, ru_count;
    END IF;
    
    RAISE NOTICE 'SUCCESS: Created obligations translations - EN:%, HE:%, RU:%', en_count, he_count, ru_count;
END $$;

-- =============================================================================
-- STEP 3: Validation - Verify complete obligations dropdown structure
-- =============================================================================

-- Check that we have all required obligation options for refinance_step3
DO $$
DECLARE
    option_count INTEGER;
    expected_options TEXT[] := ARRAY['no_obligations', 'bank_loan', 'credit_card', 'other_loan', 'personal_loan'];
    missing_options TEXT[];
    option_name TEXT;
BEGIN
    -- Check each expected option exists
    FOREACH option_name IN ARRAY expected_options LOOP
        SELECT COUNT(*) INTO option_count
        FROM content_items ci
        JOIN content_translations ct ON ci.id = ct.content_item_id
        WHERE ci.screen_location = 'refinance_step3'
            AND ci.content_key LIKE '%obligations_' || option_name
            AND ci.component_type = 'dropdown_option'
            AND ct.language_code = 'he'
            AND ct.status = 'approved';
        
        IF option_count = 0 THEN
            missing_options := array_append(missing_options, option_name);
        END IF;
    END LOOP;
    
    IF array_length(missing_options, 1) > 0 THEN
        RAISE WARNING 'Missing obligation options for refinance_step3: %', missing_options;
    ELSE
        RAISE NOTICE 'SUCCESS: All required obligation options exist for refinance_step3';
    END IF;
END $$;

-- =============================================================================
-- STEP 4: Final validation and summary
-- =============================================================================

-- Display final summary
DO $$
DECLARE
    total_items INTEGER;
    total_translations INTEGER;
    languages_supported INTEGER;
BEGIN
    -- Count total content items for refinance_step3 obligations
    SELECT COUNT(*) INTO total_items
    FROM content_items
    WHERE screen_location = 'refinance_step3' 
        AND content_key LIKE '%obligations%';
    
    -- Count total translations for refinance_step3 obligations
    SELECT COUNT(*) INTO total_translations
    FROM content_items ci
    JOIN content_translations ct ON ci.id = ct.content_item_id
    WHERE ci.screen_location = 'refinance_step3' 
        AND ci.content_key LIKE '%obligations%'
        AND ct.status = 'approved';
    
    -- Count languages supported
    SELECT COUNT(DISTINCT ct.language_code) INTO languages_supported
    FROM content_items ci
    JOIN content_translations ct ON ci.id = ct.content_item_id
    WHERE ci.screen_location = 'refinance_step3' 
        AND ci.content_key LIKE '%obligations%'
        AND ct.status = 'approved';
    
    RAISE NOTICE '=============================================================================';
    RAISE NOTICE 'PRODUCTION SCRIPT COMPLETED SUCCESSFULLY';
    RAISE NOTICE '=============================================================================';
    RAISE NOTICE 'Refinance Step 3 Obligations Dropdown - Summary:';
    RAISE NOTICE '  - Content Items Created: %', total_items;
    RAISE NOTICE '  - Translations Created: %', total_translations;
    RAISE NOTICE '  - Languages Supported: % (Expected: 3)', languages_supported;
    RAISE NOTICE '  - API Endpoint: /api/dropdowns/refinance_step3/he should now return obligations';
    RAISE NOTICE '  - Frontend Impact: Hebrew obligations dropdown will now show proper options';
    RAISE NOTICE '=============================================================================';
    
    IF total_items < 5 OR total_translations < 15 OR languages_supported < 3 THEN
        RAISE WARNING 'VALIDATION WARNING: Expected at least 5 items, 15 translations, 3 languages';
        RAISE WARNING 'Actual: % items, % translations, % languages', total_items, total_translations, languages_supported;
    END IF;
END $$;

-- Commit the transaction
COMMIT;

-- =============================================================================
-- POST-DEPLOYMENT VERIFICATION COMMANDS
-- =============================================================================
-- Run these commands after deployment to verify the fix worked:
-- 
-- 1. Test API endpoint:
--    curl "https://your-production-domain/api/dropdowns/refinance_step3/he" | jq '.options.refinance_step3_obligations'
--
-- 2. Check database directly:
--    SELECT ci.content_key, ct.language_code, ct.content_value
--    FROM content_items ci
--    JOIN content_translations ct ON ci.id = ct.content_item_id  
--    WHERE ci.screen_location = 'refinance_step3' 
--        AND ci.content_key LIKE '%obligations%'
--        AND ct.language_code = 'he'
--    ORDER BY ci.content_key;
--
-- 3. Verify frontend dropdown:
--    Navigate to: https://your-production-domain/services/refinance-mortgage/3
--    Language: Hebrew (he)
--    Expected: Obligations dropdown shows Hebrew options instead of "Select obligation type"
-- =============================================================================
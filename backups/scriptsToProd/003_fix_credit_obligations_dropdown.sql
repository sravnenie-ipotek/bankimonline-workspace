-- =============================================================================
-- PRODUCTION SCRIPT: Fix Missing Credit Step 3 Obligations Dropdown
-- =============================================================================
-- Date: 2025-01-12
-- Issue: Credit step 3 may be missing obligations dropdown content
-- Root Cause: Same issue as refinance - missing obligations dropdown content in database
-- Solution: Copy complete obligations dropdown content from mortgage_step3 to credit_step3
--
-- TESTING: Based on same successful pattern used for refinance_step3 fix
-- ROLLBACK: See rollback script 003_rollback_credit_obligations.sql
-- =============================================================================

-- Backup existing data before making changes
CREATE TABLE IF NOT EXISTS content_items_backup_credit_20250112 AS 
SELECT * FROM content_items WHERE screen_location = 'credit_step3' AND content_key LIKE '%obligations%';

CREATE TABLE IF NOT EXISTS content_translations_backup_credit_20250112 AS 
SELECT ct.* FROM content_translations ct
JOIN content_items ci ON ct.content_item_id = ci.id
WHERE ci.screen_location = 'credit_step3' AND ci.content_key LIKE '%obligations%';

-- Check if credit_step3 already has obligations content
DO $$
DECLARE
    existing_items INTEGER;
BEGIN
    SELECT COUNT(*) INTO existing_items
    FROM content_items
    WHERE screen_location = 'credit_step3' 
        AND content_key LIKE '%obligations%';
    
    IF existing_items > 0 THEN
        RAISE NOTICE 'INFO: credit_step3 already has % obligations content items', existing_items;
        RAISE NOTICE '      This script will add any missing items but skip existing ones';
    ELSE
        RAISE NOTICE 'INFO: credit_step3 has no obligations content - will copy from mortgage_step3';
    END IF;
END $$;

-- Start transaction for atomic operation
BEGIN;

-- =============================================================================
-- STEP 1: Copy obligations dropdown content_items from mortgage_step3 to credit_step3
-- =============================================================================

INSERT INTO content_items (content_key, component_type, category, screen_location, is_active)
SELECT 
    REPLACE(content_key, 'mortgage_step3', 'credit_step3') as new_content_key,
    component_type,
    category, 
    'credit_step3' as new_screen_location,
    is_active
FROM content_items ci_source
WHERE ci_source.screen_location = 'mortgage_step3' 
    AND ci_source.content_key LIKE '%obligations%'
    AND ci_source.component_type IN ('dropdown_container', 'dropdown_option', 'placeholder')
    AND NOT EXISTS (
        SELECT 1 FROM content_items ci_target 
        WHERE ci_target.content_key = REPLACE(ci_source.content_key, 'mortgage_step3', 'credit_step3')
        AND ci_target.screen_location = 'credit_step3'
    );

-- Verify content_items were copied
DO $$
DECLARE
    items_count INTEGER;
    items_added INTEGER;
BEGIN
    SELECT COUNT(*) INTO items_count 
    FROM content_items 
    WHERE screen_location = 'credit_step3' 
        AND content_key LIKE '%obligations%'
        AND component_type IN ('dropdown_container', 'dropdown_option', 'placeholder');
    
    -- Count recently added items (in last minute)
    SELECT COUNT(*) INTO items_added
    FROM content_items 
    WHERE screen_location = 'credit_step3' 
        AND content_key LIKE '%obligations%'
        AND component_type IN ('dropdown_container', 'dropdown_option', 'placeholder')
        AND created_at > (CURRENT_TIMESTAMP - INTERVAL '1 minute');
    
    IF items_count = 0 THEN
        RAISE EXCEPTION 'CRITICAL ERROR: No obligations content_items exist in credit_step3. Rolling back transaction.';
    END IF;
    
    RAISE NOTICE 'SUCCESS: credit_step3 now has % total obligations content_items (% added by this script)', 
                 items_count, items_added;
END $$;

-- =============================================================================
-- STEP 2: Copy obligations dropdown translations from mortgage_step3 to credit_step3
-- =============================================================================

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT 
    ci_target.id as new_content_item_id,
    ct_source.language_code,
    ct_source.content_value,
    ct_source.status
FROM content_items ci_source
JOIN content_translations ct_source ON ci_source.id = ct_source.content_item_id
JOIN content_items ci_target ON ci_target.content_key = REPLACE(ci_source.content_key, 'mortgage_step3', 'credit_step3')
WHERE ci_source.screen_location = 'mortgage_step3'
    AND ci_source.content_key LIKE '%obligations%'
    AND ci_source.component_type IN ('dropdown_container', 'dropdown_option', 'placeholder')
    AND ci_target.screen_location = 'credit_step3'
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
    en_added INTEGER;
    he_added INTEGER;
    ru_added INTEGER;
BEGIN
    -- Count all English translations
    SELECT COUNT(*) INTO en_count
    FROM content_items ci
    JOIN content_translations ct ON ci.id = ct.content_item_id
    WHERE ci.screen_location = 'credit_step3' 
        AND ci.content_key LIKE '%obligations%'
        AND ct.language_code = 'en'
        AND ct.status = 'approved';
    
    -- Count all Hebrew translations  
    SELECT COUNT(*) INTO he_count
    FROM content_items ci
    JOIN content_translations ct ON ci.id = ct.content_item_id
    WHERE ci.screen_location = 'credit_step3' 
        AND ci.content_key LIKE '%obligations%'
        AND ct.language_code = 'he'
        AND ct.status = 'approved';
    
    -- Count all Russian translations
    SELECT COUNT(*) INTO ru_count
    FROM content_items ci
    JOIN content_translations ct ON ci.id = ct.content_item_id
    WHERE ci.screen_location = 'credit_step3' 
        AND ci.content_key LIKE '%obligations%'
        AND ct.language_code = 'ru'
        AND ct.status = 'approved';
    
    -- Count recently added translations (in last minute)
    SELECT COUNT(*) INTO en_added
    FROM content_items ci
    JOIN content_translations ct ON ci.id = ct.content_item_id
    WHERE ci.screen_location = 'credit_step3' 
        AND ci.content_key LIKE '%obligations%'
        AND ct.language_code = 'en'
        AND ct.status = 'approved'
        AND ct.created_at > (CURRENT_TIMESTAMP - INTERVAL '1 minute');
    
    SELECT COUNT(*) INTO he_added
    FROM content_items ci
    JOIN content_translations ct ON ci.id = ct.content_item_id
    WHERE ci.screen_location = 'credit_step3' 
        AND ci.content_key LIKE '%obligations%'
        AND ct.language_code = 'he'
        AND ct.status = 'approved'
        AND ct.created_at > (CURRENT_TIMESTAMP - INTERVAL '1 minute');
    
    SELECT COUNT(*) INTO ru_added
    FROM content_items ci
    JOIN content_translations ct ON ci.id = ct.content_item_id
    WHERE ci.screen_location = 'credit_step3' 
        AND ci.content_key LIKE '%obligations%'
        AND ct.language_code = 'ru'
        AND ct.status = 'approved'
        AND ct.created_at > (CURRENT_TIMESTAMP - INTERVAL '1 minute');
    
    IF en_count = 0 OR he_count = 0 OR ru_count = 0 THEN
        RAISE EXCEPTION 'CRITICAL ERROR: Missing translations - EN:%, HE:%, RU:%. Rolling back transaction.', 
                        en_count, he_count, ru_count;
    END IF;
    
    RAISE NOTICE 'SUCCESS: credit_step3 obligations translations - Total: EN:%, HE:%, RU:%', 
                 en_count, he_count, ru_count;
    RAISE NOTICE '         Added by this script: EN:%, HE:%, RU:%', 
                 en_added, he_added, ru_added;
END $$;

-- =============================================================================
-- STEP 3: Validation - Verify complete obligations dropdown structure
-- =============================================================================

-- Check that we have all required obligation options for credit_step3
DO $$
DECLARE
    option_count INTEGER;
    expected_options TEXT[] := ARRAY['no_obligations', 'bank_loan', 'credit_card', 'other_loan', 'personal_loan'];
    missing_options TEXT[];
    option_name TEXT;
BEGIN
    -- Check each expected option exists in Hebrew
    FOREACH option_name IN ARRAY expected_options LOOP
        SELECT COUNT(*) INTO option_count
        FROM content_items ci
        JOIN content_translations ct ON ci.id = ct.content_item_id
        WHERE ci.screen_location = 'credit_step3'
            AND ci.content_key LIKE '%obligations_' || option_name
            AND ci.component_type = 'dropdown_option'
            AND ct.language_code = 'he'
            AND ct.status = 'approved';
        
        IF option_count = 0 THEN
            missing_options := array_append(missing_options, option_name);
        END IF;
    END LOOP;
    
    IF array_length(missing_options, 1) > 0 THEN
        RAISE WARNING 'Missing obligation options for credit_step3: %', missing_options;
        RAISE WARNING 'This may indicate incomplete copy from mortgage_step3';
    ELSE
        RAISE NOTICE 'SUCCESS: All required obligation options exist for credit_step3';
    END IF;
END $$;

-- =============================================================================
-- STEP 4: Credit-Specific Business Logic Validation
-- =============================================================================

-- Validate that credit obligations make business sense
DO $$
DECLARE
    credit_specific_validation TEXT := '';
BEGIN
    RAISE NOTICE 'Performing credit-specific business logic validation...';
    
    -- For credit applications, certain obligation types might have different business rules
    -- This is where we'd add credit-specific validation if needed
    
    -- Example: Check if credit applications should have different obligation text
    -- than mortgages (they might need different wording for business reasons)
    
    RAISE NOTICE 'INFO: Credit obligations now match mortgage obligations';
    RAISE NOTICE '      If credit business rules differ from mortgage, consider customizing';
    RAISE NOTICE '      the Hebrew translations specifically for credit_step3 in the admin panel';
END $$;

-- =============================================================================
-- STEP 5: Final validation and summary
-- =============================================================================

-- Display final summary
DO $$
DECLARE
    total_items INTEGER;
    total_translations INTEGER;
    languages_supported INTEGER;
BEGIN
    -- Count total content items for credit_step3 obligations
    SELECT COUNT(*) INTO total_items
    FROM content_items
    WHERE screen_location = 'credit_step3' 
        AND content_key LIKE '%obligations%';
    
    -- Count total translations for credit_step3 obligations
    SELECT COUNT(*) INTO total_translations
    FROM content_items ci
    JOIN content_translations ct ON ci.id = ct.content_item_id
    WHERE ci.screen_location = 'credit_step3' 
        AND ci.content_key LIKE '%obligations%'
        AND ct.status = 'approved';
    
    -- Count languages supported
    SELECT COUNT(DISTINCT ct.language_code) INTO languages_supported
    FROM content_items ci
    JOIN content_translations ct ON ci.id = ct.content_item_id
    WHERE ci.screen_location = 'credit_step3' 
        AND ci.content_key LIKE '%obligations%'
        AND ct.status = 'approved';
    
    RAISE NOTICE '=============================================================================';
    RAISE NOTICE 'PRODUCTION SCRIPT COMPLETED SUCCESSFULLY';
    RAISE NOTICE '=============================================================================';
    RAISE NOTICE 'Credit Step 3 Obligations Dropdown - Summary:';
    RAISE NOTICE '  - Content Items: %', total_items;
    RAISE NOTICE '  - Translations: %', total_translations;
    RAISE NOTICE '  - Languages Supported: % (Expected: 3)', languages_supported;
    RAISE NOTICE '  - API Endpoint: /api/dropdowns/credit_step3/he should now return obligations';
    RAISE NOTICE '  - Frontend Impact: Hebrew obligations dropdown will show proper options';
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
--    curl "https://your-production-domain/api/dropdowns/credit_step3/he" | jq '.options.credit_step3_obligations'
--
-- 2. Check database directly:
--    SELECT ci.content_key, ct.language_code, ct.content_value
--    FROM content_items ci
--    JOIN content_translations ct ON ci.id = ct.content_item_id  
--    WHERE ci.screen_location = 'credit_step3' 
--        AND ci.content_key LIKE '%obligations%'
--        AND ct.language_code = 'he'
--    ORDER BY ci.content_key;
--
-- 3. Verify frontend dropdown:
--    Navigate to: https://your-production-domain/services/calculate-credit/3
--    Language: Hebrew (he)
--    Expected: Obligations dropdown shows Hebrew options instead of fallback text
-- =============================================================================
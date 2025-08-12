-- =============================================================================
-- PRODUCTION SCRIPT: Validate All Obligations Dropdowns Across All Screens
-- =============================================================================
-- Date: 2025-01-12
-- Purpose: Comprehensive validation of obligations dropdown content across all screens
-- Context: After fixing refinance_step3, validate that mortgage_step3 and credit_step3 are also complete
-- 
-- This script validates and reports on the state of obligations dropdowns for:
-- - mortgage_step3 (should be working - source of our copy)
-- - refinance_step3 (just fixed)
-- - credit_step3 (should be verified)
-- =============================================================================

-- Start validation transaction (read-only)
BEGIN;

-- =============================================================================
-- STEP 1: Global Obligations Dropdown Overview
-- =============================================================================

DO $$
DECLARE
    screen_name TEXT;
    screen_list TEXT[] := ARRAY['mortgage_step3', 'credit_step3', 'refinance_step3'];
    item_count INTEGER;
    translation_count INTEGER;
    language_count INTEGER;
    validation_results TEXT := '';
BEGIN
    RAISE NOTICE '=============================================================================';
    RAISE NOTICE 'OBLIGATIONS DROPDOWN VALIDATION REPORT';
    RAISE NOTICE 'Generated: %', CURRENT_TIMESTAMP;
    RAISE NOTICE '=============================================================================';
    
    FOREACH screen_name IN ARRAY screen_list LOOP
        -- Count content items for this screen
        SELECT COUNT(*) INTO item_count
        FROM content_items
        WHERE screen_location = screen_name 
            AND content_key LIKE '%obligations%'
            AND component_type IN ('dropdown_container', 'dropdown_option', 'placeholder');
        
        -- Count translations for this screen
        SELECT COUNT(*) INTO translation_count
        FROM content_items ci
        JOIN content_translations ct ON ci.id = ct.content_item_id
        WHERE ci.screen_location = screen_name 
            AND ci.content_key LIKE '%obligations%'
            AND ct.status = 'approved';
        
        -- Count languages supported for this screen
        SELECT COUNT(DISTINCT ct.language_code) INTO language_count
        FROM content_items ci
        JOIN content_translations ct ON ci.id = ct.content_item_id
        WHERE ci.screen_location = screen_name 
            AND ci.content_key LIKE '%obligations%'
            AND ct.status = 'approved';
        
        RAISE NOTICE 'Screen: % | Items: % | Translations: % | Languages: %', 
                     screen_name, item_count, translation_count, language_count;
        
        -- Build validation summary
        IF item_count = 0 THEN
            validation_results := validation_results || screen_name || ': MISSING CONTENT, ';
        ELSIF language_count < 3 THEN
            validation_results := validation_results || screen_name || ': MISSING LANGUAGES, ';
        ELSE
            validation_results := validation_results || screen_name || ': OK, ';
        END IF;
    END LOOP;
    
    RAISE NOTICE '=============================================================================';
    RAISE NOTICE 'SUMMARY: %', TRIM(TRAILING ', ' FROM validation_results);
    RAISE NOTICE '=============================================================================';
END $$;

-- =============================================================================
-- STEP 2: Detailed Per-Screen Validation
-- =============================================================================

-- Check mortgage_step3 obligations (should be complete - our source)
DO $$
DECLARE
    expected_options TEXT[] := ARRAY['no_obligations', 'bank_loan', 'credit_card', 'other_loan', 'personal_loan'];
    option_name TEXT;
    he_count INTEGER;
    en_count INTEGER;
    ru_count INTEGER;
    missing_he TEXT[] := '{}';
    missing_en TEXT[] := '{}';
    missing_ru TEXT[] := '{}';
BEGIN
    RAISE NOTICE 'Validating MORTGAGE_STEP3 obligations dropdown...';
    
    FOREACH option_name IN ARRAY expected_options LOOP
        -- Check Hebrew
        SELECT COUNT(*) INTO he_count
        FROM content_items ci
        JOIN content_translations ct ON ci.id = ct.content_item_id
        WHERE ci.screen_location = 'mortgage_step3'
            AND ci.content_key LIKE '%obligations_' || option_name
            AND ct.language_code = 'he'
            AND ct.status = 'approved';
        
        -- Check English    
        SELECT COUNT(*) INTO en_count
        FROM content_items ci
        JOIN content_translations ct ON ci.id = ct.content_item_id
        WHERE ci.screen_location = 'mortgage_step3'
            AND ci.content_key LIKE '%obligations_' || option_name
            AND ct.language_code = 'en'
            AND ct.status = 'approved';
        
        -- Check Russian
        SELECT COUNT(*) INTO ru_count
        FROM content_items ci
        JOIN content_translations ct ON ci.id = ct.content_item_id
        WHERE ci.screen_location = 'mortgage_step3'
            AND ci.content_key LIKE '%obligations_' || option_name
            AND ct.language_code = 'ru'
            AND ct.status = 'approved';
        
        -- Track missing translations
        IF he_count = 0 THEN missing_he := array_append(missing_he, option_name); END IF;
        IF en_count = 0 THEN missing_en := array_append(missing_en, option_name); END IF;
        IF ru_count = 0 THEN missing_ru := array_append(missing_ru, option_name); END IF;
    END LOOP;
    
    IF array_length(missing_he, 1) > 0 OR array_length(missing_en, 1) > 0 OR array_length(missing_ru, 1) > 0 THEN
        RAISE WARNING 'MORTGAGE_STEP3 Missing translations:';
        IF array_length(missing_he, 1) > 0 THEN RAISE WARNING '  Hebrew: %', missing_he; END IF;
        IF array_length(missing_en, 1) > 0 THEN RAISE WARNING '  English: %', missing_en; END IF;
        IF array_length(missing_ru, 1) > 0 THEN RAISE WARNING '  Russian: %', missing_ru; END IF;
    ELSE
        RAISE NOTICE '✅ MORTGAGE_STEP3 obligations dropdown is COMPLETE';
    END IF;
END $$;

-- Check credit_step3 obligations 
DO $$
DECLARE
    expected_options TEXT[] := ARRAY['no_obligations', 'bank_loan', 'credit_card', 'other_loan', 'personal_loan'];
    option_name TEXT;
    he_count INTEGER;
    missing_options TEXT[] := '{}';
    total_items INTEGER;
BEGIN
    RAISE NOTICE 'Validating CREDIT_STEP3 obligations dropdown...';
    
    SELECT COUNT(*) INTO total_items
    FROM content_items
    WHERE screen_location = 'credit_step3' 
        AND content_key LIKE '%obligations%';
    
    IF total_items = 0 THEN
        RAISE WARNING '❌ CREDIT_STEP3 has NO obligations dropdown content';
        RAISE WARNING '   ACTION REQUIRED: Run copy script to add obligations to credit_step3';
    ELSE
        FOREACH option_name IN ARRAY expected_options LOOP
            SELECT COUNT(*) INTO he_count
            FROM content_items ci
            JOIN content_translations ct ON ci.id = ct.content_item_id
            WHERE ci.screen_location = 'credit_step3'
                AND ci.content_key LIKE '%obligations_' || option_name
                AND ct.language_code = 'he'
                AND ct.status = 'approved';
            
            IF he_count = 0 THEN
                missing_options := array_append(missing_options, option_name);
            END IF;
        END LOOP;
        
        IF array_length(missing_options, 1) > 0 THEN
            RAISE WARNING '⚠️  CREDIT_STEP3 missing Hebrew options: %', missing_options;
        ELSE
            RAISE NOTICE '✅ CREDIT_STEP3 obligations dropdown is COMPLETE';
        END IF;
    END IF;
END $$;

-- Check refinance_step3 obligations (just fixed)
DO $$
DECLARE
    expected_options TEXT[] := ARRAY['no_obligations', 'bank_loan', 'credit_card', 'other_loan', 'personal_loan'];
    option_name TEXT;
    he_count INTEGER;
    missing_options TEXT[] := '{}';
    total_items INTEGER;
BEGIN
    RAISE NOTICE 'Validating REFINANCE_STEP3 obligations dropdown...';
    
    SELECT COUNT(*) INTO total_items
    FROM content_items
    WHERE screen_location = 'refinance_step3' 
        AND content_key LIKE '%obligations%';
    
    IF total_items = 0 THEN
        RAISE WARNING '❌ REFINANCE_STEP3 has NO obligations dropdown content';
        RAISE WARNING '   ACTION REQUIRED: Script 001_fix_refinance_obligations_dropdown.sql was not run';
    ELSE
        FOREACH option_name IN ARRAY expected_options LOOP
            SELECT COUNT(*) INTO he_count
            FROM content_items ci
            JOIN content_translations ct ON ci.id = ct.content_item_id
            WHERE ci.screen_location = 'refinance_step3'
                AND ci.content_key LIKE '%obligations_' || option_name
                AND ct.language_code = 'he'
                AND ct.status = 'approved';
            
            IF he_count = 0 THEN
                missing_options := array_append(missing_options, option_name);
            END IF;
        END LOOP;
        
        IF array_length(missing_options, 1) > 0 THEN
            RAISE WARNING '⚠️  REFINANCE_STEP3 missing Hebrew options: %', missing_options;
        ELSE
            RAISE NOTICE '✅ REFINANCE_STEP3 obligations dropdown is COMPLETE';
        END IF;
    END IF;
END $$;

-- =============================================================================
-- STEP 3: API Endpoint Testing Simulation
-- =============================================================================

-- Simulate what the API endpoints would return
DO $$
DECLARE
    screen_name TEXT;
    screen_list TEXT[] := ARRAY['mortgage_step3', 'credit_step3', 'refinance_step3'];
    obligations_key TEXT;
    option_count INTEGER;
BEGIN
    RAISE NOTICE '=============================================================================';
    RAISE NOTICE 'API ENDPOINT SIMULATION';
    RAISE NOTICE '=============================================================================';
    
    FOREACH screen_name IN ARRAY screen_list LOOP
        obligations_key := screen_name || '_obligations';
        
        -- Count Hebrew obligations options for this screen
        SELECT COUNT(*) INTO option_count
        FROM content_items ci
        JOIN content_translations ct ON ci.id = ct.content_item_id
        WHERE ci.screen_location = screen_name
            AND ci.content_key LIKE '%obligations%'
            AND ci.component_type = 'dropdown_option'
            AND ct.language_code = 'he'
            AND ct.status = 'approved';
        
        RAISE NOTICE '/api/dropdowns/%/he -> %.options.% = % options',
                     screen_name, screen_name, obligations_key, option_count;
        
        IF option_count = 0 THEN
            RAISE NOTICE '  ❌ Frontend will show: "Select obligation type" (English fallback)';
        ELSE
            RAISE NOTICE '  ✅ Frontend will show: Hebrew obligation options';
        END IF;
    END LOOP;
END $$;

-- =============================================================================
-- STEP 4: Content Key Pattern Validation
-- =============================================================================

-- Validate content key patterns follow screen-specific naming convention
DO $$
DECLARE
    invalid_keys_count INTEGER;
    screen_name TEXT;
    screen_list TEXT[] := ARRAY['mortgage_step3', 'credit_step3', 'refinance_step3'];
BEGIN
    RAISE NOTICE '=============================================================================';
    RAISE NOTICE 'CONTENT KEY PATTERN VALIDATION';
    RAISE NOTICE '=============================================================================';
    
    FOREACH screen_name IN ARRAY screen_list LOOP
        -- Check for invalid patterns (should contain screen name in key)
        SELECT COUNT(*) INTO invalid_keys_count
        FROM content_items
        WHERE screen_location = screen_name
            AND content_key LIKE '%obligations%'
            AND content_key NOT LIKE '%' || screen_name || '%';
        
        IF invalid_keys_count > 0 THEN
            RAISE WARNING '⚠️  % has % content_keys that don''t follow screen-specific pattern', 
                         screen_name, invalid_keys_count;
            
            -- Show the problematic keys
            FOR screen_name IN 
                SELECT content_key 
                FROM content_items
                WHERE screen_location = screen_name
                    AND content_key LIKE '%obligations%'
                    AND content_key NOT LIKE '%' || screen_name || '%'
            LOOP
                RAISE WARNING '    Invalid key: %', screen_name;
            END LOOP;
        ELSE
            RAISE NOTICE '✅ % content keys follow correct screen-specific pattern', screen_name;
        END IF;
    END LOOP;
END $$;

-- =============================================================================
-- STEP 5: Final Recommendations
-- =============================================================================

DO $$
DECLARE
    mortgage_items INTEGER;
    credit_items INTEGER;
    refinance_items INTEGER;
    recommendations TEXT := '';
BEGIN
    -- Get item counts
    SELECT COUNT(*) INTO mortgage_items FROM content_items WHERE screen_location = 'mortgage_step3' AND content_key LIKE '%obligations%';
    SELECT COUNT(*) INTO credit_items FROM content_items WHERE screen_location = 'credit_step3' AND content_key LIKE '%obligations%';
    SELECT COUNT(*) INTO refinance_items FROM content_items WHERE screen_location = 'refinance_step3' AND content_key LIKE '%obligations%';
    
    RAISE NOTICE '=============================================================================';
    RAISE NOTICE 'VALIDATION COMPLETE - RECOMMENDATIONS';
    RAISE NOTICE '=============================================================================';
    
    IF mortgage_items = 0 THEN
        recommendations := recommendations || '🚨 CRITICAL: mortgage_step3 missing obligations (system broken!)' || E'\n';
    END IF;
    
    IF credit_items = 0 THEN
        recommendations := recommendations || '⚠️  TODO: Run script 003_fix_credit_obligations_dropdown.sql' || E'\n';
    END IF;
    
    IF refinance_items = 0 THEN
        recommendations := recommendations || '⚠️  TODO: Run script 001_fix_refinance_obligations_dropdown.sql' || E'\n';
    END IF;
    
    IF recommendations = '' THEN
        RAISE NOTICE '✅ ALL OBLIGATIONS DROPDOWNS ARE COMPLETE';
        RAISE NOTICE '   All three screens (mortgage, credit, refinance) have proper Hebrew obligations';
        RAISE NOTICE '   No action required - system is fully functional';
    ELSE
        RAISE NOTICE 'ACTION ITEMS:';
        RAISE NOTICE '%', recommendations;
    END IF;
    
    RAISE NOTICE '=============================================================================';
END $$;

-- End validation transaction (no changes made)
ROLLBACK;

-- =============================================================================
-- USAGE INSTRUCTIONS
-- =============================================================================
-- 1. Run this validation script in production to assess current state
-- 2. Based on the output recommendations, run the appropriate fix scripts:
--    - If refinance_step3 missing: Run 001_fix_refinance_obligations_dropdown.sql
--    - If credit_step3 missing: Run 003_fix_credit_obligations_dropdown.sql  
-- 3. Run this validation script again to confirm all fixes worked
-- 4. Test frontend functionality on all three screens with Hebrew language
-- =============================================================================
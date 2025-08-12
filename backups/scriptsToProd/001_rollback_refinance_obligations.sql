-- =============================================================================
-- ROLLBACK SCRIPT: Rollback Refinance Step 3 Obligations Dropdown Fix
-- =============================================================================
-- Date: 2025-01-12
-- Purpose: Rollback the obligations dropdown fix if issues occur in production
-- Related: 001_fix_refinance_obligations_dropdown.sql
-- 
-- WARNING: This will remove all obligations dropdown content for refinance_step3
-- Only run this if the fix caused production issues and needs to be reverted
-- =============================================================================

-- Start transaction for atomic rollback
BEGIN;

-- =============================================================================
-- STEP 1: Remove obligations translations added for refinance_step3
-- =============================================================================

-- Delete translations for refinance_step3 obligations that were added by the fix
DELETE FROM content_translations 
WHERE content_item_id IN (
    SELECT ci.id 
    FROM content_items ci
    WHERE ci.screen_location = 'refinance_step3' 
        AND ci.content_key LIKE '%obligations%'
        AND ci.component_type IN ('dropdown_container', 'dropdown_option', 'placeholder')
        AND ci.created_at > (CURRENT_TIMESTAMP - INTERVAL '1 hour')  -- Only recent additions
);

-- Verify translations were removed
DO $$
DECLARE
    remaining_translations INTEGER;
BEGIN
    SELECT COUNT(*) INTO remaining_translations
    FROM content_items ci
    JOIN content_translations ct ON ci.id = ct.content_item_id
    WHERE ci.screen_location = 'refinance_step3' 
        AND ci.content_key LIKE '%obligations%';
    
    RAISE NOTICE 'Remaining obligations translations for refinance_step3: %', remaining_translations;
END $$;

-- =============================================================================
-- STEP 2: Remove obligations content_items added for refinance_step3
-- =============================================================================

-- Delete content_items for refinance_step3 obligations that were added by the fix
DELETE FROM content_items 
WHERE screen_location = 'refinance_step3' 
    AND content_key LIKE '%obligations%'
    AND component_type IN ('dropdown_container', 'dropdown_option', 'placeholder')
    AND created_at > (CURRENT_TIMESTAMP - INTERVAL '1 hour');  -- Only recent additions

-- Verify content_items were removed
DO $$
DECLARE
    remaining_items INTEGER;
BEGIN
    SELECT COUNT(*) INTO remaining_items
    FROM content_items
    WHERE screen_location = 'refinance_step3' 
        AND content_key LIKE '%obligations%';
    
    RAISE NOTICE 'Remaining obligations content_items for refinance_step3: %', remaining_items;
    
    IF remaining_items = 0 THEN
        RAISE NOTICE 'SUCCESS: All obligations dropdown content removed from refinance_step3';
    ELSE
        RAISE WARNING 'WARNING: % obligations items still remain in refinance_step3', remaining_items;
    END IF;
END $$;

-- =============================================================================
-- STEP 3: Restore from backup if available
-- =============================================================================

-- Restore original data if backup tables exist
DO $$
BEGIN
    -- Check if backup tables exist
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'content_items_backup_20250112') THEN
        -- Restore content_items from backup
        INSERT INTO content_items (content_key, component_type, category, screen_location, is_active)
        SELECT content_key, component_type, category, screen_location, is_active
        FROM content_items_backup_20250112
        WHERE screen_location = 'refinance_step3'
        ON CONFLICT (content_key) DO NOTHING;
        
        RAISE NOTICE 'Restored content_items from backup';
    ELSE
        RAISE NOTICE 'No content_items backup found - original state was empty';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'content_translations_backup_20250112') THEN
        -- Restore translations from backup
        INSERT INTO content_translations (content_item_id, language_code, content_value, status)
        SELECT content_item_id, language_code, content_value, status
        FROM content_translations_backup_20250112
        ON CONFLICT (content_item_id, language_code) DO NOTHING;
        
        RAISE NOTICE 'Restored content_translations from backup';
    ELSE
        RAISE NOTICE 'No content_translations backup found - original state was empty';
    END IF;
END $$;

-- =============================================================================
-- STEP 4: Validation and cleanup
-- =============================================================================

-- Final validation
DO $$
DECLARE
    obligations_items INTEGER;
    obligations_translations INTEGER;
BEGIN
    SELECT COUNT(*) INTO obligations_items
    FROM content_items
    WHERE screen_location = 'refinance_step3' 
        AND content_key LIKE '%obligations%';
    
    SELECT COUNT(*) INTO obligations_translations
    FROM content_items ci
    JOIN content_translations ct ON ci.id = ct.content_item_id
    WHERE ci.screen_location = 'refinance_step3' 
        AND ci.content_key LIKE '%obligations%';
    
    RAISE NOTICE '=============================================================================';
    RAISE NOTICE 'ROLLBACK COMPLETED';
    RAISE NOTICE '=============================================================================';
    RAISE NOTICE 'Refinance Step 3 Obligations - Post-Rollback Status:';
    RAISE NOTICE '  - Content Items: %', obligations_items;
    RAISE NOTICE '  - Translations: %', obligations_translations;
    RAISE NOTICE '  - Expected Behavior: /api/dropdowns/refinance_step3/he will return null for obligations';
    RAISE NOTICE '  - Frontend Impact: Hebrew obligations dropdown will show English fallback text';
    RAISE NOTICE '=============================================================================';
END $$;

-- Optional: Clean up backup tables (uncomment if desired)
-- DROP TABLE IF EXISTS content_items_backup_20250112;
-- DROP TABLE IF EXISTS content_translations_backup_20250112;

-- Commit the rollback transaction
COMMIT;

-- =============================================================================
-- POST-ROLLBACK VERIFICATION
-- =============================================================================
-- After running this rollback script, verify the system is back to original state:
--
-- 1. Test API endpoint (should return null/empty for obligations):
--    curl "https://your-production-domain/api/dropdowns/refinance_step3/he" | jq '.options.refinance_step3_obligations'
--
-- 2. Check database (should show no obligations for refinance_step3):
--    SELECT COUNT(*) FROM content_items WHERE screen_location = 'refinance_step3' AND content_key LIKE '%obligations%';
--
-- 3. Frontend verification:
--    Navigate to: https://your-production-domain/services/refinance-mortgage/3
--    Language: Hebrew (he) 
--    Expected: Obligations dropdown shows "Select obligation type" (English fallback)
-- =============================================================================
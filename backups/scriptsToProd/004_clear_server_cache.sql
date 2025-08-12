-- =============================================================================
-- PRODUCTION SCRIPT: Clear Server Cache After Obligations Dropdown Fix
-- =============================================================================
-- Date: 2025-01-12
-- Purpose: Clear server-side NodeCache after dropdown content changes
-- Context: After adding/fixing obligations dropdown content, server cache needs refresh
-- 
-- IMPORTANT: This script must be run AFTER any content_items/content_translations changes
-- to ensure the API endpoints return fresh data from database instead of stale cache
-- =============================================================================

-- This script doesn't directly clear NodeCache (that's application-level)
-- Instead, it provides verification queries and cache-busting strategies

-- =============================================================================
-- STEP 1: Document Current Cache State (for troubleshooting)
-- =============================================================================

DO $$
BEGIN
    RAISE NOTICE '=============================================================================';
    RAISE NOTICE 'SERVER CACHE CLEARING VERIFICATION';
    RAISE NOTICE 'Generated: %', CURRENT_TIMESTAMP;
    RAISE NOTICE '=============================================================================';
    RAISE NOTICE 'This script provides validation that obligations dropdown fixes are complete';
    RAISE NOTICE 'and gives instructions for clearing server-side NodeCache.';
    RAISE NOTICE '';
    RAISE NOTICE 'CONTEXT: After running obligations dropdown fix scripts, the Node.js server';
    RAISE NOTICE 'may still serve cached (stale) dropdown data for 5 minutes.';
    RAISE NOTICE '';
    RAISE NOTICE 'SOLUTION: Clear server cache OR wait 5 minutes for natural expiration';
    RAISE NOTICE '=============================================================================';
END $$;

-- =============================================================================
-- STEP 2: Verify Database Has Fresh Obligations Content
-- =============================================================================

-- Verify all three screens have obligations content
DO $$
DECLARE
    mortgage_obligations INTEGER;
    credit_obligations INTEGER;
    refinance_obligations INTEGER;
    screen_status TEXT := '';
BEGIN
    -- Count obligations for each screen
    SELECT COUNT(*) INTO mortgage_obligations
    FROM content_items ci
    JOIN content_translations ct ON ci.id = ct.content_item_id
    WHERE ci.screen_location = 'mortgage_step3'
        AND ci.content_key LIKE '%obligations%'
        AND ci.component_type = 'dropdown_option'
        AND ct.language_code = 'he'
        AND ct.status = 'approved';
    
    SELECT COUNT(*) INTO credit_obligations
    FROM content_items ci
    JOIN content_translations ct ON ci.id = ct.content_item_id
    WHERE ci.screen_location = 'credit_step3'
        AND ci.content_key LIKE '%obligations%'
        AND ci.component_type = 'dropdown_option'
        AND ct.language_code = 'he'
        AND ct.status = 'approved';
    
    SELECT COUNT(*) INTO refinance_obligations
    FROM content_items ci
    JOIN content_translations ct ON ci.id = ct.content_item_id
    WHERE ci.screen_location = 'refinance_step3'
        AND ci.content_key LIKE '%obligations%'
        AND ci.component_type = 'dropdown_option'
        AND ct.language_code = 'he'
        AND ct.status = 'approved';
    
    RAISE NOTICE 'DATABASE CONTENT VERIFICATION:';
    RAISE NOTICE '  mortgage_step3 Hebrew obligations: % options', mortgage_obligations;
    RAISE NOTICE '  credit_step3 Hebrew obligations: % options', credit_obligations;
    RAISE NOTICE '  refinance_step3 Hebrew obligations: % options', refinance_obligations;
    
    -- Build status summary
    IF mortgage_obligations > 0 THEN screen_status := screen_status || 'mortgage:OK '; ELSE screen_status := screen_status || 'mortgage:MISSING '; END IF;
    IF credit_obligations > 0 THEN screen_status := screen_status || 'credit:OK '; ELSE screen_status := screen_status || 'credit:MISSING '; END IF;
    IF refinance_obligations > 0 THEN screen_status := screen_status || 'refinance:OK '; ELSE screen_status := screen_status || 'refinance:MISSING '; END IF;
    
    RAISE NOTICE '  Status: %', screen_status;
    
    IF mortgage_obligations = 0 OR credit_obligations = 0 OR refinance_obligations = 0 THEN
        RAISE WARNING '⚠️  Some screens are missing obligations content!';
        RAISE WARNING '   Run the appropriate fix scripts before clearing cache.';
    ELSE
        RAISE NOTICE '✅ Database has complete obligations content for all screens';
        RAISE NOTICE '   Ready to clear server cache to serve fresh data';
    END IF;
END $$;

-- =============================================================================
-- STEP 3: Generate Cache-Busting Information
-- =============================================================================

-- Show the exact cache keys that need to be cleared
DO $$
DECLARE
    cache_keys TEXT[] := ARRAY[
        'dropdowns_mortgage_step3_en', 'dropdowns_mortgage_step3_he', 'dropdowns_mortgage_step3_ru',
        'dropdowns_credit_step3_en', 'dropdowns_credit_step3_he', 'dropdowns_credit_step3_ru',
        'dropdowns_refinance_step3_en', 'dropdowns_refinance_step3_he', 'dropdowns_refinance_step3_ru'
    ];
    cache_key TEXT;
BEGIN
    RAISE NOTICE '=============================================================================';
    RAISE NOTICE 'SERVER CACHE KEYS THAT NEED CLEARING:';
    RAISE NOTICE '=============================================================================';
    RAISE NOTICE 'The following NodeCache keys contain stale dropdown data:';
    RAISE NOTICE '';
    
    FOREACH cache_key IN ARRAY cache_keys LOOP
        RAISE NOTICE '  🗑️  %', cache_key;
    END LOOP;
    
    RAISE NOTICE '';
    RAISE NOTICE 'These keys will be automatically cleared by:';
    RAISE NOTICE '  - Natural expiration (5 minutes)';
    RAISE NOTICE '  - Server restart';
    RAISE NOTICE '  - Manual cache clear API calls (see instructions below)';
END $$;

-- =============================================================================
-- STEP 4: Provide Cache Clearing Instructions
-- =============================================================================

DO $$
BEGIN
    RAISE NOTICE '=============================================================================';
    RAISE NOTICE 'CACHE CLEARING INSTRUCTIONS';
    RAISE NOTICE '=============================================================================';
    RAISE NOTICE '';
    RAISE NOTICE 'OPTION 1: Manual API Cache Clear (Recommended)';
    RAISE NOTICE '  Run these curl commands against your production server:';
    RAISE NOTICE '';
    RAISE NOTICE '  # Clear all dropdown cache';
    RAISE NOTICE '  curl -X DELETE "https://your-production-domain/api/dropdowns/cache/clear"';
    RAISE NOTICE '';
    RAISE NOTICE '  # Clear specific screen cache (if needed)';
    RAISE NOTICE '  curl -X DELETE "https://your-production-domain/api/dropdowns/cache/clear/mortgage_step3_he"';
    RAISE NOTICE '  curl -X DELETE "https://your-production-domain/api/dropdowns/cache/clear/credit_step3_he"';
    RAISE NOTICE '  curl -X DELETE "https://your-production-domain/api/dropdowns/cache/clear/refinance_step3_he"';
    RAISE NOTICE '';
    RAISE NOTICE 'OPTION 2: Server Restart (Nuclear Option)';
    RAISE NOTICE '  # Restart Node.js server (clears all cache)';
    RAISE NOTICE '  pm2 restart server-db  # if using PM2';
    RAISE NOTICE '  # OR';
    RAISE NOTICE '  pkill -f "server-db.js" && node server/server-db.js &';
    RAISE NOTICE '';
    RAISE NOTICE 'OPTION 3: Wait for Natural Expiration';
    RAISE NOTICE '  Cache TTL is 5 minutes - wait 5 minutes after database changes';
    RAISE NOTICE '  Fresh data will be served automatically after expiration';
    RAISE NOTICE '';
    RAISE NOTICE 'VERIFICATION: Test API Endpoints After Cache Clear';
    RAISE NOTICE '  curl "https://your-production-domain/api/dropdowns/refinance_step3/he" | jq ".options.refinance_step3_obligations | length"';
    RAISE NOTICE '  Expected: Should return a number > 0 (not null)';
END $$;

-- =============================================================================
-- STEP 5: Cache Status Monitoring Queries
-- =============================================================================

-- Provide queries to monitor cache effectiveness
DO $$
BEGIN
    RAISE NOTICE '=============================================================================';
    RAISE NOTICE 'CACHE MONITORING QUERIES';
    RAISE NOTICE '=============================================================================';
    RAISE NOTICE '';
    RAISE NOTICE 'After clearing cache, use these API endpoints to monitor cache status:';
    RAISE NOTICE '';
    RAISE NOTICE '1. Check cache statistics:';
    RAISE NOTICE '   curl "https://your-production-domain/api/dropdowns/cache/stats" | jq';
    RAISE NOTICE '';
    RAISE NOTICE '2. Test obligations dropdown with cache info:';
    RAISE NOTICE '   curl "https://your-production-domain/api/dropdowns/refinance_step3/he" | jq ".cache_info"';
    RAISE NOTICE '';
    RAISE NOTICE '3. Verify Hebrew obligations are served:';
    RAISE NOTICE '   curl "https://your-production-domain/api/dropdowns/refinance_step3/he" | jq ".options.refinance_step3_obligations"';
    RAISE NOTICE '';
    RAISE NOTICE 'Expected cache_info responses:';
    RAISE NOTICE '  - First call after clear: {"hit": false, "processing_time_ms": 30-50}';
    RAISE NOTICE '  - Subsequent calls: {"hit": true, "processing_time_ms": 1-2}';
END $$;

-- =============================================================================
-- STEP 6: Frontend Testing Instructions
-- =============================================================================

DO $$
BEGIN
    RAISE NOTICE '=============================================================================';
    RAISE NOTICE 'FRONTEND TESTING AFTER CACHE CLEAR';
    RAISE NOTICE '=============================================================================';
    RAISE NOTICE '';
    RAISE NOTICE 'After clearing server cache, test these frontend pages:';
    RAISE NOTICE '';
    RAISE NOTICE '1. Mortgage Step 3 (should have working obligations):';
    RAISE NOTICE '   https://your-production-domain/services/calculate-mortgage/3';
    RAISE NOTICE '   Language: עברית (Hebrew)';
    RAISE NOTICE '   Expected: Obligations dropdown shows Hebrew options';
    RAISE NOTICE '';
    RAISE NOTICE '2. Credit Step 3 (newly fixed):';
    RAISE NOTICE '   https://your-production-domain/services/calculate-credit/3';
    RAISE NOTICE '   Language: עברית (Hebrew)';
    RAISE NOTICE '   Expected: Obligations dropdown shows Hebrew options';
    RAISE NOTICE '';
    RAISE NOTICE '3. Refinance Step 3 (newly fixed):';
    RAISE NOTICE '   https://your-production-domain/services/refinance-mortgage/3';
    RAISE NOTICE '   Language: עברית (Hebrew)';
    RAISE NOTICE '   Expected: Obligations dropdown shows Hebrew options (NOT "Select obligation type")';
    RAISE NOTICE '';
    RAISE NOTICE 'IMPORTANT: Test in incognito/private browsing mode to avoid frontend cache!';
    RAISE NOTICE '';
    RAISE NOTICE 'If still showing English fallback text after cache clear:';
    RAISE NOTICE '  1. Check API endpoints directly with curl (see monitoring queries above)';
    RAISE NOTICE '  2. Verify database content (run validation script 002)';
    RAISE NOTICE '  3. Check server logs for dropdown API errors';
    RAISE NOTICE '  4. Verify content_key patterns match expected format';
END $$;

-- =============================================================================
-- STEP 7: Success Criteria
-- =============================================================================

DO $$
BEGIN
    RAISE NOTICE '=============================================================================';
    RAISE NOTICE 'SUCCESS CRITERIA - OBLIGATIONS DROPDOWN FIX COMPLETE';
    RAISE NOTICE '=============================================================================';
    RAISE NOTICE '';
    RAISE NOTICE 'Consider the obligations dropdown fix successful when ALL criteria are met:';
    RAISE NOTICE '';
    RAISE NOTICE '✅ Database Criteria:';
    RAISE NOTICE '   - mortgage_step3 has Hebrew obligations content (source)';
    RAISE NOTICE '   - credit_step3 has Hebrew obligations content (copied)';  
    RAISE NOTICE '   - refinance_step3 has Hebrew obligations content (copied)';
    RAISE NOTICE '   - All three screens have 5+ obligation options in Hebrew';
    RAISE NOTICE '';
    RAISE NOTICE '✅ API Criteria:';
    RAISE NOTICE '   - /api/dropdowns/mortgage_step3/he returns obligations options';
    RAISE NOTICE '   - /api/dropdowns/credit_step3/he returns obligations options';
    RAISE NOTICE '   - /api/dropdowns/refinance_step3/he returns obligations options';
    RAISE NOTICE '   - All responses have cache_info with processing times <50ms';
    RAISE NOTICE '';
    RAISE NOTICE '✅ Frontend Criteria:';
    RAISE NOTICE '   - Hebrew obligations dropdown works on mortgage calculator step 3';
    RAISE NOTICE '   - Hebrew obligations dropdown works on credit calculator step 3';
    RAISE NOTICE '   - Hebrew obligations dropdown works on refinance calculator step 3';
    RAISE NOTICE '   - No "Select obligation type" English fallback text visible';
    RAISE NOTICE '';
    RAISE NOTICE '✅ Cache Criteria:';
    RAISE NOTICE '   - Server cache serves fresh dropdown data';
    RAISE NOTICE '   - Cache hit rate returns to 90%+ after initial clear';
    RAISE NOTICE '   - No stale/null obligations data in cache';
    RAISE NOTICE '';
    RAISE NOTICE 'If any criteria fail, re-run the appropriate scripts and clear cache again.';
    RAISE NOTICE '=============================================================================';
END $$;

-- This script is read-only and doesn't modify any data
-- It provides comprehensive instructions for clearing server cache after dropdown fixes
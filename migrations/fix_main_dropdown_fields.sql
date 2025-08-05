-- Migration: Fix Main Dropdown Field Definitions
-- Date: 2025-01-22
-- Purpose: Fix main dropdown field definitions for drill page
-- Only fixing what's needed, no duplicates

-- =====================================================
-- STEP 1: MOVE mortgage_refinance_bank TO CORRECT SCREEN LOCATION
-- =====================================================

-- Update mortgage_refinance_bank to correct screen location
UPDATE content_items 
SET screen_location = 'refinance_mortgage_1'
WHERE content_key = 'mortgage_refinance_bank' 
AND screen_location = 'refinance_mortgage_2';

-- =====================================================
-- STEP 2: UPDATE COMPONENT_TYPE TO DROPDOWN FOR MAIN FIELDS
-- =====================================================

-- Update mortgage_refinance_type to dropdown
UPDATE content_items 
SET component_type = 'dropdown'
WHERE content_key = 'mortgage_refinance_type' 
AND screen_location = 'refinance_mortgage_1'
AND component_type = 'text';

-- Update mortgage_refinance_registered to dropdown
UPDATE content_items 
SET component_type = 'dropdown'
WHERE content_key = 'mortgage_refinance_registered' 
AND screen_location = 'refinance_mortgage_1'
AND component_type = 'text';

-- =====================================================
-- VERIFICATION QUERY
-- =====================================================

-- Verify the fixes were successful
SELECT 
    content_key,
    component_type,
    screen_location,
    CASE 
        WHEN component_type = 'dropdown' THEN '✅ CORRECT'
        WHEN component_type = 'text' THEN '❌ NEEDS FIX'
        ELSE '⚠️ UNKNOWN'
    END as status
FROM content_items 
WHERE content_key IN ('mortgage_refinance_bank', 'mortgage_refinance_type', 'mortgage_refinance_registered')
ORDER BY content_key; 
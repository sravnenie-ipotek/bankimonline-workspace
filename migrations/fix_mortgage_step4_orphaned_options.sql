-- ================================================================
-- FIX MORTGAGE STEP4 ORPHANED OPTIONS (SAFE VERSION)
-- ================================================================
-- This script fixes orphaned options in mortgage_step4 screen
-- SAFETY: Uses safe UPDATE operations to rename orphaned options
-- ANALYSIS: mortgage_step4_filter dropdown exists, rename orphaned options to match
-- FOLLOWS: @dropDownsInDBLogic standards
-- 
-- Fixes:
-- app.mortgage.step4.filter_option_* → mortgage_step4_filter_option_*
-- 
-- Date: 2025-01-25
-- ================================================================

BEGIN;

-- ================================================================
-- STEP 1: Fix Filter Options (app.mortgage.step4.filter_option_* → mortgage_step4_filter_option_*)
-- ================================================================

UPDATE content_items 
SET content_key = 'mortgage_step4_filter_option_1'
WHERE content_key = 'app.mortgage.step4.filter_option_1' 
AND screen_location = 'mortgage_step4';

UPDATE content_items 
SET content_key = 'mortgage_step4_filter_option_2'
WHERE content_key = 'app.mortgage.step4.filter_option_2' 
AND screen_location = 'mortgage_step4';

UPDATE content_items 
SET content_key = 'mortgage_step4_filter_option_3'
WHERE content_key = 'app.mortgage.step4.filter_option_3' 
AND screen_location = 'mortgage_step4';

UPDATE content_items 
SET content_key = 'mortgage_step4_filter_option_4'
WHERE content_key = 'app.mortgage.step4.filter_option_4' 
AND screen_location = 'mortgage_step4';

-- ================================================================
-- STEP 2: Ensure all options have proper category (form)
-- ================================================================

UPDATE content_items 
SET category = 'form'
WHERE screen_location = 'mortgage_step4' 
AND component_type = 'option' 
AND category != 'form';

-- ================================================================
-- STEP 3: Ensure all options have proper component_type (option)
-- ================================================================

UPDATE content_items 
SET component_type = 'option'
WHERE screen_location = 'mortgage_step4' 
AND component_type = 'dropdown_option';

COMMIT;

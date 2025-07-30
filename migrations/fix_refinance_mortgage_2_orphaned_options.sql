-- ================================================================
-- FIX REFINANCE MORTGAGE 2 ORPHANED OPTIONS (FINAL FIX!)
-- ================================================================
-- This script fixes the last 2 orphaned options in refinance_mortgage_2 screen
-- SAFETY: Uses safe UPDATE operations to rename orphaned options
-- ANALYSIS: mortgage_refinance_registered dropdown exists, rename orphaned options to match
-- FOLLOWS: @dropDownsInDBLogic standards
-- 
-- Fixes:
-- mortgage_refinance_reg_option_* → mortgage_refinance_registered_option_*
-- 
-- Date: 2025-01-25
-- ================================================================

BEGIN;

-- ================================================================
-- STEP 1: Fix Registration Options (mortgage_refinance_reg_option_* → mortgage_refinance_registered_option_*)
-- ================================================================

UPDATE content_items 
SET content_key = 'mortgage_refinance_registered_option_1'
WHERE content_key = 'mortgage_refinance_reg_option_1' 
AND screen_location = 'refinance_mortgage_2';

UPDATE content_items 
SET content_key = 'mortgage_refinance_registered_option_2'
WHERE content_key = 'mortgage_refinance_reg_option_2' 
AND screen_location = 'refinance_mortgage_2';

-- ================================================================
-- STEP 2: Ensure all options have proper category (form)
-- ================================================================

UPDATE content_items 
SET category = 'form'
WHERE screen_location = 'refinance_mortgage_2' 
AND component_type = 'option' 
AND category != 'form';

-- ================================================================
-- STEP 3: Ensure all options have proper component_type (option)
-- ================================================================

UPDATE content_items 
SET component_type = 'option'
WHERE screen_location = 'refinance_mortgage_2' 
AND component_type = 'dropdown_option';

COMMIT;

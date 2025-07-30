-- ================================================================
-- FIX REFINANCE CREDIT 3 ORPHANED OPTIONS (SAFE VERSION)
-- ================================================================
-- This script fixes orphaned options in refinance_credit_3 screen
-- SAFETY: Uses safe UPDATE operations
-- WILL NOT DELETE: Only renames orphaned options to match parent dropdowns
-- 
-- Fixes:
-- 1. calculate_mortgage_debt_types_option_1-5 → refinance_credit_debt_types_option_1-5
-- 2. calculate_mortgage_has_additional_option_1-7 → refinance_credit_additional_income_option_1-7
-- 3. calculate_mortgage_main_source_option_1-7 → refinance_credit_main_source_option_1-7
-- 
-- Date: 2025-01-25
-- ================================================================

BEGIN;

-- ================================================================
-- STEP 1: Fix Debt Types Options (calculate_mortgage_debt_types_option_* → refinance_credit_debt_types_option_*)
-- ================================================================

UPDATE content_items 
SET content_key = 'refinance_credit_debt_types_option_1'
WHERE content_key = 'calculate_mortgage_debt_types_option_1' 
AND screen_location = 'refinance_credit_3';

UPDATE content_items 
SET content_key = 'refinance_credit_debt_types_option_2'
WHERE content_key = 'calculate_mortgage_debt_types_option_2' 
AND screen_location = 'refinance_credit_3';

UPDATE content_items 
SET content_key = 'refinance_credit_debt_types_option_3'
WHERE content_key = 'calculate_mortgage_debt_types_option_3' 
AND screen_location = 'refinance_credit_3';

UPDATE content_items 
SET content_key = 'refinance_credit_debt_types_option_4'
WHERE content_key = 'calculate_mortgage_debt_types_option_4' 
AND screen_location = 'refinance_credit_3';

UPDATE content_items 
SET content_key = 'refinance_credit_debt_types_option_5'
WHERE content_key = 'calculate_mortgage_debt_types_option_5' 
AND screen_location = 'refinance_credit_3';

-- ================================================================
-- STEP 2: Fix Additional Income Options (calculate_mortgage_has_additional_option_* → refinance_credit_additional_income_option_*)
-- ================================================================

UPDATE content_items 
SET content_key = 'refinance_credit_additional_income_option_1'
WHERE content_key = 'calculate_mortgage_has_additional_option_1' 
AND screen_location = 'refinance_credit_3';

UPDATE content_items 
SET content_key = 'refinance_credit_additional_income_option_2'
WHERE content_key = 'calculate_mortgage_has_additional_option_2' 
AND screen_location = 'refinance_credit_3';

UPDATE content_items 
SET content_key = 'refinance_credit_additional_income_option_3'
WHERE content_key = 'calculate_mortgage_has_additional_option_3' 
AND screen_location = 'refinance_credit_3';

UPDATE content_items 
SET content_key = 'refinance_credit_additional_income_option_4'
WHERE content_key = 'calculate_mortgage_has_additional_option_4' 
AND screen_location = 'refinance_credit_3';

UPDATE content_items 
SET content_key = 'refinance_credit_additional_income_option_5'
WHERE content_key = 'calculate_mortgage_has_additional_option_5' 
AND screen_location = 'refinance_credit_3';

UPDATE content_items 
SET content_key = 'refinance_credit_additional_income_option_6'
WHERE content_key = 'calculate_mortgage_has_additional_option_6' 
AND screen_location = 'refinance_credit_3';

UPDATE content_items 
SET content_key = 'refinance_credit_additional_income_option_7'
WHERE content_key = 'calculate_mortgage_has_additional_option_7' 
AND screen_location = 'refinance_credit_3';

-- ================================================================
-- STEP 3: Fix Main Source Options (calculate_mortgage_main_source_option_* → refinance_credit_main_source_option_*)
-- ================================================================

UPDATE content_items 
SET content_key = 'refinance_credit_main_source_option_1'
WHERE content_key = 'calculate_mortgage_main_source_option_1' 
AND screen_location = 'refinance_credit_3';

UPDATE content_items 
SET content_key = 'refinance_credit_main_source_option_2'
WHERE content_key = 'calculate_mortgage_main_source_option_2' 
AND screen_location = 'refinance_credit_3';

UPDATE content_items 
SET content_key = 'refinance_credit_main_source_option_3'
WHERE content_key = 'calculate_mortgage_main_source_option_3' 
AND screen_location = 'refinance_credit_3';

UPDATE content_items 
SET content_key = 'refinance_credit_main_source_option_4'
WHERE content_key = 'calculate_mortgage_main_source_option_4' 
AND screen_location = 'refinance_credit_3';

UPDATE content_items 
SET content_key = 'refinance_credit_main_source_option_5'
WHERE content_key = 'calculate_mortgage_main_source_option_5' 
AND screen_location = 'refinance_credit_3';

UPDATE content_items 
SET content_key = 'refinance_credit_main_source_option_6'
WHERE content_key = 'calculate_mortgage_main_source_option_6' 
AND screen_location = 'refinance_credit_3';

UPDATE content_items 
SET content_key = 'refinance_credit_main_source_option_7'
WHERE content_key = 'calculate_mortgage_main_source_option_7' 
AND screen_location = 'refinance_credit_3';

-- ================================================================
-- STEP 4: Ensure all options have proper category (form)
-- ================================================================

UPDATE content_items 
SET category = 'form'
WHERE screen_location = 'refinance_credit_3' 
AND component_type = 'option' 
AND category IS NULL;

-- ================================================================
-- STEP 5: Ensure all options have proper component_type (option)
-- ================================================================

UPDATE content_items 
SET component_type = 'option'
WHERE screen_location = 'refinance_credit_3' 
AND component_type = 'dropdown_option';

COMMIT; 
-- ================================================================
-- FIX MORTGAGE STEP3 ORPHANED OPTIONS (SAFE VERSION)
-- ================================================================
-- This script fixes orphaned options in mortgage_step3 screen
-- SAFETY: Uses safe UPDATE operations to rename orphaned options
-- ANALYSIS: No proper options exist yet, so rename orphaned options to match dropdowns
-- 
-- Fixes:
-- 1. app.mortgage.step3.additional_income_option_* → mortgage_step3_additional_income_option_*
-- 2. app.mortgage.step3.main_source_income_option_* → mortgage_step3_main_source_option_*
-- 3. app.mortgage.step3.obligations_option_* → mortgage_step3_obligations_option_*
-- 4. calculate_mortgage_sphere_option_* → DELETE (no corresponding dropdown)
-- 
-- Date: 2025-01-25
-- ================================================================

BEGIN;

-- ================================================================
-- STEP 1: Fix Additional Income Options (app.mortgage.step3.additional_income_option_* → mortgage_step3_additional_income_option_*)
-- ================================================================

UPDATE content_items 
SET content_key = 'mortgage_step3_additional_income_option_1'
WHERE content_key = 'app.mortgage.step3.additional_income_option_1' 
AND screen_location = 'mortgage_step3';

UPDATE content_items 
SET content_key = 'mortgage_step3_additional_income_option_2'
WHERE content_key = 'app.mortgage.step3.additional_income_option_2' 
AND screen_location = 'mortgage_step3';

UPDATE content_items 
SET content_key = 'mortgage_step3_additional_income_option_3'
WHERE content_key = 'app.mortgage.step3.additional_income_option_3' 
AND screen_location = 'mortgage_step3';

UPDATE content_items 
SET content_key = 'mortgage_step3_additional_income_option_4'
WHERE content_key = 'app.mortgage.step3.additional_income_option_4' 
AND screen_location = 'mortgage_step3';

UPDATE content_items 
SET content_key = 'mortgage_step3_additional_income_option_5'
WHERE content_key = 'app.mortgage.step3.additional_income_option_5' 
AND screen_location = 'mortgage_step3';

UPDATE content_items 
SET content_key = 'mortgage_step3_additional_income_option_6'
WHERE content_key = 'app.mortgage.step3.additional_income_option_6' 
AND screen_location = 'mortgage_step3';

UPDATE content_items 
SET content_key = 'mortgage_step3_additional_income_option_7'
WHERE content_key = 'app.mortgage.step3.additional_income_option_7' 
AND screen_location = 'mortgage_step3';

-- ================================================================
-- STEP 2: Fix Main Source Options (app.mortgage.step3.main_source_income_option_* → mortgage_step3_main_source_option_*)
-- ================================================================

UPDATE content_items 
SET content_key = 'mortgage_step3_main_source_option_1'
WHERE content_key = 'app.mortgage.step3.main_source_income_option_1' 
AND screen_location = 'mortgage_step3';

UPDATE content_items 
SET content_key = 'mortgage_step3_main_source_option_2'
WHERE content_key = 'app.mortgage.step3.main_source_income_option_2' 
AND screen_location = 'mortgage_step3';

UPDATE content_items 
SET content_key = 'mortgage_step3_main_source_option_3'
WHERE content_key = 'app.mortgage.step3.main_source_income_option_3' 
AND screen_location = 'mortgage_step3';

UPDATE content_items 
SET content_key = 'mortgage_step3_main_source_option_4'
WHERE content_key = 'app.mortgage.step3.main_source_income_option_4' 
AND screen_location = 'mortgage_step3';

UPDATE content_items 
SET content_key = 'mortgage_step3_main_source_option_5'
WHERE content_key = 'app.mortgage.step3.main_source_income_option_5' 
AND screen_location = 'mortgage_step3';

UPDATE content_items 
SET content_key = 'mortgage_step3_main_source_option_6'
WHERE content_key = 'app.mortgage.step3.main_source_income_option_6' 
AND screen_location = 'mortgage_step3';

UPDATE content_items 
SET content_key = 'mortgage_step3_main_source_option_7'
WHERE content_key = 'app.mortgage.step3.main_source_income_option_7' 
AND screen_location = 'mortgage_step3';

-- ================================================================
-- STEP 3: Fix Obligations Options (app.mortgage.step3.obligations_option_* → mortgage_step3_obligations_option_*)
-- ================================================================

UPDATE content_items 
SET content_key = 'mortgage_step3_obligations_option_1'
WHERE content_key = 'app.mortgage.step3.obligations_option_1' 
AND screen_location = 'mortgage_step3';

UPDATE content_items 
SET content_key = 'mortgage_step3_obligations_option_2'
WHERE content_key = 'app.mortgage.step3.obligations_option_2' 
AND screen_location = 'mortgage_step3';

UPDATE content_items 
SET content_key = 'mortgage_step3_obligations_option_3'
WHERE content_key = 'app.mortgage.step3.obligations_option_3' 
AND screen_location = 'mortgage_step3';

UPDATE content_items 
SET content_key = 'mortgage_step3_obligations_option_4'
WHERE content_key = 'app.mortgage.step3.obligations_option_4' 
AND screen_location = 'mortgage_step3';

UPDATE content_items 
SET content_key = 'mortgage_step3_obligations_option_5'
WHERE content_key = 'app.mortgage.step3.obligations_option_5' 
AND screen_location = 'mortgage_step3';

-- ================================================================
-- STEP 4: Remove Sphere Options (no corresponding dropdown)
-- ================================================================
-- NOTE: These options have no corresponding dropdown container
-- Safe to delete as they are orphaned with no parent dropdown

DELETE FROM content_items 
WHERE content_key LIKE 'calculate_mortgage_sphere_option_%' 
AND screen_location = 'mortgage_step3';

-- ================================================================
-- STEP 5: Ensure all options have proper category (form)
-- ================================================================

UPDATE content_items 
SET category = 'form'
WHERE screen_location = 'mortgage_step3' 
AND component_type = 'option' 
AND category != 'form';

-- ================================================================
-- STEP 6: Ensure all options have proper component_type (option)
-- ================================================================

UPDATE content_items 
SET component_type = 'option'
WHERE screen_location = 'mortgage_step3' 
AND component_type = 'dropdown_option';

COMMIT; 
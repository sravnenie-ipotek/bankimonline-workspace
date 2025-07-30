-- ================================================================
-- FIX MORTGAGE STEP2 ORPHANED OPTIONS (SAFE VERSION - REMOVE DUPLICATES)
-- ================================================================
-- This script fixes orphaned options in mortgage_step2 screen
-- ANALYSIS: The proper options already exist, so orphaned options are duplicates
-- SAFETY: Only deletes duplicate content (proper options already exist)
-- 
-- Situation:
-- - mortgage_step2.field.education_option_1-7 already exist (KEEP)
-- - mortgage_step2.field.family_status_option_1-6 already exist (KEEP)
-- - app.mortgage.step2.education_option_1-7 are duplicates (DELETE)
-- - app.mortgage.step2.family_status_option_1-6 are duplicates (DELETE) 
-- - mortgage_step2_education_option_1-7 are duplicates (DELETE)
-- - calculate_mortgage_citizenship_option_1-9 need to be renamed (UPDATE)
-- 
-- Date: 2025-01-25
-- ================================================================

BEGIN;

-- ================================================================
-- STEP 1: Fix Citizenship Options (calculate_mortgage_citizenship_option_* → mortgage_step2.field.citizenship_option_*)
-- ================================================================
-- These are the only ones that need renaming (no conflicts)

UPDATE content_items 
SET content_key = 'mortgage_step2.field.citizenship_option_1'
WHERE content_key = 'calculate_mortgage_citizenship_option_1' 
AND screen_location = 'mortgage_step2';

UPDATE content_items 
SET content_key = 'mortgage_step2.field.citizenship_option_2'
WHERE content_key = 'calculate_mortgage_citizenship_option_2' 
AND screen_location = 'mortgage_step2';

UPDATE content_items 
SET content_key = 'mortgage_step2.field.citizenship_option_3'
WHERE content_key = 'calculate_mortgage_citizenship_option_3' 
AND screen_location = 'mortgage_step2';

UPDATE content_items 
SET content_key = 'mortgage_step2.field.citizenship_option_4'
WHERE content_key = 'calculate_mortgage_citizenship_option_4' 
AND screen_location = 'mortgage_step2';

UPDATE content_items 
SET content_key = 'mortgage_step2.field.citizenship_option_5'
WHERE content_key = 'calculate_mortgage_citizenship_option_5' 
AND screen_location = 'mortgage_step2';

UPDATE content_items 
SET content_key = 'mortgage_step2.field.citizenship_option_6'
WHERE content_key = 'calculate_mortgage_citizenship_option_6' 
AND screen_location = 'mortgage_step2';

UPDATE content_items 
SET content_key = 'mortgage_step2.field.citizenship_option_7'
WHERE content_key = 'calculate_mortgage_citizenship_option_7' 
AND screen_location = 'mortgage_step2';

UPDATE content_items 
SET content_key = 'mortgage_step2.field.citizenship_option_8'
WHERE content_key = 'calculate_mortgage_citizenship_option_8' 
AND screen_location = 'mortgage_step2';

UPDATE content_items 
SET content_key = 'mortgage_step2.field.citizenship_option_9'
WHERE content_key = 'calculate_mortgage_citizenship_option_9' 
AND screen_location = 'mortgage_step2';

-- ================================================================
-- STEP 2: Remove Duplicate Education Options (app.mortgage.step2.education_option_*)
-- ================================================================
-- NOTE: The proper options (mortgage_step2.field.education_option_*) already exist
-- These are duplicates and safe to delete

DELETE FROM content_items 
WHERE content_key LIKE 'app.mortgage.step2.education_option_%' 
AND screen_location = 'mortgage_step2';

-- ================================================================
-- STEP 3: Remove Duplicate Family Status Options (app.mortgage.step2.family_status_option_*)
-- ================================================================
-- NOTE: The proper options (mortgage_step2.field.family_status_option_*) already exist
-- These are duplicates and safe to delete

DELETE FROM content_items 
WHERE content_key LIKE 'app.mortgage.step2.family_status_option_%' 
AND screen_location = 'mortgage_step2';

-- ================================================================
-- STEP 4: Remove Duplicate Education Options (mortgage_step2_education_option_*)
-- ================================================================
-- NOTE: The proper options (mortgage_step2.field.education_option_*) already exist
-- These are duplicates and safe to delete

DELETE FROM content_items 
WHERE content_key LIKE 'mortgage_step2_education_option_%' 
AND screen_location = 'mortgage_step2';

-- ================================================================
-- STEP 5: Ensure all options have proper category (form)
-- ================================================================

UPDATE content_items 
SET category = 'form'
WHERE screen_location = 'mortgage_step2' 
AND component_type = 'option' 
AND category != 'form';

-- ================================================================
-- STEP 6: Ensure all options have proper component_type (option)
-- ================================================================

UPDATE content_items 
SET component_type = 'option'
WHERE screen_location = 'mortgage_step2' 
AND component_type = 'dropdown_option';

COMMIT;
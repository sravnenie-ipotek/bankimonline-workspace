-- ================================================================
-- FIX REFINANCE STEP1 ORPHANED OPTIONS (SAFE VERSION)
-- ================================================================
-- This script fixes orphaned options in refinance_step1 screen
-- SAFETY: Uses safe UPDATE operations to rename orphaned options
-- ANALYSIS: No proper options exist yet, so rename orphaned options to match dropdowns
-- 
-- Fixes:
-- 1. app.refinance.step1.bank_* → refinance_step1_bank_*
-- 2. app.refinance.step1.program_option_* → refinance_step1_program_option_*
-- 3. app.refinance.step1.property_option_* → refinance_step1_property_type_option_*
-- 4. app.refinance.step1.registered_option_* → refinance_step1_registration_option_*
-- 5. app.refinance.step1.why_option_* → refinance_step1_why_option_*
-- 
-- Date: 2025-01-25
-- ================================================================

BEGIN;

-- ================================================================
-- STEP 1: Fix Bank Options (app.refinance.step1.bank_* → refinance_step1_bank_*)
-- ================================================================

UPDATE content_items 
SET content_key = 'refinance_step1_bank_discount'
WHERE content_key = 'app.refinance.step1.bank_discount' 
AND screen_location = 'refinance_step1';

UPDATE content_items 
SET content_key = 'refinance_step1_bank_hapoalim'
WHERE content_key = 'app.refinance.step1.bank_hapoalim' 
AND screen_location = 'refinance_step1';

UPDATE content_items 
SET content_key = 'refinance_step1_bank_leumi'
WHERE content_key = 'app.refinance.step1.bank_leumi' 
AND screen_location = 'refinance_step1';

UPDATE content_items 
SET content_key = 'refinance_step1_bank_massad'
WHERE content_key = 'app.refinance.step1.bank_massad' 
AND screen_location = 'refinance_step1';

-- ================================================================
-- STEP 2: Fix Program Options (app.refinance.step1.program_option_* → refinance_step1_program_option_*)
-- ================================================================

UPDATE content_items 
SET content_key = 'refinance_step1_program_option_1'
WHERE content_key = 'app.refinance.step1.program_option_1' 
AND screen_location = 'refinance_step1';

UPDATE content_items 
SET content_key = 'refinance_step1_program_option_2'
WHERE content_key = 'app.refinance.step1.program_option_2' 
AND screen_location = 'refinance_step1';

UPDATE content_items 
SET content_key = 'refinance_step1_program_option_3'
WHERE content_key = 'app.refinance.step1.program_option_3' 
AND screen_location = 'refinance_step1';

UPDATE content_items 
SET content_key = 'refinance_step1_program_option_4'
WHERE content_key = 'app.refinance.step1.program_option_4' 
AND screen_location = 'refinance_step1';

UPDATE content_items 
SET content_key = 'refinance_step1_program_option_5'
WHERE content_key = 'app.refinance.step1.program_option_5' 
AND screen_location = 'refinance_step1';

-- ================================================================
-- STEP 3: Fix Property Options (app.refinance.step1.property_option_* → refinance_step1_property_type_option_*)
-- ================================================================

UPDATE content_items 
SET content_key = 'refinance_step1_property_type_option_1'
WHERE content_key = 'app.refinance.step1.property_option_1' 
AND screen_location = 'refinance_step1';

UPDATE content_items 
SET content_key = 'refinance_step1_property_type_option_2'
WHERE content_key = 'app.refinance.step1.property_option_2' 
AND screen_location = 'refinance_step1';

UPDATE content_items 
SET content_key = 'refinance_step1_property_type_option_3'
WHERE content_key = 'app.refinance.step1.property_option_3' 
AND screen_location = 'refinance_step1';

UPDATE content_items 
SET content_key = 'refinance_step1_property_type_option_4'
WHERE content_key = 'app.refinance.step1.property_option_4' 
AND screen_location = 'refinance_step1';

UPDATE content_items 
SET content_key = 'refinance_step1_property_type_option_5'
WHERE content_key = 'app.refinance.step1.property_option_5' 
AND screen_location = 'refinance_step1';

-- ================================================================
-- STEP 4: Fix Registration Options (app.refinance.step1.registered_option_* → refinance_step1_registration_option_*)
-- ================================================================

UPDATE content_items 
SET content_key = 'refinance_step1_registration_option_1'
WHERE content_key = 'app.refinance.step1.registered_option_1' 
AND screen_location = 'refinance_step1';

UPDATE content_items 
SET content_key = 'refinance_step1_registration_option_2'
WHERE content_key = 'app.refinance.step1.registered_option_2' 
AND screen_location = 'refinance_step1';

-- ================================================================
-- STEP 5: Fix Why Options (app.refinance.step1.why_option_* → refinance_step1_why_option_*)
-- ================================================================

UPDATE content_items 
SET content_key = 'refinance_step1_why_option_1'
WHERE content_key = 'app.refinance.step1.why_option_1' 
AND screen_location = 'refinance_step1';

UPDATE content_items 
SET content_key = 'refinance_step1_why_option_2'
WHERE content_key = 'app.refinance.step1.why_option_2' 
AND screen_location = 'refinance_step1';

UPDATE content_items 
SET content_key = 'refinance_step1_why_option_3'
WHERE content_key = 'app.refinance.step1.why_option_3' 
AND screen_location = 'refinance_step1';

UPDATE content_items 
SET content_key = 'refinance_step1_why_option_4'
WHERE content_key = 'app.refinance.step1.why_option_4' 
AND screen_location = 'refinance_step1';

UPDATE content_items 
SET content_key = 'refinance_step1_why_option_5'
WHERE content_key = 'app.refinance.step1.why_option_5' 
AND screen_location = 'refinance_step1';

-- ================================================================
-- STEP 6: Ensure all options have proper category (form)
-- ================================================================

UPDATE content_items 
SET category = 'form'
WHERE screen_location = 'refinance_step1' 
AND component_type = 'option' 
AND category != 'form';

-- ================================================================
-- STEP 7: Ensure all options have proper component_type (option)
-- ================================================================

UPDATE content_items 
SET component_type = 'option'
WHERE screen_location = 'refinance_step1' 
AND component_type = 'dropdown_option';

COMMIT;

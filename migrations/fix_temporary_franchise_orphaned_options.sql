-- ================================================================
-- FIX TEMPORARY FRANCHISE ORPHANED OPTIONS (SAFE VERSION)
-- ================================================================
-- This script fixes orphaned options in temporary_franchise screen
-- SAFETY: Uses safe UPDATE operations to rename orphaned options
-- ANALYSIS: No proper options exist yet, so rename orphaned options to match dropdowns
-- 
-- Fixes:
-- 1. franchise_includes_* → temporary_franchise_includes_*
-- 2. franchise_step_* → temporary_franchise_steps_*
-- 
-- Date: 2025-01-25
-- ================================================================

BEGIN;

-- ================================================================
-- STEP 1: Fix Includes Options (franchise_includes_* → temporary_franchise_includes_*)
-- ================================================================

UPDATE content_items 
SET content_key = 'temporary_franchise_includes_digital_platform'
WHERE content_key = 'franchise_includes_digital_platform' 
AND screen_location = 'temporary_franchise';

UPDATE content_items 
SET content_key = 'temporary_franchise_includes_digital_support'
WHERE content_key = 'franchise_includes_digital_support' 
AND screen_location = 'temporary_franchise';

UPDATE content_items 
SET content_key = 'temporary_franchise_includes_digital_title'
WHERE content_key = 'franchise_includes_digital_title' 
AND screen_location = 'temporary_franchise';

UPDATE content_items 
SET content_key = 'temporary_franchise_includes_digital_tools'
WHERE content_key = 'franchise_includes_digital_tools' 
AND screen_location = 'temporary_franchise';

UPDATE content_items 
SET content_key = 'temporary_franchise_includes_support_consultation'
WHERE content_key = 'franchise_includes_support_consultation' 
AND screen_location = 'temporary_franchise';

UPDATE content_items 
SET content_key = 'temporary_franchise_includes_support_phone'
WHERE content_key = 'franchise_includes_support_phone' 
AND screen_location = 'temporary_franchise';

UPDATE content_items 
SET content_key = 'temporary_franchise_includes_support_title'
WHERE content_key = 'franchise_includes_support_title' 
AND screen_location = 'temporary_franchise';

UPDATE content_items 
SET content_key = 'temporary_franchise_includes_support_training'
WHERE content_key = 'franchise_includes_support_training' 
AND screen_location = 'temporary_franchise';

UPDATE content_items 
SET content_key = 'temporary_franchise_includes_turnkey_benefit_brand'
WHERE content_key = 'franchise_includes_turnkey_benefit_brand' 
AND screen_location = 'temporary_franchise';

UPDATE content_items 
SET content_key = 'temporary_franchise_includes_turnkey_benefit_marketing'
WHERE content_key = 'franchise_includes_turnkey_benefit_marketing' 
AND screen_location = 'temporary_franchise';

UPDATE content_items 
SET content_key = 'temporary_franchise_includes_turnkey_benefit_office'
WHERE content_key = 'franchise_includes_turnkey_benefit_office' 
AND screen_location = 'temporary_franchise';

UPDATE content_items 
SET content_key = 'temporary_franchise_includes_turnkey_benefit_team'
WHERE content_key = 'franchise_includes_turnkey_benefit_team' 
AND screen_location = 'temporary_franchise';

UPDATE content_items 
SET content_key = 'temporary_franchise_includes_turnkey_title'
WHERE content_key = 'franchise_includes_turnkey_title' 
AND screen_location = 'temporary_franchise';

-- ================================================================
-- STEP 2: Fix Steps Options (franchise_step_* → temporary_franchise_steps_*)
-- ================================================================

UPDATE content_items 
SET content_key = 'temporary_franchise_steps_step_1_description'
WHERE content_key = 'franchise_step_1_description' 
AND screen_location = 'temporary_franchise';

UPDATE content_items 
SET content_key = 'temporary_franchise_steps_step_1_title'
WHERE content_key = 'franchise_step_1_title' 
AND screen_location = 'temporary_franchise';

UPDATE content_items 
SET content_key = 'temporary_franchise_steps_step_2_description'
WHERE content_key = 'franchise_step_2_description' 
AND screen_location = 'temporary_franchise';

UPDATE content_items 
SET content_key = 'temporary_franchise_steps_step_2_title'
WHERE content_key = 'franchise_step_2_title' 
AND screen_location = 'temporary_franchise';

UPDATE content_items 
SET content_key = 'temporary_franchise_steps_step_3_description'
WHERE content_key = 'franchise_step_3_description' 
AND screen_location = 'temporary_franchise';

UPDATE content_items 
SET content_key = 'temporary_franchise_steps_step_3_title'
WHERE content_key = 'franchise_step_3_title' 
AND screen_location = 'temporary_franchise';

UPDATE content_items 
SET content_key = 'temporary_franchise_steps_step_4_description'
WHERE content_key = 'franchise_step_4_description' 
AND screen_location = 'temporary_franchise';

UPDATE content_items 
SET content_key = 'temporary_franchise_steps_step_4_title'
WHERE content_key = 'franchise_step_4_title' 
AND screen_location = 'temporary_franchise';

UPDATE content_items 
SET content_key = 'temporary_franchise_steps_step_5_description'
WHERE content_key = 'franchise_step_5_description' 
AND screen_location = 'temporary_franchise';

UPDATE content_items 
SET content_key = 'temporary_franchise_steps_step_5_title'
WHERE content_key = 'franchise_step_5_title' 
AND screen_location = 'temporary_franchise';

-- ================================================================
-- STEP 3: Ensure all options have proper category (form)
-- ================================================================

UPDATE content_items 
SET category = 'form'
WHERE screen_location = 'temporary_franchise' 
AND component_type = 'option' 
AND category != 'form';

-- ================================================================
-- STEP 4: Ensure all options have proper component_type (option)
-- ================================================================

UPDATE content_items 
SET component_type = 'option'
WHERE screen_location = 'temporary_franchise' 
AND component_type = 'dropdown_option';

COMMIT; 
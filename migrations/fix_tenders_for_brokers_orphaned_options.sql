-- ================================================================
-- FIX TENDERS FOR BROKERS ORPHANED OPTIONS (SAFE VERSION)
-- ================================================================
-- This script fixes orphaned options in tenders_for_brokers screen
-- SAFETY: Uses safe UPDATE operations to rename orphaned options
-- ANALYSIS: No proper options exist yet, so rename orphaned options to match dropdowns
-- 
-- Fixes:
-- 1. tenders_license_feature1-3_* → tenders_for_brokers_license_features_*
-- 2. tenders_step1-5_* → tenders_for_brokers_steps_*
-- 
-- Date: 2025-01-25
-- ================================================================

BEGIN;

-- ================================================================
-- STEP 1: Fix License Features Options (tenders_license_feature* → tenders_for_brokers_license_features_*)
-- ================================================================

UPDATE content_items 
SET content_key = 'tenders_for_brokers_license_features_feature1_p1'
WHERE content_key = 'tenders_license_feature1_p1' 
AND screen_location = 'tenders_for_brokers';

UPDATE content_items 
SET content_key = 'tenders_for_brokers_license_features_feature1_p2'
WHERE content_key = 'tenders_license_feature1_p2' 
AND screen_location = 'tenders_for_brokers';

UPDATE content_items 
SET content_key = 'tenders_for_brokers_license_features_feature1_p3'
WHERE content_key = 'tenders_license_feature1_p3' 
AND screen_location = 'tenders_for_brokers';

UPDATE content_items 
SET content_key = 'tenders_for_brokers_license_features_feature1_title'
WHERE content_key = 'tenders_license_feature1_title' 
AND screen_location = 'tenders_for_brokers';

UPDATE content_items 
SET content_key = 'tenders_for_brokers_license_features_feature2_p1'
WHERE content_key = 'tenders_license_feature2_p1' 
AND screen_location = 'tenders_for_brokers';

UPDATE content_items 
SET content_key = 'tenders_for_brokers_license_features_feature2_p2'
WHERE content_key = 'tenders_license_feature2_p2' 
AND screen_location = 'tenders_for_brokers';

UPDATE content_items 
SET content_key = 'tenders_for_brokers_license_features_feature2_p3'
WHERE content_key = 'tenders_license_feature2_p3' 
AND screen_location = 'tenders_for_brokers';

UPDATE content_items 
SET content_key = 'tenders_for_brokers_license_features_feature2_title'
WHERE content_key = 'tenders_license_feature2_title' 
AND screen_location = 'tenders_for_brokers';

UPDATE content_items 
SET content_key = 'tenders_for_brokers_license_features_feature3_p1'
WHERE content_key = 'tenders_license_feature3_p1' 
AND screen_location = 'tenders_for_brokers';

UPDATE content_items 
SET content_key = 'tenders_for_brokers_license_features_feature3_p2'
WHERE content_key = 'tenders_license_feature3_p2' 
AND screen_location = 'tenders_for_brokers';

UPDATE content_items 
SET content_key = 'tenders_for_brokers_license_features_feature3_p3'
WHERE content_key = 'tenders_license_feature3_p3' 
AND screen_location = 'tenders_for_brokers';

UPDATE content_items 
SET content_key = 'tenders_for_brokers_license_features_feature3_title'
WHERE content_key = 'tenders_license_feature3_title' 
AND screen_location = 'tenders_for_brokers';

-- ================================================================
-- STEP 2: Fix Steps Options (tenders_step* → tenders_for_brokers_steps_*)
-- ================================================================

UPDATE content_items 
SET content_key = 'tenders_for_brokers_steps_step1'
WHERE content_key = 'tenders_step1' 
AND screen_location = 'tenders_for_brokers';

UPDATE content_items 
SET content_key = 'tenders_for_brokers_steps_step1_desc'
WHERE content_key = 'tenders_step1_desc' 
AND screen_location = 'tenders_for_brokers';

UPDATE content_items 
SET content_key = 'tenders_for_brokers_steps_step1_title'
WHERE content_key = 'tenders_step1_title' 
AND screen_location = 'tenders_for_brokers';

UPDATE content_items 
SET content_key = 'tenders_for_brokers_steps_step2'
WHERE content_key = 'tenders_step2' 
AND screen_location = 'tenders_for_brokers';

UPDATE content_items 
SET content_key = 'tenders_for_brokers_steps_step2_desc'
WHERE content_key = 'tenders_step2_desc' 
AND screen_location = 'tenders_for_brokers';

UPDATE content_items 
SET content_key = 'tenders_for_brokers_steps_step2_title'
WHERE content_key = 'tenders_step2_title' 
AND screen_location = 'tenders_for_brokers';

UPDATE content_items 
SET content_key = 'tenders_for_brokers_steps_step3'
WHERE content_key = 'tenders_step3' 
AND screen_location = 'tenders_for_brokers';

UPDATE content_items 
SET content_key = 'tenders_for_brokers_steps_step3_desc'
WHERE content_key = 'tenders_step3_desc' 
AND screen_location = 'tenders_for_brokers';

UPDATE content_items 
SET content_key = 'tenders_for_brokers_steps_step3_title'
WHERE content_key = 'tenders_step3_title' 
AND screen_location = 'tenders_for_brokers';

UPDATE content_items 
SET content_key = 'tenders_for_brokers_steps_step4'
WHERE content_key = 'tenders_step4' 
AND screen_location = 'tenders_for_brokers';

UPDATE content_items 
SET content_key = 'tenders_for_brokers_steps_step4_desc'
WHERE content_key = 'tenders_step4_desc' 
AND screen_location = 'tenders_for_brokers';

UPDATE content_items 
SET content_key = 'tenders_for_brokers_steps_step4_title'
WHERE content_key = 'tenders_step4_title' 
AND screen_location = 'tenders_for_brokers';

UPDATE content_items 
SET content_key = 'tenders_for_brokers_steps_step5'
WHERE content_key = 'tenders_step5' 
AND screen_location = 'tenders_for_brokers';

UPDATE content_items 
SET content_key = 'tenders_for_brokers_steps_step5_desc'
WHERE content_key = 'tenders_step5_desc' 
AND screen_location = 'tenders_for_brokers';

UPDATE content_items 
SET content_key = 'tenders_for_brokers_steps_step5_title'
WHERE content_key = 'tenders_step5_title' 
AND screen_location = 'tenders_for_brokers';

-- ================================================================
-- STEP 3: Ensure all options have proper category (form)
-- ================================================================

UPDATE content_items 
SET category = 'form'
WHERE screen_location = 'tenders_for_brokers' 
AND component_type = 'option' 
AND category != 'form';

-- ================================================================
-- STEP 4: Ensure all options have proper component_type (option)
-- ================================================================

UPDATE content_items 
SET component_type = 'option'
WHERE screen_location = 'tenders_for_brokers' 
AND component_type = 'dropdown_option';

COMMIT;
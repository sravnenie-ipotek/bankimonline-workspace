-- ================================================================
-- FIX TENDERS FOR LAWYERS ORPHANED OPTIONS (SAFE VERSION)
-- ================================================================
-- This script fixes orphaned options in tenders_for_lawyers screen
-- SAFETY: Uses safe UPDATE operations to rename orphaned options
-- ANALYSIS: No proper options exist yet, so rename orphaned options to match dropdowns
-- 
-- Fixes:
-- 1. lawyers_process_step_* → tenders_for_lawyers_process_*
-- 2. lawyers_step_* → tenders_for_lawyers_steps_*
-- 
-- Date: 2025-01-25
-- ================================================================

BEGIN;

-- ================================================================
-- STEP 1: Fix Process Options (lawyers_process_step_* → tenders_for_lawyers_process_*)
-- ================================================================

UPDATE content_items 
SET content_key = 'tenders_for_lawyers_process_step_1_description'
WHERE content_key = 'lawyers_process_step_1_description' 
AND screen_location = 'tenders_for_lawyers';

UPDATE content_items 
SET content_key = 'tenders_for_lawyers_process_step_1_title'
WHERE content_key = 'lawyers_process_step_1_title' 
AND screen_location = 'tenders_for_lawyers';

UPDATE content_items 
SET content_key = 'tenders_for_lawyers_process_step_2_description'
WHERE content_key = 'lawyers_process_step_2_description' 
AND screen_location = 'tenders_for_lawyers';

UPDATE content_items 
SET content_key = 'tenders_for_lawyers_process_step_2_title'
WHERE content_key = 'lawyers_process_step_2_title' 
AND screen_location = 'tenders_for_lawyers';

UPDATE content_items 
SET content_key = 'tenders_for_lawyers_process_step_3_description'
WHERE content_key = 'lawyers_process_step_3_description' 
AND screen_location = 'tenders_for_lawyers';

UPDATE content_items 
SET content_key = 'tenders_for_lawyers_process_step_3_title'
WHERE content_key = 'lawyers_process_step_3_title' 
AND screen_location = 'tenders_for_lawyers';

UPDATE content_items 
SET content_key = 'tenders_for_lawyers_process_step_4_description'
WHERE content_key = 'lawyers_process_step_4_description' 
AND screen_location = 'tenders_for_lawyers';

UPDATE content_items 
SET content_key = 'tenders_for_lawyers_process_step_4_title'
WHERE content_key = 'lawyers_process_step_4_title' 
AND screen_location = 'tenders_for_lawyers';

UPDATE content_items 
SET content_key = 'tenders_for_lawyers_process_step_5_description'
WHERE content_key = 'lawyers_process_step_5_description' 
AND screen_location = 'tenders_for_lawyers';

UPDATE content_items 
SET content_key = 'tenders_for_lawyers_process_step_5_title'
WHERE content_key = 'lawyers_process_step_5_title' 
AND screen_location = 'tenders_for_lawyers';

-- ================================================================
-- STEP 2: Fix Steps Options (lawyers_step_* → tenders_for_lawyers_steps_*)
-- ================================================================

UPDATE content_items 
SET content_key = 'tenders_for_lawyers_steps_step_1_desc'
WHERE content_key = 'lawyers_step_1_desc' 
AND screen_location = 'tenders_for_lawyers';

UPDATE content_items 
SET content_key = 'tenders_for_lawyers_steps_step_1_title'
WHERE content_key = 'lawyers_step_1_title' 
AND screen_location = 'tenders_for_lawyers';

UPDATE content_items 
SET content_key = 'tenders_for_lawyers_steps_step_2_desc'
WHERE content_key = 'lawyers_step_2_desc' 
AND screen_location = 'tenders_for_lawyers';

UPDATE content_items 
SET content_key = 'tenders_for_lawyers_steps_step_2_title'
WHERE content_key = 'lawyers_step_2_title' 
AND screen_location = 'tenders_for_lawyers';

UPDATE content_items 
SET content_key = 'tenders_for_lawyers_steps_step_3_desc'
WHERE content_key = 'lawyers_step_3_desc' 
AND screen_location = 'tenders_for_lawyers';

UPDATE content_items 
SET content_key = 'tenders_for_lawyers_steps_step_3_title'
WHERE content_key = 'lawyers_step_3_title' 
AND screen_location = 'tenders_for_lawyers';

UPDATE content_items 
SET content_key = 'tenders_for_lawyers_steps_step_4_desc'
WHERE content_key = 'lawyers_step_4_desc' 
AND screen_location = 'tenders_for_lawyers';

UPDATE content_items 
SET content_key = 'tenders_for_lawyers_steps_step_4_title'
WHERE content_key = 'lawyers_step_4_title' 
AND screen_location = 'tenders_for_lawyers';

UPDATE content_items 
SET content_key = 'tenders_for_lawyers_steps_step_5_desc'
WHERE content_key = 'lawyers_step_5_desc' 
AND screen_location = 'tenders_for_lawyers';

UPDATE content_items 
SET content_key = 'tenders_for_lawyers_steps_step_5_title'
WHERE content_key = 'lawyers_step_5_title' 
AND screen_location = 'tenders_for_lawyers';

-- ================================================================
-- STEP 3: Ensure all options have proper category (form)
-- ================================================================

UPDATE content_items 
SET category = 'form'
WHERE screen_location = 'tenders_for_lawyers' 
AND component_type = 'option' 
AND category != 'form';

-- ================================================================
-- STEP 4: Ensure all options have proper component_type (option)
-- ================================================================

UPDATE content_items 
SET component_type = 'option'
WHERE screen_location = 'tenders_for_lawyers' 
AND component_type = 'dropdown_option';

COMMIT;

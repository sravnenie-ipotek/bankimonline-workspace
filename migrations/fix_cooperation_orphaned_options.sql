-- ================================================================
-- FIX COOPERATION ORPHANED OPTIONS (SAFE VERSION)
-- ================================================================
-- This script fixes orphaned options in cooperation screen
-- SAFETY: Uses safe UPDATE operations to rename orphaned options
-- ANALYSIS: cooperation_steps dropdown exists, rename orphaned options to match
-- 
-- Fixes:
-- cooperation_step* → cooperation_steps_step*
-- 
-- Date: 2025-01-25
-- ================================================================

BEGIN;

-- ================================================================
-- STEP 1: Fix Steps Options (cooperation_step* → cooperation_steps_step*)
-- ================================================================

UPDATE content_items 
SET content_key = 'cooperation_steps_step1_desc'
WHERE content_key = 'cooperation_step1_desc' 
AND screen_location = 'cooperation';

UPDATE content_items 
SET content_key = 'cooperation_steps_step1_title'
WHERE content_key = 'cooperation_step1_title' 
AND screen_location = 'cooperation';

UPDATE content_items 
SET content_key = 'cooperation_steps_step2_desc'
WHERE content_key = 'cooperation_step2_desc' 
AND screen_location = 'cooperation';

UPDATE content_items 
SET content_key = 'cooperation_steps_step2_title'
WHERE content_key = 'cooperation_step2_title' 
AND screen_location = 'cooperation';

UPDATE content_items 
SET content_key = 'cooperation_steps_step3_desc'
WHERE content_key = 'cooperation_step3_desc' 
AND screen_location = 'cooperation';

UPDATE content_items 
SET content_key = 'cooperation_steps_step3_title'
WHERE content_key = 'cooperation_step3_title' 
AND screen_location = 'cooperation';

UPDATE content_items 
SET content_key = 'cooperation_steps_step4_desc'
WHERE content_key = 'cooperation_step4_desc' 
AND screen_location = 'cooperation';

UPDATE content_items 
SET content_key = 'cooperation_steps_step4_title'
WHERE content_key = 'cooperation_step4_title' 
AND screen_location = 'cooperation';

UPDATE content_items 
SET content_key = 'cooperation_steps_step5_desc'
WHERE content_key = 'cooperation_step5_desc' 
AND screen_location = 'cooperation';

UPDATE content_items 
SET content_key = 'cooperation_steps_step5_title'
WHERE content_key = 'cooperation_step5_title' 
AND screen_location = 'cooperation';

-- ================================================================
-- STEP 2: Ensure all options have proper category (form)
-- ================================================================

UPDATE content_items 
SET category = 'form'
WHERE screen_location = 'cooperation' 
AND component_type = 'option' 
AND category != 'form';

-- ================================================================
-- STEP 3: Ensure all options have proper component_type (option)
-- ================================================================

UPDATE content_items 
SET component_type = 'option'
WHERE screen_location = 'cooperation' 
AND component_type = 'dropdown_option';

COMMIT;

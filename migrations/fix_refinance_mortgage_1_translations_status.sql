-- ================================================================
-- FIX REFINANCE MORTGAGE 1 TRANSLATION STATUS
-- ================================================================
-- This script fixes the status of Hebrew translations that are showing as draft
-- FOLLOWS: @dropDownsInDBLogic standards - production uses status = 'approved'
-- 
-- Problem: 3 Hebrew translations have status = 'draft' instead of 'approved'
-- Solution: Update status to 'approved' for production visibility
-- 
-- Date: 2025-01-25
-- ================================================================

BEGIN;

-- ================================================================
-- STEP 1: Update Hebrew translations status from 'draft' to 'approved'
-- ================================================================

UPDATE content_translations 
SET status = 'approved'
WHERE content_item_id IN (
  SELECT ci.id 
  FROM content_items ci 
  WHERE ci.screen_location = 'refinance_mortgage_1'
  AND ci.content_key IN (
    'app.mortgage_refi.step1.button',
    'app.mortgage_refi.step1.description', 
    'app.mortgage_refi.step1.title'
  )
)
AND language_code = 'he'
AND status = 'draft';

-- ================================================================
-- STEP 2: Update English translations status as well for consistency
-- ================================================================

UPDATE content_translations 
SET status = 'approved'
WHERE content_item_id IN (
  SELECT ci.id 
  FROM content_items ci 
  WHERE ci.screen_location = 'refinance_mortgage_1'
  AND ci.content_key IN (
    'app.mortgage_refi.step1.button',
    'app.mortgage_refi.step1.description', 
    'app.mortgage_refi.step1.title'
  )
)
AND language_code = 'en'
AND status = 'draft';

-- ================================================================
-- STEP 3: Update Russian translations status as well for consistency
-- ================================================================

UPDATE content_translations 
SET status = 'approved'
WHERE content_item_id IN (
  SELECT ci.id 
  FROM content_items ci 
  WHERE ci.screen_location = 'refinance_mortgage_1'
  AND ci.content_key IN (
    'app.mortgage_refi.step1.button',
    'app.mortgage_refi.step1.description', 
    'app.mortgage_refi.step1.title'
  )
)
AND language_code = 'ru'
AND status = 'draft';

COMMIT;

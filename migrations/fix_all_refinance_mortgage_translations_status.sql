-- ================================================================
-- FIX ALL REFINANCE MORTGAGE TRANSLATIONS STATUS
-- ================================================================
-- This script fixes the status of all Hebrew translations in refinance mortgage screens
-- FOLLOWS: @dropDownsInDBLogic standards - production uses status = 'approved'
-- 
-- Problem: Legacy content items have status = 'draft' instead of 'approved'
-- Solution: Update all refinance mortgage translations to 'approved' for production visibility
-- 
-- Date: 2025-01-25
-- ================================================================

BEGIN;

-- ================================================================
-- STEP 1: Update all refinance mortgage Hebrew translations from 'draft' to 'approved'
-- ================================================================

UPDATE content_translations 
SET status = 'approved'
WHERE content_item_id IN (
  SELECT ci.id 
  FROM content_items ci 
  WHERE ci.screen_location LIKE 'refinance_mortgage_%'
  AND ci.content_key LIKE 'app.mortgage_refi.step%.%'
)
AND language_code = 'he'
AND status = 'draft';

-- ================================================================
-- STEP 2: Update all refinance mortgage English translations from 'draft' to 'approved'
-- ================================================================

UPDATE content_translations 
SET status = 'approved'
WHERE content_item_id IN (
  SELECT ci.id 
  FROM content_items ci 
  WHERE ci.screen_location LIKE 'refinance_mortgage_%'
  AND ci.content_key LIKE 'app.mortgage_refi.step%.%'
)
AND language_code = 'en'
AND status = 'draft';

-- ================================================================
-- STEP 3: Update all refinance mortgage Russian translations from 'draft' to 'approved'
-- ================================================================

UPDATE content_translations 
SET status = 'approved'
WHERE content_item_id IN (
  SELECT ci.id 
  FROM content_items ci 
  WHERE ci.screen_location LIKE 'refinance_mortgage_%'
  AND ci.content_key LIKE 'app.mortgage_refi.step%.%'
)
AND language_code = 'ru'
AND status = 'draft';

COMMIT;

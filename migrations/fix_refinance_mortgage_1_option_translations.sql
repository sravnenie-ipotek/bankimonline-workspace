-- ================================================================
-- FIX REFINANCE MORTGAGE 1 OPTION TRANSLATIONS
-- ================================================================
-- This script fixes the option translations that are showing label text instead of option values
-- FOLLOWS: @dropDownsInDBLogic standards
-- 
-- Date: 2025-01-25
-- ================================================================

BEGIN;

-- ================================================================
-- STEP 1: Fix Registration Option Translations
-- ================================================================

UPDATE content_translations 
SET content_value = 'כן'
WHERE content_item_id IN (
  SELECT ci.id FROM content_items ci 
  WHERE ci.content_key = 'refinance_mortgage_1_registered_option_1'
  AND ci.screen_location = 'refinance_mortgage_1'
)
AND language_code = 'he';

UPDATE content_translations 
SET content_value = 'לא'
WHERE content_item_id IN (
  SELECT ci.id FROM content_items ci 
  WHERE ci.content_key = 'refinance_mortgage_1_registered_option_2'
  AND ci.screen_location = 'refinance_mortgage_1'
)
AND language_code = 'he';

-- ================================================================
-- STEP 2: Fix English Registration Options
-- ================================================================

UPDATE content_translations 
SET content_value = 'Yes'
WHERE content_item_id IN (
  SELECT ci.id FROM content_items ci 
  WHERE ci.content_key = 'refinance_mortgage_1_registered_option_1'
  AND ci.screen_location = 'refinance_mortgage_1'
)
AND language_code = 'en';

UPDATE content_translations 
SET content_value = 'No'
WHERE content_item_id IN (
  SELECT ci.id FROM content_items ci 
  WHERE ci.content_key = 'refinance_mortgage_1_registered_option_2'
  AND ci.screen_location = 'refinance_mortgage_1'
)
AND language_code = 'en';

-- ================================================================
-- STEP 3: Fix Russian Registration Options
-- ================================================================

UPDATE content_translations 
SET content_value = 'Да'
WHERE content_item_id IN (
  SELECT ci.id FROM content_items ci 
  WHERE ci.content_key = 'refinance_mortgage_1_registered_option_1'
  AND ci.screen_location = 'refinance_mortgage_1'
)
AND language_code = 'ru';

UPDATE content_translations 
SET content_value = 'Нет'
WHERE content_item_id IN (
  SELECT ci.id FROM content_items ci 
  WHERE ci.content_key = 'refinance_mortgage_1_registered_option_2'
  AND ci.screen_location = 'refinance_mortgage_1'
)
AND language_code = 'ru';

COMMIT;

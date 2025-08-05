-- ================================================================
-- FIX REFINANCE CREDIT 1 ORPHANED OPTIONS (SAFE VERSION)
-- ================================================================
-- This script fixes orphaned options in refinance_credit_1 screen
-- SAFETY: Uses safe UPDATE and DELETE operations
-- WILL NOT DELETE: Only removes duplicates and renames orphaned options
-- 
-- Fixes:
-- 1. Rename app.refinance_credit.step1.why_option_1-4 → refinance_credit_why_option_1-4
-- 2. Rename bank_* options → refinance_credit_bank_*
-- 3. Remove duplicate calculate_credit_why_option_1-4
-- 
-- Date: 2025-01-25
-- ================================================================

BEGIN;

-- ================================================================
-- STEP 1: Fix Why Options (app.refinance_credit.step1.why_option_* → refinance_credit_why_option_*)
-- ================================================================

UPDATE content_items 
SET content_key = 'refinance_credit_why_option_1'
WHERE content_key = 'app.refinance_credit.step1.why_option_1' 
AND screen_location = 'refinance_credit_1';

UPDATE content_items 
SET content_key = 'refinance_credit_why_option_2'
WHERE content_key = 'app.refinance_credit.step1.why_option_2' 
AND screen_location = 'refinance_credit_1';

UPDATE content_items 
SET content_key = 'refinance_credit_why_option_3'
WHERE content_key = 'app.refinance_credit.step1.why_option_3' 
AND screen_location = 'refinance_credit_1';

UPDATE content_items 
SET content_key = 'refinance_credit_why_option_4'
WHERE content_key = 'app.refinance_credit.step1.why_option_4' 
AND screen_location = 'refinance_credit_1';

-- ================================================================
-- STEP 2: Fix Bank Options (bank_* → refinance_credit_bank_*)
-- ================================================================

UPDATE content_items 
SET content_key = 'refinance_credit_bank_hapoalim'
WHERE content_key = 'bank_hapoalim' 
AND screen_location = 'refinance_credit_1';

UPDATE content_items 
SET content_key = 'refinance_credit_bank_leumi'
WHERE content_key = 'bank_leumi' 
AND screen_location = 'refinance_credit_1';

UPDATE content_items 
SET content_key = 'refinance_credit_bank_discount'
WHERE content_key = 'bank_discount' 
AND screen_location = 'refinance_credit_1';

UPDATE content_items 
SET content_key = 'refinance_credit_bank_israel'
WHERE content_key = 'bank_israel' 
AND screen_location = 'refinance_credit_1';

UPDATE content_items 
SET content_key = 'refinance_credit_bank_massad'
WHERE content_key = 'bank_massad' 
AND screen_location = 'refinance_credit_1';

-- ================================================================
-- STEP 3: Remove Duplicate calculate_credit_why_option_* (already have app.refinance_credit.step1.why_option_*)
-- ================================================================

DELETE FROM content_items 
WHERE content_key LIKE 'calculate_credit_why_option_%' 
AND screen_location = 'refinance_credit_1';

-- ================================================================
-- STEP 4: Ensure all options have proper category (form)
-- ================================================================

UPDATE content_items 
SET category = 'form'
WHERE screen_location = 'refinance_credit_1' 
AND component_type = 'option' 
AND category IS NULL;

-- ================================================================
-- STEP 5: Ensure all options have proper component_type (option)
-- ================================================================

UPDATE content_items 
SET component_type = 'option'
WHERE screen_location = 'refinance_credit_1' 
AND component_type = 'dropdown_option';

COMMIT; 
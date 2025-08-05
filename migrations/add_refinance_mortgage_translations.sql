-- ================================================================
-- ADD REFINANCE MORTGAGE TRANSLATIONS (SAFE VERSION)
-- ================================================================
-- This script adds translations for refinance mortgage content items
-- SAFETY: Uses WHERE NOT EXISTS to prevent duplicates
-- WILL NOT DELETE: Only adds missing translations
-- 
-- Languages: English (en), Hebrew (he), Russian (ru)
-- Status: All set to 'approved' for production use
-- 
-- Date: 2025-01-25
-- ================================================================

BEGIN;

-- ================================================================
-- ENGLISH TRANSLATIONS (en)
-- ================================================================

-- Bank Selection Dropdown - refinance_mortgage_1
INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'en', 'Current Bank', 'approved'
FROM content_items ci
WHERE ci.content_key = 'mortgage_refinance_bank' AND ci.screen_location = 'refinance_mortgage_1'
AND NOT EXISTS (
    SELECT 1 FROM content_translations ct 
    WHERE ct.content_item_id = ci.id AND ct.language_code = 'en'
);

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'en', 'Bank Hapoalim', 'approved'
FROM content_items ci
WHERE ci.content_key = 'mortgage_refinance_bank_hapoalim' AND ci.screen_location = 'refinance_mortgage_1'
AND NOT EXISTS (
    SELECT 1 FROM content_translations ct 
    WHERE ct.content_item_id = ci.id AND ct.language_code = 'en'
);

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'en', 'Bank Leumi', 'approved'
FROM content_items ci
WHERE ci.content_key = 'mortgage_refinance_bank_leumi' AND ci.screen_location = 'refinance_mortgage_1'
AND NOT EXISTS (
    SELECT 1 FROM content_translations ct 
    WHERE ct.content_item_id = ci.id AND ct.language_code = 'en'
);

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'en', 'Discount Bank', 'approved'
FROM content_items ci
WHERE ci.content_key = 'mortgage_refinance_bank_discount' AND ci.screen_location = 'refinance_mortgage_1'
AND NOT EXISTS (
    SELECT 1 FROM content_translations ct 
    WHERE ct.content_item_id = ci.id AND ct.language_code = 'en'
);

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'en', 'Massad Bank', 'approved'
FROM content_items ci
WHERE ci.content_key = 'mortgage_refinance_bank_massad' AND ci.screen_location = 'refinance_mortgage_1'
AND NOT EXISTS (
    SELECT 1 FROM content_translations ct 
    WHERE ct.content_item_id = ci.id AND ct.language_code = 'en'
);

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'en', 'Select Bank from List', 'approved'
FROM content_items ci
WHERE ci.content_key = 'mortgage_refinance_bank_ph' AND ci.screen_location = 'refinance_mortgage_1'
AND NOT EXISTS (
    SELECT 1 FROM content_translations ct 
    WHERE ct.content_item_id = ci.id AND ct.language_code = 'en'
);

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'en', 'Current Bank', 'approved'
FROM content_items ci
WHERE ci.content_key = 'mortgage_refinance_bank_label' AND ci.screen_location = 'refinance_mortgage_1'
AND NOT EXISTS (
    SELECT 1 FROM content_translations ct 
    WHERE ct.content_item_id = ci.id AND ct.language_code = 'en'
);

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'en', 'Remaining Mortgage Balance', 'approved'
FROM content_items ci
WHERE ci.content_key = 'mortgage_refinance_left_label' AND ci.screen_location = 'refinance_mortgage_1'
AND NOT EXISTS (
    SELECT 1 FROM content_translations ct 
    WHERE ct.content_item_id = ci.id AND ct.language_code = 'en'
);

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'en', 'Current Property Value', 'approved'
FROM content_items ci
WHERE ci.content_key = 'mortgage_refinance_price_label' AND ci.screen_location = 'refinance_mortgage_1'
AND NOT EXISTS (
    SELECT 1 FROM content_translations ct 
    WHERE ct.content_item_id = ci.id AND ct.language_code = 'en'
);

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'en', 'Step 1 - Existing mortgage details', 'approved'
FROM content_items ci
WHERE ci.content_key = 'mortgage_refinance_step_1_label' AND ci.screen_location = 'refinance_mortgage_1'
AND NOT EXISTS (
    SELECT 1 FROM content_translations ct 
    WHERE ct.content_item_id = ci.id AND ct.language_code = 'en'
);

-- Property Type and Registration - refinance_mortgage_2
INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'en', 'Current Interest Type', 'approved'
FROM content_items ci
WHERE ci.content_key = 'mortgage_refinance_type' AND ci.screen_location = 'refinance_mortgage_2'
AND NOT EXISTS (
    SELECT 1 FROM content_translations ct 
    WHERE ct.content_item_id = ci.id AND ct.language_code = 'en'
);

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'en', 'Select Interest Type', 'approved'
FROM content_items ci
WHERE ci.content_key = 'mortgage_refinance_type_ph' AND ci.screen_location = 'refinance_mortgage_2'
AND NOT EXISTS (
    SELECT 1 FROM content_translations ct 
    WHERE ct.content_item_id = ci.id AND ct.language_code = 'en'
);

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'en', 'Current Interest Type', 'approved'
FROM content_items ci
WHERE ci.content_key = 'mortgage_refinance_type_label' AND ci.screen_location = 'refinance_mortgage_2'
AND NOT EXISTS (
    SELECT 1 FROM content_translations ct 
    WHERE ct.content_item_id = ci.id AND ct.language_code = 'en'
);

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'en', 'Is the Mortgage Registered?', 'approved'
FROM content_items ci
WHERE ci.content_key = 'mortgage_refinance_registered' AND ci.screen_location = 'refinance_mortgage_2'
AND NOT EXISTS (
    SELECT 1 FROM content_translations ct 
    WHERE ct.content_item_id = ci.id AND ct.language_code = 'en'
);

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'en', 'Yes, Registered in Land Registry', 'approved'
FROM content_items ci
WHERE ci.content_key = 'mortgage_refinance_reg_option_1' AND ci.screen_location = 'refinance_mortgage_2'
AND NOT EXISTS (
    SELECT 1 FROM content_translations ct 
    WHERE ct.content_item_id = ci.id AND ct.language_code = 'en'
);

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'en', 'No, Not Registered', 'approved'
FROM content_items ci
WHERE ci.content_key = 'mortgage_refinance_reg_option_2' AND ci.screen_location = 'refinance_mortgage_2'
AND NOT EXISTS (
    SELECT 1 FROM content_translations ct 
    WHERE ct.content_item_id = ci.id AND ct.language_code = 'en'
);

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'en', 'Select Registration Status', 'approved'
FROM content_items ci
WHERE ci.content_key = 'mortgage_refinance_registered_ph' AND ci.screen_location = 'refinance_mortgage_2'
AND NOT EXISTS (
    SELECT 1 FROM content_translations ct 
    WHERE ct.content_item_id = ci.id AND ct.language_code = 'en'
);

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'en', 'Is the Mortgage Registered?', 'approved'
FROM content_items ci
WHERE ci.content_key = 'mortgage_refinance_registered_label' AND ci.screen_location = 'refinance_mortgage_2'
AND NOT EXISTS (
    SELECT 1 FROM content_translations ct 
    WHERE ct.content_item_id = ci.id AND ct.language_code = 'en'
);

-- Refinance Purpose - refinance_mortgage_2
INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'en', 'Purpose of Mortgage Refinance', 'approved'
FROM content_items ci
WHERE ci.content_key = 'mortgage_refinance_why' AND ci.screen_location = 'refinance_mortgage_2'
AND NOT EXISTS (
    SELECT 1 FROM content_translations ct 
    WHERE ct.content_item_id = ci.id AND ct.language_code = 'en'
);

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'en', 'Lower Interest Rate', 'approved'
FROM content_items ci
WHERE ci.content_key = 'mortgage_refinance_why_option_1' AND ci.screen_location = 'refinance_mortgage_2'
AND NOT EXISTS (
    SELECT 1 FROM content_translations ct 
    WHERE ct.content_item_id = ci.id AND ct.language_code = 'en'
);

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'en', 'Reduce Monthly Payment', 'approved'
FROM content_items ci
WHERE ci.content_key = 'mortgage_refinance_why_option_2' AND ci.screen_location = 'refinance_mortgage_2'
AND NOT EXISTS (
    SELECT 1 FROM content_translations ct 
    WHERE ct.content_item_id = ci.id AND ct.language_code = 'en'
);

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'en', 'Shorten Mortgage Term', 'approved'
FROM content_items ci
WHERE ci.content_key = 'mortgage_refinance_why_option_3' AND ci.screen_location = 'refinance_mortgage_2'
AND NOT EXISTS (
    SELECT 1 FROM content_translations ct 
    WHERE ct.content_item_id = ci.id AND ct.language_code = 'en'
);

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'en', 'Cash Out Refinance', 'approved'
FROM content_items ci
WHERE ci.content_key = 'mortgage_refinance_why_option_4' AND ci.screen_location = 'refinance_mortgage_2'
AND NOT EXISTS (
    SELECT 1 FROM content_translations ct 
    WHERE ct.content_item_id = ci.id AND ct.language_code = 'en'
);

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'en', 'Consolidate Debts', 'approved'
FROM content_items ci
WHERE ci.content_key = 'mortgage_refinance_why_option_5' AND ci.screen_location = 'refinance_mortgage_2'
AND NOT EXISTS (
    SELECT 1 FROM content_translations ct 
    WHERE ct.content_item_id = ci.id AND ct.language_code = 'en'
);

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'en', 'Select Refinance Purpose', 'approved'
FROM content_items ci
WHERE ci.content_key = 'mortgage_refinance_why_ph' AND ci.screen_location = 'refinance_mortgage_2'
AND NOT EXISTS (
    SELECT 1 FROM content_translations ct 
    WHERE ct.content_item_id = ci.id AND ct.language_code = 'en'
);

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'en', 'Purpose of Mortgage Refinance', 'approved'
FROM content_items ci
WHERE ci.content_key = 'mortgage_refinance_why_label' AND ci.screen_location = 'refinance_mortgage_2'
AND NOT EXISTS (
    SELECT 1 FROM content_translations ct 
    WHERE ct.content_item_id = ci.id AND ct.language_code = 'en'
);

-- Step Headers
INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'en', 'Step 2 - Personal details', 'approved'
FROM content_items ci
WHERE ci.content_key = 'mortgage_refinance_step_2_label' AND ci.screen_location = 'refinance_mortgage_2'
AND NOT EXISTS (
    SELECT 1 FROM content_translations ct 
    WHERE ct.content_item_id = ci.id AND ct.language_code = 'en'
);

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'en', 'Step 3 - Income details', 'approved'
FROM content_items ci
WHERE ci.content_key = 'mortgage_refinance_step_3_label' AND ci.screen_location = 'refinance_mortgage_3'
AND NOT EXISTS (
    SELECT 1 FROM content_translations ct 
    WHERE ct.content_item_id = ci.id AND ct.language_code = 'en'
);

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'en', 'Step 4 - Application summary', 'approved'
FROM content_items ci
WHERE ci.content_key = 'mortgage_refinance_step_4_label' AND ci.screen_location = 'refinance_mortgage_4'
AND NOT EXISTS (
    SELECT 1 FROM content_translations ct 
    WHERE ct.content_item_id = ci.id AND ct.language_code = 'en'
);

COMMIT;
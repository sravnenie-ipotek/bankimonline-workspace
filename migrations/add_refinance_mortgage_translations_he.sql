-- ================================================================
-- ADD REFINANCE MORTGAGE HEBREW TRANSLATIONS (SAFE VERSION)
-- ================================================================
-- This script adds Hebrew translations for refinance mortgage content items
-- SAFETY: Uses WHERE NOT EXISTS to prevent duplicates
-- WILL NOT DELETE: Only adds missing translations
-- 
-- Language: Hebrew (he)
-- Status: All set to 'approved' for production use
-- 
-- Date: 2025-01-25
-- ================================================================

BEGIN;

-- ================================================================
-- HEBREW TRANSLATIONS (he)
-- ================================================================

-- Bank Selection Dropdown - refinance_mortgage_1
INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'he', 'בנק המשכנתא הנוכחית', 'approved'
FROM content_items ci
WHERE ci.content_key = 'mortgage_refinance_bank' AND ci.screen_location = 'refinance_mortgage_1'
AND NOT EXISTS (
    SELECT 1 FROM content_translations ct 
    WHERE ct.content_item_id = ci.id AND ct.language_code = 'he'
);

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'he', 'בנק הפועלים', 'approved'
FROM content_items ci
WHERE ci.content_key = 'mortgage_refinance_bank_hapoalim' AND ci.screen_location = 'refinance_mortgage_1'
AND NOT EXISTS (
    SELECT 1 FROM content_translations ct 
    WHERE ct.content_item_id = ci.id AND ct.language_code = 'he'
);

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'he', 'בנק לאומי', 'approved'
FROM content_items ci
WHERE ci.content_key = 'mortgage_refinance_bank_leumi' AND ci.screen_location = 'refinance_mortgage_1'
AND NOT EXISTS (
    SELECT 1 FROM content_translations ct 
    WHERE ct.content_item_id = ci.id AND ct.language_code = 'he'
);

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'he', 'בנק דיסקונט', 'approved'
FROM content_items ci
WHERE ci.content_key = 'mortgage_refinance_bank_discount' AND ci.screen_location = 'refinance_mortgage_1'
AND NOT EXISTS (
    SELECT 1 FROM content_translations ct 
    WHERE ct.content_item_id = ci.id AND ct.language_code = 'he'
);

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'he', 'בנק מסד', 'approved'
FROM content_items ci
WHERE ci.content_key = 'mortgage_refinance_bank_massad' AND ci.screen_location = 'refinance_mortgage_1'
AND NOT EXISTS (
    SELECT 1 FROM content_translations ct 
    WHERE ct.content_item_id = ci.id AND ct.language_code = 'he'
);

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'he', 'בחר בנק מהרשימה', 'approved'
FROM content_items ci
WHERE ci.content_key = 'mortgage_refinance_bank_ph' AND ci.screen_location = 'refinance_mortgage_1'
AND NOT EXISTS (
    SELECT 1 FROM content_translations ct 
    WHERE ct.content_item_id = ci.id AND ct.language_code = 'he'
);

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'he', 'בנק המשכנתא הנוכחית', 'approved'
FROM content_items ci
WHERE ci.content_key = 'mortgage_refinance_bank_label' AND ci.screen_location = 'refinance_mortgage_1'
AND NOT EXISTS (
    SELECT 1 FROM content_translations ct 
    WHERE ct.content_item_id = ci.id AND ct.language_code = 'he'
);

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'he', 'יתרת המשכנתא', 'approved'
FROM content_items ci
WHERE ci.content_key = 'mortgage_refinance_left_label' AND ci.screen_location = 'refinance_mortgage_1'
AND NOT EXISTS (
    SELECT 1 FROM content_translations ct 
    WHERE ct.content_item_id = ci.id AND ct.language_code = 'he'
);

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'he', 'שווי הנכס הנוכחי', 'approved'
FROM content_items ci
WHERE ci.content_key = 'mortgage_refinance_price_label' AND ci.screen_location = 'refinance_mortgage_1'
AND NOT EXISTS (
    SELECT 1 FROM content_translations ct 
    WHERE ct.content_item_id = ci.id AND ct.language_code = 'he'
);

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'he', 'שלב 1 - פרטי המשכנתא הקיימת', 'approved'
FROM content_items ci
WHERE ci.content_key = 'mortgage_refinance_step_1_label' AND ci.screen_location = 'refinance_mortgage_1'
AND NOT EXISTS (
    SELECT 1 FROM content_translations ct 
    WHERE ct.content_item_id = ci.id AND ct.language_code = 'he'
);

-- Property Type and Registration - refinance_mortgage_2
INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'he', 'סוג הנכס', 'approved'
FROM content_items ci
WHERE ci.content_key = 'mortgage_refinance_type' AND ci.screen_location = 'refinance_mortgage_2'
AND NOT EXISTS (
    SELECT 1 FROM content_translations ct 
    WHERE ct.content_item_id = ci.id AND ct.language_code = 'he'
);

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'he', 'בחר סוג נכס', 'approved'
FROM content_items ci
WHERE ci.content_key = 'mortgage_refinance_type_ph' AND ci.screen_location = 'refinance_mortgage_2'
AND NOT EXISTS (
    SELECT 1 FROM content_translations ct 
    WHERE ct.content_item_id = ci.id AND ct.language_code = 'he'
);

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'he', 'סוג הנכס', 'approved'
FROM content_items ci
WHERE ci.content_key = 'mortgage_refinance_type_label' AND ci.screen_location = 'refinance_mortgage_2'
AND NOT EXISTS (
    SELECT 1 FROM content_translations ct 
    WHERE ct.content_item_id = ci.id AND ct.language_code = 'he'
);

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'he', 'האם המשכנתא רשומה בטאבו?', 'approved'
FROM content_items ci
WHERE ci.content_key = 'mortgage_refinance_registered' AND ci.screen_location = 'refinance_mortgage_2'
AND NOT EXISTS (
    SELECT 1 FROM content_translations ct 
    WHERE ct.content_item_id = ci.id AND ct.language_code = 'he'
);

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'he', 'כן, רשומה בטאבו', 'approved'
FROM content_items ci
WHERE ci.content_key = 'mortgage_refinance_reg_option_1' AND ci.screen_location = 'refinance_mortgage_2'
AND NOT EXISTS (
    SELECT 1 FROM content_translations ct 
    WHERE ct.content_item_id = ci.id AND ct.language_code = 'he'
);

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'he', 'לא, לא רשומה', 'approved'
FROM content_items ci
WHERE ci.content_key = 'mortgage_refinance_reg_option_2' AND ci.screen_location = 'refinance_mortgage_2'
AND NOT EXISTS (
    SELECT 1 FROM content_translations ct 
    WHERE ct.content_item_id = ci.id AND ct.language_code = 'he'
);

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'he', 'בחר אפשרות רישום', 'approved'
FROM content_items ci
WHERE ci.content_key = 'mortgage_refinance_registered_ph' AND ci.screen_location = 'refinance_mortgage_2'
AND NOT EXISTS (
    SELECT 1 FROM content_translations ct 
    WHERE ct.content_item_id = ci.id AND ct.language_code = 'he'
);

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'he', 'האם המשכנתא רשומה בטאבו?', 'approved'
FROM content_items ci
WHERE ci.content_key = 'mortgage_refinance_registered_label' AND ci.screen_location = 'refinance_mortgage_2'
AND NOT EXISTS (
    SELECT 1 FROM content_translations ct 
    WHERE ct.content_item_id = ci.id AND ct.language_code = 'he'
);

-- Refinance Purpose - refinance_mortgage_2
INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'he', 'מטרת מחזור המשכנתא', 'approved'
FROM content_items ci
WHERE ci.content_key = 'mortgage_refinance_why' AND ci.screen_location = 'refinance_mortgage_2'
AND NOT EXISTS (
    SELECT 1 FROM content_translations ct 
    WHERE ct.content_item_id = ci.id AND ct.language_code = 'he'
);

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'he', 'הפחתת הריבית', 'approved'
FROM content_items ci
WHERE ci.content_key = 'mortgage_refinance_why_option_1' AND ci.screen_location = 'refinance_mortgage_2'
AND NOT EXISTS (
    SELECT 1 FROM content_translations ct 
    WHERE ct.content_item_id = ci.id AND ct.language_code = 'he'
);

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'he', 'הפחתת התשלום החודשי', 'approved'
FROM content_items ci
WHERE ci.content_key = 'mortgage_refinance_why_option_2' AND ci.screen_location = 'refinance_mortgage_2'
AND NOT EXISTS (
    SELECT 1 FROM content_translations ct 
    WHERE ct.content_item_id = ci.id AND ct.language_code = 'he'
);

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'he', 'קיצור תקופת המשכנתא', 'approved'
FROM content_items ci
WHERE ci.content_key = 'mortgage_refinance_why_option_3' AND ci.screen_location = 'refinance_mortgage_2'
AND NOT EXISTS (
    SELECT 1 FROM content_translations ct 
    WHERE ct.content_item_id = ci.id AND ct.language_code = 'he'
);

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'he', 'משיכת מזומן נוסף', 'approved'
FROM content_items ci
WHERE ci.content_key = 'mortgage_refinance_why_option_4' AND ci.screen_location = 'refinance_mortgage_2'
AND NOT EXISTS (
    SELECT 1 FROM content_translations ct 
    WHERE ct.content_item_id = ci.id AND ct.language_code = 'he'
);

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'he', 'איחוד חובות', 'approved'
FROM content_items ci
WHERE ci.content_key = 'mortgage_refinance_why_option_5' AND ci.screen_location = 'refinance_mortgage_2'
AND NOT EXISTS (
    SELECT 1 FROM content_translations ct 
    WHERE ct.content_item_id = ci.id AND ct.language_code = 'he'
);

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'he', 'בחר מטרת מחזור', 'approved'
FROM content_items ci
WHERE ci.content_key = 'mortgage_refinance_why_ph' AND ci.screen_location = 'refinance_mortgage_2'
AND NOT EXISTS (
    SELECT 1 FROM content_translations ct 
    WHERE ct.content_item_id = ci.id AND ct.language_code = 'he'
);

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'he', 'מטרת מחזור המשכנתא', 'approved'
FROM content_items ci
WHERE ci.content_key = 'mortgage_refinance_why_label' AND ci.screen_location = 'refinance_mortgage_2'
AND NOT EXISTS (
    SELECT 1 FROM content_translations ct 
    WHERE ct.content_item_id = ci.id AND ct.language_code = 'he'
);

-- Step Headers
INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'he', 'שלב 2 - פרטים אישיים', 'approved'
FROM content_items ci
WHERE ci.content_key = 'mortgage_refinance_step_2_label' AND ci.screen_location = 'refinance_mortgage_2'
AND NOT EXISTS (
    SELECT 1 FROM content_translations ct 
    WHERE ct.content_item_id = ci.id AND ct.language_code = 'he'
);

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'he', 'שלב 3 - פרטי הכנסה', 'approved'
FROM content_items ci
WHERE ci.content_key = 'mortgage_refinance_step_3_label' AND ci.screen_location = 'refinance_mortgage_3'
AND NOT EXISTS (
    SELECT 1 FROM content_translations ct 
    WHERE ct.content_item_id = ci.id AND ct.language_code = 'he'
);

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'he', 'שלב 4 - סיכום הבקשה', 'approved'
FROM content_items ci
WHERE ci.content_key = 'mortgage_refinance_step_4_label' AND ci.screen_location = 'refinance_mortgage_4'
AND NOT EXISTS (
    SELECT 1 FROM content_translations ct 
    WHERE ct.content_item_id = ci.id AND ct.language_code = 'he'
);

COMMIT;
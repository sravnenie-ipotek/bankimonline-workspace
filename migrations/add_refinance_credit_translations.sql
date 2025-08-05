-- ================================================================
-- ADD REFINANCE CREDIT TRANSLATIONS
-- ================================================================
-- This script adds translations for missing refinance credit dropdown containers
-- 
-- Missing translations for:
-- 1. refinance_credit_bank (refinance_credit_1)
-- 2. refinance_credit_why (refinance_credit_1)
-- 3. refinance_credit_additional_income (refinance_credit_3)
-- 4. refinance_credit_debt_types (refinance_credit_3)
-- 5. refinance_credit_main_source (refinance_credit_3)
-- 
-- Date: 2025-01-25
-- ================================================================

BEGIN;

-- ================================================================
-- STEP 1: Add English Translations
-- ================================================================

-- refinance_credit_bank (refinance_credit_1)
INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'en', 'Current Bank', 'approved'
FROM content_items ci
WHERE ci.content_key = 'refinance_credit_bank' AND ci.screen_location = 'refinance_credit_1'
AND NOT EXISTS (
    SELECT 1 FROM content_translations ct 
    WHERE ct.content_item_id = ci.id AND ct.language_code = 'en'
);

-- refinance_credit_why (refinance_credit_1)
INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'en', 'Refinance Reason', 'approved'
FROM content_items ci
WHERE ci.content_key = 'refinance_credit_why' AND ci.screen_location = 'refinance_credit_1'
AND NOT EXISTS (
    SELECT 1 FROM content_translations ct 
    WHERE ct.content_item_id = ci.id AND ct.language_code = 'en'
);

-- refinance_credit_additional_income (refinance_credit_3)
INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'en', 'Additional Income Sources', 'approved'
FROM content_items ci
WHERE ci.content_key = 'refinance_credit_additional_income' AND ci.screen_location = 'refinance_credit_3'
AND NOT EXISTS (
    SELECT 1 FROM content_translations ct 
    WHERE ct.content_item_id = ci.id AND ct.language_code = 'en'
);

-- refinance_credit_debt_types (refinance_credit_3)
INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'en', 'Types of Debts', 'approved'
FROM content_items ci
WHERE ci.content_key = 'refinance_credit_debt_types' AND ci.screen_location = 'refinance_credit_3'
AND NOT EXISTS (
    SELECT 1 FROM content_translations ct 
    WHERE ct.content_item_id = ci.id AND ct.language_code = 'en'
);

-- refinance_credit_main_source (refinance_credit_3)
INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'en', 'Main Income Source', 'approved'
FROM content_items ci
WHERE ci.content_key = 'refinance_credit_main_source' AND ci.screen_location = 'refinance_credit_3'
AND NOT EXISTS (
    SELECT 1 FROM content_translations ct 
    WHERE ct.content_item_id = ci.id AND ct.language_code = 'en'
);

-- ================================================================
-- STEP 2: Add Hebrew Translations
-- ================================================================

-- refinance_credit_bank (refinance_credit_1)
INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'he', 'בנק נוכחי', 'approved'
FROM content_items ci
WHERE ci.content_key = 'refinance_credit_bank' AND ci.screen_location = 'refinance_credit_1'
AND NOT EXISTS (
    SELECT 1 FROM content_translations ct 
    WHERE ct.content_item_id = ci.id AND ct.language_code = 'he'
);

-- refinance_credit_why (refinance_credit_1)
INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'he', 'סיבת המיחזור', 'approved'
FROM content_items ci
WHERE ci.content_key = 'refinance_credit_why' AND ci.screen_location = 'refinance_credit_1'
AND NOT EXISTS (
    SELECT 1 FROM content_translations ct 
    WHERE ct.content_item_id = ci.id AND ct.language_code = 'he'
);

-- refinance_credit_additional_income (refinance_credit_3)
INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'he', 'מקורות הכנסה נוספים', 'approved'
FROM content_items ci
WHERE ci.content_key = 'refinance_credit_additional_income' AND ci.screen_location = 'refinance_credit_3'
AND NOT EXISTS (
    SELECT 1 FROM content_translations ct 
    WHERE ct.content_item_id = ci.id AND ct.language_code = 'he'
);

-- refinance_credit_debt_types (refinance_credit_3)
INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'he', 'סוגי חובות', 'approved'
FROM content_items ci
WHERE ci.content_key = 'refinance_credit_debt_types' AND ci.screen_location = 'refinance_credit_3'
AND NOT EXISTS (
    SELECT 1 FROM content_translations ct 
    WHERE ct.content_item_id = ci.id AND ct.language_code = 'he'
);

-- refinance_credit_main_source (refinance_credit_3)
INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'he', 'מקור הכנסה עיקרי', 'approved'
FROM content_items ci
WHERE ci.content_key = 'refinance_credit_main_source' AND ci.screen_location = 'refinance_credit_3'
AND NOT EXISTS (
    SELECT 1 FROM content_translations ct 
    WHERE ct.content_item_id = ci.id AND ct.language_code = 'he'
);

-- ================================================================
-- STEP 3: Add Russian Translations
-- ================================================================

-- refinance_credit_bank (refinance_credit_1)
INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'ru', 'Текущий банк', 'approved'
FROM content_items ci
WHERE ci.content_key = 'refinance_credit_bank' AND ci.screen_location = 'refinance_credit_1'
AND NOT EXISTS (
    SELECT 1 FROM content_translations ct 
    WHERE ct.content_item_id = ci.id AND ct.language_code = 'ru'
);

-- refinance_credit_why (refinance_credit_1)
INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'ru', 'Причина рефинансирования', 'approved'
FROM content_items ci
WHERE ci.content_key = 'refinance_credit_why' AND ci.screen_location = 'refinance_credit_1'
AND NOT EXISTS (
    SELECT 1 FROM content_translations ct 
    WHERE ct.content_item_id = ci.id AND ct.language_code = 'ru'
);

-- refinance_credit_additional_income (refinance_credit_3)
INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'ru', 'Дополнительные источники дохода', 'approved'
FROM content_items ci
WHERE ci.content_key = 'refinance_credit_additional_income' AND ci.screen_location = 'refinance_credit_3'
AND NOT EXISTS (
    SELECT 1 FROM content_translations ct 
    WHERE ct.content_item_id = ci.id AND ct.language_code = 'ru'
);

-- refinance_credit_debt_types (refinance_credit_3)
INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'ru', 'Типы долгов', 'approved'
FROM content_items ci
WHERE ci.content_key = 'refinance_credit_debt_types' AND ci.screen_location = 'refinance_credit_3'
AND NOT EXISTS (
    SELECT 1 FROM content_translations ct 
    WHERE ct.content_item_id = ci.id AND ct.language_code = 'ru'
);

-- refinance_credit_main_source (refinance_credit_3)
INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'ru', 'Основной источник дохода', 'approved'
FROM content_items ci
WHERE ci.content_key = 'refinance_credit_main_source' AND ci.screen_location = 'refinance_credit_3'
AND NOT EXISTS (
    SELECT 1 FROM content_translations ct 
    WHERE ct.content_item_id = ci.id AND ct.language_code = 'ru'
);

COMMIT; 
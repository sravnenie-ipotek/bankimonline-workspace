-- ================================================================
-- ADD REFINANCE MORTGAGE RUSSIAN TRANSLATIONS (SAFE VERSION)
-- ================================================================
-- This script adds Russian translations for refinance mortgage content items
-- SAFETY: Uses WHERE NOT EXISTS to prevent duplicates
-- WILL NOT DELETE: Only adds missing translations
-- 
-- Language: Russian (ru)
-- Status: All set to 'approved' for production use
-- 
-- Date: 2025-01-25
-- ================================================================

BEGIN;

-- ================================================================
-- RUSSIAN TRANSLATIONS (ru)
-- ================================================================

-- Bank Selection Dropdown - refinance_mortgage_1
INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'ru', 'Банк текущей ипотеки', 'approved'
FROM content_items ci
WHERE ci.content_key = 'mortgage_refinance_bank' AND ci.screen_location = 'refinance_mortgage_1'
AND NOT EXISTS (
    SELECT 1 FROM content_translations ct 
    WHERE ct.content_item_id = ci.id AND ct.language_code = 'ru'
);

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'ru', 'Банк Апоалим', 'approved'
FROM content_items ci
WHERE ci.content_key = 'mortgage_refinance_bank_hapoalim' AND ci.screen_location = 'refinance_mortgage_1'
AND NOT EXISTS (
    SELECT 1 FROM content_translations ct 
    WHERE ct.content_item_id = ci.id AND ct.language_code = 'ru'
);

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'ru', 'Банк Леуми', 'approved'
FROM content_items ci
WHERE ci.content_key = 'mortgage_refinance_bank_leumi' AND ci.screen_location = 'refinance_mortgage_1'
AND NOT EXISTS (
    SELECT 1 FROM content_translations ct 
    WHERE ct.content_item_id = ci.id AND ct.language_code = 'ru'
);

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'ru', 'Банк Дисконт', 'approved'
FROM content_items ci
WHERE ci.content_key = 'mortgage_refinance_bank_discount' AND ci.screen_location = 'refinance_mortgage_1'
AND NOT EXISTS (
    SELECT 1 FROM content_translations ct 
    WHERE ct.content_item_id = ci.id AND ct.language_code = 'ru'
);

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'ru', 'Банк Масад', 'approved'
FROM content_items ci
WHERE ci.content_key = 'mortgage_refinance_bank_massad' AND ci.screen_location = 'refinance_mortgage_1'
AND NOT EXISTS (
    SELECT 1 FROM content_translations ct 
    WHERE ct.content_item_id = ci.id AND ct.language_code = 'ru'
);

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'ru', 'Выберите банк из списка', 'approved'
FROM content_items ci
WHERE ci.content_key = 'mortgage_refinance_bank_ph' AND ci.screen_location = 'refinance_mortgage_1'
AND NOT EXISTS (
    SELECT 1 FROM content_translations ct 
    WHERE ct.content_item_id = ci.id AND ct.language_code = 'ru'
);

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'ru', 'Банк текущей ипотеки', 'approved'
FROM content_items ci
WHERE ci.content_key = 'mortgage_refinance_bank_label' AND ci.screen_location = 'refinance_mortgage_1'
AND NOT EXISTS (
    SELECT 1 FROM content_translations ct 
    WHERE ct.content_item_id = ci.id AND ct.language_code = 'ru'
);

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'ru', 'Остаток по ипотеке', 'approved'
FROM content_items ci
WHERE ci.content_key = 'mortgage_refinance_left_label' AND ci.screen_location = 'refinance_mortgage_1'
AND NOT EXISTS (
    SELECT 1 FROM content_translations ct 
    WHERE ct.content_item_id = ci.id AND ct.language_code = 'ru'
);

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'ru', 'Текущая стоимость недвижимости', 'approved'
FROM content_items ci
WHERE ci.content_key = 'mortgage_refinance_price_label' AND ci.screen_location = 'refinance_mortgage_1'
AND NOT EXISTS (
    SELECT 1 FROM content_translations ct 
    WHERE ct.content_item_id = ci.id AND ct.language_code = 'ru'
);

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'ru', 'Шаг 1 - Данные существующей ипотеки', 'approved'
FROM content_items ci
WHERE ci.content_key = 'mortgage_refinance_step_1_label' AND ci.screen_location = 'refinance_mortgage_1'
AND NOT EXISTS (
    SELECT 1 FROM content_translations ct 
    WHERE ct.content_item_id = ci.id AND ct.language_code = 'ru'
);

-- Property Type and Registration - refinance_mortgage_2
INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'ru', 'Тип недвижимости', 'approved'
FROM content_items ci
WHERE ci.content_key = 'mortgage_refinance_type' AND ci.screen_location = 'refinance_mortgage_2'
AND NOT EXISTS (
    SELECT 1 FROM content_translations ct 
    WHERE ct.content_item_id = ci.id AND ct.language_code = 'ru'
);

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'ru', 'Выберите тип недвижимости', 'approved'
FROM content_items ci
WHERE ci.content_key = 'mortgage_refinance_type_ph' AND ci.screen_location = 'refinance_mortgage_2'
AND NOT EXISTS (
    SELECT 1 FROM content_translations ct 
    WHERE ct.content_item_id = ci.id AND ct.language_code = 'ru'
);

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'ru', 'Тип недвижимости', 'approved'
FROM content_items ci
WHERE ci.content_key = 'mortgage_refinance_type_label' AND ci.screen_location = 'refinance_mortgage_2'
AND NOT EXISTS (
    SELECT 1 FROM content_translations ct 
    WHERE ct.content_item_id = ci.id AND ct.language_code = 'ru'
);

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'ru', 'Зарегистрирована ли ипотека в земельном реестре?', 'approved'
FROM content_items ci
WHERE ci.content_key = 'mortgage_refinance_registered' AND ci.screen_location = 'refinance_mortgage_2'
AND NOT EXISTS (
    SELECT 1 FROM content_translations ct 
    WHERE ct.content_item_id = ci.id AND ct.language_code = 'ru'
);

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'ru', 'Да, зарегистрирована в реестре', 'approved'
FROM content_items ci
WHERE ci.content_key = 'mortgage_refinance_reg_option_1' AND ci.screen_location = 'refinance_mortgage_2'
AND NOT EXISTS (
    SELECT 1 FROM content_translations ct 
    WHERE ct.content_item_id = ci.id AND ct.language_code = 'ru'
);

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'ru', 'Нет, не зарегистрирована', 'approved'
FROM content_items ci
WHERE ci.content_key = 'mortgage_refinance_reg_option_2' AND ci.screen_location = 'refinance_mortgage_2'
AND NOT EXISTS (
    SELECT 1 FROM content_translations ct 
    WHERE ct.content_item_id = ci.id AND ct.language_code = 'ru'
);

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'ru', 'Выберите вариант регистрации', 'approved'
FROM content_items ci
WHERE ci.content_key = 'mortgage_refinance_registered_ph' AND ci.screen_location = 'refinance_mortgage_2'
AND NOT EXISTS (
    SELECT 1 FROM content_translations ct 
    WHERE ct.content_item_id = ci.id AND ct.language_code = 'ru'
);

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'ru', 'Зарегистрирована ли ипотека в земельном реестре?', 'approved'
FROM content_items ci
WHERE ci.content_key = 'mortgage_refinance_registered_label' AND ci.screen_location = 'refinance_mortgage_2'
AND NOT EXISTS (
    SELECT 1 FROM content_translations ct 
    WHERE ct.content_item_id = ci.id AND ct.language_code = 'ru'
);

-- Refinance Purpose - refinance_mortgage_2
INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'ru', 'Цель рефинансирования ипотеки', 'approved'
FROM content_items ci
WHERE ci.content_key = 'mortgage_refinance_why' AND ci.screen_location = 'refinance_mortgage_2'
AND NOT EXISTS (
    SELECT 1 FROM content_translations ct 
    WHERE ct.content_item_id = ci.id AND ct.language_code = 'ru'
);

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'ru', 'Снижение процентной ставки', 'approved'
FROM content_items ci
WHERE ci.content_key = 'mortgage_refinance_why_option_1' AND ci.screen_location = 'refinance_mortgage_2'
AND NOT EXISTS (
    SELECT 1 FROM content_translations ct 
    WHERE ct.content_item_id = ci.id AND ct.language_code = 'ru'
);

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'ru', 'Снижение ежемесячного платежа', 'approved'
FROM content_items ci
WHERE ci.content_key = 'mortgage_refinance_why_option_2' AND ci.screen_location = 'refinance_mortgage_2'
AND NOT EXISTS (
    SELECT 1 FROM content_translations ct 
    WHERE ct.content_item_id = ci.id AND ct.language_code = 'ru'
);

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'ru', 'Сокращение срока ипотеки', 'approved'
FROM content_items ci
WHERE ci.content_key = 'mortgage_refinance_why_option_3' AND ci.screen_location = 'refinance_mortgage_2'
AND NOT EXISTS (
    SELECT 1 FROM content_translations ct 
    WHERE ct.content_item_id = ci.id AND ct.language_code = 'ru'
);

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'ru', 'Получение дополнительных наличных', 'approved'
FROM content_items ci
WHERE ci.content_key = 'mortgage_refinance_why_option_4' AND ci.screen_location = 'refinance_mortgage_2'
AND NOT EXISTS (
    SELECT 1 FROM content_translations ct 
    WHERE ct.content_item_id = ci.id AND ct.language_code = 'ru'
);

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'ru', 'Консолидация долгов', 'approved'
FROM content_items ci
WHERE ci.content_key = 'mortgage_refinance_why_option_5' AND ci.screen_location = 'refinance_mortgage_2'
AND NOT EXISTS (
    SELECT 1 FROM content_translations ct 
    WHERE ct.content_item_id = ci.id AND ct.language_code = 'ru'
);

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'ru', 'Выберите цель рефинансирования', 'approved'
FROM content_items ci
WHERE ci.content_key = 'mortgage_refinance_why_ph' AND ci.screen_location = 'refinance_mortgage_2'
AND NOT EXISTS (
    SELECT 1 FROM content_translations ct 
    WHERE ct.content_item_id = ci.id AND ct.language_code = 'ru'
);

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'ru', 'Цель рефинансирования ипотеки', 'approved'
FROM content_items ci
WHERE ci.content_key = 'mortgage_refinance_why_label' AND ci.screen_location = 'refinance_mortgage_2'
AND NOT EXISTS (
    SELECT 1 FROM content_translations ct 
    WHERE ct.content_item_id = ci.id AND ct.language_code = 'ru'
);

-- Step Headers
INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'ru', 'Шаг 2 - Личные данные', 'approved'
FROM content_items ci
WHERE ci.content_key = 'mortgage_refinance_step_2_label' AND ci.screen_location = 'refinance_mortgage_2'
AND NOT EXISTS (
    SELECT 1 FROM content_translations ct 
    WHERE ct.content_item_id = ci.id AND ct.language_code = 'ru'
);

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'ru', 'Шаг 3 - Сведения о доходах', 'approved'
FROM content_items ci
WHERE ci.content_key = 'mortgage_refinance_step_3_label' AND ci.screen_location = 'refinance_mortgage_3'
AND NOT EXISTS (
    SELECT 1 FROM content_translations ct 
    WHERE ct.content_item_id = ci.id AND ct.language_code = 'ru'
);

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'ru', 'Шаг 4 - Итоги заявки', 'approved'
FROM content_items ci
WHERE ci.content_key = 'mortgage_refinance_step_4_label' AND ci.screen_location = 'refinance_mortgage_4'
AND NOT EXISTS (
    SELECT 1 FROM content_translations ct 
    WHERE ct.content_item_id = ci.id AND ct.language_code = 'ru'
);

COMMIT;
-- Migration: Calculate Credit Step 3 - Field Content
-- Date: 2024-01-27
-- Description: Add field content and options for calculate_credit_3

-- Main source of income field and options
INSERT INTO content_items (content_key, component_type, screen_location, category, is_active, legacy_translation_key)
VALUES 
('calculate_mortgage_main_source', 'field_label', 'calculate_credit_3', 'income_details', true, 'calculate_mortgage_main_source'),
('calculate_mortgage_main_source_ph', 'field_placeholder', 'calculate_credit_3', 'income_details', true, 'calculate_mortgage_main_source_ph'),
('calculate_mortgage_main_source_option_1', 'field_option', 'calculate_credit_3', 'income_details', true, 'calculate_mortgage_main_source_option_1'),
('calculate_mortgage_main_source_option_2', 'field_option', 'calculate_credit_3', 'income_details', true, 'calculate_mortgage_main_source_option_2'),
('calculate_mortgage_main_source_option_3', 'field_option', 'calculate_credit_3', 'income_details', true, 'calculate_mortgage_main_source_option_3'),
('calculate_mortgage_main_source_option_4', 'field_option', 'calculate_credit_3', 'income_details', true, 'calculate_mortgage_main_source_option_4'),
('calculate_mortgage_main_source_option_5', 'field_option', 'calculate_credit_3', 'income_details', true, 'calculate_mortgage_main_source_option_5'),
('calculate_mortgage_main_source_option_6', 'field_option', 'calculate_credit_3', 'income_details', true, 'calculate_mortgage_main_source_option_6'),
('calculate_mortgage_main_source_option_7', 'field_option', 'calculate_credit_3', 'income_details', true, 'calculate_mortgage_main_source_option_7');

-- Additional income field and options
INSERT INTO content_items (content_key, component_type, screen_location, category, is_active, legacy_translation_key)
VALUES 
('calculate_mortgage_has_additional', 'field_label', 'calculate_credit_3', 'income_details', true, 'calculate_mortgage_has_additional'),
('calculate_mortgage_has_additional_ph', 'field_placeholder', 'calculate_credit_3', 'income_details', true, 'calculate_mortgage_has_additional_ph'),
('calculate_mortgage_has_additional_option_1', 'field_option', 'calculate_credit_3', 'income_details', true, 'calculate_mortgage_has_additional_option_1'),
('calculate_mortgage_has_additional_option_2', 'field_option', 'calculate_credit_3', 'income_details', true, 'calculate_mortgage_has_additional_option_2'),
('calculate_mortgage_has_additional_option_3', 'field_option', 'calculate_credit_3', 'income_details', true, 'calculate_mortgage_has_additional_option_3'),
('calculate_mortgage_has_additional_option_4', 'field_option', 'calculate_credit_3', 'income_details', true, 'calculate_mortgage_has_additional_option_4'),
('calculate_mortgage_has_additional_option_5', 'field_option', 'calculate_credit_3', 'income_details', true, 'calculate_mortgage_has_additional_option_5'),
('calculate_mortgage_has_additional_option_6', 'field_option', 'calculate_credit_3', 'income_details', true, 'calculate_mortgage_has_additional_option_6'),
('calculate_mortgage_has_additional_option_7', 'field_option', 'calculate_credit_3', 'income_details', true, 'calculate_mortgage_has_additional_option_7');

-- Obligation field and options
INSERT INTO content_items (content_key, component_type, screen_location, category, is_active, legacy_translation_key)
VALUES 
('calculate_mortgage_debt_types', 'field_label', 'calculate_credit_3', 'income_details', true, 'calculate_mortgage_debt_types'),
('calculate_mortgage_debt_types_ph', 'field_placeholder', 'calculate_credit_3', 'income_details', true, 'calculate_mortgage_debt_types_ph'),
('calculate_mortgage_debt_types_option_1', 'field_option', 'calculate_credit_3', 'income_details', true, 'calculate_mortgage_debt_types_option_1'),
('calculate_mortgage_debt_types_option_2', 'field_option', 'calculate_credit_3', 'income_details', true, 'calculate_mortgage_debt_types_option_2'),
('calculate_mortgage_debt_types_option_3', 'field_option', 'calculate_credit_3', 'income_details', true, 'calculate_mortgage_debt_types_option_3'),
('calculate_mortgage_debt_types_option_4', 'field_option', 'calculate_credit_3', 'income_details', true, 'calculate_mortgage_debt_types_option_4'),
('calculate_mortgage_debt_types_option_5', 'field_option', 'calculate_credit_3', 'income_details', true, 'calculate_mortgage_debt_types_option_5');

-- Translations for main source of income
INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'en', 'Main source of income', 'approved' 
FROM content_items WHERE content_key = 'calculate_mortgage_main_source' AND screen_location = 'calculate_credit_3';

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'he', 'מקור הכנסה עיקרי', 'approved' 
FROM content_items WHERE content_key = 'calculate_mortgage_main_source' AND screen_location = 'calculate_credit_3';

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'ru', 'Основной источник дохода', 'approved' 
FROM content_items WHERE content_key = 'calculate_mortgage_main_source' AND screen_location = 'calculate_credit_3';

-- Placeholder
INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'en', 'Choose source', 'approved' 
FROM content_items WHERE content_key = 'calculate_mortgage_main_source_ph' AND screen_location = 'calculate_credit_3';

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'he', 'בחר מקור', 'approved' 
FROM content_items WHERE content_key = 'calculate_mortgage_main_source_ph' AND screen_location = 'calculate_credit_3';

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'ru', 'Выберите источник', 'approved' 
FROM content_items WHERE content_key = 'calculate_mortgage_main_source_ph' AND screen_location = 'calculate_credit_3';

-- Main source options translations
-- Option 1: Salaried employee
INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'en', 'Salaried employee', 'approved' 
FROM content_items WHERE content_key = 'calculate_mortgage_main_source_option_1' AND screen_location = 'calculate_credit_3';

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'he', 'שכיר', 'approved' 
FROM content_items WHERE content_key = 'calculate_mortgage_main_source_option_1' AND screen_location = 'calculate_credit_3';

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'ru', 'Наемный работник', 'approved' 
FROM content_items WHERE content_key = 'calculate_mortgage_main_source_option_1' AND screen_location = 'calculate_credit_3';

-- Option 2: Self-employed
INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'en', 'Self-employed', 'approved' 
FROM content_items WHERE content_key = 'calculate_mortgage_main_source_option_2' AND screen_location = 'calculate_credit_3';

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'he', 'עצמאי', 'approved' 
FROM content_items WHERE content_key = 'calculate_mortgage_main_source_option_2' AND screen_location = 'calculate_credit_3';

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'ru', 'Частный предприниматель', 'approved' 
FROM content_items WHERE content_key = 'calculate_mortgage_main_source_option_2' AND screen_location = 'calculate_credit_3';

-- Option 3: Company owner
INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'en', 'Company owner', 'approved' 
FROM content_items WHERE content_key = 'calculate_mortgage_main_source_option_3' AND screen_location = 'calculate_credit_3';

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'he', 'בעל חברה', 'approved' 
FROM content_items WHERE content_key = 'calculate_mortgage_main_source_option_3' AND screen_location = 'calculate_credit_3';

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'ru', 'Владелец компании', 'approved' 
FROM content_items WHERE content_key = 'calculate_mortgage_main_source_option_3' AND screen_location = 'calculate_credit_3';

-- Option 4: Controller in a company
INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'en', 'Controller in a company', 'approved' 
FROM content_items WHERE content_key = 'calculate_mortgage_main_source_option_4' AND screen_location = 'calculate_credit_3';

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'he', 'בעל שליטה בחברה', 'approved' 
FROM content_items WHERE content_key = 'calculate_mortgage_main_source_option_4' AND screen_location = 'calculate_credit_3';

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'ru', 'Контролирующий акционер', 'approved' 
FROM content_items WHERE content_key = 'calculate_mortgage_main_source_option_4' AND screen_location = 'calculate_credit_3';

-- Option 5: Pensioner
INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'en', 'Pensioner', 'approved' 
FROM content_items WHERE content_key = 'calculate_mortgage_main_source_option_5' AND screen_location = 'calculate_credit_3';

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'he', 'פנסיונר', 'approved' 
FROM content_items WHERE content_key = 'calculate_mortgage_main_source_option_5' AND screen_location = 'calculate_credit_3';

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'ru', 'Пенсионер', 'approved' 
FROM content_items WHERE content_key = 'calculate_mortgage_main_source_option_5' AND screen_location = 'calculate_credit_3';

-- Option 6: No income
INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'en', 'No income', 'approved' 
FROM content_items WHERE content_key = 'calculate_mortgage_main_source_option_6' AND screen_location = 'calculate_credit_3';

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'he', 'ללא הכנסה', 'approved' 
FROM content_items WHERE content_key = 'calculate_mortgage_main_source_option_6' AND screen_location = 'calculate_credit_3';

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'ru', 'Без дохода', 'approved' 
FROM content_items WHERE content_key = 'calculate_mortgage_main_source_option_6' AND screen_location = 'calculate_credit_3';

-- Option 7: Unemployed
INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'en', 'Unemployed', 'approved' 
FROM content_items WHERE content_key = 'calculate_mortgage_main_source_option_7' AND screen_location = 'calculate_credit_3';

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'he', 'מובטל', 'approved' 
FROM content_items WHERE content_key = 'calculate_mortgage_main_source_option_7' AND screen_location = 'calculate_credit_3';

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'ru', 'Безработный', 'approved' 
FROM content_items WHERE content_key = 'calculate_mortgage_main_source_option_7' AND screen_location = 'calculate_credit_3';

-- Additional income translations
INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'en', 'Additional income', 'approved' 
FROM content_items WHERE content_key = 'calculate_mortgage_has_additional' AND screen_location = 'calculate_credit_3';

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'he', 'הכנסה נוספת', 'approved' 
FROM content_items WHERE content_key = 'calculate_mortgage_has_additional' AND screen_location = 'calculate_credit_3';

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'ru', 'Дополнительный доход', 'approved' 
FROM content_items WHERE content_key = 'calculate_mortgage_has_additional' AND screen_location = 'calculate_credit_3';

-- Additional income placeholder
INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'en', 'Choose option', 'approved' 
FROM content_items WHERE content_key = 'calculate_mortgage_has_additional_ph' AND screen_location = 'calculate_credit_3';

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'he', 'בחר אפשרות', 'approved' 
FROM content_items WHERE content_key = 'calculate_mortgage_has_additional_ph' AND screen_location = 'calculate_credit_3';

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'ru', 'Выберите вариант', 'approved' 
FROM content_items WHERE content_key = 'calculate_mortgage_has_additional_ph' AND screen_location = 'calculate_credit_3';

-- Additional income options
-- Option 1: No additional income
INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'en', 'No additional income', 'approved' 
FROM content_items WHERE content_key = 'calculate_mortgage_has_additional_option_1' AND screen_location = 'calculate_credit_3';

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'he', 'אין הכנסה נוספת', 'approved' 
FROM content_items WHERE content_key = 'calculate_mortgage_has_additional_option_1' AND screen_location = 'calculate_credit_3';

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'ru', 'Нет дополнительного дохода', 'approved' 
FROM content_items WHERE content_key = 'calculate_mortgage_has_additional_option_1' AND screen_location = 'calculate_credit_3';

-- Obligations translations
INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'en', 'Obligations', 'approved' 
FROM content_items WHERE content_key = 'calculate_mortgage_debt_types' AND screen_location = 'calculate_credit_3';

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'he', 'התחייבויות', 'approved' 
FROM content_items WHERE content_key = 'calculate_mortgage_debt_types' AND screen_location = 'calculate_credit_3';

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'ru', 'Обязательства', 'approved' 
FROM content_items WHERE content_key = 'calculate_mortgage_debt_types' AND screen_location = 'calculate_credit_3';

-- Obligations placeholder
INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'en', 'Choose type', 'approved' 
FROM content_items WHERE content_key = 'calculate_mortgage_debt_types_ph' AND screen_location = 'calculate_credit_3';

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'he', 'בחר סוג', 'approved' 
FROM content_items WHERE content_key = 'calculate_mortgage_debt_types_ph' AND screen_location = 'calculate_credit_3';

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'ru', 'Выберите тип', 'approved' 
FROM content_items WHERE content_key = 'calculate_mortgage_debt_types_ph' AND screen_location = 'calculate_credit_3';

-- Obligation options
-- Option 1: No obligations
INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'en', 'No obligations', 'approved' 
FROM content_items WHERE content_key = 'calculate_mortgage_debt_types_option_1' AND screen_location = 'calculate_credit_3';

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'he', 'אין התחייבויות', 'approved' 
FROM content_items WHERE content_key = 'calculate_mortgage_debt_types_option_1' AND screen_location = 'calculate_credit_3';

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'ru', 'Нет обязательств', 'approved' 
FROM content_items WHERE content_key = 'calculate_mortgage_debt_types_option_1' AND screen_location = 'calculate_credit_3';
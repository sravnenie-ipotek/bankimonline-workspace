-- Migration: Calculate Credit Step 3 - Complete Content
-- Date: 2024-01-27
-- Description: Add all content for calculate_credit_3

-- Step Title
INSERT INTO content_items (content_key, component_type, screen_location, category, is_active, legacy_translation_key)
VALUES 
('calculate_credit_step3_title', 'title', 'calculate_credit_3', 'navigation', true, 'credit_step3_title');

-- Buttons
INSERT INTO content_items (content_key, component_type, screen_location, category, is_active, legacy_translation_key)
VALUES 
('add_place_to_work', 'button', 'calculate_credit_3', 'income_details', true, 'add_place_to_work'),
('add_additional_source_of_income', 'button', 'calculate_credit_3', 'income_details', true, 'add_additional_source_of_income'),
('add_obligation', 'button', 'calculate_credit_3', 'income_details', true, 'add_obligation'),
('add_borrower', 'button', 'calculate_credit_3', 'income_details', true, 'add_borrower');

-- Labels
INSERT INTO content_items (content_key, component_type, screen_location, category, is_active, legacy_translation_key)
VALUES 
('source_of_income', 'field_label', 'calculate_credit_3', 'income_details', true, 'main_income_source'),
('additional_source_of_income', 'field_label', 'calculate_credit_3', 'income_details', true, 'additional_source_of_income'),
('obligation', 'field_label', 'calculate_credit_3', 'income_details', true, 'obligation'),
('borrower', 'field_label', 'calculate_credit_3', 'income_details', true, 'borrower');

-- Translations for Step Title
INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'en', 'Income and Financial Details', 'approved' 
FROM content_items WHERE content_key = 'calculate_credit_step3_title' AND screen_location = 'calculate_credit_3';

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'he', 'פרטי הכנסה ופיננסיים', 'approved' 
FROM content_items WHERE content_key = 'calculate_credit_step3_title' AND screen_location = 'calculate_credit_3';

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'ru', 'Доходы и финансовая информация', 'approved' 
FROM content_items WHERE content_key = 'calculate_credit_step3_title' AND screen_location = 'calculate_credit_3';

-- Translations for Buttons
-- add_place_to_work
INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'en', 'Add workplace', 'approved' 
FROM content_items WHERE content_key = 'add_place_to_work' AND screen_location = 'calculate_credit_3';

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'he', 'הוסף מקום עבודה', 'approved' 
FROM content_items WHERE content_key = 'add_place_to_work' AND screen_location = 'calculate_credit_3';

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'ru', 'Добавить место работы', 'approved' 
FROM content_items WHERE content_key = 'add_place_to_work' AND screen_location = 'calculate_credit_3';

-- add_additional_source_of_income
INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'en', 'Add additional income source', 'approved' 
FROM content_items WHERE content_key = 'add_additional_source_of_income' AND screen_location = 'calculate_credit_3';

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'he', 'הוסף מקור הכנסה נוסף', 'approved' 
FROM content_items WHERE content_key = 'add_additional_source_of_income' AND screen_location = 'calculate_credit_3';

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'ru', 'Добавить дополнительный источник дохода', 'approved' 
FROM content_items WHERE content_key = 'add_additional_source_of_income' AND screen_location = 'calculate_credit_3';

-- add_obligation
INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'en', 'Add obligation', 'approved' 
FROM content_items WHERE content_key = 'add_obligation' AND screen_location = 'calculate_credit_3';

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'he', 'הוסף התחייבות', 'approved' 
FROM content_items WHERE content_key = 'add_obligation' AND screen_location = 'calculate_credit_3';

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'ru', 'Добавить обязательство', 'approved' 
FROM content_items WHERE content_key = 'add_obligation' AND screen_location = 'calculate_credit_3';

-- add_borrower
INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'en', 'Add borrower', 'approved' 
FROM content_items WHERE content_key = 'add_borrower' AND screen_location = 'calculate_credit_3';

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'he', 'הוסף לווה', 'approved' 
FROM content_items WHERE content_key = 'add_borrower' AND screen_location = 'calculate_credit_3';

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'ru', 'Добавить заемщика', 'approved' 
FROM content_items WHERE content_key = 'add_borrower' AND screen_location = 'calculate_credit_3';

-- Translations for Labels
-- source_of_income
INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'en', 'Income source', 'approved' 
FROM content_items WHERE content_key = 'source_of_income' AND screen_location = 'calculate_credit_3';

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'he', 'מקור הכנסה', 'approved' 
FROM content_items WHERE content_key = 'source_of_income' AND screen_location = 'calculate_credit_3';

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'ru', 'Источник дохода', 'approved' 
FROM content_items WHERE content_key = 'source_of_income' AND screen_location = 'calculate_credit_3';

-- additional_source_of_income
INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'en', 'Additional income source', 'approved' 
FROM content_items WHERE content_key = 'additional_source_of_income' AND screen_location = 'calculate_credit_3';

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'he', 'מקור הכנסה נוסף', 'approved' 
FROM content_items WHERE content_key = 'additional_source_of_income' AND screen_location = 'calculate_credit_3';

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'ru', 'Дополнительный источник дохода', 'approved' 
FROM content_items WHERE content_key = 'additional_source_of_income' AND screen_location = 'calculate_credit_3';

-- obligation
INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'en', 'Obligation', 'approved' 
FROM content_items WHERE content_key = 'obligation' AND screen_location = 'calculate_credit_3';

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'he', 'התחייבות', 'approved' 
FROM content_items WHERE content_key = 'obligation' AND screen_location = 'calculate_credit_3';

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'ru', 'Обязательство', 'approved' 
FROM content_items WHERE content_key = 'obligation' AND screen_location = 'calculate_credit_3';

-- borrower
INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'en', 'Borrower', 'approved' 
FROM content_items WHERE content_key = 'borrower' AND screen_location = 'calculate_credit_3';

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'he', 'לווה', 'approved' 
FROM content_items WHERE content_key = 'borrower' AND screen_location = 'calculate_credit_3';

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'ru', 'Заемщик', 'approved' 
FROM content_items WHERE content_key = 'borrower' AND screen_location = 'calculate_credit_3';
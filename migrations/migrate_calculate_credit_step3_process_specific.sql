-- Migration: Calculate Credit Step 3 - Process-Specific Content
-- Date: 2024-01-27
-- Description: Add process-specific content for calculate_credit_3 to avoid key conflicts
-- Following rule: Each process maintains its own namespace

-- Process-specific buttons for calculate_credit_3
INSERT INTO content_items (content_key, component_type, screen_location, category, is_active, legacy_translation_key)
VALUES 
('calculate_credit_add_place_to_work', 'button', 'calculate_credit_3', 'income_details', true, 'add_place_to_work'),
('calculate_credit_add_additional_income', 'button', 'calculate_credit_3', 'income_details', true, 'add_additional_source_of_income'),
('calculate_credit_add_obligation', 'button', 'calculate_credit_3', 'income_details', true, 'add_obligation'),
('calculate_credit_add_borrower', 'button', 'calculate_credit_3', 'income_details', true, 'add_borrower');

-- Process-specific labels for calculate_credit_3
INSERT INTO content_items (content_key, component_type, screen_location, category, is_active, legacy_translation_key)
VALUES 
('calculate_credit_source_of_income', 'field_label', 'calculate_credit_3', 'income_details', true, 'source_of_income'),
('calculate_credit_additional_income', 'field_label', 'calculate_credit_3', 'income_details', true, 'additional_source_of_income'),
('calculate_credit_obligation', 'field_label', 'calculate_credit_3', 'income_details', true, 'obligation'),
('calculate_credit_borrower', 'field_label', 'calculate_credit_3', 'income_details', true, 'borrower');

-- Translations for buttons
-- calculate_credit_add_place_to_work
INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'en', 'Add workplace', 'approved' 
FROM content_items WHERE content_key = 'calculate_credit_add_place_to_work' AND screen_location = 'calculate_credit_3';

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'he', 'הוסף מקום עבודה', 'approved' 
FROM content_items WHERE content_key = 'calculate_credit_add_place_to_work' AND screen_location = 'calculate_credit_3';

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'ru', 'Добавить место работы', 'approved' 
FROM content_items WHERE content_key = 'calculate_credit_add_place_to_work' AND screen_location = 'calculate_credit_3';

-- calculate_credit_add_additional_income
INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'en', 'Add additional income source', 'approved' 
FROM content_items WHERE content_key = 'calculate_credit_add_additional_income' AND screen_location = 'calculate_credit_3';

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'he', 'הוסף מקור הכנסה נוסף', 'approved' 
FROM content_items WHERE content_key = 'calculate_credit_add_additional_income' AND screen_location = 'calculate_credit_3';

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'ru', 'Добавить дополнительный источник дохода', 'approved' 
FROM content_items WHERE content_key = 'calculate_credit_add_additional_income' AND screen_location = 'calculate_credit_3';

-- calculate_credit_add_obligation
INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'en', 'Add obligation', 'approved' 
FROM content_items WHERE content_key = 'calculate_credit_add_obligation' AND screen_location = 'calculate_credit_3';

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'he', 'הוסף התחייבות', 'approved' 
FROM content_items WHERE content_key = 'calculate_credit_add_obligation' AND screen_location = 'calculate_credit_3';

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'ru', 'Добавить обязательство', 'approved' 
FROM content_items WHERE content_key = 'calculate_credit_add_obligation' AND screen_location = 'calculate_credit_3';

-- calculate_credit_add_borrower
INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'en', 'Add borrower', 'approved' 
FROM content_items WHERE content_key = 'calculate_credit_add_borrower' AND screen_location = 'calculate_credit_3';

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'he', 'הוסף לווה', 'approved' 
FROM content_items WHERE content_key = 'calculate_credit_add_borrower' AND screen_location = 'calculate_credit_3';

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'ru', 'Добавить заемщика', 'approved' 
FROM content_items WHERE content_key = 'calculate_credit_add_borrower' AND screen_location = 'calculate_credit_3';

-- Translations for labels
-- calculate_credit_source_of_income
INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'en', 'Income source', 'approved' 
FROM content_items WHERE content_key = 'calculate_credit_source_of_income' AND screen_location = 'calculate_credit_3';

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'he', 'מקור הכנסה', 'approved' 
FROM content_items WHERE content_key = 'calculate_credit_source_of_income' AND screen_location = 'calculate_credit_3';

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'ru', 'Источник дохода', 'approved' 
FROM content_items WHERE content_key = 'calculate_credit_source_of_income' AND screen_location = 'calculate_credit_3';

-- calculate_credit_additional_income
INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'en', 'Additional income source', 'approved' 
FROM content_items WHERE content_key = 'calculate_credit_additional_income' AND screen_location = 'calculate_credit_3';

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'he', 'מקור הכנסה נוסף', 'approved' 
FROM content_items WHERE content_key = 'calculate_credit_additional_income' AND screen_location = 'calculate_credit_3';

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'ru', 'Дополнительный источник дохода', 'approved' 
FROM content_items WHERE content_key = 'calculate_credit_additional_income' AND screen_location = 'calculate_credit_3';

-- calculate_credit_obligation
INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'en', 'Obligation', 'approved' 
FROM content_items WHERE content_key = 'calculate_credit_obligation' AND screen_location = 'calculate_credit_3';

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'he', 'התחייבות', 'approved' 
FROM content_items WHERE content_key = 'calculate_credit_obligation' AND screen_location = 'calculate_credit_3';

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'ru', 'Обязательство', 'approved' 
FROM content_items WHERE content_key = 'calculate_credit_obligation' AND screen_location = 'calculate_credit_3';

-- calculate_credit_borrower
INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'en', 'Borrower', 'approved' 
FROM content_items WHERE content_key = 'calculate_credit_borrower' AND screen_location = 'calculate_credit_3';

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'he', 'לווה', 'approved' 
FROM content_items WHERE content_key = 'calculate_credit_borrower' AND screen_location = 'calculate_credit_3';

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'ru', 'Заемщик', 'approved' 
FROM content_items WHERE content_key = 'calculate_credit_borrower' AND screen_location = 'calculate_credit_3';
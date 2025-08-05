-- Create Calculate Credit Step 3 Content for Server Database
-- Date: 2025-08-04
-- Description: Add dropdown content for calculate_credit_3 screen (server DB schema)

-- Main source of income dropdown
INSERT INTO content_items (content_key, component_type, screen_location, category, is_active, legacy_translation_key)
VALUES 
('calculate_mortgage_main_source', 'label', 'calculate_credit_3', 'income_details', true, 'calculate_mortgage_main_source'),
('calculate_mortgage_main_source_ph', 'placeholder', 'calculate_credit_3', 'income_details', true, 'calculate_mortgage_main_source_ph'),
('calculate_mortgage_main_source_option_1', 'option', 'calculate_credit_3', 'income_details', true, 'calculate_mortgage_main_source_option_1'),
('calculate_mortgage_main_source_option_2', 'option', 'calculate_credit_3', 'income_details', true, 'calculate_mortgage_main_source_option_2'),
('calculate_mortgage_main_source_option_3', 'option', 'calculate_credit_3', 'income_details', true, 'calculate_mortgage_main_source_option_3'),
('calculate_mortgage_main_source_option_4', 'option', 'calculate_credit_3', 'income_details', true, 'calculate_mortgage_main_source_option_4'),
('calculate_mortgage_main_source_option_5', 'option', 'calculate_credit_3', 'income_details', true, 'calculate_mortgage_main_source_option_5'),
('calculate_mortgage_main_source_option_6', 'option', 'calculate_credit_3', 'income_details', true, 'calculate_mortgage_main_source_option_6'),
('calculate_mortgage_main_source_option_7', 'option', 'calculate_credit_3', 'income_details', true, 'calculate_mortgage_main_source_option_7');

-- Additional income dropdown
INSERT INTO content_items (content_key, component_type, screen_location, category, is_active, legacy_translation_key)
VALUES 
('calculate_mortgage_has_additional', 'label', 'calculate_credit_3', 'income_details', true, 'calculate_mortgage_has_additional'),
('calculate_mortgage_has_additional_ph', 'placeholder', 'calculate_credit_3', 'income_details', true, 'calculate_mortgage_has_additional_ph'),
('calculate_mortgage_has_additional_option_1', 'option', 'calculate_credit_3', 'income_details', true, 'calculate_mortgage_has_additional_option_1'),
('calculate_mortgage_has_additional_option_2', 'option', 'calculate_credit_3', 'income_details', true, 'calculate_mortgage_has_additional_option_2'),
('calculate_mortgage_has_additional_option_3', 'option', 'calculate_credit_3', 'income_details', true, 'calculate_mortgage_has_additional_option_3'),
('calculate_mortgage_has_additional_option_4', 'option', 'calculate_credit_3', 'income_details', true, 'calculate_mortgage_has_additional_option_4'),
('calculate_mortgage_has_additional_option_5', 'option', 'calculate_credit_3', 'income_details', true, 'calculate_mortgage_has_additional_option_5'),
('calculate_mortgage_has_additional_option_6', 'option', 'calculate_credit_3', 'income_details', true, 'calculate_mortgage_has_additional_option_6'),
('calculate_mortgage_has_additional_option_7', 'option', 'calculate_credit_3', 'income_details', true, 'calculate_mortgage_has_additional_option_7');

-- Obligation dropdown
INSERT INTO content_items (content_key, component_type, screen_location, category, is_active, legacy_translation_key)
VALUES 
('calculate_mortgage_debt_types', 'label', 'calculate_credit_3', 'income_details', true, 'calculate_mortgage_debt_types'),
('calculate_mortgage_debt_types_ph', 'placeholder', 'calculate_credit_3', 'income_details', true, 'calculate_mortgage_debt_types_ph'),
('calculate_mortgage_debt_types_option_1', 'option', 'calculate_credit_3', 'income_details', true, 'calculate_mortgage_debt_types_option_1'),
('calculate_mortgage_debt_types_option_2', 'option', 'calculate_credit_3', 'income_details', true, 'calculate_mortgage_debt_types_option_2'),
('calculate_mortgage_debt_types_option_3', 'option', 'calculate_credit_3', 'income_details', true, 'calculate_mortgage_debt_types_option_3'),
('calculate_mortgage_debt_types_option_4', 'option', 'calculate_credit_3', 'income_details', true, 'calculate_mortgage_debt_types_option_4'),
('calculate_mortgage_debt_types_option_5', 'option', 'calculate_credit_3', 'income_details', true, 'calculate_mortgage_debt_types_option_5');

-- English translations
INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'en', 'Main source of income', 'approved' 
FROM content_items WHERE content_key = 'calculate_mortgage_main_source' AND screen_location = 'calculate_credit_3';

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'en', 'Select your main source of income', 'approved' 
FROM content_items WHERE content_key = 'calculate_mortgage_main_source_ph' AND screen_location = 'calculate_credit_3';

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'en', 'Employee', 'approved' 
FROM content_items WHERE content_key = 'calculate_mortgage_main_source_option_1' AND screen_location = 'calculate_credit_3';

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'en', 'Self-employed', 'approved' 
FROM content_items WHERE content_key = 'calculate_mortgage_main_source_option_2' AND screen_location = 'calculate_credit_3';

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'en', 'Business owner', 'approved' 
FROM content_items WHERE content_key = 'calculate_mortgage_main_source_option_3' AND screen_location = 'calculate_credit_3';

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'en', 'Pension', 'approved' 
FROM content_items WHERE content_key = 'calculate_mortgage_main_source_option_4' AND screen_location = 'calculate_credit_3';

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'en', 'Student', 'approved' 
FROM content_items WHERE content_key = 'calculate_mortgage_main_source_option_5' AND screen_location = 'calculate_credit_3';

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'en', 'Unemployed', 'approved' 
FROM content_items WHERE content_key = 'calculate_mortgage_main_source_option_6' AND screen_location = 'calculate_credit_3';

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'en', 'Other', 'approved' 
FROM content_items WHERE content_key = 'calculate_mortgage_main_source_option_7' AND screen_location = 'calculate_credit_3';

-- Additional income translations
INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'en', 'Additional income', 'approved' 
FROM content_items WHERE content_key = 'calculate_mortgage_has_additional' AND screen_location = 'calculate_credit_3';

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'en', 'Do you have additional income?', 'approved' 
FROM content_items WHERE content_key = 'calculate_mortgage_has_additional_ph' AND screen_location = 'calculate_credit_3';

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'en', 'No additional income', 'approved' 
FROM content_items WHERE content_key = 'calculate_mortgage_has_additional_option_1' AND screen_location = 'calculate_credit_3';

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'en', 'Additional salary', 'approved' 
FROM content_items WHERE content_key = 'calculate_mortgage_has_additional_option_2' AND screen_location = 'calculate_credit_3';

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'en', 'Freelance work', 'approved' 
FROM content_items WHERE content_key = 'calculate_mortgage_has_additional_option_3' AND screen_location = 'calculate_credit_3';

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'en', 'Investment income', 'approved' 
FROM content_items WHERE content_key = 'calculate_mortgage_has_additional_option_4' AND screen_location = 'calculate_credit_3';

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'en', 'Rental income', 'approved' 
FROM content_items WHERE content_key = 'calculate_mortgage_has_additional_option_5' AND screen_location = 'calculate_credit_3';

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'en', 'Pension benefits', 'approved' 
FROM content_items WHERE content_key = 'calculate_mortgage_has_additional_option_6' AND screen_location = 'calculate_credit_3';

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'en', 'Other income', 'approved' 
FROM content_items WHERE content_key = 'calculate_mortgage_has_additional_option_7' AND screen_location = 'calculate_credit_3';

-- Debt types translations
INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'en', 'Existing obligations', 'approved' 
FROM content_items WHERE content_key = 'calculate_mortgage_debt_types' AND screen_location = 'calculate_credit_3';

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'en', 'Do you have existing debts or obligations?', 'approved' 
FROM content_items WHERE content_key = 'calculate_mortgage_debt_types_ph' AND screen_location = 'calculate_credit_3';

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'en', 'No obligations', 'approved' 
FROM content_items WHERE content_key = 'calculate_mortgage_debt_types_option_1' AND screen_location = 'calculate_credit_3';

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'en', 'Credit card debt', 'approved' 
FROM content_items WHERE content_key = 'calculate_mortgage_debt_types_option_2' AND screen_location = 'calculate_credit_3';

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'en', 'Bank loan', 'approved' 
FROM content_items WHERE content_key = 'calculate_mortgage_debt_types_option_3' AND screen_location = 'calculate_credit_3';

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'en', 'Consumer credit', 'approved' 
FROM content_items WHERE content_key = 'calculate_mortgage_debt_types_option_4' AND screen_location = 'calculate_credit_3';

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'en', 'Other obligations', 'approved' 
FROM content_items WHERE content_key = 'calculate_mortgage_debt_types_option_5' AND screen_location = 'calculate_credit_3'; 
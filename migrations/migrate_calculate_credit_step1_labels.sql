-- Migration: Calculate Credit Step 1 - Missing Labels and Placeholders
-- Date: 2024-01-27
-- Description: Add missing field labels and placeholders for calculate_credit_1

-- Field Labels
INSERT INTO content_items (content_key, component_type, screen_location, category, is_active, legacy_translation_key)
VALUES 
('calculate_why', 'field_label', 'calculate_credit_1', 'loan_parameters', true, 'calculate_why'),
('calculate_amount', 'field_label', 'calculate_credit_1', 'loan_parameters', true, 'calculate_amount'),
('calculate_when', 'field_label', 'calculate_credit_1', 'loan_parameters', true, 'calculate_when'),
('calculate_prolong', 'field_label', 'calculate_credit_1', 'loan_parameters', true, 'calculate_prolong');

-- Placeholders
INSERT INTO content_items (content_key, component_type, screen_location, category, is_active, legacy_translation_key)
VALUES 
('calculate_credit_target_ph', 'placeholder', 'calculate_credit_1', 'loan_parameters', true, 'calculate_credit_target_ph'),
('calculate_credit_prolong_ph', 'placeholder', 'calculate_credit_1', 'loan_parameters', true, 'calculate_credit_prolong_ph'),
('calculate_mortgage_when_options_Time', 'placeholder', 'calculate_credit_1', 'loan_parameters', true, 'calculate_mortgage_when_options_Time');

-- Translations for Field Labels
-- calculate_why
INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'en', 'Why do you need the credit?', 'approved' 
FROM content_items WHERE content_key = 'calculate_why' AND screen_location = 'calculate_credit_1';

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'he', 'למה אתה צריך את האשראי?', 'approved' 
FROM content_items WHERE content_key = 'calculate_why' AND screen_location = 'calculate_credit_1';

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'ru', 'Зачем вам нужен кредит?', 'approved' 
FROM content_items WHERE content_key = 'calculate_why' AND screen_location = 'calculate_credit_1';

-- calculate_amount
INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'en', 'Credit amount', 'approved' 
FROM content_items WHERE content_key = 'calculate_amount' AND screen_location = 'calculate_credit_1';

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'he', 'סכום האשראי', 'approved' 
FROM content_items WHERE content_key = 'calculate_amount' AND screen_location = 'calculate_credit_1';

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'ru', 'Сумма кредита', 'approved' 
FROM content_items WHERE content_key = 'calculate_amount' AND screen_location = 'calculate_credit_1';

-- calculate_when
INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'en', 'When are you planning to take the credit?', 'approved' 
FROM content_items WHERE content_key = 'calculate_when' AND screen_location = 'calculate_credit_1';

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'he', 'מתי אתה מתכנן לקחת את האשראי?', 'approved' 
FROM content_items WHERE content_key = 'calculate_when' AND screen_location = 'calculate_credit_1';

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'ru', 'Когда вы планируете взять кредит?', 'approved' 
FROM content_items WHERE content_key = 'calculate_when' AND screen_location = 'calculate_credit_1';

-- calculate_prolong
INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'en', 'For what period?', 'approved' 
FROM content_items WHERE content_key = 'calculate_prolong' AND screen_location = 'calculate_credit_1';

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'he', 'לאיזו תקופה?', 'approved' 
FROM content_items WHERE content_key = 'calculate_prolong' AND screen_location = 'calculate_credit_1';

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'ru', 'На какой период?', 'approved' 
FROM content_items WHERE content_key = 'calculate_prolong' AND screen_location = 'calculate_credit_1';

-- Translations for Placeholders
-- calculate_credit_target_ph
INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'en', 'Select credit purpose', 'approved' 
FROM content_items WHERE content_key = 'calculate_credit_target_ph' AND screen_location = 'calculate_credit_1';

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'he', 'בחר מטרת אשראי', 'approved' 
FROM content_items WHERE content_key = 'calculate_credit_target_ph' AND screen_location = 'calculate_credit_1';

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'ru', 'Выберите цель кредита', 'approved' 
FROM content_items WHERE content_key = 'calculate_credit_target_ph' AND screen_location = 'calculate_credit_1';

-- calculate_credit_prolong_ph
INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'en', 'Select repayment period', 'approved' 
FROM content_items WHERE content_key = 'calculate_credit_prolong_ph' AND screen_location = 'calculate_credit_1';

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'he', 'בחר תקופת החזר', 'approved' 
FROM content_items WHERE content_key = 'calculate_credit_prolong_ph' AND screen_location = 'calculate_credit_1';

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'ru', 'Выберите период погашения', 'approved' 
FROM content_items WHERE content_key = 'calculate_credit_prolong_ph' AND screen_location = 'calculate_credit_1';

-- calculate_mortgage_when_options_Time
INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'en', 'Select time frame', 'approved' 
FROM content_items WHERE content_key = 'calculate_mortgage_when_options_Time' AND screen_location = 'calculate_credit_1';

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'he', 'בחר מסגרת זמן', 'approved' 
FROM content_items WHERE content_key = 'calculate_mortgage_when_options_Time' AND screen_location = 'calculate_credit_1';

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'ru', 'Выберите временные рамки', 'approved' 
FROM content_items WHERE content_key = 'calculate_mortgage_when_options_Time' AND screen_location = 'calculate_credit_1';
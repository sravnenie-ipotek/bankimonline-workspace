-- Migration: Calculate Credit Step 4 - Complete Content
-- Date: 2024-01-27
-- Description: Add all content for calculate_credit_4

-- Step Title and Warning
INSERT INTO content_items (content_key, component_type, screen_location, category, is_active, legacy_translation_key)
VALUES 
('calculate_credit_final', 'title', 'calculate_credit_4', 'navigation', true, 'calculate_credit_final'),
('calculate_credit_warning', 'text', 'calculate_credit_4', 'info', true, 'calculate_credit_warning');

-- Translations for Step Title
INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'en', 'Credit Calculation Results', 'approved' 
FROM content_items WHERE content_key = 'calculate_credit_final' AND screen_location = 'calculate_credit_4';

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'he', 'תוצאות חישוב אשראי', 'approved' 
FROM content_items WHERE content_key = 'calculate_credit_final' AND screen_location = 'calculate_credit_4';

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'ru', 'Результаты расчета кредита', 'approved' 
FROM content_items WHERE content_key = 'calculate_credit_final' AND screen_location = 'calculate_credit_4';

-- Translations for Warning Text
INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'en', 'The displayed offers are preliminary and subject to final bank approval. Actual terms may vary based on your complete financial profile.', 'approved' 
FROM content_items WHERE content_key = 'calculate_credit_warning' AND screen_location = 'calculate_credit_4';

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'he', 'ההצעות המוצגות הן ראשוניות וכפופות לאישור סופי של הבנק. התנאים בפועל עשויים להשתנות בהתאם לפרופיל הפיננסי המלא שלך.', 'approved' 
FROM content_items WHERE content_key = 'calculate_credit_warning' AND screen_location = 'calculate_credit_4';

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'ru', 'Представленные предложения являются предварительными и подлежат окончательному утверждению банком. Фактические условия могут измениться в зависимости от вашего полного финансового профиля.', 'approved' 
FROM content_items WHERE content_key = 'calculate_credit_warning' AND screen_location = 'calculate_credit_4';
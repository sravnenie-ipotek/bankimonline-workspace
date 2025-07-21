-- Complete Credit Step 1 Migration: Add missing "when" options
-- Date: 2025-01-21
-- Purpose: Add the WhenDoYouNeedMoneyOptions to database

-- When Do You Need Money Options (shared across mortgage/credit)
INSERT INTO content_items (content_key, component_type, category, screen_location, is_active, legacy_translation_key, created_at) VALUES
('calculate_mortgage_when_options_1', 'option', 'dropdown', 'calculate_credit_1', TRUE, 'calculate_mortgage_when_options_1', NOW()),
('calculate_mortgage_when_options_2', 'option', 'dropdown', 'calculate_credit_1', TRUE, 'calculate_mortgage_when_options_2', NOW()),
('calculate_mortgage_when_options_3', 'option', 'dropdown', 'calculate_credit_1', TRUE, 'calculate_mortgage_when_options_3', NOW()),
('calculate_mortgage_when_options_4', 'option', 'dropdown', 'calculate_credit_1', TRUE, 'calculate_mortgage_when_options_4', NOW())
ON CONFLICT (content_key) DO NOTHING;

-- When Options Translations
INSERT INTO content_translations (content_item_id, language_code, content_value, status, created_at) VALUES
-- English
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_when_options_1'), 'en', 'Within 3 months', 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_when_options_2'), 'en', 'Within 3-6 months', 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_when_options_3'), 'en', 'Within 6-12 months', 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_when_options_4'), 'en', 'Over 12 months', 'approved', NOW()),

-- Hebrew
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_when_options_1'), 'he', 'תוך 3 חודשים', 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_when_options_2'), 'he', 'תוך 3-6 חודשים', 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_when_options_3'), 'he', 'תוך 6-12 חודשים', 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_when_options_4'), 'he', 'מעל 12 חודשים', 'approved', NOW()),

-- Russian
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_when_options_1'), 'ru', 'До 3 месяцев', 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_when_options_2'), 'ru', '3-6 месяцев', 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_when_options_3'), 'ru', '6-12 месяцев', 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_mortgage_when_options_4'), 'ru', 'Более 12 месяцев', 'approved', NOW())
ON CONFLICT (content_item_id, language_code) DO NOTHING;
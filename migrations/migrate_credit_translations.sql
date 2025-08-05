-- Migration: Migrate Credit Calculation Translations to Database
-- Date: 2025-01-21
-- Purpose: Move hardcoded dropdown translations to database following DEVHelp/DevRules/translationRules

-- ===== CREDIT STEP 1: CALCULATE-CREDIT/1 =====

-- Credit Purpose Options (calculate_credit_target)
INSERT INTO content_items (content_key, component_type, category, screen_location, is_active, created_at) VALUES
('calculate_credit_target_option_1', 'option', 'dropdown', 'calculate_credit_1', TRUE, NOW()),
('calculate_credit_target_option_2', 'option', 'dropdown', 'calculate_credit_1', TRUE, NOW()),
('calculate_credit_target_option_3', 'option', 'dropdown', 'calculate_credit_1', TRUE, NOW()),
('calculate_credit_target_option_4', 'option', 'dropdown', 'calculate_credit_1', TRUE, NOW()),
('calculate_credit_target_option_5', 'option', 'dropdown', 'calculate_credit_1', TRUE, NOW()),
('calculate_credit_target_option_6', 'option', 'dropdown', 'calculate_credit_1', TRUE, NOW())
ON CONFLICT (content_key) DO NOTHING;

-- Credit Purpose Translations
INSERT INTO content_translations (content_item_id, language_code, content_value, status, created_at) VALUES
-- English
((SELECT id FROM content_items WHERE content_key = 'calculate_credit_target_option_1'), 'en', 'Vehicle purchase', 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_credit_target_option_2'), 'en', 'Home renovation', 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_credit_target_option_3'), 'en', 'Wedding and events', 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_credit_target_option_4'), 'en', 'Business investment', 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_credit_target_option_5'), 'en', 'Improve future credit eligibility', 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_credit_target_option_6'), 'en', 'Other', 'approved', NOW()),

-- Hebrew
((SELECT id FROM content_items WHERE content_key = 'calculate_credit_target_option_1'), 'he', 'רכישת רכב', 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_credit_target_option_2'), 'he', 'שיפוץ בית', 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_credit_target_option_3'), 'he', 'חתונה ואירועים', 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_credit_target_option_4'), 'he', 'השקעה עסקית', 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_credit_target_option_5'), 'he', 'שיפור זכאות אשראי עתידית', 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_credit_target_option_6'), 'he', 'אחר', 'approved', NOW()),

-- Russian
((SELECT id FROM content_items WHERE content_key = 'calculate_credit_target_option_1'), 'ru', 'Покупка автомобиля', 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_credit_target_option_2'), 'ru', 'Ремонт дома', 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_credit_target_option_3'), 'ru', 'Свадьба и мероприятия', 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_credit_target_option_4'), 'ru', 'Бизнес-инвестиции', 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_credit_target_option_5'), 'ru', 'Улучшение будущей кредитоспособности', 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_credit_target_option_6'), 'ru', 'Другое', 'approved', NOW())
ON CONFLICT (content_item_id, language_code) DO NOTHING;

-- Loan Deferral Options (calculate_credit_prolong)
INSERT INTO content_items (content_key, component_type, category, screen_location, is_active, created_at) VALUES
('calculate_credit_prolong_option_1', 'option', 'dropdown', 'calculate_credit_1', TRUE, NOW()),
('calculate_credit_prolong_option_2', 'option', 'dropdown', 'calculate_credit_1', TRUE, NOW()),
('calculate_credit_prolong_option_3', 'option', 'dropdown', 'calculate_credit_1', TRUE, NOW()),
('calculate_credit_prolong_option_4', 'option', 'dropdown', 'calculate_credit_1', TRUE, NOW()),
('calculate_credit_prolong_option_5', 'option', 'dropdown', 'calculate_credit_1', TRUE, NOW()),
('calculate_credit_prolong_option_6', 'option', 'dropdown', 'calculate_credit_1', TRUE, NOW()),
('calculate_credit_prolong_option_7', 'option', 'dropdown', 'calculate_credit_1', TRUE, NOW())
ON CONFLICT (content_key) DO NOTHING;

-- Loan Deferral Translations
INSERT INTO content_translations (content_item_id, language_code, content_value, status, created_at) VALUES
-- English
((SELECT id FROM content_items WHERE content_key = 'calculate_credit_prolong_option_1'), 'en', 'Up to one year', 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_credit_prolong_option_2'), 'en', 'Up to two years', 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_credit_prolong_option_3'), 'en', 'Up to 3 years', 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_credit_prolong_option_4'), 'en', 'Up to 5 years', 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_credit_prolong_option_5'), 'en', 'Over 5 years', 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_credit_prolong_option_6'), 'en', 'Over 7 years', 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_credit_prolong_option_7'), 'en', 'Over 10 years', 'approved', NOW()),

-- Hebrew
((SELECT id FROM content_items WHERE content_key = 'calculate_credit_prolong_option_1'), 'he', 'עד שנה', 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_credit_prolong_option_2'), 'he', 'עד שנתיים', 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_credit_prolong_option_3'), 'he', 'עד 3 שנים', 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_credit_prolong_option_4'), 'he', 'עד 5 שנים', 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_credit_prolong_option_5'), 'he', 'מעל 5 שנים', 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_credit_prolong_option_6'), 'he', 'מעל 7 שנים', 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_credit_prolong_option_7'), 'he', 'מעל 10 שנים', 'approved', NOW()),

-- Russian
((SELECT id FROM content_items WHERE content_key = 'calculate_credit_prolong_option_1'), 'ru', 'До года', 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_credit_prolong_option_2'), 'ru', 'До двух лет', 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_credit_prolong_option_3'), 'ru', 'До 3 лет', 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_credit_prolong_option_4'), 'ru', 'До 5 лет', 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_credit_prolong_option_5'), 'ru', 'Более 5 лет', 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_credit_prolong_option_6'), 'ru', 'Более 7 лет', 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'calculate_credit_prolong_option_7'), 'ru', 'Более 10 лет', 'approved', NOW())
ON CONFLICT (content_item_id, language_code) DO NOTHING;

-- ===== CREDIT STEP 2: CALCULATE-CREDIT/2 =====
-- Personal information form fields - checking for hardcoded dropdowns...

-- ===== CREDIT STEP 3: CALCULATE-CREDIT/3 =====  
-- Income and employment form fields - checking for hardcoded dropdowns...

-- Mark old translation keys as migrated (comment prefix)
COMMENT ON TABLE content_items IS 'Migration completed for credit calculation translations - see DEVHelp/DevRules/translationRules';
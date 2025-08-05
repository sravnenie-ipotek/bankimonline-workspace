-- Migration: Refinance Credit Step 4 - Complete Bank Offers
-- Date: 2025-01-26
-- Purpose: Add all content for refinance credit step 4 form (bank offers and results)

-- =====================================================
-- REFINANCE CREDIT STEP 4 - PAGE TITLE AND CAPTIONS
-- =====================================================

INSERT INTO content_items (
    content_key, 
    content_type, 
    category, 
    screen_location, 
    component_type,
    description,
    is_active, 
    legacy_translation_key,
    created_at
) VALUES
-- Page title
('refinance_credit_final', 'title', 'page', 'refinance_credit_4', 'text', 'Credit Refinancing Results', true, 'refinance_credit_final', NOW())
ON CONFLICT (content_key, screen_location) DO NOTHING;

-- Add translations for page title
INSERT INTO content_translations (
    content_item_id,
    language_code,
    content_value,
    is_default,
    status,
    created_at
) VALUES
-- English
((SELECT id FROM content_items WHERE content_key = 'refinance_credit_final' AND screen_location = 'refinance_credit_4'), 'en', 'Credit Refinancing Results', true, 'approved', NOW()),
-- Hebrew
((SELECT id FROM content_items WHERE content_key = 'refinance_credit_final' AND screen_location = 'refinance_credit_4'), 'he', 'תוצאות מחזור אשראי', false, 'approved', NOW()),
-- Russian
((SELECT id FROM content_items WHERE content_key = 'refinance_credit_final' AND screen_location = 'refinance_credit_4'), 'ru', 'Результаты рефинансирования кредита', false, 'approved', NOW())
ON CONFLICT (content_item_id, language_code) DO NOTHING;

-- =====================================================
-- WARNING MESSAGE AND RESULTS SECTION
-- =====================================================

INSERT INTO content_items (
    content_key, 
    content_type, 
    category, 
    screen_location, 
    component_type,
    description,
    is_active, 
    legacy_translation_key,
    created_at
) VALUES
-- Warning message
('refinance_credit_warning', 'label', 'warning', 'refinance_credit_4', 'text', 'The results above are estimates only for refinancing existing credit and do not constitute a commitment. To receive binding offers from banks, you must complete the registration process.', true, 'refinance_credit_warning', NOW()),

-- Result labels
('refinance_credit_new_amount', 'label', 'result_field', 'refinance_credit_4', 'text', 'New loan amount', true, 'refinance_credit_new_amount', NOW()),
('refinance_credit_new_monthly', 'label', 'result_field', 'refinance_credit_4', 'text', 'New monthly payment', true, 'refinance_credit_new_monthly', NOW()),
('refinance_credit_monthly_saving', 'label', 'result_field', 'refinance_credit_4', 'text', 'Monthly savings', true, 'refinance_credit_monthly_saving', NOW()),
('refinance_credit_total_saving', 'label', 'result_field', 'refinance_credit_4', 'text', 'Total savings', true, 'refinance_credit_total_saving', NOW())
ON CONFLICT (content_key, screen_location) DO NOTHING;

-- =====================================================
-- ADD ALL TRANSLATIONS
-- =====================================================

-- Warning message translations
INSERT INTO content_translations (
    content_item_id,
    language_code,
    content_value,
    is_default,
    status,
    created_at
) VALUES
-- English
((SELECT id FROM content_items WHERE content_key = 'refinance_credit_warning' AND screen_location = 'refinance_credit_4'), 'en', 'The results above are estimates only for refinancing existing credit and do not constitute a commitment. To receive binding offers from banks, you must complete the registration process.', true, 'approved', NOW()),
-- Hebrew
((SELECT id FROM content_items WHERE content_key = 'refinance_credit_warning' AND screen_location = 'refinance_credit_4'), 'he', 'התוצאות המפורטות לעיל הן הערכה בלבד למחזור אשראי קיים ואינן מהוות התחייבות. לקבלת הצעות מחייבות מהבנקים, נדרש להשלים את תהליך הרישום.', false, 'approved', NOW()),
-- Russian
((SELECT id FROM content_items WHERE content_key = 'refinance_credit_warning' AND screen_location = 'refinance_credit_4'), 'ru', 'Приведенные выше результаты являются только оценкой рефинансирования существующего кредита и не являются обязательством. Для получения обязывающих предложений от банков необходимо завершить процесс регистрации.', false, 'approved', NOW())
ON CONFLICT (content_item_id, language_code) DO NOTHING;

-- Result label translations
INSERT INTO content_translations (
    content_item_id,
    language_code,
    content_value,
    is_default,
    status,
    created_at
) VALUES
-- New amount translations
((SELECT id FROM content_items WHERE content_key = 'refinance_credit_new_amount' AND screen_location = 'refinance_credit_4'), 'en', 'New loan amount', true, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'refinance_credit_new_amount' AND screen_location = 'refinance_credit_4'), 'he', 'סכום ההלוואה החדש', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'refinance_credit_new_amount' AND screen_location = 'refinance_credit_4'), 'ru', 'Новая сумма кредита', false, 'approved', NOW()),

-- New monthly payment translations
((SELECT id FROM content_items WHERE content_key = 'refinance_credit_new_monthly' AND screen_location = 'refinance_credit_4'), 'en', 'New monthly payment', true, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'refinance_credit_new_monthly' AND screen_location = 'refinance_credit_4'), 'he', 'תשלום חודשי חדש', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'refinance_credit_new_monthly' AND screen_location = 'refinance_credit_4'), 'ru', 'Новый ежемесячный платеж', false, 'approved', NOW()),

-- Monthly savings translations
((SELECT id FROM content_items WHERE content_key = 'refinance_credit_monthly_saving' AND screen_location = 'refinance_credit_4'), 'en', 'Monthly savings', true, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'refinance_credit_monthly_saving' AND screen_location = 'refinance_credit_4'), 'he', 'חיסכון חודשי', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'refinance_credit_monthly_saving' AND screen_location = 'refinance_credit_4'), 'ru', 'Ежемесячная экономия', false, 'approved', NOW()),

-- Total savings translations
((SELECT id FROM content_items WHERE content_key = 'refinance_credit_total_saving' AND screen_location = 'refinance_credit_4'), 'en', 'Total savings', true, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'refinance_credit_total_saving' AND screen_location = 'refinance_credit_4'), 'he', 'חיסכון כולל', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'refinance_credit_total_saving' AND screen_location = 'refinance_credit_4'), 'ru', 'Общая экономия', false, 'approved', NOW())
ON CONFLICT (content_item_id, language_code) DO NOTHING;

-- Note: The step 4 page reuses components from the general bank offers system:
-- - UserParams component (displays user info)
-- - Filter component (bank filtering options)
-- - BankOffers component (displays bank offers)
-- These components use their own translations that are already migrated in other files

-- Mark the migration as completed
COMMENT ON TABLE content_items IS 'Refinance Credit Step 4 migration completed - all bank offers and results content added';
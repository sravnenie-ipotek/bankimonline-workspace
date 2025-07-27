-- Migration: Fix Missing Mortgage Step 4 Translations
-- Date: 2025-01-27
-- Purpose: Add missing translations for mortgage step 4 that were not displaying properly

-- =====================================================
-- MORTGAGE STEP 4 - MISSING TRANSLATIONS
-- =====================================================

-- Total Return (the second total in the card footer)
INSERT INTO content_items (key, screen_location, component_type, category, status, created_at)
VALUES ('mortgage_total_return', 'mortgage_step4', 'label', 'field_labels', 'active', NOW())
ON CONFLICT (key, screen_location) DO NOTHING;

INSERT INTO content_translations (content_item_id, language_code, value, status, created_at)
SELECT id, 'en', 'Total repayment', 'active', NOW()
FROM content_items WHERE key = 'mortgage_total_return' AND screen_location = 'mortgage_step4'
ON CONFLICT (content_item_id, language_code) DO NOTHING;

INSERT INTO content_translations (content_item_id, language_code, value, status, created_at)
SELECT id, 'he', 'סה"כ החזר', 'active', NOW()
FROM content_items WHERE key = 'mortgage_total_return' AND screen_location = 'mortgage_step4'
ON CONFLICT (content_item_id, language_code) DO NOTHING;

INSERT INTO content_translations (content_item_id, language_code, value, status, created_at)
SELECT id, 'ru', 'Общая сумма возврата', 'active', NOW()
FROM content_items WHERE key = 'mortgage_total_return' AND screen_location = 'mortgage_step4'
ON CONFLICT (content_item_id, language_code) DO NOTHING;

-- Select Bank Button
INSERT INTO content_items (key, screen_location, component_type, category, status, created_at)
VALUES ('mortgage_select_bank', 'mortgage_step4', 'button', 'actions', 'active', NOW())
ON CONFLICT (key, screen_location) DO NOTHING;

INSERT INTO content_translations (content_item_id, language_code, value, status, created_at)
SELECT id, 'en', 'Select this bank', 'active', NOW()
FROM content_items WHERE key = 'mortgage_select_bank' AND screen_location = 'mortgage_step4'
ON CONFLICT (content_item_id, language_code) DO NOTHING;

INSERT INTO content_translations (content_item_id, language_code, value, status, created_at)
SELECT id, 'he', 'בחר בנק זה', 'active', NOW()
FROM content_items WHERE key = 'mortgage_select_bank' AND screen_location = 'mortgage_step4'
ON CONFLICT (content_item_id, language_code) DO NOTHING;

INSERT INTO content_translations (content_item_id, language_code, value, status, created_at)
SELECT id, 'ru', 'Выбрать этот банк', 'active', NOW()
FROM content_items WHERE key = 'mortgage_select_bank' AND screen_location = 'mortgage_step4'
ON CONFLICT (content_item_id, language_code) DO NOTHING;

-- Also add these labels to bank_offers screen location for consistency
INSERT INTO content_items (key, screen_location, component_type, category, status, created_at)
VALUES ('mortgage_total_return', 'bank_offers', 'label', 'field_labels', 'active', NOW())
ON CONFLICT (key, screen_location) DO NOTHING;

INSERT INTO content_translations (content_item_id, language_code, value, status, created_at)
SELECT id, 'en', 'Total repayment', 'active', NOW()
FROM content_items WHERE key = 'mortgage_total_return' AND screen_location = 'bank_offers'
ON CONFLICT (content_item_id, language_code) DO NOTHING;

INSERT INTO content_translations (content_item_id, language_code, value, status, created_at)
SELECT id, 'he', 'סה"כ החזר', 'active', NOW()
FROM content_items WHERE key = 'mortgage_total_return' AND screen_location = 'bank_offers'
ON CONFLICT (content_item_id, language_code) DO NOTHING;

INSERT INTO content_translations (content_item_id, language_code, value, status, created_at)
SELECT id, 'ru', 'Общая сумма возврата', 'active', NOW()
FROM content_items WHERE key = 'mortgage_total_return' AND screen_location = 'bank_offers'
ON CONFLICT (content_item_id, language_code) DO NOTHING;

-- Let's also fix the program titles that appear to be showing in English
-- Looking at the screenshot, we need to ensure these are properly translated

-- Update the Info icon titles to use Hebrew
UPDATE content_translations 
SET value = 'רישום משכנתא' 
WHERE content_item_id = (
    SELECT id FROM content_items 
    WHERE key = 'mortgage_register' 
    AND screen_location = 'mortgage_step4'
) AND language_code = 'he';

-- Ensure mortgage_total has the proper Hebrew translation for mortgage_step4
INSERT INTO content_items (key, screen_location, component_type, category, status, created_at)
VALUES ('mortgage_total', 'mortgage_step4', 'label', 'field_labels', 'active', NOW())
ON CONFLICT (key, screen_location) DO NOTHING;

INSERT INTO content_translations (content_item_id, language_code, value, status, created_at)
SELECT id, 'en', 'Total amount', 'active', NOW()
FROM content_items WHERE key = 'mortgage_total' AND screen_location = 'mortgage_step4'
ON CONFLICT (content_item_id, language_code) DO NOTHING;

INSERT INTO content_translations (content_item_id, language_code, value, status, created_at)
SELECT id, 'he', 'סכום כולל', 'active', NOW()
FROM content_items WHERE key = 'mortgage_total' AND screen_location = 'mortgage_step4'
ON CONFLICT (content_item_id, language_code) DO NOTHING;

INSERT INTO content_translations (content_item_id, language_code, value, status, created_at)
SELECT id, 'ru', 'Общая сумма', 'active', NOW()
FROM content_items WHERE key = 'mortgage_total' AND screen_location = 'mortgage_step4'
ON CONFLICT (content_item_id, language_code) DO NOTHING;

-- Ensure mortgage_monthly has the proper Hebrew translation for mortgage_step4
INSERT INTO content_items (key, screen_location, component_type, category, status, created_at)
VALUES ('mortgage_monthly', 'mortgage_step4', 'label', 'field_labels', 'active', NOW())
ON CONFLICT (key, screen_location) DO NOTHING;

INSERT INTO content_translations (content_item_id, language_code, value, status, created_at)
SELECT id, 'en', 'Monthly payment', 'active', NOW()
FROM content_items WHERE key = 'mortgage_monthly' AND screen_location = 'mortgage_step4'
ON CONFLICT (content_item_id, language_code) DO NOTHING;

INSERT INTO content_translations (content_item_id, language_code, value, status, created_at)
SELECT id, 'he', 'תשלום חודשי', 'active', NOW()
FROM content_items WHERE key = 'mortgage_monthly' AND screen_location = 'mortgage_step4'
ON CONFLICT (content_item_id, language_code) DO NOTHING;

INSERT INTO content_translations (content_item_id, language_code, value, status, created_at)
SELECT id, 'ru', 'Ежемесячный платеж', 'active', NOW()
FROM content_items WHERE key = 'mortgage_monthly' AND screen_location = 'mortgage_step4'
ON CONFLICT (content_item_id, language_code) DO NOTHING;

-- Final commit message
-- Fixed missing translations for mortgage step 4, including total return label and select bank button
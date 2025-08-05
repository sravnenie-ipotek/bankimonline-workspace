-- Migration: Add Mortgage Step 4 Content
-- Date: 2025-01-27
-- Purpose: Add database content for mortgage calculator step 4 (results page)

-- =====================================================
-- MORTGAGE STEP 4 - RESULTS PAGE
-- =====================================================

-- Step 4 Title
INSERT INTO content_items (key, screen_location, component_type, category, status, created_at)
VALUES ('calculate_mortgage_final', 'mortgage_step4', 'title', 'page_titles', 'active', NOW())
ON CONFLICT (key, screen_location) DO NOTHING;

INSERT INTO content_translations (content_item_id, language_code, value, status, created_at)
SELECT id, 'en', 'Mortgage Offers', 'active', NOW()
FROM content_items WHERE key = 'calculate_mortgage_final' AND screen_location = 'mortgage_step4'
ON CONFLICT (content_item_id, language_code) DO NOTHING;

INSERT INTO content_translations (content_item_id, language_code, value, status, created_at)
SELECT id, 'he', 'הצעות משכנתאות', 'active', NOW()
FROM content_items WHERE key = 'calculate_mortgage_final' AND screen_location = 'mortgage_step4'
ON CONFLICT (content_item_id, language_code) DO NOTHING;

INSERT INTO content_translations (content_item_id, language_code, value, status, created_at)
SELECT id, 'ru', 'Предложения по ипотеке', 'active', NOW()
FROM content_items WHERE key = 'calculate_mortgage_final' AND screen_location = 'mortgage_step4'
ON CONFLICT (content_item_id, language_code) DO NOTHING;

-- Warning Message
INSERT INTO content_items (key, screen_location, component_type, category, status, created_at)
VALUES ('calculate_mortgage_warning', 'mortgage_step4', 'alert', 'messages', 'active', NOW())
ON CONFLICT (key, screen_location) DO NOTHING;

INSERT INTO content_translations (content_item_id, language_code, value, status, created_at)
SELECT id, 'en', 'The offers presented are initial and subject to bank approval and credit check.', 'active', NOW()
FROM content_items WHERE key = 'calculate_mortgage_warning' AND screen_location = 'mortgage_step4'
ON CONFLICT (content_item_id, language_code) DO NOTHING;

INSERT INTO content_translations (content_item_id, language_code, value, status, created_at)
SELECT id, 'he', 'ההצעות המוצגות הן ראשוניות וכפופות לאישור הבנק ובדיקת אשראי.', 'active', NOW()
FROM content_items WHERE key = 'calculate_mortgage_warning' AND screen_location = 'mortgage_step4'
ON CONFLICT (content_item_id, language_code) DO NOTHING;

INSERT INTO content_translations (content_item_id, language_code, value, status, created_at)
SELECT id, 'ru', 'Представленные предложения являются предварительными и подлежат утверждению банком и проверке кредитоспособности.', 'active', NOW()
FROM content_items WHERE key = 'calculate_mortgage_warning' AND screen_location = 'mortgage_step4'
ON CONFLICT (content_item_id, language_code) DO NOTHING;

-- =====================================================
-- BANK OFFERS COMPONENT CONTENT
-- =====================================================

-- No Bank Offers Available
INSERT INTO content_items (key, screen_location, component_type, category, status, created_at)
VALUES ('no_bank_offers_available', 'bank_offers', 'title', 'messages', 'active', NOW())
ON CONFLICT (key, screen_location) DO NOTHING;

INSERT INTO content_translations (content_item_id, language_code, value, status, created_at)
SELECT id, 'en', 'No Bank Offers Available', 'active', NOW()
FROM content_items WHERE key = 'no_bank_offers_available' AND screen_location = 'bank_offers'
ON CONFLICT (content_item_id, language_code) DO NOTHING;

INSERT INTO content_translations (content_item_id, language_code, value, status, created_at)
SELECT id, 'he', 'אין הצעות זמינות מהבנקים', 'active', NOW()
FROM content_items WHERE key = 'no_bank_offers_available' AND screen_location = 'bank_offers'
ON CONFLICT (content_item_id, language_code) DO NOTHING;

INSERT INTO content_translations (content_item_id, language_code, value, status, created_at)
SELECT id, 'ru', 'Нет доступных предложений от банков', 'active', NOW()
FROM content_items WHERE key = 'no_bank_offers_available' AND screen_location = 'bank_offers'
ON CONFLICT (content_item_id, language_code) DO NOTHING;

-- No Offers Message
INSERT INTO content_items (key, screen_location, component_type, category, status, created_at)
VALUES ('no_offers_message', 'bank_offers', 'text', 'messages', 'active', NOW())
ON CONFLICT (key, screen_location) DO NOTHING;

INSERT INTO content_translations (content_item_id, language_code, value, status, created_at)
SELECT id, 'en', 'No bank offers match your profile. Try adjusting your parameters.', 'active', NOW()
FROM content_items WHERE key = 'no_offers_message' AND screen_location = 'bank_offers'
ON CONFLICT (content_item_id, language_code) DO NOTHING;

INSERT INTO content_translations (content_item_id, language_code, value, status, created_at)
SELECT id, 'he', 'אין הצעות בנק התואמות את הפרופיל שלך. נסה להתאים את הפרמטרים.', 'active', NOW()
FROM content_items WHERE key = 'no_offers_message' AND screen_location = 'bank_offers'
ON CONFLICT (content_item_id, language_code) DO NOTHING;

INSERT INTO content_translations (content_item_id, language_code, value, status, created_at)
SELECT id, 'ru', 'Нет банковских предложений, соответствующих вашему профилю. Попробуйте изменить параметры.', 'active', NOW()
FROM content_items WHERE key = 'no_offers_message' AND screen_location = 'bank_offers'
ON CONFLICT (content_item_id, language_code) DO NOTHING;

-- Bank Name Label
INSERT INTO content_items (key, screen_location, component_type, category, status, created_at)
VALUES ('bank_name', 'bank_offers', 'label', 'labels', 'active', NOW())
ON CONFLICT (key, screen_location) DO NOTHING;

INSERT INTO content_translations (content_item_id, language_code, value, status, created_at)
SELECT id, 'en', 'Bank', 'active', NOW()
FROM content_items WHERE key = 'bank_name' AND screen_location = 'bank_offers'
ON CONFLICT (content_item_id, language_code) DO NOTHING;

INSERT INTO content_translations (content_item_id, language_code, value, status, created_at)
SELECT id, 'he', 'בנק', 'active', NOW()
FROM content_items WHERE key = 'bank_name' AND screen_location = 'bank_offers'
ON CONFLICT (content_item_id, language_code) DO NOTHING;

INSERT INTO content_translations (content_item_id, language_code, value, status, created_at)
SELECT id, 'ru', 'Банк', 'active', NOW()
FROM content_items WHERE key = 'bank_name' AND screen_location = 'bank_offers'
ON CONFLICT (content_item_id, language_code) DO NOTHING;

-- Mortgage Registration
INSERT INTO content_items (key, screen_location, component_type, category, status, created_at)
VALUES ('mortgage_register', 'bank_offers', 'label', 'labels', 'active', NOW())
ON CONFLICT (key, screen_location) DO NOTHING;

INSERT INTO content_translations (content_item_id, language_code, value, status, created_at)
SELECT id, 'en', 'Mortgage Registration', 'active', NOW()
FROM content_items WHERE key = 'mortgage_register' AND screen_location = 'bank_offers'
ON CONFLICT (content_item_id, language_code) DO NOTHING;

INSERT INTO content_translations (content_item_id, language_code, value, status, created_at)
SELECT id, 'he', 'רישום משכנתא', 'active', NOW()
FROM content_items WHERE key = 'mortgage_register' AND screen_location = 'bank_offers'
ON CONFLICT (content_item_id, language_code) DO NOTHING;

INSERT INTO content_translations (content_item_id, language_code, value, status, created_at)
SELECT id, 'ru', 'Регистрация ипотеки', 'active', NOW()
FROM content_items WHERE key = 'mortgage_register' AND screen_location = 'bank_offers'
ON CONFLICT (content_item_id, language_code) DO NOTHING;

-- Credit Registration
INSERT INTO content_items (key, screen_location, component_type, category, status, created_at)
VALUES ('bank_offers_credit_register', 'bank_offers', 'label', 'labels', 'active', NOW())
ON CONFLICT (key, screen_location) DO NOTHING;

INSERT INTO content_translations (content_item_id, language_code, value, status, created_at)
SELECT id, 'en', 'Credit Registration', 'active', NOW()
FROM content_items WHERE key = 'bank_offers_credit_register' AND screen_location = 'bank_offers'
ON CONFLICT (content_item_id, language_code) DO NOTHING;

INSERT INTO content_translations (content_item_id, language_code, value, status, created_at)
SELECT id, 'he', 'רישום אשראי', 'active', NOW()
FROM content_items WHERE key = 'bank_offers_credit_register' AND screen_location = 'bank_offers'
ON CONFLICT (content_item_id, language_code) DO NOTHING;

INSERT INTO content_translations (content_item_id, language_code, value, status, created_at)
SELECT id, 'ru', 'Регистрация кредита', 'active', NOW()
FROM content_items WHERE key = 'bank_offers_credit_register' AND screen_location = 'bank_offers'
ON CONFLICT (content_item_id, language_code) DO NOTHING;

-- =====================================================
-- MORTGAGE PROGRAM TYPES
-- =====================================================

-- Prime Rate Mortgage
INSERT INTO content_items (key, screen_location, component_type, category, status, created_at)
VALUES ('mortgage_prime_percent', 'bank_offers', 'label', 'program_types', 'active', NOW())
ON CONFLICT (key, screen_location) DO NOTHING;

INSERT INTO content_translations (content_item_id, language_code, value, status, created_at)
SELECT id, 'en', 'Prime Rate Mortgage', 'active', NOW()
FROM content_items WHERE key = 'mortgage_prime_percent' AND screen_location = 'bank_offers'
ON CONFLICT (content_item_id, language_code) DO NOTHING;

INSERT INTO content_translations (content_item_id, language_code, value, status, created_at)
SELECT id, 'he', 'משכנתא בריבית פריים', 'active', NOW()
FROM content_items WHERE key = 'mortgage_prime_percent' AND screen_location = 'bank_offers'
ON CONFLICT (content_item_id, language_code) DO NOTHING;

INSERT INTO content_translations (content_item_id, language_code, value, status, created_at)
SELECT id, 'ru', 'Ипотека по прайм-ставке', 'active', NOW()
FROM content_items WHERE key = 'mortgage_prime_percent' AND screen_location = 'bank_offers'
ON CONFLICT (content_item_id, language_code) DO NOTHING;

-- Fixed Rate Mortgage
INSERT INTO content_items (key, screen_location, component_type, category, status, created_at)
VALUES ('mortgage_fix_percent', 'bank_offers', 'label', 'program_types', 'active', NOW())
ON CONFLICT (key, screen_location) DO NOTHING;

INSERT INTO content_translations (content_item_id, language_code, value, status, created_at)
SELECT id, 'en', 'Fixed Rate Mortgage', 'active', NOW()
FROM content_items WHERE key = 'mortgage_fix_percent' AND screen_location = 'bank_offers'
ON CONFLICT (content_item_id, language_code) DO NOTHING;

INSERT INTO content_translations (content_item_id, language_code, value, status, created_at)
SELECT id, 'he', 'משכנתא בריבית קבועה', 'active', NOW()
FROM content_items WHERE key = 'mortgage_fix_percent' AND screen_location = 'bank_offers'
ON CONFLICT (content_item_id, language_code) DO NOTHING;

INSERT INTO content_translations (content_item_id, language_code, value, status, created_at)
SELECT id, 'ru', 'Ипотека с фиксированной ставкой', 'active', NOW()
FROM content_items WHERE key = 'mortgage_fix_percent' AND screen_location = 'bank_offers'
ON CONFLICT (content_item_id, language_code) DO NOTHING;

-- Variable Rate Mortgage
INSERT INTO content_items (key, screen_location, component_type, category, status, created_at)
VALUES ('mortgage_float_percent', 'bank_offers', 'label', 'program_types', 'active', NOW())
ON CONFLICT (key, screen_location) DO NOTHING;

INSERT INTO content_translations (content_item_id, language_code, value, status, created_at)
SELECT id, 'en', 'Variable Rate Mortgage', 'active', NOW()
FROM content_items WHERE key = 'mortgage_float_percent' AND screen_location = 'bank_offers'
ON CONFLICT (content_item_id, language_code) DO NOTHING;

INSERT INTO content_translations (content_item_id, language_code, value, status, created_at)
SELECT id, 'he', 'משכנתא בריבית משתנה', 'active', NOW()
FROM content_items WHERE key = 'mortgage_float_percent' AND screen_location = 'bank_offers'
ON CONFLICT (content_item_id, language_code) DO NOTHING;

INSERT INTO content_translations (content_item_id, language_code, value, status, created_at)
SELECT id, 'ru', 'Ипотека с плавающей ставкой', 'active', NOW()
FROM content_items WHERE key = 'mortgage_float_percent' AND screen_location = 'bank_offers'
ON CONFLICT (content_item_id, language_code) DO NOTHING;

-- =====================================================
-- CREDIT PROGRAM TYPES (for credit calculator)
-- =====================================================

-- Prime Rate Credit
INSERT INTO content_items (key, screen_location, component_type, category, status, created_at)
VALUES ('credit_prime_percent', 'bank_offers', 'label', 'program_types', 'active', NOW())
ON CONFLICT (key, screen_location) DO NOTHING;

INSERT INTO content_translations (content_item_id, language_code, value, status, created_at)
SELECT id, 'en', 'Prime Rate Credit', 'active', NOW()
FROM content_items WHERE key = 'credit_prime_percent' AND screen_location = 'bank_offers'
ON CONFLICT (content_item_id, language_code) DO NOTHING;

INSERT INTO content_translations (content_item_id, language_code, value, status, created_at)
SELECT id, 'he', 'אשראי בריבית פריים', 'active', NOW()
FROM content_items WHERE key = 'credit_prime_percent' AND screen_location = 'bank_offers'
ON CONFLICT (content_item_id, language_code) DO NOTHING;

INSERT INTO content_translations (content_item_id, language_code, value, status, created_at)
SELECT id, 'ru', 'Кредит по прайм-ставке', 'active', NOW()
FROM content_items WHERE key = 'credit_prime_percent' AND screen_location = 'bank_offers'
ON CONFLICT (content_item_id, language_code) DO NOTHING;

-- Fixed Rate Credit
INSERT INTO content_items (key, screen_location, component_type, category, status, created_at)
VALUES ('credit_fix_percent', 'bank_offers', 'label', 'program_types', 'active', NOW())
ON CONFLICT (key, screen_location) DO NOTHING;

INSERT INTO content_translations (content_item_id, language_code, value, status, created_at)
SELECT id, 'en', 'Fixed Rate Credit', 'active', NOW()
FROM content_items WHERE key = 'credit_fix_percent' AND screen_location = 'bank_offers'
ON CONFLICT (content_item_id, language_code) DO NOTHING;

INSERT INTO content_translations (content_item_id, language_code, value, status, created_at)
SELECT id, 'he', 'אשראי בריבית קבועה', 'active', NOW()
FROM content_items WHERE key = 'credit_fix_percent' AND screen_location = 'bank_offers'
ON CONFLICT (content_item_id, language_code) DO NOTHING;

INSERT INTO content_translations (content_item_id, language_code, value, status, created_at)
SELECT id, 'ru', 'Кредит с фиксированной ставкой', 'active', NOW()
FROM content_items WHERE key = 'credit_fix_percent' AND screen_location = 'bank_offers'
ON CONFLICT (content_item_id, language_code) DO NOTHING;

-- Variable Rate Credit
INSERT INTO content_items (key, screen_location, component_type, category, status, created_at)
VALUES ('credit_float_percent', 'bank_offers', 'label', 'program_types', 'active', NOW())
ON CONFLICT (key, screen_location) DO NOTHING;

INSERT INTO content_translations (content_item_id, language_code, value, status, created_at)
SELECT id, 'en', 'Variable Rate Credit', 'active', NOW()
FROM content_items WHERE key = 'credit_float_percent' AND screen_location = 'bank_offers'
ON CONFLICT (content_item_id, language_code) DO NOTHING;

INSERT INTO content_translations (content_item_id, language_code, value, status, created_at)
SELECT id, 'he', 'אשראי בריבית משתנה', 'active', NOW()
FROM content_items WHERE key = 'credit_float_percent' AND screen_location = 'bank_offers'
ON CONFLICT (content_item_id, language_code) DO NOTHING;

INSERT INTO content_translations (content_item_id, language_code, value, status, created_at)
SELECT id, 'ru', 'Кредит с плавающей ставкой', 'active', NOW()
FROM content_items WHERE key = 'credit_float_percent' AND screen_location = 'bank_offers'
ON CONFLICT (content_item_id, language_code) DO NOTHING;

-- =====================================================
-- PROGRAM CARD FIELD LABELS
-- =====================================================

-- Total Amount
INSERT INTO content_items (key, screen_location, component_type, category, status, created_at)
VALUES ('mortgage_total', 'bank_offers', 'label', 'field_labels', 'active', NOW())
ON CONFLICT (key, screen_location) DO NOTHING;

INSERT INTO content_translations (content_item_id, language_code, value, status, created_at)
SELECT id, 'en', 'Total amount', 'active', NOW()
FROM content_items WHERE key = 'mortgage_total' AND screen_location = 'bank_offers'
ON CONFLICT (content_item_id, language_code) DO NOTHING;

INSERT INTO content_translations (content_item_id, language_code, value, status, created_at)
SELECT id, 'he', 'סכום כולל', 'active', NOW()
FROM content_items WHERE key = 'mortgage_total' AND screen_location = 'bank_offers'
ON CONFLICT (content_item_id, language_code) DO NOTHING;

INSERT INTO content_translations (content_item_id, language_code, value, status, created_at)
SELECT id, 'ru', 'Общая сумма', 'active', NOW()
FROM content_items WHERE key = 'mortgage_total' AND screen_location = 'bank_offers'
ON CONFLICT (content_item_id, language_code) DO NOTHING;

-- Monthly Payment
INSERT INTO content_items (key, screen_location, component_type, category, status, created_at)
VALUES ('mortgage_monthly', 'bank_offers', 'label', 'field_labels', 'active', NOW())
ON CONFLICT (key, screen_location) DO NOTHING;

INSERT INTO content_translations (content_item_id, language_code, value, status, created_at)
SELECT id, 'en', 'Monthly payment', 'active', NOW()
FROM content_items WHERE key = 'mortgage_monthly' AND screen_location = 'bank_offers'
ON CONFLICT (content_item_id, language_code) DO NOTHING;

INSERT INTO content_translations (content_item_id, language_code, value, status, created_at)
SELECT id, 'he', 'תשלום חודשי', 'active', NOW()
FROM content_items WHERE key = 'mortgage_monthly' AND screen_location = 'bank_offers'
ON CONFLICT (content_item_id, language_code) DO NOTHING;

INSERT INTO content_translations (content_item_id, language_code, value, status, created_at)
SELECT id, 'ru', 'Ежемесячный платеж', 'active', NOW()
FROM content_items WHERE key = 'mortgage_monthly' AND screen_location = 'bank_offers'
ON CONFLICT (content_item_id, language_code) DO NOTHING;

-- Interest Rate
INSERT INTO content_items (key, screen_location, component_type, category, status, created_at)
VALUES ('mortgage_percnt', 'bank_offers', 'label', 'field_labels', 'active', NOW())
ON CONFLICT (key, screen_location) DO NOTHING;

INSERT INTO content_translations (content_item_id, language_code, value, status, created_at)
SELECT id, 'en', 'Interest rate', 'active', NOW()
FROM content_items WHERE key = 'mortgage_percnt' AND screen_location = 'bank_offers'
ON CONFLICT (content_item_id, language_code) DO NOTHING;

INSERT INTO content_translations (content_item_id, language_code, value, status, created_at)
SELECT id, 'he', 'שיעור ריבית', 'active', NOW()
FROM content_items WHERE key = 'mortgage_percnt' AND screen_location = 'bank_offers'
ON CONFLICT (content_item_id, language_code) DO NOTHING;

INSERT INTO content_translations (content_item_id, language_code, value, status, created_at)
SELECT id, 'ru', 'Процентная ставка', 'active', NOW()
FROM content_items WHERE key = 'mortgage_percnt' AND screen_location = 'bank_offers'
ON CONFLICT (content_item_id, language_code) DO NOTHING;

-- Repayment Period
INSERT INTO content_items (key, screen_location, component_type, category, status, created_at)
VALUES ('mortgage_term', 'bank_offers', 'label', 'field_labels', 'active', NOW())
ON CONFLICT (key, screen_location) DO NOTHING;

INSERT INTO content_translations (content_item_id, language_code, value, status, created_at)
SELECT id, 'en', 'Repayment period', 'active', NOW()
FROM content_items WHERE key = 'mortgage_term' AND screen_location = 'bank_offers'
ON CONFLICT (content_item_id, language_code) DO NOTHING;

INSERT INTO content_translations (content_item_id, language_code, value, status, created_at)
SELECT id, 'he', 'תקופת החזר', 'active', NOW()
FROM content_items WHERE key = 'mortgage_term' AND screen_location = 'bank_offers'
ON CONFLICT (content_item_id, language_code) DO NOTHING;

INSERT INTO content_translations (content_item_id, language_code, value, status, created_at)
SELECT id, 'ru', 'Период погашения', 'active', NOW()
FROM content_items WHERE key = 'mortgage_term' AND screen_location = 'bank_offers'
ON CONFLICT (content_item_id, language_code) DO NOTHING;

-- =====================================================
-- PROGRAM DESCRIPTIONS AND CONDITIONS
-- =====================================================

-- Prime Rate Description
INSERT INTO content_items (key, screen_location, component_type, category, status, created_at)
VALUES ('prime_description', 'bank_offers', 'text', 'descriptions', 'active', NOW())
ON CONFLICT (key, screen_location) DO NOTHING;

INSERT INTO content_translations (content_item_id, language_code, value, status, created_at)
SELECT id, 'en', 'Variable rate based on Bank of Israel prime rate', 'active', NOW()
FROM content_items WHERE key = 'prime_description' AND screen_location = 'bank_offers'
ON CONFLICT (content_item_id, language_code) DO NOTHING;

INSERT INTO content_translations (content_item_id, language_code, value, status, created_at)
SELECT id, 'he', 'ריבית משתנה המבוססת על ריבית הפריים של בנק ישראל', 'active', NOW()
FROM content_items WHERE key = 'prime_description' AND screen_location = 'bank_offers'
ON CONFLICT (content_item_id, language_code) DO NOTHING;

INSERT INTO content_translations (content_item_id, language_code, value, status, created_at)
SELECT id, 'ru', 'Переменная ставка на основе прайм-ставки Банка Израиля', 'active', NOW()
FROM content_items WHERE key = 'prime_description' AND screen_location = 'bank_offers'
ON CONFLICT (content_item_id, language_code) DO NOTHING;

-- Fixed Rate Description
INSERT INTO content_items (key, screen_location, component_type, category, status, created_at)
VALUES ('fixed_inflation_description', 'bank_offers', 'text', 'descriptions', 'active', NOW())
ON CONFLICT (key, screen_location) DO NOTHING;

INSERT INTO content_translations (content_item_id, language_code, value, status, created_at)
SELECT id, 'en', 'Fixed interest rate linked to inflation index', 'active', NOW()
FROM content_items WHERE key = 'fixed_inflation_description' AND screen_location = 'bank_offers'
ON CONFLICT (content_item_id, language_code) DO NOTHING;

INSERT INTO content_translations (content_item_id, language_code, value, status, created_at)
SELECT id, 'he', 'ריבית קבועה צמודה למדד המחירים לצרכן', 'active', NOW()
FROM content_items WHERE key = 'fixed_inflation_description' AND screen_location = 'bank_offers'
ON CONFLICT (content_item_id, language_code) DO NOTHING;

INSERT INTO content_translations (content_item_id, language_code, value, status, created_at)
SELECT id, 'ru', 'Фиксированная процентная ставка, привязанная к индексу инфляции', 'active', NOW()
FROM content_items WHERE key = 'fixed_inflation_description' AND screen_location = 'bank_offers'
ON CONFLICT (content_item_id, language_code) DO NOTHING;

-- Variable Rate Description
INSERT INTO content_items (key, screen_location, component_type, category, status, created_at)
VALUES ('variable_inflation_description', 'bank_offers', 'text', 'descriptions', 'active', NOW())
ON CONFLICT (key, screen_location) DO NOTHING;

INSERT INTO content_translations (content_item_id, language_code, value, status, created_at)
SELECT id, 'en', 'Variable interest rate linked to inflation index', 'active', NOW()
FROM content_items WHERE key = 'variable_inflation_description' AND screen_location = 'bank_offers'
ON CONFLICT (content_item_id, language_code) DO NOTHING;

INSERT INTO content_translations (content_item_id, language_code, value, status, created_at)
SELECT id, 'he', 'ריבית משתנה צמודה למדד המחירים לצרכן', 'active', NOW()
FROM content_items WHERE key = 'variable_inflation_description' AND screen_location = 'bank_offers'
ON CONFLICT (content_item_id, language_code) DO NOTHING;

INSERT INTO content_translations (content_item_id, language_code, value, status, created_at)
SELECT id, 'ru', 'Переменная процентная ставка, привязанная к индексу инфляции', 'active', NOW()
FROM content_items WHERE key = 'variable_inflation_description' AND screen_location = 'bank_offers'
ON CONFLICT (content_item_id, language_code) DO NOTHING;

-- Financing Conditions
INSERT INTO content_items (key, screen_location, component_type, category, status, created_at)
VALUES ('up_to_33_percent', 'bank_offers', 'text', 'conditions', 'active', NOW())
ON CONFLICT (key, screen_location) DO NOTHING;

INSERT INTO content_translations (content_item_id, language_code, value, status, created_at)
SELECT id, 'en', 'Up to 33%', 'active', NOW()
FROM content_items WHERE key = 'up_to_33_percent' AND screen_location = 'bank_offers'
ON CONFLICT (content_item_id, language_code) DO NOTHING;

INSERT INTO content_translations (content_item_id, language_code, value, status, created_at)
SELECT id, 'he', 'עד 33%', 'active', NOW()
FROM content_items WHERE key = 'up_to_33_percent' AND screen_location = 'bank_offers'
ON CONFLICT (content_item_id, language_code) DO NOTHING;

INSERT INTO content_translations (content_item_id, language_code, value, status, created_at)
SELECT id, 'ru', 'До 33%', 'active', NOW()
FROM content_items WHERE key = 'up_to_33_percent' AND screen_location = 'bank_offers'
ON CONFLICT (content_item_id, language_code) DO NOTHING;

INSERT INTO content_items (key, screen_location, component_type, category, status, created_at)
VALUES ('up_to_70_percent', 'bank_offers', 'text', 'conditions', 'active', NOW())
ON CONFLICT (key, screen_location) DO NOTHING;

INSERT INTO content_translations (content_item_id, language_code, value, status, created_at)
SELECT id, 'en', 'Up to 70%', 'active', NOW()
FROM content_items WHERE key = 'up_to_70_percent' AND screen_location = 'bank_offers'
ON CONFLICT (content_item_id, language_code) DO NOTHING;

INSERT INTO content_translations (content_item_id, language_code, value, status, created_at)
SELECT id, 'he', 'עד 70%', 'active', NOW()
FROM content_items WHERE key = 'up_to_70_percent' AND screen_location = 'bank_offers'
ON CONFLICT (content_item_id, language_code) DO NOTHING;

INSERT INTO content_translations (content_item_id, language_code, value, status, created_at)
SELECT id, 'ru', 'До 70%', 'active', NOW()
FROM content_items WHERE key = 'up_to_70_percent' AND screen_location = 'bank_offers'
ON CONFLICT (content_item_id, language_code) DO NOTHING;

INSERT INTO content_items (key, screen_location, component_type, category, status, created_at)
VALUES ('up_to_75_percent', 'bank_offers', 'text', 'conditions', 'active', NOW())
ON CONFLICT (key, screen_location) DO NOTHING;

INSERT INTO content_translations (content_item_id, language_code, value, status, created_at)
SELECT id, 'en', 'Up to 75%', 'active', NOW()
FROM content_items WHERE key = 'up_to_75_percent' AND screen_location = 'bank_offers'
ON CONFLICT (content_item_id, language_code) DO NOTHING;

INSERT INTO content_translations (content_item_id, language_code, value, status, created_at)
SELECT id, 'he', 'עד 75%', 'active', NOW()
FROM content_items WHERE key = 'up_to_75_percent' AND screen_location = 'bank_offers'
ON CONFLICT (content_item_id, language_code) DO NOTHING;

INSERT INTO content_translations (content_item_id, language_code, value, status, created_at)
SELECT id, 'ru', 'До 75%', 'active', NOW()
FROM content_items WHERE key = 'up_to_75_percent' AND screen_location = 'bank_offers'
ON CONFLICT (content_item_id, language_code) DO NOTHING;

-- Period Conditions
INSERT INTO content_items (key, screen_location, component_type, category, status, created_at)
VALUES ('4_to_30_years', 'bank_offers', 'text', 'conditions', 'active', NOW())
ON CONFLICT (key, screen_location) DO NOTHING;

INSERT INTO content_translations (content_item_id, language_code, value, status, created_at)
SELECT id, 'en', '4-30 years', 'active', NOW()
FROM content_items WHERE key = '4_to_30_years' AND screen_location = 'bank_offers'
ON CONFLICT (content_item_id, language_code) DO NOTHING;

INSERT INTO content_translations (content_item_id, language_code, value, status, created_at)
SELECT id, 'he', '4-30 שנים', 'active', NOW()
FROM content_items WHERE key = '4_to_30_years' AND screen_location = 'bank_offers'
ON CONFLICT (content_item_id, language_code) DO NOTHING;

INSERT INTO content_translations (content_item_id, language_code, value, status, created_at)
SELECT id, 'ru', '4-30 лет', 'active', NOW()
FROM content_items WHERE key = '4_to_30_years' AND screen_location = 'bank_offers'
ON CONFLICT (content_item_id, language_code) DO NOTHING;

INSERT INTO content_items (key, screen_location, component_type, category, status, created_at)
VALUES ('5_to_30_years', 'bank_offers', 'text', 'conditions', 'active', NOW())
ON CONFLICT (key, screen_location) DO NOTHING;

INSERT INTO content_translations (content_item_id, language_code, value, status, created_at)
SELECT id, 'en', '5-30 years', 'active', NOW()
FROM content_items WHERE key = '5_to_30_years' AND screen_location = 'bank_offers'
ON CONFLICT (content_item_id, language_code) DO NOTHING;

INSERT INTO content_translations (content_item_id, language_code, value, status, created_at)
SELECT id, 'he', '5-30 שנים', 'active', NOW()
FROM content_items WHERE key = '5_to_30_years' AND screen_location = 'bank_offers'
ON CONFLICT (content_item_id, language_code) DO NOTHING;

INSERT INTO content_translations (content_item_id, language_code, value, status, created_at)
SELECT id, 'ru', '5-30 лет', 'active', NOW()
FROM content_items WHERE key = '5_to_30_years' AND screen_location = 'bank_offers'
ON CONFLICT (content_item_id, language_code) DO NOTHING;

INSERT INTO content_items (key, screen_location, component_type, category, status, created_at)
VALUES ('4_to_25_years', 'bank_offers', 'text', 'conditions', 'active', NOW())
ON CONFLICT (key, screen_location) DO NOTHING;

INSERT INTO content_translations (content_item_id, language_code, value, status, created_at)
SELECT id, 'en', '4-25 years', 'active', NOW()
FROM content_items WHERE key = '4_to_25_years' AND screen_location = 'bank_offers'
ON CONFLICT (content_item_id, language_code) DO NOTHING;

INSERT INTO content_translations (content_item_id, language_code, value, status, created_at)
SELECT id, 'he', '4-25 שנים', 'active', NOW()
FROM content_items WHERE key = '4_to_25_years' AND screen_location = 'bank_offers'
ON CONFLICT (content_item_id, language_code) DO NOTHING;

INSERT INTO content_translations (content_item_id, language_code, value, status, created_at)
SELECT id, 'ru', '4-25 лет', 'active', NOW()
FROM content_items WHERE key = '4_to_25_years' AND screen_location = 'bank_offers'
ON CONFLICT (content_item_id, language_code) DO NOTHING;

-- Rate Structure Conditions
INSERT INTO content_items (key, screen_location, component_type, category, status, created_at)
VALUES ('prime_rate_structure', 'bank_offers', 'text', 'conditions', 'active', NOW())
ON CONFLICT (key, screen_location) DO NOTHING;

INSERT INTO content_translations (content_item_id, language_code, value, status, created_at)
SELECT id, 'en', 'Prime + Bank margin', 'active', NOW()
FROM content_items WHERE key = 'prime_rate_structure' AND screen_location = 'bank_offers'
ON CONFLICT (content_item_id, language_code) DO NOTHING;

INSERT INTO content_translations (content_item_id, language_code, value, status, created_at)
SELECT id, 'he', 'פריים + מרווח בנק', 'active', NOW()
FROM content_items WHERE key = 'prime_rate_structure' AND screen_location = 'bank_offers'
ON CONFLICT (content_item_id, language_code) DO NOTHING;

INSERT INTO content_translations (content_item_id, language_code, value, status, created_at)
SELECT id, 'ru', 'Прайм + банковская маржа', 'active', NOW()
FROM content_items WHERE key = 'prime_rate_structure' AND screen_location = 'bank_offers'
ON CONFLICT (content_item_id, language_code) DO NOTHING;

INSERT INTO content_items (key, screen_location, component_type, category, status, created_at)
VALUES ('fixed_rate_structure', 'bank_offers', 'text', 'conditions', 'active', NOW())
ON CONFLICT (key, screen_location) DO NOTHING;

INSERT INTO content_translations (content_item_id, language_code, value, status, created_at)
SELECT id, 'en', 'Fixed rate + CPI', 'active', NOW()
FROM content_items WHERE key = 'fixed_rate_structure' AND screen_location = 'bank_offers'
ON CONFLICT (content_item_id, language_code) DO NOTHING;

INSERT INTO content_translations (content_item_id, language_code, value, status, created_at)
SELECT id, 'he', 'ריבית קבועה + מדד', 'active', NOW()
FROM content_items WHERE key = 'fixed_rate_structure' AND screen_location = 'bank_offers'
ON CONFLICT (content_item_id, language_code) DO NOTHING;

INSERT INTO content_translations (content_item_id, language_code, value, status, created_at)
SELECT id, 'ru', 'Фиксированная ставка + ИПЦ', 'active', NOW()
FROM content_items WHERE key = 'fixed_rate_structure' AND screen_location = 'bank_offers'
ON CONFLICT (content_item_id, language_code) DO NOTHING;

INSERT INTO content_items (key, screen_location, component_type, category, status, created_at)
VALUES ('variable_rate_structure', 'bank_offers', 'text', 'conditions', 'active', NOW())
ON CONFLICT (key, screen_location) DO NOTHING;

INSERT INTO content_translations (content_item_id, language_code, value, status, created_at)
SELECT id, 'en', 'Variable rate + CPI', 'active', NOW()
FROM content_items WHERE key = 'variable_rate_structure' AND screen_location = 'bank_offers'
ON CONFLICT (content_item_id, language_code) DO NOTHING;

INSERT INTO content_translations (content_item_id, language_code, value, status, created_at)
SELECT id, 'he', 'ריבית משתנה + מדד', 'active', NOW()
FROM content_items WHERE key = 'variable_rate_structure' AND screen_location = 'bank_offers'
ON CONFLICT (content_item_id, language_code) DO NOTHING;

INSERT INTO content_translations (content_item_id, language_code, value, status, created_at)
SELECT id, 'ru', 'Переменная ставка + ИПЦ', 'active', NOW()
FROM content_items WHERE key = 'variable_rate_structure' AND screen_location = 'bank_offers'
ON CONFLICT (content_item_id, language_code) DO NOTHING;

-- Final commit message
-- Added comprehensive database content for mortgage calculator step 4 (results page),
-- including all labels, program types, field names, and conditions in English, Hebrew, and Russian
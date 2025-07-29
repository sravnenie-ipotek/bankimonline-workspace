-- Migration: Add Missing Content for Refinance Mortgage Step 1 (FIXED)
-- Date: 2025-01-22
-- Purpose: Add all missing dropdown options, labels, and placeholders for refinance_step1
-- Following @translationRules conventions exactly

-- =====================================================
-- REFINANCE MORTGAGE STEP 1 - WHY REFINANCE OPTIONS
-- =====================================================

-- Add content items for why refinance dropdown options
INSERT INTO content_items (
    content_key, 
    component_type, 
    category, 
    screen_location, 
    status,
    is_active, 
    created_at
) VALUES
-- Why refinance options
('app.refinance.step1.why_option_1', 'option', 'refinance_reason', 'refinance_step1', 'active', true, NOW()),
('app.refinance.step1.why_option_2', 'option', 'refinance_reason', 'refinance_step1', 'active', true, NOW()),
('app.refinance.step1.why_option_3', 'option', 'refinance_reason', 'refinance_step1', 'active', true, NOW()),
('app.refinance.step1.why_option_4', 'option', 'refinance_reason', 'refinance_step1', 'active', true, NOW()),
('app.refinance.step1.why_option_5', 'option', 'refinance_reason', 'refinance_step1', 'active', true, NOW());

-- Add translations for why refinance options
INSERT INTO content_translations (
    content_item_id,
    language_code,
    content_value,
    status,
    created_at
) VALUES
-- English translations
((SELECT id FROM content_items WHERE content_key = 'app.refinance.step1.why_option_1' AND screen_location = 'refinance_step1'), 'en', 'Lower Interest Rate', 'active', NOW()),
((SELECT id FROM content_items WHERE content_key = 'app.refinance.step1.why_option_2' AND screen_location = 'refinance_step1'), 'en', 'Reduce Monthly Payment', 'active', NOW()),
((SELECT id FROM content_items WHERE content_key = 'app.refinance.step1.why_option_3' AND screen_location = 'refinance_step1'), 'en', 'Shorten Mortgage Term', 'active', NOW()),
((SELECT id FROM content_items WHERE content_key = 'app.refinance.step1.why_option_4' AND screen_location = 'refinance_step1'), 'en', 'Cash Out Refinance', 'active', NOW()),
((SELECT id FROM content_items WHERE content_key = 'app.refinance.step1.why_option_5' AND screen_location = 'refinance_step1'), 'en', 'Consolidate Debts', 'active', NOW()),

-- Hebrew translations
((SELECT id FROM content_items WHERE content_key = 'app.refinance.step1.why_option_1' AND screen_location = 'refinance_step1'), 'he', 'הורדת ריבית', 'active', NOW()),
((SELECT id FROM content_items WHERE content_key = 'app.refinance.step1.why_option_2' AND screen_location = 'refinance_step1'), 'he', 'הפחתת תשלום חודשי', 'active', NOW()),
((SELECT id FROM content_items WHERE content_key = 'app.refinance.step1.why_option_3' AND screen_location = 'refinance_step1'), 'he', 'קיצור תקופת המשכנתא', 'active', NOW()),
((SELECT id FROM content_items WHERE content_key = 'app.refinance.step1.why_option_4' AND screen_location = 'refinance_step1'), 'he', 'מחזור עם משיכת כספים', 'active', NOW()),
((SELECT id FROM content_items WHERE content_key = 'app.refinance.step1.why_option_5' AND screen_location = 'refinance_step1'), 'he', 'איחוד חובות', 'active', NOW()),

-- Russian translations
((SELECT id FROM content_items WHERE content_key = 'app.refinance.step1.why_option_1' AND screen_location = 'refinance_step1'), 'ru', 'Снижение процентной ставки', 'active', NOW()),
((SELECT id FROM content_items WHERE content_key = 'app.refinance.step1.why_option_2' AND screen_location = 'refinance_step1'), 'ru', 'Уменьшение ежемесячного платежа', 'active', NOW()),
((SELECT id FROM content_items WHERE content_key = 'app.refinance.step1.why_option_3' AND screen_location = 'refinance_step1'), 'ru', 'Сокращение срока ипотеки', 'active', NOW()),
((SELECT id FROM content_items WHERE content_key = 'app.refinance.step1.why_option_4' AND screen_location = 'refinance_step1'), 'ru', 'Рефинансирование с извлечением средств', 'active', NOW()),
((SELECT id FROM content_items WHERE content_key = 'app.refinance.step1.why_option_5' AND screen_location = 'refinance_step1'), 'ru', 'Консолидация долгов', 'active', NOW());

-- =====================================================
-- REFINANCE MORTGAGE STEP 1 - REGISTRATION STATUS OPTIONS
-- =====================================================

-- Add content items for registration status dropdown options
INSERT INTO content_items (
    content_key, 
    component_type, 
    category, 
    screen_location, 
    status,
    is_active, 
    created_at
) VALUES
-- Registration status options
('app.refinance.step1.registered_option_1', 'option', 'registration_status', 'refinance_step1', 'active', true, NOW()),
('app.refinance.step1.registered_option_2', 'option', 'registration_status', 'refinance_step1', 'active', true, NOW());

-- Add translations for registration status options
INSERT INTO content_translations (
    content_item_id,
    language_code,
    content_value,
    status,
    created_at
) VALUES
-- English translations
((SELECT id FROM content_items WHERE content_key = 'app.refinance.step1.registered_option_1' AND screen_location = 'refinance_step1'), 'en', 'Yes, Registered in Land Registry', 'active', NOW()),
((SELECT id FROM content_items WHERE content_key = 'app.refinance.step1.registered_option_2' AND screen_location = 'refinance_step1'), 'en', 'No, Not Registered', 'active', NOW()),

-- Hebrew translations
((SELECT id FROM content_items WHERE content_key = 'app.refinance.step1.registered_option_1' AND screen_location = 'refinance_step1'), 'he', 'כן, רשום בטאבו', 'active', NOW()),
((SELECT id FROM content_items WHERE content_key = 'app.refinance.step1.registered_option_2' AND screen_location = 'refinance_step1'), 'he', 'לא, לא רשום', 'active', NOW()),

-- Russian translations
((SELECT id FROM content_items WHERE content_key = 'app.refinance.step1.registered_option_1' AND screen_location = 'refinance_step1'), 'ru', 'Да, зарегистрировано в земельном кадастре', 'active', NOW()),
((SELECT id FROM content_items WHERE content_key = 'app.refinance.step1.registered_option_2' AND screen_location = 'refinance_step1'), 'ru', 'Нет, не зарегистрировано', 'active', NOW());

-- =====================================================
-- REFINANCE MORTGAGE STEP 1 - BANK OPTIONS
-- =====================================================

-- Add content items for bank dropdown options
INSERT INTO content_items (
    content_key, 
    component_type, 
    category, 
    screen_location, 
    status,
    is_active, 
    created_at
) VALUES
-- Bank options
('app.refinance.step1.bank_hapoalim', 'option', 'bank', 'refinance_step1', 'active', true, NOW()),
('app.refinance.step1.bank_leumi', 'option', 'bank', 'refinance_step1', 'active', true, NOW()),
('app.refinance.step1.bank_discount', 'option', 'bank', 'refinance_step1', 'active', true, NOW()),
('app.refinance.step1.bank_massad', 'option', 'bank', 'refinance_step1', 'active', true, NOW());

-- Add translations for bank options
INSERT INTO content_translations (
    content_item_id,
    language_code,
    content_value,
    status,
    created_at
) VALUES
-- English translations
((SELECT id FROM content_items WHERE content_key = 'app.refinance.step1.bank_hapoalim' AND screen_location = 'refinance_step1'), 'en', 'Bank Hapoalim', 'active', NOW()),
((SELECT id FROM content_items WHERE content_key = 'app.refinance.step1.bank_leumi' AND screen_location = 'refinance_step1'), 'en', 'Bank Leumi', 'active', NOW()),
((SELECT id FROM content_items WHERE content_key = 'app.refinance.step1.bank_discount' AND screen_location = 'refinance_step1'), 'en', 'Discount Bank', 'active', NOW()),
((SELECT id FROM content_items WHERE content_key = 'app.refinance.step1.bank_massad' AND screen_location = 'refinance_step1'), 'en', 'Massad Bank', 'active', NOW()),

-- Hebrew translations
((SELECT id FROM content_items WHERE content_key = 'app.refinance.step1.bank_hapoalim' AND screen_location = 'refinance_step1'), 'he', 'בנק הפועלים', 'active', NOW()),
((SELECT id FROM content_items WHERE content_key = 'app.refinance.step1.bank_leumi' AND screen_location = 'refinance_step1'), 'he', 'בנק לאומי', 'active', NOW()),
((SELECT id FROM content_items WHERE content_key = 'app.refinance.step1.bank_discount' AND screen_location = 'refinance_step1'), 'he', 'בנק דיסקונט', 'active', NOW()),
((SELECT id FROM content_items WHERE content_key = 'app.refinance.step1.bank_massad' AND screen_location = 'refinance_step1'), 'he', 'בנק המסד', 'active', NOW()),

-- Russian translations
((SELECT id FROM content_items WHERE content_key = 'app.refinance.step1.bank_hapoalim' AND screen_location = 'refinance_step1'), 'ru', 'Банк Хапоалим', 'active', NOW()),
((SELECT id FROM content_items WHERE content_key = 'app.refinance.step1.bank_leumi' AND screen_location = 'refinance_step1'), 'ru', 'Банк Леуми', 'active', NOW()),
((SELECT id FROM content_items WHERE content_key = 'app.refinance.step1.bank_discount' AND screen_location = 'refinance_step1'), 'ru', 'Дисконт Банк', 'active', NOW()),
((SELECT id FROM content_items WHERE content_key = 'app.refinance.step1.bank_massad' AND screen_location = 'refinance_step1'), 'ru', 'Банк Масад', 'active', NOW());

-- =====================================================
-- REFINANCE MORTGAGE STEP 1 - FORM LABELS AND TITLES
-- =====================================================

-- Add content items for form labels and titles
INSERT INTO content_items (
    content_key, 
    component_type, 
    category, 
    screen_location, 
    status,
    is_active, 
    created_at
) VALUES
-- Form labels and titles
('app.refinance.step1.title', 'title', 'form_header', 'refinance_step1', 'active', true, NOW()),
('app.refinance.step1.why_label', 'label', 'form_field', 'refinance_step1', 'active', true, NOW()),
('app.refinance.step1.balance_label', 'label', 'form_field', 'refinance_step1', 'active', true, NOW()),
('app.refinance.step1.property_value_label', 'label', 'form_field', 'refinance_step1', 'active', true, NOW()),
('app.refinance.step1.property_type_label', 'label', 'form_field', 'refinance_step1', 'active', true, NOW()),
('app.refinance.step1.current_bank_label', 'label', 'form_field', 'refinance_step1', 'active', true, NOW()),
('app.refinance.step1.registered_label', 'label', 'form_field', 'refinance_step1', 'active', true, NOW()),
('app.refinance.step1.start_date_label', 'label', 'form_field', 'refinance_step1', 'active', true, NOW());

-- Add translations for form labels and titles
INSERT INTO content_translations (
    content_item_id,
    language_code,
    content_value,
    status,
    created_at
) VALUES
-- English translations
((SELECT id FROM content_items WHERE content_key = 'app.refinance.step1.title' AND screen_location = 'refinance_step1'), 'en', 'Mortgage Refinancing', 'active', NOW()),
((SELECT id FROM content_items WHERE content_key = 'app.refinance.step1.why_label' AND screen_location = 'refinance_step1'), 'en', 'Purpose of Mortgage Refinance', 'active', NOW()),
((SELECT id FROM content_items WHERE content_key = 'app.refinance.step1.balance_label' AND screen_location = 'refinance_step1'), 'en', 'Remaining Mortgage Balance', 'active', NOW()),
((SELECT id FROM content_items WHERE content_key = 'app.refinance.step1.property_value_label' AND screen_location = 'refinance_step1'), 'en', 'Current Property Value', 'active', NOW()),
((SELECT id FROM content_items WHERE content_key = 'app.refinance.step1.property_type_label' AND screen_location = 'refinance_step1'), 'en', 'Property Type', 'active', NOW()),
((SELECT id FROM content_items WHERE content_key = 'app.refinance.step1.current_bank_label' AND screen_location = 'refinance_step1'), 'en', 'Current Mortgage Bank', 'active', NOW()),
((SELECT id FROM content_items WHERE content_key = 'app.refinance.step1.registered_label' AND screen_location = 'refinance_step1'), 'en', 'Is the Mortgage Registered in Land Registry?', 'active', NOW()),
((SELECT id FROM content_items WHERE content_key = 'app.refinance.step1.start_date_label' AND screen_location = 'refinance_step1'), 'en', 'Mortgage Start Date', 'active', NOW()),

-- Hebrew translations
((SELECT id FROM content_items WHERE content_key = 'app.refinance.step1.title' AND screen_location = 'refinance_step1'), 'he', 'מחזור משכנתא', 'active', NOW()),
((SELECT id FROM content_items WHERE content_key = 'app.refinance.step1.why_label' AND screen_location = 'refinance_step1'), 'he', 'מטרת מחזור המשכנתא', 'active', NOW()),
((SELECT id FROM content_items WHERE content_key = 'app.refinance.step1.balance_label' AND screen_location = 'refinance_step1'), 'he', 'יתרת המשכנתא הנוכחית', 'active', NOW()),
((SELECT id FROM content_items WHERE content_key = 'app.refinance.step1.property_value_label' AND screen_location = 'refinance_step1'), 'he', 'שווי הנכס הנוכחי', 'active', NOW()),
((SELECT id FROM content_items WHERE content_key = 'app.refinance.step1.property_type_label' AND screen_location = 'refinance_step1'), 'he', 'סוג הנכס', 'active', NOW()),
((SELECT id FROM content_items WHERE content_key = 'app.refinance.step1.current_bank_label' AND screen_location = 'refinance_step1'), 'he', 'בנק המשכנתא הנוכחי', 'active', NOW()),
((SELECT id FROM content_items WHERE content_key = 'app.refinance.step1.registered_label' AND screen_location = 'refinance_step1'), 'he', 'האם המשכנתא רשומה בטאבו?', 'active', NOW()),
((SELECT id FROM content_items WHERE content_key = 'app.refinance.step1.start_date_label' AND screen_location = 'refinance_step1'), 'he', 'תאריך תחילת המשכנתא', 'active', NOW()),

-- Russian translations
((SELECT id FROM content_items WHERE content_key = 'app.refinance.step1.title' AND screen_location = 'refinance_step1'), 'ru', 'Рефинансирование ипотеки', 'active', NOW()),
((SELECT id FROM content_items WHERE content_key = 'app.refinance.step1.why_label' AND screen_location = 'refinance_step1'), 'ru', 'Цель рефинансирования ипотеки', 'active', NOW()),
((SELECT id FROM content_items WHERE content_key = 'app.refinance.step1.balance_label' AND screen_location = 'refinance_step1'), 'ru', 'Остаток по ипотеке', 'active', NOW()),
((SELECT id FROM content_items WHERE content_key = 'app.refinance.step1.property_value_label' AND screen_location = 'refinance_step1'), 'ru', 'Текущая стоимость недвижимости', 'active', NOW()),
((SELECT id FROM content_items WHERE content_key = 'app.refinance.step1.property_type_label' AND screen_location = 'refinance_step1'), 'ru', 'Тип недвижимости', 'active', NOW()),
((SELECT id FROM content_items WHERE content_key = 'app.refinance.step1.current_bank_label' AND screen_location = 'refinance_step1'), 'ru', 'Текущий банк ипотеки', 'active', NOW()),
((SELECT id FROM content_items WHERE content_key = 'app.refinance.step1.registered_label' AND screen_location = 'refinance_step1'), 'ru', 'Зарегистрирована ли ипотека в земельном кадастре?', 'active', NOW()),
((SELECT id FROM content_items WHERE content_key = 'app.refinance.step1.start_date_label' AND screen_location = 'refinance_step1'), 'ru', 'Дата начала ипотеки', 'active', NOW());

-- =====================================================
-- VERIFICATION QUERY
-- =====================================================

-- Query to verify all content was added successfully
SELECT 
    ci.content_key,
    ci.component_type,
    ci.category,
    ci.screen_location,
    ct_he.content_value as title_he,
    ct_ru.content_value as title_ru,
    ct_en.content_value as title_en
FROM content_items ci
LEFT JOIN content_translations ct_he ON ci.id = ct_he.content_item_id AND ct_he.language_code = 'he' AND ct_he.status = 'active'
LEFT JOIN content_translations ct_ru ON ci.id = ct_ru.content_item_id AND ct_ru.language_code = 'ru' AND ct_ru.status = 'active'
LEFT JOIN content_translations ct_en ON ci.id = ct_en.content_item_id AND ct_en.language_code = 'en' AND ct_en.status = 'active'
WHERE ci.screen_location = 'refinance_step1' 
    AND ci.content_key LIKE 'app.refinance.step1.%'
ORDER BY ci.content_key; 
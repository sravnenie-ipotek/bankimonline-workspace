-- Migration: Add Missing Content for Refinance Mortgage Step 1
-- Date: 2025-01-22
-- Purpose: Add all missing dropdown options, labels, and placeholders for refinance_step1
-- Following @translationRules conventions exactly

-- =====================================================
-- REFINANCE MORTGAGE STEP 1 - WHY REFINANCE OPTIONS
-- =====================================================

-- Add content items for why refinance dropdown options
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
-- Why refinance options
('app.refinance.step1.why_option_1', 'text', 'refinance_reason', 'refinance_step1', 'option', 'Lower Interest Rate', true, 'app.refinance.step1.why_option_1', NOW()),
('app.refinance.step1.why_option_2', 'text', 'refinance_reason', 'refinance_step1', 'option', 'Reduce Monthly Payment', true, 'app.refinance.step1.why_option_2', NOW()),
('app.refinance.step1.why_option_3', 'text', 'refinance_reason', 'refinance_step1', 'option', 'Shorten Mortgage Term', true, 'app.refinance.step1.why_option_3', NOW()),
('app.refinance.step1.why_option_4', 'text', 'refinance_reason', 'refinance_step1', 'option', 'Cash Out Refinance', true, 'app.refinance.step1.why_option_4', NOW()),
('app.refinance.step1.why_option_5', 'text', 'refinance_reason', 'refinance_step1', 'option', 'Consolidate Debts', true, 'app.refinance.step1.why_option_5', NOW());

-- Add translations for why refinance options
INSERT INTO content_translations (
    content_item_id,
    language_code,
    content_value,
    is_default,
    status,
    created_at
) VALUES
-- English translations
((SELECT id FROM content_items WHERE content_key = 'app.refinance.step1.why_option_1' AND screen_location = 'refinance_step1'), 'en', 'Lower Interest Rate', true, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'app.refinance.step1.why_option_2' AND screen_location = 'refinance_step1'), 'en', 'Reduce Monthly Payment', true, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'app.refinance.step1.why_option_3' AND screen_location = 'refinance_step1'), 'en', 'Shorten Mortgage Term', true, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'app.refinance.step1.why_option_4' AND screen_location = 'refinance_step1'), 'en', 'Cash Out Refinance', true, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'app.refinance.step1.why_option_5' AND screen_location = 'refinance_step1'), 'en', 'Consolidate Debts', true, 'approved', NOW()),

-- Hebrew translations
((SELECT id FROM content_items WHERE content_key = 'app.refinance.step1.why_option_1' AND screen_location = 'refinance_step1'), 'he', 'הורדת ריבית', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'app.refinance.step1.why_option_2' AND screen_location = 'refinance_step1'), 'he', 'הפחתת תשלום חודשי', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'app.refinance.step1.why_option_3' AND screen_location = 'refinance_step1'), 'he', 'קיצור תקופת המשכנתא', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'app.refinance.step1.why_option_4' AND screen_location = 'refinance_step1'), 'he', 'מחזור עם משיכת כספים', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'app.refinance.step1.why_option_5' AND screen_location = 'refinance_step1'), 'he', 'איחוד חובות', false, 'approved', NOW()),

-- Russian translations
((SELECT id FROM content_items WHERE content_key = 'app.refinance.step1.why_option_1' AND screen_location = 'refinance_step1'), 'ru', 'Снижение процентной ставки', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'app.refinance.step1.why_option_2' AND screen_location = 'refinance_step1'), 'ru', 'Уменьшение ежемесячного платежа', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'app.refinance.step1.why_option_3' AND screen_location = 'refinance_step1'), 'ru', 'Сокращение срока ипотеки', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'app.refinance.step1.why_option_4' AND screen_location = 'refinance_step1'), 'ru', 'Рефинансирование с извлечением средств', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'app.refinance.step1.why_option_5' AND screen_location = 'refinance_step1'), 'ru', 'Консолидация долгов', false, 'approved', NOW());

-- =====================================================
-- REFINANCE MORTGAGE STEP 1 - REGISTRATION STATUS OPTIONS
-- =====================================================

-- Add content items for registration status dropdown options
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
-- Registration status options
('app.refinance.step1.registered_option_1', 'text', 'registration_status', 'refinance_step1', 'option', 'Yes, Registered in Land Registry', true, 'app.refinance.step1.registered_option_1', NOW()),
('app.refinance.step1.registered_option_2', 'text', 'registration_status', 'refinance_step1', 'option', 'No, Not Registered', true, 'app.refinance.step1.registered_option_2', NOW());

-- Add translations for registration status options
INSERT INTO content_translations (
    content_item_id,
    language_code,
    content_value,
    is_default,
    status,
    created_at
) VALUES
-- English translations
((SELECT id FROM content_items WHERE content_key = 'app.refinance.step1.registered_option_1' AND screen_location = 'refinance_step1'), 'en', 'Yes, Registered in Land Registry', true, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'app.refinance.step1.registered_option_2' AND screen_location = 'refinance_step1'), 'en', 'No, Not Registered', true, 'approved', NOW()),

-- Hebrew translations
((SELECT id FROM content_items WHERE content_key = 'app.refinance.step1.registered_option_1' AND screen_location = 'refinance_step1'), 'he', 'כן, רשום בטאבו', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'app.refinance.step1.registered_option_2' AND screen_location = 'refinance_step1'), 'he', 'לא, לא רשום', false, 'approved', NOW()),

-- Russian translations
((SELECT id FROM content_items WHERE content_key = 'app.refinance.step1.registered_option_1' AND screen_location = 'refinance_step1'), 'ru', 'Да, зарегистрировано в земельном кадастре', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'app.refinance.step1.registered_option_2' AND screen_location = 'refinance_step1'), 'ru', 'Нет, не зарегистрировано', false, 'approved', NOW());

-- =====================================================
-- REFINANCE MORTGAGE STEP 1 - BANK OPTIONS
-- =====================================================

-- Add content items for bank dropdown options
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
-- Bank options
('app.refinance.step1.bank_hapoalim', 'text', 'bank', 'refinance_step1', 'option', 'Bank Hapoalim', true, 'app.refinance.step1.bank_hapoalim', NOW()),
('app.refinance.step1.bank_leumi', 'text', 'bank', 'refinance_step1', 'option', 'Bank Leumi', true, 'app.refinance.step1.bank_leumi', NOW()),
('app.refinance.step1.bank_discount', 'text', 'bank', 'refinance_step1', 'option', 'Discount Bank', true, 'app.refinance.step1.bank_discount', NOW()),
('app.refinance.step1.bank_massad', 'text', 'bank', 'refinance_step1', 'option', 'Massad Bank', true, 'app.refinance.step1.bank_massad', NOW());

-- Add translations for bank options
INSERT INTO content_translations (
    content_item_id,
    language_code,
    content_value,
    is_default,
    status,
    created_at
) VALUES
-- English translations
((SELECT id FROM content_items WHERE content_key = 'app.refinance.step1.bank_hapoalim' AND screen_location = 'refinance_step1'), 'en', 'Bank Hapoalim', true, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'app.refinance.step1.bank_leumi' AND screen_location = 'refinance_step1'), 'en', 'Bank Leumi', true, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'app.refinance.step1.bank_discount' AND screen_location = 'refinance_step1'), 'en', 'Discount Bank', true, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'app.refinance.step1.bank_massad' AND screen_location = 'refinance_step1'), 'en', 'Massad Bank', true, 'approved', NOW()),

-- Hebrew translations
((SELECT id FROM content_items WHERE content_key = 'app.refinance.step1.bank_hapoalim' AND screen_location = 'refinance_step1'), 'he', 'בנק הפועלים', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'app.refinance.step1.bank_leumi' AND screen_location = 'refinance_step1'), 'he', 'בנק לאומי', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'app.refinance.step1.bank_discount' AND screen_location = 'refinance_step1'), 'he', 'בנק דיסקונט', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'app.refinance.step1.bank_massad' AND screen_location = 'refinance_step1'), 'he', 'בנק המסד', false, 'approved', NOW()),

-- Russian translations
((SELECT id FROM content_items WHERE content_key = 'app.refinance.step1.bank_hapoalim' AND screen_location = 'refinance_step1'), 'ru', 'Банк Хапоалим', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'app.refinance.step1.bank_leumi' AND screen_location = 'refinance_step1'), 'ru', 'Банк Леуми', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'app.refinance.step1.bank_discount' AND screen_location = 'refinance_step1'), 'ru', 'Дисконт Банк', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'app.refinance.step1.bank_massad' AND screen_location = 'refinance_step1'), 'ru', 'Банк Масад', false, 'approved', NOW());

-- =====================================================
-- REFINANCE MORTGAGE STEP 1 - FORM LABELS AND TITLES
-- =====================================================

-- Add content items for form labels and titles
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
-- Form labels and titles
('app.refinance.step1.title', 'text', 'form_header', 'refinance_step1', 'title', 'Mortgage Refinancing', true, 'app.refinance.step1.title', NOW()),
('app.refinance.step1.why_label', 'text', 'form_field', 'refinance_step1', 'label', 'Purpose of Mortgage Refinance', true, 'app.refinance.step1.why_label', NOW()),
('app.refinance.step1.balance_label', 'text', 'form_field', 'refinance_step1', 'label', 'Remaining Mortgage Balance', true, 'app.refinance.step1.balance_label', NOW()),
('app.refinance.step1.property_value_label', 'text', 'form_field', 'refinance_step1', 'label', 'Current Property Value', true, 'app.refinance.step1.property_value_label', NOW()),
('app.refinance.step1.property_type_label', 'text', 'form_field', 'refinance_step1', 'label', 'Property Type', true, 'app.refinance.step1.property_type_label', NOW()),
('app.refinance.step1.current_bank_label', 'text', 'form_field', 'refinance_step1', 'label', 'Current Mortgage Bank', true, 'app.refinance.step1.current_bank_label', NOW()),
('app.refinance.step1.registered_label', 'text', 'form_field', 'refinance_step1', 'label', 'Is the Mortgage Registered in Land Registry?', true, 'app.refinance.step1.registered_label', NOW()),
('app.refinance.step1.start_date_label', 'text', 'form_field', 'refinance_step1', 'label', 'Mortgage Start Date', true, 'app.refinance.step1.start_date_label', NOW());

-- Add translations for form labels and titles
INSERT INTO content_translations (
    content_item_id,
    language_code,
    content_value,
    is_default,
    status,
    created_at
) VALUES
-- English translations
((SELECT id FROM content_items WHERE content_key = 'app.refinance.step1.title' AND screen_location = 'refinance_step1'), 'en', 'Mortgage Refinancing', true, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'app.refinance.step1.why_label' AND screen_location = 'refinance_step1'), 'en', 'Purpose of Mortgage Refinance', true, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'app.refinance.step1.balance_label' AND screen_location = 'refinance_step1'), 'en', 'Remaining Mortgage Balance', true, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'app.refinance.step1.property_value_label' AND screen_location = 'refinance_step1'), 'en', 'Current Property Value', true, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'app.refinance.step1.property_type_label' AND screen_location = 'refinance_step1'), 'en', 'Property Type', true, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'app.refinance.step1.current_bank_label' AND screen_location = 'refinance_step1'), 'en', 'Current Mortgage Bank', true, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'app.refinance.step1.registered_label' AND screen_location = 'refinance_step1'), 'en', 'Is the Mortgage Registered in Land Registry?', true, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'app.refinance.step1.start_date_label' AND screen_location = 'refinance_step1'), 'en', 'Mortgage Start Date', true, 'approved', NOW()),

-- Hebrew translations
((SELECT id FROM content_items WHERE content_key = 'app.refinance.step1.title' AND screen_location = 'refinance_step1'), 'he', 'מחזור משכנתא', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'app.refinance.step1.why_label' AND screen_location = 'refinance_step1'), 'he', 'מטרת מחזור המשכנתא', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'app.refinance.step1.balance_label' AND screen_location = 'refinance_step1'), 'he', 'יתרת המשכנתא הנוכחית', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'app.refinance.step1.property_value_label' AND screen_location = 'refinance_step1'), 'he', 'שווי הנכס הנוכחי', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'app.refinance.step1.property_type_label' AND screen_location = 'refinance_step1'), 'he', 'סוג הנכס', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'app.refinance.step1.current_bank_label' AND screen_location = 'refinance_step1'), 'he', 'בנק המשכנתא הנוכחי', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'app.refinance.step1.registered_label' AND screen_location = 'refinance_step1'), 'he', 'האם המשכנתא רשומה בטאבו?', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'app.refinance.step1.start_date_label' AND screen_location = 'refinance_step1'), 'he', 'תאריך תחילת המשכנתא', false, 'approved', NOW()),

-- Russian translations
((SELECT id FROM content_items WHERE content_key = 'app.refinance.step1.title' AND screen_location = 'refinance_step1'), 'ru', 'Рефинансирование ипотеки', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'app.refinance.step1.why_label' AND screen_location = 'refinance_step1'), 'ru', 'Цель рефинансирования ипотеки', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'app.refinance.step1.balance_label' AND screen_location = 'refinance_step1'), 'ru', 'Остаток по ипотеке', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'app.refinance.step1.property_value_label' AND screen_location = 'refinance_step1'), 'ru', 'Текущая стоимость недвижимости', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'app.refinance.step1.property_type_label' AND screen_location = 'refinance_step1'), 'ru', 'Тип недвижимости', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'app.refinance.step1.current_bank_label' AND screen_location = 'refinance_step1'), 'ru', 'Текущий банк ипотеки', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'app.refinance.step1.registered_label' AND screen_location = 'refinance_step1'), 'ru', 'Зарегистрирована ли ипотека в земельном кадастре?', false, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'app.refinance.step1.start_date_label' AND screen_location = 'refinance_step1'), 'ru', 'Дата начала ипотеки', false, 'approved', NOW());

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
LEFT JOIN content_translations ct_he ON ci.id = ct_he.content_item_id AND ct_he.language_code = 'he' AND ct_he.status = 'approved'
LEFT JOIN content_translations ct_ru ON ci.id = ct_ru.content_item_id AND ct_ru.language_code = 'ru' AND ct_ru.status = 'approved'
LEFT JOIN content_translations ct_en ON ci.id = ct_en.content_item_id AND ct_en.language_code = 'en' AND ct_en.status = 'approved'
WHERE ci.screen_location = 'refinance_step1' 
    AND ci.content_key LIKE 'app.refinance.step1.%'
ORDER BY ci.content_key; 
-- Migration: Fix Refinance Mortgage Options (Correct API Expectations)
-- Date: 2025-01-22
-- Purpose: Fix screen location, naming patterns, component types, and add missing options
-- Following the exact API expectations

-- =====================================================
-- STEP 1: DELETE INCORRECT CONTENT FROM WRONG SCREEN LOCATION
-- =====================================================

-- Delete content from wrong screen location (refinance_mortgage_2)
DELETE FROM content_translations 
WHERE content_item_id IN (
    SELECT id FROM content_items 
    WHERE screen_location = 'refinance_mortgage_2' 
    AND content_key LIKE 'mortgage_refinance_bank_%'
);

DELETE FROM content_items 
WHERE screen_location = 'refinance_mortgage_2' 
AND content_key LIKE 'mortgage_refinance_bank_%';

-- =====================================================
-- STEP 2: ADD CORRECT BANK OPTIONS TO RIGHT SCREEN LOCATION
-- =====================================================

-- Add content items for bank options (correct API pattern)
INSERT INTO content_items (
    content_key, 
    component_type, 
    category, 
    screen_location, 
    status,
    is_active, 
    created_at
) VALUES
-- Bank options (correct API pattern with _option_ suffix)
('mortgage_refinance_bank_option_1', 'option', 'bank_options', 'refinance_mortgage_1', 'active', true, NOW()),
('mortgage_refinance_bank_option_2', 'option', 'bank_options', 'refinance_mortgage_1', 'active', true, NOW()),
('mortgage_refinance_bank_option_3', 'option', 'bank_options', 'refinance_mortgage_1', 'active', true, NOW()),
('mortgage_refinance_bank_option_4', 'option', 'bank_options', 'refinance_mortgage_1', 'active', true, NOW()),
('mortgage_refinance_bank_option_5', 'option', 'bank_options', 'refinance_mortgage_1', 'active', true, NOW()),
('mortgage_refinance_bank_option_6', 'option', 'bank_options', 'refinance_mortgage_1', 'active', true, NOW()),
('mortgage_refinance_bank_option_7', 'option', 'bank_options', 'refinance_mortgage_1', 'active', true, NOW()),
('mortgage_refinance_bank_option_8', 'option', 'bank_options', 'refinance_mortgage_1', 'active', true, NOW());

-- Add translations for bank options
INSERT INTO content_translations (
    content_item_id,
    language_code,
    content_value,
    status,
    created_at
) VALUES
-- English translations
((SELECT id FROM content_items WHERE content_key = 'mortgage_refinance_bank_option_1' AND screen_location = 'refinance_mortgage_1'), 'en', 'Bank Hapoalim', 'active', NOW()),
((SELECT id FROM content_items WHERE content_key = 'mortgage_refinance_bank_option_2' AND screen_location = 'refinance_mortgage_1'), 'en', 'Bank Leumi', 'active', NOW()),
((SELECT id FROM content_items WHERE content_key = 'mortgage_refinance_bank_option_3' AND screen_location = 'refinance_mortgage_1'), 'en', 'Discount Bank', 'active', NOW()),
((SELECT id FROM content_items WHERE content_key = 'mortgage_refinance_bank_option_4' AND screen_location = 'refinance_mortgage_1'), 'en', 'Massad Bank', 'active', NOW()),
((SELECT id FROM content_items WHERE content_key = 'mortgage_refinance_bank_option_5' AND screen_location = 'refinance_mortgage_1'), 'en', 'Israel Bank', 'active', NOW()),
((SELECT id FROM content_items WHERE content_key = 'mortgage_refinance_bank_option_6' AND screen_location = 'refinance_mortgage_1'), 'en', 'Mercantile Bank', 'active', NOW()),
((SELECT id FROM content_items WHERE content_key = 'mortgage_refinance_bank_option_7' AND screen_location = 'refinance_mortgage_1'), 'en', 'Mizrahi Bank', 'active', NOW()),
((SELECT id FROM content_items WHERE content_key = 'mortgage_refinance_bank_option_8' AND screen_location = 'refinance_mortgage_1'), 'en', 'Union Bank', 'active', NOW()),

-- Hebrew translations
((SELECT id FROM content_items WHERE content_key = 'mortgage_refinance_bank_option_1' AND screen_location = 'refinance_mortgage_1'), 'he', 'בנק הפועלים', 'active', NOW()),
((SELECT id FROM content_items WHERE content_key = 'mortgage_refinance_bank_option_2' AND screen_location = 'refinance_mortgage_1'), 'he', 'בנק לאומי', 'active', NOW()),
((SELECT id FROM content_items WHERE content_key = 'mortgage_refinance_bank_option_3' AND screen_location = 'refinance_mortgage_1'), 'he', 'בנק דיסקונט', 'active', NOW()),
((SELECT id FROM content_items WHERE content_key = 'mortgage_refinance_bank_option_4' AND screen_location = 'refinance_mortgage_1'), 'he', 'בנק מסד', 'active', NOW()),
((SELECT id FROM content_items WHERE content_key = 'mortgage_refinance_bank_option_5' AND screen_location = 'refinance_mortgage_1'), 'he', 'בנק ישראל', 'active', NOW()),
((SELECT id FROM content_items WHERE content_key = 'mortgage_refinance_bank_option_6' AND screen_location = 'refinance_mortgage_1'), 'he', 'בנק מרכנתיל', 'active', NOW()),
((SELECT id FROM content_items WHERE content_key = 'mortgage_refinance_bank_option_7' AND screen_location = 'refinance_mortgage_1'), 'he', 'בנק מזרחי', 'active', NOW()),
((SELECT id FROM content_items WHERE content_key = 'mortgage_refinance_bank_option_8' AND screen_location = 'refinance_mortgage_1'), 'he', 'בנק איגוד', 'active', NOW()),

-- Russian translations
((SELECT id FROM content_items WHERE content_key = 'mortgage_refinance_bank_option_1' AND screen_location = 'refinance_mortgage_1'), 'ru', 'Банк Апоалим', 'active', NOW()),
((SELECT id FROM content_items WHERE content_key = 'mortgage_refinance_bank_option_2' AND screen_location = 'refinance_mortgage_1'), 'ru', 'Банк Леуми', 'active', NOW()),
((SELECT id FROM content_items WHERE content_key = 'mortgage_refinance_bank_option_3' AND screen_location = 'refinance_mortgage_1'), 'ru', 'Банк Дисконт', 'active', NOW()),
((SELECT id FROM content_items WHERE content_key = 'mortgage_refinance_bank_option_4' AND screen_location = 'refinance_mortgage_1'), 'ru', 'Банк Масад', 'active', NOW()),
((SELECT id FROM content_items WHERE content_key = 'mortgage_refinance_bank_option_5' AND screen_location = 'refinance_mortgage_1'), 'ru', 'Банк Израиль', 'active', NOW()),
((SELECT id FROM content_items WHERE content_key = 'mortgage_refinance_bank_option_6' AND screen_location = 'refinance_mortgage_1'), 'ru', 'Банк Меркантайл', 'active', NOW()),
((SELECT id FROM content_items WHERE content_key = 'mortgage_refinance_bank_option_7' AND screen_location = 'refinance_mortgage_1'), 'ru', 'Банк Мизрахи', 'active', NOW()),
((SELECT id FROM content_items WHERE content_key = 'mortgage_refinance_bank_option_8' AND screen_location = 'refinance_mortgage_1'), 'ru', 'Банк Юнион', 'active', NOW());

-- =====================================================
-- STEP 3: ADD PROPERTY TYPE OPTIONS (CORRECT API PATTERN)
-- =====================================================

-- Add content items for property type options (correct API pattern)
INSERT INTO content_items (
    content_key, 
    component_type, 
    category, 
    screen_location, 
    status,
    is_active, 
    created_at
) VALUES
-- Property type options (correct API pattern with _option_ suffix)
('mortgage_refinance_type_option_1', 'option', 'property_type', 'refinance_mortgage_1', 'active', true, NOW()),
('mortgage_refinance_type_option_2', 'option', 'property_type', 'refinance_mortgage_1', 'active', true, NOW()),
('mortgage_refinance_type_option_3', 'option', 'property_type', 'refinance_mortgage_1', 'active', true, NOW()),
('mortgage_refinance_type_option_4', 'option', 'property_type', 'refinance_mortgage_1', 'active', true, NOW()),
('mortgage_refinance_type_option_5', 'option', 'property_type', 'refinance_mortgage_1', 'active', true, NOW());

-- Add translations for property type options
INSERT INTO content_translations (
    content_item_id,
    language_code,
    content_value,
    status,
    created_at
) VALUES
-- English translations
((SELECT id FROM content_items WHERE content_key = 'mortgage_refinance_type_option_1' AND screen_location = 'refinance_mortgage_1'), 'en', 'Apartment', 'active', NOW()),
((SELECT id FROM content_items WHERE content_key = 'mortgage_refinance_type_option_2' AND screen_location = 'refinance_mortgage_1'), 'en', 'Private House', 'active', NOW()),
((SELECT id FROM content_items WHERE content_key = 'mortgage_refinance_type_option_3' AND screen_location = 'refinance_mortgage_1'), 'en', 'Commercial Property', 'active', NOW()),
((SELECT id FROM content_items WHERE content_key = 'mortgage_refinance_type_option_4' AND screen_location = 'refinance_mortgage_1'), 'en', 'Land', 'active', NOW()),
((SELECT id FROM content_items WHERE content_key = 'mortgage_refinance_type_option_5' AND screen_location = 'refinance_mortgage_1'), 'en', 'Other', 'active', NOW()),

-- Hebrew translations
((SELECT id FROM content_items WHERE content_key = 'mortgage_refinance_type_option_1' AND screen_location = 'refinance_mortgage_1'), 'he', 'דירה', 'active', NOW()),
((SELECT id FROM content_items WHERE content_key = 'mortgage_refinance_type_option_2' AND screen_location = 'refinance_mortgage_1'), 'he', 'בית פרטי', 'active', NOW()),
((SELECT id FROM content_items WHERE content_key = 'mortgage_refinance_type_option_3' AND screen_location = 'refinance_mortgage_1'), 'he', 'נכס מסחרי', 'active', NOW()),
((SELECT id FROM content_items WHERE content_key = 'mortgage_refinance_type_option_4' AND screen_location = 'refinance_mortgage_1'), 'he', 'קרקע', 'active', NOW()),
((SELECT id FROM content_items WHERE content_key = 'mortgage_refinance_type_option_5' AND screen_location = 'refinance_mortgage_1'), 'he', 'אחר', 'active', NOW()),

-- Russian translations
((SELECT id FROM content_items WHERE content_key = 'mortgage_refinance_type_option_1' AND screen_location = 'refinance_mortgage_1'), 'ru', 'Квартира', 'active', NOW()),
((SELECT id FROM content_items WHERE content_key = 'mortgage_refinance_type_option_2' AND screen_location = 'refinance_mortgage_1'), 'ru', 'Частный дом', 'active', NOW()),
((SELECT id FROM content_items WHERE content_key = 'mortgage_refinance_type_option_3' AND screen_location = 'refinance_mortgage_1'), 'ru', 'Коммерческая недвижимость', 'active', NOW()),
((SELECT id FROM content_items WHERE content_key = 'mortgage_refinance_type_option_4' AND screen_location = 'refinance_mortgage_1'), 'ru', 'Земельный участок', 'active', NOW()),
((SELECT id FROM content_items WHERE content_key = 'mortgage_refinance_type_option_5' AND screen_location = 'refinance_mortgage_1'), 'ru', 'Другое', 'active', NOW());

-- =====================================================
-- STEP 4: ADD REGISTRATION STATUS OPTIONS (CORRECT API PATTERN)
-- =====================================================

-- Add content items for registration status options (correct API pattern)
INSERT INTO content_items (
    content_key, 
    component_type, 
    category, 
    screen_location, 
    status,
    is_active, 
    created_at
) VALUES
-- Registration status options (correct API pattern with _option_ suffix)
('mortgage_refinance_registered_option_1', 'option', 'registration_status', 'refinance_mortgage_1', 'active', true, NOW()),
('mortgage_refinance_registered_option_2', 'option', 'registration_status', 'refinance_mortgage_1', 'active', true, NOW());

-- Add translations for registration status options
INSERT INTO content_translations (
    content_item_id,
    language_code,
    content_value,
    status,
    created_at
) VALUES
-- English translations
((SELECT id FROM content_items WHERE content_key = 'mortgage_refinance_registered_option_1' AND screen_location = 'refinance_mortgage_1'), 'en', 'Yes, Registered in Land Registry', 'active', NOW()),
((SELECT id FROM content_items WHERE content_key = 'mortgage_refinance_registered_option_2' AND screen_location = 'refinance_mortgage_1'), 'en', 'No, Not Registered', 'active', NOW()),

-- Hebrew translations
((SELECT id FROM content_items WHERE content_key = 'mortgage_refinance_registered_option_1' AND screen_location = 'refinance_mortgage_1'), 'he', 'כן, רשומה בטאבו', 'active', NOW()),
((SELECT id FROM content_items WHERE content_key = 'mortgage_refinance_registered_option_2' AND screen_location = 'refinance_mortgage_1'), 'he', 'לא, לא רשומה', 'active', NOW()),

-- Russian translations
((SELECT id FROM content_items WHERE content_key = 'mortgage_refinance_registered_option_1' AND screen_location = 'refinance_mortgage_1'), 'ru', 'Да, зарегистрирована в земельном кадастре', 'active', NOW()),
((SELECT id FROM content_items WHERE content_key = 'mortgage_refinance_registered_option_2' AND screen_location = 'refinance_mortgage_1'), 'ru', 'Нет, не зарегистрирована', 'active', NOW());

-- =====================================================
-- VERIFICATION QUERY
-- =====================================================

-- Verify the migration was successful
SELECT 
    'BANK OPTIONS' as category,
    ci.content_key,
    ci.component_type,
    ci.screen_location,
    ct_en.content_value as title_en
FROM content_items ci
LEFT JOIN content_translations ct_en ON ci.id = ct_en.content_item_id AND ct_en.language_code = 'en' AND ct_en.status = 'active'
WHERE ci.screen_location = 'refinance_mortgage_1' 
    AND ci.content_key LIKE 'mortgage_refinance_bank_option_%'
    AND ci.is_active = true
ORDER BY ci.content_key; 
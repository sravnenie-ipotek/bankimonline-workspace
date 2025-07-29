-- Migration: Add Missing Refinance Mortgage Options (Other App Expected Keys)
-- Date: 2025-01-22
-- Purpose: Add missing dropdown options for refinance mortgage that the other app expects
-- Following the exact keys from translation files

-- =====================================================
-- REFINANCE MORTGAGE - BANK OPTIONS (Other App Expected)
-- =====================================================

-- Add content items for bank options (exact keys from translation files)
INSERT INTO content_items (
    content_key, 
    component_type, 
    category, 
    screen_location, 
    status,
    is_active, 
    created_at
) VALUES
-- Bank options (exact keys from translation files)
('mortgage_refinance_bank_hapoalim', 'option', 'bank_options', 'refinance_step1', 'active', true, NOW()),
('mortgage_refinance_bank_leumi', 'option', 'bank_options', 'refinance_step1', 'active', true, NOW()),
('mortgage_refinance_bank_discount', 'option', 'bank_options', 'refinance_step1', 'active', true, NOW()),
('mortgage_refinance_bank_massad', 'option', 'bank_options', 'refinance_step1', 'active', true, NOW()),
('mortgage_refinance_bank_israel', 'option', 'bank_options', 'refinance_step1', 'active', true, NOW()),
('mortgage_refinance_bank_mercantile', 'option', 'bank_options', 'refinance_step1', 'active', true, NOW()),
('mortgage_refinance_bank_mizrahi', 'option', 'bank_options', 'refinance_step1', 'active', true, NOW()),
('mortgage_refinance_bank_union', 'option', 'bank_options', 'refinance_step1', 'active', true, NOW());

-- Add translations for bank options
INSERT INTO content_translations (
    content_item_id,
    language_code,
    content_value,
    status,
    created_at
) VALUES
-- English translations
((SELECT id FROM content_items WHERE content_key = 'mortgage_refinance_bank_hapoalim' AND screen_location = 'refinance_step1'), 'en', 'Bank Hapoalim', 'active', NOW()),
((SELECT id FROM content_items WHERE content_key = 'mortgage_refinance_bank_leumi' AND screen_location = 'refinance_step1'), 'en', 'Bank Leumi', 'active', NOW()),
((SELECT id FROM content_items WHERE content_key = 'mortgage_refinance_bank_discount' AND screen_location = 'refinance_step1'), 'en', 'Discount Bank', 'active', NOW()),
((SELECT id FROM content_items WHERE content_key = 'mortgage_refinance_bank_massad' AND screen_location = 'refinance_step1'), 'en', 'Massad Bank', 'active', NOW()),
((SELECT id FROM content_items WHERE content_key = 'mortgage_refinance_bank_israel' AND screen_location = 'refinance_step1'), 'en', 'Israel Bank', 'active', NOW()),
((SELECT id FROM content_items WHERE content_key = 'mortgage_refinance_bank_mercantile' AND screen_location = 'refinance_step1'), 'en', 'Mercantile Bank', 'active', NOW()),
((SELECT id FROM content_items WHERE content_key = 'mortgage_refinance_bank_mizrahi' AND screen_location = 'refinance_step1'), 'en', 'Mizrahi Bank', 'active', NOW()),
((SELECT id FROM content_items WHERE content_key = 'mortgage_refinance_bank_union' AND screen_location = 'refinance_step1'), 'en', 'Union Bank', 'active', NOW()),

-- Hebrew translations
((SELECT id FROM content_items WHERE content_key = 'mortgage_refinance_bank_hapoalim' AND screen_location = 'refinance_step1'), 'he', 'בנק הפועלים', 'active', NOW()),
((SELECT id FROM content_items WHERE content_key = 'mortgage_refinance_bank_leumi' AND screen_location = 'refinance_step1'), 'he', 'בנק לאומי', 'active', NOW()),
((SELECT id FROM content_items WHERE content_key = 'mortgage_refinance_bank_discount' AND screen_location = 'refinance_step1'), 'he', 'בנק דיסקונט', 'active', NOW()),
((SELECT id FROM content_items WHERE content_key = 'mortgage_refinance_bank_massad' AND screen_location = 'refinance_step1'), 'he', 'בנק מסד', 'active', NOW()),
((SELECT id FROM content_items WHERE content_key = 'mortgage_refinance_bank_israel' AND screen_location = 'refinance_step1'), 'he', 'בנק ישראל', 'active', NOW()),
((SELECT id FROM content_items WHERE content_key = 'mortgage_refinance_bank_mercantile' AND screen_location = 'refinance_step1'), 'he', 'בנק מרכנתיל', 'active', NOW()),
((SELECT id FROM content_items WHERE content_key = 'mortgage_refinance_bank_mizrahi' AND screen_location = 'refinance_step1'), 'he', 'בנק מזרחי', 'active', NOW()),
((SELECT id FROM content_items WHERE content_key = 'mortgage_refinance_bank_union' AND screen_location = 'refinance_step1'), 'he', 'בנק איגוד', 'active', NOW()),

-- Russian translations
((SELECT id FROM content_items WHERE content_key = 'mortgage_refinance_bank_hapoalim' AND screen_location = 'refinance_step1'), 'ru', 'Банк Апоалим', 'active', NOW()),
((SELECT id FROM content_items WHERE content_key = 'mortgage_refinance_bank_leumi' AND screen_location = 'refinance_step1'), 'ru', 'Банк Леуми', 'active', NOW()),
((SELECT id FROM content_items WHERE content_key = 'mortgage_refinance_bank_discount' AND screen_location = 'refinance_step1'), 'ru', 'Банк Дисконт', 'active', NOW()),
((SELECT id FROM content_items WHERE content_key = 'mortgage_refinance_bank_massad' AND screen_location = 'refinance_step1'), 'ru', 'Банк Масад', 'active', NOW()),
((SELECT id FROM content_items WHERE content_key = 'mortgage_refinance_bank_israel' AND screen_location = 'refinance_step1'), 'ru', 'Банк Израиль', 'active', NOW()),
((SELECT id FROM content_items WHERE content_key = 'mortgage_refinance_bank_mercantile' AND screen_location = 'refinance_step1'), 'ru', 'Банк Меркантайл', 'active', NOW()),
((SELECT id FROM content_items WHERE content_key = 'mortgage_refinance_bank_mizrahi' AND screen_location = 'refinance_step1'), 'ru', 'Банк Мизрахи', 'active', NOW()),
((SELECT id FROM content_items WHERE content_key = 'mortgage_refinance_bank_union' AND screen_location = 'refinance_step1'), 'ru', 'Банк Юнион', 'active', NOW());

-- =====================================================
-- REFINANCE MORTGAGE - PROPERTY TYPE OPTIONS (Other App Expected)
-- =====================================================

-- Add content items for property type options (exact keys from translation files)
INSERT INTO content_items (
    content_key, 
    component_type, 
    category, 
    screen_location, 
    status,
    is_active, 
    created_at
) VALUES
-- Property type options (exact keys from translation files)
('mortgage_refinance_type_apartment', 'option', 'property_type', 'refinance_step1', 'active', true, NOW()),
('mortgage_refinance_type_house', 'option', 'property_type', 'refinance_step1', 'active', true, NOW()),
('mortgage_refinance_type_commercial', 'option', 'property_type', 'refinance_step1', 'active', true, NOW()),
('mortgage_refinance_type_land', 'option', 'property_type', 'refinance_step1', 'active', true, NOW()),
('mortgage_refinance_type_other', 'option', 'property_type', 'refinance_step1', 'active', true, NOW());

-- Add translations for property type options
INSERT INTO content_translations (
    content_item_id,
    language_code,
    content_value,
    status,
    created_at
) VALUES
-- English translations
((SELECT id FROM content_items WHERE content_key = 'mortgage_refinance_type_apartment' AND screen_location = 'refinance_step1'), 'en', 'Apartment', 'active', NOW()),
((SELECT id FROM content_items WHERE content_key = 'mortgage_refinance_type_house' AND screen_location = 'refinance_step1'), 'en', 'Private House', 'active', NOW()),
((SELECT id FROM content_items WHERE content_key = 'mortgage_refinance_type_commercial' AND screen_location = 'refinance_step1'), 'en', 'Commercial Property', 'active', NOW()),
((SELECT id FROM content_items WHERE content_key = 'mortgage_refinance_type_land' AND screen_location = 'refinance_step1'), 'en', 'Land', 'active', NOW()),
((SELECT id FROM content_items WHERE content_key = 'mortgage_refinance_type_other' AND screen_location = 'refinance_step1'), 'en', 'Other', 'active', NOW()),

-- Hebrew translations
((SELECT id FROM content_items WHERE content_key = 'mortgage_refinance_type_apartment' AND screen_location = 'refinance_step1'), 'he', 'דירה', 'active', NOW()),
((SELECT id FROM content_items WHERE content_key = 'mortgage_refinance_type_house' AND screen_location = 'refinance_step1'), 'he', 'בית פרטי', 'active', NOW()),
((SELECT id FROM content_items WHERE content_key = 'mortgage_refinance_type_commercial' AND screen_location = 'refinance_step1'), 'he', 'נכס מסחרי', 'active', NOW()),
((SELECT id FROM content_items WHERE content_key = 'mortgage_refinance_type_land' AND screen_location = 'refinance_step1'), 'he', 'קרקע', 'active', NOW()),
((SELECT id FROM content_items WHERE content_key = 'mortgage_refinance_type_other' AND screen_location = 'refinance_step1'), 'he', 'אחר', 'active', NOW()),

-- Russian translations
((SELECT id FROM content_items WHERE content_key = 'mortgage_refinance_type_apartment' AND screen_location = 'refinance_step1'), 'ru', 'Квартира', 'active', NOW()),
((SELECT id FROM content_items WHERE content_key = 'mortgage_refinance_type_house' AND screen_location = 'refinance_step1'), 'ru', 'Частный дом', 'active', NOW()),
((SELECT id FROM content_items WHERE content_key = 'mortgage_refinance_type_commercial' AND screen_location = 'refinance_step1'), 'ru', 'Коммерческая недвижимость', 'active', NOW()),
((SELECT id FROM content_items WHERE content_key = 'mortgage_refinance_type_land' AND screen_location = 'refinance_step1'), 'ru', 'Земельный участок', 'active', NOW()),
((SELECT id FROM content_items WHERE content_key = 'mortgage_refinance_type_other' AND screen_location = 'refinance_step1'), 'ru', 'Другое', 'active', NOW());

-- =====================================================
-- VERIFICATION QUERY
-- =====================================================

-- Verify the migration was successful
SELECT 
    'BANK OPTIONS' as category,
    ci.content_key,
    ci.component_type,
    ci.screen_location,
    ct_en.content_value as title_en,
    ct_he.content_value as title_he,
    ct_ru.content_value as title_ru
FROM content_items ci
LEFT JOIN content_translations ct_en ON ci.id = ct_en.content_item_id AND ct_en.language_code = 'en' AND ct_en.status = 'active'
LEFT JOIN content_translations ct_he ON ci.id = ct_he.content_item_id AND ct_he.language_code = 'he' AND ct_he.status = 'active'
LEFT JOIN content_translations ct_ru ON ci.id = ct_ru.content_item_id AND ct_ru.language_code = 'ru' AND ct_ru.status = 'active'
WHERE ci.screen_location = 'refinance_step1' 
    AND ci.content_key LIKE 'mortgage_refinance_bank_%'
    AND ci.is_active = true
ORDER BY ci.content_key

UNION ALL

SELECT 
    'PROPERTY TYPE OPTIONS' as category,
    ci.content_key,
    ci.component_type,
    ci.screen_location,
    ct_en.content_value as title_en,
    ct_he.content_value as title_he,
    ct_ru.content_value as title_ru
FROM content_items ci
LEFT JOIN content_translations ct_en ON ci.id = ct_en.content_item_id AND ct_en.language_code = 'en' AND ct_en.status = 'active'
LEFT JOIN content_translations ct_he ON ci.id = ct_he.content_item_id AND ct_he.language_code = 'he' AND ct_he.status = 'active'
LEFT JOIN content_translations ct_ru ON ci.id = ct_ru.content_item_id AND ct_ru.language_code = 'ru' AND ct_ru.status = 'active'
WHERE ci.screen_location = 'refinance_step1' 
    AND ci.content_key LIKE 'mortgage_refinance_type_%'
    AND ci.is_active = true
ORDER BY ci.content_key; 
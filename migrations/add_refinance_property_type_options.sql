-- Migration: Add Property Type Options for Refinance Mortgage
-- Date: 2025-01-22
-- Purpose: Add missing property type dropdown options for refinance mortgage step 1

-- =====================================================
-- REFINANCE MORTGAGE STEP 1 - PROPERTY TYPE OPTIONS
-- =====================================================

-- Add content items for property type dropdown options
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
-- Property type options
('app.refinance.step1.property_option_1', 'text', 'property_type', 'refinance_step1', 'option', 'Apartment', true, 'app.refinance.step1.property_option_1', NOW()),
('app.refinance.step1.property_option_2', 'text', 'property_type', 'refinance_step1', 'option', 'Private House', true, 'app.refinance.step1.property_option_2', NOW()),
('app.refinance.step1.property_option_3', 'text', 'property_type', 'refinance_step1', 'option', 'Commercial Property', true, 'app.refinance.step1.property_option_3', NOW()),
('app.refinance.step1.property_option_4', 'text', 'property_type', 'refinance_step1', 'option', 'Land', true, 'app.refinance.step1.property_option_4', NOW());

-- Add translations for property type options
INSERT INTO content_translations (
    content_item_id,
    language_code,
    content_value,
    is_default,
    status,
    created_at
) VALUES
-- English translations
((SELECT id FROM content_items WHERE content_key = 'app.refinance.step1.property_option_1' AND screen_location = 'refinance_step1'), 'en', 'Apartment', true, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'app.refinance.step1.property_option_2' AND screen_location = 'refinance_step1'), 'en', 'Private House', true, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'app.refinance.step1.property_option_3' AND screen_location = 'refinance_step1'), 'en', 'Commercial Property', true, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'app.refinance.step1.property_option_4' AND screen_location = 'refinance_step1'), 'en', 'Land', true, 'approved', NOW()),

-- Hebrew translations
((SELECT id FROM content_items WHERE content_key = 'app.refinance.step1.property_option_1' AND screen_location = 'refinance_step1'), 'he', 'דירה', true, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'app.refinance.step1.property_option_2' AND screen_location = 'refinance_step1'), 'he', 'בית פרטי', true, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'app.refinance.step1.property_option_3' AND screen_location = 'refinance_step1'), 'he', 'נכס מסחרי', true, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'app.refinance.step1.property_option_4' AND screen_location = 'refinance_step1'), 'he', 'קרקע', true, 'approved', NOW()),

-- Russian translations
((SELECT id FROM content_items WHERE content_key = 'app.refinance.step1.property_option_1' AND screen_location = 'refinance_step1'), 'ru', 'Квартира', true, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'app.refinance.step1.property_option_2' AND screen_location = 'refinance_step1'), 'ru', 'Частный дом', true, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'app.refinance.step1.property_option_3' AND screen_location = 'refinance_step1'), 'ru', 'Коммерческая недвижимость', true, 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'app.refinance.step1.property_option_4' AND screen_location = 'refinance_step1'), 'ru', 'Земельный участок', true, 'approved', NOW());

-- Verify the migration
SELECT 
    ci.content_key,
    ci.component_type,
    ci.screen_location,
    ct_he.content_value as title_he,
    ct_ru.content_value as title_ru,
    ct_en.content_value as title_en
FROM content_items ci
LEFT JOIN content_translations ct_he ON ci.id = ct_he.content_item_id AND ct_he.language_code = 'he' AND ct_he.status = 'approved'
LEFT JOIN content_translations ct_ru ON ci.id = ct_ru.content_item_id AND ct_ru.language_code = 'ru' AND ct_ru.status = 'approved'
LEFT JOIN content_translations ct_en ON ci.id = ct_en.content_item_id AND ct_en.language_code = 'en' AND ct_en.status = 'approved'
WHERE ci.screen_location = 'refinance_step1' 
    AND ci.content_key LIKE 'app.refinance.step1.property_option_%'
ORDER BY ci.content_key; 
-- Migration: Add Bank Offers Modal Content
-- Purpose: Add translations for bank offers modal (condition/description tabs, mortgage program types)
-- Date: 2025-07-27

BEGIN;

-- First check if screen_location 'bank_offers' exists, if not create it
DO $$
BEGIN
    -- Add general modal tab translations
    INSERT INTO content_items (content_key, component_type, category, screen_location, legacy_translation_key, is_active)
    VALUES 
        ('condition', 'field_label', 'modal_tabs', 'bank_offers', 'condition', true),
        ('description', 'field_label', 'modal_tabs', 'bank_offers', 'description', true),
        ('up_to_33_percent', 'text', 'mortgage_conditions', 'bank_offers', 'up_to_33_percent', true),
        ('4_to_30_years', 'text', 'mortgage_conditions', 'bank_offers', '4_to_30_years', true),
        ('prime_rate_structure', 'text', 'mortgage_conditions', 'bank_offers', 'prime_rate_structure', true),
        -- Additional fallback content
        ('up_to_70_percent', 'text', 'mortgage_conditions', 'bank_offers', NULL, true),
        ('up_to_75_percent', 'text', 'mortgage_conditions', 'bank_offers', NULL, true),
        ('5_to_30_years', 'text', 'mortgage_conditions', 'bank_offers', NULL, true),
        ('4_to_25_years', 'text', 'mortgage_conditions', 'bank_offers', NULL, true),
        ('fixed_rate_structure', 'text', 'mortgage_conditions', 'bank_offers', NULL, true),
        ('variable_rate_structure', 'text', 'mortgage_conditions', 'bank_offers', NULL, true),
        ('prime_description', 'text', 'program_descriptions', 'bank_offers', NULL, true),
        ('fixed_inflation_description', 'text', 'program_descriptions', 'bank_offers', NULL, true),
        ('variable_inflation_description', 'text', 'program_descriptions', 'bank_offers', NULL, true)
    ON CONFLICT (content_key, screen_location) DO NOTHING;

    -- Add translations for all three languages
    -- English translations
    INSERT INTO content_translations (content_item_id, language_code, content_value, status)
    SELECT ci.id, 'en', 
        CASE ci.content_key
            WHEN 'condition' THEN 'condition'
            WHEN 'description' THEN 'description'
            WHEN 'up_to_33_percent' THEN 'Up to 33%'
            WHEN '4_to_30_years' THEN '4-30 years'
            WHEN 'prime_rate_structure' THEN 'Variable + Fixed'
            WHEN 'up_to_70_percent' THEN 'Up to 70%'
            WHEN 'up_to_75_percent' THEN 'Up to 75%'
            WHEN '5_to_30_years' THEN '5-30 years'
            WHEN '4_to_25_years' THEN '4-25 years'
            WHEN 'fixed_rate_structure' THEN 'Fixed rate'
            WHEN 'variable_rate_structure' THEN 'Variable rate'
            WHEN 'prime_description' THEN 'Prime rate linked program'
            WHEN 'fixed_inflation_description' THEN 'Fixed rate with inflation adjustment'
            WHEN 'variable_inflation_description' THEN 'Variable rate with inflation adjustment'
        END,
        'approved'
    FROM content_items ci
    WHERE ci.screen_location = 'bank_offers'
    AND NOT EXISTS (
        SELECT 1 FROM content_translations ct 
        WHERE ct.content_item_id = ci.id AND ct.language_code = 'en'
    );

    -- Hebrew translations
    INSERT INTO content_translations (content_item_id, language_code, content_value, status)
    SELECT ci.id, 'he', 
        CASE ci.content_key
            WHEN 'condition' THEN 'תנאים'
            WHEN 'description' THEN 'תיאור'
            WHEN 'up_to_33_percent' THEN 'עד 33% מהכנסה'
            WHEN '4_to_30_years' THEN '4-30 שנים'
            WHEN 'prime_rate_structure' THEN 'ריבית משתנה + קבועה'
            WHEN 'up_to_70_percent' THEN 'עד 70%'
            WHEN 'up_to_75_percent' THEN 'עד 75%'
            WHEN '5_to_30_years' THEN '5-30 שנים'
            WHEN '4_to_25_years' THEN '4-25 שנים'
            WHEN 'fixed_rate_structure' THEN 'ריבית קבועה'
            WHEN 'variable_rate_structure' THEN 'ריבית משתנה'
            WHEN 'prime_description' THEN 'תוכנית צמודת פריים'
            WHEN 'fixed_inflation_description' THEN 'ריבית קבועה עם התאמת אינפלציה'
            WHEN 'variable_inflation_description' THEN 'ריבית משתנה עם התאמת אינפלציה'
        END,
        'approved'
    FROM content_items ci
    WHERE ci.screen_location = 'bank_offers'
    AND NOT EXISTS (
        SELECT 1 FROM content_translations ct 
        WHERE ct.content_item_id = ci.id AND ct.language_code = 'he'
    );

    -- Russian translations
    INSERT INTO content_translations (content_item_id, language_code, content_value, status)
    SELECT ci.id, 'ru', 
        CASE ci.content_key
            WHEN 'condition' THEN 'условия'
            WHEN 'description' THEN 'описание'
            WHEN 'up_to_33_percent' THEN 'До 33% от дохода'
            WHEN '4_to_30_years' THEN '4-30 лет'
            WHEN 'prime_rate_structure' THEN 'Переменная + фиксированная ставка'
            WHEN 'up_to_70_percent' THEN 'До 70%'
            WHEN 'up_to_75_percent' THEN 'До 75%'
            WHEN '5_to_30_years' THEN '5-30 лет'
            WHEN '4_to_25_years' THEN '4-25 лет'
            WHEN 'fixed_rate_structure' THEN 'Фиксированная ставка'
            WHEN 'variable_rate_structure' THEN 'Переменная ставка'
            WHEN 'prime_description' THEN 'Программа привязанная к прайм ставке'
            WHEN 'fixed_inflation_description' THEN 'Фиксированная ставка с корректировкой на инфляцию'
            WHEN 'variable_inflation_description' THEN 'Переменная ставка с корректировкой на инфляцию'
        END,
        'approved'
    FROM content_items ci
    WHERE ci.screen_location = 'bank_offers'
    AND NOT EXISTS (
        SELECT 1 FROM content_translations ct 
        WHERE ct.content_item_id = ci.id AND ct.language_code = 'ru'
    );

    -- Update mortgage program type names (these already exist, just update translations)
    -- Update English translations
    UPDATE content_translations ct
    SET content_value = 
        CASE 
            WHEN ci.content_key = 'mortgage_prime_percent' THEN 'Prime Rate Mortgage'
            WHEN ci.content_key = 'mortgage_fix_percent' THEN 'Fixed Rate Mortgage'
            WHEN ci.content_key = 'mortgage_float_percent' THEN 'Variable Rate Mortgage'
        END,
        updated_at = CURRENT_TIMESTAMP
    FROM content_items ci
    WHERE ct.content_item_id = ci.id
    AND ct.language_code = 'en'
    AND ci.content_key IN ('mortgage_prime_percent', 'mortgage_fix_percent', 'mortgage_float_percent');

    -- Update Russian translations
    UPDATE content_translations ct
    SET content_value = 
        CASE 
            WHEN ci.content_key = 'mortgage_prime_percent' THEN 'Ипотека по ставке прайм'
            WHEN ci.content_key = 'mortgage_fix_percent' THEN 'Ипотека с фиксированной ставкой'
            WHEN ci.content_key = 'mortgage_float_percent' THEN 'Ипотека с переменной ставкой'
        END,
        updated_at = CURRENT_TIMESTAMP
    FROM content_items ci
    WHERE ct.content_item_id = ci.id
    AND ct.language_code = 'ru'
    AND ci.content_key IN ('mortgage_prime_percent', 'mortgage_fix_percent', 'mortgage_float_percent');

    -- Log the migration
    INSERT INTO migration_log (migration_name, affected_table, affected_rows, status, notes)
    VALUES ('051_add_bank_offers_modal_content', 'content_items,content_translations', 
            (SELECT COUNT(*) FROM content_items WHERE screen_location = 'bank_offers'), 
            'success', 'Added bank offers modal translations');

END $$;

-- Verify the migration
SELECT 
    ci.content_key,
    ci.screen_location,
    ct_en.content_value as english,
    ct_he.content_value as hebrew,
    ct_ru.content_value as russian
FROM content_items ci
LEFT JOIN content_translations ct_en ON ci.id = ct_en.content_item_id AND ct_en.language_code = 'en'
LEFT JOIN content_translations ct_he ON ci.id = ct_he.content_item_id AND ct_he.language_code = 'he'
LEFT JOIN content_translations ct_ru ON ci.id = ct_ru.content_item_id AND ct_ru.language_code = 'ru'
WHERE ci.screen_location = 'bank_offers'
OR ci.content_key IN ('mortgage_prime_percent', 'mortgage_fix_percent', 'mortgage_float_percent')
ORDER BY ci.content_key;

COMMIT;
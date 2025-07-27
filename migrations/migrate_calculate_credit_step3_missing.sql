-- Migration: Calculate Credit Step 3 - Missing Income Section Content
-- Date: 2024-01-27
-- Description: Add missing content for calculate_credit_3 main screen (not sub-sections)
-- NOTE: Step 3 title already exists in calculate_credit_3_header

-- Check if content already exists before inserting
DO $$
BEGIN
    -- Buttons for calculate_credit_3
    IF NOT EXISTS (SELECT 1 FROM content_items WHERE content_key = 'add_place_to_work' AND screen_location = 'calculate_credit_3') THEN
        INSERT INTO content_items (content_key, component_type, screen_location, category, is_active, legacy_translation_key)
        VALUES ('add_place_to_work', 'button', 'calculate_credit_3', 'income_details', true, 'add_place_to_work');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM content_items WHERE content_key = 'add_additional_source_of_income' AND screen_location = 'calculate_credit_3') THEN
        INSERT INTO content_items (content_key, component_type, screen_location, category, is_active, legacy_translation_key)
        VALUES ('add_additional_source_of_income', 'button', 'calculate_credit_3', 'income_details', true, 'add_additional_source_of_income');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM content_items WHERE content_key = 'add_obligation' AND screen_location = 'calculate_credit_3') THEN
        INSERT INTO content_items (content_key, component_type, screen_location, category, is_active, legacy_translation_key)
        VALUES ('add_obligation', 'button', 'calculate_credit_3', 'income_details', true, 'add_obligation');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM content_items WHERE content_key = 'add_borrower' AND screen_location = 'calculate_credit_3') THEN
        INSERT INTO content_items (content_key, component_type, screen_location, category, is_active, legacy_translation_key)
        VALUES ('add_borrower', 'button', 'calculate_credit_3', 'income_details', true, 'add_borrower');
    END IF;

    -- Labels for calculate_credit_3
    IF NOT EXISTS (SELECT 1 FROM content_items WHERE content_key = 'source_of_income' AND screen_location = 'calculate_credit_3') THEN
        INSERT INTO content_items (content_key, component_type, screen_location, category, is_active, legacy_translation_key)
        VALUES ('source_of_income', 'field_label', 'calculate_credit_3', 'income_details', true, 'main_income_source');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM content_items WHERE content_key = 'additional_source_of_income' AND screen_location = 'calculate_credit_3') THEN
        INSERT INTO content_items (content_key, component_type, screen_location, category, is_active, legacy_translation_key)
        VALUES ('additional_source_of_income', 'field_label', 'calculate_credit_3', 'income_details', true, 'additional_source_of_income');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM content_items WHERE content_key = 'obligation' AND screen_location = 'calculate_credit_3') THEN
        INSERT INTO content_items (content_key, component_type, screen_location, category, is_active, legacy_translation_key)
        VALUES ('obligation', 'field_label', 'calculate_credit_3', 'income_details', true, 'obligation');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM content_items WHERE content_key = 'borrower' AND screen_location = 'calculate_credit_3') THEN
        INSERT INTO content_items (content_key, component_type, screen_location, category, is_active, legacy_translation_key)
        VALUES ('borrower', 'field_label', 'calculate_credit_3', 'income_details', true, 'borrower');
    END IF;
END $$;

-- Insert translations for new content items
-- add_place_to_work
INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'en', 'Add workplace', 'approved' 
FROM content_items 
WHERE content_key = 'add_place_to_work' AND screen_location = 'calculate_credit_3'
AND NOT EXISTS (
    SELECT 1 FROM content_translations ct 
    WHERE ct.content_item_id = content_items.id AND ct.language_code = 'en'
);

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'he', 'הוסף מקום עבודה', 'approved' 
FROM content_items 
WHERE content_key = 'add_place_to_work' AND screen_location = 'calculate_credit_3'
AND NOT EXISTS (
    SELECT 1 FROM content_translations ct 
    WHERE ct.content_item_id = content_items.id AND ct.language_code = 'he'
);

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'ru', 'Добавить место работы', 'approved' 
FROM content_items 
WHERE content_key = 'add_place_to_work' AND screen_location = 'calculate_credit_3'
AND NOT EXISTS (
    SELECT 1 FROM content_translations ct 
    WHERE ct.content_item_id = content_items.id AND ct.language_code = 'ru'
);

-- add_additional_source_of_income
INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'en', 'Add additional income source', 'approved' 
FROM content_items 
WHERE content_key = 'add_additional_source_of_income' AND screen_location = 'calculate_credit_3'
AND NOT EXISTS (
    SELECT 1 FROM content_translations ct 
    WHERE ct.content_item_id = content_items.id AND ct.language_code = 'en'
);

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'he', 'הוסף מקור הכנסה נוסף', 'approved' 
FROM content_items 
WHERE content_key = 'add_additional_source_of_income' AND screen_location = 'calculate_credit_3'
AND NOT EXISTS (
    SELECT 1 FROM content_translations ct 
    WHERE ct.content_item_id = content_items.id AND ct.language_code = 'he'
);

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'ru', 'Добавить дополнительный источник дохода', 'approved' 
FROM content_items 
WHERE content_key = 'add_additional_source_of_income' AND screen_location = 'calculate_credit_3'
AND NOT EXISTS (
    SELECT 1 FROM content_translations ct 
    WHERE ct.content_item_id = content_items.id AND ct.language_code = 'ru'
);

-- add_obligation
INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'en', 'Add obligation', 'approved' 
FROM content_items 
WHERE content_key = 'add_obligation' AND screen_location = 'calculate_credit_3'
AND NOT EXISTS (
    SELECT 1 FROM content_translations ct 
    WHERE ct.content_item_id = content_items.id AND ct.language_code = 'en'
);

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'he', 'הוסף התחייבות', 'approved' 
FROM content_items 
WHERE content_key = 'add_obligation' AND screen_location = 'calculate_credit_3'
AND NOT EXISTS (
    SELECT 1 FROM content_translations ct 
    WHERE ct.content_item_id = content_items.id AND ct.language_code = 'he'
);

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'ru', 'Добавить обязательство', 'approved' 
FROM content_items 
WHERE content_key = 'add_obligation' AND screen_location = 'calculate_credit_3'
AND NOT EXISTS (
    SELECT 1 FROM content_translations ct 
    WHERE ct.content_item_id = content_items.id AND ct.language_code = 'ru'
);

-- add_borrower
INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'en', 'Add borrower', 'approved' 
FROM content_items 
WHERE content_key = 'add_borrower' AND screen_location = 'calculate_credit_3'
AND NOT EXISTS (
    SELECT 1 FROM content_translations ct 
    WHERE ct.content_item_id = content_items.id AND ct.language_code = 'en'
);

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'he', 'הוסף לווה', 'approved' 
FROM content_items 
WHERE content_key = 'add_borrower' AND screen_location = 'calculate_credit_3'
AND NOT EXISTS (
    SELECT 1 FROM content_translations ct 
    WHERE ct.content_item_id = content_items.id AND ct.language_code = 'he'
);

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'ru', 'Добавить заемщика', 'approved' 
FROM content_items 
WHERE content_key = 'add_borrower' AND screen_location = 'calculate_credit_3'
AND NOT EXISTS (
    SELECT 1 FROM content_translations ct 
    WHERE ct.content_item_id = content_items.id AND ct.language_code = 'ru'
);

-- source_of_income
INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'en', 'Income source', 'approved' 
FROM content_items 
WHERE content_key = 'source_of_income' AND screen_location = 'calculate_credit_3'
AND NOT EXISTS (
    SELECT 1 FROM content_translations ct 
    WHERE ct.content_item_id = content_items.id AND ct.language_code = 'en'
);

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'he', 'מקור הכנסה', 'approved' 
FROM content_items 
WHERE content_key = 'source_of_income' AND screen_location = 'calculate_credit_3'
AND NOT EXISTS (
    SELECT 1 FROM content_translations ct 
    WHERE ct.content_item_id = content_items.id AND ct.language_code = 'he'
);

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'ru', 'Источник дохода', 'approved' 
FROM content_items 
WHERE content_key = 'source_of_income' AND screen_location = 'calculate_credit_3'
AND NOT EXISTS (
    SELECT 1 FROM content_translations ct 
    WHERE ct.content_item_id = content_items.id AND ct.language_code = 'ru'
);

-- additional_source_of_income
INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'en', 'Additional income source', 'approved' 
FROM content_items 
WHERE content_key = 'additional_source_of_income' AND screen_location = 'calculate_credit_3'
AND NOT EXISTS (
    SELECT 1 FROM content_translations ct 
    WHERE ct.content_item_id = content_items.id AND ct.language_code = 'en'
);

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'he', 'מקור הכנסה נוסף', 'approved' 
FROM content_items 
WHERE content_key = 'additional_source_of_income' AND screen_location = 'calculate_credit_3'
AND NOT EXISTS (
    SELECT 1 FROM content_translations ct 
    WHERE ct.content_item_id = content_items.id AND ct.language_code = 'he'
);

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'ru', 'Дополнительный источник дохода', 'approved' 
FROM content_items 
WHERE content_key = 'additional_source_of_income' AND screen_location = 'calculate_credit_3'
AND NOT EXISTS (
    SELECT 1 FROM content_translations ct 
    WHERE ct.content_item_id = content_items.id AND ct.language_code = 'ru'
);

-- obligation
INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'en', 'Obligation', 'approved' 
FROM content_items 
WHERE content_key = 'obligation' AND screen_location = 'calculate_credit_3'
AND NOT EXISTS (
    SELECT 1 FROM content_translations ct 
    WHERE ct.content_item_id = content_items.id AND ct.language_code = 'en'
);

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'he', 'התחייבות', 'approved' 
FROM content_items 
WHERE content_key = 'obligation' AND screen_location = 'calculate_credit_3'
AND NOT EXISTS (
    SELECT 1 FROM content_translations ct 
    WHERE ct.content_item_id = content_items.id AND ct.language_code = 'he'
);

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'ru', 'Обязательство', 'approved' 
FROM content_items 
WHERE content_key = 'obligation' AND screen_location = 'calculate_credit_3'
AND NOT EXISTS (
    SELECT 1 FROM content_translations ct 
    WHERE ct.content_item_id = content_items.id AND ct.language_code = 'ru'
);

-- borrower
INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'en', 'Borrower', 'approved' 
FROM content_items 
WHERE content_key = 'borrower' AND screen_location = 'calculate_credit_3'
AND NOT EXISTS (
    SELECT 1 FROM content_translations ct 
    WHERE ct.content_item_id = content_items.id AND ct.language_code = 'en'
);

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'he', 'לווה', 'approved' 
FROM content_items 
WHERE content_key = 'borrower' AND screen_location = 'calculate_credit_3'
AND NOT EXISTS (
    SELECT 1 FROM content_translations ct 
    WHERE ct.content_item_id = content_items.id AND ct.language_code = 'he'
);

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'ru', 'Заемщик', 'approved' 
FROM content_items 
WHERE content_key = 'borrower' AND screen_location = 'calculate_credit_3'
AND NOT EXISTS (
    SELECT 1 FROM content_translations ct 
    WHERE ct.content_item_id = content_items.id AND ct.language_code = 'ru'
);
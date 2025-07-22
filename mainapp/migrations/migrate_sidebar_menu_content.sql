-- Migration script for sidebar menu content
-- This script migrates all sidebar menu items to the database content management system

-- First, let's check if the items already exist to avoid duplicates
DO $$
BEGIN
    -- Delete existing sidebar menu items if they exist (to ensure clean migration)
    DELETE FROM content_translations WHERE content_item_id IN (
        SELECT id FROM content_items WHERE content_key LIKE 'sidebar_%'
    );
    DELETE FROM content_items WHERE content_key LIKE 'sidebar_%';
END $$;

-- Insert sidebar menu category headers
INSERT INTO content_items (content_key, screen_location, component_type, page_id, element_order, is_active, created_at, updated_at)
VALUES
    -- Company category header
    ('sidebar_company', 'sidebar', 'menu_category', NULL, 1, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    -- Business category header
    ('sidebar_business', 'sidebar', 'menu_category', NULL, 2, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Insert sidebar menu items for Company section
INSERT INTO content_items (content_key, screen_location, component_type, page_id, element_order, is_active, created_at, updated_at)
VALUES
    ('sidebar_company_1', 'sidebar', 'menu_item', NULL, 11, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('sidebar_company_2', 'sidebar', 'menu_item', NULL, 12, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('sidebar_company_3', 'sidebar', 'menu_item', NULL, 13, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('sidebar_company_4', 'sidebar', 'menu_item', NULL, 14, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('sidebar_company_5', 'sidebar', 'menu_item', NULL, 15, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('sidebar_company_6', 'sidebar', 'menu_item', NULL, 16, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Insert sidebar menu items for Business section
INSERT INTO content_items (content_key, screen_location, component_type, page_id, element_order, is_active, created_at, updated_at)
VALUES
    ('sidebar_business_1', 'sidebar', 'menu_item', NULL, 21, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('sidebar_business_2', 'sidebar', 'menu_item', NULL, 22, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('sidebar_business_3', 'sidebar', 'menu_item', NULL, 23, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('sidebar_business_4', 'sidebar', 'menu_item', NULL, 24, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Insert translations for category headers
INSERT INTO content_translations (content_item_id, language_code, field_name, translation_text, created_at, updated_at)
SELECT 
    ci.id,
    lang.code,
    'text',
    CASE 
        WHEN ci.content_key = 'sidebar_company' AND lang.code = 'en' THEN 'Company'
        WHEN ci.content_key = 'sidebar_company' AND lang.code = 'he' THEN 'חברה'
        WHEN ci.content_key = 'sidebar_company' AND lang.code = 'ru' THEN 'Компания'
        WHEN ci.content_key = 'sidebar_business' AND lang.code = 'en' THEN 'Business'
        WHEN ci.content_key = 'sidebar_business' AND lang.code = 'he' THEN 'עסקים'
        WHEN ci.content_key = 'sidebar_business' AND lang.code = 'ru' THEN 'Бизнес'
    END,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM content_items ci
CROSS JOIN (VALUES ('en'), ('he'), ('ru')) AS lang(code)
WHERE ci.content_key IN ('sidebar_company', 'sidebar_business');

-- Insert translations for Company menu items
INSERT INTO content_translations (content_item_id, language_code, field_name, translation_text, created_at, updated_at)
SELECT 
    ci.id,
    lang.code,
    'text',
    CASE 
        -- Company menu items
        WHEN ci.content_key = 'sidebar_company_1' AND lang.code = 'en' THEN 'Our services'
        WHEN ci.content_key = 'sidebar_company_1' AND lang.code = 'he' THEN 'השירותים שלנו'
        WHEN ci.content_key = 'sidebar_company_1' AND lang.code = 'ru' THEN 'Наши услуги'
        
        WHEN ci.content_key = 'sidebar_company_2' AND lang.code = 'en' THEN 'About'
        WHEN ci.content_key = 'sidebar_company_2' AND lang.code = 'he' THEN 'אודות'
        WHEN ci.content_key = 'sidebar_company_2' AND lang.code = 'ru' THEN 'О нас'
        
        WHEN ci.content_key = 'sidebar_company_3' AND lang.code = 'en' THEN 'Jobs'
        WHEN ci.content_key = 'sidebar_company_3' AND lang.code = 'he' THEN 'משרות'
        WHEN ci.content_key = 'sidebar_company_3' AND lang.code = 'ru' THEN 'Вакансии'
        
        WHEN ci.content_key = 'sidebar_company_4' AND lang.code = 'en' THEN 'Contact'
        WHEN ci.content_key = 'sidebar_company_4' AND lang.code = 'he' THEN 'צור קשר'
        WHEN ci.content_key = 'sidebar_company_4' AND lang.code = 'ru' THEN 'Связаться с нами'
        
        WHEN ci.content_key = 'sidebar_company_5' AND lang.code = 'en' THEN 'Temporary Franchise for Brokers'
        WHEN ci.content_key = 'sidebar_company_5' AND lang.code = 'he' THEN 'זכיון זמני למתווכים'
        WHEN ci.content_key = 'sidebar_company_5' AND lang.code = 'ru' THEN 'Временная франшиза для брокеров'
        
        WHEN ci.content_key = 'sidebar_company_6' AND lang.code = 'en' THEN 'Franchise for Real Estate Brokers'
        WHEN ci.content_key = 'sidebar_company_6' AND lang.code = 'he' THEN 'זיכיון למתווכי נדל"ן'
        WHEN ci.content_key = 'sidebar_company_6' AND lang.code = 'ru' THEN 'Франшиза для брокеров недвижимости'
    END,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM content_items ci
CROSS JOIN (VALUES ('en'), ('he'), ('ru')) AS lang(code)
WHERE ci.content_key LIKE 'sidebar_company_%' 
  AND ci.content_key != 'sidebar_company';

-- Insert translations for Business menu items
INSERT INTO content_translations (content_item_id, language_code, field_name, translation_text, created_at, updated_at)
SELECT 
    ci.id,
    lang.code,
    'text',
    CASE 
        -- Business menu items
        WHEN ci.content_key = 'sidebar_business_1' AND lang.code = 'en' THEN 'Partner financial institutions'
        WHEN ci.content_key = 'sidebar_business_1' AND lang.code = 'he' THEN 'מוסדות פיננסיים שותפים'
        WHEN ci.content_key = 'sidebar_business_1' AND lang.code = 'ru' THEN 'Финансовые учреждения-партнеры'
        
        WHEN ci.content_key = 'sidebar_business_2' AND lang.code = 'en' THEN 'Partner program'
        WHEN ci.content_key = 'sidebar_business_2' AND lang.code = 'he' THEN 'תכנית שותפים'
        WHEN ci.content_key = 'sidebar_business_2' AND lang.code = 'ru' THEN 'Партнерская программа'
        
        WHEN ci.content_key = 'sidebar_business_3' AND lang.code = 'en' THEN 'Broker franchise'
        WHEN ci.content_key = 'sidebar_business_3' AND lang.code = 'he' THEN 'זיכיון לברוקרים'
        WHEN ci.content_key = 'sidebar_business_3' AND lang.code = 'ru' THEN 'Франшиза для брокеров'
        
        WHEN ci.content_key = 'sidebar_business_4' AND lang.code = 'en' THEN 'Lawyer partner program'
        WHEN ci.content_key = 'sidebar_business_4' AND lang.code = 'he' THEN 'תוכנית שותפים לעורכי דין'
        WHEN ci.content_key = 'sidebar_business_4' AND lang.code = 'ru' THEN 'Партнерская программа для юристов'
    END,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM content_items ci
CROSS JOIN (VALUES ('en'), ('he'), ('ru')) AS lang(code)
WHERE ci.content_key LIKE 'sidebar_business_%' 
  AND ci.content_key != 'sidebar_business';

-- Verify the migration
SELECT 
    ci.content_key,
    ci.screen_location,
    ci.component_type,
    ci.element_order,
    MAX(CASE WHEN ct.language_code = 'en' THEN ct.translation_text END) as en_text,
    MAX(CASE WHEN ct.language_code = 'he' THEN ct.translation_text END) as he_text,
    MAX(CASE WHEN ct.language_code = 'ru' THEN ct.translation_text END) as ru_text
FROM content_items ci
LEFT JOIN content_translations ct ON ci.id = ct.content_item_id AND ct.field_name = 'text'
WHERE ci.content_key LIKE 'sidebar_%'
GROUP BY ci.content_key, ci.screen_location, ci.component_type, ci.element_order
ORDER BY ci.element_order;
-- Migration: Add sidebar menu content for company and business sections
-- Purpose: Insert sidebar menu items with translations for company and business sections

-- Company section header
INSERT INTO page_content (content_key, screen_location, component_type, order_position, is_visible, created_at, updated_at)
VALUES ('sidebar_company', 'sidebar', 'menu_item', 1, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO page_content_translations (page_content_id, locale_id, translation_value, created_at, updated_at)
SELECT 
    pc.id,
    l.id,
    CASE l.code
        WHEN 'en' THEN 'Company'
        WHEN 'he' THEN 'חברה'
        WHEN 'ru' THEN 'Компания'
    END,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM page_content pc
CROSS JOIN locales l
WHERE pc.content_key = 'sidebar_company'
AND l.code IN ('en', 'he', 'ru');

-- Company menu items
INSERT INTO page_content (content_key, screen_location, component_type, order_position, is_visible, created_at, updated_at)
VALUES 
    ('sidebar_company_1', 'sidebar', 'menu_item', 2, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('sidebar_company_2', 'sidebar', 'menu_item', 3, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('sidebar_company_3', 'sidebar', 'menu_item', 4, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('sidebar_company_4', 'sidebar', 'menu_item', 5, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('sidebar_company_5', 'sidebar', 'menu_item', 6, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('sidebar_company_6', 'sidebar', 'menu_item', 7, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Translations for company menu items
INSERT INTO page_content_translations (page_content_id, locale_id, translation_value, created_at, updated_at)
SELECT 
    pc.id,
    l.id,
    CASE 
        WHEN pc.content_key = 'sidebar_company_1' THEN
            CASE l.code
                WHEN 'en' THEN 'About Us'
                WHEN 'he' THEN 'אודותינו'
                WHEN 'ru' THEN 'О нас'
            END
        WHEN pc.content_key = 'sidebar_company_2' THEN
            CASE l.code
                WHEN 'en' THEN 'Branches'
                WHEN 'he' THEN 'סניפים'
                WHEN 'ru' THEN 'Филиалы'
            END
        WHEN pc.content_key = 'sidebar_company_3' THEN
            CASE l.code
                WHEN 'en' THEN 'Partners'
                WHEN 'he' THEN 'שותפים'
                WHEN 'ru' THEN 'Партнеры'
            END
        WHEN pc.content_key = 'sidebar_company_4' THEN
            CASE l.code
                WHEN 'en' THEN 'In The Press'
                WHEN 'he' THEN 'בעיתונות'
                WHEN 'ru' THEN 'В прессе'
            END
        WHEN pc.content_key = 'sidebar_company_5' THEN
            CASE l.code
                WHEN 'en' THEN 'Join The Team'
                WHEN 'he' THEN 'הצטרפו לצוות'
                WHEN 'ru' THEN 'Присоединиться к команде'
            END
        WHEN pc.content_key = 'sidebar_company_6' THEN
            CASE l.code
                WHEN 'en' THEN 'Contact'
                WHEN 'he' THEN 'צור קשר'
                WHEN 'ru' THEN 'Контакт'
            END
    END,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM page_content pc
CROSS JOIN locales l
WHERE pc.content_key IN ('sidebar_company_1', 'sidebar_company_2', 'sidebar_company_3', 
                         'sidebar_company_4', 'sidebar_company_5', 'sidebar_company_6')
AND l.code IN ('en', 'he', 'ru');

-- Business section header
INSERT INTO page_content (content_key, screen_location, component_type, order_position, is_visible, created_at, updated_at)
VALUES ('sidebar_business', 'sidebar', 'menu_item', 8, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO page_content_translations (page_content_id, locale_id, translation_value, created_at, updated_at)
SELECT 
    pc.id,
    l.id,
    CASE l.code
        WHEN 'en' THEN 'Business'
        WHEN 'he' THEN 'עסקים'
        WHEN 'ru' THEN 'Бизнес'
    END,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM page_content pc
CROSS JOIN locales l
WHERE pc.content_key = 'sidebar_business'
AND l.code IN ('en', 'he', 'ru');

-- Business menu items
INSERT INTO page_content (content_key, screen_location, component_type, order_position, is_visible, created_at, updated_at)
VALUES 
    ('sidebar_business_1', 'sidebar', 'menu_item', 9, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('sidebar_business_2', 'sidebar', 'menu_item', 10, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('sidebar_business_3', 'sidebar', 'menu_item', 11, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('sidebar_business_4', 'sidebar', 'menu_item', 12, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Translations for business menu items
INSERT INTO page_content_translations (page_content_id, locale_id, translation_value, created_at, updated_at)
SELECT 
    pc.id,
    l.id,
    CASE 
        WHEN pc.content_key = 'sidebar_business_1' THEN
            CASE l.code
                WHEN 'en' THEN 'Business Mortgage'
                WHEN 'he' THEN 'משכנתא עסקית'
                WHEN 'ru' THEN 'Бизнес-ипотека'
            END
        WHEN pc.content_key = 'sidebar_business_2' THEN
            CASE l.code
                WHEN 'en' THEN 'Business Loan'
                WHEN 'he' THEN 'הלוואה עסקית'
                WHEN 'ru' THEN 'Бизнес-кредит'
            END
        WHEN pc.content_key = 'sidebar_business_3' THEN
            CASE l.code
                WHEN 'en' THEN 'Business Consulting'
                WHEN 'he' THEN 'ייעוץ עסקי'
                WHEN 'ru' THEN 'Бизнес-консалтинг'
            END
        WHEN pc.content_key = 'sidebar_business_4' THEN
            CASE l.code
                WHEN 'en' THEN 'Business Partners'
                WHEN 'he' THEN 'שותפים עסקיים'
                WHEN 'ru' THEN 'Бизнес-партнеры'
            END
    END,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM page_content pc
CROSS JOIN locales l
WHERE pc.content_key IN ('sidebar_business_1', 'sidebar_business_2', 'sidebar_business_3', 'sidebar_business_4')
AND l.code IN ('en', 'he', 'ru');

-- Add rollback section
COMMENT ON EXTENSION IF EXISTS plpgsql IS 'To rollback this migration, run:
DELETE FROM page_content_translations WHERE page_content_id IN (
    SELECT id FROM page_content WHERE content_key IN (
        ''sidebar_company'', ''sidebar_company_1'', ''sidebar_company_2'', 
        ''sidebar_company_3'', ''sidebar_company_4'', ''sidebar_company_5'', 
        ''sidebar_company_6'', ''sidebar_business'', ''sidebar_business_1'', 
        ''sidebar_business_2'', ''sidebar_business_3'', ''sidebar_business_4''
    )
);

DELETE FROM page_content WHERE content_key IN (
    ''sidebar_company'', ''sidebar_company_1'', ''sidebar_company_2'', 
    ''sidebar_company_3'', ''sidebar_company_4'', ''sidebar_company_5'', 
    ''sidebar_company_6'', ''sidebar_business'', ''sidebar_business_1'', 
    ''sidebar_business_2'', ''sidebar_business_3'', ''sidebar_business_4''
);';
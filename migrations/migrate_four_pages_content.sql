-- Migration script for content from four pages: cooperation, tenders-for-brokers, Real-Estate-Brokerage (TemporaryFranchise), tenders-for-lawyers
-- This script migrates all content to the database-driven content management system

-- Start transaction
BEGIN;

-- 1. COOPERATION PAGE CONTENT
-- Hero Section
INSERT INTO content_items (screen_location, content_key, component_type, category, is_active, created_at, updated_at)
VALUES 
('cooperation', 'cooperation_title', 'heading', 'hero', true, NOW(), NOW()),
('cooperation', 'cooperation_subtitle', 'text', 'hero', true, NOW(), NOW()),
('cooperation', 'register_partner_program', 'button', 'hero', true, NOW(), NOW());

INSERT INTO content_translations (content_item_id, language_code, content_value, status, created_at, updated_at)
SELECT 
    ci.id,
    lang.code,
    CASE 
        WHEN ci.content_key = 'cooperation_title' AND lang.code = 'en' THEN 'Join our Partner Program'
        WHEN ci.content_key = 'cooperation_title' AND lang.code = 'he' THEN 'הצטרפו לתוכנית השותפים שלנו'
        WHEN ci.content_key = 'cooperation_title' AND lang.code = 'ru' THEN 'Присоединяйтесь к нашей партнерской программе'
        WHEN ci.content_key = 'cooperation_subtitle' AND lang.code = 'en' THEN 'Earn commissions by referring clients to our mortgage and credit services'
        WHEN ci.content_key = 'cooperation_subtitle' AND lang.code = 'he' THEN 'הרוויחו עמלות על הפניית לקוחות לשירותי המשכנתא והאשראי שלנו'
        WHEN ci.content_key = 'cooperation_subtitle' AND lang.code = 'ru' THEN 'Зарабатывайте комиссионные, направляя клиентов к нашим ипотечным и кредитным услугам'
        WHEN ci.content_key = 'register_partner_program' AND lang.code = 'en' THEN 'Register as Partner'
        WHEN ci.content_key = 'register_partner_program' AND lang.code = 'he' THEN 'הירשמו כשותפים'
        WHEN ci.content_key = 'register_partner_program' AND lang.code = 'ru' THEN 'Зарегистрироваться как партнер'
    END,
    'active',
    NOW(),
    NOW()
FROM content_items ci
CROSS JOIN (VALUES ('en'), ('he'), ('ru')) AS lang(code)
WHERE ci.screen_location = 'cooperation' 
    AND ci.content_key IN ('cooperation_title', 'cooperation_subtitle', 'register_partner_program');

-- Marketplace Section
INSERT INTO content_items (screen_location, content_key, component_type, category, is_active, created_at, updated_at)
VALUES 
('cooperation', 'marketplace_title', 'heading', 'marketplace', true, NOW(), NOW()),
('cooperation', 'marketplace_description', 'text', 'marketplace', true, NOW(), NOW()),
('cooperation', 'feature_mortgage_calc', 'text', 'marketplace', true, NOW(), NOW()),
('cooperation', 'feature_mortgage_refinance', 'text', 'marketplace', true, NOW(), NOW()),
('cooperation', 'feature_credit_calc', 'text', 'marketplace', true, NOW(), NOW()),
('cooperation', 'feature_credit_refinance', 'text', 'marketplace', true, NOW(), NOW()),
('cooperation', 'one_click_mortgage', 'button', 'marketplace', true, NOW(), NOW());

INSERT INTO content_translations (content_item_id, language_code, content_value, status, created_at, updated_at)
SELECT 
    ci.id,
    lang.code,
    CASE 
        WHEN ci.content_key = 'marketplace_title' AND lang.code = 'en' THEN 'Bankimonline Marketplace'
        WHEN ci.content_key = 'marketplace_title' AND lang.code = 'he' THEN 'מרקטפלייס בנקימאונליין'
        WHEN ci.content_key = 'marketplace_title' AND lang.code = 'ru' THEN 'Маркетплейс Bankimonline'
        WHEN ci.content_key = 'marketplace_description' AND lang.code = 'en' THEN 'Digital platform for financial services with advanced tools and calculators'
        WHEN ci.content_key = 'marketplace_description' AND lang.code = 'he' THEN 'פלטפורמה דיגיטלית לשירותים פיננסיים עם כלים ומחשבונים מתקדמים'
        WHEN ci.content_key = 'marketplace_description' AND lang.code = 'ru' THEN 'Цифровая платформа для финансовых услуг с продвинутыми инструментами и калькуляторами'
        WHEN ci.content_key = 'feature_mortgage_calc' AND lang.code = 'en' THEN 'Mortgage Calculator'
        WHEN ci.content_key = 'feature_mortgage_calc' AND lang.code = 'he' THEN 'מחשבון משכנתא'
        WHEN ci.content_key = 'feature_mortgage_calc' AND lang.code = 'ru' THEN 'Ипотечный калькулятор'
        WHEN ci.content_key = 'feature_mortgage_refinance' AND lang.code = 'en' THEN 'Mortgage Refinancing'
        WHEN ci.content_key = 'feature_mortgage_refinance' AND lang.code = 'he' THEN 'מיחזור משכנתא'
        WHEN ci.content_key = 'feature_mortgage_refinance' AND lang.code = 'ru' THEN 'Рефинансирование ипотеки'
        WHEN ci.content_key = 'feature_credit_calc' AND lang.code = 'en' THEN 'Credit Calculator'
        WHEN ci.content_key = 'feature_credit_calc' AND lang.code = 'he' THEN 'מחשבון אשראי'
        WHEN ci.content_key = 'feature_credit_calc' AND lang.code = 'ru' THEN 'Кредитный калькулятор'
        WHEN ci.content_key = 'feature_credit_refinance' AND lang.code = 'en' THEN 'Credit Refinancing'
        WHEN ci.content_key = 'feature_credit_refinance' AND lang.code = 'he' THEN 'מיחזור אשראי'
        WHEN ci.content_key = 'feature_credit_refinance' AND lang.code = 'ru' THEN 'Рефинансирование кредита'
        WHEN ci.content_key = 'one_click_mortgage' AND lang.code = 'en' THEN 'One-Click Mortgage'
        WHEN ci.content_key = 'one_click_mortgage' AND lang.code = 'he' THEN 'משכנתא בקליק אחד'
        WHEN ci.content_key = 'one_click_mortgage' AND lang.code = 'ru' THEN 'Ипотека в один клик'
    END,
    'active',
    NOW(),
    NOW()
FROM content_items ci
CROSS JOIN (VALUES ('en'), ('he'), ('ru')) AS lang(code)
WHERE ci.screen_location = 'cooperation' 
    AND ci.content_key IN ('marketplace_title', 'marketplace_description', 'feature_mortgage_calc', 
        'feature_mortgage_refinance', 'feature_credit_calc', 'feature_credit_refinance', 'one_click_mortgage');

-- Referral Section
INSERT INTO content_items (screen_location, content_key, component_type, category, is_active, created_at, updated_at)
VALUES 
('cooperation', 'referral_title', 'heading', 'referral', true, NOW(), NOW()),
('cooperation', 'referral_description', 'text', 'referral', true, NOW(), NOW());

INSERT INTO content_translations (content_item_id, language_code, content_value, status, created_at, updated_at)
SELECT 
    ci.id,
    lang.code,
    CASE 
        WHEN ci.content_key = 'referral_title' AND lang.code = 'en' THEN 'Bring a client and get 500 ₪ reward'
        WHEN ci.content_key = 'referral_title' AND lang.code = 'he' THEN 'הביאו לקוח וקבלו פרס של 500 ₪'
        WHEN ci.content_key = 'referral_title' AND lang.code = 'ru' THEN 'Приведите клиента и получите вознаграждение 500 ₪'
        WHEN ci.content_key = 'referral_description' AND lang.code = 'en' THEN 'Earn a commission for every client who purchases our services'
        WHEN ci.content_key = 'referral_description' AND lang.code = 'he' THEN 'הרוויחו עמלה על כל לקוח שרוכש את השירותים שלנו'
        WHEN ci.content_key = 'referral_description' AND lang.code = 'ru' THEN 'Зарабатывайте комиссию за каждого клиента, который приобретает наши услуги'
    END,
    'active',
    NOW(),
    NOW()
FROM content_items ci
CROSS JOIN (VALUES ('en'), ('he'), ('ru')) AS lang(code)
WHERE ci.screen_location = 'cooperation' 
    AND ci.content_key IN ('referral_title', 'referral_description');

-- CTA Banner Section
INSERT INTO content_items (screen_location, content_key, component_type, category, is_active, created_at, updated_at)
VALUES 
('cooperation', 'cooperation_cta_title', 'heading', 'cta', true, NOW(), NOW());

INSERT INTO content_translations (content_item_id, language_code, content_value, status, created_at, updated_at)
SELECT 
    ci.id,
    lang.code,
    CASE 
        WHEN ci.content_key = 'cooperation_cta_title' AND lang.code = 'en' THEN 'Ready to become a partner?'
        WHEN ci.content_key = 'cooperation_cta_title' AND lang.code = 'he' THEN 'מוכנים להיות שותפים?'
        WHEN ci.content_key = 'cooperation_cta_title' AND lang.code = 'ru' THEN 'Готовы стать партнером?'
    END,
    'active',
    NOW(),
    NOW()
FROM content_items ci
CROSS JOIN (VALUES ('en'), ('he'), ('ru')) AS lang(code)
WHERE ci.screen_location = 'cooperation' 
    AND ci.content_key = 'cooperation_cta_title';

-- 2. TENDERS FOR BROKERS PAGE CONTENT
-- Hero Section
INSERT INTO content_items (screen_location, content_key, component_type, category, is_active, created_at, updated_at)
VALUES 
('tenders_for_brokers', 'tenders_hero_headline', 'heading', 'hero', true, NOW(), NOW()),
('tenders_for_brokers', 'tenders_hero_b1', 'text', 'hero', true, NOW(), NOW()),
('tenders_for_brokers', 'tenders_hero_b2', 'text', 'hero', true, NOW(), NOW()),
('tenders_for_brokers', 'tenders_hero_b3', 'text', 'hero', true, NOW(), NOW()),
('tenders_for_brokers', 'tenders_hero_cta', 'button', 'hero', true, NOW(), NOW());

INSERT INTO content_translations (content_item_id, language_code, content_value, status, created_at, updated_at)
SELECT 
    ci.id,
    lang.code,
    CASE 
        WHEN ci.content_key = 'tenders_hero_headline' AND lang.code = 'en' THEN 'Become a Licensed Mortgage Broker'
        WHEN ci.content_key = 'tenders_hero_headline' AND lang.code = 'he' THEN 'הפכו ליועץ משכנתאות מורשה'
        WHEN ci.content_key = 'tenders_hero_headline' AND lang.code = 'ru' THEN 'Станьте лицензированным ипотечным брокером'
        WHEN ci.content_key = 'tenders_hero_b1' AND lang.code = 'en' THEN 'Professional training and certification'
        WHEN ci.content_key = 'tenders_hero_b1' AND lang.code = 'he' THEN 'הכשרה מקצועית והסמכה'
        WHEN ci.content_key = 'tenders_hero_b1' AND lang.code = 'ru' THEN 'Профессиональная подготовка и сертификация'
        WHEN ci.content_key = 'tenders_hero_b2' AND lang.code = 'en' THEN 'Access to exclusive mortgage programs'
        WHEN ci.content_key = 'tenders_hero_b2' AND lang.code = 'he' THEN 'גישה לתוכניות משכנתא בלעדיות'
        WHEN ci.content_key = 'tenders_hero_b2' AND lang.code = 'ru' THEN 'Доступ к эксклюзивным ипотечным программам'
        WHEN ci.content_key = 'tenders_hero_b3' AND lang.code = 'en' THEN 'Comprehensive support system'
        WHEN ci.content_key = 'tenders_hero_b3' AND lang.code = 'he' THEN 'מערכת תמיכה מקיפה'
        WHEN ci.content_key = 'tenders_hero_b3' AND lang.code = 'ru' THEN 'Комплексная система поддержки'
        WHEN ci.content_key = 'tenders_hero_cta' AND lang.code = 'en' THEN 'Start Your Journey'
        WHEN ci.content_key = 'tenders_hero_cta' AND lang.code = 'he' THEN 'התחילו את המסע שלכם'
        WHEN ci.content_key = 'tenders_hero_cta' AND lang.code = 'ru' THEN 'Начните свой путь'
    END,
    'active',
    NOW(),
    NOW()
FROM content_items ci
CROSS JOIN (VALUES ('en'), ('he'), ('ru')) AS lang(code)
WHERE ci.screen_location = 'tenders_for_brokers' 
    AND ci.content_key IN ('tenders_hero_headline', 'tenders_hero_b1', 'tenders_hero_b2', 'tenders_hero_b3', 'tenders_hero_cta');

-- License Features (Accordion - migrating as options)
INSERT INTO content_items (screen_location, content_key, component_type, category, is_active, created_at, updated_at)
VALUES 
('tenders_for_brokers', 'tenders_license_title', 'heading', 'license', true, NOW(), NOW()),
-- Feature 1
('tenders_for_brokers', 'tenders_license_feature1_title', 'option', 'license', true, NOW(), NOW()),
('tenders_for_brokers', 'tenders_license_feature1_p1', 'option', 'license', true, NOW(), NOW()),
('tenders_for_brokers', 'tenders_license_feature1_p2', 'option', 'license', true, NOW(), NOW()),
('tenders_for_brokers', 'tenders_license_feature1_p3', 'option', 'license', true, NOW(), NOW()),
-- Feature 2
('tenders_for_brokers', 'tenders_license_feature2_title', 'option', 'license', true, NOW(), NOW()),
('tenders_for_brokers', 'tenders_license_feature2_p1', 'option', 'license', true, NOW(), NOW()),
('tenders_for_brokers', 'tenders_license_feature2_p2', 'option', 'license', true, NOW(), NOW()),
('tenders_for_brokers', 'tenders_license_feature2_p3', 'option', 'license', true, NOW(), NOW()),
-- Feature 3
('tenders_for_brokers', 'tenders_license_feature3_title', 'option', 'license', true, NOW(), NOW()),
('tenders_for_brokers', 'tenders_license_feature3_p1', 'option', 'license', true, NOW(), NOW()),
('tenders_for_brokers', 'tenders_license_feature3_p2', 'option', 'license', true, NOW(), NOW()),
('tenders_for_brokers', 'tenders_license_feature3_p3', 'option', 'license', true, NOW(), NOW());

INSERT INTO content_translations (content_item_id, language_code, content_value, status, created_at, updated_at)
SELECT 
    ci.id,
    lang.code,
    CASE 
        WHEN ci.content_key = 'tenders_license_title' AND lang.code = 'en' THEN 'What Does Your License Include?'
        WHEN ci.content_key = 'tenders_license_title' AND lang.code = 'he' THEN 'מה כולל הרישיון שלכם?'
        WHEN ci.content_key = 'tenders_license_title' AND lang.code = 'ru' THEN 'Что включает ваша лицензия?'
        -- Feature 1
        WHEN ci.content_key = 'tenders_license_feature1_title' AND lang.code = 'en' THEN 'Professional Infrastructure'
        WHEN ci.content_key = 'tenders_license_feature1_title' AND lang.code = 'he' THEN 'תשתית מקצועית'
        WHEN ci.content_key = 'tenders_license_feature1_title' AND lang.code = 'ru' THEN 'Профессиональная инфраструктура'
        WHEN ci.content_key = 'tenders_license_feature1_p1' AND lang.code = 'en' THEN 'Advanced CRM system for client management'
        WHEN ci.content_key = 'tenders_license_feature1_p1' AND lang.code = 'he' THEN 'מערכת CRM מתקדמת לניהול לקוחות'
        WHEN ci.content_key = 'tenders_license_feature1_p1' AND lang.code = 'ru' THEN 'Продвинутая CRM-система для управления клиентами'
        WHEN ci.content_key = 'tenders_license_feature1_p2' AND lang.code = 'en' THEN 'Professional tools and calculators'
        WHEN ci.content_key = 'tenders_license_feature1_p2' AND lang.code = 'he' THEN 'כלים ומחשבונים מקצועיים'
        WHEN ci.content_key = 'tenders_license_feature1_p2' AND lang.code = 'ru' THEN 'Профессиональные инструменты и калькуляторы'
        WHEN ci.content_key = 'tenders_license_feature1_p3' AND lang.code = 'en' THEN 'Office and equipment support'
        WHEN ci.content_key = 'tenders_license_feature1_p3' AND lang.code = 'he' THEN 'תמיכה במשרד וציוד'
        WHEN ci.content_key = 'tenders_license_feature1_p3' AND lang.code = 'ru' THEN 'Поддержка офиса и оборудования'
        -- Feature 2
        WHEN ci.content_key = 'tenders_license_feature2_title' AND lang.code = 'en' THEN 'Marketing Support'
        WHEN ci.content_key = 'tenders_license_feature2_title' AND lang.code = 'he' THEN 'תמיכה שיווקית'
        WHEN ci.content_key = 'tenders_license_feature2_title' AND lang.code = 'ru' THEN 'Маркетинговая поддержка'
        WHEN ci.content_key = 'tenders_license_feature2_p1' AND lang.code = 'en' THEN 'Lead generation system'
        WHEN ci.content_key = 'tenders_license_feature2_p1' AND lang.code = 'he' THEN 'מערכת לייצור לידים'
        WHEN ci.content_key = 'tenders_license_feature2_p1' AND lang.code = 'ru' THEN 'Система генерации лидов'
        WHEN ci.content_key = 'tenders_license_feature2_p2' AND lang.code = 'en' THEN 'Digital marketing campaigns'
        WHEN ci.content_key = 'tenders_license_feature2_p2' AND lang.code = 'he' THEN 'קמפיינים שיווקיים דיגיטליים'
        WHEN ci.content_key = 'tenders_license_feature2_p2' AND lang.code = 'ru' THEN 'Цифровые маркетинговые кампании'
        WHEN ci.content_key = 'tenders_license_feature2_p3' AND lang.code = 'en' THEN 'Brand and reputation building'
        WHEN ci.content_key = 'tenders_license_feature2_p3' AND lang.code = 'he' THEN 'בניית מותג ומוניטין'
        WHEN ci.content_key = 'tenders_license_feature2_p3' AND lang.code = 'ru' THEN 'Построение бренда и репутации'
        -- Feature 3
        WHEN ci.content_key = 'tenders_license_feature3_title' AND lang.code = 'en' THEN 'Training & Support'
        WHEN ci.content_key = 'tenders_license_feature3_title' AND lang.code = 'he' THEN 'הכשרה ותמיכה'
        WHEN ci.content_key = 'tenders_license_feature3_title' AND lang.code = 'ru' THEN 'Обучение и поддержка'
        WHEN ci.content_key = 'tenders_license_feature3_p1' AND lang.code = 'en' THEN 'Comprehensive training program'
        WHEN ci.content_key = 'tenders_license_feature3_p1' AND lang.code = 'he' THEN 'תוכנית הכשרה מקיפה'
        WHEN ci.content_key = 'tenders_license_feature3_p1' AND lang.code = 'ru' THEN 'Комплексная программа обучения'
        WHEN ci.content_key = 'tenders_license_feature3_p2' AND lang.code = 'en' THEN 'Ongoing professional development'
        WHEN ci.content_key = 'tenders_license_feature3_p2' AND lang.code = 'he' THEN 'פיתוח מקצועי מתמשך'
        WHEN ci.content_key = 'tenders_license_feature3_p2' AND lang.code = 'ru' THEN 'Постоянное профессиональное развитие'
        WHEN ci.content_key = 'tenders_license_feature3_p3' AND lang.code = 'en' THEN '24/7 technical support'
        WHEN ci.content_key = 'tenders_license_feature3_p3' AND lang.code = 'he' THEN 'תמיכה טכנית 24/7'
        WHEN ci.content_key = 'tenders_license_feature3_p3' AND lang.code = 'ru' THEN 'Техническая поддержка 24/7'
    END,
    'active',
    NOW(),
    NOW()
FROM content_items ci
CROSS JOIN (VALUES ('en'), ('he'), ('ru')) AS lang(code)
WHERE ci.screen_location = 'tenders_for_brokers' 
    AND ci.content_key LIKE 'tenders_license%';

-- Steps Section (Dynamic content with sequential numbering)
INSERT INTO content_items (screen_location, content_key, component_type, category, is_active, created_at, updated_at)
VALUES 
('tenders_for_brokers', 'tenders_steps_title', 'heading', 'steps', true, NOW(), NOW()),
-- Step 1
('tenders_for_brokers', 'tenders_step1_title', 'option', 'steps', true, NOW(), NOW()),
('tenders_for_brokers', 'tenders_step1_desc', 'option', 'steps', true, NOW(), NOW()),
-- Step 2
('tenders_for_brokers', 'tenders_step2_title', 'option', 'steps', true, NOW(), NOW()),
('tenders_for_brokers', 'tenders_step2_desc', 'option', 'steps', true, NOW(), NOW()),
-- Step 3
('tenders_for_brokers', 'tenders_step3_title', 'option', 'steps', true, NOW(), NOW()),
('tenders_for_brokers', 'tenders_step3_desc', 'option', 'steps', true, NOW(), NOW()),
-- Step 4
('tenders_for_brokers', 'tenders_step4_title', 'option', 'steps', true, NOW(), NOW()),
('tenders_for_brokers', 'tenders_step4_desc', 'option', 'steps', true, NOW(), NOW()),
-- Step 5
('tenders_for_brokers', 'tenders_step5_title', 'option', 'steps', true, NOW(), NOW()),
('tenders_for_brokers', 'tenders_step5_desc', 'option', 'steps', true, NOW(), NOW());

INSERT INTO content_translations (content_item_id, language_code, content_value, status, created_at, updated_at)
SELECT 
    ci.id,
    lang.code,
    CASE 
        WHEN ci.content_key = 'tenders_steps_title' AND lang.code = 'en' THEN 'Your Path to Success'
        WHEN ci.content_key = 'tenders_steps_title' AND lang.code = 'he' THEN 'הדרך שלכם להצלחה'
        WHEN ci.content_key = 'tenders_steps_title' AND lang.code = 'ru' THEN 'Ваш путь к успеху'
        -- Step 1
        WHEN ci.content_key = 'tenders_step1_title' AND lang.code = 'en' THEN 'Apply Online'
        WHEN ci.content_key = 'tenders_step1_title' AND lang.code = 'he' THEN 'הגישו בקשה מקוונת'
        WHEN ci.content_key = 'tenders_step1_title' AND lang.code = 'ru' THEN 'Подайте заявку онлайн'
        WHEN ci.content_key = 'tenders_step1_desc' AND lang.code = 'en' THEN 'Fill out our simple application form'
        WHEN ci.content_key = 'tenders_step1_desc' AND lang.code = 'he' THEN 'מלאו את טופס הבקשה הפשוט שלנו'
        WHEN ci.content_key = 'tenders_step1_desc' AND lang.code = 'ru' THEN 'Заполните нашу простую форму заявки'
        -- Step 2
        WHEN ci.content_key = 'tenders_step2_title' AND lang.code = 'en' THEN 'Initial Interview'
        WHEN ci.content_key = 'tenders_step2_title' AND lang.code = 'he' THEN 'ראיון ראשוני'
        WHEN ci.content_key = 'tenders_step2_title' AND lang.code = 'ru' THEN 'Первичное собеседование'
        WHEN ci.content_key = 'tenders_step2_desc' AND lang.code = 'en' THEN 'Meet with our team to discuss your goals'
        WHEN ci.content_key = 'tenders_step2_desc' AND lang.code = 'he' THEN 'פגשו את הצוות שלנו כדי לדון ביעדים שלכם'
        WHEN ci.content_key = 'tenders_step2_desc' AND lang.code = 'ru' THEN 'Встретьтесь с нашей командой для обсуждения ваших целей'
        -- Step 3
        WHEN ci.content_key = 'tenders_step3_title' AND lang.code = 'en' THEN 'Training Program'
        WHEN ci.content_key = 'tenders_step3_title' AND lang.code = 'he' THEN 'תוכנית הכשרה'
        WHEN ci.content_key = 'tenders_step3_title' AND lang.code = 'ru' THEN 'Программа обучения'
        WHEN ci.content_key = 'tenders_step3_desc' AND lang.code = 'en' THEN 'Complete our comprehensive training course'
        WHEN ci.content_key = 'tenders_step3_desc' AND lang.code = 'he' THEN 'השלימו את קורס ההכשרה המקיף שלנו'
        WHEN ci.content_key = 'tenders_step3_desc' AND lang.code = 'ru' THEN 'Пройдите наш комплексный учебный курс'
        -- Step 4
        WHEN ci.content_key = 'tenders_step4_title' AND lang.code = 'en' THEN 'License & Setup'
        WHEN ci.content_key = 'tenders_step4_title' AND lang.code = 'he' THEN 'רישיון והקמה'
        WHEN ci.content_key = 'tenders_step4_title' AND lang.code = 'ru' THEN 'Лицензия и настройка'
        WHEN ci.content_key = 'tenders_step4_desc' AND lang.code = 'en' THEN 'Receive your license and set up your office'
        WHEN ci.content_key = 'tenders_step4_desc' AND lang.code = 'he' THEN 'קבלו את הרישיון שלכם והקימו את המשרד'
        WHEN ci.content_key = 'tenders_step4_desc' AND lang.code = 'ru' THEN 'Получите лицензию и настройте офис'
        -- Step 5
        WHEN ci.content_key = 'tenders_step5_title' AND lang.code = 'en' THEN 'Start Earning'
        WHEN ci.content_key = 'tenders_step5_title' AND lang.code = 'he' THEN 'התחילו להרוויח'
        WHEN ci.content_key = 'tenders_step5_title' AND lang.code = 'ru' THEN 'Начните зарабатывать'
        WHEN ci.content_key = 'tenders_step5_desc' AND lang.code = 'en' THEN 'Begin working with clients and earning commissions'
        WHEN ci.content_key = 'tenders_step5_desc' AND lang.code = 'he' THEN 'התחילו לעבוד עם לקוחות ולהרוויח עמלות'
        WHEN ci.content_key = 'tenders_step5_desc' AND lang.code = 'ru' THEN 'Начните работать с клиентами и зарабатывать комиссионные'
    END,
    'active',
    NOW(),
    NOW()
FROM content_items ci
CROSS JOIN (VALUES ('en'), ('he'), ('ru')) AS lang(code)
WHERE ci.screen_location = 'tenders_for_brokers' 
    AND ci.content_key LIKE 'tenders_step%';

-- Metrics Section
INSERT INTO content_items (screen_location, content_key, component_type, category, is_active, created_at, updated_at)
VALUES 
('tenders_for_brokers', 'tenders_metrics_title', 'heading', 'metrics', true, NOW(), NOW()),
('tenders_for_brokers', 'tenders_metrics_prospects_label', 'text', 'metrics', true, NOW(), NOW()),
('tenders_for_brokers', 'tenders_metrics_prospects_value', 'text', 'metrics', true, NOW(), NOW()),
('tenders_for_brokers', 'tenders_metrics_investment_label', 'text', 'metrics', true, NOW(), NOW()),
('tenders_for_brokers', 'tenders_metrics_investment_display', 'text', 'metrics', true, NOW(), NOW()),
('tenders_for_brokers', 'tenders_metrics_payback_label', 'text', 'metrics', true, NOW(), NOW()),
('tenders_for_brokers', 'tenders_metrics_payback_display', 'text', 'metrics', true, NOW(), NOW()),
('tenders_for_brokers', 'tenders_metrics_disclaimer', 'text', 'metrics', true, NOW(), NOW()),
('tenders_for_brokers', 'tenders_metrics_button', 'button', 'metrics', true, NOW(), NOW());

INSERT INTO content_translations (content_item_id, language_code, content_value, status, created_at, updated_at)
SELECT 
    ci.id,
    lang.code,
    CASE 
        WHEN ci.content_key = 'tenders_metrics_title' AND lang.code = 'en' THEN 'Investment & Returns'
        WHEN ci.content_key = 'tenders_metrics_title' AND lang.code = 'he' THEN 'השקעה ותשואות'
        WHEN ci.content_key = 'tenders_metrics_title' AND lang.code = 'ru' THEN 'Инвестиции и доходность'
        WHEN ci.content_key = 'tenders_metrics_prospects_label' AND lang.code = 'en' THEN 'Expected Annual Income'
        WHEN ci.content_key = 'tenders_metrics_prospects_label' AND lang.code = 'he' THEN 'הכנסה שנתית צפויה'
        WHEN ci.content_key = 'tenders_metrics_prospects_label' AND lang.code = 'ru' THEN 'Ожидаемый годовой доход'
        WHEN ci.content_key = 'tenders_metrics_prospects_value' AND lang.code = 'en' THEN '₪150,000 - ₪500,000'
        WHEN ci.content_key = 'tenders_metrics_prospects_value' AND lang.code = 'he' THEN '₪150,000 - ₪500,000'
        WHEN ci.content_key = 'tenders_metrics_prospects_value' AND lang.code = 'ru' THEN '₪150,000 - ₪500,000'
        WHEN ci.content_key = 'tenders_metrics_investment_label' AND lang.code = 'en' THEN 'Initial Investment'
        WHEN ci.content_key = 'tenders_metrics_investment_label' AND lang.code = 'he' THEN 'השקעה ראשונית'
        WHEN ci.content_key = 'tenders_metrics_investment_label' AND lang.code = 'ru' THEN 'Первоначальные инвестиции'
        WHEN ci.content_key = 'tenders_metrics_investment_display' AND lang.code = 'en' THEN 'From ₪50,000'
        WHEN ci.content_key = 'tenders_metrics_investment_display' AND lang.code = 'he' THEN 'החל מ-₪50,000'
        WHEN ci.content_key = 'tenders_metrics_investment_display' AND lang.code = 'ru' THEN 'От ₪50,000'
        WHEN ci.content_key = 'tenders_metrics_payback_label' AND lang.code = 'en' THEN 'Payback Period'
        WHEN ci.content_key = 'tenders_metrics_payback_label' AND lang.code = 'he' THEN 'תקופת החזר'
        WHEN ci.content_key = 'tenders_metrics_payback_label' AND lang.code = 'ru' THEN 'Срок окупаемости'
        WHEN ci.content_key = 'tenders_metrics_payback_display' AND lang.code = 'en' THEN '6-12 months'
        WHEN ci.content_key = 'tenders_metrics_payback_display' AND lang.code = 'he' THEN '6-12 חודשים'
        WHEN ci.content_key = 'tenders_metrics_payback_display' AND lang.code = 'ru' THEN '6-12 месяцев'
        WHEN ci.content_key = 'tenders_metrics_disclaimer' AND lang.code = 'en' THEN 'Results depend on individual performance and market conditions'
        WHEN ci.content_key = 'tenders_metrics_disclaimer' AND lang.code = 'he' THEN 'התוצאות תלויות בביצועים אישיים ובתנאי השוק'
        WHEN ci.content_key = 'tenders_metrics_disclaimer' AND lang.code = 'ru' THEN 'Результаты зависят от индивидуальной производительности и рыночных условий'
        WHEN ci.content_key = 'tenders_metrics_button' AND lang.code = 'en' THEN 'Get Investment Details'
        WHEN ci.content_key = 'tenders_metrics_button' AND lang.code = 'he' THEN 'קבלו פרטי השקעה'
        WHEN ci.content_key = 'tenders_metrics_button' AND lang.code = 'ru' THEN 'Получить детали инвестиций'
    END,
    'active',
    NOW(),
    NOW()
FROM content_items ci
CROSS JOIN (VALUES ('en'), ('he'), ('ru')) AS lang(code)
WHERE ci.screen_location = 'tenders_for_brokers' 
    AND ci.content_key LIKE 'tenders_metrics%';

-- 3. TEMPORARY FRANCHISE (Real-Estate-Brokerage) PAGE CONTENT
-- Note: This page already uses useContentApi hook, so we'll migrate the content it expects

-- Main Hero Section
INSERT INTO content_items (screen_location, content_key, component_type, category, is_active, created_at, updated_at)
VALUES 
('temporary_franchise', 'franchise_main_hero_title', 'heading', 'main_hero', true, NOW(), NOW()),
('temporary_franchise', 'franchise_main_hero_benefit_income', 'text', 'main_hero', true, NOW(), NOW()),
('temporary_franchise', 'franchise_main_hero_benefit_turnover', 'text', 'main_hero', true, NOW(), NOW()),
('temporary_franchise', 'franchise_main_hero_benefit_roi', 'text', 'main_hero', true, NOW(), NOW()),
('temporary_franchise', 'franchise_main_hero_cta', 'button', 'main_hero', true, NOW(), NOW());

INSERT INTO content_translations (content_item_id, language_code, content_value, status, created_at, updated_at)
SELECT 
    ci.id,
    lang.code,
    CASE 
        WHEN ci.content_key = 'franchise_main_hero_title' AND lang.code = 'en' THEN 'Open a Real Estate Franchise Office'
        WHEN ci.content_key = 'franchise_main_hero_title' AND lang.code = 'he' THEN 'פתחו משרד זכיינות נדל"ן'
        WHEN ci.content_key = 'franchise_main_hero_title' AND lang.code = 'ru' THEN 'Откройте франчайзинговый офис недвижимости'
        WHEN ci.content_key = 'franchise_main_hero_benefit_income' AND lang.code = 'en' THEN 'Monthly income from ₪30,000'
        WHEN ci.content_key = 'franchise_main_hero_benefit_income' AND lang.code = 'he' THEN 'הכנסה חודשית מ-₪30,000'
        WHEN ci.content_key = 'franchise_main_hero_benefit_income' AND lang.code = 'ru' THEN 'Ежемесячный доход от ₪30,000'
        WHEN ci.content_key = 'franchise_main_hero_benefit_turnover' AND lang.code = 'en' THEN 'Annual turnover ₪2-5 million'
        WHEN ci.content_key = 'franchise_main_hero_benefit_turnover' AND lang.code = 'he' THEN 'מחזור שנתי ₪2-5 מיליון'
        WHEN ci.content_key = 'franchise_main_hero_benefit_turnover' AND lang.code = 'ru' THEN 'Годовой оборот ₪2-5 млн'
        WHEN ci.content_key = 'franchise_main_hero_benefit_roi' AND lang.code = 'en' THEN 'ROI within 12-18 months'
        WHEN ci.content_key = 'franchise_main_hero_benefit_roi' AND lang.code = 'he' THEN 'החזר השקעה תוך 12-18 חודשים'
        WHEN ci.content_key = 'franchise_main_hero_benefit_roi' AND lang.code = 'ru' THEN 'Окупаемость за 12-18 месяцев'
        WHEN ci.content_key = 'franchise_main_hero_cta' AND lang.code = 'en' THEN 'Start Your Franchise'
        WHEN ci.content_key = 'franchise_main_hero_cta' AND lang.code = 'he' THEN 'התחילו את הזכיינות שלכם'
        WHEN ci.content_key = 'franchise_main_hero_cta' AND lang.code = 'ru' THEN 'Начните свою франшизу'
    END,
    'active',
    NOW(),
    NOW()
FROM content_items ci
CROSS JOIN (VALUES ('en'), ('he'), ('ru')) AS lang(code)
WHERE ci.screen_location = 'temporary_franchise' 
    AND ci.content_key LIKE 'franchise_main_hero%';

-- Hero Section (secondary)
INSERT INTO content_items (screen_location, content_key, component_type, category, is_active, created_at, updated_at)
VALUES 
('temporary_franchise', 'franchise_hero_title', 'heading', 'hero', true, NOW(), NOW()),
('temporary_franchise', 'franchise_hero_description', 'text', 'hero', true, NOW(), NOW()),
('temporary_franchise', 'franchise_hero_cta', 'button', 'hero', true, NOW(), NOW());

INSERT INTO content_translations (content_item_id, language_code, content_value, status, created_at, updated_at)
SELECT 
    ci.id,
    lang.code,
    CASE 
        WHEN ci.content_key = 'franchise_hero_title' AND lang.code = 'en' THEN 'Join TechRealt Real Estate Network'
        WHEN ci.content_key = 'franchise_hero_title' AND lang.code = 'he' THEN 'הצטרפו לרשת הנדל"ן טקריאלט'
        WHEN ci.content_key = 'franchise_hero_title' AND lang.code = 'ru' THEN 'Присоединяйтесь к сети недвижимости TechRealt'
        WHEN ci.content_key = 'franchise_hero_description' AND lang.code = 'en' THEN 'Leading real estate franchise with proven success model'
        WHEN ci.content_key = 'franchise_hero_description' AND lang.code = 'he' THEN 'זכיינות נדל"ן מובילה עם מודל הצלחה מוכח'
        WHEN ci.content_key = 'franchise_hero_description' AND lang.code = 'ru' THEN 'Ведущая франшиза недвижимости с проверенной моделью успеха'
        WHEN ci.content_key = 'franchise_hero_cta' AND lang.code = 'en' THEN 'Learn More'
        WHEN ci.content_key = 'franchise_hero_cta' AND lang.code = 'he' THEN 'למידע נוסף'
        WHEN ci.content_key = 'franchise_hero_cta' AND lang.code = 'ru' THEN 'Узнать больше'
    END,
    'active',
    NOW(),
    NOW()
FROM content_items ci
CROSS JOIN (VALUES ('en'), ('he'), ('ru')) AS lang(code)
WHERE ci.screen_location = 'temporary_franchise' 
    AND ci.content_key IN ('franchise_hero_title', 'franchise_hero_description', 'franchise_hero_cta');

-- Client Sources Section
INSERT INTO content_items (screen_location, content_key, component_type, category, is_active, created_at, updated_at)
VALUES 
('temporary_franchise', 'franchise_client_sources_title', 'heading', 'client_sources', true, NOW(), NOW()),
('temporary_franchise', 'franchise_client_sources_description', 'text', 'client_sources', true, NOW(), NOW()),
('temporary_franchise', 'franchise_client_service_mortgage_calc', 'text', 'client_sources', true, NOW(), NOW()),
('temporary_franchise', 'franchise_client_service_mortgage_refinance', 'text', 'client_sources', true, NOW(), NOW()),
('temporary_franchise', 'franchise_client_service_credit_calc', 'text', 'client_sources', true, NOW(), NOW()),
('temporary_franchise', 'franchise_client_service_credit_refinance', 'text', 'client_sources', true, NOW(), NOW());

INSERT INTO content_translations (content_item_id, language_code, content_value, status, created_at, updated_at)
SELECT 
    ci.id,
    lang.code,
    CASE 
        WHEN ci.content_key = 'franchise_client_sources_title' AND lang.code = 'en' THEN 'Multiple Revenue Streams'
        WHEN ci.content_key = 'franchise_client_sources_title' AND lang.code = 'he' THEN 'מקורות הכנסה מרובים'
        WHEN ci.content_key = 'franchise_client_sources_title' AND lang.code = 'ru' THEN 'Множественные источники дохода'
        WHEN ci.content_key = 'franchise_client_sources_description' AND lang.code = 'en' THEN 'Access to Bankimonline platform with thousands of monthly users'
        WHEN ci.content_key = 'franchise_client_sources_description' AND lang.code = 'he' THEN 'גישה לפלטפורמת בנקימאונליין עם אלפי משתמשים חודשיים'
        WHEN ci.content_key = 'franchise_client_sources_description' AND lang.code = 'ru' THEN 'Доступ к платформе Bankimonline с тысячами ежемесячных пользователей'
        WHEN ci.content_key = 'franchise_client_service_mortgage_calc' AND lang.code = 'en' THEN 'Mortgage Calculator'
        WHEN ci.content_key = 'franchise_client_service_mortgage_calc' AND lang.code = 'he' THEN 'מחשבון משכנתא'
        WHEN ci.content_key = 'franchise_client_service_mortgage_calc' AND lang.code = 'ru' THEN 'Ипотечный калькулятор'
        WHEN ci.content_key = 'franchise_client_service_mortgage_refinance' AND lang.code = 'en' THEN 'Mortgage Refinancing'
        WHEN ci.content_key = 'franchise_client_service_mortgage_refinance' AND lang.code = 'he' THEN 'מיחזור משכנתא'
        WHEN ci.content_key = 'franchise_client_service_mortgage_refinance' AND lang.code = 'ru' THEN 'Рефинансирование ипотеки'
        WHEN ci.content_key = 'franchise_client_service_credit_calc' AND lang.code = 'en' THEN 'Credit Calculator'
        WHEN ci.content_key = 'franchise_client_service_credit_calc' AND lang.code = 'he' THEN 'מחשבון אשראי'
        WHEN ci.content_key = 'franchise_client_service_credit_calc' AND lang.code = 'ru' THEN 'Кредитный калькулятор'
        WHEN ci.content_key = 'franchise_client_service_credit_refinance' AND lang.code = 'en' THEN 'Credit Refinancing'
        WHEN ci.content_key = 'franchise_client_service_credit_refinance' AND lang.code = 'he' THEN 'מיחזור אשראי'
        WHEN ci.content_key = 'franchise_client_service_credit_refinance' AND lang.code = 'ru' THEN 'Рефинансирование кредита'
    END,
    'active',
    NOW(),
    NOW()
FROM content_items ci
CROSS JOIN (VALUES ('en'), ('he'), ('ru')) AS lang(code)
WHERE ci.screen_location = 'temporary_franchise' 
    AND ci.content_key LIKE 'franchise_client%';

-- Partnership Section
INSERT INTO content_items (screen_location, content_key, component_type, category, is_active, created_at, updated_at)
VALUES 
('temporary_franchise', 'franchise_partnership_title', 'heading', 'partnership', true, NOW(), NOW()),
('temporary_franchise', 'franchise_partnership_description', 'text', 'partnership', true, NOW(), NOW()),
('temporary_franchise', 'franchise_partnership_service_buy', 'text', 'partnership', true, NOW(), NOW()),
('temporary_franchise', 'franchise_partnership_service_rent', 'text', 'partnership', true, NOW(), NOW()),
('temporary_franchise', 'franchise_partnership_service_sell', 'text', 'partnership', true, NOW(), NOW()),
('temporary_franchise', 'franchise_partnership_service_lease', 'text', 'partnership', true, NOW(), NOW()),
('temporary_franchise', 'franchise_partnership_cta', 'button', 'partnership', true, NOW(), NOW());

INSERT INTO content_translations (content_item_id, language_code, content_value, status, created_at, updated_at)
SELECT 
    ci.id,
    lang.code,
    CASE 
        WHEN ci.content_key = 'franchise_partnership_title' AND lang.code = 'en' THEN 'Complete Real Estate Services'
        WHEN ci.content_key = 'franchise_partnership_title' AND lang.code = 'he' THEN 'שירותי נדל"ן מקיפים'
        WHEN ci.content_key = 'franchise_partnership_title' AND lang.code = 'ru' THEN 'Полный спектр услуг недвижимости'
        WHEN ci.content_key = 'franchise_partnership_description' AND lang.code = 'en' THEN 'Offer comprehensive real estate solutions to your clients'
        WHEN ci.content_key = 'franchise_partnership_description' AND lang.code = 'he' THEN 'הציעו פתרונות נדל"ן מקיפים ללקוחות שלכם'
        WHEN ci.content_key = 'franchise_partnership_description' AND lang.code = 'ru' THEN 'Предлагайте комплексные решения недвижимости вашим клиентам'
        WHEN ci.content_key = 'franchise_partnership_service_buy' AND lang.code = 'en' THEN 'Property Purchase'
        WHEN ci.content_key = 'franchise_partnership_service_buy' AND lang.code = 'he' THEN 'רכישת נכס'
        WHEN ci.content_key = 'franchise_partnership_service_buy' AND lang.code = 'ru' THEN 'Покупка недвижимости'
        WHEN ci.content_key = 'franchise_partnership_service_rent' AND lang.code = 'en' THEN 'Property Rental'
        WHEN ci.content_key = 'franchise_partnership_service_rent' AND lang.code = 'he' THEN 'השכרת נכס'
        WHEN ci.content_key = 'franchise_partnership_service_rent' AND lang.code = 'ru' THEN 'Аренда недвижимости'
        WHEN ci.content_key = 'franchise_partnership_service_sell' AND lang.code = 'en' THEN 'Property Sale'
        WHEN ci.content_key = 'franchise_partnership_service_sell' AND lang.code = 'he' THEN 'מכירת נכס'
        WHEN ci.content_key = 'franchise_partnership_service_sell' AND lang.code = 'ru' THEN 'Продажа недвижимости'
        WHEN ci.content_key = 'franchise_partnership_service_lease' AND lang.code = 'en' THEN 'Property Management'
        WHEN ci.content_key = 'franchise_partnership_service_lease' AND lang.code = 'he' THEN 'ניהול נכסים'
        WHEN ci.content_key = 'franchise_partnership_service_lease' AND lang.code = 'ru' THEN 'Управление недвижимостью'
        WHEN ci.content_key = 'franchise_partnership_cta' AND lang.code = 'en' THEN 'Join Our Network'
        WHEN ci.content_key = 'franchise_partnership_cta' AND lang.code = 'he' THEN 'הצטרפו לרשת שלנו'
        WHEN ci.content_key = 'franchise_partnership_cta' AND lang.code = 'ru' THEN 'Присоединяйтесь к нашей сети'
    END,
    'active',
    NOW(),
    NOW()
FROM content_items ci
CROSS JOIN (VALUES ('en'), ('he'), ('ru')) AS lang(code)
WHERE ci.screen_location = 'temporary_franchise' 
    AND ci.content_key LIKE 'franchise_partnership%';

-- Franchise Includes Section (Accordion content)
INSERT INTO content_items (screen_location, content_key, component_type, category, is_active, created_at, updated_at)
VALUES 
('temporary_franchise', 'franchise_includes_title', 'heading', 'includes', true, NOW(), NOW()),
-- Turnkey Business
('temporary_franchise', 'franchise_includes_turnkey_title', 'option', 'includes', true, NOW(), NOW()),
('temporary_franchise', 'franchise_includes_turnkey_benefit_office', 'option', 'includes', true, NOW(), NOW()),
('temporary_franchise', 'franchise_includes_turnkey_benefit_team', 'option', 'includes', true, NOW(), NOW()),
('temporary_franchise', 'franchise_includes_turnkey_benefit_brand', 'option', 'includes', true, NOW(), NOW()),
('temporary_franchise', 'franchise_includes_turnkey_benefit_marketing', 'option', 'includes', true, NOW(), NOW()),
-- Digital Platform
('temporary_franchise', 'franchise_includes_digital_title', 'option', 'includes', true, NOW(), NOW()),
('temporary_franchise', 'franchise_includes_digital_platform', 'option', 'includes', true, NOW(), NOW()),
('temporary_franchise', 'franchise_includes_digital_tools', 'option', 'includes', true, NOW(), NOW()),
('temporary_franchise', 'franchise_includes_digital_support', 'option', 'includes', true, NOW(), NOW()),
-- Training & Support
('temporary_franchise', 'franchise_includes_support_title', 'option', 'includes', true, NOW(), NOW()),
('temporary_franchise', 'franchise_includes_support_training', 'option', 'includes', true, NOW(), NOW()),
('temporary_franchise', 'franchise_includes_support_phone', 'option', 'includes', true, NOW(), NOW()),
('temporary_franchise', 'franchise_includes_support_consultation', 'option', 'includes', true, NOW(), NOW()),
-- CTA
('temporary_franchise', 'franchise_includes_cta', 'button', 'includes', true, NOW(), NOW());

INSERT INTO content_translations (content_item_id, language_code, content_value, status, created_at, updated_at)
SELECT 
    ci.id,
    lang.code,
    CASE 
        WHEN ci.content_key = 'franchise_includes_title' AND lang.code = 'en' THEN 'What Your Franchise Includes'
        WHEN ci.content_key = 'franchise_includes_title' AND lang.code = 'he' THEN 'מה כולל הזיכיון שלכם'
        WHEN ci.content_key = 'franchise_includes_title' AND lang.code = 'ru' THEN 'Что включает ваша франшиза'
        -- Turnkey Business
        WHEN ci.content_key = 'franchise_includes_turnkey_title' AND lang.code = 'en' THEN 'Turnkey Business Solution'
        WHEN ci.content_key = 'franchise_includes_turnkey_title' AND lang.code = 'he' THEN 'פתרון עסקי מוכן'
        WHEN ci.content_key = 'franchise_includes_turnkey_title' AND lang.code = 'ru' THEN 'Готовое бизнес-решение'
        WHEN ci.content_key = 'franchise_includes_turnkey_benefit_office' AND lang.code = 'en' THEN 'Fully equipped office setup'
        WHEN ci.content_key = 'franchise_includes_turnkey_benefit_office' AND lang.code = 'he' THEN 'הקמת משרד מאובזר במלואו'
        WHEN ci.content_key = 'franchise_includes_turnkey_benefit_office' AND lang.code = 'ru' THEN 'Полностью оборудованный офис'
        WHEN ci.content_key = 'franchise_includes_turnkey_benefit_team' AND lang.code = 'en' THEN 'Recruitment and training support'
        WHEN ci.content_key = 'franchise_includes_turnkey_benefit_team' AND lang.code = 'he' THEN 'תמיכה בגיוס והכשרה'
        WHEN ci.content_key = 'franchise_includes_turnkey_benefit_team' AND lang.code = 'ru' THEN 'Поддержка в найме и обучении'
        WHEN ci.content_key = 'franchise_includes_turnkey_benefit_brand' AND lang.code = 'en' THEN 'Established brand recognition'
        WHEN ci.content_key = 'franchise_includes_turnkey_benefit_brand' AND lang.code = 'he' THEN 'זיהוי מותג מבוסס'
        WHEN ci.content_key = 'franchise_includes_turnkey_benefit_brand' AND lang.code = 'ru' THEN 'Узнаваемость бренда'
        WHEN ci.content_key = 'franchise_includes_turnkey_benefit_marketing' AND lang.code = 'en' THEN 'Marketing and advertising support'
        WHEN ci.content_key = 'franchise_includes_turnkey_benefit_marketing' AND lang.code = 'he' THEN 'תמיכה בשיווק ופרסום'
        WHEN ci.content_key = 'franchise_includes_turnkey_benefit_marketing' AND lang.code = 'ru' THEN 'Маркетинговая и рекламная поддержка'
        -- Digital Platform
        WHEN ci.content_key = 'franchise_includes_digital_title' AND lang.code = 'en' THEN 'Digital Technology Platform'
        WHEN ci.content_key = 'franchise_includes_digital_title' AND lang.code = 'he' THEN 'פלטפורמה טכנולוגית דיגיטלית'
        WHEN ci.content_key = 'franchise_includes_digital_title' AND lang.code = 'ru' THEN 'Цифровая технологическая платформа'
        WHEN ci.content_key = 'franchise_includes_digital_platform' AND lang.code = 'en' THEN 'Advanced CRM system'
        WHEN ci.content_key = 'franchise_includes_digital_platform' AND lang.code = 'he' THEN 'מערכת CRM מתקדמת'
        WHEN ci.content_key = 'franchise_includes_digital_platform' AND lang.code = 'ru' THEN 'Продвинутая CRM-система'
        WHEN ci.content_key = 'franchise_includes_digital_tools' AND lang.code = 'en' THEN 'Professional real estate tools'
        WHEN ci.content_key = 'franchise_includes_digital_tools' AND lang.code = 'he' THEN 'כלי נדל"ן מקצועיים'
        WHEN ci.content_key = 'franchise_includes_digital_tools' AND lang.code = 'ru' THEN 'Профессиональные инструменты недвижимости'
        WHEN ci.content_key = 'franchise_includes_digital_support' AND lang.code = 'en' THEN 'Technical support and updates'
        WHEN ci.content_key = 'franchise_includes_digital_support' AND lang.code = 'he' THEN 'תמיכה טכנית ועדכונים'
        WHEN ci.content_key = 'franchise_includes_digital_support' AND lang.code = 'ru' THEN 'Техническая поддержка и обновления'
        -- Training & Support
        WHEN ci.content_key = 'franchise_includes_support_title' AND lang.code = 'en' THEN 'Comprehensive Training & Support'
        WHEN ci.content_key = 'franchise_includes_support_title' AND lang.code = 'he' THEN 'הכשרה ותמיכה מקיפה'
        WHEN ci.content_key = 'franchise_includes_support_title' AND lang.code = 'ru' THEN 'Комплексное обучение и поддержка'
        WHEN ci.content_key = 'franchise_includes_support_training' AND lang.code = 'en' THEN 'Initial and ongoing training programs'
        WHEN ci.content_key = 'franchise_includes_support_training' AND lang.code = 'he' THEN 'תוכניות הכשרה ראשוניות ומתמשכות'
        WHEN ci.content_key = 'franchise_includes_support_training' AND lang.code = 'ru' THEN 'Начальные и постоянные программы обучения'
        WHEN ci.content_key = 'franchise_includes_support_phone' AND lang.code = 'en' THEN '24/7 phone support'
        WHEN ci.content_key = 'franchise_includes_support_phone' AND lang.code = 'he' THEN 'תמיכה טלפונית 24/7'
        WHEN ci.content_key = 'franchise_includes_support_phone' AND lang.code = 'ru' THEN 'Телефонная поддержка 24/7'
        WHEN ci.content_key = 'franchise_includes_support_consultation' AND lang.code = 'en' THEN 'Business development consultation'
        WHEN ci.content_key = 'franchise_includes_support_consultation' AND lang.code = 'he' THEN 'ייעוץ לפיתוח עסקי'
        WHEN ci.content_key = 'franchise_includes_support_consultation' AND lang.code = 'ru' THEN 'Консультации по развитию бизнеса'
        WHEN ci.content_key = 'franchise_includes_cta' AND lang.code = 'en' THEN 'Get Franchise Details'
        WHEN ci.content_key = 'franchise_includes_cta' AND lang.code = 'he' THEN 'קבלו פרטי זיכיון'
        WHEN ci.content_key = 'franchise_includes_cta' AND lang.code = 'ru' THEN 'Получить детали франшизы'
    END,
    'active',
    NOW(),
    NOW()
FROM content_items ci
CROSS JOIN (VALUES ('en'), ('he'), ('ru')) AS lang(code)
WHERE ci.screen_location = 'temporary_franchise' 
    AND ci.content_key LIKE 'franchise_includes%';

-- How to Open Franchise Steps
INSERT INTO content_items (screen_location, content_key, component_type, category, is_active, created_at, updated_at)
VALUES 
('temporary_franchise', 'franchise_how_to_open_title', 'heading', 'steps', true, NOW(), NOW()),
-- Step 1
('temporary_franchise', 'franchise_step_1_title', 'option', 'steps', true, NOW(), NOW()),
('temporary_franchise', 'franchise_step_1_description', 'option', 'steps', true, NOW(), NOW()),
-- Step 2
('temporary_franchise', 'franchise_step_2_title', 'option', 'steps', true, NOW(), NOW()),
('temporary_franchise', 'franchise_step_2_description', 'option', 'steps', true, NOW(), NOW()),
-- Step 3
('temporary_franchise', 'franchise_step_3_title', 'option', 'steps', true, NOW(), NOW()),
('temporary_franchise', 'franchise_step_3_description', 'option', 'steps', true, NOW(), NOW()),
-- Step 4
('temporary_franchise', 'franchise_step_4_title', 'option', 'steps', true, NOW(), NOW()),
('temporary_franchise', 'franchise_step_4_description', 'option', 'steps', true, NOW(), NOW()),
-- Step 5
('temporary_franchise', 'franchise_step_5_title', 'option', 'steps', true, NOW(), NOW()),
('temporary_franchise', 'franchise_step_5_description', 'option', 'steps', true, NOW(), NOW());

INSERT INTO content_translations (content_item_id, language_code, content_value, status, created_at, updated_at)
SELECT 
    ci.id,
    lang.code,
    CASE 
        WHEN ci.content_key = 'franchise_how_to_open_title' AND lang.code = 'en' THEN 'How to Open Your Franchise'
        WHEN ci.content_key = 'franchise_how_to_open_title' AND lang.code = 'he' THEN 'איך לפתוח את הזיכיון שלכם'
        WHEN ci.content_key = 'franchise_how_to_open_title' AND lang.code = 'ru' THEN 'Как открыть вашу франшизу'
        -- Step 1
        WHEN ci.content_key = 'franchise_step_1_title' AND lang.code = 'en' THEN 'Submit Application'
        WHEN ci.content_key = 'franchise_step_1_title' AND lang.code = 'he' THEN 'הגישו בקשה'
        WHEN ci.content_key = 'franchise_step_1_title' AND lang.code = 'ru' THEN 'Подать заявку'
        WHEN ci.content_key = 'franchise_step_1_description' AND lang.code = 'en' THEN 'Complete our online franchise application form'
        WHEN ci.content_key = 'franchise_step_1_description' AND lang.code = 'he' THEN 'השלימו את טופס הבקשה המקוון לזיכיון'
        WHEN ci.content_key = 'franchise_step_1_description' AND lang.code = 'ru' THEN 'Заполните нашу онлайн-форму заявки на франшизу'
        -- Step 2
        WHEN ci.content_key = 'franchise_step_2_title' AND lang.code = 'en' THEN 'Evaluation Meeting'
        WHEN ci.content_key = 'franchise_step_2_title' AND lang.code = 'he' THEN 'פגישת הערכה'
        WHEN ci.content_key = 'franchise_step_2_title' AND lang.code = 'ru' THEN 'Оценочная встреча'
        WHEN ci.content_key = 'franchise_step_2_description' AND lang.code = 'en' THEN 'Meet with our franchise team for mutual evaluation'
        WHEN ci.content_key = 'franchise_step_2_description' AND lang.code = 'he' THEN 'פגשו את צוות הזיכיון שלנו להערכה הדדית'
        WHEN ci.content_key = 'franchise_step_2_description' AND lang.code = 'ru' THEN 'Встреча с нашей командой франчайзинга для взаимной оценки'
        -- Step 3
        WHEN ci.content_key = 'franchise_step_3_title' AND lang.code = 'en' THEN 'Sign Agreement'
        WHEN ci.content_key = 'franchise_step_3_title' AND lang.code = 'he' THEN 'חתימה על הסכם'
        WHEN ci.content_key = 'franchise_step_3_title' AND lang.code = 'ru' THEN 'Подписание договора'
        WHEN ci.content_key = 'franchise_step_3_description' AND lang.code = 'en' THEN 'Review and sign the franchise agreement'
        WHEN ci.content_key = 'franchise_step_3_description' AND lang.code = 'he' THEN 'עיון וחתימה על הסכם הזיכיון'
        WHEN ci.content_key = 'franchise_step_3_description' AND lang.code = 'ru' THEN 'Изучение и подписание франчайзингового договора'
        -- Step 4
        WHEN ci.content_key = 'franchise_step_4_title' AND lang.code = 'en' THEN 'Setup & Training'
        WHEN ci.content_key = 'franchise_step_4_title' AND lang.code = 'he' THEN 'הקמה והכשרה'
        WHEN ci.content_key = 'franchise_step_4_title' AND lang.code = 'ru' THEN 'Настройка и обучение'
        WHEN ci.content_key = 'franchise_step_4_description' AND lang.code = 'en' THEN 'Set up your office and complete training program'
        WHEN ci.content_key = 'franchise_step_4_description' AND lang.code = 'he' THEN 'הקימו את המשרד והשלימו תוכנית הכשרה'
        WHEN ci.content_key = 'franchise_step_4_description' AND lang.code = 'ru' THEN 'Настройте офис и пройдите программу обучения'
        -- Step 5
        WHEN ci.content_key = 'franchise_step_5_title' AND lang.code = 'en' THEN 'Grand Opening'
        WHEN ci.content_key = 'franchise_step_5_title' AND lang.code = 'he' THEN 'פתיחה חגיגית'
        WHEN ci.content_key = 'franchise_step_5_title' AND lang.code = 'ru' THEN 'Торжественное открытие'
        WHEN ci.content_key = 'franchise_step_5_description' AND lang.code = 'en' THEN 'Launch your franchise with full support'
        WHEN ci.content_key = 'franchise_step_5_description' AND lang.code = 'he' THEN 'השיקו את הזיכיון שלכם עם תמיכה מלאה'
        WHEN ci.content_key = 'franchise_step_5_description' AND lang.code = 'ru' THEN 'Запустите вашу франшизу с полной поддержкой'
    END,
    'active',
    NOW(),
    NOW()
FROM content_items ci
CROSS JOIN (VALUES ('en'), ('he'), ('ru')) AS lang(code)
WHERE ci.screen_location = 'temporary_franchise' 
    AND ci.content_key LIKE 'franchise_step%' OR ci.content_key = 'franchise_how_to_open_title';

-- Franchise Pricing Section
INSERT INTO content_items (screen_location, content_key, component_type, category, is_active, created_at, updated_at)
VALUES 
('temporary_franchise', 'franchise_pricing_title', 'heading', 'pricing', true, NOW(), NOW()),
('temporary_franchise', 'franchise_pricing_investments', 'text', 'pricing', true, NOW(), NOW()),
('temporary_franchise', 'franchise_pricing_investments_value', 'text', 'pricing', true, NOW(), NOW()),
('temporary_franchise', 'franchise_pricing_income', 'text', 'pricing', true, NOW(), NOW()),
('temporary_franchise', 'franchise_pricing_income_value', 'text', 'pricing', true, NOW(), NOW()),
('temporary_franchise', 'franchise_pricing_roi', 'text', 'pricing', true, NOW(), NOW()),
('temporary_franchise', 'franchise_pricing_roi_value', 'text', 'pricing', true, NOW(), NOW()),
('temporary_franchise', 'franchise_pricing_note', 'text', 'pricing', true, NOW(), NOW()),
('temporary_franchise', 'franchise_pricing_cta', 'button', 'pricing', true, NOW(), NOW());

INSERT INTO content_translations (content_item_id, language_code, content_value, status, created_at, updated_at)
SELECT 
    ci.id,
    lang.code,
    CASE 
        WHEN ci.content_key = 'franchise_pricing_title' AND lang.code = 'en' THEN 'Investment & Returns'
        WHEN ci.content_key = 'franchise_pricing_title' AND lang.code = 'he' THEN 'השקעה ותשואות'
        WHEN ci.content_key = 'franchise_pricing_title' AND lang.code = 'ru' THEN 'Инвестиции и доходность'
        WHEN ci.content_key = 'franchise_pricing_investments' AND lang.code = 'en' THEN 'Initial Investment'
        WHEN ci.content_key = 'franchise_pricing_investments' AND lang.code = 'he' THEN 'השקעה ראשונית'
        WHEN ci.content_key = 'franchise_pricing_investments' AND lang.code = 'ru' THEN 'Первоначальные инвестиции'
        WHEN ci.content_key = 'franchise_pricing_investments_value' AND lang.code = 'en' THEN '₪150,000 - ₪300,000'
        WHEN ci.content_key = 'franchise_pricing_investments_value' AND lang.code = 'he' THEN '₪150,000 - ₪300,000'
        WHEN ci.content_key = 'franchise_pricing_investments_value' AND lang.code = 'ru' THEN '₪150,000 - ₪300,000'
        WHEN ci.content_key = 'franchise_pricing_income' AND lang.code = 'en' THEN 'Expected Monthly Income'
        WHEN ci.content_key = 'franchise_pricing_income' AND lang.code = 'he' THEN 'הכנסה חודשית צפויה'
        WHEN ci.content_key = 'franchise_pricing_income' AND lang.code = 'ru' THEN 'Ожидаемый месячный доход'
        WHEN ci.content_key = 'franchise_pricing_income_value' AND lang.code = 'en' THEN '₪30,000 - ₪100,000'
        WHEN ci.content_key = 'franchise_pricing_income_value' AND lang.code = 'he' THEN '₪30,000 - ₪100,000'
        WHEN ci.content_key = 'franchise_pricing_income_value' AND lang.code = 'ru' THEN '₪30,000 - ₪100,000'
        WHEN ci.content_key = 'franchise_pricing_roi' AND lang.code = 'en' THEN 'Return on Investment'
        WHEN ci.content_key = 'franchise_pricing_roi' AND lang.code = 'he' THEN 'החזר השקעה'
        WHEN ci.content_key = 'franchise_pricing_roi' AND lang.code = 'ru' THEN 'Окупаемость инвестиций'
        WHEN ci.content_key = 'franchise_pricing_roi_value' AND lang.code = 'en' THEN '12-18 months'
        WHEN ci.content_key = 'franchise_pricing_roi_value' AND lang.code = 'he' THEN '12-18 חודשים'
        WHEN ci.content_key = 'franchise_pricing_roi_value' AND lang.code = 'ru' THEN '12-18 месяцев'
        WHEN ci.content_key = 'franchise_pricing_note' AND lang.code = 'en' THEN 'Results vary based on location and individual performance'
        WHEN ci.content_key = 'franchise_pricing_note' AND lang.code = 'he' THEN 'התוצאות משתנות בהתאם למיקום וביצועים אישיים'
        WHEN ci.content_key = 'franchise_pricing_note' AND lang.code = 'ru' THEN 'Результаты варьируются в зависимости от местоположения и личных результатов'
        WHEN ci.content_key = 'franchise_pricing_cta' AND lang.code = 'en' THEN 'Get Financial Details'
        WHEN ci.content_key = 'franchise_pricing_cta' AND lang.code = 'he' THEN 'קבלו פרטים פיננסיים'
        WHEN ci.content_key = 'franchise_pricing_cta' AND lang.code = 'ru' THEN 'Получить финансовые детали'
    END,
    'active',
    NOW(),
    NOW()
FROM content_items ci
CROSS JOIN (VALUES ('en'), ('he'), ('ru')) AS lang(code)
WHERE ci.screen_location = 'temporary_franchise' 
    AND ci.content_key LIKE 'franchise_pricing%';

-- Final CTA Section
INSERT INTO content_items (screen_location, content_key, component_type, category, is_active, created_at, updated_at)
VALUES 
('temporary_franchise', 'franchise_final_cta_title', 'heading', 'final_cta', true, NOW(), NOW()),
('temporary_franchise', 'franchise_final_cta_button', 'button', 'final_cta', true, NOW(), NOW()),
('temporary_franchise', 'franchise_final_cta_arrow', 'text', 'final_cta', true, NOW(), NOW());

INSERT INTO content_translations (content_item_id, language_code, content_value, status, created_at, updated_at)
SELECT 
    ci.id,
    lang.code,
    CASE 
        WHEN ci.content_key = 'franchise_final_cta_title' AND lang.code = 'en' THEN 'Ready to Start Your<br/>Real Estate Franchise?'
        WHEN ci.content_key = 'franchise_final_cta_title' AND lang.code = 'he' THEN 'מוכנים להתחיל את<br/>זיכיון הנדל"ן שלכם?'
        WHEN ci.content_key = 'franchise_final_cta_title' AND lang.code = 'ru' THEN 'Готовы начать вашу<br/>франшизу недвижимости?'
        WHEN ci.content_key = 'franchise_final_cta_button' AND lang.code = 'en' THEN 'Start Application'
        WHEN ci.content_key = 'franchise_final_cta_button' AND lang.code = 'he' THEN 'התחילו בקשה'
        WHEN ci.content_key = 'franchise_final_cta_button' AND lang.code = 'ru' THEN 'Начать заявку'
        WHEN ci.content_key = 'franchise_final_cta_arrow' AND lang.code = 'en' THEN '→'
        WHEN ci.content_key = 'franchise_final_cta_arrow' AND lang.code = 'he' THEN '←'
        WHEN ci.content_key = 'franchise_final_cta_arrow' AND lang.code = 'ru' THEN '→'
    END,
    'active',
    NOW(),
    NOW()
FROM content_items ci
CROSS JOIN (VALUES ('en'), ('he'), ('ru')) AS lang(code)
WHERE ci.screen_location = 'temporary_franchise' 
    AND ci.content_key LIKE 'franchise_final_cta%';

-- 4. TENDERS FOR LAWYERS PAGE CONTENT
-- Hero Section
INSERT INTO content_items (screen_location, content_key, component_type, category, is_active, created_at, updated_at)
VALUES 
('tenders_for_lawyers', 'lawyers_hero_title', 'heading', 'hero', true, NOW(), NOW()),
('tenders_for_lawyers', 'lawyers_fill_form_button', 'button', 'hero', true, NOW(), NOW()),
('tenders_for_lawyers', 'lawyers_benefit_leads_title', 'text', 'hero', true, NOW(), NOW()),
('tenders_for_lawyers', 'lawyers_benefit_partnership_title', 'text', 'hero', true, NOW(), NOW()),
('tenders_for_lawyers', 'lawyers_benefit_expansion_title', 'text', 'hero', true, NOW(), NOW());

INSERT INTO content_translations (content_item_id, language_code, content_value, status, created_at, updated_at)
SELECT 
    ci.id,
    lang.code,
    CASE 
        WHEN ci.content_key = 'lawyers_hero_title' AND lang.code = 'en' THEN 'Join Our Legal<br/>Partnership Network'
        WHEN ci.content_key = 'lawyers_hero_title' AND lang.code = 'he' THEN 'הצטרפו לרשת<br/>השותפות המשפטית שלנו'
        WHEN ci.content_key = 'lawyers_hero_title' AND lang.code = 'ru' THEN 'Присоединяйтесь к нашей<br/>юридической партнерской сети'
        WHEN ci.content_key = 'lawyers_fill_form_button' AND lang.code = 'en' THEN 'Fill Application Form'
        WHEN ci.content_key = 'lawyers_fill_form_button' AND lang.code = 'he' THEN 'מלאו טופס בקשה'
        WHEN ci.content_key = 'lawyers_fill_form_button' AND lang.code = 'ru' THEN 'Заполнить форму заявки'
        WHEN ci.content_key = 'lawyers_benefit_leads_title' AND lang.code = 'en' THEN 'Quality Leads'
        WHEN ci.content_key = 'lawyers_benefit_leads_title' AND lang.code = 'he' THEN 'לידים איכותיים'
        WHEN ci.content_key = 'lawyers_benefit_leads_title' AND lang.code = 'ru' THEN 'Качественные лиды'
        WHEN ci.content_key = 'lawyers_benefit_partnership_title' AND lang.code = 'en' THEN 'Strategic Partnership'
        WHEN ci.content_key = 'lawyers_benefit_partnership_title' AND lang.code = 'he' THEN 'שותפות אסטרטגית'
        WHEN ci.content_key = 'lawyers_benefit_partnership_title' AND lang.code = 'ru' THEN 'Стратегическое партнерство'
        WHEN ci.content_key = 'lawyers_benefit_expansion_title' AND lang.code = 'en' THEN 'Business Growth'
        WHEN ci.content_key = 'lawyers_benefit_expansion_title' AND lang.code = 'he' THEN 'צמיחה עסקית'
        WHEN ci.content_key = 'lawyers_benefit_expansion_title' AND lang.code = 'ru' THEN 'Рост бизнеса'
    END,
    'active',
    NOW(),
    NOW()
FROM content_items ci
CROSS JOIN (VALUES ('en'), ('he'), ('ru')) AS lang(code)
WHERE ci.screen_location = 'tenders_for_lawyers' 
    AND ci.content_key IN ('lawyers_hero_title', 'lawyers_fill_form_button', 'lawyers_benefit_leads_title', 
        'lawyers_benefit_partnership_title', 'lawyers_benefit_expansion_title');

-- About Section
INSERT INTO content_items (screen_location, content_key, component_type, category, is_active, created_at, updated_at)
VALUES 
('tenders_for_lawyers', 'lawyers_about_title', 'heading', 'about', true, NOW(), NOW()),
('tenders_for_lawyers', 'lawyers_about_description', 'text', 'about', true, NOW(), NOW()),
('tenders_for_lawyers', 'lawyers_about_button', 'button', 'about', true, NOW(), NOW());

INSERT INTO content_translations (content_item_id, language_code, content_value, status, created_at, updated_at)
SELECT 
    ci.id,
    lang.code,
    CASE 
        WHEN ci.content_key = 'lawyers_about_title' AND lang.code = 'en' THEN 'About TechRealt Legal Services'
        WHEN ci.content_key = 'lawyers_about_title' AND lang.code = 'he' THEN 'אודות שירותי המשפט של טקריאלט'
        WHEN ci.content_key = 'lawyers_about_title' AND lang.code = 'ru' THEN 'О юридических услугах TechRealt'
        WHEN ci.content_key = 'lawyers_about_description' AND lang.code = 'en' THEN 'Leading legal technology platform connecting lawyers with real estate and mortgage clients'
        WHEN ci.content_key = 'lawyers_about_description' AND lang.code = 'he' THEN 'פלטפורמת טכנולוגיה משפטית מובילה המחברת עורכי דין עם לקוחות נדל"ן ומשכנתאות'
        WHEN ci.content_key = 'lawyers_about_description' AND lang.code = 'ru' THEN 'Ведущая юридическая технологическая платформа, соединяющая юристов с клиентами недвижимости и ипотеки'
        WHEN ci.content_key = 'lawyers_about_button' AND lang.code = 'en' THEN 'Join Our Network'
        WHEN ci.content_key = 'lawyers_about_button' AND lang.code = 'he' THEN 'הצטרפו לרשת שלנו'
        WHEN ci.content_key = 'lawyers_about_button' AND lang.code = 'ru' THEN 'Присоединиться к нашей сети'
    END,
    'active',
    NOW(),
    NOW()
FROM content_items ci
CROSS JOIN (VALUES ('en'), ('he'), ('ru')) AS lang(code)
WHERE ci.screen_location = 'tenders_for_lawyers' 
    AND ci.content_key IN ('lawyers_about_title', 'lawyers_about_description', 'lawyers_about_button');

-- Earnings Info Section
INSERT INTO content_items (screen_location, content_key, component_type, category, is_active, created_at, updated_at)
VALUES 
('tenders_for_lawyers', 'lawyers_earnings_info_title', 'heading', 'earnings', true, NOW(), NOW()),
('tenders_for_lawyers', 'lawyers_earnings_info_card_title', 'heading', 'earnings', true, NOW(), NOW()),
('tenders_for_lawyers', 'lawyers_earnings_info_card_description', 'text', 'earnings', true, NOW(), NOW());

INSERT INTO content_translations (content_item_id, language_code, content_value, status, created_at, updated_at)
SELECT 
    ci.id,
    lang.code,
    CASE 
        WHEN ci.content_key = 'lawyers_earnings_info_title' AND lang.code = 'en' THEN 'Earn More with Every Client'
        WHEN ci.content_key = 'lawyers_earnings_info_title' AND lang.code = 'he' THEN 'הרוויחו יותר עם כל לקוח'
        WHEN ci.content_key = 'lawyers_earnings_info_title' AND lang.code = 'ru' THEN 'Зарабатывайте больше с каждым клиентом'
        WHEN ci.content_key = 'lawyers_earnings_info_card_title' AND lang.code = 'en' THEN 'Commission Structure'
        WHEN ci.content_key = 'lawyers_earnings_info_card_title' AND lang.code = 'he' THEN 'מבנה עמלות'
        WHEN ci.content_key = 'lawyers_earnings_info_card_title' AND lang.code = 'ru' THEN 'Структура комиссий'
        WHEN ci.content_key = 'lawyers_earnings_info_card_description' AND lang.code = 'en' THEN 'Competitive commission rates for every successful transaction'
        WHEN ci.content_key = 'lawyers_earnings_info_card_description' AND lang.code = 'he' THEN 'שיעורי עמלה תחרותיים עבור כל עסקה מוצלחת'
        WHEN ci.content_key = 'lawyers_earnings_info_card_description' AND lang.code = 'ru' THEN 'Конкурентные комиссионные ставки за каждую успешную сделку'
    END,
    'active',
    NOW(),
    NOW()
FROM content_items ci
CROSS JOIN (VALUES ('en'), ('he'), ('ru')) AS lang(code)
WHERE ci.screen_location = 'tenders_for_lawyers' 
    AND ci.content_key LIKE 'lawyers_earnings_info%';

-- Collaboration Advantages Section
INSERT INTO content_items (screen_location, content_key, component_type, category, is_active, created_at, updated_at)
VALUES 
('tenders_for_lawyers', 'lawyers_collaboration_advantages_title', 'heading', 'collaboration', true, NOW(), NOW()),
('tenders_for_lawyers', 'lawyers_collaboration_advantages_subtitle', 'heading', 'collaboration', true, NOW(), NOW()),
('tenders_for_lawyers', 'lawyers_collaboration_advantage_platform', 'text', 'collaboration', true, NOW(), NOW()),
('tenders_for_lawyers', 'lawyers_collaboration_advantage_marketing', 'text', 'collaboration', true, NOW(), NOW()),
('tenders_for_lawyers', 'lawyers_collaboration_advantage_crm', 'text', 'collaboration', true, NOW(), NOW()),
('tenders_for_lawyers', 'lawyers_collaboration_floating_crm', 'text', 'collaboration', true, NOW(), NOW()),
('tenders_for_lawyers', 'lawyers_collaboration_floating_platform', 'text', 'collaboration', true, NOW(), NOW()),
('tenders_for_lawyers', 'lawyers_collaboration_get_consultation', 'button', 'collaboration', true, NOW(), NOW());

INSERT INTO content_translations (content_item_id, language_code, content_value, status, created_at, updated_at)
SELECT 
    ci.id,
    lang.code,
    CASE 
        WHEN ci.content_key = 'lawyers_collaboration_advantages_title' AND lang.code = 'en' THEN 'Partnership Advantages'
        WHEN ci.content_key = 'lawyers_collaboration_advantages_title' AND lang.code = 'he' THEN 'יתרונות השותפות'
        WHEN ci.content_key = 'lawyers_collaboration_advantages_title' AND lang.code = 'ru' THEN 'Преимущества партнерства'
        WHEN ci.content_key = 'lawyers_collaboration_advantages_subtitle' AND lang.code = 'en' THEN 'What We Provide'
        WHEN ci.content_key = 'lawyers_collaboration_advantages_subtitle' AND lang.code = 'he' THEN 'מה אנחנו מספקים'
        WHEN ci.content_key = 'lawyers_collaboration_advantages_subtitle' AND lang.code = 'ru' THEN 'Что мы предоставляем'
        WHEN ci.content_key = 'lawyers_collaboration_advantage_platform' AND lang.code = 'en' THEN 'Advanced digital platform'
        WHEN ci.content_key = 'lawyers_collaboration_advantage_platform' AND lang.code = 'he' THEN 'פלטפורמה דיגיטלית מתקדמת'
        WHEN ci.content_key = 'lawyers_collaboration_advantage_platform' AND lang.code = 'ru' THEN 'Продвинутая цифровая платформа'
        WHEN ci.content_key = 'lawyers_collaboration_advantage_marketing' AND lang.code = 'en' THEN 'Marketing and lead generation'
        WHEN ci.content_key = 'lawyers_collaboration_advantage_marketing' AND lang.code = 'he' THEN 'שיווק וייצור לידים'
        WHEN ci.content_key = 'lawyers_collaboration_advantage_marketing' AND lang.code = 'ru' THEN 'Маркетинг и генерация лидов'
        WHEN ci.content_key = 'lawyers_collaboration_advantage_crm' AND lang.code = 'en' THEN 'Professional CRM system'
        WHEN ci.content_key = 'lawyers_collaboration_advantage_crm' AND lang.code = 'he' THEN 'מערכת CRM מקצועית'
        WHEN ci.content_key = 'lawyers_collaboration_advantage_crm' AND lang.code = 'ru' THEN 'Профессиональная CRM-система'
        WHEN ci.content_key = 'lawyers_collaboration_floating_crm' AND lang.code = 'en' THEN 'CRM System'
        WHEN ci.content_key = 'lawyers_collaboration_floating_crm' AND lang.code = 'he' THEN 'מערכת CRM'
        WHEN ci.content_key = 'lawyers_collaboration_floating_crm' AND lang.code = 'ru' THEN 'CRM-система'
        WHEN ci.content_key = 'lawyers_collaboration_floating_platform' AND lang.code = 'en' THEN 'Digital Platform'
        WHEN ci.content_key = 'lawyers_collaboration_floating_platform' AND lang.code = 'he' THEN 'פלטפורמה דיגיטלית'
        WHEN ci.content_key = 'lawyers_collaboration_floating_platform' AND lang.code = 'ru' THEN 'Цифровая платформа'
        WHEN ci.content_key = 'lawyers_collaboration_get_consultation' AND lang.code = 'en' THEN 'Get Free Consultation'
        WHEN ci.content_key = 'lawyers_collaboration_get_consultation' AND lang.code = 'he' THEN 'קבלו ייעוץ חינם'
        WHEN ci.content_key = 'lawyers_collaboration_get_consultation' AND lang.code = 'ru' THEN 'Получить бесплатную консультацию'
    END,
    'active',
    NOW(),
    NOW()
FROM content_items ci
CROSS JOIN (VALUES ('en'), ('he'), ('ru')) AS lang(code)
WHERE ci.screen_location = 'tenders_for_lawyers' 
    AND ci.content_key LIKE 'lawyers_collaboration%';

-- How It Works Process Section (5 steps)
INSERT INTO content_items (screen_location, content_key, component_type, category, is_active, created_at, updated_at)
VALUES 
('tenders_for_lawyers', 'lawyers_how_it_works_process_title', 'heading', 'process', true, NOW(), NOW()),
-- Step 1
('tenders_for_lawyers', 'lawyers_process_step_1_title', 'option', 'process', true, NOW(), NOW()),
('tenders_for_lawyers', 'lawyers_process_step_1_description', 'option', 'process', true, NOW(), NOW()),
-- Step 2
('tenders_for_lawyers', 'lawyers_process_step_2_title', 'option', 'process', true, NOW(), NOW()),
('tenders_for_lawyers', 'lawyers_process_step_2_description', 'option', 'process', true, NOW(), NOW()),
-- Step 3
('tenders_for_lawyers', 'lawyers_process_step_3_title', 'option', 'process', true, NOW(), NOW()),
('tenders_for_lawyers', 'lawyers_process_step_3_description', 'option', 'process', true, NOW(), NOW()),
-- Step 4
('tenders_for_lawyers', 'lawyers_process_step_4_title', 'option', 'process', true, NOW(), NOW()),
('tenders_for_lawyers', 'lawyers_process_step_4_description', 'option', 'process', true, NOW(), NOW()),
-- Step 5
('tenders_for_lawyers', 'lawyers_process_step_5_title', 'option', 'process', true, NOW(), NOW()),
('tenders_for_lawyers', 'lawyers_process_step_5_description', 'option', 'process', true, NOW(), NOW()),
-- Apply button
('tenders_for_lawyers', 'lawyers_process_apply_button', 'button', 'process', true, NOW(), NOW());

INSERT INTO content_translations (content_item_id, language_code, content_value, status, created_at, updated_at)
SELECT 
    ci.id,
    lang.code,
    CASE 
        WHEN ci.content_key = 'lawyers_how_it_works_process_title' AND lang.code = 'en' THEN 'How Our Partnership Works'
        WHEN ci.content_key = 'lawyers_how_it_works_process_title' AND lang.code = 'he' THEN 'איך השותפות שלנו עובדת'
        WHEN ci.content_key = 'lawyers_how_it_works_process_title' AND lang.code = 'ru' THEN 'Как работает наше партнерство'
        -- Step 1
        WHEN ci.content_key = 'lawyers_process_step_1_title' AND lang.code = 'en' THEN 'Application & Review'
        WHEN ci.content_key = 'lawyers_process_step_1_title' AND lang.code = 'he' THEN 'בקשה ובדיקה'
        WHEN ci.content_key = 'lawyers_process_step_1_title' AND lang.code = 'ru' THEN 'Заявка и рассмотрение'
        WHEN ci.content_key = 'lawyers_process_step_1_description' AND lang.code = 'en' THEN 'Submit your application and credentials for review'
        WHEN ci.content_key = 'lawyers_process_step_1_description' AND lang.code = 'he' THEN 'הגישו את הבקשה והאישורים שלכם לבדיקה'
        WHEN ci.content_key = 'lawyers_process_step_1_description' AND lang.code = 'ru' THEN 'Подайте заявку и документы для рассмотрения'
        -- Step 2
        WHEN ci.content_key = 'lawyers_process_step_2_title' AND lang.code = 'en' THEN 'Partnership Agreement'
        WHEN ci.content_key = 'lawyers_process_step_2_title' AND lang.code = 'he' THEN 'הסכם שותפות'
        WHEN ci.content_key = 'lawyers_process_step_2_title' AND lang.code = 'ru' THEN 'Партнерское соглашение'
        WHEN ci.content_key = 'lawyers_process_step_2_description' AND lang.code = 'en' THEN 'Sign partnership agreement and set terms'
        WHEN ci.content_key = 'lawyers_process_step_2_description' AND lang.code = 'he' THEN 'חתמו על הסכם שותפות וקבעו תנאים'
        WHEN ci.content_key = 'lawyers_process_step_2_description' AND lang.code = 'ru' THEN 'Подпишите партнерское соглашение и установите условия'
        -- Step 3
        WHEN ci.content_key = 'lawyers_process_step_3_title' AND lang.code = 'en' THEN 'Platform Training'
        WHEN ci.content_key = 'lawyers_process_step_3_title' AND lang.code = 'he' THEN 'הכשרת פלטפורמה'
        WHEN ci.content_key = 'lawyers_process_step_3_title' AND lang.code = 'ru' THEN 'Обучение платформе'
        WHEN ci.content_key = 'lawyers_process_step_3_description' AND lang.code = 'en' THEN 'Learn to use our platform and tools'
        WHEN ci.content_key = 'lawyers_process_step_3_description' AND lang.code = 'he' THEN 'למדו להשתמש בפלטפורמה והכלים שלנו'
        WHEN ci.content_key = 'lawyers_process_step_3_description' AND lang.code = 'ru' THEN 'Научитесь использовать нашу платформу и инструменты'
        -- Step 4
        WHEN ci.content_key = 'lawyers_process_step_4_title' AND lang.code = 'en' THEN 'Receive Leads'
        WHEN ci.content_key = 'lawyers_process_step_4_title' AND lang.code = 'he' THEN 'קבלת לידים'
        WHEN ci.content_key = 'lawyers_process_step_4_title' AND lang.code = 'ru' THEN 'Получение лидов'
        WHEN ci.content_key = 'lawyers_process_step_4_description' AND lang.code = 'en' THEN 'Start receiving qualified client leads'
        WHEN ci.content_key = 'lawyers_process_step_4_description' AND lang.code = 'he' THEN 'התחילו לקבל לידים איכותיים של לקוחות'
        WHEN ci.content_key = 'lawyers_process_step_4_description' AND lang.code = 'ru' THEN 'Начните получать квалифицированные лиды клиентов'
        -- Step 5
        WHEN ci.content_key = 'lawyers_process_step_5_title' AND lang.code = 'en' THEN 'Earn Commissions'
        WHEN ci.content_key = 'lawyers_process_step_5_title' AND lang.code = 'he' THEN 'הרוויחו עמלות'
        WHEN ci.content_key = 'lawyers_process_step_5_title' AND lang.code = 'ru' THEN 'Зарабатывайте комиссии'
        WHEN ci.content_key = 'lawyers_process_step_5_description' AND lang.code = 'en' THEN 'Get paid for successful transactions'
        WHEN ci.content_key = 'lawyers_process_step_5_description' AND lang.code = 'he' THEN 'קבלו תשלום עבור עסקאות מוצלחות'
        WHEN ci.content_key = 'lawyers_process_step_5_description' AND lang.code = 'ru' THEN 'Получайте оплату за успешные сделки'
        WHEN ci.content_key = 'lawyers_process_apply_button' AND lang.code = 'en' THEN 'Apply Now'
        WHEN ci.content_key = 'lawyers_process_apply_button' AND lang.code = 'he' THEN 'הגישו בקשה עכשיו'
        WHEN ci.content_key = 'lawyers_process_apply_button' AND lang.code = 'ru' THEN 'Подать заявку сейчас'
    END,
    'active',
    NOW(),
    NOW()
FROM content_items ci
CROSS JOIN (VALUES ('en'), ('he'), ('ru')) AS lang(code)
WHERE ci.screen_location = 'tenders_for_lawyers' 
    AND (ci.content_key LIKE 'lawyers_process%' OR ci.content_key = 'lawyers_how_it_works_process_title');

-- Partnership Main Section
INSERT INTO content_items (screen_location, content_key, component_type, category, is_active, created_at, updated_at)
VALUES 
('tenders_for_lawyers', 'lawyers_partnership_title', 'heading', 'partnership', true, NOW(), NOW()),
('tenders_for_lawyers', 'lawyers_partnership_button', 'button', 'partnership', true, NOW(), NOW());

INSERT INTO content_translations (content_item_id, language_code, content_value, status, created_at, updated_at)
SELECT 
    ci.id,
    lang.code,
    CASE 
        WHEN ci.content_key = 'lawyers_partnership_title' AND lang.code = 'en' THEN 'Start Your Legal Partnership Today'
        WHEN ci.content_key = 'lawyers_partnership_title' AND lang.code = 'he' THEN 'התחילו את השותפות המשפטית שלכם היום'
        WHEN ci.content_key = 'lawyers_partnership_title' AND lang.code = 'ru' THEN 'Начните ваше юридическое партнерство сегодня'
        WHEN ci.content_key = 'lawyers_partnership_button' AND lang.code = 'en' THEN 'Join Now'
        WHEN ci.content_key = 'lawyers_partnership_button' AND lang.code = 'he' THEN 'הצטרפו עכשיו'
        WHEN ci.content_key = 'lawyers_partnership_button' AND lang.code = 'ru' THEN 'Присоединиться сейчас'
    END,
    'active',
    NOW(),
    NOW()
FROM content_items ci
CROSS JOIN (VALUES ('en'), ('he'), ('ru')) AS lang(code)
WHERE ci.screen_location = 'tenders_for_lawyers' 
    AND ci.content_key IN ('lawyers_partnership_title', 'lawyers_partnership_button');

-- Footer Section (common footer translations)
INSERT INTO content_items (screen_location, content_key, component_type, category, is_active, created_at, updated_at)
VALUES 
('tenders_for_lawyers', 'footer_company', 'text', 'footer', true, NOW(), NOW()),
('tenders_for_lawyers', 'footer_about', 'text', 'footer', true, NOW(), NOW()),
('tenders_for_lawyers', 'footer_contacts', 'text', 'footer', true, NOW(), NOW()),
('tenders_for_lawyers', 'footer_vacancies', 'text', 'footer', true, NOW(), NOW()),
('tenders_for_lawyers', 'footer_cooperation', 'text', 'footer', true, NOW(), NOW()),
('tenders_for_lawyers', 'footer_contacts_title', 'text', 'footer', true, NOW(), NOW()),
('tenders_for_lawyers', 'footer_email', 'text', 'footer', true, NOW(), NOW()),
('tenders_for_lawyers', 'footer_phone', 'text', 'footer', true, NOW(), NOW()),
('tenders_for_lawyers', 'footer_admin_contact', 'text', 'footer', true, NOW(), NOW()),
('tenders_for_lawyers', 'footer_legal', 'text', 'footer', true, NOW(), NOW()),
('tenders_for_lawyers', 'footer_user_agreement', 'text', 'footer', true, NOW(), NOW()),
('tenders_for_lawyers', 'footer_privacy_policy', 'text', 'footer', true, NOW(), NOW()),
('tenders_for_lawyers', 'footer_cookie_policy', 'text', 'footer', true, NOW(), NOW()),
('tenders_for_lawyers', 'footer_return_policy', 'text', 'footer', true, NOW(), NOW()),
('tenders_for_lawyers', 'footer_copyright', 'text', 'footer', true, NOW(), NOW());

INSERT INTO content_translations (content_item_id, language_code, content_value, status, created_at, updated_at)
SELECT 
    ci.id,
    lang.code,
    CASE 
        WHEN ci.content_key = 'footer_company' AND lang.code = 'en' THEN 'Company'
        WHEN ci.content_key = 'footer_company' AND lang.code = 'he' THEN 'חברה'
        WHEN ci.content_key = 'footer_company' AND lang.code = 'ru' THEN 'Компания'
        WHEN ci.content_key = 'footer_about' AND lang.code = 'en' THEN 'About Us'
        WHEN ci.content_key = 'footer_about' AND lang.code = 'he' THEN 'אודותינו'
        WHEN ci.content_key = 'footer_about' AND lang.code = 'ru' THEN 'О нас'
        WHEN ci.content_key = 'footer_contacts' AND lang.code = 'en' THEN 'Contacts'
        WHEN ci.content_key = 'footer_contacts' AND lang.code = 'he' THEN 'צור קשר'
        WHEN ci.content_key = 'footer_contacts' AND lang.code = 'ru' THEN 'Контакты'
        WHEN ci.content_key = 'footer_vacancies' AND lang.code = 'en' THEN 'Careers'
        WHEN ci.content_key = 'footer_vacancies' AND lang.code = 'he' THEN 'קריירה'
        WHEN ci.content_key = 'footer_vacancies' AND lang.code = 'ru' THEN 'Карьера'
        WHEN ci.content_key = 'footer_cooperation' AND lang.code = 'en' THEN 'Partnership'
        WHEN ci.content_key = 'footer_cooperation' AND lang.code = 'he' THEN 'שותפות'
        WHEN ci.content_key = 'footer_cooperation' AND lang.code = 'ru' THEN 'Партнерство'
        WHEN ci.content_key = 'footer_contacts_title' AND lang.code = 'en' THEN 'Contact Information'
        WHEN ci.content_key = 'footer_contacts_title' AND lang.code = 'he' THEN 'פרטי התקשרות'
        WHEN ci.content_key = 'footer_contacts_title' AND lang.code = 'ru' THEN 'Контактная информация'
        WHEN ci.content_key = 'footer_email' AND lang.code = 'en' THEN 'info@techrealt.com'
        WHEN ci.content_key = 'footer_email' AND lang.code = 'he' THEN 'info@techrealt.com'
        WHEN ci.content_key = 'footer_email' AND lang.code = 'ru' THEN 'info@techrealt.com'
        WHEN ci.content_key = 'footer_phone' AND lang.code = 'en' THEN '+972-3-123-4567'
        WHEN ci.content_key = 'footer_phone' AND lang.code = 'he' THEN '+972-3-123-4567'
        WHEN ci.content_key = 'footer_phone' AND lang.code = 'ru' THEN '+972-3-123-4567'
        WHEN ci.content_key = 'footer_admin_contact' AND lang.code = 'en' THEN 'admin@techrealt.com'
        WHEN ci.content_key = 'footer_admin_contact' AND lang.code = 'he' THEN 'admin@techrealt.com'
        WHEN ci.content_key = 'footer_admin_contact' AND lang.code = 'ru' THEN 'admin@techrealt.com'
        WHEN ci.content_key = 'footer_legal' AND lang.code = 'en' THEN 'Legal'
        WHEN ci.content_key = 'footer_legal' AND lang.code = 'he' THEN 'משפטי'
        WHEN ci.content_key = 'footer_legal' AND lang.code = 'ru' THEN 'Юридическая информация'
        WHEN ci.content_key = 'footer_user_agreement' AND lang.code = 'en' THEN 'Terms of Service'
        WHEN ci.content_key = 'footer_user_agreement' AND lang.code = 'he' THEN 'תנאי שימוש'
        WHEN ci.content_key = 'footer_user_agreement' AND lang.code = 'ru' THEN 'Пользовательское соглашение'
        WHEN ci.content_key = 'footer_privacy_policy' AND lang.code = 'en' THEN 'Privacy Policy'
        WHEN ci.content_key = 'footer_privacy_policy' AND lang.code = 'he' THEN 'מדיניות פרטיות'
        WHEN ci.content_key = 'footer_privacy_policy' AND lang.code = 'ru' THEN 'Политика конфиденциальности'
        WHEN ci.content_key = 'footer_cookie_policy' AND lang.code = 'en' THEN 'Cookie Policy'
        WHEN ci.content_key = 'footer_cookie_policy' AND lang.code = 'he' THEN 'מדיניות עוגיות'
        WHEN ci.content_key = 'footer_cookie_policy' AND lang.code = 'ru' THEN 'Политика использования cookie'
        WHEN ci.content_key = 'footer_return_policy' AND lang.code = 'en' THEN 'Return Policy'
        WHEN ci.content_key = 'footer_return_policy' AND lang.code = 'he' THEN 'מדיניות החזרות'
        WHEN ci.content_key = 'footer_return_policy' AND lang.code = 'ru' THEN 'Политика возврата'
        WHEN ci.content_key = 'footer_copyright' AND lang.code = 'en' THEN '© 2024 TechRealt. All rights reserved.'
        WHEN ci.content_key = 'footer_copyright' AND lang.code = 'he' THEN '© 2024 טקריאלט. כל הזכויות שמורות.'
        WHEN ci.content_key = 'footer_copyright' AND lang.code = 'ru' THEN '© 2024 TechRealt. Все права защищены.'
    END,
    'active',
    NOW(),
    NOW()
FROM content_items ci
CROSS JOIN (VALUES ('en'), ('he'), ('ru')) AS lang(code)
WHERE ci.screen_location = 'tenders_for_lawyers' 
    AND ci.content_key LIKE 'footer%';

-- Commit transaction
COMMIT;

-- Verification query to check the migration
SELECT 
    screen_location,
    COUNT(DISTINCT content_key) as content_items_count,
    COUNT(DISTINCT ct.language_code) as languages_count,
    COUNT(*) as total_translations
FROM content_items ci
JOIN content_translations ct ON ci.id = ct.content_item_id
WHERE screen_location IN ('cooperation', 'tenders_for_brokers', 'temporary_franchise', 'tenders_for_lawyers')
GROUP BY screen_location
ORDER BY screen_location;
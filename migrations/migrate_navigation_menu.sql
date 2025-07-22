-- Migration: Migrate Navigation Menu Translations to Database
-- Date: 2025-01-22
-- Purpose: Move hardcoded navigation/sidebar menu translations to database following DEVHelp/DevRules/translationRules

-- ===== SIDEBAR COMPANY SECTION =====

-- Insert content items for company sidebar menu
INSERT INTO content_items (content_key, component_type, category, screen_location, is_active, created_at) VALUES
('sidebar_company', 'text', 'navigation', 'sidebar_company', TRUE, NOW()),
('sidebar_company_1', 'text', 'navigation', 'sidebar_company', TRUE, NOW()),
('sidebar_company_2', 'text', 'navigation', 'sidebar_company', TRUE, NOW()),
('sidebar_company_3', 'text', 'navigation', 'sidebar_company', TRUE, NOW()),
('sidebar_company_4', 'text', 'navigation', 'sidebar_company', TRUE, NOW()),
('sidebar_company_5', 'text', 'navigation', 'sidebar_company', TRUE, NOW()),
('sidebar_company_6', 'text', 'navigation', 'sidebar_company', TRUE, NOW())
ON CONFLICT (content_key) DO NOTHING;

-- Insert translations for company sidebar menu
INSERT INTO content_translations (content_item_id, language_code, content_value, status, created_at) VALUES
-- English
((SELECT id FROM content_items WHERE content_key = 'sidebar_company'), 'en', 'Company', 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'sidebar_company_1'), 'en', 'Our services', 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'sidebar_company_2'), 'en', 'About', 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'sidebar_company_3'), 'en', 'Jobs', 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'sidebar_company_4'), 'en', 'Contact', 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'sidebar_company_5'), 'en', 'Temporary Franchise for Brokers', 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'sidebar_company_6'), 'en', 'Franchise for Real Estate Brokers', 'approved', NOW()),

-- Hebrew
((SELECT id FROM content_items WHERE content_key = 'sidebar_company'), 'he', 'חברה', 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'sidebar_company_1'), 'he', 'השירותים שלנו', 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'sidebar_company_2'), 'he', 'אודות', 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'sidebar_company_3'), 'he', 'משרות', 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'sidebar_company_4'), 'he', 'צור קשר', 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'sidebar_company_5'), 'he', 'זכיון זמני למתווכים', 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'sidebar_company_6'), 'he', 'זיכיון למתווכי נדל"ן', 'approved', NOW()),

-- Russian
((SELECT id FROM content_items WHERE content_key = 'sidebar_company'), 'ru', 'Компания', 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'sidebar_company_1'), 'ru', 'Наши услуги', 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'sidebar_company_2'), 'ru', 'О нас', 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'sidebar_company_3'), 'ru', 'Вакансии', 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'sidebar_company_4'), 'ru', 'Связаться с нами', 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'sidebar_company_5'), 'ru', 'Временная франшиза для брокеров', 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'sidebar_company_6'), 'ru', 'Франшиза для брокеров недвижимости', 'approved', NOW())
ON CONFLICT (content_item_id, language_code) DO NOTHING;

-- ===== SIDEBAR BUSINESS SECTION =====

-- Insert content items for business sidebar menu
INSERT INTO content_items (content_key, component_type, category, screen_location, is_active, created_at) VALUES
('sidebar_business', 'text', 'navigation', 'sidebar_business', TRUE, NOW()),
('sidebar_business_1', 'text', 'navigation', 'sidebar_business', TRUE, NOW()),
('sidebar_business_2', 'text', 'navigation', 'sidebar_business', TRUE, NOW()),
('sidebar_business_3', 'text', 'navigation', 'sidebar_business', TRUE, NOW()),
('sidebar_business_4', 'text', 'navigation', 'sidebar_business', TRUE, NOW())
ON CONFLICT (content_key) DO NOTHING;

-- Insert translations for business sidebar menu
INSERT INTO content_translations (content_item_id, language_code, content_value, status, created_at) VALUES
-- English
((SELECT id FROM content_items WHERE content_key = 'sidebar_business'), 'en', 'Business', 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'sidebar_business_1'), 'en', 'Partner financial institutions', 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'sidebar_business_2'), 'en', 'Partner program', 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'sidebar_business_3'), 'en', 'Broker franchise', 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'sidebar_business_4'), 'en', 'Lawyer partner program', 'approved', NOW()),

-- Hebrew
((SELECT id FROM content_items WHERE content_key = 'sidebar_business'), 'he', 'עסקים', 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'sidebar_business_1'), 'he', 'מוסדות פיננסיים שותפים', 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'sidebar_business_2'), 'he', 'תכנית שותפים', 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'sidebar_business_3'), 'he', 'זיכיון למתווכים', 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'sidebar_business_4'), 'he', 'תכנית שותפים לעורכי דין', 'approved', NOW()),

-- Russian
((SELECT id FROM content_items WHERE content_key = 'sidebar_business'), 'ru', 'Бизнес', 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'sidebar_business_1'), 'ru', 'Партнерские финансовые учреждения', 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'sidebar_business_2'), 'ru', 'Партнерская программа', 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'sidebar_business_3'), 'ru', 'Франшиза для брокеров', 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'sidebar_business_4'), 'ru', 'Партнерская программа для юристов', 'approved', NOW())
ON CONFLICT (content_item_id, language_code) DO NOTHING;

-- ===== CONTACT PAGE TRANSLATIONS (found in earlier grep) =====

-- Insert content items for contact page
INSERT INTO content_items (content_key, component_type, category, screen_location, is_active, created_at) VALUES
('contacts_secretary', 'text', 'contact', 'contacts', TRUE, NOW()),
('contacts_secretary_phone', 'text', 'contact', 'contacts', TRUE, NOW()),
('contacts_secretary_email', 'text', 'contact', 'contacts', TRUE, NOW()),
('contacts_secretary_link', 'text', 'contact', 'contacts', TRUE, NOW()),
('contacts_tech_support_phone', 'text', 'contact', 'contacts', TRUE, NOW()),
('contacts_tech_support_email', 'text', 'contact', 'contacts', TRUE, NOW()),
('contacts_tech_support_link', 'text', 'contact', 'contacts', TRUE, NOW()),
('contacts_customer_service_phone', 'text', 'contact', 'contacts', TRUE, NOW()),
('contacts_customer_service_email', 'text', 'contact', 'contacts', TRUE, NOW()),
('contacts_customer_service_link', 'text', 'contact', 'contacts', TRUE, NOW())
ON CONFLICT (content_key) DO NOTHING;

-- Insert translations for contact page
INSERT INTO content_translations (content_item_id, language_code, content_value, status, created_at) VALUES
-- English
((SELECT id FROM content_items WHERE content_key = 'contacts_secretary'), 'en', 'Secretary', 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'contacts_secretary_phone'), 'en', '03-1234567', 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'contacts_secretary_email'), 'en', 'secretary@bankimonline.com', 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'contacts_secretary_link'), 'en', 'Contact Secretary', 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'contacts_tech_support_phone'), 'en', '03-1234568', 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'contacts_tech_support_email'), 'en', 'support@bankimonline.com', 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'contacts_tech_support_link'), 'en', 'Contact Technical Support', 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'contacts_customer_service_phone'), 'en', '03-1234569', 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'contacts_customer_service_email'), 'en', 'service@bankimonline.com', 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'contacts_customer_service_link'), 'en', 'Contact Customer Service', 'approved', NOW()),

-- Hebrew
((SELECT id FROM content_items WHERE content_key = 'contacts_secretary'), 'he', 'מזכירות', 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'contacts_secretary_phone'), 'he', '03-1234567', 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'contacts_secretary_email'), 'he', 'secretary@bankimonline.com', 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'contacts_secretary_link'), 'he', 'פנה למזכירות', 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'contacts_tech_support_phone'), 'he', '03-1234568', 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'contacts_tech_support_email'), 'he', 'support@bankimonline.com', 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'contacts_tech_support_link'), 'he', 'פנה לתמיכה טכנית', 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'contacts_customer_service_phone'), 'he', '03-1234569', 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'contacts_customer_service_email'), 'he', 'service@bankimonline.com', 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'contacts_customer_service_link'), 'he', 'פנה לשירות לקוחות', 'approved', NOW()),

-- Russian
((SELECT id FROM content_items WHERE content_key = 'contacts_secretary'), 'ru', 'Секретариат', 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'contacts_secretary_phone'), 'ru', '03-1234567', 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'contacts_secretary_email'), 'ru', 'secretary@bankimonline.com', 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'contacts_secretary_link'), 'ru', 'Связаться с секретариатом', 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'contacts_tech_support_phone'), 'ru', '03-1234568', 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'contacts_tech_support_email'), 'ru', 'support@bankimonline.com', 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'contacts_tech_support_link'), 'ru', 'Связаться с технической поддержкой', 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'contacts_customer_service_phone'), 'ru', '03-1234569', 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'contacts_customer_service_email'), 'ru', 'service@bankimonline.com', 'approved', NOW()),
((SELECT id FROM content_items WHERE content_key = 'contacts_customer_service_link'), 'ru', 'Связаться со службой поддержки клиентов', 'approved', NOW())
ON CONFLICT (content_item_id, language_code) DO NOTHING;

-- Mark migration as complete
COMMENT ON TABLE content_items IS 'Migration completed for navigation menu translations - see DEVHelp/DevRules/translationRules';

-- Verification query to confirm migration
SELECT 
    ci.content_key, 
    ci.screen_location,
    COUNT(ct.id) as translation_count,
    COUNT(CASE WHEN ct.status = 'approved' THEN 1 END) as approved_count
FROM content_items ci
LEFT JOIN content_translations ct ON ci.id = ct.content_item_id
WHERE ci.category = 'navigation' OR ci.category = 'contact'
GROUP BY ci.id, ci.content_key, ci.screen_location
ORDER BY ci.screen_location, ci.content_key;
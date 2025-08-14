-- CRITICAL PRODUCTION FIX: Add missing professional field content for Credit Step 3
-- This content exists in development but is missing in production database

-- Insert professional field content items
INSERT INTO content_items (content_key, component_type, category, screen_location, status, is_active) VALUES
('credit_step3_professional_sphere', 'dropdown_container', 'dropdown', 'credit_step3', 'active', true),
('credit_step3_professional_sphere_ph', 'placeholder', 'dropdown', 'credit_step3', 'active', true);

-- Insert professional field options (14 total)
INSERT INTO content_items (content_key, component_type, category, screen_location, status, is_active) VALUES
('credit_step3_professional_sphere_agriculture', 'dropdown_option', 'dropdown', 'credit_step3', 'active', true),
('credit_step3_professional_sphere_construction', 'dropdown_option', 'dropdown', 'credit_step3', 'active', true),
('credit_step3_professional_sphere_consulting', 'dropdown_option', 'dropdown', 'credit_step3', 'active', true),
('credit_step3_professional_sphere_education', 'dropdown_option', 'dropdown', 'credit_step3', 'active', true),
('credit_step3_professional_sphere_entertainment', 'dropdown_option', 'dropdown', 'credit_step3', 'active', true),
('credit_step3_professional_sphere_finance', 'dropdown_option', 'dropdown', 'credit_step3', 'active', true),
('credit_step3_professional_sphere_government', 'dropdown_option', 'dropdown', 'credit_step3', 'active', true),
('credit_step3_professional_sphere_healthcare', 'dropdown_option', 'dropdown', 'credit_step3', 'active', true),
('credit_step3_professional_sphere_industry', 'dropdown_option', 'dropdown', 'credit_step3', 'active', true),
('credit_step3_professional_sphere_other', 'dropdown_option', 'dropdown', 'credit_step3', 'active', true),
('credit_step3_professional_sphere_realestate', 'dropdown_option', 'dropdown', 'credit_step3', 'active', true),
('credit_step3_professional_sphere_retail', 'dropdown_option', 'dropdown', 'credit_step3', 'active', true),
('credit_step3_professional_sphere_technology', 'dropdown_option', 'dropdown', 'credit_step3', 'active', true),
('credit_step3_professional_sphere_transportation', 'dropdown_option', 'dropdown', 'credit_step3', 'active', true);

-- Get the content_item IDs for translations
WITH content_ids AS (
  SELECT id, content_key FROM content_items 
  WHERE content_key LIKE 'credit_step3_professional_sphere%' AND screen_location = 'credit_step3'
)

-- Insert Hebrew translations
INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'he', 
  CASE ci.content_key
    WHEN 'credit_step3_professional_sphere' THEN 'תחום פעילות'
    WHEN 'credit_step3_professional_sphere_ph' THEN 'בחר תחום פעילות'
    WHEN 'credit_step3_professional_sphere_agriculture' THEN 'חקלאות, יערנות ודיג'
    WHEN 'credit_step3_professional_sphere_construction' THEN 'בנייה'
    WHEN 'credit_step3_professional_sphere_consulting' THEN 'ייעוץ ושירותים מקצועיים'
    WHEN 'credit_step3_professional_sphere_education' THEN 'חינוך והכשרה'
    WHEN 'credit_step3_professional_sphere_entertainment' THEN 'בידור ומדיה'
    WHEN 'credit_step3_professional_sphere_finance' THEN 'פיננסים ובנקאות'
    WHEN 'credit_step3_professional_sphere_government' THEN 'ממשלה ושירות ציבורי'
    WHEN 'credit_step3_professional_sphere_healthcare' THEN 'בריאות ושירותים חברתיים'
    WHEN 'credit_step3_professional_sphere_industry' THEN 'תעשייה וייצור'
    WHEN 'credit_step3_professional_sphere_other' THEN 'אחר'
    WHEN 'credit_step3_professional_sphere_realestate' THEN 'נדל"ן'
    WHEN 'credit_step3_professional_sphere_retail' THEN 'מסחר קמעונאי'
    WHEN 'credit_step3_professional_sphere_technology' THEN 'טכנולוגיה ותקשורת'
    WHEN 'credit_step3_professional_sphere_transportation' THEN 'תחבורה ולוגיסטיקה'
  END, 'approved'
FROM content_ids ci;

-- Insert English translations
INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'en', 
  CASE ci.content_key
    WHEN 'credit_step3_professional_sphere' THEN 'Professional Field'
    WHEN 'credit_step3_professional_sphere_ph' THEN 'Select Professional Field'
    WHEN 'credit_step3_professional_sphere_agriculture' THEN 'Agriculture, Forestry and Fishing'
    WHEN 'credit_step3_professional_sphere_construction' THEN 'Construction'
    WHEN 'credit_step3_professional_sphere_consulting' THEN 'Consulting and Professional Services'
    WHEN 'credit_step3_professional_sphere_education' THEN 'Education and Training'
    WHEN 'credit_step3_professional_sphere_entertainment' THEN 'Entertainment and Media'
    WHEN 'credit_step3_professional_sphere_finance' THEN 'Finance and Banking'
    WHEN 'credit_step3_professional_sphere_government' THEN 'Government and Public Service'
    WHEN 'credit_step3_professional_sphere_healthcare' THEN 'Healthcare and Social Services'
    WHEN 'credit_step3_professional_sphere_industry' THEN 'Industry and Manufacturing'
    WHEN 'credit_step3_professional_sphere_other' THEN 'Other'
    WHEN 'credit_step3_professional_sphere_realestate' THEN 'Real Estate'
    WHEN 'credit_step3_professional_sphere_retail' THEN 'Retail'
    WHEN 'credit_step3_professional_sphere_technology' THEN 'Technology and Communications'
    WHEN 'credit_step3_professional_sphere_transportation' THEN 'Transportation and Logistics'
  END, 'approved'
FROM content_ids ci;

-- Insert Russian translations
INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'ru', 
  CASE ci.content_key
    WHEN 'credit_step3_professional_sphere' THEN 'Профессиональная область'
    WHEN 'credit_step3_professional_sphere_ph' THEN 'Выберите профессиональную область'
    WHEN 'credit_step3_professional_sphere_agriculture' THEN 'Сельское хозяйство, лесное хозяйство и рыболовство'
    WHEN 'credit_step3_professional_sphere_construction' THEN 'Строительство'
    WHEN 'credit_step3_professional_sphere_consulting' THEN 'Консалтинг и профессиональные услуги'
    WHEN 'credit_step3_professional_sphere_education' THEN 'Образование и обучение'
    WHEN 'credit_step3_professional_sphere_entertainment' THEN 'Развлечения и медиа'
    WHEN 'credit_step3_professional_sphere_finance' THEN 'Финансы и банковское дело'
    WHEN 'credit_step3_professional_sphere_government' THEN 'Правительство и государственная служба'
    WHEN 'credit_step3_professional_sphere_healthcare' THEN 'Здравоохранение и социальные услуги'
    WHEN 'credit_step3_professional_sphere_industry' THEN 'Промышленность и производство'
    WHEN 'credit_step3_professional_sphere_other' THEN 'Другое'
    WHEN 'credit_step3_professional_sphere_realestate' THEN 'Недвижимость'
    WHEN 'credit_step3_professional_sphere_retail' THEN 'Розничная торговля'
    WHEN 'credit_step3_professional_sphere_technology' THEN 'Технологии и связь'
    WHEN 'credit_step3_professional_sphere_transportation' THEN 'Транспорт и логистика'
  END, 'approved'
FROM content_ids ci;

-- Verify the insertion
SELECT 'Content Items Created:' as status, COUNT(*) as count FROM content_items WHERE content_key LIKE 'credit_step3_professional_sphere%';
SELECT 'Translations Created:' as status, COUNT(*) as count FROM content_translations ct 
  JOIN content_items ci ON ct.content_item_id = ci.id 
  WHERE ci.content_key LIKE 'credit_step3_professional_sphere%';

-- Clear any API cache (if applicable)
-- NOTIFY server_cache_invalidation, 'credit_step3';
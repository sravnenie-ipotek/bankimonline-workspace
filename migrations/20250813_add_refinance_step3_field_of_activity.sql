-- Add missing field_of_activity dropdown for refinance_step3
-- Copy structure from mortgage_step3 field_of_activity dropdown
-- Following: dropDownLogicBankim.md and systemTranslationLogic.md

-- 1) Container (dropdown_container)
INSERT INTO content_items (content_key, screen_location, component_type, category, is_active)
VALUES ('refinance_step3.field.field_of_activity', 'refinance_step3', 'dropdown_container', 'form', true)
ON CONFLICT (content_key) DO UPDATE SET is_active = EXCLUDED.is_active;

-- Label translations for container
INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'en', 'Field of Activity', 'approved'
FROM content_items ci WHERE ci.content_key = 'refinance_step3.field.field_of_activity'
ON CONFLICT (content_item_id, language_code) DO UPDATE SET content_value = EXCLUDED.content_value;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'he', 'תחום פעילות', 'approved'
FROM content_items ci WHERE ci.content_key = 'refinance_step3.field.field_of_activity'
ON CONFLICT (content_item_id, language_code) DO UPDATE SET content_value = EXCLUDED.content_value;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'ru', 'Сфера деятельности', 'approved'
FROM content_items ci WHERE ci.content_key = 'refinance_step3.field.field_of_activity'
ON CONFLICT (content_item_id, language_code) DO UPDATE SET content_value = EXCLUDED.content_value;

-- 2) Options (dropdown_option) - Individual INSERT statements to avoid CTE issues

-- NOTE: The data has already been created via Node.js script
-- These INSERT statements are provided for reference and manual execution if needed

-- technology
INSERT INTO content_items (content_key, screen_location, component_type, category, is_active)
VALUES ('refinance_step3.field.field_of_activity_technology', 'refinance_step3', 'dropdown_option', 'form', true)
ON CONFLICT (content_key) DO UPDATE SET is_active = EXCLUDED.is_active;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'en', 'Technology and Communications', 'approved'
FROM content_items ci WHERE ci.content_key = 'refinance_step3.field.field_of_activity_technology'
ON CONFLICT (content_item_id, language_code) DO UPDATE SET content_value = EXCLUDED.content_value;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'he', 'טכנולוגיה ותקשורת', 'approved'
FROM content_items ci WHERE ci.content_key = 'refinance_step3.field.field_of_activity_technology'
ON CONFLICT (content_item_id, language_code) DO UPDATE SET content_value = EXCLUDED.content_value;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'ru', 'Технологии и коммуникации', 'approved'
FROM content_items ci WHERE ci.content_key = 'refinance_step3.field.field_of_activity_technology'
ON CONFLICT (content_item_id, language_code) DO UPDATE SET content_value = EXCLUDED.content_value;

-- healthcare
INSERT INTO content_items (content_key, screen_location, component_type, category, is_active)
VALUES ('refinance_step3.field.field_of_activity_healthcare', 'refinance_step3', 'dropdown_option', 'form', true)
ON CONFLICT (content_key) DO UPDATE SET is_active = EXCLUDED.is_active;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'en', 'Healthcare and Social Services', 'approved'
FROM content_items ci WHERE ci.content_key = 'refinance_step3.field.field_of_activity_healthcare'
ON CONFLICT (content_item_id, language_code) DO UPDATE SET content_value = EXCLUDED.content_value;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'he', 'בריאות ושירותים חברתיים', 'approved'
FROM content_items ci WHERE ci.content_key = 'refinance_step3.field.field_of_activity_healthcare'
ON CONFLICT (content_item_id, language_code) DO UPDATE SET content_value = EXCLUDED.content_value;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'ru', 'Здравоохранение и социальные услуги', 'approved'
FROM content_items ci WHERE ci.content_key = 'refinance_step3.field.field_of_activity_healthcare'
ON CONFLICT (content_item_id, language_code) DO UPDATE SET content_value = EXCLUDED.content_value;

-- education  
INSERT INTO content_items (content_key, screen_location, component_type, category, is_active)
VALUES ('refinance_step3.field.field_of_activity_education', 'refinance_step3', 'dropdown_option', 'form', true)
ON CONFLICT (content_key) DO UPDATE SET is_active = EXCLUDED.is_active;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'en', 'Education and Training', 'approved'
FROM content_items ci WHERE ci.content_key = 'refinance_step3.field.field_of_activity_education'
ON CONFLICT (content_item_id, language_code) DO UPDATE SET content_value = EXCLUDED.content_value;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'he', 'חינוך והכשרה', 'approved'
FROM content_items ci WHERE ci.content_key = 'refinance_step3.field.field_of_activity_education'
ON CONFLICT (content_item_id, language_code) DO UPDATE SET content_value = EXCLUDED.content_value;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'ru', 'Образование и обучение', 'approved'
FROM content_items ci WHERE ci.content_key = 'refinance_step3.field.field_of_activity_education'
ON CONFLICT (content_item_id, language_code) DO UPDATE SET content_value = EXCLUDED.content_value;

-- finance
INSERT INTO content_items (content_key, screen_location, component_type, category, is_active)
VALUES ('refinance_step3.field.field_of_activity_finance', 'refinance_step3', 'dropdown_option', 'form', true)
ON CONFLICT (content_key) DO UPDATE SET is_active = EXCLUDED.is_active;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'en', 'Finance and Banking', 'approved'
FROM content_items ci WHERE ci.content_key = 'refinance_step3.field.field_of_activity_finance'
ON CONFLICT (content_item_id, language_code) DO UPDATE SET content_value = EXCLUDED.content_value;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'he', 'פיננסים ובנקאות', 'approved'
FROM content_items ci WHERE ci.content_key = 'refinance_step3.field.field_of_activity_finance'
ON CONFLICT (content_item_id, language_code) DO UPDATE SET content_value = EXCLUDED.content_value;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'ru', 'Финансы и банковское дело', 'approved'
FROM content_items ci WHERE ci.content_key = 'refinance_step3.field.field_of_activity_finance'
ON CONFLICT (content_item_id, language_code) DO UPDATE SET content_value = EXCLUDED.content_value;

-- real_estate
INSERT INTO content_items (content_key, screen_location, component_type, category, is_active)
VALUES ('refinance_step3.field.field_of_activity_real_estate', 'refinance_step3', 'dropdown_option', 'form', true)
ON CONFLICT (content_key) DO UPDATE SET is_active = EXCLUDED.is_active;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'en', 'Real Estate', 'approved'
FROM content_items ci WHERE ci.content_key = 'refinance_step3.field.field_of_activity_real_estate'
ON CONFLICT (content_item_id, language_code) DO UPDATE SET content_value = EXCLUDED.content_value;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'he', 'נדל"ן', 'approved'
FROM content_items ci WHERE ci.content_key = 'refinance_step3.field.field_of_activity_real_estate'
ON CONFLICT (content_item_id, language_code) DO UPDATE SET content_value = EXCLUDED.content_value;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'ru', 'Недвижимость', 'approved'
FROM content_items ci WHERE ci.content_key = 'refinance_step3.field.field_of_activity_real_estate'
ON CONFLICT (content_item_id, language_code) DO UPDATE SET content_value = EXCLUDED.content_value;

-- construction  
INSERT INTO content_items (content_key, screen_location, component_type, category, is_active)
VALUES ('refinance_step3.field.field_of_activity_construction', 'refinance_step3', 'dropdown_option', 'form', true)
ON CONFLICT (content_key) DO UPDATE SET is_active = EXCLUDED.is_active;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'en', 'Construction', 'approved'
FROM content_items ci WHERE ci.content_key = 'refinance_step3.field.field_of_activity_construction'
ON CONFLICT (content_item_id, language_code) DO UPDATE SET content_value = EXCLUDED.content_value;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'he', 'בנייה', 'approved'
FROM content_items ci WHERE ci.content_key = 'refinance_step3.field.field_of_activity_construction'
ON CONFLICT (content_item_id, language_code) DO UPDATE SET content_value = EXCLUDED.content_value;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'ru', 'Строительство', 'approved'
FROM content_items ci WHERE ci.content_key = 'refinance_step3.field.field_of_activity_construction'
ON CONFLICT (content_item_id, language_code) DO UPDATE SET content_value = EXCLUDED.content_value;

-- retail
INSERT INTO content_items (content_key, screen_location, component_type, category, is_active)
VALUES ('refinance_step3.field.field_of_activity_retail', 'refinance_step3', 'dropdown_option', 'form', true)
ON CONFLICT (content_key) DO UPDATE SET is_active = EXCLUDED.is_active;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'en', 'Retail and Trade', 'approved'
FROM content_items ci WHERE ci.content_key = 'refinance_step3.field.field_of_activity_retail'
ON CONFLICT (content_item_id, language_code) DO UPDATE SET content_value = EXCLUDED.content_value;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'he', 'מסחר קמעונאי', 'approved'
FROM content_items ci WHERE ci.content_key = 'refinance_step3.field.field_of_activity_retail'
ON CONFLICT (content_item_id, language_code) DO UPDATE SET content_value = EXCLUDED.content_value;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'ru', 'Розничная торговля', 'approved'
FROM content_items ci WHERE ci.content_key = 'refinance_step3.field.field_of_activity_retail'
ON CONFLICT (content_item_id, language_code) DO UPDATE SET content_value = EXCLUDED.content_value;

-- manufacturing
INSERT INTO content_items (content_key, screen_location, component_type, category, is_active)
VALUES ('refinance_step3.field.field_of_activity_manufacturing', 'refinance_step3', 'dropdown_option', 'form', true)
ON CONFLICT (content_key) DO UPDATE SET is_active = EXCLUDED.is_active;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'en', 'Manufacturing and Industry', 'approved'
FROM content_items ci WHERE ci.content_key = 'refinance_step3.field.field_of_activity_manufacturing'
ON CONFLICT (content_item_id, language_code) DO UPDATE SET content_value = EXCLUDED.content_value;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'he', 'תעשייה וייצור', 'approved'
FROM content_items ci WHERE ci.content_key = 'refinance_step3.field.field_of_activity_manufacturing'
ON CONFLICT (content_item_id, language_code) DO UPDATE SET content_value = EXCLUDED.content_value;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'ru', 'Производство и промышленность', 'approved'
FROM content_items ci WHERE ci.content_key = 'refinance_step3.field.field_of_activity_manufacturing'
ON CONFLICT (content_item_id, language_code) DO UPDATE SET content_value = EXCLUDED.content_value;

-- government
INSERT INTO content_items (content_key, screen_location, component_type, category, is_active)
VALUES ('refinance_step3.field.field_of_activity_government', 'refinance_step3', 'dropdown_option', 'form', true)
ON CONFLICT (content_key) DO UPDATE SET is_active = EXCLUDED.is_active;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'en', 'Government and Public Service', 'approved'
FROM content_items ci WHERE ci.content_key = 'refinance_step3.field.field_of_activity_government'
ON CONFLICT (content_item_id, language_code) DO UPDATE SET content_value = EXCLUDED.content_value;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'he', 'ממשלה ושירות ציבורי', 'approved'
FROM content_items ci WHERE ci.content_key = 'refinance_step3.field.field_of_activity_government'
ON CONFLICT (content_item_id, language_code) DO UPDATE SET content_value = EXCLUDED.content_value;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'ru', 'Государственная служба', 'approved'
FROM content_items ci WHERE ci.content_key = 'refinance_step3.field.field_of_activity_government'
ON CONFLICT (content_item_id, language_code) DO UPDATE SET content_value = EXCLUDED.content_value;

-- transport
INSERT INTO content_items (content_key, screen_location, component_type, category, is_active)
VALUES ('refinance_step3.field.field_of_activity_transport', 'refinance_step3', 'dropdown_option', 'form', true)
ON CONFLICT (content_key) DO UPDATE SET is_active = EXCLUDED.is_active;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'en', 'Transport and Logistics', 'approved'
FROM content_items ci WHERE ci.content_key = 'refinance_step3.field.field_of_activity_transport'
ON CONFLICT (content_item_id, language_code) DO UPDATE SET content_value = EXCLUDED.content_value;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'he', 'תחבורה ולוגיסטיקה', 'approved'
FROM content_items ci WHERE ci.content_key = 'refinance_step3.field.field_of_activity_transport'
ON CONFLICT (content_item_id, language_code) DO UPDATE SET content_value = EXCLUDED.content_value;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'ru', 'Транспорт и логистика', 'approved'
FROM content_items ci WHERE ci.content_key = 'refinance_step3.field.field_of_activity_transport'
ON CONFLICT (content_item_id, language_code) DO UPDATE SET content_value = EXCLUDED.content_value;

-- consulting
INSERT INTO content_items (content_key, screen_location, component_type, category, is_active)
VALUES ('refinance_step3.field.field_of_activity_consulting', 'refinance_step3', 'dropdown_option', 'form', true)
ON CONFLICT (content_key) DO UPDATE SET is_active = EXCLUDED.is_active;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'en', 'Consulting and Professional Services', 'approved'
FROM content_items ci WHERE ci.content_key = 'refinance_step3.field.field_of_activity_consulting'
ON CONFLICT (content_item_id, language_code) DO UPDATE SET content_value = EXCLUDED.content_value;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'he', 'ייעוץ ושירותים מקצועיים', 'approved'
FROM content_items ci WHERE ci.content_key = 'refinance_step3.field.field_of_activity_consulting'
ON CONFLICT (content_item_id, language_code) DO UPDATE SET content_value = EXCLUDED.content_value;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'ru', 'Консалтинг и профессиональные услуги', 'approved'
FROM content_items ci WHERE ci.content_key = 'refinance_step3.field.field_of_activity_consulting'
ON CONFLICT (content_item_id, language_code) DO UPDATE SET content_value = EXCLUDED.content_value;

-- entertainment
INSERT INTO content_items (content_key, screen_location, component_type, category, is_active)
VALUES ('refinance_step3.field.field_of_activity_entertainment', 'refinance_step3', 'dropdown_option', 'form', true)
ON CONFLICT (content_key) DO UPDATE SET is_active = EXCLUDED.is_active;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'en', 'Entertainment and Media', 'approved'
FROM content_items ci WHERE ci.content_key = 'refinance_step3.field.field_of_activity_entertainment'
ON CONFLICT (content_item_id, language_code) DO UPDATE SET content_value = EXCLUDED.content_value;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'he', 'בידור ומדיה', 'approved'
FROM content_items ci WHERE ci.content_key = 'refinance_step3.field.field_of_activity_entertainment'
ON CONFLICT (content_item_id, language_code) DO UPDATE SET content_value = EXCLUDED.content_value;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'ru', 'Развлечения и медиа', 'approved'
FROM content_items ci WHERE ci.content_key = 'refinance_step3.field.field_of_activity_entertainment'
ON CONFLICT (content_item_id, language_code) DO UPDATE SET content_value = EXCLUDED.content_value;

-- agriculture
INSERT INTO content_items (content_key, screen_location, component_type, category, is_active)
VALUES ('refinance_step3.field.field_of_activity_agriculture', 'refinance_step3', 'dropdown_option', 'form', true)
ON CONFLICT (content_key) DO UPDATE SET is_active = EXCLUDED.is_active;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'en', 'Agriculture, Forestry, Fishing', 'approved'
FROM content_items ci WHERE ci.content_key = 'refinance_step3.field.field_of_activity_agriculture'
ON CONFLICT (content_item_id, language_code) DO UPDATE SET content_value = EXCLUDED.content_value;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'he', 'חקלאות, יערנות ודיג', 'approved'
FROM content_items ci WHERE ci.content_key = 'refinance_step3.field.field_of_activity_agriculture'
ON CONFLICT (content_item_id, language_code) DO UPDATE SET content_value = EXCLUDED.content_value;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'ru', 'Сельское хозяйство, лесное хозяйство и рыболовство', 'approved'
FROM content_items ci WHERE ci.content_key = 'refinance_step3.field.field_of_activity_agriculture'
ON CONFLICT (content_item_id, language_code) DO UPDATE SET content_value = EXCLUDED.content_value;

-- other
INSERT INTO content_items (content_key, screen_location, component_type, category, is_active)
VALUES ('refinance_step3.field.field_of_activity_other', 'refinance_step3', 'dropdown_option', 'form', true)
ON CONFLICT (content_key) DO UPDATE SET is_active = EXCLUDED.is_active;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'en', 'Other', 'approved'
FROM content_items ci WHERE ci.content_key = 'refinance_step3.field.field_of_activity_other'
ON CONFLICT (content_item_id, language_code) DO UPDATE SET content_value = EXCLUDED.content_value;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'he', 'אחר', 'approved'
FROM content_items ci WHERE ci.content_key = 'refinance_step3.field.field_of_activity_other'
ON CONFLICT (content_item_id, language_code) DO UPDATE SET content_value = EXCLUDED.content_value;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'ru', 'Другое', 'approved'
FROM content_items ci WHERE ci.content_key = 'refinance_step3.field.field_of_activity_other'
ON CONFLICT (content_item_id, language_code) DO UPDATE SET content_value = EXCLUDED.content_value;

-- 3) Label (label)
INSERT INTO content_items (content_key, screen_location, component_type, category, is_active)
VALUES ('refinance_step3.field.field_of_activity_label', 'refinance_step3', 'label', 'form', true)
ON CONFLICT (content_key) DO UPDATE SET is_active = EXCLUDED.is_active;

-- Label translations
INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'en', 'Field of Activity', 'approved'
FROM content_items ci WHERE ci.content_key = 'refinance_step3.field.field_of_activity_label'
ON CONFLICT (content_item_id, language_code) DO UPDATE SET content_value = EXCLUDED.content_value;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'he', 'תחום פעילות', 'approved'
FROM content_items ci WHERE ci.content_key = 'refinance_step3.field.field_of_activity_label'
ON CONFLICT (content_item_id, language_code) DO UPDATE SET content_value = EXCLUDED.content_value;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'ru', 'Сфера деятельности', 'approved'
FROM content_items ci WHERE ci.content_key = 'refinance_step3.field.field_of_activity_label'
ON CONFLICT (content_item_id, language_code) DO UPDATE SET content_value = EXCLUDED.content_value;

-- 4) Placeholder (placeholder)
INSERT INTO content_items (content_key, screen_location, component_type, category, is_active)
VALUES ('refinance_step3.field.field_of_activity_ph', 'refinance_step3', 'placeholder', 'form', true)
ON CONFLICT (content_key) DO UPDATE SET is_active = EXCLUDED.is_active;

-- Placeholder translations
INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'en', 'Select field of activity', 'approved'
FROM content_items ci WHERE ci.content_key = 'refinance_step3.field.field_of_activity_ph'
ON CONFLICT (content_item_id, language_code) DO UPDATE SET content_value = EXCLUDED.content_value;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'he', 'בחר תחום פעילות', 'approved'
FROM content_items ci WHERE ci.content_key = 'refinance_step3.field.field_of_activity_ph'
ON CONFLICT (content_item_id, language_code) DO UPDATE SET content_value = EXCLUDED.content_value;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'ru', 'Выберите сферу деятельности', 'approved'
FROM content_items ci WHERE ci.content_key = 'refinance_step3.field.field_of_activity_ph'
ON CONFLICT (content_item_id, language_code) DO UPDATE SET content_value = EXCLUDED.content_value;

-- End of migration
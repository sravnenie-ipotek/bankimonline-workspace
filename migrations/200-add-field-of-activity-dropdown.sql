-- Migration: Add Field of Activity Dropdown Content
-- Following dropDownsInDBLogic.md structure

-- Add main dropdown container
INSERT INTO content_items (content_key, component_type, screen_location, category, is_active)
VALUES ('mortgage_step3_field_of_activity', 'dropdown', 'mortgage_step3', 'form', true);

-- Add dropdown options
INSERT INTO content_items (content_key, component_type, screen_location, category, is_active)
VALUES 
('mortgage_step3_field_of_activity_agriculture', 'option', 'mortgage_step3', 'form', true),
('mortgage_step3_field_of_activity_technology', 'option', 'mortgage_step3', 'form', true),
('mortgage_step3_field_of_activity_healthcare', 'option', 'mortgage_step3', 'form', true),
('mortgage_step3_field_of_activity_education', 'option', 'mortgage_step3', 'form', true),
('mortgage_step3_field_of_activity_finance', 'option', 'mortgage_step3', 'form', true),
('mortgage_step3_field_of_activity_real_estate', 'option', 'mortgage_step3', 'form', true),
('mortgage_step3_field_of_activity_construction', 'option', 'mortgage_step3', 'form', true),
('mortgage_step3_field_of_activity_retail', 'option', 'mortgage_step3', 'form', true),
('mortgage_step3_field_of_activity_manufacturing', 'option', 'mortgage_step3', 'form', true),
('mortgage_step3_field_of_activity_government', 'option', 'mortgage_step3', 'form', true),
('mortgage_step3_field_of_activity_transport', 'option', 'mortgage_step3', 'form', true),
('mortgage_step3_field_of_activity_consulting', 'option', 'mortgage_step3', 'form', true),
('mortgage_step3_field_of_activity_entertainment', 'option', 'mortgage_step3', 'form', true),
('mortgage_step3_field_of_activity_other', 'option', 'mortgage_step3', 'form', true);

-- Add placeholder
INSERT INTO content_items (content_key, component_type, screen_location, category, is_active)
VALUES ('mortgage_step3_field_of_activity_ph', 'placeholder', 'mortgage_step3', 'form', true);

-- Add label
INSERT INTO content_items (content_key, component_type, screen_location, category, is_active)
VALUES ('mortgage_step3_field_of_activity_label', 'label', 'mortgage_step3', 'form', true);

-- Add translations for main dropdown
INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'en', 'Field of Activity', 'approved'
FROM content_items ci 
WHERE ci.content_key = 'mortgage_step3_field_of_activity_label';

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'he', 'תחום פעילות', 'approved'
FROM content_items ci 
WHERE ci.content_key = 'mortgage_step3_field_of_activity_label';

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'ru', 'Сфера деятельности', 'approved'
FROM content_items ci 
WHERE ci.content_key = 'mortgage_step3_field_of_activity_label';

-- Add translations for placeholder
INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'en', 'Select field of activity', 'approved'
FROM content_items ci 
WHERE ci.content_key = 'mortgage_step3_field_of_activity_ph';

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'he', 'בחר תחום פעילות', 'approved'
FROM content_items ci 
WHERE ci.content_key = 'mortgage_step3_field_of_activity_ph';

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'ru', 'Выберите сферу деятельности', 'approved'
FROM content_items ci 
WHERE ci.content_key = 'mortgage_step3_field_of_activity_ph';

-- Add translations for options (English)
INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'en', 'Agriculture, Forestry, Fishing', 'approved'
FROM content_items ci 
WHERE ci.content_key = 'mortgage_step3_field_of_activity_agriculture';

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'en', 'Technology and Communications', 'approved'
FROM content_items ci 
WHERE ci.content_key = 'mortgage_step3_field_of_activity_technology';

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'en', 'Healthcare and Social Services', 'approved'
FROM content_items ci 
WHERE ci.content_key = 'mortgage_step3_field_of_activity_healthcare';

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'en', 'Education and Training', 'approved'
FROM content_items ci 
WHERE ci.content_key = 'mortgage_step3_field_of_activity_education';

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'en', 'Finance and Banking', 'approved'
FROM content_items ci 
WHERE ci.content_key = 'mortgage_step3_field_of_activity_finance';

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'en', 'Real Estate', 'approved'
FROM content_items ci 
WHERE ci.content_key = 'mortgage_step3_field_of_activity_real_estate';

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'en', 'Construction', 'approved'
FROM content_items ci 
WHERE ci.content_key = 'mortgage_step3_field_of_activity_construction';

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'en', 'Retail and Trade', 'approved'
FROM content_items ci 
WHERE ci.content_key = 'mortgage_step3_field_of_activity_retail';

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'en', 'Manufacturing and Industry', 'approved'
FROM content_items ci 
WHERE ci.content_key = 'mortgage_step3_field_of_activity_manufacturing';

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'en', 'Government and Public Service', 'approved'
FROM content_items ci 
WHERE ci.content_key = 'mortgage_step3_field_of_activity_government';

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'en', 'Transport and Logistics', 'approved'
FROM content_items ci 
WHERE ci.content_key = 'mortgage_step3_field_of_activity_transport';

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'en', 'Consulting and Professional Services', 'approved'
FROM content_items ci 
WHERE ci.content_key = 'mortgage_step3_field_of_activity_consulting';

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'en', 'Entertainment and Media', 'approved'
FROM content_items ci 
WHERE ci.content_key = 'mortgage_step3_field_of_activity_entertainment';

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'en', 'Other', 'approved'
FROM content_items ci 
WHERE ci.content_key = 'mortgage_step3_field_of_activity_other';

-- Add translations for options (Hebrew)
INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'he', 'חקלאות, יערנות ודיג', 'approved'
FROM content_items ci 
WHERE ci.content_key = 'mortgage_step3_field_of_activity_agriculture';

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'he', 'טכנולוגיה ותקשורת', 'approved'
FROM content_items ci 
WHERE ci.content_key = 'mortgage_step3_field_of_activity_technology';

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'he', 'בריאות ושירותים חברתיים', 'approved'
FROM content_items ci 
WHERE ci.content_key = 'mortgage_step3_field_of_activity_healthcare';

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'he', 'חינוך והכשרה', 'approved'
FROM content_items ci 
WHERE ci.content_key = 'mortgage_step3_field_of_activity_education';

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'he', 'פיננסים ובנקאות', 'approved'
FROM content_items ci 
WHERE ci.content_key = 'mortgage_step3_field_of_activity_finance';

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'he', 'נדל"ן', 'approved'
FROM content_items ci 
WHERE ci.content_key = 'mortgage_step3_field_of_activity_real_estate';

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'he', 'בנייה', 'approved'
FROM content_items ci 
WHERE ci.content_key = 'mortgage_step3_field_of_activity_construction';

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'he', 'מסחר קמעונאי', 'approved'
FROM content_items ci 
WHERE ci.content_key = 'mortgage_step3_field_of_activity_retail';

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'he', 'תעשייה וייצור', 'approved'
FROM content_items ci 
WHERE ci.content_key = 'mortgage_step3_field_of_activity_manufacturing';

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'he', 'ממשלה ושירות ציבורי', 'approved'
FROM content_items ci 
WHERE ci.content_key = 'mortgage_step3_field_of_activity_government';

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'he', 'תחבורה ולוגיסטיקה', 'approved'
FROM content_items ci 
WHERE ci.content_key = 'mortgage_step3_field_of_activity_transport';

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'he', 'ייעוץ ושירותים מקצועיים', 'approved'
FROM content_items ci 
WHERE ci.content_key = 'mortgage_step3_field_of_activity_consulting';

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'he', 'בידור ומדיה', 'approved'
FROM content_items ci 
WHERE ci.content_key = 'mortgage_step3_field_of_activity_entertainment';

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'he', 'אחר', 'approved'
FROM content_items ci 
WHERE ci.content_key = 'mortgage_step3_field_of_activity_other';

-- Add translations for options (Russian)
INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'ru', 'Сельское хозяйство, лесное хозяйство и рыболовство', 'approved'
FROM content_items ci 
WHERE ci.content_key = 'mortgage_step3_field_of_activity_agriculture';

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'ru', 'Технологии и коммуникации', 'approved'
FROM content_items ci 
WHERE ci.content_key = 'mortgage_step3_field_of_activity_technology';

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'ru', 'Здравоохранение и социальные услуги', 'approved'
FROM content_items ci 
WHERE ci.content_key = 'mortgage_step3_field_of_activity_healthcare';

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'ru', 'Образование и обучение', 'approved'
FROM content_items ci 
WHERE ci.content_key = 'mortgage_step3_field_of_activity_education';

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'ru', 'Финансы и банковское дело', 'approved'
FROM content_items ci 
WHERE ci.content_key = 'mortgage_step3_field_of_activity_finance';

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'ru', 'Недвижимость', 'approved'
FROM content_items ci 
WHERE ci.content_key = 'mortgage_step3_field_of_activity_real_estate';

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'ru', 'Строительство', 'approved'
FROM content_items ci 
WHERE ci.content_key = 'mortgage_step3_field_of_activity_construction';

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'ru', 'Розничная торговля', 'approved'
FROM content_items ci 
WHERE ci.content_key = 'mortgage_step3_field_of_activity_retail';

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'ru', 'Производство и промышленность', 'approved'
FROM content_items ci 
WHERE ci.content_key = 'mortgage_step3_field_of_activity_manufacturing';

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'ru', 'Государственная служба', 'approved'
FROM content_items ci 
WHERE ci.content_key = 'mortgage_step3_field_of_activity_government';

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'ru', 'Транспорт и логистика', 'approved'
FROM content_items ci 
WHERE ci.content_key = 'mortgage_step3_field_of_activity_transport';

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'ru', 'Консалтинг и профессиональные услуги', 'approved'
FROM content_items ci 
WHERE ci.content_key = 'mortgage_step3_field_of_activity_consulting';

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'ru', 'Развлечения и медиа', 'approved'
FROM content_items ci 
WHERE ci.content_key = 'mortgage_step3_field_of_activity_entertainment';

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'ru', 'Другое', 'approved'
FROM content_items ci 
WHERE ci.content_key = 'mortgage_step3_field_of_activity_other'; 
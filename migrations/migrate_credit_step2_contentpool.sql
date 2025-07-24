-- Migration: Credit Calculator Step 2 Content (ContentPool Structure)
-- Creates content_items and translations for /services/calculate-credit/2
-- Uses contentPool table structure: content_key, is_active, content_value

-- Insert content items for credit step 2
INSERT INTO content_items (
    content_key, 
    component_type, 
    category, 
    screen_location, 
    is_active,
    created_at,
    updated_at
) VALUES 
-- Main title
('calculate_credit_step2_title', 'title', 'navigation', 'calculate_credit_2', true, NOW(), NOW()),

-- Education field
('calculate_credit_education', 'field_label', 'personal_details', 'calculate_credit_2', true, NOW(), NOW()),
('calculate_credit_education_ph', 'placeholder', 'personal_details', 'calculate_credit_2', true, NOW(), NOW()),
('calculate_credit_education_option_1', 'option', 'personal_details', 'calculate_credit_2', true, NOW(), NOW()),
('calculate_credit_education_option_2', 'option', 'personal_details', 'calculate_credit_2', true, NOW(), NOW()),
('calculate_credit_education_option_3', 'option', 'personal_details', 'calculate_credit_2', true, NOW(), NOW()),
('calculate_credit_education_option_4', 'option', 'personal_details', 'calculate_credit_2', true, NOW(), NOW()),
('calculate_credit_education_option_5', 'option', 'personal_details', 'calculate_credit_2', true, NOW(), NOW()),
('calculate_credit_education_option_6', 'option', 'personal_details', 'calculate_credit_2', true, NOW(), NOW()),
('calculate_credit_education_option_7', 'option', 'personal_details', 'calculate_credit_2', true, NOW(), NOW()),

-- Family Status field
('calculate_credit_family_status', 'field_label', 'personal_details', 'calculate_credit_2', true, NOW(), NOW()),
('calculate_credit_family_status_ph', 'placeholder', 'personal_details', 'calculate_credit_2', true, NOW(), NOW()),
('calculate_credit_family_status_option_1', 'option', 'personal_details', 'calculate_credit_2', true, NOW(), NOW()),
('calculate_credit_family_status_option_2', 'option', 'personal_details', 'calculate_credit_2', true, NOW(), NOW()),
('calculate_credit_family_status_option_3', 'option', 'personal_details', 'calculate_credit_2', true, NOW(), NOW()),
('calculate_credit_family_status_option_4', 'option', 'personal_details', 'calculate_credit_2', true, NOW(), NOW()),
('calculate_credit_family_status_option_5', 'option', 'personal_details', 'calculate_credit_2', true, NOW(), NOW()),
('calculate_credit_family_status_option_6', 'option', 'personal_details', 'calculate_credit_2', true, NOW(), NOW()),

-- Citizenship field
('calculate_credit_citizenship', 'field_label', 'personal_details', 'calculate_credit_2', true, NOW(), NOW()),
('calculate_credit_citizenship_ph', 'placeholder', 'personal_details', 'calculate_credit_2', true, NOW(), NOW()),
('calculate_credit_citizenship_option_1', 'option', 'personal_details', 'calculate_credit_2', true, NOW(), NOW()),
('calculate_credit_citizenship_option_2', 'option', 'personal_details', 'calculate_credit_2', true, NOW(), NOW()),
('calculate_credit_citizenship_option_3', 'option', 'personal_details', 'calculate_credit_2', true, NOW(), NOW()),

-- Medical Insurance field
('calculate_credit_medical_insurance', 'field_label', 'personal_details', 'calculate_credit_2', true, NOW(), NOW()),
('calculate_credit_medical_insurance_option_1', 'option', 'personal_details', 'calculate_credit_2', true, NOW(), NOW()),
('calculate_credit_medical_insurance_option_2', 'option', 'personal_details', 'calculate_credit_2', true, NOW(), NOW()),

-- Foreigner field
('calculate_credit_foreigner', 'field_label', 'personal_details', 'calculate_credit_2', true, NOW(), NOW()),
('calculate_credit_foreigner_option_1', 'option', 'personal_details', 'calculate_credit_2', true, NOW(), NOW()),
('calculate_credit_foreigner_option_2', 'option', 'personal_details', 'calculate_credit_2', true, NOW(), NOW()),

-- Public Person field
('calculate_credit_public_person', 'field_label', 'personal_details', 'calculate_credit_2', true, NOW(), NOW()),
('calculate_credit_public_person_option_1', 'option', 'personal_details', 'calculate_credit_2', true, NOW(), NOW()),
('calculate_credit_public_person_option_2', 'option', 'personal_details', 'calculate_credit_2', true, NOW(), NOW()),

-- US Tax Reporting field
('calculate_credit_us_tax_reporting', 'field_label', 'personal_details', 'calculate_credit_2', true, NOW(), NOW()),
('calculate_credit_us_tax_reporting_option_1', 'option', 'personal_details', 'calculate_credit_2', true, NOW(), NOW()),
('calculate_credit_us_tax_reporting_option_2', 'option', 'personal_details', 'calculate_credit_2', true, NOW(), NOW()),

-- Navigation buttons
('calculate_credit_step2_next_button', 'button', 'navigation', 'calculate_credit_2', true, NOW(), NOW()),
('calculate_credit_step2_back_button', 'button', 'navigation', 'calculate_credit_2', true, NOW(), NOW())

ON CONFLICT (content_key) DO NOTHING;

-- Insert translations for all content items
-- English translations
INSERT INTO content_translations (content_item_id, language_code, content_value, status, created_at, updated_at)
SELECT 
    ci.id,
    'en',
    CASE ci.content_key
        -- Main title
        WHEN 'calculate_credit_step2_title' THEN 'Personal Details'
        
        -- Education field
        WHEN 'calculate_credit_education' THEN 'Education Level'
        WHEN 'calculate_credit_education_ph' THEN 'Please select your education level'
        WHEN 'calculate_credit_education_option_1' THEN 'Elementary School'
        WHEN 'calculate_credit_education_option_2' THEN 'High School'
        WHEN 'calculate_credit_education_option_3' THEN 'Professional Certificate'
        WHEN 'calculate_credit_education_option_4' THEN 'Bachelor''s Degree'
        WHEN 'calculate_credit_education_option_5' THEN 'Master''s Degree'
        WHEN 'calculate_credit_education_option_6' THEN 'Doctorate'
        WHEN 'calculate_credit_education_option_7' THEN 'Other'
        
        -- Family Status field
        WHEN 'calculate_credit_family_status' THEN 'Family Status'
        WHEN 'calculate_credit_family_status_ph' THEN 'Please select your family status'
        WHEN 'calculate_credit_family_status_option_1' THEN 'Single'
        WHEN 'calculate_credit_family_status_option_2' THEN 'Married'
        WHEN 'calculate_credit_family_status_option_3' THEN 'Divorced'
        WHEN 'calculate_credit_family_status_option_4' THEN 'Widowed'
        WHEN 'calculate_credit_family_status_option_5' THEN 'Common Law Marriage'
        WHEN 'calculate_credit_family_status_option_6' THEN 'Other'
        
        -- Citizenship field
        WHEN 'calculate_credit_citizenship' THEN 'Citizenship Status'
        WHEN 'calculate_credit_citizenship_ph' THEN 'Please select your citizenship status'
        WHEN 'calculate_credit_citizenship_option_1' THEN 'Israeli Citizen'
        WHEN 'calculate_credit_citizenship_option_2' THEN 'New Immigrant'
        WHEN 'calculate_credit_citizenship_option_3' THEN 'Foreign Resident'
        
        -- Medical Insurance field
        WHEN 'calculate_credit_medical_insurance' THEN 'Do you have medical insurance?'
        WHEN 'calculate_credit_medical_insurance_option_1' THEN 'Yes'
        WHEN 'calculate_credit_medical_insurance_option_2' THEN 'No'
        
        -- Foreigner field
        WHEN 'calculate_credit_foreigner' THEN 'Are you a foreign resident?'
        WHEN 'calculate_credit_foreigner_option_1' THEN 'Yes'
        WHEN 'calculate_credit_foreigner_option_2' THEN 'No'
        
        -- Public Person field
        WHEN 'calculate_credit_public_person' THEN 'Are you a public person or PEP?'
        WHEN 'calculate_credit_public_person_option_1' THEN 'Yes'
        WHEN 'calculate_credit_public_person_option_2' THEN 'No'
        
        -- US Tax Reporting field
        WHEN 'calculate_credit_us_tax_reporting' THEN 'Do you report to US tax authorities?'
        WHEN 'calculate_credit_us_tax_reporting_option_1' THEN 'Yes'
        WHEN 'calculate_credit_us_tax_reporting_option_2' THEN 'No'
        
        -- Navigation buttons
        WHEN 'calculate_credit_step2_next_button' THEN 'Continue'
        WHEN 'calculate_credit_step2_back_button' THEN 'Back'
        
        ELSE ci.content_key
    END,
    'approved',
    NOW(),
    NOW()
FROM content_items ci
WHERE ci.screen_location = 'calculate_credit_2'
ON CONFLICT (content_item_id, language_code) DO NOTHING;

-- Hebrew translations
INSERT INTO content_translations (content_item_id, language_code, content_value, status, created_at, updated_at)
SELECT 
    ci.id,
    'he',
    CASE ci.content_key
        -- Main title
        WHEN 'calculate_credit_step2_title' THEN 'פרטים אישיים'
        
        -- Education field
        WHEN 'calculate_credit_education' THEN 'רמת השכלה'
        WHEN 'calculate_credit_education_ph' THEN 'אנא בחר את רמת השכלתך'
        WHEN 'calculate_credit_education_option_1' THEN 'בית ספר יסודי'
        WHEN 'calculate_credit_education_option_2' THEN 'תיכון'
        WHEN 'calculate_credit_education_option_3' THEN 'תعודה מקצועית'
        WHEN 'calculate_credit_education_option_4' THEN 'תואר ראשון'
        WHEN 'calculate_credit_education_option_5' THEN 'תואר שני'
        WHEN 'calculate_credit_education_option_6' THEN 'דוקטורט'
        WHEN 'calculate_credit_education_option_7' THEN 'אחר'
        
        -- Family Status field
        WHEN 'calculate_credit_family_status' THEN 'מצב משפחתי'
        WHEN 'calculate_credit_family_status_ph' THEN 'אנא בחר את מצבך המשפחתי'
        WHEN 'calculate_credit_family_status_option_1' THEN 'רווק/ה'
        WHEN 'calculate_credit_family_status_option_2' THEN 'נשוי/אה'
        WHEN 'calculate_credit_family_status_option_3' THEN 'גרוש/ה'
        WHEN 'calculate_credit_family_status_option_4' THEN 'אלמן/ה'
        WHEN 'calculate_credit_family_status_option_5' THEN 'זוגיות ללא נישואין'
        WHEN 'calculate_credit_family_status_option_6' THEN 'אחר'
        
        -- Citizenship field
        WHEN 'calculate_credit_citizenship' THEN 'סטטוס אזרחות'
        WHEN 'calculate_credit_citizenship_ph' THEN 'אנא בחר את סטטוס האזרחות שלך'
        WHEN 'calculate_credit_citizenship_option_1' THEN 'אזרח ישראלי'
        WHEN 'calculate_credit_citizenship_option_2' THEN 'עולה חדש'
        WHEN 'calculate_credit_citizenship_option_3' THEN 'תושב זר'
        
        -- Medical Insurance field
        WHEN 'calculate_credit_medical_insurance' THEN 'האם יש לך ביטוח רפואי?'
        WHEN 'calculate_credit_medical_insurance_option_1' THEN 'כן'
        WHEN 'calculate_credit_medical_insurance_option_2' THEN 'לא'
        
        -- Foreigner field
        WHEN 'calculate_credit_foreigner' THEN 'האם אתה תושב זר?'
        WHEN 'calculate_credit_foreigner_option_1' THEN 'כן'
        WHEN 'calculate_credit_foreigner_option_2' THEN 'לא'
        
        -- Public Person field
        WHEN 'calculate_credit_public_person' THEN 'האם אתה איש ציבור או PEP?'
        WHEN 'calculate_credit_public_person_option_1' THEN 'כן'
        WHEN 'calculate_credit_public_person_option_2' THEN 'לא'
        
        -- US Tax Reporting field
        WHEN 'calculate_credit_us_tax_reporting' THEN 'האם אתה מדווח לרשויות המס האמריקניות?'
        WHEN 'calculate_credit_us_tax_reporting_option_1' THEN 'כן'
        WHEN 'calculate_credit_us_tax_reporting_option_2' THEN 'לא'
        
        -- Navigation buttons
        WHEN 'calculate_credit_step2_next_button' THEN 'המשך'
        WHEN 'calculate_credit_step2_back_button' THEN 'חזרה'
        
        ELSE ci.content_key
    END,
    'approved',
    NOW(),
    NOW()
FROM content_items ci
WHERE ci.screen_location = 'calculate_credit_2'
ON CONFLICT (content_item_id, language_code) DO NOTHING;

-- Russian translations
INSERT INTO content_translations (content_item_id, language_code, content_value, status, created_at, updated_at)
SELECT 
    ci.id,
    'ru',
    CASE ci.content_key
        -- Main title
        WHEN 'calculate_credit_step2_title' THEN 'Личные данные'
        
        -- Education field
        WHEN 'calculate_credit_education' THEN 'Уровень образования'
        WHEN 'calculate_credit_education_ph' THEN 'Пожалуйста, выберите ваш уровень образования'
        WHEN 'calculate_credit_education_option_1' THEN 'Начальная школа'
        WHEN 'calculate_credit_education_option_2' THEN 'Средняя школа'
        WHEN 'calculate_credit_education_option_3' THEN 'Профессиональный сертификат'
        WHEN 'calculate_credit_education_option_4' THEN 'Степень бакалавра'
        WHEN 'calculate_credit_education_option_5' THEN 'Степень магистра'
        WHEN 'calculate_credit_education_option_6' THEN 'Докторская степень'
        WHEN 'calculate_credit_education_option_7' THEN 'Другое'
        
        -- Family Status field
        WHEN 'calculate_credit_family_status' THEN 'Семейное положение'
        WHEN 'calculate_credit_family_status_ph' THEN 'Пожалуйста, выберите ваше семейное положение'
        WHEN 'calculate_credit_family_status_option_1' THEN 'Холост/не замужем'
        WHEN 'calculate_credit_family_status_option_2' THEN 'Женат/замужем'
        WHEN 'calculate_credit_family_status_option_3' THEN 'Разведен/а'
        WHEN 'calculate_credit_family_status_option_4' THEN 'Вдовец/вдова'
        WHEN 'calculate_credit_family_status_option_5' THEN 'Гражданский брак'
        WHEN 'calculate_credit_family_status_option_6' THEN 'Другое'
        
        -- Citizenship field
        WHEN 'calculate_credit_citizenship' THEN 'Статус гражданства'
        WHEN 'calculate_credit_citizenship_ph' THEN 'Пожалуйста, выберите ваш статус гражданства'
        WHEN 'calculate_credit_citizenship_option_1' THEN 'Гражданин Израиля'
        WHEN 'calculate_credit_citizenship_option_2' THEN 'Новый иммигрант'
        WHEN 'calculate_credit_citizenship_option_3' THEN 'Иностранный резидент'
        
        -- Medical Insurance field
        WHEN 'calculate_credit_medical_insurance' THEN 'Есть ли у вас медицинская страховка?'
        WHEN 'calculate_credit_medical_insurance_option_1' THEN 'Да'
        WHEN 'calculate_credit_medical_insurance_option_2' THEN 'Нет'
        
        -- Foreigner field
        WHEN 'calculate_credit_foreigner' THEN 'Являетесь ли вы иностранным резидентом?'
        WHEN 'calculate_credit_foreigner_option_1' THEN 'Да'
        WHEN 'calculate_credit_foreigner_option_2' THEN 'Нет'
        
        -- Public Person field
        WHEN 'calculate_credit_public_person' THEN 'Являетесл>ы вы публичным лицом или PEP?'
        WHEN 'calculate_credit_public_person_option_1' THEN 'Да'
        WHEN 'calculate_credit_public_person_option_2' THEN 'Нет'
        
        -- US Tax Reporting field
        WHEN 'calculate_credit_us_tax_reporting' THEN 'Отчитываетесь ли вы перед налоговыми органами США?'
        WHEN 'calculate_credit_us_tax_reporting_option_1' THEN 'Да'
        WHEN 'calculate_credit_us_tax_reporting_option_2' THEN 'Нет'
        
        -- Navigation buttons
        WHEN 'calculate_credit_step2_next_button' THEN 'Продолжить'
        WHEN 'calculate_credit_step2_back_button' THEN 'Назад'
        
        ELSE ci.content_key
    END,
    'approved',
    NOW(),
    NOW()
FROM content_items ci
WHERE ci.screen_location = 'calculate_credit_2'
ON CONFLICT (content_item_id, language_code) DO NOTHING;
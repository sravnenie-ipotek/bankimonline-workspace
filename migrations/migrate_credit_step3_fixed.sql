-- Migration: Credit Calculator Step 3 Content
-- Creates content_items and translations for /services/calculate-credit/3
-- Based on mortgage step 3 structure for consistency

-- Insert content items for credit step 3
INSERT INTO content_items (
    key, 
    component_type, 
    category, 
    screen_location, 
    status,
    created_at,
    updated_at
) VALUES 
-- Main title
('calculate_credit_step3_title', 'title', 'navigation', 'calculate_credit_3', 'active', NOW(), NOW()),

-- Main Source of Income field
('calculate_credit_main_source_income', 'field_label', 'income_details', 'calculate_credit_3', 'active', NOW(), NOW()),
('calculate_credit_main_source_income_ph', 'placeholder', 'income_details', 'calculate_credit_3', 'active', NOW(), NOW()),
('calculate_credit_main_source_income_option_1', 'option', 'income_details', 'calculate_credit_3', 'active', NOW(), NOW()),
('calculate_credit_main_source_income_option_2', 'option', 'income_details', 'calculate_credit_3', 'active', NOW(), NOW()),
('calculate_credit_main_source_income_option_3', 'option', 'income_details', 'calculate_credit_3', 'active', NOW(), NOW()),
('calculate_credit_main_source_income_option_4', 'option', 'income_details', 'calculate_credit_3', 'active', NOW(), NOW()),
('calculate_credit_main_source_income_option_5', 'option', 'income_details', 'calculate_credit_3', 'active', NOW(), NOW()),
('calculate_credit_main_source_income_option_6', 'option', 'income_details', 'calculate_credit_3', 'active', NOW(), NOW()),
('calculate_credit_main_source_income_option_7', 'option', 'income_details', 'calculate_credit_3', 'active', NOW(), NOW()),

-- Additional Income field
('calculate_credit_additional_income', 'field_label', 'income_details', 'calculate_credit_3', 'active', NOW(), NOW()),
('calculate_credit_additional_income_ph', 'placeholder', 'income_details', 'calculate_credit_3', 'active', NOW(), NOW()),
('calculate_credit_additional_income_option_1', 'option', 'income_details', 'calculate_credit_3', 'active', NOW(), NOW()),
('calculate_credit_additional_income_option_2', 'option', 'income_details', 'calculate_credit_3', 'active', NOW(), NOW()),
('calculate_credit_additional_income_option_3', 'option', 'income_details', 'calculate_credit_3', 'active', NOW(), NOW()),
('calculate_credit_additional_income_option_4', 'option', 'income_details', 'calculate_credit_3', 'active', NOW(), NOW()),
('calculate_credit_additional_income_option_5', 'option', 'income_details', 'calculate_credit_3', 'active', NOW(), NOW()),
('calculate_credit_additional_income_option_6', 'option', 'income_details', 'calculate_credit_3', 'active', NOW(), NOW()),
('calculate_credit_additional_income_option_7', 'option', 'income_details', 'calculate_credit_3', 'active', NOW(), NOW()),

-- Professional Sphere field
('calculate_credit_professional_sphere', 'field_label', 'income_details', 'calculate_credit_3', 'active', NOW(), NOW()),
('calculate_credit_professional_sphere_ph', 'placeholder', 'income_details', 'calculate_credit_3', 'active', NOW(), NOW()),
('calculate_credit_professional_sphere_option_1', 'option', 'income_details', 'calculate_credit_3', 'active', NOW(), NOW()),
('calculate_credit_professional_sphere_option_2', 'option', 'income_details', 'calculate_credit_3', 'active', NOW(), NOW()),
('calculate_credit_professional_sphere_option_3', 'option', 'income_details', 'calculate_credit_3', 'active', NOW(), NOW()),
('calculate_credit_professional_sphere_option_4', 'option', 'income_details', 'calculate_credit_3', 'active', NOW(), NOW()),
('calculate_credit_professional_sphere_option_5', 'option', 'income_details', 'calculate_credit_3', 'active', NOW(), NOW()),
('calculate_credit_professional_sphere_option_6', 'option', 'income_details', 'calculate_credit_3', 'active', NOW(), NOW()),
('calculate_credit_professional_sphere_option_7', 'option', 'income_details', 'calculate_credit_3', 'active', NOW(), NOW()),
('calculate_credit_professional_sphere_option_8', 'option', 'income_details', 'calculate_credit_3', 'active', NOW(), NOW()),
('calculate_credit_professional_sphere_option_9', 'option', 'income_details', 'calculate_credit_3', 'active', NOW(), NOW()),
('calculate_credit_professional_sphere_option_10', 'option', 'income_details', 'calculate_credit_3', 'active', NOW(), NOW()),

-- Monthly Income field
('calculate_credit_monthly_income', 'field_label', 'income_details', 'calculate_credit_3', 'active', NOW(), NOW()),
('calculate_credit_monthly_income_ph', 'placeholder', 'income_details', 'calculate_credit_3', 'active', NOW(), NOW()),

-- Existing Debts field
('calculate_credit_existing_debts', 'field_label', 'income_details', 'calculate_credit_3', 'active', NOW(), NOW()),
('calculate_credit_existing_debts_ph', 'placeholder', 'income_details', 'calculate_credit_3', 'active', NOW(), NOW()),
('calculate_credit_existing_debts_option_1', 'option', 'income_details', 'calculate_credit_3', 'active', NOW(), NOW()),
('calculate_credit_existing_debts_option_2', 'option', 'income_details', 'calculate_credit_3', 'active', NOW(), NOW()),
('calculate_credit_existing_debts_option_3', 'option', 'income_details', 'calculate_credit_3', 'active', NOW(), NOW()),
('calculate_credit_existing_debts_option_4', 'option', 'income_details', 'calculate_credit_3', 'active', NOW(), NOW()),
('calculate_credit_existing_debts_option_5', 'option', 'income_details', 'calculate_credit_3', 'active', NOW(), NOW()),

-- Monthly Debt Payments field
('calculate_credit_monthly_debt_payments', 'field_label', 'income_details', 'calculate_credit_3', 'active', NOW(), NOW()),
('calculate_credit_monthly_debt_payments_ph', 'placeholder', 'income_details', 'calculate_credit_3', 'active', NOW(), NOW()),

-- Navigation buttons
('calculate_credit_step3_next_button', 'button', 'navigation', 'calculate_credit_3', 'active', NOW(), NOW()),
('calculate_credit_step3_back_button', 'button', 'navigation', 'calculate_credit_3', 'active', NOW(), NOW())

ON CONFLICT (key, screen_location) DO NOTHING;

-- Insert translations for all content items
-- English translations
INSERT INTO content_translations (content_item_id, language_code, value, status, created_at, updated_at)
SELECT 
    ci.id,
    'en',
    CASE ci.key
        -- Main title
        WHEN 'calculate_credit_step3_title' THEN 'Income & Financial Details'
        
        -- Main Source of Income field
        WHEN 'calculate_credit_main_source_income' THEN 'Main Source of Income'
        WHEN 'calculate_credit_main_source_income_ph' THEN 'Please select your main source of income'
        WHEN 'calculate_credit_main_source_income_option_1' THEN 'Salary'
        WHEN 'calculate_credit_main_source_income_option_2' THEN 'Self-employed'
        WHEN 'calculate_credit_main_source_income_option_3' THEN 'Pension'
        WHEN 'calculate_credit_main_source_income_option_4' THEN 'Unemployment Benefits'
        WHEN 'calculate_credit_main_source_income_option_5' THEN 'Investment Income'
        WHEN 'calculate_credit_main_source_income_option_6' THEN 'Student Allowance'
        WHEN 'calculate_credit_main_source_income_option_7' THEN 'Other'
        
        -- Additional Income field
        WHEN 'calculate_credit_additional_income' THEN 'Additional Income Sources'
        WHEN 'calculate_credit_additional_income_ph' THEN 'Select any additional income sources'
        WHEN 'calculate_credit_additional_income_option_1' THEN 'Part-time Work'
        WHEN 'calculate_credit_additional_income_option_2' THEN 'Freelance Work'
        WHEN 'calculate_credit_additional_income_option_3' THEN 'Rental Income'
        WHEN 'calculate_credit_additional_income_option_4' THEN 'Investment Returns'
        WHEN 'calculate_credit_additional_income_option_5' THEN 'Business Income'
        WHEN 'calculate_credit_additional_income_option_6' THEN 'Government Benefits'
        WHEN 'calculate_credit_additional_income_option_7' THEN 'None'
        
        -- Professional Sphere field
        WHEN 'calculate_credit_professional_sphere' THEN 'Professional Sphere'
        WHEN 'calculate_credit_professional_sphere_ph' THEN 'Please select your professional field'
        WHEN 'calculate_credit_professional_sphere_option_1' THEN 'Technology/IT'
        WHEN 'calculate_credit_professional_sphere_option_2' THEN 'Healthcare/Medical'
        WHEN 'calculate_credit_professional_sphere_option_3' THEN 'Education'
        WHEN 'calculate_credit_professional_sphere_option_4' THEN 'Finance/Banking'
        WHEN 'calculate_credit_professional_sphere_option_5' THEN 'Legal Services'
        WHEN 'calculate_credit_professional_sphere_option_6' THEN 'Manufacturing'
        WHEN 'calculate_credit_professional_sphere_option_7' THEN 'Sales/Marketing'
        WHEN 'calculate_credit_professional_sphere_option_8' THEN 'Public Service'
        WHEN 'calculate_credit_professional_sphere_option_9' THEN 'Construction'
        WHEN 'calculate_credit_professional_sphere_option_10' THEN 'Other'
        
        -- Monthly Income field
        WHEN 'calculate_credit_monthly_income' THEN 'Monthly Income (₪)'
        WHEN 'calculate_credit_monthly_income_ph' THEN 'Enter your total monthly income in NIS'
        
        -- Existing Debts field
        WHEN 'calculate_credit_existing_debts' THEN 'Existing Debts'
        WHEN 'calculate_credit_existing_debts_ph' THEN 'Select any existing debt types'
        WHEN 'calculate_credit_existing_debts_option_1' THEN 'Mortgage Loan'
        WHEN 'calculate_credit_existing_debts_option_2' THEN 'Personal Loan'
        WHEN 'calculate_credit_existing_debts_option_3' THEN 'Credit Card Debt'
        WHEN 'calculate_credit_existing_debts_option_4' THEN 'Car Loan'
        WHEN 'calculate_credit_existing_debts_option_5' THEN 'No Existing Debts'
        
        -- Monthly Debt Payments field
        WHEN 'calculate_credit_monthly_debt_payments' THEN 'Monthly Debt Payments (₪)'
        WHEN 'calculate_credit_monthly_debt_payments_ph' THEN 'Enter your total monthly debt payments in NIS'
        
        -- Navigation buttons
        WHEN 'calculate_credit_step3_next_button' THEN 'Continue'
        WHEN 'calculate_credit_step3_back_button' THEN 'Back'
        
        ELSE ci.key
    END,
    'approved',
    NOW(),
    NOW()
FROM content_items ci
WHERE ci.screen_location = 'calculate_credit_3'
ON CONFLICT (content_item_id, language_code) DO NOTHING;

-- Hebrew translations
INSERT INTO content_translations (content_item_id, language_code, value, status, created_at, updated_at)
SELECT 
    ci.id,
    'he',
    CASE ci.key
        -- Main title
        WHEN 'calculate_credit_step3_title' THEN 'פרטי הכנסה ופיננסיים'
        
        -- Main Source of Income field
        WHEN 'calculate_credit_main_source_income' THEN 'מקור הכנסה עיקרי'
        WHEN 'calculate_credit_main_source_income_ph' THEN 'אנא בחר את מקור ההכנסה העיקרי שלך'
        WHEN 'calculate_credit_main_source_income_option_1' THEN 'משכורת'
        WHEN 'calculate_credit_main_source_income_option_2' THEN 'עצמאי'
        WHEN 'calculate_credit_main_source_income_option_3' THEN 'פנסיה'
        WHEN 'calculate_credit_main_source_income_option_4' THEN 'דמי אבטלה'
        WHEN 'calculate_credit_main_source_income_option_5' THEN 'הכנסה מהשקעות'
        WHEN 'calculate_credit_main_source_income_option_6' THEN 'מלגת סטודנט'
        WHEN 'calculate_credit_main_source_income_option_7' THEN 'אחר'
        
        -- Additional Income field
        WHEN 'calculate_credit_additional_income' THEN 'מקורות הכנסה נוספים'
        WHEN 'calculate_credit_additional_income_ph' THEN 'בחר מקורות הכנסה נוספים'
        WHEN 'calculate_credit_additional_income_option_1' THEN 'עבודה במשרה חלקית'
        WHEN 'calculate_credit_additional_income_option_2' THEN 'עבודה עצמאית'
        WHEN 'calculate_credit_additional_income_option_3' THEN 'הכנסה מהשכרת נכס'
        WHEN 'calculate_credit_additional_income_option_4' THEN 'תשואות השקעות'
        WHEN 'calculate_credit_additional_income_option_5' THEN 'הכנסה מעסק'
        WHEN 'calculate_credit_additional_income_option_6' THEN 'הטבות ממשלתיות'
        WHEN 'calculate_credit_additional_income_option_7' THEN 'אין'
        
        -- Professional Sphere field
        WHEN 'calculate_credit_professional_sphere' THEN 'תחום מקצועי'
        WHEN 'calculate_credit_professional_sphere_ph' THEN 'אנא בחר את התחום המקצועי שלך'
        WHEN 'calculate_credit_professional_sphere_option_1' THEN 'טכנולוגיה/מחשבים'
        WHEN 'calculate_credit_professional_sphere_option_2' THEN 'בריאות/רפואה'
        WHEN 'calculate_credit_professional_sphere_option_3' THEN 'חינוך'
        WHEN 'calculate_credit_professional_sphere_option_4' THEN 'פיננסים/בנקאות'
        WHEN 'calculate_credit_professional_sphere_option_5' THEN 'שירותים משפטיים'
        WHEN 'calculate_credit_professional_sphere_option_6' THEN 'תעשייה'
        WHEN 'calculate_credit_professional_sphere_option_7' THEN 'מכירות/שיווק'
        WHEN 'calculate_credit_professional_sphere_option_8' THEN 'שירות ציבורי'
        WHEN 'calculate_credit_professional_sphere_option_9' THEN 'בנייה'
        WHEN 'calculate_credit_professional_sphere_option_10' THEN 'אחר'
        
        -- Monthly Income field
        WHEN 'calculate_credit_monthly_income' THEN 'הכנסה חודשית (₪)'
        WHEN 'calculate_credit_monthly_income_ph' THEN 'הזן את סך ההכנסה החודשית שלך בשקלים'
        
        -- Existing Debts field
        WHEN 'calculate_credit_existing_debts' THEN 'חובות קיימים'
        WHEN 'calculate_credit_existing_debts_ph' THEN 'בחר סוגי חובות קיימים'
        WHEN 'calculate_credit_existing_debts_option_1' THEN 'משכנתא'
        WHEN 'calculate_credit_existing_debts_option_2' THEN 'הלוואה אישית'
        WHEN 'calculate_credit_existing_debts_option_3' THEN 'חוב כרטיס אשראי'
        WHEN 'calculate_credit_existing_debts_option_4' THEN 'הלוואת רכב'
        WHEN 'calculate_credit_existing_debts_option_5' THEN 'אין חובות קיימים'
        
        -- Monthly Debt Payments field
        WHEN 'calculate_credit_monthly_debt_payments' THEN 'תשלומי חובות חודשיים (₪)'
        WHEN 'calculate_credit_monthly_debt_payments_ph' THEN 'הזן את סך התשלומים החודשיים על חובות בשקלים'
        
        -- Navigation buttons
        WHEN 'calculate_credit_step3_next_button' THEN 'המשך'
        WHEN 'calculate_credit_step3_back_button' THEN 'חזרה'
        
        ELSE ci.key
    END,
    'approved',
    NOW(),
    NOW()
FROM content_items ci
WHERE ci.screen_location = 'calculate_credit_3'
ON CONFLICT (content_item_id, language_code) DO NOTHING;

-- Russian translations
INSERT INTO content_translations (content_item_id, language_code, value, status, created_at, updated_at)
SELECT 
    ci.id,
    'ru',
    CASE ci.key
        -- Main title
        WHEN 'calculate_credit_step3_title' THEN 'Доходы и финансовые данные'
        
        -- Main Source of Income field
        WHEN 'calculate_credit_main_source_income' THEN 'Основной источник дохода'
        WHEN 'calculate_credit_main_source_income_ph' THEN 'Пожалуйста, выберите ваш основной источник дохода'
        WHEN 'calculate_credit_main_source_income_option_1' THEN 'Зарплата'
        WHEN 'calculate_credit_main_source_income_option_2' THEN 'Индивидуальный предприниматель'
        WHEN 'calculate_credit_main_source_income_option_3' THEN 'Пенсия'
        WHEN 'calculate_credit_main_source_income_option_4' THEN 'Пособие по безработице'
        WHEN 'calculate_credit_main_source_income_option_5' THEN 'Доходы от инвестиций'
        WHEN 'calculate_credit_main_source_income_option_6' THEN 'Студенческая стипендия'
        WHEN 'calculate_credit_main_source_income_option_7' THEN 'Другое'
        
        -- Additional Income field
        WHEN 'calculate_credit_additional_income' THEN 'Дополнительные источники дохода'
        WHEN 'calculate_credit_additional_income_ph' THEN 'Выберите дополнительные источники дохода'
        WHEN 'calculate_credit_additional_income_option_1' THEN 'Работа на неполный день'
        WHEN 'calculate_credit_additional_income_option_2' THEN 'Фриланс'
        WHEN 'calculate_credit_additional_income_option_3' THEN 'Доходы от аренды'
        WHEN 'calculate_credit_additional_income_option_4' THEN 'Доходы от инвестиций'
        WHEN 'calculate_credit_additional_income_option_5' THEN 'Доходы от бизнеса'
        WHEN 'calculate_credit_additional_income_option_6' THEN 'Государственные пособия'
        WHEN 'calculate_credit_additional_income_option_7' THEN 'Нет'
        
        -- Professional Sphere field
        WHEN 'calculate_credit_professional_sphere' THEN 'Профессиональная сфера'
        WHEN 'calculate_credit_professional_sphere_ph' THEN 'Пожалуйста, выберите вашу профессиональную сферу'
        WHEN 'calculate_credit_professional_sphere_option_1' THEN 'Технологии/IT'
        WHEN 'calculate_credit_professional_sphere_option_2' THEN 'Здравоохранение/Медицина'
        WHEN 'calculate_credit_professional_sphere_option_3' THEN 'Образование'
        WHEN 'calculate_credit_professional_sphere_option_4' THEN 'Финансы/Банковское дело'
        WHEN 'calculate_credit_professional_sphere_option_5' THEN 'Юридические услуги'
        WHEN 'calculate_credit_professional_sphere_option_6' THEN 'Производство'
        WHEN 'calculate_credit_professional_sphere_option_7' THEN 'Продажи/Маркетинг'
        WHEN 'calculate_credit_professional_sphere_option_8' THEN 'Государственная служба'
        WHEN 'calculate_credit_professional_sphere_option_9' THEN 'Строительство'
        WHEN 'calculate_credit_professional_sphere_option_10' THEN 'Другое'
        
        -- Monthly Income field
        WHEN 'calculate_credit_monthly_income' THEN 'Ежемесячный доход (₪)'
        WHEN 'calculate_credit_monthly_income_ph' THEN 'Введите ваш общий ежемесячный доход в шекелях'
        
        -- Existing Debts field
        WHEN 'calculate_credit_existing_debts' THEN 'Существующие долги'
        WHEN 'calculate_credit_existing_debts_ph' THEN 'Выберите типы существующих долгов'
        WHEN 'calculate_credit_existing_debts_option_1' THEN 'Ипотечный кредит'
        WHEN 'calculate_credit_existing_debts_option_2' THEN 'Потребительский кредит'
        WHEN 'calculate_credit_existing_debts_option_3' THEN 'Долг по кредитной карте'
        WHEN 'calculate_credit_existing_debts_option_4' THEN 'Автокредит'
        WHEN 'calculate_credit_existing_debts_option_5' THEN 'Нет существующих долгов'
        
        -- Monthly Debt Payments field
        WHEN 'calculate_credit_monthly_debt_payments' THEN 'Ежемесячные платежи по долгам (₪)'
        WHEN 'calculate_credit_monthly_debt_payments_ph' THEN 'Введите общую сумму ежемесячных платежей по долгам в шекелях'
        
        -- Navigation buttons
        WHEN 'calculate_credit_step3_next_button' THEN 'Продолжить'
        WHEN 'calculate_credit_step3_back_button' THEN 'Назад'
        
        ELSE ci.key
    END,
    'approved',
    NOW(),
    NOW()
FROM content_items ci
WHERE ci.screen_location = 'calculate_credit_3'
ON CONFLICT (content_item_id, language_code) DO NOTHING;
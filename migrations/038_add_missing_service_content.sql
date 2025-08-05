-- Migration: Add Missing Service Content
-- This migration adds all missing content for refinance and credit calculator services
-- Following the pattern established by mortgage calculator content

-- Helper function to insert content with translations
CREATE OR REPLACE FUNCTION insert_content_with_translations(
    p_content_key TEXT,
    p_category TEXT,
    p_screen_location TEXT,
    p_component_type TEXT,
    p_description TEXT,
    p_en TEXT,
    p_he TEXT,
    p_ru TEXT
) RETURNS VOID AS $$
DECLARE
    v_content_id BIGINT;
BEGIN
    -- Check if content already exists
    SELECT id INTO v_content_id
    FROM content_items
    WHERE content_key = p_content_key;
    
    IF v_content_id IS NULL THEN
        -- Insert content item
        INSERT INTO content_items (
            content_key, content_type, category, screen_location, 
            component_type, description, is_active, created_at, updated_at
        ) VALUES (
            p_content_key, 'text', p_category, p_screen_location,
            p_component_type, p_description, true, NOW(), NOW()
        ) RETURNING id INTO v_content_id;
        
        -- Insert translations
        INSERT INTO content_translations (content_item_id, language_code, content_value, is_default, status, created_at, updated_at)
        VALUES 
            (v_content_id, 'en', p_en, true, 'approved', NOW(), NOW()),
            (v_content_id, 'he', p_he, false, 'approved', NOW(), NOW()),
            (v_content_id, 'ru', p_ru, false, 'approved', NOW(), NOW());
    END IF;
END;
$$ LANGUAGE plpgsql;

-- ======================================
-- REFINANCE STEP 2 - Personal Details
-- ======================================

-- Name and basic info
SELECT insert_content_with_translations(
    'app.refinance.step2.name_surname', 'form', 'refinance_step2', 'label',
    'Full name field label', 
    'Full Name', 'שם מלא', 'Полное имя'
);

SELECT insert_content_with_translations(
    'app.refinance.step2.name_surname_ph', 'form', 'refinance_step2', 'placeholder',
    'Full name placeholder', 
    'Enter first name and last name', 'הכנס שם פרטי ושם משפחה', 'Введите имя и фамилию'
);

-- Birth date
SELECT insert_content_with_translations(
    'app.refinance.step2.birth_date', 'form', 'refinance_step2', 'label',
    'Birth date field label', 
    'Date of Birth', 'תאריך לידה', 'Дата рождения'
);

-- Family status
SELECT insert_content_with_translations(
    'app.refinance.step2.family_status', 'form', 'refinance_step2', 'label',
    'Marital status field label', 
    'Marital Status', 'מצב משפחתי', 'Семейное положение'
);

SELECT insert_content_with_translations(
    'app.refinance.step2.family_status_ph', 'form', 'refinance_step2', 'placeholder',
    'Marital status placeholder', 
    'Select marital status', 'בחר מצב משפחתי', 'Выберите семейное положение'
);

-- Family status options
SELECT insert_content_with_translations(
    'app.refinance.step2.family_status_option_1', 'form', 'refinance_step2', 'option',
    'Single option', 
    'Single', 'רווק/ה', 'Холост/Не замужем'
);

SELECT insert_content_with_translations(
    'app.refinance.step2.family_status_option_2', 'form', 'refinance_step2', 'option',
    'Married option', 
    'Married', 'נשוי/אה', 'Женат/Замужем'
);

SELECT insert_content_with_translations(
    'app.refinance.step2.family_status_option_3', 'form', 'refinance_step2', 'option',
    'Divorced option', 
    'Divorced', 'גרוש/ה', 'Разведен/Разведена'
);

SELECT insert_content_with_translations(
    'app.refinance.step2.family_status_option_4', 'form', 'refinance_step2', 'option',
    'Widowed option', 
    'Widowed', 'אלמן/ה', 'Вдовец/Вдова'
);

SELECT insert_content_with_translations(
    'app.refinance.step2.family_status_option_5', 'form', 'refinance_step2', 'option',
    'Common law option', 
    'Common-law marriage', 'ידועים בציבור', 'Гражданский брак'
);

SELECT insert_content_with_translations(
    'app.refinance.step2.family_status_option_6', 'form', 'refinance_step2', 'option',
    'Other option', 
    'Other', 'אחר', 'Другое'
);

-- Children count
SELECT insert_content_with_translations(
    'app.refinance.step2.children_count', 'form', 'refinance_step2', 'label',
    'Children count field label', 
    'Number of children under 18', 'מספר ילדים מתחת לגיל 18', 'Количество детей до 18 лет'
);

-- Education
SELECT insert_content_with_translations(
    'app.refinance.step2.education', 'form', 'refinance_step2', 'label',
    'Education field label', 
    'Education', 'השכלה', 'Образование'
);

SELECT insert_content_with_translations(
    'app.refinance.step2.education_ph', 'form', 'refinance_step2', 'placeholder',
    'Education placeholder', 
    'Select education level', 'בחר רמת השכלה', 'Выберите уровень образования'
);

-- Education options
SELECT insert_content_with_translations(
    'app.refinance.step2.education_option_1', 'form', 'refinance_step2', 'option',
    'No high school option', 
    'No high school certificate', 'ללא תעודת בגרות', 'Без аттестата о среднем образовании'
);

SELECT insert_content_with_translations(
    'app.refinance.step2.education_option_2', 'form', 'refinance_step2', 'option',
    'Partial high school option', 
    'Partial high school certificate', 'תעודת בגרות חלקית', 'Неполный аттестат о среднем образовании'
);

SELECT insert_content_with_translations(
    'app.refinance.step2.education_option_3', 'form', 'refinance_step2', 'option',
    'Full high school option', 
    'Full high school certificate', 'תעודת בגרות מלאה', 'Полный аттестат о среднем образовании'
);

SELECT insert_content_with_translations(
    'app.refinance.step2.education_option_4', 'form', 'refinance_step2', 'option',
    'Post-secondary option', 
    'Post-secondary education', 'השכלה על-תיכונית', 'Среднее специальное образование'
);

SELECT insert_content_with_translations(
    'app.refinance.step2.education_option_5', 'form', 'refinance_step2', 'option',
    'Bachelor degree option', 
    'Bachelor''s degree', 'תואר ראשון', 'Степень бакалавра'
);

SELECT insert_content_with_translations(
    'app.refinance.step2.education_option_6', 'form', 'refinance_step2', 'option',
    'Master degree option', 
    'Master''s degree', 'תואר שני', 'Степень магистра'
);

SELECT insert_content_with_translations(
    'app.refinance.step2.education_option_7', 'form', 'refinance_step2', 'option',
    'Doctoral degree option', 
    'Doctoral degree', 'תואר שלישי', 'Докторская степень'
);

-- Citizenship
SELECT insert_content_with_translations(
    'app.refinance.step2.citizenship', 'form', 'refinance_step2', 'label',
    'Additional citizenship field label', 
    'Do you have additional citizenship?', 'האם יש לך אזרחות נוספת?', 'Есть ли у вас дополнительное гражданство?'
);

SELECT insert_content_with_translations(
    'app.refinance.step2.citizenship_ph', 'form', 'refinance_step2', 'placeholder',
    'Citizenship placeholder', 
    'Select citizenship', 'בחר אזרחות', 'Выберите гражданство'
);

-- Partner section
SELECT insert_content_with_translations(
    'app.refinance.step2.add_partner', 'form', 'refinance_step2', 'button',
    'Add partner button', 
    'Add Partner', 'הוסף בן/בת זוג', 'Добавить партнера'
);

SELECT insert_content_with_translations(
    'app.refinance.step2.partner_mortgage_participation', 'form', 'refinance_step2', 'label',
    'Partner participation question', 
    'Will the partner participate in mortgage payments?', 'האם בן/בת הזוג ישתתף/תשתתף בתשלומי המשכנתא?', 'Будет ли партнер участвовать в ипотечных платежах?'
);

-- Legal questions
SELECT insert_content_with_translations(
    'app.refinance.step2.foreign_resident', 'legal', 'refinance_step2', 'label',
    'Foreign resident question', 
    'Are you considered a foreign resident under the Income Tax Law?', 'האם אתה נחשב תושב זר לפי חוק מס הכנסה?', 'Считаетесь ли вы иностранным резидентом согласно Закону о подоходном налоге?'
);

SELECT insert_content_with_translations(
    'app.refinance.step2.medical_insurance', 'legal', 'refinance_step2', 'label',
    'Medical insurance question', 
    'Are you insured with valid health insurance and entitled to medical services under the law?', 'האם אתה מבוטח בביטוח בריאות תקף וזכאי לשירותי רפואה על פי חוק?', 'Застрахованы ли вы действующей медицинской страховкой и имеете ли право на медицинские услуги по закону?'
);

SELECT insert_content_with_translations(
    'app.refinance.step2.public_person', 'legal', 'refinance_step2', 'label',
    'Public person question', 
    'Do you hold a senior public position or are you among the entities defined as a Politically Exposed Person (PEP)?', 'האם אתה מכהן בתפקיד ציבורי בכיר או נמנה על הגופים המוגדרים כאיש ציבור?', 'Занимаете ли вы высокую государственную должность или относитесь к политически значимым лицам (PEP)?'
);

SELECT insert_content_with_translations(
    'app.refinance.step2.tax_obligations', 'legal', 'refinance_step2', 'label',
    'Tax obligations question', 
    'Are you liable for tax in foreign countries or additional countries beyond Israel?', 'האם אתה חייב במס במדינות זרות או מדינות נוספות מעבר לישראל?', 'Обязаны ли вы платить налоги в иностранных государствах помимо Израиля?'
);

-- ======================================
-- REFINANCE STEP 3 - Income Details
-- ======================================

-- Main income source
SELECT insert_content_with_translations(
    'app.refinance.step3.main_source_income', 'form', 'refinance_step3', 'label',
    'Main income source field label', 
    'Main source of income', 'מקור הכנסה עיקרי', 'Основной источник дохода'
);

SELECT insert_content_with_translations(
    'app.refinance.step3.main_source_income_ph', 'form', 'refinance_step3', 'placeholder',
    'Main income source placeholder', 
    'Select main source of income', 'בחר מקור הכנסה עיקרי', 'Выберите основной источник дохода'
);

-- Income source options
SELECT insert_content_with_translations(
    'app.refinance.step3.main_source_income_option_1', 'form', 'refinance_step3', 'option',
    'Employee option', 
    'Employee', 'שכיר', 'Наемный работник'
);

SELECT insert_content_with_translations(
    'app.refinance.step3.main_source_income_option_2', 'form', 'refinance_step3', 'option',
    'Self-employed option', 
    'Self-employed', 'עצמאי', 'Индивидуальный предприниматель'
);

SELECT insert_content_with_translations(
    'app.refinance.step3.main_source_income_option_3', 'form', 'refinance_step3', 'option',
    'Pensioner option', 
    'Pensioner', 'גמלאי', 'Пенсионер'
);

SELECT insert_content_with_translations(
    'app.refinance.step3.main_source_income_option_4', 'form', 'refinance_step3', 'option',
    'Student option', 
    'Student', 'סטודנט', 'Студент'
);

SELECT insert_content_with_translations(
    'app.refinance.step3.main_source_income_option_5', 'form', 'refinance_step3', 'option',
    'Unpaid leave option', 
    'Unpaid leave', 'חופשה ללא תשלום', 'Неоплачиваемый отпуск'
);

SELECT insert_content_with_translations(
    'app.refinance.step3.main_source_income_option_6', 'form', 'refinance_step3', 'option',
    'Unemployed option', 
    'Unemployed', 'מובטל', 'Безработный'
);

SELECT insert_content_with_translations(
    'app.refinance.step3.main_source_income_option_7', 'form', 'refinance_step3', 'option',
    'Other income option', 
    'Other', 'אחר', 'Другое'
);

-- Monthly income
SELECT insert_content_with_translations(
    'app.refinance.step3.monthly_income', 'form', 'refinance_step3', 'label',
    'Monthly income field label', 
    'Net monthly income', 'הכנסה חודשית נטו', 'Чистый ежемесячный доход'
);

SELECT insert_content_with_translations(
    'app.refinance.step3.monthly_income_ph', 'form', 'refinance_step3', 'placeholder',
    'Monthly income placeholder', 
    'Enter net monthly income', 'הכנס הכנסה חודשית נטו', 'Введите чистый ежемесячный доход'
);

SELECT insert_content_with_translations(
    'app.refinance.step3.monthly_income_hint', 'form', 'refinance_step3', 'hint',
    'Monthly income hint', 
    'Amount shown after tax deduction as certified by accountant', 'סכום המוצג לאחר ניכוי מס כפי שמאושר על ידי רואה חשבון', 'Сумма после вычета налогов, подтвержденная бухгалтером'
);

-- Company details
SELECT insert_content_with_translations(
    'app.refinance.step3.company_name', 'form', 'refinance_step3', 'label',
    'Company name field label', 
    'Workplace', 'מקום עבודה', 'Место работы'
);

SELECT insert_content_with_translations(
    'app.refinance.step3.profession', 'form', 'refinance_step3', 'label',
    'Position field label', 
    'Position', 'תפקיד', 'Должность'
);

SELECT insert_content_with_translations(
    'app.refinance.step3.profession_ph', 'form', 'refinance_step3', 'placeholder',
    'Position placeholder', 
    'Your current position at workplace', 'התפקיד הנוכחי שלך במקום העבודה', 'Ваша текущая должность на рабочем месте'
);

SELECT insert_content_with_translations(
    'app.refinance.step3.field_activity', 'form', 'refinance_step3', 'label',
    'Field of activity label', 
    'Professional field of activity', 'תחום פעילות מקצועי', 'Профессиональная сфера деятельности'
);

SELECT insert_content_with_translations(
    'app.refinance.step3.start_date', 'form', 'refinance_step3', 'label',
    'Work start date label', 
    'Work start date', 'תאריך תחילת עבודה', 'Дата начала работы'
);

-- Additional income
SELECT insert_content_with_translations(
    'app.refinance.step3.additional_income', 'form', 'refinance_step3', 'label',
    'Additional income question', 
    'Do you have additional income?', 'האם יש לך הכנסה נוספת?', 'Есть ли у вас дополнительный доход?'
);

SELECT insert_content_with_translations(
    'app.refinance.step3.additional_income_ph', 'form', 'refinance_step3', 'placeholder',
    'Additional income placeholder', 
    'Select additional income type', 'בחר סוג הכנסה נוספת', 'Выберите тип дополнительного дохода'
);

-- Additional income options
SELECT insert_content_with_translations(
    'app.refinance.step3.additional_income_option_1', 'form', 'refinance_step3', 'option',
    'No additional income', 
    'No additional income', 'אין הכנסה נוספת', 'Нет дополнительного дохода'
);

SELECT insert_content_with_translations(
    'app.refinance.step3.additional_income_option_2', 'form', 'refinance_step3', 'option',
    'Additional salary', 
    'Additional salary', 'משכורת נוספת', 'Дополнительная зарплата'
);

SELECT insert_content_with_translations(
    'app.refinance.step3.additional_income_option_3', 'form', 'refinance_step3', 'option',
    'Additional work', 
    'Additional work', 'עבודה נוספת', 'Дополнительная работа'
);

SELECT insert_content_with_translations(
    'app.refinance.step3.additional_income_option_4', 'form', 'refinance_step3', 'option',
    'Property rental', 
    'Property rental income', 'הכנסה מהשכרת נכס', 'Доход от аренды недвижимости'
);

SELECT insert_content_with_translations(
    'app.refinance.step3.additional_income_option_5', 'form', 'refinance_step3', 'option',
    'Investment income', 
    'Investment income', 'הכנסה מהשקעות', 'Инвестиционный доход'
);

SELECT insert_content_with_translations(
    'app.refinance.step3.additional_income_option_6', 'form', 'refinance_step3', 'option',
    'Pension income', 
    'Pension income', 'הכנסה מפנסיה', 'Пенсионный доход'
);

SELECT insert_content_with_translations(
    'app.refinance.step3.additional_income_option_7', 'form', 'refinance_step3', 'option',
    'Other income', 
    'Other', 'אחר', 'Другое'
);

-- Obligations
SELECT insert_content_with_translations(
    'app.refinance.step3.obligations', 'form', 'refinance_step3', 'label',
    'Obligations question', 
    'Do you have existing bank debts or financial obligations?', 'האם יש לך חובות בנקאיים או התחייבויות פיננסיות קיימות?', 'Есть ли у вас существующие банковские долги или финансовые обязательства?'
);

SELECT insert_content_with_translations(
    'app.refinance.step3.obligations_ph', 'form', 'refinance_step3', 'placeholder',
    'Obligations placeholder', 
    'Select obligation type', 'בחר סוג התחייבות', 'Выберите тип обязательства'
);

-- Obligation options
SELECT insert_content_with_translations(
    'app.refinance.step3.obligations_option_1', 'form', 'refinance_step3', 'option',
    'No obligations', 
    'No obligations', 'אין התחייבויות', 'Нет обязательств'
);

SELECT insert_content_with_translations(
    'app.refinance.step3.obligations_option_2', 'form', 'refinance_step3', 'option',
    'Bank loan', 
    'Bank loan', 'הלוואה בנקאית', 'Банковский кредит'
);

SELECT insert_content_with_translations(
    'app.refinance.step3.obligations_option_3', 'form', 'refinance_step3', 'option',
    'Consumer credit', 
    'Consumer credit', 'אשראי צרכני', 'Потребительский кредит'
);

SELECT insert_content_with_translations(
    'app.refinance.step3.obligations_option_4', 'form', 'refinance_step3', 'option',
    'Credit card debt', 
    'Credit card debt', 'חוב כרטיס אשראי', 'Задолженность по кредитной карте'
);

SELECT insert_content_with_translations(
    'app.refinance.step3.obligations_option_5', 'form', 'refinance_step3', 'option',
    'Other obligations', 
    'Other', 'אחר', 'Другое'
);

-- Buttons
SELECT insert_content_with_translations(
    'app.refinance.step3.add_workplace', 'form', 'refinance_step3', 'button',
    'Add workplace button', 
    'Add workplace', 'הוסף מקום עבודה', 'Добавить место работы'
);

SELECT insert_content_with_translations(
    'app.refinance.step3.add_additional_income', 'form', 'refinance_step3', 'button',
    'Add additional income button', 
    'Add additional income source', 'הוסף מקור הכנסה נוסף', 'Добавить дополнительный источник дохода'
);

SELECT insert_content_with_translations(
    'app.refinance.step3.add_obligation', 'form', 'refinance_step3', 'button',
    'Add obligation button', 
    'Add obligation', 'הוסף התחייבות', 'Добавить обязательство'
);

-- ======================================
-- REFINANCE STEP 4 - Summary
-- ======================================

SELECT insert_content_with_translations(
    'app.refinance.step4.title', 'form', 'refinance_step4', 'title',
    'Page title', 
    'Refinancing Summary', 'סיכום מחזור משכנתא', 'Сводка по рефинансированию'
);

-- Parameters section
SELECT insert_content_with_translations(
    'app.refinance.step4.parameters_title', 'form', 'refinance_step4', 'section_header',
    'Parameters section title', 
    'Refinancing Parameters', 'פרמטרי מחזור', 'Параметры рефинансирования'
);

SELECT insert_content_with_translations(
    'app.refinance.step4.parameters_initial', 'form', 'refinance_step4', 'label',
    'Basic parameters label', 
    'Basic parameters', 'פרמטרים בסיסיים', 'Основные параметры'
);

SELECT insert_content_with_translations(
    'app.refinance.step4.parameters_cost', 'form', 'refinance_step4', 'label',
    'Refinancing cost label', 
    'Refinancing cost', 'עלות מחזור', 'Стоимость рефинансирования'
);

SELECT insert_content_with_translations(
    'app.refinance.step4.parameters_period', 'form', 'refinance_step4', 'label',
    'Refinancing period label', 
    'Refinancing period', 'תקופת מחזור', 'Период рефинансирования'
);

SELECT insert_content_with_translations(
    'app.refinance.step4.parameters_months', 'form', 'refinance_step4', 'unit',
    'Months unit', 
    'months', 'חודשים', 'месяцев'
);

-- Profile section
SELECT insert_content_with_translations(
    'app.refinance.step4.profile_title', 'form', 'refinance_step4', 'section_header',
    'Profile section title', 
    'Personal Profile Details', 'פרטי פרופיל אישי', 'Детали личного профиля'
);

-- Filter section
SELECT insert_content_with_translations(
    'app.refinance.step4.filter_title', 'form', 'refinance_step4', 'section_header',
    'Filter section title', 
    'Refinancing Filter', 'סינון מחזור', 'Фильтр рефинансирования'
);

SELECT insert_content_with_translations(
    'app.refinance.step4.filter_option_1', 'form', 'refinance_step4', 'option',
    'All programs filter', 
    'All refinancing programs', 'כל תוכניות המחזור', 'Все программы рефинансирования'
);

SELECT insert_content_with_translations(
    'app.refinance.step4.filter_option_2', 'form', 'refinance_step4', 'option',
    'Prime rate filter', 
    'Prime rate refinancing', 'מחזור בריבית פריים', 'Рефинансирование по ставке прайм'
);

SELECT insert_content_with_translations(
    'app.refinance.step4.filter_option_3', 'form', 'refinance_step4', 'option',
    'Fixed rate filter', 
    'Fixed rate refinancing', 'מחזור בריבית קבועה', 'Рефинансирование с фиксированной ставкой'
);

SELECT insert_content_with_translations(
    'app.refinance.step4.filter_option_4', 'form', 'refinance_step4', 'option',
    'Variable rate filter', 
    'Variable rate refinancing', 'מחזור בריבית משתנה', 'Рефинансирование с переменной ставкой'
);

-- Refinancing details
SELECT insert_content_with_translations(
    'app.refinance.step4.refinance_monthly', 'form', 'refinance_step4', 'label',
    'Monthly payment label', 
    'New Monthly Payment', 'תשלום חודשי חדש', 'Новый ежемесячный платеж'
);

SELECT insert_content_with_translations(
    'app.refinance.step4.refinance_total', 'form', 'refinance_step4', 'label',
    'Total amount label', 
    'Total Refinancing Amount', 'סכום מחזור כולל', 'Общая сумма рефинансирования'
);

SELECT insert_content_with_translations(
    'app.refinance.step4.refinance_total_return', 'form', 'refinance_step4', 'label',
    'Total return label', 
    'Total Return After Refinancing', 'החזר כולל לאחר מחזור', 'Общий возврат после рефинансирования'
);

SELECT insert_content_with_translations(
    'app.refinance.step4.refinance_select_bank', 'form', 'refinance_step4', 'button',
    'Select bank button', 
    'Select Bank', 'בחר בנק', 'Выбрать банк'
);

-- Warning
SELECT insert_content_with_translations(
    'app.refinance.step4.warning', 'legal', 'refinance_step4', 'disclaimer',
    'Warning disclaimer', 
    'The detailed results above are estimates only and do not constitute an offer or commitment from the bank. Final terms depend on full underwriting by the selected bank.',
    'התוצאות המפורטות לעיל הן הערכות בלבד ואינן מהוות הצעה או התחייבות מהבנק. התנאים הסופיים תלויים בחיתום מלא על ידי הבנק הנבחר.',
    'Приведенные выше результаты являются только оценками и не являются предложением или обязательством банка. Окончательные условия зависят от полной проверки выбранным банком.'
);

-- ======================================
-- CALCULATE CREDIT STEP 1 - Basic Details
-- ======================================

-- Update title for existing content if needed
UPDATE content_items 
SET screen_location = 'calculate_credit_step1'
WHERE screen_location = 'calculate_credit_1';

-- Add missing content for credit calculator step 1
SELECT insert_content_with_translations(
    'app.credit.step1.title', 'form', 'calculate_credit_step1', 'title',
    'Page title', 
    'Credit Calculator', 'מחשבון אשראי', 'Кредитный калькулятор'
);

SELECT insert_content_with_translations(
    'app.credit.step1.credit_amount', 'form', 'calculate_credit_step1', 'label',
    'Credit amount field label', 
    'Credit Amount', 'סכום האשראי', 'Сумма кредита'
);

SELECT insert_content_with_translations(
    'app.credit.step1.credit_amount_ph', 'form', 'calculate_credit_step1', 'placeholder',
    'Credit amount placeholder', 
    'Enter desired credit amount', 'הכנס את סכום האשראי הרצוי', 'Введите желаемую сумму кредита'
);

SELECT insert_content_with_translations(
    'app.credit.step1.credit_period', 'form', 'calculate_credit_step1', 'label',
    'Credit period field label', 
    'Credit Period', 'תקופת האשראי', 'Срок кредита'
);

SELECT insert_content_with_translations(
    'app.credit.step1.credit_period_ph', 'form', 'calculate_credit_step1', 'placeholder',
    'Credit period placeholder', 
    'Select credit period', 'בחר תקופת אשראי', 'Выберите срок кредита'
);

SELECT insert_content_with_translations(
    'app.credit.step1.credit_purpose', 'form', 'calculate_credit_step1', 'label',
    'Credit purpose field label', 
    'Credit Purpose', 'מטרת האשראי', 'Цель кредита'
);

SELECT insert_content_with_translations(
    'app.credit.step1.credit_purpose_ph', 'form', 'calculate_credit_step1', 'placeholder',
    'Credit purpose placeholder', 
    'Select credit purpose', 'בחר מטרת אשראי', 'Выберите цель кредита'
);

SELECT insert_content_with_translations(
    'app.credit.step1.monthly_payment', 'form', 'calculate_credit_step1', 'label',
    'Monthly payment field label', 
    'Desired Monthly Payment', 'תשלום חודשי רצוי', 'Желаемый ежемесячный платеж'
);

SELECT insert_content_with_translations(
    'app.credit.step1.monthly_payment_ph', 'form', 'calculate_credit_step1', 'placeholder',
    'Monthly payment placeholder', 
    'Enter desired monthly payment', 'הכנס תשלום חודשי רצוי', 'Введите желаемый ежемесячный платеж'
);

-- ======================================
-- CALCULATE CREDIT STEP 2 - Personal Details
-- ======================================

SELECT insert_content_with_translations(
    'app.credit.step2.title', 'form', 'calculate_credit_step2', 'title',
    'Page title', 
    'Personal Details', 'פרטים אישיים', 'Личные данные'
);

-- Name and basic info (reuse pattern from mortgage/refinance)
SELECT insert_content_with_translations(
    'app.credit.step2.name_surname', 'form', 'calculate_credit_step2', 'label',
    'Full name field label', 
    'Full Name', 'שם מלא', 'Полное имя'
);

SELECT insert_content_with_translations(
    'app.credit.step2.name_surname_ph', 'form', 'calculate_credit_step2', 'placeholder',
    'Full name placeholder', 
    'Enter first name and last name', 'הכנס שם פרטי ושם משפחה', 'Введите имя и фамилию'
);

-- Birth date
SELECT insert_content_with_translations(
    'app.credit.step2.birth_date', 'form', 'calculate_credit_step2', 'label',
    'Birth date field label', 
    'Date of Birth', 'תאריך לידה', 'Дата рождения'
);

-- Family status
SELECT insert_content_with_translations(
    'app.credit.step2.family_status', 'form', 'calculate_credit_step2', 'label',
    'Marital status field label', 
    'Marital Status', 'מצב משפחתי', 'Семейное положение'
);

SELECT insert_content_with_translations(
    'app.credit.step2.family_status_ph', 'form', 'calculate_credit_step2', 'placeholder',
    'Marital status placeholder', 
    'Select marital status', 'בחר מצב משפחתי', 'Выберите семейное положение'
);

-- Family status options
SELECT insert_content_with_translations(
    'app.credit.step2.family_status_option_1', 'form', 'calculate_credit_step2', 'option',
    'Single option', 
    'Single', 'רווק/ה', 'Холост/Не замужем'
);

SELECT insert_content_with_translations(
    'app.credit.step2.family_status_option_2', 'form', 'calculate_credit_step2', 'option',
    'Married option', 
    'Married', 'נשוי/אה', 'Женат/Замужем'
);

SELECT insert_content_with_translations(
    'app.credit.step2.family_status_option_3', 'form', 'calculate_credit_step2', 'option',
    'Divorced option', 
    'Divorced', 'גרוש/ה', 'Разведен/Разведена'
);

SELECT insert_content_with_translations(
    'app.credit.step2.family_status_option_4', 'form', 'calculate_credit_step2', 'option',
    'Widowed option', 
    'Widowed', 'אלמן/ה', 'Вдовец/Вдова'
);

SELECT insert_content_with_translations(
    'app.credit.step2.family_status_option_5', 'form', 'calculate_credit_step2', 'option',
    'Common law option', 
    'Common-law marriage', 'ידועים בציבור', 'Гражданский брак'
);

SELECT insert_content_with_translations(
    'app.credit.step2.family_status_option_6', 'form', 'calculate_credit_step2', 'option',
    'Other option', 
    'Other', 'אחר', 'Другое'
);

-- ID number
SELECT insert_content_with_translations(
    'app.credit.step2.id_number', 'form', 'calculate_credit_step2', 'label',
    'ID number field label', 
    'ID Number', 'מספר תעודת זהות', 'Номер удостоверения личности'
);

SELECT insert_content_with_translations(
    'app.credit.step2.id_number_ph', 'form', 'calculate_credit_step2', 'placeholder',
    'ID number placeholder', 
    'Enter ID number', 'הכנס מספר תעודת זהות', 'Введите номер удостоверения личности'
);

-- Phone number
SELECT insert_content_with_translations(
    'app.credit.step2.phone_number', 'form', 'calculate_credit_step2', 'label',
    'Phone number field label', 
    'Phone Number', 'מספר טלפון', 'Номер телефона'
);

SELECT insert_content_with_translations(
    'app.credit.step2.phone_number_ph', 'form', 'calculate_credit_step2', 'placeholder',
    'Phone number placeholder', 
    'Enter phone number', 'הכנס מספר טלפון', 'Введите номер телефона'
);

-- Email
SELECT insert_content_with_translations(
    'app.credit.step2.email', 'form', 'calculate_credit_step2', 'label',
    'Email field label', 
    'Email Address', 'כתובת דואר אלקטרוני', 'Адрес электронной почты'
);

SELECT insert_content_with_translations(
    'app.credit.step2.email_ph', 'form', 'calculate_credit_step2', 'placeholder',
    'Email placeholder', 
    'Enter email address', 'הכנס כתובת דואר אלקטרוני', 'Введите адрес электронной почты'
);

-- Address
SELECT insert_content_with_translations(
    'app.credit.step2.address', 'form', 'calculate_credit_step2', 'label',
    'Address field label', 
    'Current Address', 'כתובת נוכחית', 'Текущий адрес'
);

SELECT insert_content_with_translations(
    'app.credit.step2.address_ph', 'form', 'calculate_credit_step2', 'placeholder',
    'Address placeholder', 
    'Enter current address', 'הכנס כתובת נוכחית', 'Введите текущий адрес'
);

-- ======================================
-- CALCULATE CREDIT STEP 3 - Income Details
-- ======================================

SELECT insert_content_with_translations(
    'app.credit.step3.title', 'form', 'calculate_credit_step3', 'title',
    'Page title', 
    'Income and Financial Details', 'פרטי הכנסה ופיננסים', 'Доходы и финансовые данные'
);

-- Main income source
SELECT insert_content_with_translations(
    'app.credit.step3.main_source_income', 'form', 'calculate_credit_step3', 'label',
    'Main income source field label', 
    'Main source of income', 'מקור הכנסה עיקרי', 'Основной источник дохода'
);

SELECT insert_content_with_translations(
    'app.credit.step3.main_source_income_ph', 'form', 'calculate_credit_step3', 'placeholder',
    'Main income source placeholder', 
    'Select main source of income', 'בחר מקור הכנסה עיקרי', 'Выберите основной источник дохода'
);

-- Income source options (same as refinance)
SELECT insert_content_with_translations(
    'app.credit.step3.main_source_income_option_1', 'form', 'calculate_credit_step3', 'option',
    'Employee option', 
    'Employee', 'שכיר', 'Наемный работник'
);

SELECT insert_content_with_translations(
    'app.credit.step3.main_source_income_option_2', 'form', 'calculate_credit_step3', 'option',
    'Self-employed option', 
    'Self-employed', 'עצמאי', 'Индивидуальный предприниматель'
);

SELECT insert_content_with_translations(
    'app.credit.step3.main_source_income_option_3', 'form', 'calculate_credit_step3', 'option',
    'Pensioner option', 
    'Pensioner', 'גמלאי', 'Пенсионер'
);

SELECT insert_content_with_translations(
    'app.credit.step3.main_source_income_option_4', 'form', 'calculate_credit_step3', 'option',
    'Student option', 
    'Student', 'סטודנט', 'Студент'
);

SELECT insert_content_with_translations(
    'app.credit.step3.main_source_income_option_5', 'form', 'calculate_credit_step3', 'option',
    'Unemployed option', 
    'Unemployed', 'מובטל', 'Безработный'
);

SELECT insert_content_with_translations(
    'app.credit.step3.main_source_income_option_6', 'form', 'calculate_credit_step3', 'option',
    'Other income option', 
    'Other', 'אחר', 'Другое'
);

-- Monthly income
SELECT insert_content_with_translations(
    'app.credit.step3.monthly_income', 'form', 'calculate_credit_step3', 'label',
    'Monthly income field label', 
    'Net monthly income', 'הכנסה חודשית נטו', 'Чистый ежемесячный доход'
);

SELECT insert_content_with_translations(
    'app.credit.step3.monthly_income_ph', 'form', 'calculate_credit_step3', 'placeholder',
    'Monthly income placeholder', 
    'Enter net monthly income', 'הכנס הכנסה חודשית נטו', 'Введите чистый ежемесячный доход'
);

-- Workplace
SELECT insert_content_with_translations(
    'app.credit.step3.company_name', 'form', 'calculate_credit_step3', 'label',
    'Company name field label', 
    'Workplace', 'מקום עבודה', 'Место работы'
);

SELECT insert_content_with_translations(
    'app.credit.step3.company_name_ph', 'form', 'calculate_credit_step3', 'placeholder',
    'Company name placeholder', 
    'Enter workplace name', 'הכנס שם מקום עבודה', 'Введите название места работы'
);

-- Years at workplace
SELECT insert_content_with_translations(
    'app.credit.step3.years_at_workplace', 'form', 'calculate_credit_step3', 'label',
    'Years at workplace label', 
    'Years at current workplace', 'שנים במקום העבודה הנוכחי', 'Лет на текущем месте работы'
);

SELECT insert_content_with_translations(
    'app.credit.step3.years_at_workplace_ph', 'form', 'calculate_credit_step3', 'placeholder',
    'Years at workplace placeholder', 
    'Enter number of years', 'הכנס מספר שנים', 'Введите количество лет'
);

-- Bank account
SELECT insert_content_with_translations(
    'app.credit.step3.bank_account', 'form', 'calculate_credit_step3', 'label',
    'Bank account label', 
    'Main bank account', 'חשבון בנק ראשי', 'Основной банковский счет'
);

SELECT insert_content_with_translations(
    'app.credit.step3.bank_account_ph', 'form', 'calculate_credit_step3', 'placeholder',
    'Bank account placeholder', 
    'Select your bank', 'בחר את הבנק שלך', 'Выберите ваш банк'
);

-- Existing loans
SELECT insert_content_with_translations(
    'app.credit.step3.existing_loans', 'form', 'calculate_credit_step3', 'label',
    'Existing loans label', 
    'Do you have existing loans?', 'האם יש לך הלוואות קיימות?', 'Есть ли у вас существующие кредиты?'
);

SELECT insert_content_with_translations(
    'app.credit.step3.existing_loans_amount', 'form', 'calculate_credit_step3', 'label',
    'Existing loans amount label', 
    'Total monthly payments for existing loans', 'סך תשלומים חודשיים להלוואות קיימות', 'Общая сумма ежемесячных платежей по существующим кредитам'
);

SELECT insert_content_with_translations(
    'app.credit.step3.existing_loans_amount_ph', 'form', 'calculate_credit_step3', 'placeholder',
    'Existing loans amount placeholder', 
    'Enter total monthly payments', 'הכנס סך תשלומים חודשיים', 'Введите общую сумму ежемесячных платежей'
);

-- ======================================
-- CALCULATE CREDIT STEP 4 - Summary
-- ======================================

SELECT insert_content_with_translations(
    'app.credit.step4.title', 'form', 'calculate_credit_step4', 'title',
    'Page title', 
    'Credit Application Summary', 'סיכום בקשת אשראי', 'Сводка кредитной заявки'
);

-- Parameters section
SELECT insert_content_with_translations(
    'app.credit.step4.parameters_title', 'form', 'calculate_credit_step4', 'section_header',
    'Parameters section title', 
    'Credit Parameters', 'פרמטרי אשראי', 'Параметры кредита'
);

SELECT insert_content_with_translations(
    'app.credit.step4.parameters_amount', 'form', 'calculate_credit_step4', 'label',
    'Credit amount label', 
    'Requested credit amount', 'סכום אשראי מבוקש', 'Запрашиваемая сумма кредита'
);

SELECT insert_content_with_translations(
    'app.credit.step4.parameters_period', 'form', 'calculate_credit_step4', 'label',
    'Credit period label', 
    'Credit period', 'תקופת אשראי', 'Срок кредита'
);

SELECT insert_content_with_translations(
    'app.credit.step4.parameters_purpose', 'form', 'calculate_credit_step4', 'label',
    'Credit purpose label', 
    'Credit purpose', 'מטרת האשראי', 'Цель кредита'
);

-- Profile section
SELECT insert_content_with_translations(
    'app.credit.step4.profile_title', 'form', 'calculate_credit_step4', 'section_header',
    'Profile section title', 
    'Personal Profile', 'פרופיל אישי', 'Личный профиль'
);

-- Filter section
SELECT insert_content_with_translations(
    'app.credit.step4.filter_title', 'form', 'calculate_credit_step4', 'section_header',
    'Filter section title', 
    'Credit Options Filter', 'סינון אפשרויות אשראי', 'Фильтр кредитных опций'
);

SELECT insert_content_with_translations(
    'app.credit.step4.filter_option_1', 'form', 'calculate_credit_step4', 'option',
    'All credit options', 
    'All credit options', 'כל אפשרויות האשראי', 'Все кредитные опции'
);

SELECT insert_content_with_translations(
    'app.credit.step4.filter_option_2', 'form', 'calculate_credit_step4', 'option',
    'Bank loans', 
    'Bank loans', 'הלוואות בנקאיות', 'Банковские кредиты'
);

SELECT insert_content_with_translations(
    'app.credit.step4.filter_option_3', 'form', 'calculate_credit_step4', 'option',
    'Credit companies', 
    'Credit companies', 'חברות אשראי', 'Кредитные компании'
);

SELECT insert_content_with_translations(
    'app.credit.step4.filter_option_4', 'form', 'calculate_credit_step4', 'option',
    'P2P lending', 
    'P2P lending', 'הלוואות P2P', 'P2P кредитование'
);

-- Credit details
SELECT insert_content_with_translations(
    'app.credit.step4.credit_monthly', 'form', 'calculate_credit_step4', 'label',
    'Monthly payment label', 
    'Monthly Payment', 'תשלום חודשי', 'Ежемесячный платеж'
);

SELECT insert_content_with_translations(
    'app.credit.step4.credit_interest', 'form', 'calculate_credit_step4', 'label',
    'Interest rate label', 
    'Interest Rate', 'שיעור ריבית', 'Процентная ставка'
);

SELECT insert_content_with_translations(
    'app.credit.step4.credit_total_return', 'form', 'calculate_credit_step4', 'label',
    'Total return label', 
    'Total Return', 'החזר כולל', 'Общий возврат'
);

SELECT insert_content_with_translations(
    'app.credit.step4.credit_select_lender', 'form', 'calculate_credit_step4', 'button',
    'Select lender button', 
    'Select Lender', 'בחר מלווה', 'Выбрать кредитора'
);

-- Warning
SELECT insert_content_with_translations(
    'app.credit.step4.warning', 'legal', 'calculate_credit_step4', 'disclaimer',
    'Warning disclaimer', 
    'The credit options presented are preliminary estimates based on the information provided. Final terms are subject to lender approval and full credit assessment.',
    'אפשרויות האשראי המוצגות הן הערכות ראשוניות בהתבסס על המידע שסופק. התנאים הסופיים כפופים לאישור המלווה והערכת אשראי מלאה.',
    'Представленные кредитные опции являются предварительными оценками на основе предоставленной информации. Окончательные условия зависят от одобрения кредитора и полной кредитной оценки.'
);

-- ======================================
-- COMMON BUTTONS AND NAVIGATION
-- ======================================

-- Navigation buttons for all services
SELECT insert_content_with_translations(
    'app.common.button.next', 'navigation', 'common', 'button',
    'Next button', 
    'Next', 'הבא', 'Далее'
);

SELECT insert_content_with_translations(
    'app.common.button.back', 'navigation', 'common', 'button',
    'Back button', 
    'Back', 'חזור', 'Назад'
);

SELECT insert_content_with_translations(
    'app.common.button.submit', 'navigation', 'common', 'button',
    'Submit button', 
    'Submit', 'שלח', 'Отправить'
);

SELECT insert_content_with_translations(
    'app.common.button.save', 'navigation', 'common', 'button',
    'Save button', 
    'Save', 'שמור', 'Сохранить'
);

SELECT insert_content_with_translations(
    'app.common.button.cancel', 'navigation', 'common', 'button',
    'Cancel button', 
    'Cancel', 'בטל', 'Отмена'
);

-- ======================================
-- REFINANCE RESULTS SCREEN
-- ======================================

SELECT insert_content_with_translations(
    'app.refinance.results.title', 'results', 'refinance_results', 'title',
    'Results page title', 
    'Refinancing Results', 'תוצאות מחזור משכנתא', 'Результаты рефинансирования'
);

SELECT insert_content_with_translations(
    'app.refinance.results.savings_title', 'results', 'refinance_results', 'section_header',
    'Savings section title', 
    'Your Potential Savings', 'החיסכון הפוטנציאלי שלך', 'Ваша потенциальная экономия'
);

SELECT insert_content_with_translations(
    'app.refinance.results.monthly_savings', 'results', 'refinance_results', 'label',
    'Monthly savings label', 
    'Monthly Savings', 'חיסכון חודשי', 'Ежемесячная экономия'
);

SELECT insert_content_with_translations(
    'app.refinance.results.total_savings', 'results', 'refinance_results', 'label',
    'Total savings label', 
    'Total Savings', 'חיסכון כולל', 'Общая экономия'
);

SELECT insert_content_with_translations(
    'app.refinance.results.new_rate', 'results', 'refinance_results', 'label',
    'New rate label', 
    'New Interest Rate', 'ריבית חדשה', 'Новая процентная ставка'
);

SELECT insert_content_with_translations(
    'app.refinance.results.current_rate', 'results', 'refinance_results', 'label',
    'Current rate label', 
    'Current Interest Rate', 'ריבית נוכחית', 'Текущая процентная ставка'
);

SELECT insert_content_with_translations(
    'app.refinance.results.break_even', 'results', 'refinance_results', 'label',
    'Break even label', 
    'Break-even Period', 'תקופת החזר השקעה', 'Период окупаемости'
);

SELECT insert_content_with_translations(
    'app.refinance.results.recommendation', 'results', 'refinance_results', 'text',
    'Recommendation text', 
    'Based on your current mortgage terms and market conditions, refinancing could save you money.',
    'בהתבסס על תנאי המשכנתא הנוכחיים שלך ותנאי השוק, מחזור יכול לחסוך לך כסף.',
    'На основе ваших текущих условий ипотеки и рыночных условий, рефинансирование может сэкономить вам деньги.'
);

SELECT insert_content_with_translations(
    'app.refinance.results.apply_button', 'results', 'refinance_results', 'button',
    'Apply button', 
    'Apply for Refinancing', 'הגש בקשה למחזור', 'Подать заявку на рефинансирование'
);

SELECT insert_content_with_translations(
    'app.refinance.results.compare_button', 'results', 'refinance_results', 'button',
    'Compare button', 
    'Compare More Options', 'השווה אפשרויות נוספות', 'Сравнить больше вариантов'
);

-- ======================================
-- CREDIT CALCULATOR RESULTS SCREEN
-- ======================================

SELECT insert_content_with_translations(
    'app.credit.results.title', 'results', 'calculate_credit_results', 'title',
    'Results page title', 
    'Credit Options', 'אפשרויות אשראי', 'Кредитные опции'
);

SELECT insert_content_with_translations(
    'app.credit.results.best_offer', 'results', 'calculate_credit_results', 'section_header',
    'Best offer section', 
    'Best Credit Offer', 'הצעת האשראי הטובה ביותר', 'Лучшее кредитное предложение'
);

SELECT insert_content_with_translations(
    'app.credit.results.approval_chance', 'results', 'calculate_credit_results', 'label',
    'Approval chance label', 
    'Approval Probability', 'סיכויי אישור', 'Вероятность одобрения'
);

SELECT insert_content_with_translations(
    'app.credit.results.credit_score', 'results', 'calculate_credit_results', 'label',
    'Credit score label', 
    'Your Credit Score', 'ציון האשראי שלך', 'Ваш кредитный рейтинг'
);

SELECT insert_content_with_translations(
    'app.credit.results.monthly_payment', 'results', 'calculate_credit_results', 'label',
    'Monthly payment label', 
    'Monthly Payment', 'תשלום חודשי', 'Ежемесячный платеж'
);

SELECT insert_content_with_translations(
    'app.credit.results.interest_rate', 'results', 'calculate_credit_results', 'label',
    'Interest rate label', 
    'Interest Rate', 'שיעור ריבית', 'Процентная ставка'
);

SELECT insert_content_with_translations(
    'app.credit.results.total_cost', 'results', 'calculate_credit_results', 'label',
    'Total cost label', 
    'Total Credit Cost', 'עלות אשראי כוללת', 'Общая стоимость кредита'
);

SELECT insert_content_with_translations(
    'app.credit.results.processing_time', 'results', 'calculate_credit_results', 'label',
    'Processing time label', 
    'Processing Time', 'זמן טיפול', 'Время обработки'
);

SELECT insert_content_with_translations(
    'app.credit.results.documents_required', 'results', 'calculate_credit_results', 'section_header',
    'Documents section', 
    'Required Documents', 'מסמכים נדרשים', 'Необходимые документы'
);

SELECT insert_content_with_translations(
    'app.credit.results.apply_now', 'results', 'calculate_credit_results', 'button',
    'Apply now button', 
    'Apply Now', 'הגש בקשה עכשיו', 'Подать заявку сейчас'
);

SELECT insert_content_with_translations(
    'app.credit.results.save_comparison', 'results', 'calculate_credit_results', 'button',
    'Save comparison button', 
    'Save Comparison', 'שמור השוואה', 'Сохранить сравнение'
);

SELECT insert_content_with_translations(
    'app.credit.results.contact_advisor', 'results', 'calculate_credit_results', 'button',
    'Contact advisor button', 
    'Contact Financial Advisor', 'צור קשר עם יועץ פיננסי', 'Связаться с финансовым консультантом'
);

-- Drop the helper function
DROP FUNCTION IF EXISTS insert_content_with_translations;

-- Add a comment to track this migration
COMMENT ON TABLE content_items IS 'Migration 038 completed - Added missing content for refinance and credit calculator services';
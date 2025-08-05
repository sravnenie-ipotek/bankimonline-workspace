-- Step 4: Income and Employment for Credit Calculator (contentPool pattern)
INSERT INTO content_pages (page_key, page_name, description, meta_title, meta_description) 
VALUES ('credit_calculator_step4', 'Credit Calculator - Step 4: Income and Employment', 'Income and employment information for credit calculation', 'Credit Calculator - Income and Employment', 'Enter your income and employment details for credit calculation')
ON CONFLICT (page_key) DO UPDATE SET updated_at = CURRENT_TIMESTAMP;

-- Get the page_id
DO $$
DECLARE
    v_page_id INTEGER;
    v_section_id INTEGER;
BEGIN
    SELECT id INTO v_page_id FROM content_pages WHERE page_key = 'credit_calculator_step4';

    -- Create main section for Step 4
    INSERT INTO content_sections (page_id, section_key, section_name, order_index)
    VALUES (v_page_id, 'income_employment', 'Income and Employment', 1)
    ON CONFLICT (page_id, section_key) DO UPDATE SET updated_at = CURRENT_TIMESTAMP
    RETURNING id INTO v_section_id;

    -- Insert content items for Step 4
    -- Headers and Labels
    INSERT INTO content_items (
        section_id, item_key, content_type, 
        content_he, content_en, content_ru,
        order_index
    ) VALUES
    (v_section_id, 'calculate_credit_step4_title', 'heading', 
     'פרטי הכנסה ותעסוקה', 'Income and Employment Details', 'Данные о доходах и занятости', 1),
    
    -- Employment type
    (v_section_id, 'calculate_credit_step4_employment_type', 'label',
     'סוג תעסוקה', 'Employment Type', 'Тип занятости', 2),
    (v_section_id, 'calculate_credit_step4_employment_type_ph', 'placeholder',
     'בחר סוג תעסוקה', 'Select employment type', 'Выберите тип занятости', 3),
    (v_section_id, 'calculate_credit_step4_employment_type_option_1', 'option',
     'שכיר', 'Employee', 'Наемный работник', 4),
    (v_section_id, 'calculate_credit_step4_employment_type_option_2', 'option',
     'עצמאי', 'Self-Employed', 'Индивидуальный предприниматель', 5),
    (v_section_id, 'calculate_credit_step4_employment_type_option_3', 'option',
     'פנסיונר', 'Pensioner', 'Пенсионер', 6),
    (v_section_id, 'calculate_credit_step4_employment_type_option_4', 'option',
     'לא עובד', 'Unemployed', 'Безработный', 7),
    
    -- Workplace name
    (v_section_id, 'calculate_credit_step4_workplace_name', 'label',
     'שם מקום העבודה', 'Workplace Name', 'Название места работы', 8),
    (v_section_id, 'calculate_credit_step4_workplace_name_ph', 'placeholder',
     'הזן שם מקום העבודה', 'Enter workplace name', 'Введите название места работы', 9),
    
    -- Work start date
    (v_section_id, 'calculate_credit_step4_work_start_date', 'label',
     'תאריך תחילת עבודה', 'Work Start Date', 'Дата начала работы', 10),
    (v_section_id, 'calculate_credit_step4_work_start_date_ph', 'placeholder',
     'בחר תאריך תחילת עבודה', 'Select work start date', 'Выберите дату начала работы', 11),
    
    -- Position
    (v_section_id, 'calculate_credit_step4_position', 'label',
     'תפקיד', 'Position', 'Должность', 12),
    (v_section_id, 'calculate_credit_step4_position_ph', 'placeholder',
     'הזן תפקיד', 'Enter position', 'Введите должность', 13),
    
    -- Work experience
    (v_section_id, 'calculate_credit_step4_work_experience', 'label',
     'ותק בעבודה (שנים)', 'Work Experience (years)', 'Стаж работы (лет)', 14),
    (v_section_id, 'calculate_credit_step4_work_experience_ph', 'placeholder',
     'הזן ותק בעבודה', 'Enter work experience', 'Введите стаж работы', 15),
    
    -- Monthly salary
    (v_section_id, 'calculate_credit_step4_monthly_salary', 'label',
     'משכורת חודשית נטו (ש"ח)', 'Monthly Net Salary (ILS)', 'Ежемесячная зарплата нетто (шек.)', 16),
    (v_section_id, 'calculate_credit_step4_monthly_salary_ph', 'placeholder',
     'הזן משכורת חודשית', 'Enter monthly salary', 'Введите ежемесячную зарплату', 17),
    
    -- Additional income
    (v_section_id, 'calculate_credit_step4_additional_income', 'label',
     'הכנסה נוספת חודשית (ש"ח)', 'Additional Monthly Income (ILS)', 'Дополнительный ежемесячный доход (шек.)', 18),
    (v_section_id, 'calculate_credit_step4_additional_income_ph', 'placeholder',
     'הזן הכנסה נוספת', 'Enter additional income', 'Введите дополнительный доход', 19),
    
    -- Total monthly income
    (v_section_id, 'calculate_credit_step4_total_monthly_income', 'label',
     'סך הכנסה חודשית (ש"ח)', 'Total Monthly Income (ILS)', 'Общий ежемесячный доход (шек.)', 20),
    
    -- Monthly expenses
    (v_section_id, 'calculate_credit_step4_monthly_expenses', 'label',
     'הוצאות חודשיות (ש"ח)', 'Monthly Expenses (ILS)', 'Ежемесячные расходы (шек.)', 21),
    (v_section_id, 'calculate_credit_step4_monthly_expenses_ph', 'placeholder',
     'הזן הוצאות חודשיות', 'Enter monthly expenses', 'Введите ежемесячные расходы', 22),
    
    -- Existing loans/commitments
    (v_section_id, 'calculate_credit_step4_existing_loans', 'label',
     'הלוואות קיימות (ש"ח לחודש)', 'Existing Loans (ILS per month)', 'Существующие займы (шек. в месяц)', 23),
    (v_section_id, 'calculate_credit_step4_existing_loans_ph', 'placeholder',
     'הזן תשלומים חודשיים', 'Enter monthly payments', 'Введите ежемесячные платежи', 24),
    
    -- Bank account information
    (v_section_id, 'calculate_credit_step4_bank_account_title', 'heading',
     'פרטי חשבון בנק', 'Bank Account Information', 'Информация о банковском счете', 25),
    
    (v_section_id, 'calculate_credit_step4_main_bank', 'label',
     'בנק ראשי', 'Main Bank', 'Основной банк', 26),
    (v_section_id, 'calculate_credit_step4_main_bank_ph', 'placeholder',
     'בחר בנק ראשי', 'Select main bank', 'Выберите основной банк', 27),
    
    (v_section_id, 'calculate_credit_step4_years_with_bank', 'label',
     'מספר שנים בבנק', 'Years with Bank', 'Количество лет в банке', 28),
    (v_section_id, 'calculate_credit_step4_years_with_bank_ph', 'placeholder',
     'הזן מספר שנים', 'Enter number of years', 'Введите количество лет', 29),
    
    -- Credit history
    (v_section_id, 'calculate_credit_step4_credit_history_title', 'heading',
     'היסטוריית אשראי', 'Credit History', 'Кредитная история', 30),
    
    (v_section_id, 'calculate_credit_step4_credit_rating', 'label',
     'דירוג אשראי', 'Credit Rating', 'Кредитный рейтинг', 31),
    (v_section_id, 'calculate_credit_step4_credit_rating_ph', 'placeholder',
     'בחר דירוג אשראי', 'Select credit rating', 'Выберите кредитный рейтинг', 32),
    (v_section_id, 'calculate_credit_step4_credit_rating_option_1', 'option',
     'מעולה', 'Excellent', 'Отличная', 33),
    (v_section_id, 'calculate_credit_step4_credit_rating_option_2', 'option',
     'טובה', 'Good', 'Хорошая', 34),
    (v_section_id, 'calculate_credit_step4_credit_rating_option_3', 'option',
     'בינונית', 'Average', 'Средняя', 35),
    (v_section_id, 'calculate_credit_step4_credit_rating_option_4', 'option',
     'גרועה', 'Poor', 'Плохая', 36),
    
    -- Previous loans
    (v_section_id, 'calculate_credit_step4_previous_loans', 'label',
     'הלוואות קודמות', 'Previous Loans', 'Предыдущие займы', 37),
    (v_section_id, 'calculate_credit_step4_previous_loans_ph', 'placeholder',
     'בחר סטטוס הלוואות קודמות', 'Select previous loans status', 'Выберите статус предыдущих займов', 38),
    (v_section_id, 'calculate_credit_step4_previous_loans_option_1', 'option',
     'אין הלוואות קודמות', 'No previous loans', 'Нет предыдущих займов', 39),
    (v_section_id, 'calculate_credit_step4_previous_loans_option_2', 'option',
     'החזרתי בזמן', 'Repaid on time', 'Погасил вовремя', 40),
    (v_section_id, 'calculate_credit_step4_previous_loans_option_3', 'option',
     'איחורים קלים', 'Minor delays', 'Незначительные задержки', 41),
    (v_section_id, 'calculate_credit_step4_previous_loans_option_4', 'option',
     'איחורים משמעותיים', 'Significant delays', 'Значительные задержки', 42),
    
    -- Navigation buttons
    (v_section_id, 'calculate_credit_next_step', 'button',
     'הבא', 'Next', 'Далее', 43),
    (v_section_id, 'calculate_credit_previous_step', 'button',
     'הקודם', 'Previous', 'Назад', 44),
    (v_section_id, 'calculate_credit_save_progress', 'button',
     'שמור התקדמות', 'Save Progress', 'Сохранить прогресс', 45),
    (v_section_id, 'calculate_credit_calculate', 'button',
     'חשב', 'Calculate', 'Рассчитать', 46)
    ON CONFLICT (section_id, item_key) 
    DO UPDATE SET 
        content_he = EXCLUDED.content_he,
        content_en = EXCLUDED.content_en,
        content_ru = EXCLUDED.content_ru,
        updated_at = CURRENT_TIMESTAMP;

END $$;
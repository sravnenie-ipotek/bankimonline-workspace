-- Step 3: Personal Information for Credit Calculator (contentPool pattern)
INSERT INTO content_pages (page_key, page_name, description, meta_title, meta_description) 
VALUES ('credit_calculator_step3', 'Credit Calculator - Step 3: Personal Information', 'Personal information collection for credit calculation', 'Credit Calculator - Personal Information', 'Enter your personal information for credit calculation')
ON CONFLICT (page_key) DO UPDATE SET updated_at = CURRENT_TIMESTAMP;

-- Get the page_id
DO $$
DECLARE
    v_page_id INTEGER;
    v_section_id INTEGER;
BEGIN
    SELECT id INTO v_page_id FROM content_pages WHERE page_key = 'credit_calculator_step3';

    -- Create main section for Step 3
    INSERT INTO content_sections (page_id, section_key, section_name, order_index)
    VALUES (v_page_id, 'personal_info', 'Personal Information', 1)
    ON CONFLICT (page_id, section_key) DO UPDATE SET updated_at = CURRENT_TIMESTAMP
    RETURNING id INTO v_section_id;

    -- Insert content items for Step 3
    -- Headers and Labels
    INSERT INTO content_items (
        section_id, item_key, content_type, 
        content_he, content_en, content_ru,
        order_index
    ) VALUES
    (v_section_id, 'calculate_credit_step3_title', 'heading', 
     'פרטי הלווה', 'Borrower Details', 'Данные заемщика', 1),
    
    (v_section_id, 'calculate_credit_first_borrower_title', 'label',
     'פרטי לווה ראשי', 'Primary Borrower Details', 'Данные основного заемщика', 2),
    
    -- Name fields
    (v_section_id, 'calculate_credit_step3_private_name', 'label',
     'שם פרטי', 'First Name', 'Имя', 3),
    (v_section_id, 'calculate_credit_step3_private_name_ph', 'placeholder',
     'הזן שם פרטי', 'Enter first name', 'Введите имя', 4),
    
    (v_section_id, 'calculate_credit_step3_family_name', 'label',
     'שם משפחה', 'Last Name', 'Фамилия', 5),
    (v_section_id, 'calculate_credit_step3_family_name_ph', 'placeholder',
     'הזן שם משפחה', 'Enter last name', 'Введите фамилию', 6),
    
    -- ID field
    (v_section_id, 'calculate_credit_step3_id', 'label',
     'תעודת זהות', 'ID Number', 'Номер удостоверения', 7),
    (v_section_id, 'calculate_credit_step3_id_ph', 'placeholder',
     'הזן תעודת זהות', 'Enter ID number', 'Введите номер удостоверения', 8),
    
    -- Birthday field
    (v_section_id, 'calculate_credit_step3_birthday', 'label',
     'תאריך לידה', 'Date of Birth', 'Дата рождения', 9),
    (v_section_id, 'calculate_credit_step3_birthday_ph', 'placeholder',
     'בחר תאריך לידה', 'Select date of birth', 'Выберите дату рождения', 10),
    
    -- Citizenship field
    (v_section_id, 'calculate_credit_step3_citizenship', 'label',
     'אזרחות', 'Citizenship', 'Гражданство', 11),
    (v_section_id, 'calculate_credit_step3_citizenship_ph', 'placeholder',
     'בחר אזרחות', 'Select citizenship', 'Выберите гражданство', 12),
    (v_section_id, 'calculate_credit_step3_citizenship_option_1', 'option',
     'ישראלי', 'Israeli', 'Израильское', 13),
    (v_section_id, 'calculate_credit_step3_citizenship_option_2', 'option',
     'זר', 'Foreign', 'Иностранное', 14),
    
    -- City field
    (v_section_id, 'calculate_credit_step3_city', 'label',
     'עיר מגורים', 'City of Residence', 'Город проживания', 15),
    (v_section_id, 'calculate_credit_step3_city_ph', 'placeholder',
     'בחר עיר מגורים', 'Select city of residence', 'Выберите город проживания', 16),
    
    -- Street field
    (v_section_id, 'calculate_credit_step3_street', 'label',
     'רחוב', 'Street', 'Улица', 17),
    (v_section_id, 'calculate_credit_step3_street_ph', 'placeholder',
     'הזן רחוב', 'Enter street', 'Введите улицу', 18),
    
    -- Additional borrower
    (v_section_id, 'calculate_credit_add_borrower_title', 'heading',
     'הוסף לווה נוסף', 'Add Additional Borrower', 'Добавить дополнительного заемщика', 19),
    (v_section_id, 'calculate_credit_add_additional_borrower', 'button',
     'הוסף לווה נוסף', 'Add Additional Borrower', 'Добавить дополнительного заемщика', 20),
    
    -- Second borrower fields
    (v_section_id, 'calculate_credit_second_borrower_title', 'label',
     'פרטי לווה שני', 'Second Borrower Details', 'Данные второго заемщика', 21),
    
    (v_section_id, 'calculate_credit_second_borrower_private_name', 'label',
     'שם פרטי', 'First Name', 'Имя', 22),
    (v_section_id, 'calculate_credit_second_borrower_private_name_ph', 'placeholder',
     'הזן שם פרטי', 'Enter first name', 'Введите имя', 23),
    
    (v_section_id, 'calculate_credit_second_borrower_family_name', 'label',
     'שם משפחה', 'Last Name', 'Фамилия', 24),
    (v_section_id, 'calculate_credit_second_borrower_family_name_ph', 'placeholder',
     'הזן שם משפחה', 'Enter last name', 'Введите фамилию', 25),
    
    (v_section_id, 'calculate_credit_second_borrower_id', 'label',
     'תעודת זהות', 'ID Number', 'Номер удостоверения', 26),
    (v_section_id, 'calculate_credit_second_borrower_id_ph', 'placeholder',
     'הזן תעודת זהות', 'Enter ID number', 'Введите номер удостоверения', 27),
    
    (v_section_id, 'calculate_credit_second_borrower_birthday', 'label',
     'תאריך לידה', 'Date of Birth', 'Дата рождения', 28),
    (v_section_id, 'calculate_credit_second_borrower_birthday_ph', 'placeholder',
     'בחר תאריך לידה', 'Select date of birth', 'Выберите дату рождения', 29),
    
    (v_section_id, 'calculate_credit_second_borrower_citizenship', 'label',
     'אזרחות', 'Citizenship', 'Гражданство', 30),
    (v_section_id, 'calculate_credit_second_borrower_citizenship_ph', 'placeholder',
     'בחר אזרחות', 'Select citizenship', 'Выберите гражданство', 31),
    
    (v_section_id, 'calculate_credit_second_borrower_city', 'label',
     'עיר מגורים', 'City of Residence', 'Город проживания', 32),
    (v_section_id, 'calculate_credit_second_borrower_city_ph', 'placeholder',
     'בחר עיר מגורים', 'Select city of residence', 'Выберите город проживания', 33),
    
    (v_section_id, 'calculate_credit_second_borrower_street', 'label',
     'רחוב', 'Street', 'Улица', 34),
    (v_section_id, 'calculate_credit_second_borrower_street_ph', 'placeholder',
     'הזן רחוב', 'Enter street', 'Введите улицу', 35),
    
    -- Navigation buttons
    (v_section_id, 'calculate_credit_next_step', 'button',
     'הבא', 'Next', 'Далее', 36),
    (v_section_id, 'calculate_credit_previous_step', 'button',
     'הקודם', 'Previous', 'Назад', 37),
    (v_section_id, 'calculate_credit_save_progress', 'button',
     'שמור התקדמות', 'Save Progress', 'Сохранить прогресс', 38)
    ON CONFLICT (section_id, item_key) 
    DO UPDATE SET 
        content_he = EXCLUDED.content_he,
        content_en = EXCLUDED.content_en,
        content_ru = EXCLUDED.content_ru,
        updated_at = CURRENT_TIMESTAMP;

END $$;
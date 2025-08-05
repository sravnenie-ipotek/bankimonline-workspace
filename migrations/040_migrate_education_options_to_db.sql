-- Migration: Add Education Options to Content Management System
-- Description: Migrate education dropdown options from hardcoded values to database content

-- Helper function to insert content with translations
CREATE OR REPLACE FUNCTION insert_education_content_with_translations(
    p_key VARCHAR,
    p_en_text TEXT,
    p_he_text TEXT,
    p_ru_text TEXT,
    p_component_type VARCHAR DEFAULT 'dropdown',
    p_screen_location VARCHAR DEFAULT 'mortgage_step2',
    p_category VARCHAR DEFAULT 'form'
) RETURNS VOID AS $$
DECLARE
    v_content_item_id INTEGER;
BEGIN
    -- Insert into content_items
    INSERT INTO content_items (key, component_type, screen_location, category, status)
    VALUES (p_key, p_component_type, p_screen_location, p_category, 'active')
    RETURNING id INTO v_content_item_id;
    
    -- Insert English translation
    INSERT INTO content_translations (content_item_id, language_code, value, status)
    VALUES (v_content_item_id, 'en', p_en_text, 'active');
    
    -- Insert Hebrew translation
    INSERT INTO content_translations (content_item_id, language_code, value, status)
    VALUES (v_content_item_id, 'he', p_he_text, 'active');
    
    -- Insert Russian translation
    INSERT INTO content_translations (content_item_id, language_code, value, status)
    VALUES (v_content_item_id, 'ru', p_ru_text, 'active');
    
    RAISE NOTICE 'Inserted content: % with translations', p_key;
END;
$$ LANGUAGE plpgsql;

-- Add Education dropdown label and placeholder
SELECT insert_education_content_with_translations(
    'calculate_mortgage_education',
    'Education',
    'השכלה',
    'Образование',
    'label'
);

SELECT insert_education_content_with_translations(
    'calculate_mortgage_education_ph',
    'Select your education level',
    'בחר את רמת ההשכלה שלך',
    'Выберите уровень образования',
    'placeholder'
);

-- Add Education Option 1: No high school diploma
SELECT insert_education_content_with_translations(
    'calculate_mortgage_education_option_1',
    'No high school diploma',
    'ללא תעודת בגרות',
    'Без аттестата о среднем образовании',
    'dropdown_option'
);

-- Add Education Option 2: Partial high school diploma
SELECT insert_education_content_with_translations(
    'calculate_mortgage_education_option_2',
    'Partial high school diploma',
    'תעודת בגרות חלקית',
    'Частичный аттестат о среднем образовании',
    'dropdown_option'
);

-- Add Education Option 3: Full high school diploma
SELECT insert_education_content_with_translations(
    'calculate_mortgage_education_option_3',
    'Full high school diploma',
    'תעודת בגרות מלאה',
    'Полный аттестат о среднем образовании',
    'dropdown_option'
);

-- Add Education Option 4: Post-secondary education
SELECT insert_education_content_with_translations(
    'calculate_mortgage_education_option_4',
    'Post-secondary education',
    'השכלה על-תיכונית',
    'Послесреднее образование',
    'dropdown_option'
);

-- Add Education Option 5: Bachelor's degree
SELECT insert_education_content_with_translations(
    'calculate_mortgage_education_option_5',
    'Bachelor''s degree',
    'תואר ראשון',
    'Высшее образование (бакалавриат)',
    'dropdown_option'
);

-- Add Education Option 6: Master's degree
SELECT insert_education_content_with_translations(
    'calculate_mortgage_education_option_6',
    'Master''s degree',
    'תואר שני',
    'Высшее образование (магистратура)',
    'dropdown_option'
);

-- Add Education Option 7: Doctoral degree
SELECT insert_education_content_with_translations(
    'calculate_mortgage_education_option_7',
    'Doctoral degree',
    'תואר שלישי',
    'Высшее образование (докторантура)',
    'dropdown_option'
);

-- Drop the helper function
DROP FUNCTION insert_education_content_with_translations(VARCHAR, TEXT, TEXT, TEXT, VARCHAR, VARCHAR, VARCHAR);

-- Verify the migration
SELECT 
    ci.key,
    ci.component_type,
    ci.screen_location,
    ct.language_code,
    ct.value
FROM content_items ci
JOIN content_translations ct ON ci.id = ct.content_item_id
WHERE ci.key LIKE '%education%'
    AND ci.screen_location = 'mortgage_step2'
    AND ct.status = 'active'
ORDER BY ci.key, ct.language_code; 
-- Migration: Add Marital Status Dropdown for Other Borrowers Step 1
-- Date: 2025-01-19
-- Description: Add missing marital_status dropdown for other_borrowers_step1 following dropdown logic guide
-- Author: System
-- Following: @dropDownLogicBankim.md - Database First Approach

-- Add marital_status dropdown for other_borrowers_step1 
-- (Frontend expects field_name = 'marital_status' based on FamilyStatusFlexible.tsx)
INSERT INTO dropdown_configs (
    screen_location,
    field_name,
    dropdown_key,
    dropdown_data,
    is_active,
    created_at,
    updated_at
) VALUES (
    'other_borrowers_step1',
    'marital_status',
    'other_borrowers_step1_marital_status',
    jsonb_build_object(
        'label', jsonb_build_object(
            'en', 'Marital Status',
            'he', 'מצב משפחתי',
            'ru', 'Семейное положение'
        ),
        'placeholder', jsonb_build_object(
            'en', 'Select marital status',
            'he', 'בחר מצב משפחתי',
            'ru', 'Выберите семейное положение'
        ),
        'options', jsonb_build_array(
            jsonb_build_object(
                'value', 'single',
                'text', jsonb_build_object(
                    'en', 'Single',
                    'he', 'רווק/רווקה',
                    'ru', 'Холост/Не замужем'
                )
            ),
            jsonb_build_object(
                'value', 'married',
                'text', jsonb_build_object(
                    'en', 'Married',
                    'he', 'נשוי/נשואה',
                    'ru', 'Женат/Замужем'
                )
            ),
            jsonb_build_object(
                'value', 'divorced',
                'text', jsonb_build_object(
                    'en', 'Divorced',
                    'he', 'גרוש/גרושה',
                    'ru', 'Разведен/Разведена'
                )
            ),
            jsonb_build_object(
                'value', 'widowed',
                'text', jsonb_build_object(
                    'en', 'Widowed',
                    'he', 'אלמן/אלמנה',
                    'ru', 'Вдовец/Вдова'
                )
            ),
            jsonb_build_object(
                'value', 'civil_union',
                'text', jsonb_build_object(
                    'en', 'Civil Union',
                    'he', 'ידוע/ידועה בציבור',
                    'ru', 'Гражданский брак'
                )
            ),
            jsonb_build_object(
                'value', 'separated',
                'text', jsonb_build_object(
                    'en', 'Separated',
                    'he', 'פרוד/פרודה',
                    'ru', 'Раздельно проживающий'
                )
            )
        ),
        'metadata', jsonb_build_object(
            'source', 'other_borrowers_marital_status_migration',
            'created_at', NOW()::text,
            'option_count', 6,
            'languages', jsonb_build_array('en', 'he', 'ru'),
            'frontend_field', 'marital_status',
            'dropdown_logic_guide', 'followed'
        )
    ),
    true,
    NOW(),
    NOW()
);

-- Verify the new dropdown was created correctly
SELECT 
    dropdown_key,
    field_name,
    screen_location,
    jsonb_array_length(dropdown_data->'options') as option_count,
    dropdown_data->'label'->>'he' as hebrew_label,
    dropdown_data->'options'->0->'text'->>'he' as first_option_hebrew
FROM dropdown_configs 
WHERE dropdown_key = 'other_borrowers_step1_marital_status';

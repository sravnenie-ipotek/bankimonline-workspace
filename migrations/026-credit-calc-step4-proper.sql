-- Step 4: Income and Employment for Credit Calculator (proper structure)
-- Insert content items for Step 4

-- Step 4 Title
INSERT INTO content_items (content_key, content_type, category, screen_location, component_type, description, legacy_translation_key, migration_status)
VALUES ('calculate_credit_step4_title', 'text', 'credit_calculator_step4', 'step4_header', 'heading', 'Step 4 title for credit calculator', 'calculate_credit_step4_title', 'migrated')
ON CONFLICT (content_key) DO UPDATE SET updated_at = CURRENT_TIMESTAMP;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'he', 'פרטי הכנסה ותעסוקה', 'approved' FROM content_items WHERE content_key = 'calculate_credit_step4_title'
ON CONFLICT (content_item_id, language_code) DO UPDATE SET content_value = EXCLUDED.content_value, updated_at = CURRENT_TIMESTAMP;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'en', 'Income and Employment Details', 'approved' FROM content_items WHERE content_key = 'calculate_credit_step4_title'
ON CONFLICT (content_item_id, language_code) DO UPDATE SET content_value = EXCLUDED.content_value, updated_at = CURRENT_TIMESTAMP;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'ru', 'Данные о доходах и занятости', 'approved' FROM content_items WHERE content_key = 'calculate_credit_step4_title'
ON CONFLICT (content_item_id, language_code) DO UPDATE SET content_value = EXCLUDED.content_value, updated_at = CURRENT_TIMESTAMP;

-- Employment Type
INSERT INTO content_items (content_key, content_type, category, screen_location, component_type, description, legacy_translation_key, migration_status)
VALUES ('calculate_credit_step4_employment_type', 'text', 'credit_calculator_step4', 'step4_employment', 'field_label', 'Employment type field label', 'calculate_credit_step4_employment_type', 'migrated')
ON CONFLICT (content_key) DO UPDATE SET updated_at = CURRENT_TIMESTAMP;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'he', 'סוג תעסוקה', 'approved' FROM content_items WHERE content_key = 'calculate_credit_step4_employment_type'
ON CONFLICT (content_item_id, language_code) DO UPDATE SET content_value = EXCLUDED.content_value, updated_at = CURRENT_TIMESTAMP;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'en', 'Employment Type', 'approved' FROM content_items WHERE content_key = 'calculate_credit_step4_employment_type'
ON CONFLICT (content_item_id, language_code) DO UPDATE SET content_value = EXCLUDED.content_value, updated_at = CURRENT_TIMESTAMP;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'ru', 'Тип занятости', 'approved' FROM content_items WHERE content_key = 'calculate_credit_step4_employment_type'
ON CONFLICT (content_item_id, language_code) DO UPDATE SET content_value = EXCLUDED.content_value, updated_at = CURRENT_TIMESTAMP;

-- Employment Type Placeholder
INSERT INTO content_items (content_key, content_type, category, screen_location, component_type, description, legacy_translation_key, migration_status)
VALUES ('calculate_credit_step4_employment_type_ph', 'text', 'credit_calculator_step4', 'step4_employment', 'placeholder', 'Employment type field placeholder', 'calculate_credit_step4_employment_type_ph', 'migrated')
ON CONFLICT (content_key) DO UPDATE SET updated_at = CURRENT_TIMESTAMP;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'he', 'בחר סוג תעסוקה', 'approved' FROM content_items WHERE content_key = 'calculate_credit_step4_employment_type_ph'
ON CONFLICT (content_item_id, language_code) DO UPDATE SET content_value = EXCLUDED.content_value, updated_at = CURRENT_TIMESTAMP;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'en', 'Select employment type', 'approved' FROM content_items WHERE content_key = 'calculate_credit_step4_employment_type_ph'
ON CONFLICT (content_item_id, language_code) DO UPDATE SET content_value = EXCLUDED.content_value, updated_at = CURRENT_TIMESTAMP;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'ru', 'Выберите тип занятости', 'approved' FROM content_items WHERE content_key = 'calculate_credit_step4_employment_type_ph'
ON CONFLICT (content_item_id, language_code) DO UPDATE SET content_value = EXCLUDED.content_value, updated_at = CURRENT_TIMESTAMP;

-- Employment Type Options
INSERT INTO content_items (content_key, content_type, category, screen_location, component_type, description, legacy_translation_key, migration_status)
VALUES ('calculate_credit_step4_employment_type_option_1', 'text', 'credit_calculator_step4', 'step4_employment', 'option', 'Employee option', 'calculate_credit_step4_employment_type_option_1', 'migrated')
ON CONFLICT (content_key) DO UPDATE SET updated_at = CURRENT_TIMESTAMP;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'he', 'שכיר', 'approved' FROM content_items WHERE content_key = 'calculate_credit_step4_employment_type_option_1'
ON CONFLICT (content_item_id, language_code) DO UPDATE SET content_value = EXCLUDED.content_value, updated_at = CURRENT_TIMESTAMP;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'en', 'Employee', 'approved' FROM content_items WHERE content_key = 'calculate_credit_step4_employment_type_option_1'
ON CONFLICT (content_item_id, language_code) DO UPDATE SET content_value = EXCLUDED.content_value, updated_at = CURRENT_TIMESTAMP;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'ru', 'Наемный работник', 'approved' FROM content_items WHERE content_key = 'calculate_credit_step4_employment_type_option_1'
ON CONFLICT (content_item_id, language_code) DO UPDATE SET content_value = EXCLUDED.content_value, updated_at = CURRENT_TIMESTAMP;

INSERT INTO content_items (content_key, content_type, category, screen_location, component_type, description, legacy_translation_key, migration_status)
VALUES ('calculate_credit_step4_employment_type_option_2', 'text', 'credit_calculator_step4', 'step4_employment', 'option', 'Self-employed option', 'calculate_credit_step4_employment_type_option_2', 'migrated')
ON CONFLICT (content_key) DO UPDATE SET updated_at = CURRENT_TIMESTAMP;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'he', 'עצמאי', 'approved' FROM content_items WHERE content_key = 'calculate_credit_step4_employment_type_option_2'
ON CONFLICT (content_item_id, language_code) DO UPDATE SET content_value = EXCLUDED.content_value, updated_at = CURRENT_TIMESTAMP;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'en', 'Self-Employed', 'approved' FROM content_items WHERE content_key = 'calculate_credit_step4_employment_type_option_2'
ON CONFLICT (content_item_id, language_code) DO UPDATE SET content_value = EXCLUDED.content_value, updated_at = CURRENT_TIMESTAMP;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'ru', 'Индивидуальный предприниматель', 'approved' FROM content_items WHERE content_key = 'calculate_credit_step4_employment_type_option_2'
ON CONFLICT (content_item_id, language_code) DO UPDATE SET content_value = EXCLUDED.content_value, updated_at = CURRENT_TIMESTAMP;

INSERT INTO content_items (content_key, content_type, category, screen_location, component_type, description, legacy_translation_key, migration_status)
VALUES ('calculate_credit_step4_employment_type_option_3', 'text', 'credit_calculator_step4', 'step4_employment', 'option', 'Pensioner option', 'calculate_credit_step4_employment_type_option_3', 'migrated')
ON CONFLICT (content_key) DO UPDATE SET updated_at = CURRENT_TIMESTAMP;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'he', 'פנסיונר', 'approved' FROM content_items WHERE content_key = 'calculate_credit_step4_employment_type_option_3'
ON CONFLICT (content_item_id, language_code) DO UPDATE SET content_value = EXCLUDED.content_value, updated_at = CURRENT_TIMESTAMP;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'en', 'Pensioner', 'approved' FROM content_items WHERE content_key = 'calculate_credit_step4_employment_type_option_3'
ON CONFLICT (content_item_id, language_code) DO UPDATE SET content_value = EXCLUDED.content_value, updated_at = CURRENT_TIMESTAMP;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'ru', 'Пенсионер', 'approved' FROM content_items WHERE content_key = 'calculate_credit_step4_employment_type_option_3'
ON CONFLICT (content_item_id, language_code) DO UPDATE SET content_value = EXCLUDED.content_value, updated_at = CURRENT_TIMESTAMP;

INSERT INTO content_items (content_key, content_type, category, screen_location, component_type, description, legacy_translation_key, migration_status)
VALUES ('calculate_credit_step4_employment_type_option_4', 'text', 'credit_calculator_step4', 'step4_employment', 'option', 'Unemployed option', 'calculate_credit_step4_employment_type_option_4', 'migrated')
ON CONFLICT (content_key) DO UPDATE SET updated_at = CURRENT_TIMESTAMP;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'he', 'לא עובד', 'approved' FROM content_items WHERE content_key = 'calculate_credit_step4_employment_type_option_4'
ON CONFLICT (content_item_id, language_code) DO UPDATE SET content_value = EXCLUDED.content_value, updated_at = CURRENT_TIMESTAMP;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'en', 'Unemployed', 'approved' FROM content_items WHERE content_key = 'calculate_credit_step4_employment_type_option_4'
ON CONFLICT (content_item_id, language_code) DO UPDATE SET content_value = EXCLUDED.content_value, updated_at = CURRENT_TIMESTAMP;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'ru', 'Безработный', 'approved' FROM content_items WHERE content_key = 'calculate_credit_step4_employment_type_option_4'
ON CONFLICT (content_item_id, language_code) DO UPDATE SET content_value = EXCLUDED.content_value, updated_at = CURRENT_TIMESTAMP;

-- Monthly Salary
INSERT INTO content_items (content_key, content_type, category, screen_location, component_type, description, legacy_translation_key, migration_status)
VALUES ('calculate_credit_step4_monthly_salary', 'text', 'credit_calculator_step4', 'step4_income', 'field_label', 'Monthly salary field label', 'calculate_credit_step4_monthly_salary', 'migrated')
ON CONFLICT (content_key) DO UPDATE SET updated_at = CURRENT_TIMESTAMP;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'he', 'משכורת חודשית נטו (ש"ח)', 'approved' FROM content_items WHERE content_key = 'calculate_credit_step4_monthly_salary'
ON CONFLICT (content_item_id, language_code) DO UPDATE SET content_value = EXCLUDED.content_value, updated_at = CURRENT_TIMESTAMP;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'en', 'Monthly Net Salary (ILS)', 'approved' FROM content_items WHERE content_key = 'calculate_credit_step4_monthly_salary'
ON CONFLICT (content_item_id, language_code) DO UPDATE SET content_value = EXCLUDED.content_value, updated_at = CURRENT_TIMESTAMP;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'ru', 'Ежемесячная зарплата нетто (шек.)', 'approved' FROM content_items WHERE content_key = 'calculate_credit_step4_monthly_salary'
ON CONFLICT (content_item_id, language_code) DO UPDATE SET content_value = EXCLUDED.content_value, updated_at = CURRENT_TIMESTAMP;

-- Monthly Salary Placeholder
INSERT INTO content_items (content_key, content_type, category, screen_location, component_type, description, legacy_translation_key, migration_status)
VALUES ('calculate_credit_step4_monthly_salary_ph', 'text', 'credit_calculator_step4', 'step4_income', 'placeholder', 'Monthly salary field placeholder', 'calculate_credit_step4_monthly_salary_ph', 'migrated')
ON CONFLICT (content_key) DO UPDATE SET updated_at = CURRENT_TIMESTAMP;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'he', 'הזן משכורת חודשית', 'approved' FROM content_items WHERE content_key = 'calculate_credit_step4_monthly_salary_ph'
ON CONFLICT (content_item_id, language_code) DO UPDATE SET content_value = EXCLUDED.content_value, updated_at = CURRENT_TIMESTAMP;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'en', 'Enter monthly salary', 'approved' FROM content_items WHERE content_key = 'calculate_credit_step4_monthly_salary_ph'
ON CONFLICT (content_item_id, language_code) DO UPDATE SET content_value = EXCLUDED.content_value, updated_at = CURRENT_TIMESTAMP;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'ru', 'Введите ежемесячную зарплату', 'approved' FROM content_items WHERE content_key = 'calculate_credit_step4_monthly_salary_ph'
ON CONFLICT (content_item_id, language_code) DO UPDATE SET content_value = EXCLUDED.content_value, updated_at = CURRENT_TIMESTAMP;

-- Additional Income
INSERT INTO content_items (content_key, content_type, category, screen_location, component_type, description, legacy_translation_key, migration_status)
VALUES ('calculate_credit_step4_additional_income', 'text', 'credit_calculator_step4', 'step4_income', 'field_label', 'Additional income field label', 'calculate_credit_step4_additional_income', 'migrated')
ON CONFLICT (content_key) DO UPDATE SET updated_at = CURRENT_TIMESTAMP;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'he', 'הכנסה נוספת חודשית (ש"ח)', 'approved' FROM content_items WHERE content_key = 'calculate_credit_step4_additional_income'
ON CONFLICT (content_item_id, language_code) DO UPDATE SET content_value = EXCLUDED.content_value, updated_at = CURRENT_TIMESTAMP;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'en', 'Additional Monthly Income (ILS)', 'approved' FROM content_items WHERE content_key = 'calculate_credit_step4_additional_income'
ON CONFLICT (content_item_id, language_code) DO UPDATE SET content_value = EXCLUDED.content_value, updated_at = CURRENT_TIMESTAMP;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'ru', 'Дополнительный ежемесячный доход (шек.)', 'approved' FROM content_items WHERE content_key = 'calculate_credit_step4_additional_income'
ON CONFLICT (content_item_id, language_code) DO UPDATE SET content_value = EXCLUDED.content_value, updated_at = CURRENT_TIMESTAMP;

-- Additional Income Placeholder
INSERT INTO content_items (content_key, content_type, category, screen_location, component_type, description, legacy_translation_key, migration_status)
VALUES ('calculate_credit_step4_additional_income_ph', 'text', 'credit_calculator_step4', 'step4_income', 'placeholder', 'Additional income field placeholder', 'calculate_credit_step4_additional_income_ph', 'migrated')
ON CONFLICT (content_key) DO UPDATE SET updated_at = CURRENT_TIMESTAMP;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'he', 'הזן הכנסה נוספת', 'approved' FROM content_items WHERE content_key = 'calculate_credit_step4_additional_income_ph'
ON CONFLICT (content_item_id, language_code) DO UPDATE SET content_value = EXCLUDED.content_value, updated_at = CURRENT_TIMESTAMP;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'en', 'Enter additional income', 'approved' FROM content_items WHERE content_key = 'calculate_credit_step4_additional_income_ph'
ON CONFLICT (content_item_id, language_code) DO UPDATE SET content_value = EXCLUDED.content_value, updated_at = CURRENT_TIMESTAMP;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'ru', 'Введите дополнительный доход', 'approved' FROM content_items WHERE content_key = 'calculate_credit_step4_additional_income_ph'
ON CONFLICT (content_item_id, language_code) DO UPDATE SET content_value = EXCLUDED.content_value, updated_at = CURRENT_TIMESTAMP;

-- Monthly Expenses
INSERT INTO content_items (content_key, content_type, category, screen_location, component_type, description, legacy_translation_key, migration_status)
VALUES ('calculate_credit_step4_monthly_expenses', 'text', 'credit_calculator_step4', 'step4_income', 'field_label', 'Monthly expenses field label', 'calculate_credit_step4_monthly_expenses', 'migrated')
ON CONFLICT (content_key) DO UPDATE SET updated_at = CURRENT_TIMESTAMP;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'he', 'הוצאות חודשיות (ש"ח)', 'approved' FROM content_items WHERE content_key = 'calculate_credit_step4_monthly_expenses'
ON CONFLICT (content_item_id, language_code) DO UPDATE SET content_value = EXCLUDED.content_value, updated_at = CURRENT_TIMESTAMP;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'en', 'Monthly Expenses (ILS)', 'approved' FROM content_items WHERE content_key = 'calculate_credit_step4_monthly_expenses'
ON CONFLICT (content_item_id, language_code) DO UPDATE SET content_value = EXCLUDED.content_value, updated_at = CURRENT_TIMESTAMP;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'ru', 'Ежемесячные расходы (шек.)', 'approved' FROM content_items WHERE content_key = 'calculate_credit_step4_monthly_expenses'
ON CONFLICT (content_item_id, language_code) DO UPDATE SET content_value = EXCLUDED.content_value, updated_at = CURRENT_TIMESTAMP;

-- Monthly Expenses Placeholder
INSERT INTO content_items (content_key, content_type, category, screen_location, component_type, description, legacy_translation_key, migration_status)
VALUES ('calculate_credit_step4_monthly_expenses_ph', 'text', 'credit_calculator_step4', 'step4_income', 'placeholder', 'Monthly expenses field placeholder', 'calculate_credit_step4_monthly_expenses_ph', 'migrated')
ON CONFLICT (content_key) DO UPDATE SET updated_at = CURRENT_TIMESTAMP;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'he', 'הזן הוצאות חודשיות', 'approved' FROM content_items WHERE content_key = 'calculate_credit_step4_monthly_expenses_ph'
ON CONFLICT (content_item_id, language_code) DO UPDATE SET content_value = EXCLUDED.content_value, updated_at = CURRENT_TIMESTAMP;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'en', 'Enter monthly expenses', 'approved' FROM content_items WHERE content_key = 'calculate_credit_step4_monthly_expenses_ph'
ON CONFLICT (content_item_id, language_code) DO UPDATE SET content_value = EXCLUDED.content_value, updated_at = CURRENT_TIMESTAMP;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'ru', 'Введите ежемесячные расходы', 'approved' FROM content_items WHERE content_key = 'calculate_credit_step4_monthly_expenses_ph'
ON CONFLICT (content_item_id, language_code) DO UPDATE SET content_value = EXCLUDED.content_value, updated_at = CURRENT_TIMESTAMP;

-- Navigate buttons (already exist from step 2, but making sure they're consistent)
INSERT INTO content_items (content_key, content_type, category, screen_location, component_type, description, legacy_translation_key, migration_status)
VALUES ('calculate_credit_next_step', 'text', 'credit_calculator_navigation', 'navigation', 'button', 'Next step button', 'calculate_credit_next_step', 'migrated')
ON CONFLICT (content_key) DO UPDATE SET updated_at = CURRENT_TIMESTAMP;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'he', 'הבא', 'approved' FROM content_items WHERE content_key = 'calculate_credit_next_step'
ON CONFLICT (content_item_id, language_code) DO UPDATE SET content_value = EXCLUDED.content_value, updated_at = CURRENT_TIMESTAMP;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'en', 'Next', 'approved' FROM content_items WHERE content_key = 'calculate_credit_next_step'
ON CONFLICT (content_item_id, language_code) DO UPDATE SET content_value = EXCLUDED.content_value, updated_at = CURRENT_TIMESTAMP;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'ru', 'Далее', 'approved' FROM content_items WHERE content_key = 'calculate_credit_next_step'
ON CONFLICT (content_item_id, language_code) DO UPDATE SET content_value = EXCLUDED.content_value, updated_at = CURRENT_TIMESTAMP;

INSERT INTO content_items (content_key, content_type, category, screen_location, component_type, description, legacy_translation_key, migration_status)
VALUES ('calculate_credit_previous_step', 'text', 'credit_calculator_navigation', 'navigation', 'button', 'Previous step button', 'calculate_credit_previous_step', 'migrated')
ON CONFLICT (content_key) DO UPDATE SET updated_at = CURRENT_TIMESTAMP;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'he', 'הקודם', 'approved' FROM content_items WHERE content_key = 'calculate_credit_previous_step'
ON CONFLICT (content_item_id, language_code) DO UPDATE SET content_value = EXCLUDED.content_value, updated_at = CURRENT_TIMESTAMP;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'en', 'Previous', 'approved' FROM content_items WHERE content_key = 'calculate_credit_previous_step'
ON CONFLICT (content_item_id, language_code) DO UPDATE SET content_value = EXCLUDED.content_value, updated_at = CURRENT_TIMESTAMP;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'ru', 'Назад', 'approved' FROM content_items WHERE content_key = 'calculate_credit_previous_step'
ON CONFLICT (content_item_id, language_code) DO UPDATE SET content_value = EXCLUDED.content_value, updated_at = CURRENT_TIMESTAMP;

INSERT INTO content_items (content_key, content_type, category, screen_location, component_type, description, legacy_translation_key, migration_status)
VALUES ('calculate_credit_calculate', 'text', 'credit_calculator_navigation', 'navigation', 'button', 'Calculate button', 'calculate_credit_calculate', 'migrated')
ON CONFLICT (content_key) DO UPDATE SET updated_at = CURRENT_TIMESTAMP;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'he', 'חשב', 'approved' FROM content_items WHERE content_key = 'calculate_credit_calculate'
ON CONFLICT (content_item_id, language_code) DO UPDATE SET content_value = EXCLUDED.content_value, updated_at = CURRENT_TIMESTAMP;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'en', 'Calculate', 'approved' FROM content_items WHERE content_key = 'calculate_credit_calculate'
ON CONFLICT (content_item_id, language_code) DO UPDATE SET content_value = EXCLUDED.content_value, updated_at = CURRENT_TIMESTAMP;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT id, 'ru', 'Рассчитать', 'approved' FROM content_items WHERE content_key = 'calculate_credit_calculate'
ON CONFLICT (content_item_id, language_code) DO UPDATE SET content_value = EXCLUDED.content_value, updated_at = CURRENT_TIMESTAMP;
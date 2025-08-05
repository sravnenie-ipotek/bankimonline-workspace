-- =====================================================
-- Fix Numeric Dropdown Naming Violations
-- =====================================================
-- Following rules from DEVHelp/docs/dropDownsInDBLogic
-- Converting numeric patterns (option_1) to descriptive names
-- =====================================================

-- Start transaction for safety
BEGIN;

-- =====================================================
-- 1. MORTGAGE STEP 1 - When Money Needed Options
-- =====================================================
UPDATE content_items 
SET content_key = 'mortgage_step1_field_when_needed_immediately'
WHERE content_key = 'mortgage_step1_field_when_needed_option_1';

UPDATE content_items 
SET content_key = 'mortgage_step1_field_when_needed_within_month'
WHERE content_key = 'mortgage_step1_field_when_needed_option_2';

UPDATE content_items 
SET content_key = 'mortgage_step1_field_when_needed_within_3months'
WHERE content_key = 'mortgage_step1_field_when_needed_option_3';

UPDATE content_items 
SET content_key = 'mortgage_step1_field_when_needed_within_6months'
WHERE content_key = 'mortgage_step1_field_when_needed_option_4';

-- =====================================================
-- 2. CALCULATE CREDIT - Credit Purpose Options
-- =====================================================
UPDATE content_items 
SET content_key = 'calculate_credit_credit_purpose_new_car'
WHERE content_key = 'calculate_credit_credit_purpose_option_1';

UPDATE content_items 
SET content_key = 'calculate_credit_credit_purpose_used_car'
WHERE content_key = 'calculate_credit_credit_purpose_option_2';

UPDATE content_items 
SET content_key = 'calculate_credit_credit_purpose_home_renovation'
WHERE content_key = 'calculate_credit_credit_purpose_option_3';

UPDATE content_items 
SET content_key = 'calculate_credit_credit_purpose_vacation'
WHERE content_key = 'calculate_credit_credit_purpose_option_4';

UPDATE content_items 
SET content_key = 'calculate_credit_credit_purpose_wedding'
WHERE content_key = 'calculate_credit_credit_purpose_option_5';

UPDATE content_items 
SET content_key = 'calculate_credit_credit_purpose_medical'
WHERE content_key = 'calculate_credit_credit_purpose_option_6';

UPDATE content_items 
SET content_key = 'calculate_credit_credit_purpose_other'
WHERE content_key = 'calculate_credit_credit_purpose_option_7';

-- =====================================================
-- 3. PERSONAL DATA - Marital Status Options
-- =====================================================
UPDATE content_items 
SET content_key = 'personal_data_marital_status_single'
WHERE content_key = 'personal_data_marital_status_option_1';

UPDATE content_items 
SET content_key = 'personal_data_marital_status_married'
WHERE content_key = 'personal_data_marital_status_option_2';

UPDATE content_items 
SET content_key = 'personal_data_marital_status_divorced'
WHERE content_key = 'personal_data_marital_status_option_3';

UPDATE content_items 
SET content_key = 'personal_data_marital_status_widowed'
WHERE content_key = 'personal_data_marital_status_option_4';

UPDATE content_items 
SET content_key = 'personal_data_marital_status_separated'
WHERE content_key = 'personal_data_marital_status_option_5';

UPDATE content_items 
SET content_key = 'personal_data_marital_status_cohabiting'
WHERE content_key = 'personal_data_marital_status_option_6';

-- =====================================================
-- 4. MORTGAGE EDUCATION Options
-- =====================================================
UPDATE content_items 
SET content_key = 'calculate_mortgage_education_elementary'
WHERE content_key = 'calculate_mortgage_education_option_1';

UPDATE content_items 
SET content_key = 'calculate_mortgage_education_high_school'
WHERE content_key = 'calculate_mortgage_education_option_2';

UPDATE content_items 
SET content_key = 'calculate_mortgage_education_high_school_diploma'
WHERE content_key = 'calculate_mortgage_education_option_3';

UPDATE content_items 
SET content_key = 'calculate_mortgage_education_professional'
WHERE content_key = 'calculate_mortgage_education_option_4';

UPDATE content_items 
SET content_key = 'calculate_mortgage_education_bachelors'
WHERE content_key = 'calculate_mortgage_education_option_5';

UPDATE content_items 
SET content_key = 'calculate_mortgage_education_masters'
WHERE content_key = 'calculate_mortgage_education_option_6';

UPDATE content_items 
SET content_key = 'calculate_mortgage_education_doctorate'
WHERE content_key = 'calculate_mortgage_education_option_7';

-- =====================================================
-- 5. REFINANCE CREDIT - Why Refinancing Options
-- =====================================================
UPDATE content_items 
SET content_key = 'app.refinance_credit.step1.why_reduce_monthly'
WHERE content_key = 'app.refinance_credit.step1.why_option_1';

UPDATE content_items 
SET content_key = 'app.refinance_credit.step1.why_reduce_amount'
WHERE content_key = 'app.refinance_credit.step1.why_option_2';

UPDATE content_items 
SET content_key = 'app.refinance_credit.step1.why_consolidate'
WHERE content_key = 'app.refinance_credit.step1.why_option_3';

UPDATE content_items 
SET content_key = 'app.refinance_credit.step1.why_other'
WHERE content_key = 'app.refinance_credit.step1.why_option_4';

-- =====================================================
-- 6. MAIN SOURCE OF INCOME Options
-- =====================================================
UPDATE content_items 
SET content_key = 'calculate_mortgage_main_source_salary'
WHERE content_key = 'calculate_mortgage_main_source_option_1';

UPDATE content_items 
SET content_key = 'calculate_mortgage_main_source_business'
WHERE content_key = 'calculate_mortgage_main_source_option_2';

UPDATE content_items 
SET content_key = 'calculate_mortgage_main_source_freelance'
WHERE content_key = 'calculate_mortgage_main_source_option_3';

UPDATE content_items 
SET content_key = 'calculate_mortgage_main_source_pension'
WHERE content_key = 'calculate_mortgage_main_source_option_4';

UPDATE content_items 
SET content_key = 'calculate_mortgage_main_source_investment'
WHERE content_key = 'calculate_mortgage_main_source_option_5';

UPDATE content_items 
SET content_key = 'calculate_mortgage_main_source_rental'
WHERE content_key = 'calculate_mortgage_main_source_option_6';

UPDATE content_items 
SET content_key = 'calculate_mortgage_main_source_other'
WHERE content_key = 'calculate_mortgage_main_source_option_7';

-- =====================================================
-- 7. ADDITIONAL INCOME Options
-- =====================================================
UPDATE content_items 
SET content_key = 'calculate_mortgage_has_additional_salary'
WHERE content_key = 'calculate_mortgage_has_additional_option_1';

UPDATE content_items 
SET content_key = 'calculate_mortgage_has_additional_business'
WHERE content_key = 'calculate_mortgage_has_additional_option_2';

UPDATE content_items 
SET content_key = 'calculate_mortgage_has_additional_freelance'
WHERE content_key = 'calculate_mortgage_has_additional_option_3';

UPDATE content_items 
SET content_key = 'calculate_mortgage_has_additional_pension'
WHERE content_key = 'calculate_mortgage_has_additional_option_4';

UPDATE content_items 
SET content_key = 'calculate_mortgage_has_additional_investment'
WHERE content_key = 'calculate_mortgage_has_additional_option_5';

UPDATE content_items 
SET content_key = 'calculate_mortgage_has_additional_rental'
WHERE content_key = 'calculate_mortgage_has_additional_option_6';

UPDATE content_items 
SET content_key = 'calculate_mortgage_has_additional_other'
WHERE content_key = 'calculate_mortgage_has_additional_option_7';

-- =====================================================
-- 8. DEBT TYPES Options
-- =====================================================
UPDATE content_items 
SET content_key = 'calculate_mortgage_debt_types_mortgage'
WHERE content_key = 'calculate_mortgage_debt_types_option_1';

UPDATE content_items 
SET content_key = 'calculate_mortgage_debt_types_car_loan'
WHERE content_key = 'calculate_mortgage_debt_types_option_2';

UPDATE content_items 
SET content_key = 'calculate_mortgage_debt_types_student_loan'
WHERE content_key = 'calculate_mortgage_debt_types_option_3';

UPDATE content_items 
SET content_key = 'calculate_mortgage_debt_types_credit_card'
WHERE content_key = 'calculate_mortgage_debt_types_option_4';

UPDATE content_items 
SET content_key = 'calculate_mortgage_debt_types_other'
WHERE content_key = 'calculate_mortgage_debt_types_option_5';

-- =====================================================
-- 9. PROPERTY TYPE Options
-- =====================================================
UPDATE content_items 
SET content_key = 'calculate_mortgage_type_apartment'
WHERE content_key = 'calculate_mortgage_type_options_1';

UPDATE content_items 
SET content_key = 'calculate_mortgage_type_private_house'
WHERE content_key = 'calculate_mortgage_type_options_2';

UPDATE content_items 
SET content_key = 'calculate_mortgage_type_penthouse'
WHERE content_key = 'calculate_mortgage_type_options_3';

UPDATE content_items 
SET content_key = 'calculate_mortgage_type_land'
WHERE content_key = 'calculate_mortgage_type_options_4';

UPDATE content_items 
SET content_key = 'calculate_mortgage_type_commercial'
WHERE content_key = 'calculate_mortgage_type_options_5';

-- =====================================================
-- 10. FIRST HOME Options
-- =====================================================
UPDATE content_items 
SET content_key = 'calculate_mortgage_first_yes'
WHERE content_key = 'calculate_mortgage_first_options_1';

UPDATE content_items 
SET content_key = 'calculate_mortgage_first_no'
WHERE content_key = 'calculate_mortgage_first_options_2';

UPDATE content_items 
SET content_key = 'calculate_mortgage_first_improvement'
WHERE content_key = 'calculate_mortgage_first_options_3';

-- =====================================================
-- 11. PROPERTY OWNERSHIP Options
-- =====================================================
UPDATE content_items 
SET content_key = 'calculate_mortgage_property_ownership_no_property'
WHERE content_key = 'calculate_mortgage_property_ownership_option_1';

UPDATE content_items 
SET content_key = 'calculate_mortgage_property_ownership_has_property'
WHERE content_key = 'calculate_mortgage_property_ownership_option_2';

UPDATE content_items 
SET content_key = 'calculate_mortgage_property_ownership_selling_property'
WHERE content_key = 'calculate_mortgage_property_ownership_option_3';

-- =====================================================
-- 12. FAMILY STATUS Options
-- =====================================================
UPDATE content_items 
SET content_key = 'calculate_mortgage_family_status_single'
WHERE content_key = 'calculate_mortgage_family_status_option_1';

UPDATE content_items 
SET content_key = 'calculate_mortgage_family_status_married'
WHERE content_key = 'calculate_mortgage_family_status_option_2';

UPDATE content_items 
SET content_key = 'calculate_mortgage_family_status_divorced'
WHERE content_key = 'calculate_mortgage_family_status_option_3';

UPDATE content_items 
SET content_key = 'calculate_mortgage_family_status_widowed'
WHERE content_key = 'calculate_mortgage_family_status_option_4';

UPDATE content_items 
SET content_key = 'calculate_mortgage_family_status_separated'
WHERE content_key = 'calculate_mortgage_family_status_option_5';

UPDATE content_items 
SET content_key = 'calculate_mortgage_family_status_cohabiting'
WHERE content_key = 'calculate_mortgage_family_status_option_6';

-- =====================================================
-- 13. MORTGAGE FILTER Options (Step 4)
-- =====================================================
UPDATE content_items 
SET content_key = 'calculate_mortgage_filter_best_monthly'
WHERE content_key = 'calculate_mortgage_filter_1';

UPDATE content_items 
SET content_key = 'calculate_mortgage_filter_best_rate'
WHERE content_key = 'calculate_mortgage_filter_2';

UPDATE content_items 
SET content_key = 'calculate_mortgage_filter_best_total'
WHERE content_key = 'calculate_mortgage_filter_3';

UPDATE content_items 
SET content_key = 'calculate_mortgage_filter_recommended'
WHERE content_key = 'calculate_mortgage_filter_4';

-- =====================================================
-- 14. REFINANCE MORTGAGE - Why Options
-- =====================================================
UPDATE content_items 
SET content_key = 'mortgage_refinance_why_lower_payment'
WHERE content_key = 'mortgage_refinance_why_option_1';

UPDATE content_items 
SET content_key = 'mortgage_refinance_why_better_rate'
WHERE content_key = 'mortgage_refinance_why_option_2';

UPDATE content_items 
SET content_key = 'mortgage_refinance_why_cash_out'
WHERE content_key = 'mortgage_refinance_why_option_3';

UPDATE content_items 
SET content_key = 'mortgage_refinance_why_change_terms'
WHERE content_key = 'mortgage_refinance_why_option_4';

UPDATE content_items 
SET content_key = 'mortgage_refinance_why_other'
WHERE content_key = 'mortgage_refinance_why_option_5';

-- =====================================================
-- 15. REFINANCE MORTGAGE - Registration Options
-- =====================================================
UPDATE content_items 
SET content_key = 'mortgage_refinance_reg_on_me'
WHERE content_key = 'mortgage_refinance_reg_option_1';

UPDATE content_items 
SET content_key = 'mortgage_refinance_reg_on_other'
WHERE content_key = 'mortgage_refinance_reg_option_2';

-- =====================================================
-- 16. REFINANCE MORTGAGE - Program Options
-- =====================================================
UPDATE content_items 
SET content_key = 'program_refinance_mortgage_prime'
WHERE content_key = 'program_refinance_mortgage_option_1';

UPDATE content_items 
SET content_key = 'program_refinance_mortgage_fixed'
WHERE content_key = 'program_refinance_mortgage_option_2';

UPDATE content_items 
SET content_key = 'program_refinance_mortgage_variable'
WHERE content_key = 'program_refinance_mortgage_option_3';

UPDATE content_items 
SET content_key = 'program_refinance_mortgage_eligibility'
WHERE content_key = 'program_refinance_mortgage_option_4';

UPDATE content_items 
SET content_key = 'program_refinance_mortgage_other'
WHERE content_key = 'program_refinance_mortgage_option_5';

-- =====================================================
-- VALIDATION: Check for remaining numeric patterns
-- =====================================================
-- This query will show any remaining numeric patterns that need fixing
SELECT content_key, component_type, screen_location 
FROM content_items 
WHERE component_type IN ('option', 'dropdown_option')
AND (
    content_key LIKE '%_option_%' 
    OR content_key LIKE '%_options_%'
    OR content_key ~ '_[0-9]+$'  -- Ends with number
)
ORDER BY screen_location, content_key;

-- =====================================================
-- UPDATE timestamp for all modified records
-- =====================================================
UPDATE content_items 
SET updated_at = NOW()
WHERE component_type IN ('option', 'dropdown_option')
AND updated_at < NOW() - INTERVAL '1 minute';

-- Commit the transaction
COMMIT;

-- =====================================================
-- POST-MIGRATION VALIDATION
-- =====================================================
-- Run these queries after migration to verify success

-- 1. Count remaining numeric patterns
SELECT COUNT(*) as remaining_numeric_patterns
FROM content_items 
WHERE component_type IN ('option', 'dropdown_option')
AND (content_key LIKE '%_option_%' OR content_key LIKE '%_options_%');

-- 2. Show sample of updated descriptive names
SELECT content_key, component_type, screen_location 
FROM content_items 
WHERE component_type = 'option'
AND content_key LIKE '%mortgage%'
ORDER BY content_key
LIMIT 20;

-- 3. Check for any broken references
SELECT ci.content_key, ci.screen_location, ct.language_code, ct.content_value
FROM content_items ci
LEFT JOIN content_translations ct ON ci.id = ct.content_item_id
WHERE ci.component_type = 'option'
AND ct.id IS NULL;
-- Migration: Fix ALL Remaining Numeric Dropdown Patterns
-- Date: 2025-07-30
-- Description: Convert all remaining numeric dropdown patterns to descriptive names

BEGIN;

-- Property Ownership Options (mortgage_calculation)
UPDATE content_items SET content_key = 'app.mortgage.form.calculate_mortgage_property_ownership_no_property' 
WHERE content_key = 'app.mortgage.form.calculate_mortgage_property_ownership_option_1';

UPDATE content_items SET content_key = 'app.mortgage.form.calculate_mortgage_property_ownership_has_property' 
WHERE content_key = 'app.mortgage.form.calculate_mortgage_property_ownership_option_2';

UPDATE content_items SET content_key = 'app.mortgage.form.calculate_mortgage_property_ownership_selling_property' 
WHERE content_key = 'app.mortgage.form.calculate_mortgage_property_ownership_option_3';

-- First Home Options (mortgage_calculation)
UPDATE content_items SET content_key = 'app.mortgage.form.calculate_mortgage_first_yes_first_apartment' 
WHERE content_key = 'app.mortgage.form.calculate_mortgage_first_options_1';

UPDATE content_items SET content_key = 'app.mortgage.form.calculate_mortgage_first_not_first_apartment' 
WHERE content_key = 'app.mortgage.form.calculate_mortgage_first_options_2';

UPDATE content_items SET content_key = 'app.mortgage.form.calculate_mortgage_first_investment_property' 
WHERE content_key = 'app.mortgage.form.calculate_mortgage_first_options_3';

-- Mortgage Type Options (mortgage_calculation)
UPDATE content_items SET content_key = 'app.mortgage.form.calculate_mortgage_type_fixed_rate' 
WHERE content_key = 'app.mortgage.form.calculate_mortgage_type_options_1';

UPDATE content_items SET content_key = 'app.mortgage.form.calculate_mortgage_type_variable_rate' 
WHERE content_key = 'app.mortgage.form.calculate_mortgage_type_options_2';

UPDATE content_items SET content_key = 'app.mortgage.form.calculate_mortgage_type_mixed_rate' 
WHERE content_key = 'app.mortgage.form.calculate_mortgage_type_options_3';

UPDATE content_items SET content_key = 'app.mortgage.form.calculate_mortgage_type_not_sure' 
WHERE content_key = 'app.mortgage.form.calculate_mortgage_type_options_4';

-- When Needed Options (mortgage_calculation)
UPDATE content_items SET content_key = 'app.mortgage.form.calculate_mortgage_when_next_3_months' 
WHERE content_key = 'app.mortgage.form.calculate_mortgage_when_options_1';

UPDATE content_items SET content_key = 'app.mortgage.form.calculate_mortgage_when_3_to_6_months' 
WHERE content_key = 'app.mortgage.form.calculate_mortgage_when_options_2';

UPDATE content_items SET content_key = 'app.mortgage.form.calculate_mortgage_when_6_to_12_months' 
WHERE content_key = 'app.mortgage.form.calculate_mortgage_when_options_3';

UPDATE content_items SET content_key = 'app.mortgage.form.calculate_mortgage_when_more_than_12_months' 
WHERE content_key = 'app.mortgage.form.calculate_mortgage_when_options_4';

-- Debt Types Options (mortgage_calculation)
UPDATE content_items SET content_key = 'mortgage_calculation.field.debt_types_no_obligations' 
WHERE content_key = 'mortgage_calculation.field.debt_types_option_1';

UPDATE content_items SET content_key = 'mortgage_calculation.field.debt_types_bank_loan' 
WHERE content_key = 'mortgage_calculation.field.debt_types_option_2';

UPDATE content_items SET content_key = 'mortgage_calculation.field.debt_types_consumer_credit' 
WHERE content_key = 'mortgage_calculation.field.debt_types_option_3';

UPDATE content_items SET content_key = 'mortgage_calculation.field.debt_types_credit_card' 
WHERE content_key = 'mortgage_calculation.field.debt_types_option_4';

UPDATE content_items SET content_key = 'mortgage_calculation.field.debt_types_other' 
WHERE content_key = 'mortgage_calculation.field.debt_types_option_5';

-- Education Options (mortgage_calculation)
UPDATE content_items SET content_key = 'mortgage_calculation.field.education_no_high_school' 
WHERE content_key = 'mortgage_calculation.field.education_option_1';

UPDATE content_items SET content_key = 'mortgage_calculation.field.education_partial_high_school' 
WHERE content_key = 'mortgage_calculation.field.education_option_2';

UPDATE content_items SET content_key = 'mortgage_calculation.field.education_full_high_school' 
WHERE content_key = 'mortgage_calculation.field.education_option_3';

UPDATE content_items SET content_key = 'mortgage_calculation.field.education_post_secondary' 
WHERE content_key = 'mortgage_calculation.field.education_option_4';

UPDATE content_items SET content_key = 'mortgage_calculation.field.education_bachelors' 
WHERE content_key = 'mortgage_calculation.field.education_option_5';

UPDATE content_items SET content_key = 'mortgage_calculation.field.education_masters' 
WHERE content_key = 'mortgage_calculation.field.education_option_6';

UPDATE content_items SET content_key = 'mortgage_calculation.field.education_doctorate' 
WHERE content_key = 'mortgage_calculation.field.education_option_7';

-- Family Status Options (mortgage_calculation)
UPDATE content_items SET content_key = 'mortgage_calculation.field.family_status_single' 
WHERE content_key = 'mortgage_calculation.field.family_status_option_1';

UPDATE content_items SET content_key = 'mortgage_calculation.field.family_status_married' 
WHERE content_key = 'mortgage_calculation.field.family_status_option_2';

UPDATE content_items SET content_key = 'mortgage_calculation.field.family_status_divorced' 
WHERE content_key = 'mortgage_calculation.field.family_status_option_3';

UPDATE content_items SET content_key = 'mortgage_calculation.field.family_status_widowed' 
WHERE content_key = 'mortgage_calculation.field.family_status_option_4';

UPDATE content_items SET content_key = 'mortgage_calculation.field.family_status_separated' 
WHERE content_key = 'mortgage_calculation.field.family_status_option_5';

UPDATE content_items SET content_key = 'mortgage_calculation.field.family_status_cohabiting' 
WHERE content_key = 'mortgage_calculation.field.family_status_option_6';

-- First Home Options (mortgage_calculation.field)
UPDATE content_items SET content_key = 'mortgage_calculation.field.first_home_yes' 
WHERE content_key = 'mortgage_calculation.field.first_home_option_1';

UPDATE content_items SET content_key = 'mortgage_calculation.field.first_home_no' 
WHERE content_key = 'mortgage_calculation.field.first_home_option_2';

UPDATE content_items SET content_key = 'mortgage_calculation.field.first_home_improvement' 
WHERE content_key = 'mortgage_calculation.field.first_home_option_3';

-- Main Source Options (mortgage_calculation)
UPDATE content_items SET content_key = 'mortgage_calculation.field.main_source_salary' 
WHERE content_key = 'mortgage_calculation.field.main_source_option_1';

UPDATE content_items SET content_key = 'mortgage_calculation.field.main_source_business' 
WHERE content_key = 'mortgage_calculation.field.main_source_option_2';

UPDATE content_items SET content_key = 'mortgage_calculation.field.main_source_freelance' 
WHERE content_key = 'mortgage_calculation.field.main_source_option_3';

UPDATE content_items SET content_key = 'mortgage_calculation.field.main_source_pension' 
WHERE content_key = 'mortgage_calculation.field.main_source_option_4';

UPDATE content_items SET content_key = 'mortgage_calculation.field.main_source_rental' 
WHERE content_key = 'mortgage_calculation.field.main_source_option_5';

UPDATE content_items SET content_key = 'mortgage_calculation.field.main_source_investment' 
WHERE content_key = 'mortgage_calculation.field.main_source_option_6';

UPDATE content_items SET content_key = 'mortgage_calculation.field.main_source_other' 
WHERE content_key = 'mortgage_calculation.field.main_source_option_7';

-- Additional Income Options (mortgage_calculation)
UPDATE content_items SET content_key = 'mortgage_calculation.field.has_additional_salary' 
WHERE content_key = 'mortgage_calculation.field.has_additional_option_1';

UPDATE content_items SET content_key = 'mortgage_calculation.field.has_additional_business' 
WHERE content_key = 'mortgage_calculation.field.has_additional_option_2';

UPDATE content_items SET content_key = 'mortgage_calculation.field.has_additional_freelance' 
WHERE content_key = 'mortgage_calculation.field.has_additional_option_3';

UPDATE content_items SET content_key = 'mortgage_calculation.field.has_additional_pension' 
WHERE content_key = 'mortgage_calculation.field.has_additional_option_4';

UPDATE content_items SET content_key = 'mortgage_calculation.field.has_additional_rental' 
WHERE content_key = 'mortgage_calculation.field.has_additional_option_5';

UPDATE content_items SET content_key = 'mortgage_calculation.field.has_additional_investment' 
WHERE content_key = 'mortgage_calculation.field.has_additional_option_6';

UPDATE content_items SET content_key = 'mortgage_calculation.field.has_additional_other' 
WHERE content_key = 'mortgage_calculation.field.has_additional_option_7';

-- Property Ownership Options (mortgage_calculation.field)
UPDATE content_items SET content_key = 'mortgage_calculation.field.property_ownership_no_property' 
WHERE content_key = 'mortgage_calculation.field.property_ownership_option_1';

UPDATE content_items SET content_key = 'mortgage_calculation.field.property_ownership_has_property' 
WHERE content_key = 'mortgage_calculation.field.property_ownership_option_2';

UPDATE content_items SET content_key = 'mortgage_calculation.field.property_ownership_selling_property' 
WHERE content_key = 'mortgage_calculation.field.property_ownership_option_3';

-- Property Type Options (mortgage_calculation)
UPDATE content_items SET content_key = 'mortgage_calculation.field.property_type_apartment' 
WHERE content_key = 'mortgage_calculation.field.property_type_option_1';

UPDATE content_items SET content_key = 'mortgage_calculation.field.property_type_private_house' 
WHERE content_key = 'mortgage_calculation.field.property_type_option_2';

UPDATE content_items SET content_key = 'mortgage_calculation.field.property_type_penthouse' 
WHERE content_key = 'mortgage_calculation.field.property_type_option_3';

UPDATE content_items SET content_key = 'mortgage_calculation.field.property_type_land' 
WHERE content_key = 'mortgage_calculation.field.property_type_option_4';

UPDATE content_items SET content_key = 'mortgage_calculation.field.property_type_commercial' 
WHERE content_key = 'mortgage_calculation.field.property_type_option_5';

-- Update timestamps
UPDATE content_items SET updated_at = NOW() 
WHERE content_key LIKE '%mortgage_calculation%' AND updated_at < NOW() - INTERVAL '1 minute';

-- Verification
DO $$
DECLARE
    remaining_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO remaining_count
    FROM content_items 
    WHERE component_type = 'option' 
    AND (content_key LIKE '%_option_%' OR content_key LIKE '%_options_%' OR content_key ~ '_[0-9]+$');
    
    RAISE NOTICE 'Remaining numeric patterns after mortgage_calculation migration: %', remaining_count;
END $$;

COMMIT;
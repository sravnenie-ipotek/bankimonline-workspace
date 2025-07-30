-- Comprehensive Migration: Fix ALL Numeric Dropdown Patterns
-- Date: 2025-07-30
-- Total patterns to fix: 192

BEGIN;


-- Screen: mortgage_calculation
UPDATE content_items SET content_key = 'app.mortgage.form.calculate_mortgage_first_first_apartment' WHERE content_key = 'app.mortgage.form.calculate_mortgage_first_options_1';
UPDATE content_items SET content_key = 'app.mortgage.form.calculate_mortgage_first_not_first_apartment' WHERE content_key = 'app.mortgage.form.calculate_mortgage_first_options_2';
UPDATE content_items SET content_key = 'app.mortgage.form.calculate_mortgage_first_investment' WHERE content_key = 'app.mortgage.form.calculate_mortgage_first_options_3';
UPDATE content_items SET content_key = 'app.mortgage.form.calculate_mortgage_property_ownership_i_no_own_any_property' WHERE content_key = 'app.mortgage.form.calculate_mortgage_property_ownership_option_1';
UPDATE content_items SET content_key = 'app.mortgage.form.calculate_mortgage_property_ownership_i_own_a_property' WHERE content_key = 'app.mortgage.form.calculate_mortgage_property_ownership_option_2';
UPDATE content_items SET content_key = 'app.mortgage.form.calculate_mortgage_property_ownership_im_selling_a_property' WHERE content_key = 'app.mortgage.form.calculate_mortgage_property_ownership_option_3';
UPDATE content_items SET content_key = 'app.mortgage.form.calculate_mortgage_type_fixed_rate' WHERE content_key = 'app.mortgage.form.calculate_mortgage_type_options_1';
UPDATE content_items SET content_key = 'app.mortgage.form.calculate_mortgage_type_variable_rate' WHERE content_key = 'app.mortgage.form.calculate_mortgage_type_options_2';
UPDATE content_items SET content_key = 'app.mortgage.form.calculate_mortgage_type_mixed_rate' WHERE content_key = 'app.mortgage.form.calculate_mortgage_type_options_3';
UPDATE content_items SET content_key = 'app.mortgage.form.calculate_mortgage_type_not_sure' WHERE content_key = 'app.mortgage.form.calculate_mortgage_type_options_4';
UPDATE content_items SET content_key = 'app.mortgage.form.calculate_mortgage_when_next_3_months' WHERE content_key = 'app.mortgage.form.calculate_mortgage_when_options_1';
UPDATE content_items SET content_key = 'app.mortgage.form.calculate_mortgage_when_3_to_6_months' WHERE content_key = 'app.mortgage.form.calculate_mortgage_when_options_2';
UPDATE content_items SET content_key = 'app.mortgage.form.calculate_mortgage_when_6_to_12_months' WHERE content_key = 'app.mortgage.form.calculate_mortgage_when_options_3';
UPDATE content_items SET content_key = 'app.mortgage.form.calculate_mortgage_when_more_than_12_months' WHERE content_key = 'app.mortgage.form.calculate_mortgage_when_options_4';
UPDATE content_items SET content_key = 'mortgage_calculation.field.debt_types_no_obligations' WHERE content_key = 'mortgage_calculation.field.debt_types_option_1';
UPDATE content_items SET content_key = 'mortgage_calculation.field.debt_types_bank_loan' WHERE content_key = 'mortgage_calculation.field.debt_types_option_2';
UPDATE content_items SET content_key = 'mortgage_calculation.field.debt_types_consumer_credit' WHERE content_key = 'mortgage_calculation.field.debt_types_option_3';
UPDATE content_items SET content_key = 'mortgage_calculation.field.debt_types_credit_card' WHERE content_key = 'mortgage_calculation.field.debt_types_option_4';
UPDATE content_items SET content_key = 'mortgage_calculation.field.debt_types_other' WHERE content_key = 'mortgage_calculation.field.debt_types_option_5';
UPDATE content_items SET content_key = 'mortgage_calculation.field.education_no_high_school_diploma' WHERE content_key = 'mortgage_calculation.field.education_option_1';
UPDATE content_items SET content_key = 'mortgage_calculation.field.education_partial_high_school_diploma' WHERE content_key = 'mortgage_calculation.field.education_option_2';
UPDATE content_items SET content_key = 'mortgage_calculation.field.education_full_high_school_diploma' WHERE content_key = 'mortgage_calculation.field.education_option_3';
UPDATE content_items SET content_key = 'mortgage_calculation.field.education_postsecondary_education' WHERE content_key = 'mortgage_calculation.field.education_option_4';
UPDATE content_items SET content_key = 'mortgage_calculation.field.education_bachelors' WHERE content_key = 'mortgage_calculation.field.education_option_5';
UPDATE content_items SET content_key = 'mortgage_calculation.field.education_masters' WHERE content_key = 'mortgage_calculation.field.education_option_6';
UPDATE content_items SET content_key = 'mortgage_calculation.field.education_doctorate' WHERE content_key = 'mortgage_calculation.field.education_option_7';
UPDATE content_items SET content_key = 'mortgage_calculation.field.family_status_single' WHERE content_key = 'mortgage_calculation.field.family_status_option_1';
UPDATE content_items SET content_key = 'mortgage_calculation.field.family_status_married' WHERE content_key = 'mortgage_calculation.field.family_status_option_2';
UPDATE content_items SET content_key = 'mortgage_calculation.field.family_status_divorced' WHERE content_key = 'mortgage_calculation.field.family_status_option_3';
UPDATE content_items SET content_key = 'mortgage_calculation.field.family_status_widowed' WHERE content_key = 'mortgage_calculation.field.family_status_option_4';
UPDATE content_items SET content_key = 'mortgage_calculation.field.family_status_commonlaw_partner' WHERE content_key = 'mortgage_calculation.field.family_status_option_5';
UPDATE content_items SET content_key = 'mortgage_calculation.field.family_status_other' WHERE content_key = 'mortgage_calculation.field.family_status_option_6';
UPDATE content_items SET content_key = 'mortgage_calculation.field.first_home_yes_first_home' WHERE content_key = 'mortgage_calculation.field.first_home_option_1';
UPDATE content_items SET content_key = 'mortgage_calculation.field.first_home_no_additional_property' WHERE content_key = 'mortgage_calculation.field.first_home_option_2';
UPDATE content_items SET content_key = 'mortgage_calculation.field.first_home_investment' WHERE content_key = 'mortgage_calculation.field.first_home_option_3';
UPDATE content_items SET content_key = 'mortgage_calculation.field.has_additional_none' WHERE content_key = 'mortgage_calculation.field.has_additional_option_1';
UPDATE content_items SET content_key = 'mortgage_calculation.field.has_additional_salary' WHERE content_key = 'mortgage_calculation.field.has_additional_option_2';
UPDATE content_items SET content_key = 'mortgage_calculation.field.has_additional_additional_work' WHERE content_key = 'mortgage_calculation.field.has_additional_option_3';
UPDATE content_items SET content_key = 'mortgage_calculation.field.has_additional_rental' WHERE content_key = 'mortgage_calculation.field.has_additional_option_4';
UPDATE content_items SET content_key = 'mortgage_calculation.field.has_additional_investment' WHERE content_key = 'mortgage_calculation.field.has_additional_option_5';
UPDATE content_items SET content_key = 'mortgage_calculation.field.has_additional_pension' WHERE content_key = 'mortgage_calculation.field.has_additional_option_6';
UPDATE content_items SET content_key = 'mortgage_calculation.field.has_additional_other' WHERE content_key = 'mortgage_calculation.field.has_additional_option_7';
UPDATE content_items SET content_key = 'mortgage_calculation.field.main_source_employee' WHERE content_key = 'mortgage_calculation.field.main_source_option_1';
UPDATE content_items SET content_key = 'mortgage_calculation.field.main_source_selfemployed' WHERE content_key = 'mortgage_calculation.field.main_source_option_2';
UPDATE content_items SET content_key = 'mortgage_calculation.field.main_source_pension' WHERE content_key = 'mortgage_calculation.field.main_source_option_3';
UPDATE content_items SET content_key = 'mortgage_calculation.field.main_source_student' WHERE content_key = 'mortgage_calculation.field.main_source_option_4';
UPDATE content_items SET content_key = 'mortgage_calculation.field.main_source_unpaid_leave' WHERE content_key = 'mortgage_calculation.field.main_source_option_5';
UPDATE content_items SET content_key = 'mortgage_calculation.field.main_source_unemployed' WHERE content_key = 'mortgage_calculation.field.main_source_option_6';
UPDATE content_items SET content_key = 'mortgage_calculation.field.main_source_other' WHERE content_key = 'mortgage_calculation.field.main_source_option_7';
UPDATE content_items SET content_key = 'mortgage_calculation.field.property_ownership_i_no_own_any_property' WHERE content_key = 'mortgage_calculation.field.property_ownership_option_1';
UPDATE content_items SET content_key = 'mortgage_calculation.field.property_ownership_i_own_a_property' WHERE content_key = 'mortgage_calculation.field.property_ownership_option_2';
UPDATE content_items SET content_key = 'mortgage_calculation.field.property_ownership_im_selling_a_property' WHERE content_key = 'mortgage_calculation.field.property_ownership_option_3';
UPDATE content_items SET content_key = 'mortgage_calculation.field.sphere_banking_and_finance' WHERE content_key = 'mortgage_calculation.field.sphere_option_1';
UPDATE content_items SET content_key = 'mortgage_calculation.field.sphere_other' WHERE content_key = 'mortgage_calculation.field.sphere_option_10';
UPDATE content_items SET content_key = 'mortgage_calculation.field.sphere_technology_and_cyber' WHERE content_key = 'mortgage_calculation.field.sphere_option_2';
UPDATE content_items SET content_key = 'mortgage_calculation.field.sphere_medicine_and_health' WHERE content_key = 'mortgage_calculation.field.sphere_option_3';
UPDATE content_items SET content_key = 'mortgage_calculation.field.sphere_education_and_teaching' WHERE content_key = 'mortgage_calculation.field.sphere_option_4';
UPDATE content_items SET content_key = 'mortgage_calculation.field.sphere_law_and_consulting' WHERE content_key = 'mortgage_calculation.field.sphere_option_5';
UPDATE content_items SET content_key = 'mortgage_calculation.field.sphere_engineering_and_construction' WHERE content_key = 'mortgage_calculation.field.sphere_option_6';
UPDATE content_items SET content_key = 'mortgage_calculation.field.sphere_sales_and_marketing' WHERE content_key = 'mortgage_calculation.field.sphere_option_7';
UPDATE content_items SET content_key = 'mortgage_calculation.field.sphere_services_and_hospitality' WHERE content_key = 'mortgage_calculation.field.sphere_option_8';
UPDATE content_items SET content_key = 'mortgage_calculation.field.sphere_manufacturing_and_logistics' WHERE content_key = 'mortgage_calculation.field.sphere_option_9';
UPDATE content_items SET content_key = 'mortgage_calculation.field.type_apartment' WHERE content_key = 'mortgage_calculation.field.type_option_1';
UPDATE content_items SET content_key = 'mortgage_calculation.field.type_private_house' WHERE content_key = 'mortgage_calculation.field.type_option_2';
UPDATE content_items SET content_key = 'mortgage_calculation.field.type_garden_apartment' WHERE content_key = 'mortgage_calculation.field.type_option_3';
UPDATE content_items SET content_key = 'mortgage_calculation.field.type_penthouse' WHERE content_key = 'mortgage_calculation.field.type_option_4';
UPDATE content_items SET content_key = 'mortgage_calculation.field.type_other' WHERE content_key = 'mortgage_calculation.field.type_option_5';
UPDATE content_items SET content_key = 'mortgage_calculation.field.when_needed_within_3_months' WHERE content_key = 'mortgage_calculation.field.when_needed_option_1';
UPDATE content_items SET content_key = 'mortgage_calculation.field.when_needed_3_to_6_months' WHERE content_key = 'mortgage_calculation.field.when_needed_option_2';
UPDATE content_items SET content_key = 'mortgage_calculation.field.when_needed_6_to_12_months' WHERE content_key = 'mortgage_calculation.field.when_needed_option_3';
UPDATE content_items SET content_key = 'mortgage_calculation.field.when_needed_over_12_months' WHERE content_key = 'mortgage_calculation.field.when_needed_option_4';

-- Screen: mortgage_step1
UPDATE content_items SET content_key = 'mortgage_step1.field.first_home_yes_first_home' WHERE content_key = 'mortgage_step1.field.first_home_option_1';
UPDATE content_items SET content_key = 'mortgage_step1.field.first_home_no_additional_property' WHERE content_key = 'mortgage_step1.field.first_home_option_2';
UPDATE content_items SET content_key = 'mortgage_step1.field.first_home_investment' WHERE content_key = 'mortgage_step1.field.first_home_option_3';
UPDATE content_items SET content_key = 'mortgage_step1.field.property_ownership_i_no_own_any_property' WHERE content_key = 'mortgage_step1.field.property_ownership_option_1';
UPDATE content_items SET content_key = 'mortgage_step1.field.property_ownership_i_own_a_property' WHERE content_key = 'mortgage_step1.field.property_ownership_option_2';
UPDATE content_items SET content_key = 'mortgage_step1.field.property_ownership_im_selling_a_property' WHERE content_key = 'mortgage_step1.field.property_ownership_option_3';
UPDATE content_items SET content_key = 'mortgage_step1.field.type_apartment' WHERE content_key = 'mortgage_step1.field.type_option_1';
UPDATE content_items SET content_key = 'mortgage_step1.field.type_private_house' WHERE content_key = 'mortgage_step1.field.type_option_2';
UPDATE content_items SET content_key = 'mortgage_step1.field.type_garden_apartment' WHERE content_key = 'mortgage_step1.field.type_option_3';
UPDATE content_items SET content_key = 'mortgage_step1.field.type_penthouse' WHERE content_key = 'mortgage_step1.field.type_option_4';
UPDATE content_items SET content_key = 'mortgage_step1.field.when_needed_within_3_months' WHERE content_key = 'mortgage_step1.field.when_needed_option_1';
UPDATE content_items SET content_key = 'mortgage_step1.field.when_needed_3_to_6_months' WHERE content_key = 'mortgage_step1.field.when_needed_option_2';
UPDATE content_items SET content_key = 'mortgage_step1.field.when_needed_6_to_12_months' WHERE content_key = 'mortgage_step1.field.when_needed_option_3';
UPDATE content_items SET content_key = 'mortgage_step1.field.when_needed_over_12_months' WHERE content_key = 'mortgage_step1.field.when_needed_option_4';

-- Screen: mortgage_step2
UPDATE content_items SET content_key = 'mortgage_step2.field.citizenship_israel' WHERE content_key = 'mortgage_step2.field.citizenship_option_1';
UPDATE content_items SET content_key = 'mortgage_step2.field.citizenship_united_states' WHERE content_key = 'mortgage_step2.field.citizenship_option_2';
UPDATE content_items SET content_key = 'mortgage_step2.field.citizenship_russia' WHERE content_key = 'mortgage_step2.field.citizenship_option_3';
UPDATE content_items SET content_key = 'mortgage_step2.field.citizenship_germany' WHERE content_key = 'mortgage_step2.field.citizenship_option_4';
UPDATE content_items SET content_key = 'mortgage_step2.field.citizenship_france' WHERE content_key = 'mortgage_step2.field.citizenship_option_5';
UPDATE content_items SET content_key = 'mortgage_step2.field.citizenship_united_kingdom' WHERE content_key = 'mortgage_step2.field.citizenship_option_6';
UPDATE content_items SET content_key = 'mortgage_step2.field.citizenship_canada' WHERE content_key = 'mortgage_step2.field.citizenship_option_7';
UPDATE content_items SET content_key = 'mortgage_step2.field.citizenship_ukraine' WHERE content_key = 'mortgage_step2.field.citizenship_option_8';
UPDATE content_items SET content_key = 'mortgage_step2.field.citizenship_other' WHERE content_key = 'mortgage_step2.field.citizenship_option_9';
UPDATE content_items SET content_key = 'mortgage_step2.field.education_no_high_school_diploma' WHERE content_key = 'mortgage_step2.field.education_option_1';
UPDATE content_items SET content_key = 'mortgage_step2.field.education_partial_high_school_diploma' WHERE content_key = 'mortgage_step2.field.education_option_2';
UPDATE content_items SET content_key = 'mortgage_step2.field.education_full_high_school_diploma' WHERE content_key = 'mortgage_step2.field.education_option_3';
UPDATE content_items SET content_key = 'mortgage_step2.field.education_postsecondary_education' WHERE content_key = 'mortgage_step2.field.education_option_4';
UPDATE content_items SET content_key = 'mortgage_step2.field.education_bachelors' WHERE content_key = 'mortgage_step2.field.education_option_5';
UPDATE content_items SET content_key = 'mortgage_step2.field.education_masters' WHERE content_key = 'mortgage_step2.field.education_option_6';
UPDATE content_items SET content_key = 'mortgage_step2.field.education_doctorate' WHERE content_key = 'mortgage_step2.field.education_option_7';
UPDATE content_items SET content_key = 'mortgage_step2.field.family_status_single' WHERE content_key = 'mortgage_step2.field.family_status_option_1';
UPDATE content_items SET content_key = 'mortgage_step2.field.family_status_married' WHERE content_key = 'mortgage_step2.field.family_status_option_2';
UPDATE content_items SET content_key = 'mortgage_step2.field.family_status_divorced' WHERE content_key = 'mortgage_step2.field.family_status_option_3';
UPDATE content_items SET content_key = 'mortgage_step2.field.family_status_widowed' WHERE content_key = 'mortgage_step2.field.family_status_option_4';
UPDATE content_items SET content_key = 'mortgage_step2.field.family_status_commonlaw_partner' WHERE content_key = 'mortgage_step2.field.family_status_option_5';
UPDATE content_items SET content_key = 'mortgage_step2.field.family_status_other' WHERE content_key = 'mortgage_step2.field.family_status_option_6';

-- Screen: mortgage_step3
UPDATE content_items SET content_key = 'mortgage_step3_additional_income_no_additional_income' WHERE content_key = 'mortgage_step3_additional_income_option_1';
UPDATE content_items SET content_key = 'mortgage_step3_additional_income_additional_salary' WHERE content_key = 'mortgage_step3_additional_income_option_2';
UPDATE content_items SET content_key = 'mortgage_step3_additional_income_additional_work' WHERE content_key = 'mortgage_step3_additional_income_option_3';
UPDATE content_items SET content_key = 'mortgage_step3_additional_income_property_rental_income' WHERE content_key = 'mortgage_step3_additional_income_option_4';
UPDATE content_items SET content_key = 'mortgage_step3_additional_income_investment' WHERE content_key = 'mortgage_step3_additional_income_option_5';
UPDATE content_items SET content_key = 'mortgage_step3_additional_income_pension' WHERE content_key = 'mortgage_step3_additional_income_option_6';
UPDATE content_items SET content_key = 'mortgage_step3_additional_income_other' WHERE content_key = 'mortgage_step3_additional_income_option_7';
UPDATE content_items SET content_key = 'mortgage_step3_main_source_employee' WHERE content_key = 'mortgage_step3_main_source_option_1';
UPDATE content_items SET content_key = 'mortgage_step3_main_source_selfemployed' WHERE content_key = 'mortgage_step3_main_source_option_2';
UPDATE content_items SET content_key = 'mortgage_step3_main_source_pension' WHERE content_key = 'mortgage_step3_main_source_option_3';
UPDATE content_items SET content_key = 'mortgage_step3_main_source_student' WHERE content_key = 'mortgage_step3_main_source_option_4';
UPDATE content_items SET content_key = 'mortgage_step3_main_source_unpaid_leave' WHERE content_key = 'mortgage_step3_main_source_option_5';
UPDATE content_items SET content_key = 'mortgage_step3_main_source_unemployed' WHERE content_key = 'mortgage_step3_main_source_option_6';
UPDATE content_items SET content_key = 'mortgage_step3_main_source_other' WHERE content_key = 'mortgage_step3_main_source_option_7';
UPDATE content_items SET content_key = 'mortgage_step3_obligations_no_obligations' WHERE content_key = 'mortgage_step3_obligations_option_1';
UPDATE content_items SET content_key = 'mortgage_step3_obligations_bank_loan' WHERE content_key = 'mortgage_step3_obligations_option_2';
UPDATE content_items SET content_key = 'mortgage_step3_obligations_consumer_credit' WHERE content_key = 'mortgage_step3_obligations_option_3';
UPDATE content_items SET content_key = 'mortgage_step3_obligations_credit_card' WHERE content_key = 'mortgage_step3_obligations_option_4';
UPDATE content_items SET content_key = 'mortgage_step3_obligations_other' WHERE content_key = 'mortgage_step3_obligations_option_5';

-- Screen: mortgage_step4
UPDATE content_items SET content_key = 'mortgage_step4_filter_all_mortgage_programs' WHERE content_key = 'mortgage_step4_filter_option_1';
UPDATE content_items SET content_key = 'mortgage_step4_filter_prime_rate_mortgages' WHERE content_key = 'mortgage_step4_filter_option_2';
UPDATE content_items SET content_key = 'mortgage_step4_filter_fixed_rate_mortgages' WHERE content_key = 'mortgage_step4_filter_option_3';
UPDATE content_items SET content_key = 'mortgage_step4_filter_variable_rate_mortgages' WHERE content_key = 'mortgage_step4_filter_option_4';

-- Screen: refinance_credit_1
UPDATE content_items SET content_key = 'refinance_credit_why_improve_interest_rate' WHERE content_key = 'refinance_credit_why_option_1';
UPDATE content_items SET content_key = 'refinance_credit_why_reduce_credit_amount' WHERE content_key = 'refinance_credit_why_option_2';
UPDATE content_items SET content_key = 'refinance_credit_why_increase_term_to_reduce_paymen' WHERE content_key = 'refinance_credit_why_option_3';
UPDATE content_items SET content_key = 'refinance_credit_why_increase_payment_to_reduce_ter' WHERE content_key = 'refinance_credit_why_option_4';

-- Screen: refinance_credit_2
UPDATE content_items SET content_key = 'calculate_mortgage_add_partner_as_primary_borrower' WHERE content_key = 'calculate_mortgage_add_partner_option_1';
UPDATE content_items SET content_key = 'calculate_mortgage_add_partner_as_secondary_borrower' WHERE content_key = 'calculate_mortgage_add_partner_option_2';
UPDATE content_items SET content_key = 'calculate_mortgage_add_partner_no' WHERE content_key = 'calculate_mortgage_add_partner_option_3';

-- Screen: refinance_credit_3
UPDATE content_items SET content_key = 'refinance_credit_additional_income_none' WHERE content_key = 'refinance_credit_additional_income_option_1';
UPDATE content_items SET content_key = 'refinance_credit_additional_income_salary' WHERE content_key = 'refinance_credit_additional_income_option_2';
UPDATE content_items SET content_key = 'refinance_credit_additional_income_additional_work' WHERE content_key = 'refinance_credit_additional_income_option_3';
UPDATE content_items SET content_key = 'refinance_credit_additional_income_rental' WHERE content_key = 'refinance_credit_additional_income_option_4';
UPDATE content_items SET content_key = 'refinance_credit_additional_income_investment' WHERE content_key = 'refinance_credit_additional_income_option_5';
UPDATE content_items SET content_key = 'refinance_credit_additional_income_pension' WHERE content_key = 'refinance_credit_additional_income_option_6';
UPDATE content_items SET content_key = 'refinance_credit_additional_income_other' WHERE content_key = 'refinance_credit_additional_income_option_7';
UPDATE content_items SET content_key = 'refinance_credit_debt_types_no_obligations' WHERE content_key = 'refinance_credit_debt_types_option_1';
UPDATE content_items SET content_key = 'refinance_credit_debt_types_bank_loan' WHERE content_key = 'refinance_credit_debt_types_option_2';
UPDATE content_items SET content_key = 'refinance_credit_debt_types_consumer_credit' WHERE content_key = 'refinance_credit_debt_types_option_3';
UPDATE content_items SET content_key = 'refinance_credit_debt_types_credit_card' WHERE content_key = 'refinance_credit_debt_types_option_4';
UPDATE content_items SET content_key = 'refinance_credit_debt_types_other' WHERE content_key = 'refinance_credit_debt_types_option_5';
UPDATE content_items SET content_key = 'refinance_credit_main_source_employee' WHERE content_key = 'refinance_credit_main_source_option_1';
UPDATE content_items SET content_key = 'refinance_credit_main_source_selfemployed' WHERE content_key = 'refinance_credit_main_source_option_2';
UPDATE content_items SET content_key = 'refinance_credit_main_source_pension' WHERE content_key = 'refinance_credit_main_source_option_3';
UPDATE content_items SET content_key = 'refinance_credit_main_source_student' WHERE content_key = 'refinance_credit_main_source_option_4';
UPDATE content_items SET content_key = 'refinance_credit_main_source_unpaid_leave' WHERE content_key = 'refinance_credit_main_source_option_5';
UPDATE content_items SET content_key = 'refinance_credit_main_source_unemployed' WHERE content_key = 'refinance_credit_main_source_option_6';
UPDATE content_items SET content_key = 'refinance_credit_main_source_other' WHERE content_key = 'refinance_credit_main_source_option_7';

-- Screen: refinance_mortgage_1
UPDATE content_items SET content_key = 'refinance_mortgage_1_property_type_apartment' WHERE content_key = 'refinance_mortgage_1_property_type_option_1';
UPDATE content_items SET content_key = 'refinance_mortgage_1_property_type_house' WHERE content_key = 'refinance_mortgage_1_property_type_option_2';
UPDATE content_items SET content_key = 'refinance_mortgage_1_property_type_commercial' WHERE content_key = 'refinance_mortgage_1_property_type_option_3';
UPDATE content_items SET content_key = 'refinance_mortgage_1_registered_yes' WHERE content_key = 'refinance_mortgage_1_registered_option_1';
UPDATE content_items SET content_key = 'refinance_mortgage_1_registered_no' WHERE content_key = 'refinance_mortgage_1_registered_option_2';
UPDATE content_items SET content_key = 'refinance_mortgage_1_why_lower_interest_rate' WHERE content_key = 'refinance_mortgage_1_why_option_1';
UPDATE content_items SET content_key = 'refinance_mortgage_1_why_extend_loan_term' WHERE content_key = 'refinance_mortgage_1_why_option_2';
UPDATE content_items SET content_key = 'refinance_mortgage_1_why_change_bank' WHERE content_key = 'refinance_mortgage_1_why_option_3';
UPDATE content_items SET content_key = 'refinance_mortgage_1_why_increase_loan_amount' WHERE content_key = 'refinance_mortgage_1_why_option_4';
UPDATE content_items SET content_key = 'refinance_mortgage_1_why_other' WHERE content_key = 'refinance_mortgage_1_why_option_5';

-- Screen: refinance_mortgage_2
UPDATE content_items SET content_key = 'mortgage_refinance_registered_land' WHERE content_key = 'mortgage_refinance_registered_option_1';
UPDATE content_items SET content_key = 'mortgage_refinance_registered_no_not_registered' WHERE content_key = 'mortgage_refinance_registered_option_2';

-- Screen: refinance_step1
UPDATE content_items SET content_key = 'refinance_step1_program_fixed_interest' WHERE content_key = 'refinance_step1_program_option_1';
UPDATE content_items SET content_key = 'refinance_step1_program_variable_interest' WHERE content_key = 'refinance_step1_program_option_2';
UPDATE content_items SET content_key = 'refinance_step1_program_prime_interest' WHERE content_key = 'refinance_step1_program_option_3';
UPDATE content_items SET content_key = 'refinance_step1_program_mixed_interest' WHERE content_key = 'refinance_step1_program_option_4';
UPDATE content_items SET content_key = 'refinance_step1_program_other' WHERE content_key = 'refinance_step1_program_option_5';
UPDATE content_items SET content_key = 'refinance_step1_property_type_apartment' WHERE content_key = 'refinance_step1_property_type_option_1';
UPDATE content_items SET content_key = 'refinance_step1_property_type_private_house' WHERE content_key = 'refinance_step1_property_type_option_2';
UPDATE content_items SET content_key = 'refinance_step1_property_type_commercial' WHERE content_key = 'refinance_step1_property_type_option_3';
UPDATE content_items SET content_key = 'refinance_step1_property_type_land' WHERE content_key = 'refinance_step1_property_type_option_4';
UPDATE content_items SET content_key = 'refinance_step1_property_type_other' WHERE content_key = 'refinance_step1_property_type_option_5';
UPDATE content_items SET content_key = 'refinance_step1_registration_land' WHERE content_key = 'refinance_step1_registration_option_1';
UPDATE content_items SET content_key = 'refinance_step1_registration_no_not_registered' WHERE content_key = 'refinance_step1_registration_option_2';
UPDATE content_items SET content_key = 'refinance_step1_why_lower_interest_rate' WHERE content_key = 'refinance_step1_why_option_1';
UPDATE content_items SET content_key = 'refinance_step1_why_reduce_monthly_payment' WHERE content_key = 'refinance_step1_why_option_2';
UPDATE content_items SET content_key = 'refinance_step1_why_shorten_mortgage_term' WHERE content_key = 'refinance_step1_why_option_3';
UPDATE content_items SET content_key = 'refinance_step1_why_cash_out_refinance' WHERE content_key = 'refinance_step1_why_option_4';
UPDATE content_items SET content_key = 'refinance_step1_why_consolidate_debts' WHERE content_key = 'refinance_step1_why_option_5';

-- Screen: refinance_step2
UPDATE content_items SET content_key = 'refinance_step2_education_no_high_school_certificate' WHERE content_key = 'refinance_step2_education_option_1';
UPDATE content_items SET content_key = 'refinance_step2_education_partial_high_school_certificat' WHERE content_key = 'refinance_step2_education_option_2';
UPDATE content_items SET content_key = 'refinance_step2_education_full_high_school_certificate' WHERE content_key = 'refinance_step2_education_option_3';
UPDATE content_items SET content_key = 'refinance_step2_education_postsecondary_education' WHERE content_key = 'refinance_step2_education_option_4';
UPDATE content_items SET content_key = 'refinance_step2_education_bachelors' WHERE content_key = 'refinance_step2_education_option_5';
UPDATE content_items SET content_key = 'refinance_step2_education_masters' WHERE content_key = 'refinance_step2_education_option_6';
UPDATE content_items SET content_key = 'refinance_step2_education_doctorate' WHERE content_key = 'refinance_step2_education_option_7';

-- Update timestamps
UPDATE content_items SET updated_at = NOW() WHERE updated_at < NOW() - INTERVAL '1 minute';

-- Verification
DO $$
DECLARE
    remaining_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO remaining_count
    FROM content_items 
    WHERE component_type = 'option' 
    AND (content_key LIKE '%_option_%' OR content_key LIKE '%_options_%' OR content_key ~ '_[0-9]+$');
    
    RAISE NOTICE 'Remaining numeric patterns: %', remaining_count;
END $$;

COMMIT;
# Numeric to Descriptive Dropdown Naming Map

This document maps all numeric dropdown option names to their new descriptive names, following the rules in `DEVHelp/docs/dropDownsInDBLogic`.

## Summary
- **Total Options Updated**: 70+
- **Migration Script**: `migrations/fix_numeric_dropdown_naming.sql`
- **Rule Applied**: Use descriptive values (`_hapoalim`) instead of numeric (`_option_1`)

## Complete Mapping Table

### 1. Mortgage Step 1 - When Money Needed
| Old Name | New Name | Description |
|----------|----------|-------------|
| `mortgage_step1_field_when_needed_option_1` | `mortgage_step1_field_when_needed_immediately` | Immediately |
| `mortgage_step1_field_when_needed_option_2` | `mortgage_step1_field_when_needed_within_month` | Within a month |
| `mortgage_step1_field_when_needed_option_3` | `mortgage_step1_field_when_needed_within_3months` | Within 3 months |
| `mortgage_step1_field_when_needed_option_4` | `mortgage_step1_field_when_needed_within_6months` | Within 6 months |

### 2. Calculate Credit - Credit Purpose
| Old Name | New Name | Description |
|----------|----------|-------------|
| `calculate_credit_credit_purpose_option_1` | `calculate_credit_credit_purpose_new_car` | New car |
| `calculate_credit_credit_purpose_option_2` | `calculate_credit_credit_purpose_used_car` | Used car |
| `calculate_credit_credit_purpose_option_3` | `calculate_credit_credit_purpose_home_renovation` | Home renovation |
| `calculate_credit_credit_purpose_option_4` | `calculate_credit_credit_purpose_vacation` | Vacation |
| `calculate_credit_credit_purpose_option_5` | `calculate_credit_credit_purpose_wedding` | Wedding |
| `calculate_credit_credit_purpose_option_6` | `calculate_credit_credit_purpose_medical` | Medical expenses |
| `calculate_credit_credit_purpose_option_7` | `calculate_credit_credit_purpose_other` | Other |

### 3. Personal Data - Marital Status
| Old Name | New Name | Description |
|----------|----------|-------------|
| `personal_data_marital_status_option_1` | `personal_data_marital_status_single` | Single |
| `personal_data_marital_status_option_2` | `personal_data_marital_status_married` | Married |
| `personal_data_marital_status_option_3` | `personal_data_marital_status_divorced` | Divorced |
| `personal_data_marital_status_option_4` | `personal_data_marital_status_widowed` | Widowed |
| `personal_data_marital_status_option_5` | `personal_data_marital_status_separated` | Separated |
| `personal_data_marital_status_option_6` | `personal_data_marital_status_cohabiting` | Cohabiting |

### 4. Mortgage - Education Level
| Old Name | New Name | Description |
|----------|----------|-------------|
| `calculate_mortgage_education_option_1` | `calculate_mortgage_education_elementary` | Elementary |
| `calculate_mortgage_education_option_2` | `calculate_mortgage_education_high_school` | High school |
| `calculate_mortgage_education_option_3` | `calculate_mortgage_education_high_school_diploma` | High school diploma |
| `calculate_mortgage_education_option_4` | `calculate_mortgage_education_professional` | Professional |
| `calculate_mortgage_education_option_5` | `calculate_mortgage_education_bachelors` | Bachelor's degree |
| `calculate_mortgage_education_option_6` | `calculate_mortgage_education_masters` | Master's degree |
| `calculate_mortgage_education_option_7` | `calculate_mortgage_education_doctorate` | Doctorate |

### 5. Refinance Credit - Why Refinancing
| Old Name | New Name | Description |
|----------|----------|-------------|
| `app.refinance_credit.step1.why_option_1` | `app.refinance_credit.step1.why_reduce_monthly` | Reduce monthly payment |
| `app.refinance_credit.step1.why_option_2` | `app.refinance_credit.step1.why_reduce_amount` | Reduce credit amount |
| `app.refinance_credit.step1.why_option_3` | `app.refinance_credit.step1.why_consolidate` | Consolidate debts |
| `app.refinance_credit.step1.why_option_4` | `app.refinance_credit.step1.why_other` | Other reason |

### 6. Main Source of Income
| Old Name | New Name | Description |
|----------|----------|-------------|
| `calculate_mortgage_main_source_option_1` | `calculate_mortgage_main_source_salary` | Salary |
| `calculate_mortgage_main_source_option_2` | `calculate_mortgage_main_source_business` | Business |
| `calculate_mortgage_main_source_option_3` | `calculate_mortgage_main_source_freelance` | Freelance |
| `calculate_mortgage_main_source_option_4` | `calculate_mortgage_main_source_pension` | Pension |
| `calculate_mortgage_main_source_option_5` | `calculate_mortgage_main_source_investment` | Investment |
| `calculate_mortgage_main_source_option_6` | `calculate_mortgage_main_source_rental` | Rental income |
| `calculate_mortgage_main_source_option_7` | `calculate_mortgage_main_source_other` | Other |

### 7. Additional Income Sources
| Old Name | New Name | Description |
|----------|----------|-------------|
| `calculate_mortgage_has_additional_option_1` | `calculate_mortgage_has_additional_salary` | Additional salary |
| `calculate_mortgage_has_additional_option_2` | `calculate_mortgage_has_additional_business` | Business income |
| `calculate_mortgage_has_additional_option_3` | `calculate_mortgage_has_additional_freelance` | Freelance income |
| `calculate_mortgage_has_additional_option_4` | `calculate_mortgage_has_additional_pension` | Pension |
| `calculate_mortgage_has_additional_option_5` | `calculate_mortgage_has_additional_investment` | Investment returns |
| `calculate_mortgage_has_additional_option_6` | `calculate_mortgage_has_additional_rental` | Rental income |
| `calculate_mortgage_has_additional_option_7` | `calculate_mortgage_has_additional_other` | Other income |

### 8. Debt Types
| Old Name | New Name | Description |
|----------|----------|-------------|
| `calculate_mortgage_debt_types_option_1` | `calculate_mortgage_debt_types_mortgage` | Mortgage |
| `calculate_mortgage_debt_types_option_2` | `calculate_mortgage_debt_types_car_loan` | Car loan |
| `calculate_mortgage_debt_types_option_3` | `calculate_mortgage_debt_types_student_loan` | Student loan |
| `calculate_mortgage_debt_types_option_4` | `calculate_mortgage_debt_types_credit_card` | Credit card |
| `calculate_mortgage_debt_types_option_5` | `calculate_mortgage_debt_types_other` | Other debt |

### 9. Property Type
| Old Name | New Name | Description |
|----------|----------|-------------|
| `calculate_mortgage_type_options_1` | `calculate_mortgage_type_apartment` | Apartment |
| `calculate_mortgage_type_options_2` | `calculate_mortgage_type_private_house` | Private house |
| `calculate_mortgage_type_options_3` | `calculate_mortgage_type_penthouse` | Penthouse |
| `calculate_mortgage_type_options_4` | `calculate_mortgage_type_land` | Land |
| `calculate_mortgage_type_options_5` | `calculate_mortgage_type_commercial` | Commercial property |

### 10. First Home
| Old Name | New Name | Description |
|----------|----------|-------------|
| `calculate_mortgage_first_options_1` | `calculate_mortgage_first_yes` | Yes |
| `calculate_mortgage_first_options_2` | `calculate_mortgage_first_no` | No |
| `calculate_mortgage_first_options_3` | `calculate_mortgage_first_improvement` | Home improvement |

### 11. Property Ownership
| Old Name | New Name | Description |
|----------|----------|-------------|
| `calculate_mortgage_property_ownership_option_1` | `calculate_mortgage_property_ownership_no_property` | I don't own any property |
| `calculate_mortgage_property_ownership_option_2` | `calculate_mortgage_property_ownership_has_property` | I own a property |
| `calculate_mortgage_property_ownership_option_3` | `calculate_mortgage_property_ownership_selling_property` | I'm selling a property |

### 12. Family Status
| Old Name | New Name | Description |
|----------|----------|-------------|
| `calculate_mortgage_family_status_option_1` | `calculate_mortgage_family_status_single` | Single |
| `calculate_mortgage_family_status_option_2` | `calculate_mortgage_family_status_married` | Married |
| `calculate_mortgage_family_status_option_3` | `calculate_mortgage_family_status_divorced` | Divorced |
| `calculate_mortgage_family_status_option_4` | `calculate_mortgage_family_status_widowed` | Widowed |
| `calculate_mortgage_family_status_option_5` | `calculate_mortgage_family_status_separated` | Separated |
| `calculate_mortgage_family_status_option_6` | `calculate_mortgage_family_status_cohabiting` | Cohabiting |

### 13. Mortgage Filter Options (Step 4)
| Old Name | New Name | Description |
|----------|----------|-------------|
| `calculate_mortgage_filter_1` | `calculate_mortgage_filter_best_monthly` | Best monthly payment |
| `calculate_mortgage_filter_2` | `calculate_mortgage_filter_best_rate` | Best interest rate |
| `calculate_mortgage_filter_3` | `calculate_mortgage_filter_best_total` | Best total cost |
| `calculate_mortgage_filter_4` | `calculate_mortgage_filter_recommended` | Recommended |

### 14. Refinance Mortgage - Why
| Old Name | New Name | Description |
|----------|----------|-------------|
| `mortgage_refinance_why_option_1` | `mortgage_refinance_why_lower_payment` | Lower monthly payment |
| `mortgage_refinance_why_option_2` | `mortgage_refinance_why_better_rate` | Better interest rate |
| `mortgage_refinance_why_option_3` | `mortgage_refinance_why_cash_out` | Cash out equity |
| `mortgage_refinance_why_option_4` | `mortgage_refinance_why_change_terms` | Change loan terms |
| `mortgage_refinance_why_option_5` | `mortgage_refinance_why_other` | Other reason |

### 15. Refinance Mortgage - Registration
| Old Name | New Name | Description |
|----------|----------|-------------|
| `mortgage_refinance_reg_option_1` | `mortgage_refinance_reg_on_me` | Registered to me |
| `mortgage_refinance_reg_option_2` | `mortgage_refinance_reg_on_other` | Registered to someone else |

### 16. Refinance Mortgage - Program
| Old Name | New Name | Description |
|----------|----------|-------------|
| `program_refinance_mortgage_option_1` | `program_refinance_mortgage_prime` | Prime rate |
| `program_refinance_mortgage_option_2` | `program_refinance_mortgage_fixed` | Fixed rate |
| `program_refinance_mortgage_option_3` | `program_refinance_mortgage_variable` | Variable rate |
| `program_refinance_mortgage_option_4` | `program_refinance_mortgage_eligibility` | Eligibility track |
| `program_refinance_mortgage_option_5` | `program_refinance_mortgage_other` | Other program |

## Frontend Code Update Requirements

After running the database migration, the following frontend components need to be updated to use the new descriptive names:

1. **CalculateMortgage/FirstStepForm.tsx** - Update all option arrays
2. **RefinanceCredit/FirstStepForm.tsx** - Update refinancing reason options
3. **PersonalData components** - Update marital status options
4. **All dropdown implementations** - Replace numeric values with descriptive ones

## Validation Queries

After migration, run these queries to verify:

```sql
-- Check for any remaining numeric patterns
SELECT content_key FROM content_items 
WHERE component_type = 'option' 
AND (content_key LIKE '%_option_%' OR content_key LIKE '%_options_%');

-- Should return 0 rows
```

## Benefits of Descriptive Naming

1. **Maintainability**: Developers can understand option meanings without looking up translations
2. **Searchability**: Easy to find specific options in codebase
3. **Consistency**: Follows database best practices from dropDownsInDBLogic
4. **Scalability**: Easy to add new options without renumbering
5. **Debugging**: Clear option identification in logs and database queries
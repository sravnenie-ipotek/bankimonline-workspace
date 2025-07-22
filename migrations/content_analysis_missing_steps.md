# Content Analysis for Missing Steps

## Overview
This document analyzes the content requirements for missing database content in the multi-step forms for:
- Refinance Mortgage (steps 2-3)
- Calculate Credit (steps 2-4)
- Refinance Credit (steps 2-4)

## Shared Components Analysis

Based on the analysis of the mortgage calculator steps, the following shared components are used across all services:

### Step 2 - Personal Information (Common Components)
1. **FormCaption** - Title for the step
2. **Info** - Privacy/information notice
3. **UserProfileCard** - Displays user name and phone
4. **NameSurname** - Text input for full name
5. **Birthday** - Date picker for birth date
6. **Education** - Dropdown with 7 education options
7. **AdditionalCitizenship** - Yes/No radio buttons
8. **CitizenshipsDropdown** - Multi-select dropdown (conditional)
9. **Taxes** - Yes/No radio buttons
10. **CountriesPayTaxes** - Multi-select dropdown (conditional)
11. **Childrens** - Yes/No radio buttons
12. **HowMuchChildrens** - Number input (conditional)
13. **MedicalInsurance** - Yes/No radio buttons
14. **IsForeigner** - Yes/No radio buttons
15. **PublicPerson** - Yes/No radio buttons
16. **Borrowers** - Number selector
17. **FamilyStatus** - Dropdown with 6 options
18. **PartnerPayMortgage** - Yes/No radio buttons (conditional)
19. **AddPartner** - Dropdown selector (conditional)

### Step 3 - Income & Employment (Common Components)
1. **FormCaption** - Title for the step
2. **UserProfileCard** - Displays user info
3. **MainSourceOfIncome** - Dropdown with 7 income source options
4. **MonthlyIncome** - Number input (conditional based on income source)
5. **FieldOfActivity** - Dropdown (conditional)
6. **CompanyName** - Text input (conditional)
7. **Profession** - Text input (conditional)
8. **StartDate** - Date picker (conditional)
9. **AdditionalIncome** - Dropdown with 7 options
10. **AdditionalIncomeAmount** - Number input (conditional)
11. **Obligation** - Dropdown with 5 debt type options
12. **MonthlyPayment** - Number input (conditional)
13. **EndDate** - Date picker (conditional)
14. **Bank** - Bank selector (conditional)
15. Various **AddButton** components for adding multiple entries
16. **TitleElement** - Section titles

### Step 4 - Results (Common Components)
1. **FormCaption** - Final step title
2. **UserParams** - Displays calculation parameters
3. **AlertWarning** - Warning message
4. **Filter** - Bank filter options (4 filters)
5. **BankOffers** - Bank offers display

## Content Requirements by Screen

### 1. refinance_step2 (Refinance Mortgage Step 2)
Uses the same components as mortgage_step2 but needs its own screen_location entries:
- Title: `refinance_step2_title`
- All shared Step 2 components (uses same content keys as mortgage_step2)

### 2. refinance_step3 (Refinance Mortgage Step 3)
Uses the same components as mortgage_step3 but needs its own screen_location entries:
- Title: `refinance_step3_title`
- All shared Step 3 components (uses same content keys as mortgage_step3)

### 3. calculate_credit_2 (Calculate Credit Step 2)
Already has migration script (migrate_credit_step2.sql) that copies from mortgage_step2

### 4. calculate_credit_3 (Calculate Credit Step 3)
Needs migration similar to step 2:
- Title: `calculate_credit_step3_title`
- All shared Step 3 components

### 5. calculate_credit_4 (Calculate Credit Step 4)
- Title: `calculate_credit_final`
- Warning: `calculate_credit_warning`
- Parameters section titles
- Filter options (same as mortgage)
- Bank offers labels

### 6. refinance_credit_step2 (Refinance Credit Step 2)
- Title: `refinance_credit_step2_title`
- All shared Step 2 components

### 7. refinance_credit_step3 (Refinance Credit Step 3)
- Title: `refinance_credit_step3_title`
- All shared Step 3 components

### 8. refinance_credit_step4 (Refinance Credit Step 4)
- Title: `refinance_credit_final`
- Warning: `refinance_credit_warning`
- Same structure as other step 4s

## Migration Strategy

1. **Copy Pattern**: Follow the pattern in `migrate_credit_step2.sql`
   - Copy content_items from mortgage steps to new screen_locations
   - Copy content_translations for all languages
   - Maintain the same content_keys to ensure components work

2. **Screen Locations**:
   - `refinance_step2` (copies from mortgage_step2)
   - `refinance_step3` (copies from mortgage_step3)
   - `calculate_credit_3` (copies from mortgage_step3)
   - `calculate_credit_4` (new content needed)
   - `refinance_credit_step2` (copies from mortgage_step2)
   - `refinance_credit_step3` (copies from mortgage_step3)
   - `refinance_credit_step4` (similar to calculate_credit_4)

3. **Unique Content**: Only step 4 (results) needs unique content per service type
   - Different warning messages
   - Different final titles
   - Service-specific labels

## Dropdown Options Summary

All dropdown options that need to be migrated (component_type = 'option'):

1. **Education** (7 options): `calculate_mortgage_education_option_1` through `_7`
2. **Family Status** (6 options): `calculate_mortgage_family_status_option_1` through `_6`
3. **Main Source of Income** (7 options): `calculate_mortgage_main_source_option_1` through `_7`
4. **Additional Income** (7 options): `calculate_mortgage_has_additional_option_1` through `_7`
5. **Obligations** (5 options): `calculate_mortgage_debt_types_option_1` through `_5`
6. **Countries** (multi-select): Dynamic list
7. **Citizenship** (multi-select): Dynamic list

## Next Steps

1. Create migration scripts following the pattern of `migrate_credit_step2.sql`
2. Add unique content for step 4 screens
3. Test that useContentApi hook properly loads content for each screen_location
4. Update components if needed to use correct screen_location in useContentApi calls
# Refinance Credit Step 1 Dropdown Migration Summary

## Overview
Created SQL migration file to add all dropdown options and form field labels for Credit Refinancing Step 1.

## Migration File
- **File**: `migrate_refinance_credit_step1_dropdowns.sql`
- **Date**: 2025-01-22
- **Purpose**: Migrate hardcoded dropdown values to database-driven content

## Content Migrated

### 1. Why Refinancing Dropdown Options (4 options)
- `calculate_credit_why_option_1`: "Improve interest rate" 
- `calculate_credit_why_option_2`: "Reduce credit amount"
- `calculate_credit_why_option_3`: "Increase term to reduce payment"
- `calculate_credit_why_option_4`: "Increase payment to reduce term"

### 2. Bank Selection Dropdown Options (5 banks)
- `bank_hapoalim`: "Bank Hapoalim"
- `bank_leumi`: "Bank Leumi"
- `bank_discount`: "Discount Bank"
- `bank_massad`: "Massad Bank"
- `bank_israel`: "Bank of Israel"

### 3. Form Field Labels and Placeholders
- `mortgage_credit_why`: Goal of credit refinancing (dropdown title)
- `credit_refinance_why_ph`: Select goal (dropdown placeholder)
- `bank_apply_credit`: Bank (field label)
- `amount_credit_title`: Credit amount
- `calculate_mortgage_initial_payment`: Monthly payment
- `refinance_credit_start_date`: Start date
- `refinance_credit_end_date`: End date
- `early_repayment`: Early repayment amount
- `desired_monthly_payment`: Desired monthly payment
- `credit_loan_period`: Desired loan period
- `list_credits_title`: List of existing credits
- `add_credit`: Add credit (button)
- `credit_refinance_title`: Credit Refinancing (page title)

### 4. Additional UI Elements
- `calculate_mortgage_first_ph`: Select property status (bank dropdown placeholder)
- `date_ph`: Select date (date field placeholder)
- `remove_credit`: Delete loan details? (confirmation dialog)
- `remove_credit_subtitle`: By clicking confirm, all details of this loan will be deleted
- `delete`: Delete (button text - was missing from translations)
- `calculate_mortgage_period_units_min/max`: years (unit labels)

## Technical Details

### Database Structure
- **Table**: `content_items` 
- **Component Types**: 
  - `dropdown_option` for dropdown values
  - `label`, `placeholder`, `button`, `title` for UI elements
  - `option` for individual dropdown items
- **Categories**: 
  - `refinance_reason` for why refinancing options
  - `bank` for bank options
  - `form_field`, `action`, `dialog`, `unit` for other elements
- **Screen Location**: `refinance_credit_1`

### Translation Support
All content includes translations for:
- English (en) - is_default = true
- Hebrew (he) - with proper RTL text
- Russian (ru) - with proper Cyrillic text

### Special Considerations
1. **Conditional Fields**: The form shows different fields based on the selected refinancing reason:
   - Option 2: Shows early repayment amount field
   - Option 3: Shows desired monthly payment field
   - Option 4: Shows desired term slider

2. **Dynamic Credit List**: Users can add multiple credits, each with its own bank selection

3. **Missing Translation**: The `delete` key was missing from translation files but used in the component, so it was added to the migration

## Next Steps
1. Run the migration against the database:
   ```bash
   psql $DATABASE_URL -f migrations/migrate_refinance_credit_step1_dropdowns.sql
   ```

2. Verify the content is available via the content API

3. Update the component to use database-driven content if needed (though it should work with existing translation keys)

## Related Files
- Component: `/mainapp/src/pages/Services/pages/RefinanceCredit/pages/FirstStep/FirstStepForm/FirstStepForm.tsx`
- Credit Data Component: `/mainapp/src/pages/Services/pages/RefinanceCredit/pages/FirstStep/FirstStepForm/ui/CreditData/CreditData.tsx`
- Translation Files: `/mainapp/public/locales/{en,he,ru}/translation.json`
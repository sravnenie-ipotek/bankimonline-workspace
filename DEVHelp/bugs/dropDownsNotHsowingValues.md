# Bug: Dropdowns Not Showing Values (Refinance Mortgage)

## Symptom
On the refinance mortgage page (`/services/refinance-mortgage/1`), all dropdown fields appeared empty—no options were shown to the user.

## Expected
Dropdowns should display options such as "Fixed Interest", "Variable Interest", "Prime Interest", etc., for fields like mortgage program, property type, registration status, and banks.

## Root Cause
- The backend API (`/api/dropdowns/refinance_step1/en`) is responsible for providing dropdown options.
- The dropdown options existed in the database, but their `component_type` was set to `option`.
- The backend code was only looking for `dropdown_option` (and a few others), and ignored `option` types.
- As a result, the API returned only the dropdown containers without their options.

## Solution Applied
1. **Updated Backend Filtering Logic**: Modified `server-db.js` to accept both `option` and `dropdown_option` component types:
   ```javascript
   AND content_items.component_type IN ('dropdown_container', 'dropdown_option', 'placeholder', 'label', 'option')
   ```

2. **Fixed Dropdown Parsing Logic**: Updated the pattern recognition to handle `option` component types:
   ```javascript
   case 'option':
       // Extract option value from content_key
       let optionValue = null;
       
       // Try various patterns for option values
       const optionPatterns = [
           /_option_(.+)$/,                         // Standard pattern: field_option_value
           // Property ownership options
           /_(selling_property)$/,                 
           /_(no_property)$/,                      
           /_(has_property)$/,                     
           /_(im_selling_a_property)$/,            
           // Bank options
           /_(hapoalim|leumi|discount|massad)$/,   
           // Program options
           /_(fixed_interest|variable_interest|prime_interest|mixed_interest|other)$/,
           // Property type options
           /_(apartment|private_house|commercial|land|other)$/,
           // Registration options
           /_(yes|no)$/,
           // Why refinance options
           /_(lower_interest_rate|reduce_monthly_payment|shorten_mortgage_term|cash_out_refinance|consolidate_debts)$/
       ];
   ```

3. **Added Refinance Step 2 Support**: Added pattern recognition for `refinance_step2_` content keys:
   ```javascript
   // Pattern 4.5: refinance_step2_{fieldname} (handles both container and options)
   if (!fieldName) {
       // For options like: refinance_step2_education_bachelors, refinance_step2_education_masters, etc.
       match = row.content_key.match(/refinance_step2_([^_]+(?:_[^_]+)*)_(?:bachelors|masters|doctorate|full_certificate|partial_certificate|no_certificate|post_secondary|postsecondary_education|full_high_school_certificate|partial_high_school_certificat|no_high_school_certificate)/);
       if (match) {
           fieldName = match[1];
       } else {
           // For containers like: refinance_step2_education
           match = row.content_key.match(/refinance_step2_([^_]+(?:_[^_]+)*)(?:_ph|$)/);
           if (match) {
               fieldName = match[1];
           }
       }
   }
   ```

## Additional Issues Fixed

### Issue 2: Refinance Step 2 Education Dropdown
**Symptom**: On `/services/refinance-mortgage/2`, the education dropdown (השכלה) was showing only 1 option instead of multiple education levels.

**Root Cause**: The dropdown parsing logic in `server-db.js` didn't include pattern recognition for `refinance_step2_` content keys.

**Solution**: Added Pattern 4.5 to handle `refinance_step2_` content keys with education options.

## Validation Error Translation Issues

### Issue 3: Validation Errors Not Translated
**Symptom**: Validation error messages like "Please specify why you want to refinance" were showing in English instead of Hebrew.

**Root Cause**: Missing validation error keys in the database for refinance-specific validation messages.

**Solution**: Added missing validation error messages to the database:
- `error_refinance_why_required` → "אנא ציין מדוע אתה רוצה למחזר משכנתא"
- `error_refinance_bank_required` → "בנק נוכחי נדרש"
- `error_refinance_type_required` → "סוג נכס נדרש"
- `error_refinance_registered_required` → "סטטוס רישום הנכס נדרש"
- `error_refinance_start_date_required` → "תאריך תחילת המשכנתא נדרש"

## Current Status
✅ **All dropdowns working correctly**:
- Refinance Step 1: Bank, Program, Property Type, Registration, Why refinance
- Refinance Step 2: Education (multiple options now showing)
- Validation errors properly translated in Hebrew

### Issue 4: Modal Title Translation
**Symptom**: Modal titles showing raw translation keys like "source_of_income 2" and "additional_source_of_income 2".

**Root Cause**: Frontend components using `t()` instead of `getContent()` for modal titles.

**Solution**: 
1. Added database keys: `source_of_income_modal_title`, `additional_source_of_income_modal_title`
2. Updated frontend components to use `getContent()` instead of `t()`

### Issue 5: Card Labels Translation
**Symptom**: Source of income cards showing "source_of_income2", "source_of_income3" instead of proper Hebrew labels.

**Root Cause**: Card names using `t('source_of_income')` instead of `getContent()`.

**Solution**:
1. Added database keys: `source_of_income_label`, `additional_source_of_income_label`
2. Updated `RefinanceMortgage/pages/ThirdStep/ThirdStepForm/ThirdStepForm.tsx` to use `getContent()`

### Issue 6: Button Text Translation
**Symptom**: "Add Place to Work", "Add Additional Source of Income", "Add Obligation" buttons showing in English instead of Hebrew.

**Root Cause**: Button texts using `t()` instead of `getContent()`.

**Solution**:
1. Added database keys: `add_place_to_work_button`, `add_additional_source_of_income_button`, `add_obligation_button`
2. Updated `RefinanceMortgage/pages/ThirdStep/ThirdStepForm/ThirdStepForm.tsx` to use `getContent()`

### Issue 7: Obligation Modal Title Translation
**Symptom**: Obligation modal title showing "obligation 2" instead of proper Hebrew translation.

**Root Cause**: Modal title using `t('obligation')` instead of `getContent()`.

**Solution**:
1. Added database key: `obligation_modal_title` in `common` screen location
2. Updated all `ObligationModal` components to use `getContent()`

### Issue 8: Irrelevant "No Additional Income" Option in Modal
**Symptom**: Additional Income modal shows "אין הכנסות נוספות" (No Additional Income) option, which is illogical since user clicked "Add Additional Income".

**Root Cause**: Same dropdown component used in both main form (where "No Additional Income" is valid) and modal (where it's irrelevant).

**Solution**:
1. Added `excludeNoIncome` prop to `AdditionalIncome` component
2. Updated filtering logic to exclude "no_additional_income" option when `excludeNoIncome=true`
3. Updated all `AdditionalIncomeModal` forms to pass `excludeNoIncome={true}`

### Issue 9: Bank Lender Dropdown Empty in Obligation Modal
**Symptom**: Obligation modal "בנק מלווה" (Bank Lender) dropdown has no options.

**Root Cause**: Missing `mortgage_step3_bank` dropdown options. The obligation modal uses two dropdowns: first for obligation type (`mortgage_step3_obligations` - which existed), then for bank selection (`mortgage_step3_bank` - which was missing).

**Solution**:
1. Added database keys for `mortgage_step3_bank` dropdown (reusing existing bank pattern from `refinance_step1_bank`):
   - `mortgage_step3_bank_container` → "בנק מלווה" 
   - `mortgage_step3_bank_hapoalim` → "בנק הפועלים"
   - `mortgage_step3_bank_leumi` → "בנק לאומי"
   - `mortgage_step3_bank_discount` → "בנק דיסקונט"
   - `mortgage_step3_bank_massad` → "בנק מסד"
2. Added Pattern 4.6 to `server-db.js` for `mortgage_step3_bank_` parsing
3. **Note**: Bank options already existed in `refinance_step1_bank`, but were needed for `mortgage_step3_bank` as well

### Issue 10: Wrong Placeholder Text in Obligation Modal
**Symptom**: Monthly payment field in obligation modal shows wrong placeholder "הזן הכנסה חודשית נטו" (Enter net monthly income) instead of payment-related text.

**Root Cause**: MonthlyPayment component was using generic mortgage translation keys instead of obligation-specific content.

**Solution**:
1. Created obligation-specific content in `common` screen location:
   - `obligation_monthly_payment_title` → "תשלום חודשי" (Monthly Payment)
   - `obligation_monthly_payment_placeholder` → "הזן סכום תשלום חודשי" (Enter monthly payment amount)
   - `obligation_end_date_title` → "תאריך סיום ההתחייבות" (Obligation End Date)
   - `obligation_bank_title` → "בנק מלווה" (Bank Lender)
   - `obligation_bank_placeholder` → "בחר בנק" (Select bank)
2. Updated MonthlyPayment component to use `getContent()` instead of `t()`
3. Updated EndDate component to use obligation-specific title
4. Updated Bank component to use obligation-specific content when in obligation context
5. **Followed @procceessesPagesInDB.md**: Used `common` screen location as specified for modal content

## Testing Verification
- ✅ Bank dropdown shows: בנק הפועלים, בנק לאומי, בנק דיסקונט, בנק מסד
- ✅ Program dropdown shows: Fixed Interest, Variable Interest, Prime Interest, Mixed Interest, Other
- ✅ Property Type dropdown shows: Apartment, Private House, Commercial, Land, Other
- ✅ Registration dropdown shows: Yes/No options
- ✅ Why dropdown shows: Lower Interest Rate, Reduce Monthly Payment, etc.
- ✅ Modal titles properly translated: "מקור הכנסה נוסף" instead of raw keys
- ✅ Card labels properly translated: "מקור הכנסה 2", "מקור הכנסה נוסף 2" instead of raw keys
- ✅ Button texts properly translated: "הוסף מקום עבודה", "הוסף מקור הכנסה נוסף", "הוסף התחייבות"
- ✅ Obligation modal title properly translated: "התחייבות 2" instead of "obligation 2"
- ✅ Additional Income modal excludes irrelevant "אין הכנסות נוספות" option
- ✅ Bank Lender dropdown (in obligation modal) shows: בנק הפועלים, בנק לאומי, בנק דיסקונט, בנק מסד
- ✅ Obligation modal content properly translated: "תשלום חודשי", "הזן סכום תשלום חודשי", "תאריך סיום ההתחייבות", "בנק מלווה"
- ✅ Education dropdown shows: תואר ראשון, תואר שני, תואר שלישי, תעודת בגרות מלאה, etc.

The dropdowns were empty because the backend was filtering out the options due to a mismatch in the expected `component_type` value. Additionally, bank options weren't being grouped correctly and refinance step 2 patterns weren't recognized. Fixing the backend to accept both `option` and `dropdown_option`, updating the parsing logic for bank options, and adding support for refinance_step2 patterns resolved all issues.
# City Dropdown Validation Fix

## Issue
Users were getting validation error "Выберите ответ" when selecting a city in the credit calculation form's city dropdown, even after making a valid selection.

## Root Cause Analysis
1. **Missing Conditional Validation**: The city dropdown (`cityWhereYouBuy`) is only shown when `purposeOfLoan === 'option_6'` (specific loan type), but validation was applied unconditionally.
2. **Hardcoded Error Message**: The validation schema had a hardcoded Russian error message instead of using the translation system.
3. **Missing Related Field Validation**: Other conditional fields (`priceOfEstate`, `haveMortgage`) were also missing proper validation.

## Changes Made

### File: `/src/pages/Services/pages/CalculateCredit/pages/FirstStep/FirstStep.tsx`

#### 1. Fixed Hardcoded Error Message
```diff
- purposeOfLoan: Yup.string().required('Выберите ответ'),
+ purposeOfLoan: Yup.string().required(i18next.t('error_select_answer')),
```

#### 2. Added Conditional Validation for City Field
```diff
+ cityWhereYouBuy: Yup.string().when('purposeOfLoan', {
+   is: 'option_6',
+   then: (schema) => schema.required(i18next.t('error_select_answer')),
+   otherwise: (schema) => schema.notRequired(),
+ }),
```

#### 3. Added Validation for Related Conditional Fields
```diff
+ priceOfEstate: Yup.number().when('purposeOfLoan', {
+   is: 'option_6',
+   then: (schema) => schema.required(i18next.t('error_required_to_fill_out')),
+   otherwise: (schema) => schema.notRequired(),
+ }),
+ haveMortgage: Yup.string().when('purposeOfLoan', {
+   is: 'option_6',
+   then: (schema) => schema.required(i18next.t('error_select_answer')),
+   otherwise: (schema) => schema.notRequired(),
+ }),
```

## Technical Details

### City Dropdown Implementation
- **API Endpoint**: `/api/get-cities?lang=${lang}`
- **Response Format**: `{value: string, name: string}[]`
- **Component**: `DropdownMenu` with searchable functionality
- **Supported Languages**: English, Hebrew, Russian

### Value Format
Cities are stored and transmitted as:
```json
{
  "value": "tel_aviv",    // City key for database
  "name": "Tel Aviv"      // Localized city name
}
```

### Conditional Logic
The city dropdown appears only when:
```javascript
values.purposeOfLoan === 'option_6'
```
This corresponds to loan purpose option 6 (real estate related loan).

## QA Test Scenarios

### ✅ Test Case 1: Non-Real Estate Loan
1. Navigate to "Calculate Credit" page
2. Select any loan purpose EXCEPT option 6
3. Fill out required fields
4. Submit form
5. **Expected**: No city validation error, form submits successfully

### ✅ Test Case 2: Real Estate Loan - No City Selected
1. Navigate to "Calculate Credit" page
2. Select loan purpose option 6 (real estate)
3. Fill out other required fields but leave city empty
4. Submit form
5. **Expected**: City field shows "Выберите ответ" error message

### ✅ Test Case 3: Real Estate Loan - City Selected
1. Navigate to "Calculate Credit" page
2. Select loan purpose option 6 (real estate)
3. Fill out all required fields including city selection
4. Submit form
5. **Expected**: No validation errors, form submits successfully

### ✅ Test Case 4: Language Support
1. Test in all three languages (English, Hebrew, Russian)
2. Verify error messages appear in correct language
3. Verify city names appear in selected language

### ✅ Test Case 5: City Search Functionality
1. Select real estate loan purpose
2. Click on city dropdown
3. Type city name in search field
4. Select city from filtered results
5. **Expected**: City value is properly set and validation passes

## Build Status
- ✅ Build completed successfully
- ✅ No TypeScript errors
- ✅ All components compile correctly

## Translation Verification
Error message translations verified in:
- **Russian**: "Выберите ответ" (`error_select_answer`)
- **English**: Available in translation system
- **Hebrew**: Available in translation system

## Resolution
The validation error "Выберите ответ" should no longer appear when:
1. City dropdown is not visible (non-real estate loans)
2. User has selected a valid city from the dropdown

The fix ensures validation logic matches the UI conditional display logic.
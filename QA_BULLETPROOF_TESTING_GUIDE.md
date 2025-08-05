# BULLETPROOF QA TESTING GUIDE - ALL PROCESSES TO STEP 4

## Overview
This document provides a comprehensive, bulletproof testing checklist for all calculator processes (Mortgage, Credit, Refinance) from start to step 4, ensuring every dropdown value, input field, and link is thoroughly tested.

## Testing Prerequisites
1. Clear browser cache and cookies before each test
2. Test in multiple browsers (Chrome, Firefox, Safari, Edge)
3. Test in all three languages (EN, HE, RU)
4. Test both desktop and mobile viewports
5. Have browser console open to catch any errors
6. Use network tab to monitor API calls

## 1. MORTGAGE CALCULATOR PROCESS

### Step 1 - Property & Loan Details
```
Test Each Dropdown Value:
□ Property Type Dropdown
  □ Select "Apartment"
  □ Select "Private house"
  □ Select "Garden apartment"
  □ Select "Penthouse"
  □ Select "Other"
  □ Verify selection persists when changing language

□ Property Ownership Dropdown
  □ Select "I don't own any property" → Verify 75% LTV limit
  □ Select "I own a property" → Verify 50% LTV limit
  □ Select "I'm selling a property" → Verify 70% LTV limit
  □ Check that slider ranges update correctly for each option

□ When Do You Need Mortgage Dropdown
  □ Select "Immediately"
  □ Select "Within 3 months"
  □ Select "Within 6 months"
  □ Select "Over 6 months"

Input Fields:
□ Property Value
  □ Enter minimum value (100,000)
  □ Enter maximum value (10,000,000)
  □ Enter invalid values (negative, zero, text)
  □ Use slider to set value
  □ Verify currency formatting

□ Initial Payment
  □ Enter minimum based on ownership (25%, 30%, or 50%)
  □ Enter maximum (property value - 1)
  □ Use slider to adjust
  □ Verify it updates when property value changes
  □ Verify percentage calculation is correct

□ Desired Loan Amount
  □ Verify auto-calculation (Property Value - Initial Payment)
  □ Try to manually edit (should be readonly)

□ Mortgage Term
  □ Enter minimum (4 years)
  □ Enter maximum (30 years)
  □ Use slider
  □ Enter invalid values

□ Monthly Payment
  □ Enter various amounts
  □ Verify it affects loan term calculation
  □ Check minimum payment validation

Links & Buttons:
□ Click "Terms and Conditions" link
□ Click "Privacy Policy" link
□ Verify "Next" button enables only when all fields valid
□ Click "Back" button (if visible)
```

### Step 2 - Personal Information
```
Personal Details Section:
□ First Name
  □ Enter Hebrew characters
  □ Enter English characters
  □ Enter Russian characters
  □ Enter numbers (should fail)
  □ Enter special characters (should fail)
  □ Maximum length test

□ Last Name
  □ Same tests as First Name

□ ID Number
  □ Enter valid 9-digit Israeli ID
  □ Enter invalid ID (wrong checksum)
  □ Enter less than 9 digits
  □ Enter more than 9 digits
  □ Enter non-numeric characters

□ Birthday Date Picker
  □ Select date making person 18 years old
  □ Select date making person 17 (should fail)
  □ Select date making person 65+
  □ Try future dates (should fail)
  □ Manual date entry in different formats

Dropdown Tests:
□ Gender Dropdown
  □ Select "Male"
  □ Select "Female"
  □ Leave unselected and try to proceed

□ Family Status Dropdown
  □ Select "Single"
  □ Select "Married"
  □ Select "Divorced"
  □ Select "Widowed"
  □ Check partner fields appear for "Married"

□ Children Dropdown
  □ Select "Yes" → Number of children field appears
    □ Enter 0 (check validation)
    □ Enter 1-10
    □ Enter negative number
    □ Enter very large number
  □ Select "No" → Number field should hide

□ Education Level Dropdown
  □ Select "High School"
  □ Select "Professional Training"
  □ Select "Bachelor's Degree"
  □ Select "Master's Degree"
  □ Select "Doctorate"

□ Medical Insurance Dropdown
  □ Select "Clalit"
  □ Select "Maccabi"
  □ Select "Meuhedet"
  □ Select "Leumit"
  □ Select "IDF"
  □ Select "None"

□ Additional Citizenship Dropdown
  □ Select "Yes" → Citizenship selection appears
    □ Select USA
    □ Select Russia
    □ Select France
    □ Search for country
  □ Select "No" → Field should hide

□ Property Ownership (if appears)
  □ Select each option
  □ Verify consistency with Step 1

□ Tax Residency Dropdown
  □ Select "Israel Only"
  □ Select "Other Countries" → Country selection appears
  □ Select "FATCA Applicable"

Partner Section (if married):
□ Repeat all above fields for partner
□ Verify both borrowers show in summary

Address Section:
□ City Dropdown
  □ Type to search cities
  □ Select from autocomplete
  □ Try non-existent city

□ Street Name
  □ Enter valid street
  □ Special characters test

□ House Number
  □ Numeric entry
  □ Alphanumeric (e.g., "12A")

□ Apartment Number (optional)
  □ Leave empty
  □ Enter number

□ Postal Code
  □ 5-digit code
  □ 7-digit code
  □ Invalid format
```

### Step 3 - Income & Employment
```
Main Income Source Dropdown:
□ Select "Salaried Employee"
  □ Job Title field appears
  □ Company Name field appears
  □ Years at Job dropdown
  □ Monthly Salary field
  □ Upload salary slips

□ Select "Self Employed"
  □ Business Type field
  □ Years in Business
  □ Average Monthly Income
  □ Upload financial statements

□ Select "Freelancer"
  □ Field of Work
  □ Years Active
  □ Average Monthly Income
  □ Client list option

□ Select "Pension"
  □ Pension Amount
  □ Pension Source

□ Select "Investments"
  □ Investment Type
  □ Monthly Returns

□ Select "Other"
  □ Description field
  □ Amount field

Employment Details:
□ Field of Activity Dropdown
  □ Select "Technology"
  □ Select "Healthcare"
  □ Select "Education"
  □ Select "Finance"
  □ Select "Real Estate"
  □ Select "Retail"
  □ Select "Manufacturing"
  □ Select "Other"

□ Years at Current Job Dropdown
  □ Select "Less than 1 year"
  □ Select "1-2 years"
  □ Select "2-5 years"
  □ Select "5-10 years"
  □ Select "Over 10 years"

Additional Income Section:
□ Has Additional Income Dropdown
  □ Select "Yes" → Additional income fields appear
    □ Income Type dropdown (same as main)
    □ Amount field
    □ Documentation upload
  □ Select "No" → Fields hidden

Financial Obligations:
□ Existing Loans Dropdown
  □ Select "Yes" → Loan details appear
    □ Loan Type (Mortgage/Car/Personal/Other)
    □ Monthly Payment
    □ Remaining Balance
    □ End Date
    □ Add Another Loan button
  □ Select "No" → Fields hidden

□ Credit Card Debt Dropdown
  □ Select "Yes" → Debt details
    □ Number of Cards
    □ Total Balance
    □ Average Monthly Payment
  □ Select "No"

File Uploads:
□ Upload Salary Slips (3 months)
  □ PDF format
  □ JPG/PNG format
  □ File size limits
  □ Multiple files
  □ Invalid file types

□ Upload Bank Statements
□ Upload Tax Returns
□ Remove uploaded files
□ Replace uploaded files
```

### Step 4 - Bank Offers & Results
```
Filter Section:
□ Mortgage Type Filter Dropdown
  □ Select "All Programs"
  □ Select "Prime Rate"
  □ Select "Fixed Rate"
  □ Select "Variable Rate"
  □ Verify offers update accordingly

Bank Offer Cards:
□ For each bank offer displayed:
  □ Click info icon → Modal opens
    □ Switch between "Description" and "Conditions" tabs
    □ Verify all text displays correctly
    □ Close modal (X button and outside click)
  □ Verify monthly payment displays
  □ Verify total amount displays
  □ Verify interest rate displays
  □ Verify loan term displays
  □ Click "Select Bank" button

Program Information:
□ Prime Rate Mortgage
  □ Verify "Up to 33%" text
  □ Verify "4-30 years" text
  □ Verify rate structure

□ Fixed Rate Mortgage
  □ Verify conditions display
  □ Verify all percentages

□ Variable Rate Mortgage
  □ Verify all program details

Navigation:
□ Click "Back" button → Returns to Step 3
□ Click "Recalculate" button → Returns to Step 1
□ Click "Print Results" button
□ Click "Save Results" button
□ Click "Compare Banks" link
```

## 2. CREDIT CALCULATOR PROCESS

### Step 1 - Credit Details
```
Dropdowns:
□ Credit Purpose Dropdown
  □ Select "Personal Loan"
  □ Select "Car Purchase"
  □ Select "Home Renovation"
  □ Select "Debt Consolidation"
  □ Select "Business"
  □ Select "Education"
  □ Select "Medical"
  □ Select "Other"

□ Loan Term Dropdown
  □ Select "Up to 1 year"
  □ Select "1-2 years"
  □ Select "2-3 years"
  □ Select "3-5 years"
  □ Select "5-7 years"
  □ Select "7-10 years"
  □ Select "Over 10 years"

□ When Do You Need the Credit
  □ Select "Immediately"
  □ Select "Within 1 month"
  □ Select "Within 3 months"
  □ Select "Over 3 months"

Input Fields:
□ Desired Credit Amount
  □ Minimum (5,000)
  □ Maximum (200,000)
  □ Invalid inputs

□ Desired Monthly Payment
  □ Various amounts
  □ Check term calculation
```

### Step 2 - Personal Information
```
(Same as Mortgage Step 2, but check for any credit-specific fields)
□ All personal detail fields
□ All dropdowns with each option
□ Address information
□ Document uploads specific to credit
```

### Step 3 - Income Information
```
□ Employment Type Dropdown
  □ Each employment type option
  □ Specific fields for credit

□ Income Verification
  □ Salary slips (last 3)
  □ Bank statements (last 3)
  □ Employment letter

□ Financial Health Check
  □ Bank Account Type
  □ Credit Score Knowledge
  □ Previous Loan History
```

### Step 4 - Credit Offers
```
□ Filter by Bank
□ Filter by Interest Type
□ Each bank offer card
□ Terms and conditions for each
□ Application buttons
□ Comparison features
```

## 3. REFINANCE CALCULATOR PROCESS

### Step 1 - Current Mortgage Details
```
Dropdowns:
□ Current Bank Dropdown
  □ Select each bank option
  □ Search functionality

□ Mortgage Type Dropdown
  □ Prime Rate
  □ Fixed Rate
  □ Variable Rate
  □ Mixed

□ Property Type
  □ Same as mortgage calculator

Input Fields:
□ Original Loan Amount
□ Current Balance
□ Current Monthly Payment
□ Years Remaining
□ Current Interest Rate
□ Property Current Value
```

### Steps 2-4
```
Follow same pattern as Mortgage Calculator with refinance-specific validations
```

## 4. COMPREHENSIVE LINK TESTING

### Footer Links
```
□ Terms of Service
  □ Opens in new tab
  □ Correct content
  □ All language versions

□ Privacy Policy
  □ Opens correctly
  □ Scrollable
  □ Print option

□ Cookie Policy
□ Contact Us
□ About Us
□ FAQ
□ Careers
□ Partners
```

### Navigation Links
```
□ Logo → Homepage
□ All menu items
□ Language switcher
  □ EN → HE → RU
  □ RTL/LTR switch
  □ Content updates

□ User menu (if logged in)
  □ Profile
  □ Settings
  □ Logout
```

### External Links
```
□ Social Media Icons
  □ Facebook
  □ LinkedIn
  □ Twitter
  □ Instagram

□ Partner Links
□ Regulatory Links
```

## 5. CROSS-FUNCTIONAL TESTING

### Language Testing
```
For each process:
□ Start in English, switch to Hebrew mid-process
□ Complete form in Russian
□ Verify all dropdowns translate
□ Verify all error messages translate
□ Verify number formatting (LTR in RTL languages)
□ Verify date formatting
```

### Validation Testing
```
□ Try to proceed with empty required fields
□ Test all validation error messages
□ Test field interdependencies
□ Test calculation accuracy
□ Verify data persistence on back/forward
```

### Performance Testing
```
□ Page load times < 3 seconds
□ Dropdown response < 200ms
□ No memory leaks on language switch
□ API response times < 1 second
```

### Accessibility Testing
```
□ Tab navigation through all fields
□ Screen reader compatibility
□ Keyboard shortcuts
□ High contrast mode
□ Zoom to 200%
```

### Error Scenarios
```
□ Network disconnection mid-process
□ Session timeout
□ Invalid data submission
□ File upload failures
□ API errors
```

## 6. MOBILE-SPECIFIC TESTING

### Touch Interactions
```
□ Dropdown tap areas
□ Slider controls
□ Date picker on mobile
□ File upload on mobile
□ Pinch to zoom disabled on forms
```

### Responsive Layout
```
□ 320px width (iPhone SE)
□ 375px width (iPhone 11)
□ 768px width (iPad)
□ 1024px width (iPad Pro)
□ Landscape orientation
```

## 7. DATA VALIDATION MATRIX

### Numeric Fields Test Values
```
Minimum boundary - 1
Minimum boundary
Minimum boundary + 1
Typical value
Maximum boundary - 1
Maximum boundary
Maximum boundary + 1
Zero
Negative values
Decimal values
Scientific notation
Special characters
Empty string
Spaces only
Very large numbers
```

### Text Fields Test Values
```
Empty string
Single character
Maximum length - 1
Maximum length
Maximum length + 1
Special characters (!@#$%^&*)
HTML tags (<script>)
SQL injection ('; DROP TABLE)
Unicode characters
RTL characters in LTR field
Mixed language input
Emojis
Leading/trailing spaces
Only spaces
```

### Dropdown Test Patterns
```
□ First option
□ Last option
□ Middle options
□ Search with partial match
□ Search with no results
□ Clear selection
□ Keyboard navigation
□ Click outside to close
```

## 8. AUTOMATION MARKERS

Mark each tested item with:
- ✅ Passed
- ❌ Failed (note issue)
- ⚠️ Warning (works but has issues)
- ⏭️ Skipped (note reason)
- 🐛 Bug found (create ticket)

## 9. TEST EXECUTION LOG

```
Date: ___________
Tester: ___________
Environment: ___________
Browser: ___________
Language: ___________

Process: Mortgage / Credit / Refinance
Step 1: Start Time: _____ End Time: _____ Status: _____
Step 2: Start Time: _____ End Time: _____ Status: _____
Step 3: Start Time: _____ End Time: _____ Status: _____
Step 4: Start Time: _____ End Time: _____ Status: _____

Issues Found:
1. _____________________
2. _____________________
3. _____________________

Notes:
_________________________
_________________________
```

## 10. CRITICAL PATH SCENARIOS

### Happy Path - Mortgage
1. Select Apartment, Own Property, Immediate
2. Enter valid property value and down payment
3. Fill all personal details correctly
4. Add spouse (married)
5. Salaried employee with 5 years
6. No additional income or loans
7. View and select bank offer

### Edge Cases
1. Minimum age (18) borrower
2. Maximum loan amount
3. Shortest loan term
4. Multiple citizenships and tax residencies
5. Self-employed with variable income
6. Multiple loans and obligations

### Negative Scenarios
1. Under 18 borrower
2. Insufficient down payment
3. Invalid ID number
4. Future birth date
5. Income less than obligations
6. Corrupted file uploads

---

## USAGE INSTRUCTIONS

1. **Systematic Approach**: Start from Step 1 and methodically work through each item
2. **Document Everything**: Screenshot any issues, note exact steps to reproduce
3. **Test Isolation**: Clear browser state between major test scenarios
4. **Rotation Testing**: Rotate through languages and browsers systematically
5. **Regression Focus**: Pay special attention to previously reported bug areas

This checklist should be executed:
- Before any production deployment
- After major feature additions
- As part of weekly regression testing
- When onboarding new QA team members

Remember: The goal is not just to find bugs, but to ensure a smooth, error-free user experience across all possible user journeys.
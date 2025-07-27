# Comprehensive QA Testing Checklist - All 4 Processes to Step 4

## Overview
This document provides a bulletproof testing checklist for all 4 financial calculator processes, ensuring complete translation coverage and functionality through Step 4 (Results/Offers page).

## Testing Environment Setup
- **Languages to Test**: Hebrew (עברית), English, Russian (Русский)
- **Browser Requirements**: Chrome, Firefox, Safari (latest versions)
- **Viewport Testing**: Desktop (1920x1080), Tablet (768x1024), Mobile (375x667)
- **Test User Phone**: 972544123456 (OTP: 123456)

---

## 1. MORTGAGE CALCULATOR (משכנתא)

### Step 1: Property & Loan Details
- [ ] **Page Title**: "Mortgage Calculator" / "מחשבון משכנתא"
- [ ] **Property Value Input**
  - [ ] Label: "Property value" / "מחיר הנכס"
  - [ ] Placeholder text visible
  - [ ] Currency symbol (₪) displays correctly
  - [ ] Number formatting (commas) works
  - [ ] Validation: minimum/maximum values
  
- [ ] **City Dropdown**
  - [ ] Label: "City" / "עיר"
  - [ ] Placeholder: "Select city" / "בחר עיר"
  - [ ] All city names translated
  - [ ] Search functionality works
  - [ ] "Nothing found" message translated
  
- [ ] **When to Purchase Dropdown**
  - [ ] Label: "When do you plan to purchase?" / "מתי אתה מתכנן לרכוש?"
  - [ ] Options:
    - [ ] "Within 3 months" / "תוך 3 חודשים"
    - [ ] "3-6 months" / "3-6 חודשים"
    - [ ] "6-12 months" / "6-12 חודשים"
    - [ ] "More than a year" / "יותר משנה"
    
- [ ] **Property Type Dropdown**
  - [ ] Label: "Property type" / "סוג הנכס"
  - [ ] Options:
    - [ ] "First apartment" / "דירה ראשונה"
    - [ ] "Replacement apartment" / "דירה חלופית"
    - [ ] "Investment property" / "נכס להשקעה"
    - [ ] "Other property" / "נכס אחר"
    
- [ ] **First Time Buyer Dropdown**
  - [ ] Label: "Is this your first property purchase?" / "האם זו רכישת הנכס הראשונה שלך?"
  - [ ] Options:
    - [ ] "Yes" / "כן"
    - [ ] "No" / "לא"
    - [ ] "Partial ownership" / "בעלות חלקית"
    
- [ ] **Property Ownership Status Dropdown** ⚠️ (Critical for LTV calculation)
  - [ ] Label: "Property ownership status" / "סטטוס בעלות על נכס"
  - [ ] Options:
    - [ ] "I don't own any property" / "אני לא בעלים של נכס" (75% LTV)
    - [ ] "I own a property" / "אני בעלים של נכס" (50% LTV)
    - [ ] "I'm selling a property" / "אני מוכר נכס" (70% LTV)
  - [ ] Verify slider ranges update based on selection
  
- [ ] **Loan Period Slider**
  - [ ] Label: "Loan period" / "תקופת ההלוואה"
  - [ ] Units: "years" / "שנים"
  - [ ] Min/Max values display correctly
  
- [ ] **Initial Payment Input/Slider**
  - [ ] Label: "Initial payment" / "הון עצמי"
  - [ ] Percentage display updates
  - [ ] Validation based on property ownership selection
  
- [ ] **Navigation Buttons**
  - [ ] "Next" / "הבא" button
  - [ ] "Back" / "חזור" link (if applicable)
  - [ ] Step indicators (1/4)

### Step 2: Personal Details
- [ ] **Page Title**: "Personal Details" / "פרטים אישיים"
- [ ] **Privacy Notice**: Third-party data sharing notice displays

- [ ] **Name Input**
  - [ ] Label: "Full name" / "שם מלא"
  - [ ] Placeholder: "Enter full name" / "הכנס שם מלא"
  - [ ] RTL support for Hebrew names
  
- [ ] **Birth Date Picker**
  - [ ] Label: "Date of birth" / "תאריך לידה"
  - [ ] Calendar in correct language
  - [ ] Date format appropriate for locale
  
- [ ] **Education Level Dropdown**
  - [ ] Label: "Education" / "השכלה"
  - [ ] Options:
    - [ ] "High school" / "תיכונית"
    - [ ] "Professional certification" / "תעודה מקצועית"
    - [ ] "Bachelor's degree" / "תואר ראשון"
    - [ ] "Master's degree" / "תואר שני"
    - [ ] "Doctorate" / "דוקטורט"
    - [ ] "Other" / "אחר"
    
- [ ] **Citizenship Dropdown**
  - [ ] Label: "Citizenship" / "אזרחות"
  - [ ] Search functionality
  - [ ] Country names translated
  - [ ] Multiple selection support
  
- [ ] **Tax Obligations Checkbox**
  - [ ] Label and tooltip translated
  - [ ] Info icon displays tooltip on hover
  
- [ ] **Children Under 18 Dropdown**
  - [ ] Label: "Children under 18" / "ילדים מתחת לגיל 18"
  - [ ] Options: Yes/No translated
  - [ ] Conditional field for number of children
  
- [ ] **Medical Insurance Checkbox**
  - [ ] Label translated
  
- [ ] **Foreign Resident Checkbox**
  - [ ] Label and tooltip translated
  
- [ ] **Public Figure Checkbox**
  - [ ] Label and tooltip translated
  
- [ ] **Number of Borrowers Input**
  - [ ] Label: "Number of borrowers" / "מספר לווים"
  - [ ] Placeholder translated
  
- [ ] **Family Status Dropdown**
  - [ ] Label: "Family status" / "מצב משפחתי"
  - [ ] Options:
    - [ ] "Single" / "רווק/ה"
    - [ ] "Married" / "נשוי/נשואה"
    - [ ] "Divorced" / "גרוש/ה"
    - [ ] "Widowed" / "אלמן/ה"
    - [ ] "Common law" / "ידוע/ה בציבור"
    - [ ] "Separated" / "פרוד/ה"
    
- [ ] **Partner Participation Checkbox** (if married/common law)
  - [ ] Label translated
  - [ ] Conditional partner details section

### Step 3: Income & Employment
- [ ] **Page Title**: "Income & Employment Information" / "הכנסה ותעסוקה"
- [ ] **User Profile Card**: Name and phone display correctly

- [ ] **Main Source of Income Dropdown**
  - [ ] Label: "Main source of income" / "מקור הכנסה עיקרי"
  - [ ] Options:
    - [ ] "Salaried employee" / "שכיר"
    - [ ] "Self-employed" / "עצמאי"
    - [ ] "Pension" / "פנסיה"
    - [ ] "Allowances" / "קצבאות"
    - [ ] "Rental income" / "הכנסה משכירות"
    - [ ] "Other" / "אחר"
    - [ ] "No income" / "ללא הכנסה"
    
- [ ] **Conditional Fields** (based on income type)
  - [ ] Monthly income amount
  - [ ] Field of activity dropdown
  - [ ] Company name
  - [ ] Profession/Job title
  - [ ] Start date
  
- [ ] **Add Workplace Button**
  - [ ] Text: "Add workplace" / "הוסף מקום עבודה"
  - [ ] Opens modal with form
  
- [ ] **Additional Income Section**
  - [ ] Label: "Additional income" / "הכנסה נוספת"
  - [ ] Same dropdown options as main income
  - [ ] Amount field if not "No additional income"
  - [ ] "Add additional income source" button
  
- [ ] **Obligations/Debts Section**
  - [ ] Label: "Financial obligations" / "התחייבויות פיננסיות"
  - [ ] Options:
    - [ ] "No obligations" / "אין התחייבויות"
    - [ ] "Mortgage" / "משכנתא"
    - [ ] "Car loan" / "הלוואת רכב"
    - [ ] "Credit card debt" / "חוב כרטיס אשראי"
    - [ ] "Other loans" / "הלוואות אחרות"
  - [ ] "Add obligation" button
  
- [ ] **Other Borrowers Section**
  - [ ] Label: "Additional borrowers" / "לווים נוספים"
  - [ ] "Add borrower" / "הוסף לווה" button
  - [ ] Borrower cards with edit/delete options

### Step 4: Results & Bank Offers
- [ ] **Page Title**: "Mortgage Offers" / "הצעות משכנתאות"
- [ ] **Warning Message**: "The offers presented are initial..." / "ההצעות המוצגות הן ראשוניות..."

- [ ] **User Parameters Summary**
  - [ ] Property cost display
  - [ ] Initial payment amount
  - [ ] Loan period
  - [ ] User name and phone
  
- [ ] **Filter Section**
  - [ ] Title: "Filter options" / "סינון תוצאות"
  - [ ] Checkbox options translated
  
- [ ] **Bank Offers Cards**
  - [ ] Bank name displays
  - [ ] "Mortgage Registration" / "רישום משכנתא" info text
  
  - [ ] **For Each Program Type Card**:
    - [ ] "Prime Rate Mortgage" / "משכנתא בריבית פריים"
    - [ ] "Fixed Rate Mortgage" / "משכנתא בריבית קבועה"
    - [ ] "Variable Rate Mortgage" / "משכנתא בריבית משתנה"
    
    - [ ] Program details:
      - [ ] "Total amount" / "סכום כולל"
      - [ ] "Monthly payment" / "תשלום חודשי"
      - [ ] "Interest rate" / "שיעור ריבית"
      - [ ] "Repayment period" / "תקופת החזר"
      - [ ] Info icon opens modal with details
      
  - [ ] **Bank Card Footer**:
    - [ ] "Total amount" / "סכום כולל"
    - [ ] "Total repayment" / "סה״כ החזר"
    - [ ] "Monthly payment" / "תשלום חודשי"
    - [ ] "Select this bank" / "בחר בנק זה" button
    
- [ ] **No Offers Scenario**
  - [ ] "No Bank Offers Available" / "אין הצעות זמינות מהבנקים"
  - [ ] Explanation message translated

---

## 2. CREDIT CALCULATOR (אשראי)

### Step 1: Credit Details
- [ ] **Page Title**: "Credit Calculator" / "מחשבון אשראי"
- [ ] **Credit Amount Input**
  - [ ] Label: "Credit amount" / "סכום האשראי"
  - [ ] Validation messages translated
  
- [ ] **Credit Purpose Dropdown**
  - [ ] Label: "Credit purpose" / "מטרת האשראי"
  - [ ] Options:
    - [ ] "Home renovation" / "שיפוץ הבית"
    - [ ] "Vehicle purchase" / "רכישת רכב"
    - [ ] "Education" / "לימודים"
    - [ ] "Medical expenses" / "הוצאות רפואיות"
    - [ ] "Debt consolidation" / "איחוד הלוואות"
    - [ ] "Business" / "עסקי"
    - [ ] "Other" / "אחר"
    
- [ ] **Repayment Period Slider**
  - [ ] Label: "Repayment period" / "תקופת החזר"
  - [ ] Units: "months" / "חודשים"
  
- [ ] **Income Verification Dropdown**
  - [ ] Label: "Can you verify income?" / "האם תוכל להוכיח הכנסה?"
  - [ ] Options: Yes/No translated

### Step 2: Personal Details
(Similar to Mortgage Step 2 - verify all fields)

### Step 3: Income & Employment
(Similar to Mortgage Step 3 - verify all fields)

### Step 4: Credit Offers
- [ ] **Page Title**: "Credit Offers" / "הצעות אשראי"
- [ ] **Bank Cards Display**:
  - [ ] "Credit Registration" / "רישום אשראי" (instead of Mortgage Registration)
  - [ ] Program types:
    - [ ] "Prime Rate Credit" / "אשראי בריבית פריים"
    - [ ] "Fixed Rate Credit" / "אשראי בריבית קבועה"
    - [ ] "Variable Rate Credit" / "אשראי בריבית משתנה"

---

## 3. REFINANCE MORTGAGE (מחזור משכנתא)

### Step 1: Current Mortgage Details
- [ ] **Page Title**: "Mortgage Refinancing" / "מחזור משכנתא"
- [ ] **Refinancing Reason Dropdown**
  - [ ] Label: "Why refinance?" / "מדוע לבצע מחזור?"
  - [ ] Options:
    - [ ] "Lower monthly payment" / "הקטנת החזר חודשי"
    - [ ] "Shorten loan period" / "קיצור תקופת ההלוואה"
    - [ ] "Release equity" / "שחרור הון"
    - [ ] "Better interest rate" / "ריבית טובה יותר"
    - [ ] "Change loan structure" / "שינוי מבנה ההלוואה"
    
- [ ] **Current Balance Input**
  - [ ] Label: "Remaining balance" / "יתרת משכנתא"
  
- [ ] **Property Value Input**
  - [ ] Label: "Current property value" / "שווי נכס נוכחי"
  
- [ ] **Property Type Dropdown**
  (Same as Mortgage calculator)
  
- [ ] **Current Bank Dropdown**
  - [ ] Label: "Current bank" / "הבנק הנוכחי"
  - [ ] All bank names translated
  
- [ ] **Property Registration Dropdown**
  - [ ] Label: "Registered as property owner?" / "רשום כבעלים?"
  - [ ] Options: Yes/No translated
  
- [ ] **Mortgage Start Date**
  - [ ] Label: "When did you take the mortgage?" / "מתי לקחת את המשכנתא?"
  
- [ ] **Current Mortgage Details Section**
  - [ ] Title: "Enter current mortgage details" / "הזן פרטי משכנתא נוכחית"
  - [ ] Program table headers:
    - [ ] "Program" / "תוכנית"
    - [ ] "Balance" / "יתרה"
    - [ ] "End date" / "תאריך סיום"
    - [ ] "Interest rate" / "ריבית"
  - [ ] "Add program" / "הוסף תוכנית" button
  
- [ ] **Desired Refinancing Period**
  - [ ] Label: "Desired period" / "תקופה רצויה"
  
- [ ] **Current Monthly Payment**
  - [ ] Label: "Current monthly payment" / "החזר חודשי נוכחי"

### Steps 2-4
(Similar to Mortgage calculator - verify all translations with "refinance" context)

---

## 4. REFINANCE CREDIT (מחזור אשראי)

### Step 1: Current Credit Details
- [ ] **Page Title**: "Credit Refinancing" / "מחזור אשראי"
- [ ] **Current Credits Section**
  - [ ] Add multiple credit entries
  - [ ] Fields for each credit:
    - [ ] Credit type dropdown
    - [ ] Remaining balance
    - [ ] Monthly payment
    - [ ] Interest rate
    - [ ] Bank name
  
### Steps 2-4
(Similar to Credit calculator - verify all translations with "refinance" context)

---

## Common Elements Across All Processes

### Navigation & Progress
- [ ] **Step Indicators**: "Step X of 4" translated
- [ ] **Mobile Step Labels**:
  - [ ] Step 1: "Details" / "פרטים"
  - [ ] Step 2: "Personal" / "אישי"
  - [ ] Step 3: "Income" / "הכנסה"
  - [ ] Step 4: "Offers" / "הצעות"
  
### Validation Messages
- [ ] Required field: "This field is required" / "שדה חובה"
- [ ] Invalid format: "Invalid format" / "פורמט לא תקין"
- [ ] Minimum value: "Value too low" / "ערך נמוך מדי"
- [ ] Maximum value: "Value too high" / "ערך גבוה מדי"

### Modals & Popups
- [ ] **SMS Verification Modal**:
  - [ ] Title and instructions translated
  - [ ] Phone number format
  - [ ] "Send code" / "שלח קוד" button
  - [ ] "Didn't receive?" / "לא קיבלת?" link
  
- [ ] **Terms & Conditions**:
  - [ ] Links open correct language version
  - [ ] Accept checkbox text translated
  
- [ ] **Info Tooltips**:
  - [ ] All help text properly translated
  - [ ] RTL layout for Hebrew

### Accessibility
- [ ] Tab navigation works correctly
- [ ] Screen reader labels in correct language
- [ ] Focus indicators visible
- [ ] Error announcements

---

## Testing Execution Steps

1. **For Each Language (HE, EN, RU)**:
   - Clear browser cache and cookies
   - Set language from language selector
   - Verify language persists across page refreshes
   - Complete entire flow start to finish

2. **Cross-Browser Testing**:
   - Test in Chrome, Firefox, Safari
   - Verify RTL rendering in Hebrew
   - Check print layout if applicable

3. **Mobile Testing**:
   - Test responsive breakpoints
   - Verify touch interactions
   - Check dropdown behavior on mobile
   - Verify keyboard doesn't cover inputs

4. **Data Validation**:
   - Test boundary values
   - Verify calculations are consistent
   - Check that form data persists between steps
   - Verify back button retains entered data

5. **Error Scenarios**:
   - Test with invalid data
   - Test timeout scenarios
   - Test with disabled JavaScript
   - Test slow network conditions

6. **Integration Testing**:
   - Verify API calls return translated content
   - Check that bank offers calculate correctly
   - Verify SMS flow works
   - Test deep links to specific steps

---

## Bug Reporting Template

When reporting issues, include:

```markdown
**Process**: [Mortgage/Credit/Refinance Mortgage/Refinance Credit]
**Step**: [1/2/3/4]
**Language**: [HE/EN/RU]
**Browser**: [Chrome/Firefox/Safari] [Version]
**Device**: [Desktop/Mobile] [Resolution]

**Issue Description**:
[Describe what you expected vs what happened]

**Steps to Reproduce**:
1. Navigate to [URL]
2. Select [Language]
3. Fill in [Fields]
4. Click [Button]

**Screenshot**: [Attach screenshot showing the issue]

**Expected Text**: "[Expected translation]"
**Actual Text**: "[What appears instead]"

**Additional Context**:
[Any other relevant information]
```

---

## Success Criteria

- [ ] 100% of UI elements translated in all 3 languages
- [ ] No English text visible when Hebrew/Russian selected
- [ ] All dropdowns populate with translated options
- [ ] Form validation messages in correct language
- [ ] Calculations remain accurate across languages
- [ ] RTL layout correct for Hebrew
- [ ] No console errors related to translations
- [ ] All features functional in all languages

---

## Notes

- Pay special attention to the Property Ownership dropdown in Mortgage Step 1 as it affects LTV calculations
- Verify that number formatting follows locale conventions (commas, decimals)
- Check that date formats are appropriate for each language
- Ensure currency symbol (₪) displays correctly
- Test that all conditional fields appear/hide correctly based on selections
- Verify that step 4 shows appropriate offers based on user inputs
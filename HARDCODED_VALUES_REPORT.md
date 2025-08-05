# Hardcoded Values Report

Generated: 2024-01-27

## Executive Summary

This report identifies hardcoded values throughout the codebase that should be migrated to the content management system or configuration files for better maintainability and internationalization support.

## 1. Hardcoded UI Text

### 1.1 English Text in Components
- **Admin Dashboard** (`AdminDashboard.tsx`):
  - "The admin dashboard has been moved to:"
  - "The new admin panel includes improved UI, better performance, and new banking management tools."
  - "Redirecting automatically in 2 seconds..."

- **Bank Pages** (Multiple files):
  - `Leumi.tsx`: "Leumi Page"
  - `Discount.tsx`: "Discount Page" 
  - `Apoalim.tsx`: "Apoalim Page"
  - `Jerusalem.tsx`: "Jerusalem Page"
  - `Beinleumi.tsx`: "Beinleumi Page"
  - `MercantileDiscount.tsx`: "MercantileDiscount Page"

- **View Component** (`View.tsx`):
  - "Loading..."
  - "User Contact Details"
  - "ID:", "Name:", "Email:", "Contact:"
  - "Go Back" (button)

- **Interactive Map** (`InteractiveMap.tsx`):
  - "Interactive Map"
  - "Map will display bank branch locations"
  - "Available Branches:"
  - "Available Branch"

### 1.2 Hebrew Text in Components
- **Lawyers Page** (`LawyersPage.tsx`):
  - "הזינו שם מלא" (placeholder)
  - Various Hebrew UI text embedded directly

- **Bank Worker Registration** (`BankWorkerRegistrationDemo.tsx`, `BankWorkerPasswordStep.tsx`):
  - "BankIM" (brand name)

### 1.3 Russian Text
- **Registration Page** (`RegistrationPage.tsx`):
  - "Имя Фамилия" (placeholder)
  - "Пароль" (placeholder)

- **End Date Component** (`EndDate.tsx`):
  - "ДД / ММ / ГГ" (placeholder)

## 2. Hardcoded Placeholders

### Numeric Placeholders
Multiple components use "1,000,000" as placeholder:
- `FirstStepForm.tsx` (Calculate Mortgage)
- `FirstStepForm.tsx` (Calculate Credit)  
- `CreditData.tsx` (Refinance Credit - 8 instances)
- `FirstStepForm.tsx` (Refinance Mortgage)

### Contact Placeholders
- Email: "mail@mail.com", "example@email.com"
- Phone: "050-123-4567", "50 123 4567"
- Currency: "25,000 ₪"

## 3. Hardcoded URLs and API Endpoints

### 3.1 Production URLs
- `adminSlice.ts`: `https://bankdev2standalone-production.up.railway.app/api`
- `calculationService.ts`: Same production URL as fallback
- `calculationParametersApi.ts`: Same production URL as fallback

### 3.2 Development URLs
- Multiple files: `http://localhost:8003/api`
- `bankWorkerApi.ts`: Uses `process.env.REACT_APP_API_URL` with localhost fallback

### 3.3 External URLs
- `LawyersFooter.tsx`: "info@bankimonline.com" (email)

### 3.4 Relative API Endpoints
- `/api/vacancies/`
- `/api/bank-worker/register/`
- `/api/admin/invitations`
- `/api/admin/approval-queue`
- `/api/content/`

## 4. Hardcoded Screen Locations

### 4.1 Shared Components with Fixed Screen Locations
Components hardcoded to specific screen locations (violates process isolation):

- **Step 2 Components** (hardcoded to `mortgage_step2`):
  - `AdditionalCitizenships`
  - `Birthday`
  - `CitizenshipsDropdown`
  - `CountriesPayTaxes`
  - `Education`
  - `FamilyStatus`
  - `IsForeigner`
  - `MedicalInsurance`
  - `NameSurname`
  - `Taxes`
  - `HowMuchChildrens`
  - `Childrens`
  - `PartnerPayMortgage`
  - `AddPartner`
  - `Info`

- **Step 3 Components** (hardcoded to `mortgage_step3`):
  - `MainSourceOfIncome` (already updated)
  - `AdditionalIncome` (already updated)
  - `Obligation` (already updated)
  - `FieldOfActivity`

- **Step 4 Components** (hardcoded to `mortgage_step4`):
  - `MortgageParameters`
  - `PersonalProfile`
  - `Filter`

- **Other Fixed Locations**:
  - `Gender`: `personal_data_form`
  - `IDDocument`: `personal_data_form`
  - `PropertyOwnership`: `personal_data_form`
  - `DocumentIssueDate`: `personal_data_form`
  - `Address`: `personal_data_form`
  - `BankOffers`: `bank_offers`

## 5. Magic Numbers

### 5.1 Timeouts and Delays
- `bankWorkerApi.ts`: 30000ms (30 seconds) timeout
- `calculationParametersApi.ts`: keepUnusedDataFor: 300

### 5.2 Default Values
- `bankWorkerPasswordStep.tsx`: branchId: 1 (default branch)
- `bankOffersApi.ts`: children_count defaults to 1 if has children

### 5.3 UI Dimensions
- Various icon components: Default sizes (20px, 24px, 73px)
- `Ranger` components: height: 8, borderRadius: 4
- `Handle.tsx`: width: 30, height: 16
- `CurrencySelector`: height: 56px, min-width: 120px, max-height: 300px

### 5.4 Business Logic Values
- `CreditParams.tsx`: loanTermLimits { min: 4, max: 30 }
- `VideoPlayerModal.tsx`: Progress calculation logic

## 6. Console Logging

Numerous console.log statements with hardcoded messages:
- `bankOffersApi.ts`: Multiple debug logs with emojis
- `calculationService.ts`: Warning messages
- `bankWorkerApi.ts`: Error logging
- `adminSlice.ts`: Error messages

## Recommendations

### Priority 1: Critical Issues
1. **Migrate all UI text to content management system**
   - Create content keys for all hardcoded strings
   - Update components to use `useContentApi`
   
2. **Fix shared component screen location hardcoding**
   - Update all shared components to accept `screenLocation` prop
   - Follow the pattern established for `MainSourceOfIncome`

3. **Externalize API endpoints**
   - Move all API URLs to environment variables
   - Create a central API configuration file

### Priority 2: Important Improvements
1. **Replace magic numbers with named constants**
   - Create configuration files for business rules
   - Define UI dimension constants in theme files

2. **Standardize placeholder values**
   - Create a central placeholders configuration
   - Use consistent formats across the application

3. **Remove or configure console logging**
   - Use proper logging library
   - Make logging configurable by environment

### Priority 3: Nice to Have
1. **Create development-specific configuration**
   - Separate dev and prod configurations
   - Use feature flags for environment-specific behavior

2. **Implement proper error message system**
   - Centralize error messages
   - Support multi-language error messages

## Migration Strategy

1. **Phase 1**: Migrate all UI text to content management system
2. **Phase 2**: Fix shared component architecture  
3. **Phase 3**: Externalize configuration values
4. **Phase 4**: Clean up logging and debugging code

## Conclusion

The codebase contains significant hardcoded values that impact maintainability, internationalization, and flexibility. Priority should be given to migrating UI text and fixing the shared component architecture to support the content management system properly.
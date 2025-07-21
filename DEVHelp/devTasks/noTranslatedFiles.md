# Un-Migrated Screens/Components Report

This document lists all screens and components that are NOT yet migrated to the database content management system and still rely on JSON translation files.

**Generated on**: 2025-07-21

## Summary

- **Total screens in database**: 21 screens
- **Total unmigrated screens**: 13+ major screens/sections
- **Total unmigrated components**: 50+ components

## Screens Already Migrated to Database 

These screens are fully migrated and use the content API:

1. `calculate_credit_1` - 17 items (17 dropdown options)
2. `cooperation` - 41 items (10 dropdown options)
3. `home_page` - 18 items
4. `login_page` - 3 items
5. `main_page` - 10 items
6. `mortgage_calculation` - 41 items (14 dropdown options)



7. `mortgage_step1` - 1 item
8. `mortgage_step2` - 42 items (13 dropdown options)
9. `mortgage_step3` - 42 items (19 dropdown options)
10. `mortgage_step4` - 20 items (4 dropdown options)
11. `other_borrowers_step1` - 5 items
12. `other_borrowers_step2` - 1 item
13. `refinance_step1` - 34 items (17 dropdown options)
14. `refinance_step2` - 1 item
15. `refinance_step3` - 1 item
16. `sms_code_verification` - 5 items
17. `sms_verification` - 12 items
18. `temporary_franchise` - 59 items (23 dropdown options)
19. `tenders_for_brokers` - 54 items (27 dropdown options)
20. `tenders_for_lawyers` - 76 items (20 dropdown options)
21. `test_location` - 1 item

## Screens NOT Migrated to Database L

### 1. **Contacts Page** (`/pages/Contacts/Contacts.tsx`)
- **Status**: Partially migrated - uses `useContentApi('contacts')` but falls back to translations
- **Translation keys**: `contacts_*` (20+ keys)
- **Priority**: Medium - already has API integration

### 2. **About Page** (`/pages/About/About.tsx`)
- **Status**: Partially migrated - uses `useContentApi('about')` but falls back to translations
- **Translation keys**: `about_*` (15+ keys)
- **Priority**: Medium - already has API integration

### 3. **Vacancies Page** (`/pages/Vacancies/Vacancies.tsx`)
- **Status**: NOT migrated - uses direct `t()` calls
- **Translation keys**: `vacancies_*`, `vacancy_*` (25+ keys)
- **Sample keys**:
  - vacancies_title
  - vacancies_subtitle
  - vacancies_no_results
  - vacancy_salary_from
  - vacancy_employment_fulltime
- **Priority**: High - dynamic content page

### 4. **Privacy Policy Page** (`/pages/PrivacyPolicy/PrivacyPolicy.tsx`)
- **Status**: NOT migrated - uses direct `t()` calls
- **Translation keys**: `privacy_policy_*` (100+ keys)
- **Key pattern**: privacy_policy_section_1_title through privacy_policy_section_17_email
- **Priority**: High - extensive static content

### 5. **Terms Page** (`/pages/Terms/Terms.tsx`)
- **Status**: NOT migrated
- **Translation keys**: 
  - terms_title
  - terms_text
  - back
- **Priority**: High - legal content

### 6. **Refund Page** (`/pages/Refund/Refund.tsx`)
- **Status**: NOT migrated
- **Translation keys**:
  - refund_title
  - refund_text
- **Priority**: High - legal content

### 7. **Personal Cabinet Section** (`/pages/PersonalCabinet/`)
- **Status**: NOT migrated - complex multi-component section
- **Components**:
  - PersonalCabinet.tsx
  - NotificationsPage
  - TopHeader
  - Sidebar
  - SettingsPage
  - MainBorrowerPersonalDataPage
  - CoBorrowerPersonalDataPage
  - IncomeDataPage
  - CoBorrowerIncomeDataPage
  - ProgramSelectionPage
  - BankConfirmationPage
  - DocumentUploadPage
  - CreditHistoryPage
  - BankAuthorizationPage
- **Translation keys**: `pc_*`, `personal_cabinet_*` (100+ keys)
- **Priority**: Medium - complex user-facing section

### 8. **Bank Employee Registration** (`/pages/BankEmployeeRegistration/`)
- **Status**: NOT migrated
- **Components**:
  - BankEmployeeRegistration.tsx
  - RegistrationStep1
  - RegistrationStep2
  - BankSelector
  - BranchSelector
  - StepNavigation
  - TermsAgreement
  - LanguageSelector
  - SupportWidget
- **Translation keys**: `bank_employee_*`, `registration_*` (50+ keys)
- **Priority**: Low - internal feature

### 9. **Bank Worker Pages** (`/pages/BankWorker/`)
- **Status**: NOT migrated
- **Components**:
  - BankWorkerRegistration.tsx
  - BankWorkerPasswordStep.tsx
  - BankWorkerStatus.tsx
  - BankWorkerRegistrationDemo.tsx
- **Translation keys**: `bank_worker_*` (30+ keys)
- **Priority**: Low - internal feature

### 10. **Admin Pages** (`/pages/Admin/`)
- **Status**: NOT migrated
- **Components**:
  - BankWorkerManagement.tsx
- **Translation keys**: `admin_*` (20+ keys)
- **Priority**: Low - internal feature

### 11. **Broker Questionnaire** (`/pages/BrokerQuestionnaire/`)
- **Status**: NOT migrated
- **Translation keys**: `broker_*` (30+ keys)
- **Priority**: Medium - user-facing form

### 12. **Lawyer Questionnaire Success** (`/pages/LawyerQuestionnaireSuccess/`)
- **Status**: NOT migrated
- **Translation keys**: `lawyer_success_*` (10+ keys)
- **Priority**: Low - success page

## Partially Migrated Components

### Services Section Components
These components are in the Services section but still use translations:
- BankOffers
- Filter
- PersonalProfile
- MortgageParameters
- Obligation
- AdditionalIncome
- MainSourceOfIncome

## Common UI Components (Not Migrated)

1. **CookiePolicyModal** - cookie_*
2. **ChangeLanguage** - language_*
3. **ExitModule** - exit_*
4. **Calendar** - calendar_*
5. **MultiSelect** - select_*
6. **UserProfileCard** - profile_*
7. **HowItWorks** - how_it_works_*
8. **TopServices** - top_services_*

## Layout Components (Not Migrated)

1. **LoginLanguage** - login_language_*
2. **MobileMenu** - mobile_menu_*
3. **SharedNavigation** - nav_*
4. **SharedSideNavigation** - side_nav_*

## Migration Priority Recommendations

### Priority 1 - Legal/Static Content (High Impact, Easy Migration)
1. Privacy Policy (100+ keys)
2. Terms (3 keys)
3. Refund (2 keys)

### Priority 2 - User-Facing Dynamic Pages
1. Vacancies (25+ keys)
2. Broker Questionnaire (30+ keys)

### Priority 3 - Complex Sections
1. Personal Cabinet (100+ keys, multiple components)

### Priority 4 - Internal Features
1. Bank Employee Registration
2. Bank Worker Pages
3. Admin Pages

### Priority 5 - Common Components
1. UI Components
2. Layout Components

## Duplication Prevention

To prevent duplicates when migrating:

1. **Check existing database content**:
   ```sql
   SELECT screen_location, content_key FROM content_items 
   WHERE screen_location = 'TARGET_SCREEN';
   ```

2. **Use unique constraints** in migration scripts
3. **Mark migrated keys** in JSON files with "[MIGRATED TO DATABASE]"
4. **Test content API** before removing JSON fallbacks

## Next Steps

1. Create migration scripts for Priority 1 pages (Privacy, Terms, Refund)
2. Update components to use `useContentApi` hook
3. Test thoroughly before removing translation fallbacks
4. Document any special migration requirements per component
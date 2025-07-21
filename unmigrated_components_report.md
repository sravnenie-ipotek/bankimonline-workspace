# Unmigrated Components Report

This report identifies React components that still use useTranslation/t() but are NOT migrated to the database content API.

## Already Migrated Screens (Using Database)
- calculate_credit_1
- cooperation
- home_page
- login_page
- main_page
- mortgage_calculation
- mortgage_step1, mortgage_step2, mortgage_step3, mortgage_step4
- other_borrowers_step1, other_borrowers_step2
- refinance_step1, refinance_step2, refinance_step3
- sms_code_verification
- sms_verification
- temporary_franchise
- tenders_for_brokers
- tenders_for_lawyers
- test_location

## Unmigrated Components/Screens

### 1. **Contacts Page** (`/pages/Contacts/Contacts.tsx`)
- Uses `useContentApi('contacts')` but still relies on translation fallbacks
- Translation keys marked as "[MIGRATED TO DATABASE]" in JSON but component still uses them
- Key pattern: `contacts_*`
- Sample keys:
  - contacts_title
  - contacts_main_office
  - contacts_address
  - contacts_phone
  - contacts_email
  - contacts_general_questions
  - contacts_service_questions
  - contacts_tech_support
  - contacts_secretary
  - contacts_customer_service
  - etc.

### 2. **About Page** (`/pages/About/About.tsx`)
- Uses `useContentApi('about')` but still relies on translation fallbacks
- Translation keys marked as "[MIGRATED TO DATABASE]" in JSON
- Key pattern: `about_*`
- Sample keys:
  - about_title
  - about_desc
  - about_how_it_work
  - about_why_title
  - about_why_solve_problem
  - about_why_bank
  - etc.

### 3. **Vacancies Page** (`/pages/Vacancies/Vacancies.tsx`)
- Uses direct `t()` calls, NOT migrated to database
- Key pattern: `vacancies_*`, `vacancy_*`
- Sample keys:
  - vacancies_title
  - vacancies_subtitle
  - vacancies_no_results
  - vacancy_salary_from
  - vacancy_employment_fulltime
  - vacancies_category_development
  - etc.

### 4. **Refund Page** (`/pages/Refund/Refund.tsx`)
- Uses direct `t()` calls
- Keys:
  - refund_title
  - refund_text

### 5. **Terms Page** (`/pages/Terms/Terms.tsx`)
- Uses direct `t()` calls
- Keys:
  - terms_title
  - terms_text
  - back

### 6. **Privacy Policy Page** (`/pages/PrivacyPolicy/PrivacyPolicy.tsx`)
- Uses direct `t()` calls
- Extensive content with many keys
- Key pattern: `privacy_policy_*`
- Sample keys:
  - privacy_policy_title
  - privacy_policy_intro
  - privacy_policy_section_1_title through privacy_policy_section_17_email
  - Over 100+ individual section keys

### 7. **Personal Cabinet** (`/pages/PersonalCabinet/`)
Multiple components using translations:
- PersonalCabinet.tsx
- components/NotificationsPage
- components/TopHeader
- components/Sidebar
- components/SettingsPage
- components/MainBorrowerPersonalDataPage
- components/CoBorrowerPersonalDataPage
- components/IncomeDataPage
- components/CoBorrowerIncomeDataPage
- components/ProgramSelectionPage
- components/BankConfirmationPage
- components/DocumentUploadPage
- components/CreditHistoryPage
- components/BankAuthorizationPage
- Various modal components

### 8. **Bank Employee Registration** (`/pages/BankEmployeeRegistration/`)
Multiple components:
- BankEmployeeRegistration.tsx
- components/RegistrationStep1
- components/RegistrationStep2
- components/BankSelector
- components/BranchSelector
- components/StepNavigation
- components/TermsAgreement
- components/LanguageSelector
- components/SupportWidget

### 9. **Bank Worker Pages** (`/pages/BankWorker/`)
- BankWorkerRegistration.tsx
- BankWorkerPasswordStep.tsx
- BankWorkerStatus.tsx
- BankWorkerRegistrationDemo.tsx

### 10. **Admin Pages** (`/pages/Admin/`)
- BankWorkerManagement.tsx

### 11. **Broker Questionnaire** (`/pages/BrokerQuestionnaire/`)
- BrokerQuestionnaire.tsx

### 12. **Lawyer Questionnaire Success** (`/pages/LawyerQuestionnaireSuccess/`)
- LawyerQuestionnaireSuccess.tsx

### 13. **Services Components** (Partial migration)
Still using translations:
- components/BankOffers
- components/Filter
- components/PersonalProfile
- components/MortgageParameters
- Various form components (Obligation, AdditionalIncome, MainSourceOfIncome, etc.)

### 14. **Common UI Components**
- components/ui/CookiePolicyModal
- components/ui/ChangeLanguage
- components/ui/ExitModule
- components/ui/Calendar
- components/ui/MultiSelect
- components/ui/UserProfileCard
- components/ui/HowItWorks
- components/ui/TopServices
- components/ui/Swiper

### 15. **Layout Components**
- components/layout/Head/LoginLanguage
- components/layout/Sidebar/MobileMenu
- components/layout/SharedNavigation
- components/layout/SharedSideNavigation

## Translation Key Patterns

Most unmigrated components follow these patterns:
- `[component_name]_title` - Page/section titles
- `[component_name]_subtitle` - Subtitles
- `[component_name]_description` - Descriptions
- `[component_name]_button_[action]` - Button labels
- `[component_name]_label_[field]` - Form field labels
- `[component_name]_placeholder_[field]` - Input placeholders
- `[component_name]_error_[type]` - Error messages
- `[component_name]_success_[type]` - Success messages

## Recommendations

1. **Priority 1 - Static Content Pages**: Migrate Privacy Policy, Terms, Refund pages as they have extensive static content
2. **Priority 2 - Dynamic Pages**: Migrate Vacancies, Personal Cabinet as they fetch data from APIs
3. **Priority 3 - Form Components**: Migrate remaining Services components for consistency
4. **Priority 4 - UI Components**: Migrate common UI components last as they're used across the app

## Notes

- Some components (Contacts, About) already use `useContentApi` but still have translation fallbacks
- Personal Cabinet has the most complex structure with many nested components
- Privacy Policy has the most translation keys (100+)
- Many components would benefit from content API migration for easier content management
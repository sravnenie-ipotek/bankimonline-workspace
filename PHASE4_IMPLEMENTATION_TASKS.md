# Phase 4 Frontend Refactor - Implementation Tasks

## Overview
Implementing database-driven dropdowns across 15+ components with enhanced hooks, intelligent caching, and Redux/Formik integration.

## ✅ Phase 4.1: Enhanced Hooks Development

### Task 1: Upgrade useDropdownData Hook ⏳ IN PROGRESS
- [x] Analyze current implementation
- [ ] Add returnStructure='full' support
- [ ] Implement Phase 3 `/api/dropdowns/{screen}/{lang}` endpoint usage
- [ ] Add intelligent caching (5-minute TTL)
- [ ] Add error handling with fallbacks
- [ ] Support loading states for better UX

### Task 2: Create useAllDropdowns Hook
- [ ] Create bulk fetch hook for entire screen
- [ ] Implement efficient caching strategy
- [ ] Add TypeScript types
- [ ] Add error handling
- [ ] Test with multiple screens

## ✅ Phase 4.2: Component Updates (15+ files)

### Priority 1: Mortgage Step 1 Components (4 components)
- [ ] **WhenDoYouNeedMoney** (embedded in FirstStepForm.tsx) → `useDropdownData('mortgage_step1','when_needed')`
- [ ] **TypeSelect** (embedded in FirstStepForm.tsx) → `useDropdownData('mortgage_step1','type')`
- [ ] **WillBeYourFirst** (embedded in FirstStepForm.tsx) → `useDropdownData('mortgage_step1','first_home')`
- [ ] **PropertyOwnership** (embedded in FirstStepForm.tsx) → `useDropdownData('mortgage_step1','property_ownership')`

### Priority 2: Mortgage Step 2 Components (2 components)
- [ ] **EducationSelect** → `useDropdownData('mortgage_step2','education')`
- [ ] **FamilyStatusSelect** → `useDropdownData('mortgage_step2','family_status')`

### Priority 3: Mortgage Step 3 Components (4 components)
- [ ] **MainSourceSelect** → `useDropdownData('mortgage_step3','main_source')`
- [ ] **AdditionalIncomeSelect** → `useDropdownData('mortgage_step3','additional_income')`
- [ ] **DebtTypesSelect** → `useDropdownData('mortgage_step3','debt_types')`
- [ ] **BankSelect** → `useDropdownData('mortgage_step3','bank')`

### Priority 4: Other Components (5+ components)
- [ ] **RefinanceTypeSelect** → `useDropdownData('refinance_step1','type')`
- [ ] **RefinancePurposeSelect** → `useDropdownData('refinance_step1','purpose')`
- [ ] **CreditTypeSelect** → `useDropdownData('credit_step1','type')`
- [ ] **CooperationTypeSelect** → `useDropdownData('cooperation','type')`
- [ ] **FilterSelect** → `useDropdownData('mortgage_step4','filter')`

## ✅ Phase 4.3: Redux/Formik Integration

### Task 1: Update Form Initial Values
- [ ] Replace hardcoded values with API-driven descriptive values
- [ ] Update CalculateMortgageTypes interface
- [ ] Update form validation schemas

### Task 2: Update Validation Schemas
- [ ] Replace hardcoded enums with dynamic option values
- [ ] Update Yup schemas to validate against API values
- [ ] Test validation with all 3 languages

## ✅ Phase 4.4: Legacy Cleanup

### Task 1: Remove Hardcoded Arrays
- [ ] Remove WhenDoYouNeedMoneyOptions arrays
- [ ] Remove TypeSelectOptions arrays
- [ ] Remove WillBeYourFirstOptions arrays
- [ ] Remove PropertyOwnershipOptions arrays
- [ ] Remove all other hardcoded dropdown arrays

### Task 2: Remove Translation Fallbacks
- [ ] Remove getContent fallback logic for dropdown content
- [ ] Update components to rely on API data only
- [ ] Add proper error boundaries for API failures

## ✅ Quality Assurance & Testing

### Task 1: Loading States & Error Handling
- [ ] Implement skeleton loading for all dropdowns
- [ ] Add retry mechanisms for failed API calls
- [ ] Add offline fallback strategies

### Task 2: Multi-Language Testing
- [ ] Test all dropdowns in English (EN)
- [ ] Test all dropdowns in Hebrew (HE) with RTL support
- [ ] Test all dropdowns in Russian (RU)

### Task 3: Performance Testing
- [ ] Verify 5-minute cache effectiveness
- [ ] Test concurrent API calls efficiency
- [ ] Measure page load impact

## ✅ Success Criteria

### Functional Requirements ✅
- [ ] All 15+ components use database-driven dropdowns
- [ ] Loading states work correctly
- [ ] Error handling provides graceful fallbacks
- [ ] Multi-language support works in all 3 languages
- [ ] RTL display works correctly for Hebrew

### Performance Requirements ✅
- [ ] API calls cached for 5 minutes
- [ ] Page load times not negatively impacted
- [ ] Bulk fetch reduces network calls where applicable

### Maintainability Requirements ✅
- [ ] No hardcoded dropdown arrays remain
- [ ] Clear separation between content API and dropdown API
- [ ] Type safety maintained throughout
- [ ] Error boundaries prevent app crashes

## Dependencies & Blockers
- [x] Phase 3 API endpoints available and tested
- [x] Database content structure verified
- [ ] All translation keys migrated to database
- [ ] Component integration testing completed

## Estimated Timeline
- **Phase 4.1 (Hooks)**: 1 day
- **Phase 4.2 (Components)**: 2 days
- **Phase 4.3 (Redux/Formik)**: 1 day
- **Phase 4.4 (Cleanup)**: 0.5 days
- **QA & Testing**: 0.5 days
- **Total**: 5 days

## Notes
- Components are embedded in form files rather than separate files
- Need to maintain backward compatibility during transition
- Consider feature flag for gradual rollout
- Performance monitoring needed for cache effectiveness
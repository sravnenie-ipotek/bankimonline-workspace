# Implementation Plan for Missing Steps Content

## Summary

This document outlines the plan to add database content for all missing steps in the multi-step forms.

## Current Status

### ✅ Already Migrated
- `mortgage_step1`, `mortgage_step2`, `mortgage_step3`, `mortgage_step4` - All mortgage calculator steps
- `calculate_credit_1` - Credit calculator step 1
- `calculate_credit_2` - Credit calculator step 2 (via migrate_credit_step2.sql)
- `refinance_step1` - Refinance mortgage step 1

### ❌ Missing Content
- `refinance_step2`, `refinance_step3`, `refinance_step4` - Refinance mortgage steps 2-4
- `calculate_credit_3`, `calculate_credit_4` - Credit calculator steps 3-4
- `refinance_credit_step2`, `refinance_credit_step3`, `refinance_credit_step4` - All refinance credit steps 2-4

## Implementation Steps

### Step 1: Run Migration Script ✅
The migration script `migrate_missing_steps_content.sql` has been created and will:
1. Copy content from mortgage steps to corresponding screens
2. Create unique content for step 4 screens (results pages)
3. Maintain all translations in 3 languages (en, he, ru)

```bash
# Run the migration
psql $DATABASE_URL < migrations/migrate_missing_steps_content.sql

# Verify the migration
node migrations/verify_missing_content.js
```

### Step 2: Update Components to Use useContentApi

#### Components Already Using useContentApi ✅
- **Refinance Mortgage**: All steps already use `useContentApi` with correct screen locations
- **Shared Components**: All use `useContentApi('mortgage_step2')` or `useContentApi('mortgage_step3')`

#### Components Needing Updates ❌
1. **Calculate Credit Step 2-4**:
   - `/pages/Services/pages/CalculateCredit/pages/SecondStep/SecondStepForm/SecondStepForm.tsx`
   - `/pages/Services/pages/CalculateCredit/pages/ThirdStep/ThirdStepForm/ThirdStepForm.tsx`
   - `/pages/Services/pages/CalculateCredit/pages/FourthStep/FourthStepForm/FourthStepForm.tsx`

2. **Refinance Credit Step 2-4**:
   - `/pages/Services/pages/RefinanceCredit/pages/SecondStep/SecondStepForm/SecondStepForm.tsx`
   - `/pages/Services/pages/RefinanceCredit/pages/ThirdStep/ThirdStepForm/ThirdStepForm.tsx`
   - `/pages/Services/pages/RefinanceCredit/pages/FourthStep/FourthStepForm/FourthStepForm.tsx`

### Step 3: Component Update Pattern

For each component that needs updating:

```typescript
// OLD - Using translation
import { useTranslation } from 'react-i18next'
const { t } = useTranslation()
<FormCaption title={t('calculate_mortgage_step2_title')} />

// NEW - Using content API
import { useContentApi } from '@src/hooks/useContentApi'
const { getContent } = useContentApi('calculate_credit_2') // Use appropriate screen_location
<FormCaption title={getContent('calculate_mortgage_step2_title', 'calculate_mortgage_step2_title')} />
```

### Step 4: Screen Location Mapping

| Service | Step | Screen Location | Status |
|---------|------|----------------|---------|
| Calculate Credit | Step 2 | `calculate_credit_2` | Needs component update |
| Calculate Credit | Step 3 | `calculate_credit_3` | Needs component update |
| Calculate Credit | Step 4 | `calculate_credit_4` | Needs component update |
| Refinance Credit | Step 2 | `refinance_credit_step2` | Needs component update |
| Refinance Credit | Step 3 | `refinance_credit_step3` | Needs component update |
| Refinance Credit | Step 4 | `refinance_credit_step4` | Needs component update |

## Important Notes

1. **Shared Components**: The shared components (Education, FamilyStatus, etc.) will continue to use `mortgage_step2` or `mortgage_step3` as their screen location. This is intentional to avoid duplication.

2. **Content Keys**: All content keys remain the same across services (e.g., `calculate_mortgage_education_option_1`). Only the screen_location changes.

3. **Step 4 Unique Content**: Each service's step 4 has unique content:
   - Different titles (e.g., "Credit Calculation Results" vs "Mortgage Calculation Results")
   - Different warning messages appropriate to each service
   - Service-specific labels

4. **Fallback**: The `useContentApi` hook has built-in fallback to translation files, so the app will continue working even if database content is missing.

## Testing Plan

1. Run the migration script
2. Verify content exists in database using `verify_missing_content.js`
3. Test each service flow:
   - Calculate Credit: Steps 1-4
   - Refinance Mortgage: Steps 1-4
   - Refinance Credit: Steps 1-4
4. Verify all dropdowns and form fields display correctly
5. Test language switching (en/he/ru)

## Rollback Plan

If issues occur:
1. The translation files are still intact and will serve as fallback
2. Components using `t()` will continue to work
3. Components using `useContentApi` will fallback to translations automatically

## Next Steps After Migration

1. Monitor for any missing content keys in browser console
2. Add any missing content to appropriate screen locations
3. Consider creating admin interface for content management
4. Document the content structure for future developers
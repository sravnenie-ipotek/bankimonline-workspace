# Dropdown Bugs Documentation

## Bug #1: Professional Field Dropdown Empty - Screen Isolation Architecture Violation

**Date:** August 14, 2025  
**Reporter:** User  
**Status:**  RESOLVED  
**Severity:** Medium  
**Component:** ThirdStepForm (Mortgage Calculator Step 3)

### Problem Description
The Professional Field dropdown ("���� ������") appeared empty when selecting "���� ����" (employee) as the main income source on the mortgage calculator page.

**User Report:**
> "i do noot see options for: ���� ������ [...] i wolrked before!!!"

### Symptoms
- Professional Field dropdown shows no options when selecting employee income source
- Console logs show API calls to wrong endpoint: `/api/dropdowns/auto-detect/he`
- Console shows: `=
 Dropdown data for auto-detect_professional_sphere: {optionsCount: 0, hasPlaceholder: false, hasLabel: false, cacheHit: true}`
- User sees empty searchable dropdown instead of 14 professional field options

### Root Cause
**Screen Isolation Architecture Violation** - ThirdStepForm was using the default `componentsByIncomeSource` configuration instead of the screen-specific function.

```typescript
// PROBLEM - Wrong import and usage
import { componentsByIncomeSource } from '@src/pages/Services/constants/componentsByIncomeSource'

// This caused FieldOfActivity components to use 'auto-detect' as screenLocation
// Leading to API calls to: /api/dropdowns/auto-detect/he (empty dataset)
```

The codebase uses screen independence architecture where:
- Each screen (mortgage_step3, credit_step3, etc.) has isolated dropdown data
- Components must receive the correct `screenLocation` prop to call the right API endpoint
- Default configuration uses 'auto-detect' which has no data for professional fields

### Solution
**File:** `/mainapp/src/pages/Services/pages/CalculateMortgage/pages/ThirdStep/ThirdStepForm/ThirdStepForm.tsx`

Changed line 80 from default import to function call:
```typescript
// BEFORE (incorrect)
import { componentsByIncomeSource } from '@src/pages/Services/constants/componentsByIncomeSource'

// AFTER (correct)  
import { getComponentsByIncomeSource } from '@src/pages/Services/constants/componentsByIncomeSource'

// Added this line in component:
const componentsByIncomeSource = getComponentsByIncomeSource('mortgage_step3')
```

### Verification
After fix:
-  API calls correct endpoint: `/api/dropdowns/mortgage_step3/he`
-  Console shows: `=
 Dropdown data for mortgage_step3_field_of_activity: {optionsCount: 14, hasPlaceholder: true, hasLabel: false, cacheHit: true}`
-  Professional Field dropdown appears with 14 options when selecting employee income source
-  Screen isolation architecture maintained

### Prevention Guidelines

**For Developers:**
1. **Always use screen-specific components:** Call `getComponentsByIncomeSource(screenLocation)` instead of importing default `componentsByIncomeSource`
2. **Verify screen location props:** Ensure all dropdown components receive correct `screenLocation` prop
3. **Check API endpoints in console:** Verify API calls use screen-specific endpoints (e.g., `/api/dropdowns/mortgage_step3/he` not `/api/dropdowns/auto-detect/he`)
4. **Test dropdown functionality:** Always test dropdown population after selecting income source options

**Debugging Checklist:**
- [ ] Check console for dropdown API endpoint calls
- [ ] Verify `screenLocation` prop is passed to components
- [ ] Confirm screen-specific function is used: `getComponentsByIncomeSource(screenLocation)`
- [ ] Test with browser dev tools network tab to see actual API calls
- [ ] Verify dropdown data count matches expected database records

### Related Files
- `/mainapp/src/pages/Services/pages/CalculateMortgage/pages/ThirdStep/ThirdStepForm/ThirdStepForm.tsx` - Main fix location
- `/mainapp/src/pages/Services/constants/componentsByIncomeSource.tsx` - Screen-specific component configuration
- `/mainapp/src/pages/Services/components/FieldOfActivity/FieldOfActive.tsx` - Professional field dropdown component
- `/mainapp/src/hooks/useDropdownData.ts` - Dropdown data fetching hook

### Architecture Context
This bug demonstrates the importance of the **Screen Independence Architecture**:
- Each screen maintains isolated dropdown datasets
- Cross-screen contamination prevention through proper screenLocation props
- API endpoints follow pattern: `/api/dropdowns/{screenLocation}/{language}`
- Components must use screen-specific configurations to access correct data

**Similar bugs may occur in other screen forms that use dynamic components. Always verify screen-specific function usage.**

---

## Bug #2: Professional Field Dropdown Empty - Refinance Mortgage (Screen Isolation Architecture Violation)

**Date:** August 14, 2025  
**Reporter:** User  
**Status:** ✅ RESOLVED  
**Severity:** Medium  
**Component:** ThirdStepForm (Refinance Mortgage Step 3)

### Problem Description
The same Professional Field dropdown issue occurred on the refinance mortgage calculator page at `/services/refinance-mortgage/3`. Professional Field dropdown appeared empty when selecting "עובד שכיר" (employee) as the main income source.

**User Report:**
> "now http://localhost:5173/services/refinance-mortgage/3 has the same problem with תחום מקצועי drop down"

### Symptoms
- Professional Field dropdown shows no options when selecting employee income source
- Console logs show API calls to wrong endpoint: `/api/dropdowns/auto-detect/he`
- Console shows: `🔍 Dropdown data for auto-detect_field_of_activity: {optionsCount: 0, hasPlaceholder: false, hasLabel: false, cacheHit: true}`
- User sees empty searchable dropdown instead of 14 professional field options

### Root Cause
**Screen Isolation Architecture Violation** - RefinanceMortgage ThirdStepForm was using the default `componentsByIncomeSource` configuration instead of the screen-specific function.

```typescript
// PROBLEM - Wrong import and usage
import { componentsByIncomeSource } from '@src/pages/Services/constants/componentsByIncomeSource'

// This caused FieldOfActivity components to use 'auto-detect' as screenLocation
// Leading to API calls to: /api/dropdowns/auto-detect/he (empty dataset)
```

### Solution
**File:** `/mainapp/src/pages/Services/pages/RefinanceMortgage/pages/ThirdStep/ThirdStepForm/ThirdStepForm.tsx`

Applied identical fix pattern from Bug #1:
```typescript
// BEFORE (incorrect) - Line 21
import { componentsByIncomeSource } from '@src/pages/Services/constants/componentsByIncomeSource'

// AFTER (correct) - Line 21  
import { getComponentsByIncomeSource } from '@src/pages/Services/constants/componentsByIncomeSource'

// Added this line in component - Line 54:
const componentsByIncomeSource = getComponentsByIncomeSource('refinance_step3')
```

### Verification
After fix:
- ✅ API calls correct endpoint: `/api/dropdowns/refinance_step3/he`
- ✅ Console shows: `🔍 Dropdown data for refinance_step3_field_of_activity: {optionsCount: 14, hasPlaceholder: true, hasLabel: false, cacheHit: true}`
- ✅ Professional Field dropdown appears with 14 options when selecting employee income source
- ✅ Screen isolation architecture maintained

### Additional Files Fixed
- `/mainapp/src/pages/Services/pages/RefinanceMortgage/pages/ThirdStep/ThirdStepForm/ThirdStepForm.tsx` - Refinance form fix location

### Pattern Recognition
This confirms that **all multi-step form screens** must use screen-specific component configurations:
- **Mortgage Calculator**: `getComponentsByIncomeSource('mortgage_step3')` ✅
- **Refinance Mortgage**: `getComponentsByIncomeSource('refinance_step3')` ✅ 
- **Credit Calculator**: Should use `getComponentsByIncomeSource('credit_step3')` (verify if exists)

**Prevention Note:** This issue will likely recur in any screen form that uses `componentsByIncomeSource`. All developers must use `getComponentsByIncomeSource(screenLocation)` instead of the default import.
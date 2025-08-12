# 🚨 CRITICAL REGRESSION ANALYSIS - Income Source Dropdown Mapping

**Status**: CONFIRMED REGRESSION  
**Severity**: CRITICAL  
**Impact**: Credit Calculator functionality broken  
**Date**: August 12, 2025

## Executive Summary

A critical regression has been identified in the dropdown mapping logic after standardization efforts. The **Credit Calculator Step 3** is broken due to inconsistent value mapping between API responses and frontend component logic.

## The Issue

### Root Cause
The `componentsByIncomeSource` object expects **semantic keys** (`employee`, `selfemployed`, etc.), but the Credit Calculator API returns **numeric values** (`"1"`, `"2"`, `"3"`).

### Affected Systems
- ✅ **Mortgage Calculator**: WORKING (uses semantic values)
- ❌ **Credit Calculator**: BROKEN (uses numeric values)
- ❓ **Refinance Calculator**: No income source data yet

## Technical Analysis

### API Response Comparison

#### Mortgage API (✅ CORRECT)
```json
{
  "options": {
    "mortgage_step3_main_source": [
      {"value": "employee", "label": "Employee"},
      {"value": "selfemployed", "label": "Self-employed"}, 
      {"value": "pension", "label": "Pensioner"},
      {"value": "student", "label": "Student"},
      {"value": "unemployed", "label": "Unemployed"},
      {"value": "unpaid_leave", "label": "Unpaid leave"},
      {"value": "other", "label": "Other"}
    ]
  }
}
```

#### Credit API (❌ INCORRECT)
```json
{
  "options": {
    "calculate_credit_3_main_source": [
      {"value": "1", "label": "Employee"},
      {"value": "2", "label": "Self-employed"},
      {"value": "3", "label": "Business owner"},
      {"value": "4", "label": "Pension"},
      {"value": "5", "label": "Student"},
      {"value": "6", "label": "Unemployed"},
      {"value": "7", "label": "Other"}
    ]
  }
}
```

### Component Mapping Logic

The `componentsByIncomeSource` object in `/mainapp/src/pages/Services/constants/componentsByIncomeSource.tsx`:

```typescript
export const componentsByIncomeSource: ComponentsByIncomeSource = {
  employee: [/* components */],      // ✅ Matches mortgage API
  selfemployed: [/* components */],  // ✅ Matches mortgage API  
  pension: [/* components */],       // ✅ Matches mortgage API
  unemployed: [/* components */],    // ✅ Matches mortgage API
  unpaid_leave: [/* components */], // ✅ Matches mortgage API
  student: [/* components */],      // ✅ Matches mortgage API
  other: [/* components */],        // ✅ Matches mortgage API
}
```

### Impact on User Experience

When a user selects an income source in the Credit Calculator:

1. **Form Selection**: User selects "Employee" 
2. **API Value**: Form receives value `"1"`
3. **Component Lookup**: Code looks for `componentsByIncomeSource["1"]`
4. **Result**: `undefined` - no components render
5. **User Experience**: Form appears broken, no income fields show

## Evidence

### Console Debug Logs
The Credit Calculator ThirdStepForm includes comprehensive debug logging:

```typescript
console.log('🔍 Credit Step 3 - ENHANCED DEBUG:', {
  formValues: { mainSourceOfIncome, obligation },
  incomeMapping: {
    originalValue: mainSourceOfIncome,
    mappedKey: incomeSourceKey,
    hasComponents: !!componentsByIncomeSource[incomeSourceKey],
    componentsCount: componentsByIncomeSource[incomeSourceKey]?.length || 0,
    availableKeys: Object.keys(componentsByIncomeSource)
  }
})
```

Expected console output for broken Credit Calculator:
```
🔍 Credit Step 3 - ENHANCED DEBUG: {
  formValues: { mainSourceOfIncome: "1", obligation: null },
  incomeMapping: {
    originalValue: "1",
    mappedKey: "1", 
    hasComponents: false,  // ❌ BROKEN
    componentsCount: 0,    // ❌ BROKEN
    availableKeys: ["employee", "selfemployed", "pension", ...]
  }
}
```

### Screenshots
- **Mortgage Calculator**: Form loads correctly, components render after selection
- **Credit Calculator**: Form loads but income components fail to render after selection

## Immediate Testing Required

### Test Scenarios

1. **Navigate to Credit Calculator Step 3**: `http://localhost:5174/services/calculate-credit/3/`
2. **Select Income Source**: Choose "Employee" from dropdown
3. **Expected Bug**: No additional income fields render (MonthlyIncome, StartDate, etc.)
4. **Console Check**: Look for debug logs showing `hasComponents: false`

### Validation Commands

```bash
# Test Credit API (shows numeric values)
curl -s "http://localhost:8003/api/dropdowns/calculate_credit_3/en" | jq '.options.calculate_credit_3_main_source[0:3]'

# Test Mortgage API (shows semantic values)  
curl -s "http://localhost:8003/api/dropdowns/mortgage_step3/en" | jq '.options.mortgage_step3_main_source[0:3]'
```

## Solution Options

### Option 1: Fix Credit API (Recommended)
Update the database/content system to return semantic values for Credit Calculator:
- Change `"1"` → `"employee"`
- Change `"2"` → `"selfemployed"`  
- Change `"4"` → `"pension"`
- etc.

### Option 2: Add Value Mapping (Quick Fix)
Add numeric-to-semantic mapping in Credit Calculator ThirdStepForm:

```typescript
const numericToSemanticMapping = {
  "1": "employee",
  "2": "selfemployed", 
  "3": "selfemployed", // Business owner maps to selfemployed
  "4": "pension",
  "5": "student",
  "6": "unemployed", 
  "7": "other"
}

const incomeSourceKey = numericToSemanticMapping[mainSourceOfIncome] || mainSourceOfIncome
```

### Option 3: Dual Component Maps (Complex)
Create separate component maps for numeric and semantic values.

## Risk Assessment

- **User Impact**: HIGH - Credit application flow completely broken
- **Business Impact**: CRITICAL - Users cannot complete credit applications
- **Technical Debt**: MEDIUM - Inconsistent data architecture
- **Hotfix Urgency**: IMMEDIATE - Affects core user journey

## Recommended Action

1. **Immediate**: Apply Option 2 (Quick Fix) to restore functionality
2. **Short-term**: Implement Option 1 (Fix API) for consistency 
3. **Long-term**: Audit all APIs for similar inconsistencies

## Files to Review

- `/mainapp/src/pages/Services/constants/componentsByIncomeSource.tsx`
- `/mainapp/src/pages/Services/pages/CalculateCredit/pages/ThirdStep/ThirdStepForm/ThirdStepForm.tsx`
- Credit API dropdown data source in database
- Content management system mappings

---

**Next Steps**: Implement quick fix and schedule comprehensive API consistency audit.
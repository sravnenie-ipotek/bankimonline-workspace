# Other Borrowers Dropdown Fix

## Issue Description

**Problem**: In the Other Borrowers page at `http://localhost:5173/services/other-borrowers/2/?pageId=1`, when users select an option from the "מקור הכנסה עיקרי" (Main Income Source) dropdown, additional fields do not appear.

**Root Cause**: Mismatch between dropdown values and component mapping keys.

## Technical Analysis

### The Problem

1. **MainSourceOfIncome Component** returns numeric values: `'1'`, `'2'`, `'3'`, etc.
2. **componentsByIncomeSource** expects semantic keys: `'employee'`, `'selfemployed'`, `'pension'`, etc.
3. **SecondStepForm** tries to use numeric value directly: `componentsByIncomeSource['1']` → `undefined`
4. **Result**: No additional fields render

### The Fix

Added a mapping function to convert numeric dropdown values to semantic keys:

```typescript
const getIncomeSourceKey = (optionValue: string): string => {
  // If already semantic, return as-is (future-proofing)
  if (optionValue && !optionValue.match(/^\d+$/)) {
    return optionValue
  }
  
  // Numeric-to-semantic mapping for main source income dropdown
  const numericMapping: { [key: string]: string } = {
    '1': 'employee',        // שכיר - Employee
    '2': 'selfemployed',    // עצמאי - Self-employed
    '3': 'pension',         // פנסיה - Pension
    '4': 'student',         // סטודנט - Student
    '5': 'unpaid_leave',    // חופשה ללא תשלום - Unpaid leave
    '6': 'unemployed',      // ללא הכנסה - Unemployed
    '7': 'other'            // אחר - Other
  }
  return numericMapping[optionValue] || ''
}
```

## Files Modified

### 1. Main Form
- **File**: `mainapp/src/pages/Services/pages/OtherBorrowers/SecondStep/SecondStepForm/SecondStepForm.tsx`
- **Changes**: Added mapping function and updated component rendering logic

### 2. Modal Form
- **File**: `mainapp/src/pages/Services/pages/OtherBorrowers/Modals/SourceOfIncomeModal/SourceOfIncomeForm/SourceOfIncomeForm.tsx`
- **Changes**: Added mapping function and updated component rendering logic

### 3. Client Package
- **File**: `packages/client/src/pages/Services/pages/OtherBorrowers/SecondStep/SecondStepForm/SecondStepForm.tsx`
- **Changes**: Updated to use `getComponentsByIncomeSource` function and added mapping logic

## Testing

### Test Script
Run the test script to verify the mapping logic:

```bash
node test-other-borrowers-fix.js
```

### Manual Testing
1. Start development server: `npm run dev`
2. Navigate to: `http://localhost:5173/services/other-borrowers/2/?pageId=1`
3. Select an option from the "מקור הכנסה עיקרי" dropdown
4. Verify that additional fields appear based on the selection
5. Check browser console for debug logs showing the mapping process

## Expected Behavior

### Before Fix
- User selects "שכיר" (Employee) → No additional fields appear
- Console shows: `hasComponents: false, componentsCount: 0`

### After Fix
- User selects "שכיר" (Employee) → 5 additional fields appear:
  - Monthly Income
  - Start Date
  - Field of Activity
  - Company Name
  - Profession
- Console shows: `hasComponents: true, componentsCount: 5`

## Debug Logging

The fix includes comprehensive debug logging to help troubleshoot:

```javascript
console.log('OtherBorrowers SecondStep debug:', {
  originalValue: mainSourceOfIncome,    // e.g., "1"
  mappedKey: incomeSourceKey,           // e.g., "employee"
  hasComponents: !!componentsByIncomeSource[incomeSourceKey], // true/false
  componentsCount: componentsByIncomeSource[incomeSourceKey]?.length || 0
})
```

## Mapping Reference

| Dropdown Value | Hebrew Label | English Label | Semantic Key | Components |
|----------------|--------------|---------------|--------------|------------|
| `'1'` | שכיר | Employee | `'employee'` | 5 fields |
| `'2'` | עצמאי | Self-employed | `'selfemployed'` | 5 fields |
| `'3'` | פנסיה | Pension | `'pension'` | 2 fields |
| `'4'` | סטודנט | Student | `'student'` | 2 fields |
| `'5'` | חופשה ללא תשלום | Unpaid leave | `'unpaid_leave'` | 2 fields |
| `'6'` | ללא הכנסה | Unemployed | `'unemployed'` | 2 fields |
| `'7'` | אחר | Other | `'other'` | 2 fields |

## Future Considerations

1. **Database Migration**: Consider migrating to semantic values in the database to eliminate the need for mapping
2. **Consistent API**: Ensure all dropdown APIs return consistent value formats
3. **Type Safety**: Add TypeScript interfaces for the mapping to prevent runtime errors

## Related Issues

This fix addresses the same pattern that was previously fixed in:
- Mortgage Calculator Third Step
- Credit Calculator Third Step
- Refinance Calculator Third Step

The fix ensures consistency across all calculator forms.

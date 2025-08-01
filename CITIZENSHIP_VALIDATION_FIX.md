# Citizenship Multi-Select Validation Fix

## Problem
Even after selecting values in the citizenship dropdown, the validation error persisted showing "אנא בחר לפחות מדינת אזרחות אחת" (Please select at least one citizenship country).

## Root Cause
The component was converting between labels (what the user sees) and values (internal codes) which created a timing/synchronization issue with Formik validation.

## Solution
Simplified the approach by storing the labels directly instead of converting to values:

### Before (Complex):
```typescript
const handleCitizenshipChange = (selectedLabels: string[]) => {
  // Convert labels to values
  const selectedValues = selectedLabels.map(label => {
    const option = citizenshipOptions.find(opt => opt.label === label)
    return option ? option.value : label
  })
  setFieldValue('citizenshipsDropdown', selectedValues, true)
}

// And then convert back for display
const displayValues = (values.citizenshipsDropdown || []).map(value => {
  const option = citizenshipOptions.find(opt => opt.value === value)
  return option ? option.label : value
})
```

### After (Simple):
```typescript
const handleCitizenshipChange = (selectedLabels: string[]) => {
  // Store labels directly
  setFieldValue('citizenshipsDropdown', selectedLabels, true)
  setFieldTouched('citizenshipsDropdown', true, true)
}

// No conversion needed for display
const displayValues = values.citizenshipsDropdown || []
```

## Why This Works
1. **No conversion delay**: Values are stored immediately as the user sees them
2. **Validation sees the actual array**: No timing issues between conversion and validation
3. **Simpler code**: Less chance for bugs in the conversion logic

## Testing
1. Navigate to http://localhost:5173/services/calculate-mortgage/2
2. Select "כן" for additional citizenship
3. Select countries from dropdown
4. Click "החל" (Apply)
5. Validation should clear immediately

## Technical Notes
- The validation schema checks for `array.min(1)` which works with any array content
- Storing labels is acceptable since they're unique and user-facing
- This approach eliminates the complexity of value/label mapping
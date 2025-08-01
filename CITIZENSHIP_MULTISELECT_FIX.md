# Citizenship MultiSelect Dropdown Fix Report

## Problem Description
The citizenship multi-select dropdown in mortgage calculator step 2 was closing immediately when trying to select any option, preventing users from making selections.

### User Report:
> "in http://localhost:5173/services/calculate-mortgage/2 on : האם יש לך אזרחות נוספת? we choose yes, and getting nationality dropdown: this drop down multiselect has problem, when i choose any select, it closes and do not select the option"

## Root Cause Analysis

### Issue 1: Event Propagation
- The `handleClickOutside` event listener was treating clicks on checkboxes as clicks outside the dropdown
- This caused the dropdown to close immediately when trying to select an option

### Issue 2: Click Event Conflicts
- Multiple click handlers were competing (checkbox onChange, label click, item click)
- No proper event propagation stopping was in place

## Solution Implemented

### Changes Made to `/mainapp/src/components/ui/MultiSelect/MultiSelect.tsx`:

1. **Added stopPropagation to dropdown container**:
   ```tsx
   <div 
     className={cx('multiselect-select')}
     onClick={(e) => e.stopPropagation()}
   >
   ```

2. **Moved selection logic to parent div**:
   ```tsx
   <div
     className={cx('multiselect-select__item')}
     onClick={(e) => {
       e.stopPropagation()
       handleSelectItem(item)
     }}
   >
   ```

3. **Prevented checkbox/label from interfering**:
   ```tsx
   <input
     type="checkbox"
     onChange={() => {}}
     onClick={(e) => e.stopPropagation()}
   />
   <label onClick={(e) => e.stopPropagation()}>{item}</label>
   ```

4. **Added unique IDs to checkboxes** to prevent conflicts:
   ```tsx
   id={`${item}-${index}`}
   ```

## Expected Behavior After Fix

1. ✅ Clicking on a citizenship option toggles its selection without closing the dropdown
2. ✅ Multiple options can be selected in one session
3. ✅ The dropdown only closes when:
   - Clicking the "Apply" (החל) button
   - Clicking outside the dropdown area
   - Clicking the close arrow icon

4. ✅ Selected items appear as removable tags
5. ✅ Search functionality continues to work
6. ✅ Removing tags works without reopening the dropdown

## Testing

Created comprehensive Cypress test at `/mainapp/cypress/e2e/test-citizenship-multiselect.cy.ts` that verifies:
- Multiple selection capability
- Dropdown remains open during selection
- Tag removal functionality
- Search and filter functionality

## Impact

This fix applies to ALL MultiSelect components in the application, not just the citizenship dropdown. This improves the user experience across:
- Citizenship selection (mortgage step 2)
- Any other multi-select dropdowns using this component

## Verification Steps

1. Navigate to http://localhost:5173/services/calculate-mortgage/2
2. Fill in name and birthday
3. Select "כן" (Yes) for additional citizenship
4. Click on the citizenship dropdown
5. Select multiple countries - dropdown should remain open
6. Click "החל" (Apply) to confirm selections
7. Verify selected items appear as tags
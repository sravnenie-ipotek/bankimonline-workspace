# Phase 4 Component Update Guide

## Overview
This guide shows how to update dropdown components to use the new database-driven system instead of hardcoded arrays.

## 🔄 Migration Patterns

### Pattern 1: Single Component with useDropdownData Hook

**BEFORE (Hardcoded Array):**
```tsx
import { useMemo } from 'react'
import { useContentApi } from '@src/hooks/useContentApi'

const MyDropdownComponent = () => {
  const { getContent } = useContentApi('screen_location')
  
  // ❌ OLD: Hardcoded array with translation fallbacks
  const options = useMemo(() => [
    { value: 'option1', label: getContent('field_option_1', 'translation_key_1') },
    { value: 'option2', label: getContent('field_option_2', 'translation_key_2') },
    { value: 'option3', label: getContent('field_option_3', 'translation_key_3') },
  ], [getContent])

  return (
    <DropdownMenu
      title={getContent('field_title', 'translation_title')}
      data={options}
      placeholder={getContent('field_placeholder', 'translation_placeholder')}
      value={value}
      onChange={onChange}
    />
  )
}
```

**AFTER (Database-Driven):**
```tsx
import { useDropdownData } from '@src/hooks/useDropdownData'

const MyDropdownComponent = () => {
  // ✅ NEW: Use database-driven dropdown data
  const dropdownData = useDropdownData('screen_location', 'field_name', 'full')
  
  // Handle loading state
  if (dropdownData.loading) {
    return <DropdownSkeleton />
  }

  return (
    <>
      <DropdownMenu
        title={dropdownData.label}
        data={dropdownData.options}
        placeholder={dropdownData.placeholder}
        value={value}
        onChange={onChange}
        disabled={dropdownData.loading}
      />
      {dropdownData.error && (
        <Error error="Failed to load options. Please refresh the page." />
      )}
    </>
  )
}
```

### Pattern 2: Multi-Dropdown Form with useAllDropdowns Hook

**BEFORE (Multiple Hardcoded Arrays):**
```tsx
import { useMemo } from 'react'
import { useContentApi } from '@src/hooks/useContentApi'

const MyFormComponent = () => {
  const { getContent } = useContentApi('screen_location')
  
  // ❌ OLD: Multiple hardcoded arrays
  const field1Options = useMemo(() => [...], [getContent])
  const field2Options = useMemo(() => [...], [getContent])
  const field3Options = useMemo(() => [...], [getContent])

  return (
    <Form>
      <DropdownMenu data={field1Options} ... />
      <DropdownMenu data={field2Options} ... />
      <DropdownMenu data={field3Options} ... />
    </Form>
  )
}
```

**AFTER (Bulk Database-Driven):**
```tsx
import { useAllDropdowns } from '@src/hooks/useDropdownData'

const MyFormComponent = () => {
  // ✅ NEW: Bulk fetch all dropdowns for the screen
  const { data, loading, error, getDropdownProps } = useAllDropdowns('screen_location')
  
  // Get individual dropdown props
  const field1Props = getDropdownProps('field1')
  const field2Props = getDropdownProps('field2')
  const field3Props = getDropdownProps('field3')

  return (
    <Form>
      <DropdownMenu
        title={field1Props.label}
        data={field1Props.options}
        placeholder={field1Props.placeholder}
        disabled={loading}
        ...
      />
      <DropdownMenu
        title={field2Props.label}
        data={field2Props.options}
        placeholder={field2Props.placeholder}
        disabled={loading}
        ...
      />
      <DropdownMenu
        title={field3Props.label}
        data={field3Props.options}
        placeholder={field3Props.placeholder}
        disabled={loading}
        ...
      />
      {error && <Error error="Failed to load dropdown data." />}
    </Form>
  )
}
```

## 🗂️ Screen Location Mapping

| Component Context | Screen Location | Field Names |
|-------------------|----------------|-------------|
| Mortgage Step 1 | `mortgage_step1` | `when_needed`, `type`, `first_home`, `property_ownership` |
| Mortgage Step 2 | `mortgage_step2` | `education`, `family_status`, `citizenship` |
| Mortgage Step 3 | `mortgage_step3` | `main_source`, `additional_income`, `debt_types`, `bank` |
| Mortgage Step 4 | `mortgage_step4` | `filter` |
| Refinance Step 1 | `refinance_step1` | `type`, `purpose`, `bank`, `property_type` |
| Credit Step 1 | `credit_step1` | `type`, `purpose` |
| Cooperation | `cooperation` | `type` |

## 🔧 Implementation Checklist

For each component:
- [ ] Import new hooks: `useDropdownData` or `useAllDropdowns`
- [ ] Replace hardcoded arrays with hook calls
- [ ] Add loading state handling (`disabled={loading}`)
- [ ] Add error handling with user-friendly messages
- [ ] Update props to use database values (label, placeholder, options)
- [ ] Add TypeScript types if needed
- [ ] Test with all 3 languages (EN/HE/RU)
- [ ] Remove old translation fallback logic
- [ ] Remove unused imports and variables

## 📝 Examples from FirstStepForm.tsx

**✅ Successfully Updated Example:**
```tsx
// Phase 4: Use bulk dropdown fetching for better performance
const { data: dropdownData, loading: dropdownsLoading, error: dropdownsError, getDropdownProps } = useAllDropdowns('mortgage_step1')

// Phase 4: Get dropdown data from database instead of hardcoded arrays
const whenNeededProps = getDropdownProps('when_needed')
const typeProps = getDropdownProps('type') 
const firstHomeProps = getDropdownProps('first_home')
const propertyOwnershipProps = getDropdownProps('property_ownership')

// Usage in component:
<DropdownMenu
  title={whenNeededProps.label || fallbackTitle}
  data={whenNeededProps.options}
  placeholder={whenNeededProps.placeholder || fallbackPlaceholder}
  value={values.whenDoYouNeedMoney}
  onChange={(value) => setFieldValue('whenDoYouNeedMoney', value)}
  onBlur={() => setFieldTouched('whenDoYouNeedMoney', true)}
  error={touched.whenDoYouNeedMoney && errors.whenDoYouNeedMoney}
  dataTestId="when-needed-dropdown"
  disabled={dropdownsLoading}
/>
{dropdownsError && (
  <Error error="Failed to load options. Please refresh the page." />
)}
```

## 🚨 Common Pitfalls to Avoid

1. **Don't remove fallbacks completely** - Keep translation fallbacks for backwards compatibility
2. **Handle loading states** - Always disable dropdowns while loading
3. **Test error scenarios** - Ensure graceful degradation when API fails
4. **Preserve existing functionality** - Maintain all current props and behaviors
5. **Update TypeScript types** - Ensure type safety with new data structures
6. **Test multi-language** - Verify all 3 languages work correctly
7. **Performance considerations** - Use `useAllDropdowns` for forms with multiple dropdowns

## 🎯 Key Benefits Achieved

1. **Dynamic Content**: Dropdown options can be updated via admin panel without code changes
2. **Performance**: 5-minute caching reduces API calls and improves response times
3. **Multi-Language**: Automatic language switching with proper RTL support
4. **Consistency**: Standardized approach across all dropdown components
5. **Maintainability**: Centralized dropdown logic and error handling
6. **User Experience**: Loading states and error messages improve UX
7. **Scalability**: Easy to add new dropdowns or modify existing ones

## 🔍 Testing & Validation

### Manual Testing Checklist:
- [ ] Dropdown loads correctly in English
- [ ] Dropdown loads correctly in Hebrew (RTL)
- [ ] Dropdown loads correctly in Russian
- [ ] Loading state displays during API calls
- [ ] Error state displays when API fails
- [ ] Caching works (subsequent loads are faster)
- [ ] Form validation works with new option values
- [ ] All existing functionality preserved

### Automated Testing:
- [ ] Unit tests for hook functionality
- [ ] Integration tests for component behavior
- [ ] E2E tests for full user workflow
- [ ] Performance tests for caching effectiveness

## 📊 Progress Tracking

**Completed**: 4/15+ components
- ✅ Mortgage Step 1: WhenDoYouNeedMoney, TypeSelect, WillBeYourFirst, PropertyOwnership

**Remaining**: 11+ components
- ⏳ Mortgage Step 2: Education, FamilyStatus
- ⏳ Mortgage Step 3: MainSource, AdditionalIncome, DebtTypes, Bank
- ⏳ Other: Refinance, Credit, Cooperation, Filter components
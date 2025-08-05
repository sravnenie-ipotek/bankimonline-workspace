# React Component Updates for mortgage_step1

After copying the dropdowns to mortgage_step1, update these files:

## 1. FirstStep.tsx
**File**: `/mainapp/src/pages/Services/pages/CalculateMortgage/pages/FirstStep/FirstStep.tsx`
**Line 64**: Change:
```typescript
const { getContent } = useContentApi('mortgage_calculation')
```
To:
```typescript
const { getContent } = useContentApi('mortgage_step1')
```

## 2. FirstStepForm.tsx
**File**: `/mainapp/src/pages/Services/pages/CalculateMortgage/pages/FirstStep/FirstStepForm/FirstStepForm.tsx`
**Line 29**: Change:
```typescript
const { getContent } = useContentApi('mortgage_calculation')
```
To:
```typescript
const { getContent } = useContentApi('mortgage_step1')
```

## 3. Update Content Keys in FirstStepForm.tsx
Also update all the content key references from:
- `mortgage_calculation.field.*` → `mortgage_step1.field.*`

For example:
```typescript
// Old
getContent('mortgage_calculation.field.city', 'calculate_mortgage_city')

// New
getContent('mortgage_step1.field.city', 'calculate_mortgage_city')
```

## Content Keys to Update:
- `mortgage_calculation.field.city` → `mortgage_step1.field.city`
- `mortgage_calculation.field.city_ph` → `mortgage_step1.field.city_ph`
- `mortgage_calculation.field.when_needed` → `mortgage_step1.field.when_needed`
- `mortgage_calculation.field.when_needed_option_*` → `mortgage_step1.field.when_needed_option_*`
- `mortgage_calculation.field.type` → `mortgage_step1.field.type`
- `mortgage_calculation.field.type_option_*` → `mortgage_step1.field.type_option_*`
- `mortgage_calculation.field.first_home` → `mortgage_step1.field.first_home`
- `mortgage_calculation.field.first_home_option_*` → `mortgage_step1.field.first_home_option_*`
- `mortgage_calculation.field.property_ownership` → `mortgage_step1.field.property_ownership`
- `mortgage_calculation.field.property_ownership_option_*` → `mortgage_step1.field.property_ownership_option_*`
- `mortgage_calculation.header.title` → `mortgage_step1.header.title`

## Testing After Changes:
1. Check that all 5 dropdowns appear in the admin panel under mortgage_step1
2. Verify the frontend still displays all dropdowns correctly
3. Test that dropdown selections work properly
4. Ensure translations appear in all languages
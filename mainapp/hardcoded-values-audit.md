# Hardcoded Values Audit Report

This report identifies hardcoded values in the codebase that should be stored in the database for better maintainability and configurability.

## 1. Property Ownership Options (Business Critical)

### Location: `/mainapp/src/pages/Services/pages/CalculateMortgage/pages/FirstStep/FirstStepForm/FirstStepForm.tsx`

```typescript
// Lines 131-134
const PropertyOwnershipOptions = useMemo(() => [
  { value: 'no_property', label: t('calculate_mortgage_property_ownership_option_1') },      // 75% financing
  { value: 'has_property', label: t('calculate_mortgage_property_ownership_option_2') },     // 50% financing  
  { value: 'selling_property', label: t('calculate_mortgage_property_ownership_option_3') }, // 70% financing
], [t])
```

**Issue**: While the labels are in translations, the values and associated LTV ratios are hardcoded.

**Business Impact**: High - These values directly affect loan calculations and are referenced in business rules documentation.

**Recommendation**: Create a `property_ownership_options` table with fields:
- `id`
- `value` (e.g., 'no_property')
- `ltv_ratio` (e.g., 75)
- `display_order`
- `is_active`

### LTV Ratios Fallback Values
```typescript
// Lines 94-98
setLtvRatios({
  no_property: 0.75,
  has_property: 0.50,
  selling_property: 0.70
})
```

**Issue**: Emergency fallback values are hardcoded when API/database fails.

## 2. Phone Country Codes

### Location: `/mainapp/src/pages/PersonalCabinet/components/modals/ChangePhoneModal/ChangePhoneModal.tsx`

```typescript
// Lines 121-125
<option value="+972">🇮🇱 +972</option>
<option value="+1">🇺🇸 +1</option>
<option value="+7">🇷🇺 +7</option>
<option value="+44">🇬🇧 +44</option>
<option value="+49">🇩🇪 +49</option>
```

**Issue**: Phone country codes are hardcoded in the UI.

**Business Impact**: Medium - Adding new countries requires code changes.

**Recommendation**: Create a `country_codes` table:
- `id`
- `country_code` (e.g., 'IL')
- `phone_code` (e.g., '+972')
- `country_name_key` (translation key)
- `flag_emoji`
- `display_order`
- `is_active`

## 3. Relationship Types

### Location: `/mainapp/src/pages/PersonalCabinet/components/CoBorrowerPersonalDataPage/CoBorrowerPersonalDataPage.tsx`

```typescript
// Lines 299-307
<option value="">{ t('select_relationship', 'Выберите отношение') }</option>
<option value="spouse">{ t('spouse', 'Супруг/супруга') }</option>
<option value="parent">{ t('parent', 'Родитель') }</option>
<option value="child">{ t('child', 'Ребенок') }</option>
<option value="sibling">{ t('sibling', 'Брат/сестра') }</option>
<option value="relative">{ t('relative', 'Родственник') }</option>
<option value="friend">{ t('friend', 'Друг') }</option>
<option value="business_partner">{ t('business_partner', 'Деловой партнер') }</option>
<option value="other">{ t('other', 'Другое') }</option>
```

**Issue**: Relationship types are hardcoded in multiple locations.

**Business Impact**: Medium - Legal/regulatory changes may require adding/removing relationship types.

**Recommendation**: Create a `relationship_types` table:
- `id`
- `value`
- `translation_key`
- `category` (family/business/other)
- `display_order`
- `is_active`

## 4. Family Status Options

### Location: `/mainapp/src/pages/PersonalCabinet/components/CoBorrowerPersonalDataPage/CoBorrowerPersonalDataPage.tsx`

```typescript
// Lines 331-337
<option value="single">{ t('single', 'Холост/не замужем') }</option>
<option value="married">{ t('married', 'Женат/замужем') }</option>
<option value="divorced">{ t('divorced', 'Разведен(а)') }</option>
<option value="widowed">{ t('widowed', 'Вдовец/вдова') }</option>
<option value="civil_union">{ t('civil_union', 'Гражданский брак') }</option>
```

**Issue**: Marital status options are hardcoded.

**Business Impact**: Medium - Legal definitions may change by jurisdiction.

**Recommendation**: Create a `marital_status_options` table:
- `id`
- `value`
- `translation_key`
- `affects_co_borrower` (boolean)
- `display_order`
- `is_active`

## 5. URLs and API Endpoints

### Location: `/mainapp/src/services/api.ts`

```typescript
// Lines 7-11
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
  return 'http://localhost:8003/api'
}
return import.meta.env.VITE_NODE_API_BASE_URL || 'https://bankdev2standalone-production.up.railway.app/api'
```

**Issue**: Production URLs are hardcoded as fallbacks.

**Business Impact**: Low - But makes environment management more difficult.

**Recommendation**: Store in environment configuration table:
- `environment_name`
- `api_base_url`
- `is_active`

## 6. Default Interest Rate

### Location: `/mainapp/src/services/bankOffersApi.ts`

```typescript
// Line 228
property_ownership: parameters.propertyOwnership || 'no_property', // Default to 75% financing
```

**Issue**: Default property ownership value implies 75% financing.

**Business Impact**: High - Affects default calculations.

**Recommendation**: Store defaults in `system_parameters` table (already exists).

## 7. Mortgage Program Conditions

### Location: `/mainapp/src/pages/PersonalCabinet/components/BankConfirmationPage/BankConfirmationPage.tsx`

```typescript
// Lines 96, 106
conditionFinance: t('up_to_70_percent', 'До 70%'),
conditionFinance: t('up_to_75_percent', 'До 75%'),
```

**Issue**: Financing percentages are hardcoded in UI.

**Business Impact**: High - These are business rules that may change.

**Recommendation**: Store in `mortgage_programs` table with:
- `program_id`
- `max_ltv_ratio`
- `min_term_years`
- `max_term_years`
- `rate_type`

## 8. Validation Rules

### Location: Various form validation files

**Issue**: Business validation rules (like minimum down payments, age limits) are scattered in code.

**Business Impact**: High - Regulatory changes require code updates.

**Recommendation**: Create a `validation_rules` table:
- `rule_name`
- `rule_type` (min/max/regex)
- `rule_value`
- `error_message_key`
- `applies_to_field`
- `is_active`

## Summary of Recommendations

1. **Create New Database Tables**:
   - `property_ownership_options` (critical)
   - `country_codes`
   - `relationship_types`
   - `marital_status_options`
   - `validation_rules`

2. **Utilize Existing Tables**:
   - Use `params` table for system-wide defaults
   - Extend `mortgage_programs` for program-specific rules
   - Use `locales` table consistently for all user-facing text

3. **Migration Strategy**:
   - Phase 1: Create database tables and APIs
   - Phase 2: Update components to fetch from APIs
   - Phase 3: Remove hardcoded values
   - Phase 4: Add admin interface for management

4. **Priority Order**:
   1. Property ownership options (affects calculations)
   2. Validation rules (regulatory compliance)
   3. Dropdown options (user experience)
   4. URLs/endpoints (deployment flexibility)

## Next Steps

1. Design database schema for new tables
2. Create migration scripts
3. Build APIs to serve this data
4. Update components to use dynamic data
5. Add caching layer for performance
6. Create admin interface for managing these values
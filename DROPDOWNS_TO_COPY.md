# Dropdowns to Copy from mortgage_calculation to mortgage_step1

## 1. City Dropdown (עיר בא נמצא הנכס)
- **Title**: `mortgage_calculation.field.city` → `mortgage_step1.field.city`
- **Placeholder**: `mortgage_calculation.field.city_ph` → `mortgage_step1.field.city_ph`
- **Type**: Dynamic dropdown (populated from /api/get-cities)
- **Hebrew Text**: "עיר בא נמצא הנכס??"

## 2. When Needed Dropdown (מתי תזדקק למשכנתא)
- **Title**: `mortgage_calculation.field.when_needed` → `mortgage_step1.field.when_needed`
- **Placeholder**: `mortgage_calculation.field.when_needed_ph` → `mortgage_step1.field.when_needed_ph`
- **Options to copy**:
  - `mortgage_calculation.field.when_needed_option_1` → "תוך 3 חודשים"
  - `mortgage_calculation.field.when_needed_option_2` → "תוך 3-6 חודשים"
  - `mortgage_calculation.field.when_needed_option_3` → "תוך 6-12 חודשים"
  - `mortgage_calculation.field.when_needed_option_4` → "מעל 12 חודשים"

## 3. Property Type Dropdown (סוג משכנתא)
- **Title**: `mortgage_calculation.field.type` → `mortgage_step1.field.type`
- **Placeholder**: `mortgage_calculation.field.type_ph` → `mortgage_step1.field.type_ph`
- **Options to copy**:
  - `mortgage_calculation.field.type_option_1` → "דירה"
  - `mortgage_calculation.field.type_option_2` → "בית פרטי"
  - `mortgage_calculation.field.type_option_3` → "דירת גן"
  - `mortgage_calculation.field.type_option_4` → "פנטהאוס"

## 4. First Home Dropdown (האם מדובר בדירה ראשונה)
- **Title**: `mortgage_calculation.field.first_home` → `mortgage_step1.field.first_home`
- **Placeholder**: `mortgage_calculation.field.first_home_ph` → `mortgage_step1.field.first_home_ph`
- **Options to copy**:
  - `mortgage_calculation.field.first_home_option_1` → "כן, דירה ראשונה"
  - `mortgage_calculation.field.first_home_option_2` → "לא, נכס נוסף"
  - `mortgage_calculation.field.first_home_option_3` → "נכס ל השקעה"

## 5. Property Ownership Dropdown (סטטוס בעלות על נכס)
- **Title**: `mortgage_calculation.field.property_ownership` → `mortgage_step1.field.property_ownership`
- **Placeholder**: `mortgage_calculation.field.property_ownership_ph` → `mortgage_step1.field.property_ownership_ph`
- **Options to copy**:
  - `mortgage_calculation.field.property_ownership_option_1` → "אני לא בעלים של נכס" (75% LTV)
  - `mortgage_calculation.field.property_ownership_option_2` → "אני בעלים של נכס" (50% LTV)
  - `mortgage_calculation.field.property_ownership_option_3` → "אני מוכר נכס" (70% LTV)

## Total Items to Copy:
- **5 dropdown titles**
- **5 dropdown placeholders** 
- **17 dropdown options** (4 + 4 + 3 + 3 + 3)
- **Total: 27 content items**

## Each item includes:
- All translations (Hebrew, English, Russian)
- Component type (dropdown, option, placeholder)
- Parent-child relationships
- Validation rules and metadata
- Active status and permissions
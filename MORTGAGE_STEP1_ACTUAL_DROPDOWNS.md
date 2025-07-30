# MORTGAGE CALCULATOR STEP 1 - ACTUAL DROPDOWNS

## URL: http://localhost:5173/services/calculate-mortgage/1

Based on the React code analysis, here are the **5 dropdowns** that appear on the mortgage calculator step 1:

### 1. City Selection (cityWhereYouBuy)
- **Title**: From content key `mortgage_calculation.field.city`
- **Placeholder**: From content key `mortgage_calculation.field.city_ph`
- **Type**: Searchable dropdown with dynamic city list from API
- **API**: Fetches from `/api/get-cities?lang=${language}`

### 2. When Do You Need Money (whenDoYouNeedMoney)
- **Title**: From content key `mortgage_calculation.field.when_needed`
- **Options**: 
  1. Within 3 months (mortgage_calculation.field.when_needed_option_1)
  2. Within 3-6 months (mortgage_calculation.field.when_needed_option_2)
  3. Within 6-12 months (mortgage_calculation.field.when_needed_option_3)
  4. Over 12 months (mortgage_calculation.field.when_needed_option_4)

### 3. Property Type (typeSelect)
- **Title**: From content key `mortgage_calculation.field.type`
- **Options**:
  1. Option 1 (mortgage_calculation.field.type_option_1)
  2. Option 2 (mortgage_calculation.field.type_option_2)
  3. Option 3 (mortgage_calculation.field.type_option_3)
  4. Option 4 (mortgage_calculation.field.type_option_4)

### 4. First Home Status (willBeYourFirst)
- **Title**: From content key `mortgage_calculation.field.first_home`
- **Options**:
  1. Yes, first home (mortgage_calculation.field.first_home_option_1)
  2. No, additional property (mortgage_calculation.field.first_home_option_2)
  3. Investment property (mortgage_calculation.field.first_home_option_3)

### 5. Property Ownership Status (propertyOwnership)
- **Title**: From content key `mortgage_calculation.field.property_ownership`
- **Options**:
  1. No property - 75% LTV (mortgage_calculation.field.property_ownership_option_1)
  2. Has property - 50% LTV (mortgage_calculation.field.property_ownership_option_2)
  3. Selling property - 70% LTV (mortgage_calculation.field.property_ownership_option_3)

## Additional Form Elements (Not Dropdowns):
- Property Price (FormattedInput)
- Initial Fee/Down Payment (SliderInput)
- Credit Parameters section

## Key Findings:

1. **Content Location**: All content is fetched from `mortgage_calculation` screen location, NOT from `mortgage_step1`
2. **useContentApi Hook**: The component uses `useContentApi('mortgage_calculation')` to fetch all content
3. **Dynamic Content**: City dropdown is populated dynamically from API, others use content from database
4. **LTV Ratios**: Property ownership dropdown affects loan-to-value ratios (75%, 50%, 70%) fetched from `/api/v1/calculation-parameters`

## Database Mismatch Explanation:

The reason `mortgage_step1` shows only 1 dropdown in the database report is because:
- The React code uses `mortgage_calculation` as the screen location
- The database has most content under `mortgage_calculation` (112 dropdown options)
- Only 1 item exists under `mortgage_step1` (which appears to be incorrectly placed there)

The application works correctly because it's looking in the right place (`mortgage_calculation`), but the database organization doesn't match the URL structure.
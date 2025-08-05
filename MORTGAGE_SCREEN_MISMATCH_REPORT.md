# MORTGAGE SCREEN LOCATION MISMATCH ANALYSIS

Generated: 2025-07-29T20:57:34.724Z

## PROBLEM SUMMARY

- **URL**: http://localhost:5173/services/calculate-mortgage/1
- **Issue**: The page expects multiple dropdowns but database has them in wrong screen_location
- **mortgage_step1**: Only 0 dropdown options found
- **mortgage_calculation**: Contains 71 dropdown options that likely belong to step 1

## ROOT CAUSE

The content migration appears to have placed all mortgage calculator dropdowns under `mortgage_calculation` instead of distributing them across `mortgage_step1`, `mortgage_step2`, etc.

## RECOMMENDED FIXES

1. **Option A**: Update the React components to look for content in `mortgage_calculation` screen
2. **Option B**: Migrate the content to the correct `mortgage_step1` screen_location
3. **Option C**: Create a mapping table between URLs and screen_locations

## AFFECTED DROPDOWNS

The following dropdowns should be on step 1 but are in `mortgage_calculation`:
- Property Ownership Status
- Property Type
- City/Location
- First Home Status
- When Needed (Timeline)
- Initial Payment

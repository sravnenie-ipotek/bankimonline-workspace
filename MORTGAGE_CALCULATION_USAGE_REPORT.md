# MORTGAGE_CALCULATION USAGE REPORT

## Direct Usage in React Components

Based on the codebase search, only the following components use `useContentApi('mortgage_calculation')`:

### 1. CalculateMortgage.tsx (Main Component)
- **Path**: `/mainapp/src/pages/Services/pages/CalculateMortgage/CalculateMortgage.tsx`
- **Usage**: Line 18: `const { getContent } = useContentApi('mortgage_calculation')`
- **Purpose**: Main container component for the mortgage calculator

### 2. FirstStep.tsx
- **Path**: `/mainapp/src/pages/Services/pages/CalculateMortgage/pages/FirstStep/FirstStep.tsx`
- **Usage**: Line 64: `const { getContent } = useContentApi('mortgage_calculation')`
- **Purpose**: First step of the mortgage calculator

### 3. FirstStepForm.tsx
- **Path**: `/mainapp/src/pages/Services/pages/CalculateMortgage/pages/FirstStep/FirstStepForm/FirstStepForm.tsx`
- **Usage**: Line 29: `const { getContent } = useContentApi('mortgage_calculation')`
- **Purpose**: Form component for the first step

## Content Analysis

The `mortgage_calculation` screen location contains **161 items** that serve ALL 4 steps of the mortgage calculator:

### Content Distribution by Step:
- **Step 1**: 54 items (property details, dropdowns for city, when needed, type, etc.)
- **Step 2**: 18 items (personal information fields)
- **Step 3**: 43 items (income and employment data)
- **Step 4**: 4 items (bank offer filtering)
- **Shared**: 14 items (headers, buttons, help text)
- **Generic**: 33 items (app-wide content that may not belong here)

### Content Types:
- **Options**: 71 (dropdown choices)
- **Dropdowns**: 41 (dropdown fields)
- **Text**: 19 (labels and descriptions)
- **Placeholders**: 17
- **Headers**: 4
- **Other**: 9 (help text, hints, buttons)

## The Problem

### URL vs Database Mismatch:
- **URL Structure**: `/services/calculate-mortgage/1` suggests content should be in `mortgage_step1`
- **Database Reality**: All content is in `mortgage_calculation`
- **Admin Panel Issue**: When editing `mortgage_step1` in the admin panel, you can't see the dropdowns because they're stored under `mortgage_calculation`

### Current State:
- `mortgage_step1` has only 1 dropdown
- `mortgage_calculation` has 112 dropdown options (including all 5 dropdowns shown on step 1)

## Recommended Solution

### Option 1: Reorganize Content by Steps (RECOMMENDED)
1. **Create new screen locations**:
   - `mortgage_step1` - Property and loan details
   - `mortgage_step2` - Personal information
   - `mortgage_step3` - Income and employment
   - `mortgage_step4` - Bank offers
   - `mortgage_shared` - Common elements

2. **Migrate content** from `mortgage_calculation` to appropriate steps using SQL:
   ```sql
   -- Example: Move step 1 content
   UPDATE content_items 
   SET screen_location = 'mortgage_step1'
   WHERE screen_location = 'mortgage_calculation'
   AND (content_key LIKE '%property_price%' 
      OR content_key LIKE '%city%'
      OR content_key LIKE '%when_needed%'
      OR content_key LIKE '%type%'
      OR content_key LIKE '%first_home%'
      OR content_key LIKE '%property_ownership%');
   ```

3. **Update React components** to use step-specific screen locations:
   ```typescript
   // In FirstStep.tsx and FirstStepForm.tsx
   const { getContent } = useContentApi('mortgage_step1')  // Changed from 'mortgage_calculation'
   ```

### Option 2: Update Admin Panel (Alternative)
- Modify the admin panel to show content from `mortgage_calculation` when editing `mortgage_step1`
- Add a mapping table or configuration that links URL patterns to screen locations

### Option 3: Keep Current Structure (Not Recommended)
- Continue using `mortgage_calculation` for all steps
- Accept the admin panel limitation

## Impact Analysis

### Who needs to be updated if we reorganize:
1. **React Components** (3 files currently using `mortgage_calculation`):
   - CalculateMortgage.tsx → Use appropriate step screen location
   - FirstStep.tsx → Use `mortgage_step1`
   - FirstStepForm.tsx → Use `mortgage_step1`
   - SecondStep components → Use `mortgage_step2` (when they start using content API)
   - ThirdStep components → Use `mortgage_step3` (when they start using content API)
   - FourthStep components → Use `mortgage_step4` (when they start using content API)

2. **Database Migration**:
   - Move 161 content items to appropriate screen locations
   - Update any stored procedures or views that reference `mortgage_calculation`

3. **Admin Panel**:
   - No changes needed if content is properly organized

## Benefits of Reorganization

1. **Better Organization**: Content grouped by actual usage
2. **Admin Panel UX**: Content appears where expected based on URL
3. **Maintainability**: Easier to find and update content
4. **Scalability**: Each step can grow independently
5. **Performance**: Smaller content fetches per step

## Next Steps

1. **Decision**: Choose reorganization approach
2. **Backup**: Create database backup before migration
3. **Migration Script**: Create SQL script to move content
4. **Update React**: Modify components to use new screen locations
5. **Testing**: Verify all content displays correctly
6. **Deploy**: Roll out changes with proper monitoring
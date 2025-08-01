# Common Dropdown Bugs and Solutions

## Problem: Dropdown Shows No Values (Empty Options List)

### Symptoms:
- Dropdown opens but displays no options
- Console shows `optionsCount: 0` in API response
- Placeholder text is visible but no selectable options
- Example: Citizenship dropdown showing "��� ������" (Select Citizenship) but no country options

### Root Cause:
Missing database content - no dropdown options exist in the `content_items` table for the specific field.

### How We Solved It Previously:

#### Step 1: Diagnose the Problem
1. Check browser console for API calls to `/api/dropdowns/{screen}/{lang}`
2. Look for log message showing `optionsCount: 0`
3. Identify which dropdown field is affected (e.g., `citizenship`, `debt_types`, etc.)

#### Step 2: Check Database Content
Query the database to verify if content exists:
```sql
-- Check if dropdown container exists
SELECT * FROM content_items 
WHERE screen_location = 'mortgage_step2' 
AND content_key LIKE '%citizenship%'
AND component_type IN ('dropdown', 'option');

-- Check if translations exist
SELECT ci.content_key, ci.component_type, ct.language_code, ct.content_value 
FROM content_items ci
JOIN content_translations ct ON ci.id = ct.content_item_id
WHERE ci.content_key LIKE '%citizenship%' 
AND ct.status = 'approved';
```

#### Step 3: Create Migration Script
If content is missing, create SQL migration to add it:
```sql
-- Example: Adding citizenship dropdown options
-- Add dropdown container
INSERT INTO content_items (content_key, component_type, screen_location, category, is_active)
VALUES ('mortgage_step2_citizenship', 'dropdown', 'mortgage_step2', 'form', true);

-- Add dropdown options
INSERT INTO content_items (content_key, component_type, screen_location, category, is_active)
VALUES 
  ('mortgage_step2_citizenship_israeli', 'option', 'mortgage_step2', 'form', true),
  ('mortgage_step2_citizenship_foreign', 'option', 'mortgage_step2', 'form', true),
  ('mortgage_step2_citizenship_dual', 'option', 'mortgage_step2', 'form', true);

-- Add English translations
INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'en', 
  CASE ci.content_key
    WHEN 'mortgage_step2_citizenship' THEN 'Citizenship'
    WHEN 'mortgage_step2_citizenship_israeli' THEN 'Israeli citizen'
    WHEN 'mortgage_step2_citizenship_foreign' THEN 'Foreign citizen'
    WHEN 'mortgage_step2_citizenship_dual' THEN 'Dual citizenship'
  END,
  'approved'
FROM content_items ci
WHERE ci.content_key LIKE 'mortgage_step2_citizenship%';

-- Add Hebrew translations
INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'he', 
  CASE ci.content_key
    WHEN 'mortgage_step2_citizenship' THEN '������'
    WHEN 'mortgage_step2_citizenship_israeli' THEN '���� ������'
    WHEN 'mortgage_step2_citizenship_foreign' THEN '���� ��'
    WHEN 'mortgage_step2_citizenship_dual' THEN '������ �����'
  END,
  'approved'
FROM content_items ci
WHERE ci.content_key LIKE 'mortgage_step2_citizenship%';

-- Add Russian translations
INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'ru', 
  CASE ci.content_key
    WHEN 'mortgage_step2_citizenship' THEN '@0640=AB2>'
    WHEN 'mortgage_step2_citizenship_israeli' THEN '@0640=8= 7@08;O'
    WHEN 'mortgage_step2_citizenship_foreign' THEN '=>AB@0==K9 3@0640=8='
    WHEN 'mortgage_step2_citizenship_dual' THEN '2>9=>5 3@0640=AB2>'
  END,
  'approved'
FROM content_items ci
WHERE ci.content_key LIKE 'mortgage_step2_citizenship%';
```

#### Step 4: Apply the Fix
1. Run the migration script against the database
2. Clear any API caches (if using caching)
3. Refresh the frontend page
4. Verify dropdown now shows options

### Previous Examples We Fixed:

1. **Debt Obligations Dropdown** (`mortgage_step3_debt_types`)
   - Problem: No options showing in "Do you have bank debts" dropdown
   - Solution: Added database entries for debt type options

2. **Additional Income Dropdown** (`mortgage_step3_additional_income`)
   - Problem: Empty additional income dropdown in step 3
   - Solution: Created options for different income types

3. **Citizenship Dropdown** (`calculate_mortgage_citizenship`) - RESOLVED
   - Problem: No citizenship options visible in dropdown after clicking "Yes"
   - Root Cause: MultiSelect component expects `data` prop (string[]) but CitizenshipsDropdown was passing `options` prop (object[])
   - Solution: Fixed prop name and data format mapping:
     * Changed from `options={citizenshipOptions}` to `data={citizenshipOptions.map(option => option.label)}`
     * Added value/label conversion: display labels to user, store option keys in form
     * Added proper label-to-value mapping in onChange handler
   - Result: Dropdown now shows 8 citizenship options correctly in all languages

### Quick Fix Command:
```bash
# Create and run migration file
echo "INSERT INTO content_items..." > fix_citizenship_dropdown.sql
# Run against database
# Verify in browser
```

### Prevention:
- Always check database content exists before implementing dropdown components
- Use the Phase 1 automation tests to verify dropdown completeness
- Ensure all dropdowns have container + options + translations for all languages

### Verification:
After applying fix, verify:
1. Console shows `optionsCount > 0`
2. Dropdown displays all expected options
3. Options display correctly in all languages (EN/HE/RU)
4. Form validation works when options are selected
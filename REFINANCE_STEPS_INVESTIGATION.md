# Investigation: Missing Refinance Steps 2-4 in Database

## Problem Summary
Our API endpoint `/content/mortgage-refi` only returns 1 step (refinance_mortgage_1), but the database team confirms steps 2-4 exist. We need to understand the exact database structure to fix this discrepancy.

## Critical Questions for Database Team

### 1. Exact Database Values
**What are the EXACT values in these fields for refinance steps?**

Please run this query and share the complete results:
```sql
SELECT 
    id,
    content_key,
    screen_location,
    component_type,
    category,
    is_active,
    page_number
FROM content_items
WHERE 
    screen_location LIKE '%refinance%' OR
    content_key LIKE '%refinance%' OR
    category LIKE '%refinance%'
ORDER BY id
LIMIT 20;
```

### 2. Storage Pattern for Steps 2-4
**Are Steps 2-4 stored differently than Step 1?**

- Are they stored as `component_type = 'option'`? (Our query filters these out)
- Are they stored with `is_active = false`?
- Are they in a different category than 'mortgage_refi_steps'?
- Do they have a parent-child relationship with step 1?

### 3. Screen Location Pattern
**What is the EXACT screen_location value for steps 2-4?**

- **Option A:** `refinance_mortgage_2`, `refinance_mortgage_3`, `refinance_mortgage_4`
- **Option B:** `refinance_step2`, `refinance_step3`, `refinance_step4`
- **Option C:** `mortgage_refinancing_2`, `mortgage_refinancing_3`, `mortgage_refinancing_4`
- **Option D:** Something else? (please specify exact values)

### 4. Component Type Issue
**Our query filters out options: `AND ci.component_type != 'option'`**

Are the refinance steps stored as:
- `component_type = 'step'` ✅ (expected)
- `component_type = 'option'` ❌ (would be filtered out)
- `component_type = 'dropdown'` ❌ (would be filtered out)
- Something else? (please specify)

### 5. Active Status Check
**Our query requires: `AND ci.is_active = TRUE`**

Please run this grouping query:
```sql
SELECT 
    screen_location,
    component_type,
    is_active,
    COUNT(*) as count
FROM content_items
WHERE screen_location LIKE '%refinance_mortgage_%'
GROUP BY screen_location, component_type, is_active
ORDER BY screen_location;
```

### 6. Parent-Child Relationship
**Is there a parent-child relationship structure?**

- Is Step 1 (`refinance_mortgage_1`) stored as a parent item?
- Are Steps 2-4 stored as child actions within step 1?
- If yes, what field indicates this relationship? (`parent_id`, `parent_key`, etc.)

### 7. Alternative Table Storage
**Are steps 2-4 stored in a different table?**

Possible tables:
- `content_steps` table?
- `mortgage_refi_steps` table?
- `workflow_steps` table?
- Other? (please specify)

## Quick Debug Request

Please run this comprehensive check to help us understand the data structure:

```sql
-- Check all refinance-related content
SELECT 
    'Total refinance items' as description,
    COUNT(*) as count
FROM content_items
WHERE screen_location LIKE '%refinance%'

UNION ALL

SELECT 
    'Active refinance items' as description,
    COUNT(*) as count
FROM content_items
WHERE screen_location LIKE '%refinance%' AND is_active = true

UNION ALL

SELECT 
    'refinance_mortgage_1' as description,
    COUNT(*) as count
FROM content_items
WHERE screen_location = 'refinance_mortgage_1'

UNION ALL

SELECT 
    'refinance_mortgage_2' as description,
    COUNT(*) as count
FROM content_items
WHERE screen_location = 'refinance_mortgage_2'

UNION ALL

SELECT 
    'refinance_mortgage_3' as description,
    COUNT(*) as count
FROM content_items
WHERE screen_location = 'refinance_mortgage_3'

UNION ALL

SELECT 
    'refinance_mortgage_4' as description,
    COUNT(*) as count
FROM content_items
WHERE screen_location = 'refinance_mortgage_4';
```

## Current Server Query (For Reference)

This is the query our server is currently using that only finds 1 step:

```sql
SELECT DISTINCT
    ci.id,
    ci.content_key,
    ci.screen_location,
    ci.component_type,
    ci.category,
    ci.display_order,
    ci.is_translatable,
    ci.created_at,
    ci.updated_at,
    ci.page_number,
    ct_en.translation_text as en,
    ct_he.translation_text as he,
    ct_ru.translation_text as ru
FROM content_items ci
LEFT JOIN content_translations ct_en ON ci.id = ct_en.content_item_id AND ct_en.language_code = 'en'
LEFT JOIN content_translations ct_he ON ci.id = ct_he.content_item_id AND ct_he.language_code = 'he'
LEFT JOIN content_translations ct_ru ON ci.id = ct_ru.content_item_id AND ct_ru.language_code = 'ru'
WHERE ci.screen_location LIKE 'refinance_mortgage_%'
  AND ci.is_active = TRUE
  AND ci.component_type != 'option'
ORDER BY 
    ci.page_number ASC NULLS LAST,
    ci.display_order ASC NULLS LAST,
    ci.id ASC;
```

## Key Question
**What is different about steps 2-4 that makes them invisible to our current query?**

Please provide the actual data values so we can adjust our query accordingly.

## Additional Information Needed

1. **Sample Data**: Please provide 2-3 complete rows of data for each refinance step (1-4)
2. **Schema Details**: Any foreign key relationships or constraints on the refinance content
3. **Business Logic**: Is there any special business logic that treats refinance steps differently?

## Additional Critical Questions

### 8. Content Count Discrepancy
**Step 1 shows `actionCount: "16"` but the drill endpoint returns 0 actions. Where are these 16 actions stored?**

```sql
-- Find the 16 actions that belong to step 1
SELECT 
    id,
    content_key,
    screen_location,
    component_type,
    category
FROM content_items
WHERE 
    screen_location = 'refinance_mortgage_1' OR
    screen_location LIKE 'refinance_mortgage_1_%' OR
    parent_id = (SELECT id FROM content_items WHERE content_key = 'refinance_mortgage_1')
LIMIT 20;
```

### 9. App Context Filter
**Are the refinance steps assigned to a different `app_context_id`?**

```sql
SELECT 
    screen_location,
    app_context_id,
    COUNT(*) as count
FROM content_items
WHERE screen_location LIKE '%refinance%'
GROUP BY screen_location, app_context_id;
```

### 10. Case Sensitivity Issue
**Could there be a case sensitivity problem?**

```sql
SELECT DISTINCT
    screen_location,
    LOWER(screen_location) as lower_location,
    UPPER(screen_location) as upper_location
FROM content_items
WHERE 
    LOWER(screen_location) LIKE '%refinance%mortgage%' OR
    screen_location ILIKE '%refinance%mortgage%';
```

### 11. Hidden or Soft-Deleted Records
**Do you have soft delete fields that might be hiding the records?**

```sql
SELECT 
    screen_location,
    is_active,
    deleted_at,
    hidden,
    status,
    COUNT(*) as count
FROM content_items
WHERE screen_location LIKE '%refinance_mortgage_%'
GROUP BY screen_location, is_active, deleted_at, hidden, status;
```

### 12. Translation Join Issue
**The query joins with `content_translations`. Could missing translations cause the steps to be filtered out?**

```sql
-- Check if steps 2-4 have translations
SELECT 
    ci.screen_location,
    ci.content_key,
    COUNT(DISTINCT ct.language_code) as translation_count,
    STRING_AGG(DISTINCT ct.language_code, ', ') as languages
FROM content_items ci
LEFT JOIN content_translations ct ON ci.id = ct.content_item_id
WHERE ci.screen_location LIKE 'refinance_mortgage_%'
GROUP BY ci.screen_location, ci.content_key
ORDER BY ci.screen_location;
```

### 13. Duplicate Records
**Are there duplicate entries causing conflicts?**

```sql
SELECT 
    screen_location,
    COUNT(*) as duplicate_count
FROM content_items
WHERE screen_location IN (
    'refinance_mortgage_1',
    'refinance_mortgage_2', 
    'refinance_mortgage_3',
    'refinance_mortgage_4'
)
GROUP BY screen_location
HAVING COUNT(*) > 1;
```

### 14. Permission or Schema Issue
**Is the API querying the correct schema/database?**

```sql
-- Check which schema contains the data
SELECT 
    table_schema,
    table_name,
    COUNT(*) as count
FROM information_schema.columns
WHERE column_name = 'screen_location'
GROUP BY table_schema, table_name;
```

### 15. Data Type Mismatch
**Is there trailing whitespace or special characters?**

```sql
SELECT 
    LENGTH(screen_location) as length,
    screen_location,
    '|' || screen_location || '|' as visible_boundaries,
    encode(screen_location::bytea, 'hex') as hex_value
FROM content_items
WHERE screen_location LIKE '%refinance_mortgage_%'
LIMIT 10;
```

### 16. Direct Count Verification
**Simple existence check for each step:**

```sql
-- Simple existence check for each step
SELECT 
    'Step 1' as step,
    EXISTS(SELECT 1 FROM content_items WHERE screen_location = 'refinance_mortgage_1') as exists,
    EXISTS(SELECT 1 FROM content_items WHERE content_key = 'refinance_mortgage_1') as key_exists
UNION ALL
SELECT 'Step 2',
    EXISTS(SELECT 1 FROM content_items WHERE screen_location = 'refinance_mortgage_2'),
    EXISTS(SELECT 1 FROM content_items WHERE content_key = 'refinance_mortgage_2')
UNION ALL
SELECT 'Step 3',
    EXISTS(SELECT 1 FROM content_items WHERE screen_location = 'refinance_mortgage_3'),
    EXISTS(SELECT 1 FROM content_items WHERE content_key = 'refinance_mortgage_3')
UNION ALL
SELECT 'Step 4',
    EXISTS(SELECT 1 FROM content_items WHERE screen_location = 'refinance_mortgage_4'),
    EXISTS(SELECT 1 FROM content_items WHERE content_key = 'refinance_mortgage_4');
```

### 17. Check What The Server Query Actually Returns
**This is EXACTLY what the server runs (copy from server.js):**

```sql
-- This is EXACTLY what the server runs
WITH screen_summaries AS (
    SELECT 
        ci.screen_location,
        COUNT(*) as action_count
    FROM content_items ci
    WHERE ci.screen_location LIKE 'refinance_mortgage_%'
      AND ci.is_active = TRUE
      AND ci.component_type != 'option'
    GROUP BY ci.screen_location
    HAVING COUNT(*) > 0
)
SELECT * FROM screen_summaries;
```

### 18. Check for Typos in Field Values
**Look for similar but not exact matches:**

```sql
-- Look for similar but not exact matches
SELECT DISTINCT
    screen_location,
    component_type,
    category
FROM content_items
WHERE 
    screen_location SIMILAR TO '%(refinance|mortgage|refi)%' OR
    content_key SIMILAR TO '%(refinance|mortgage|refi)%'
ORDER BY screen_location;
```

## 🔴 MOST IMPORTANT: Show Us The Actual Data!

**Please just run this simple query and show us the raw output:**

```sql
SELECT * FROM content_items
WHERE screen_location LIKE '%refinance%'
ORDER BY id
LIMIT 30;
```

**This will help us see exactly what's in the database and identify the issue immediately!**

## Summary of Potential Issues to Check

1. **Component Type Filtering** - Steps might be stored as 'option' type
2. **Active Status** - Steps 2-4 might be inactive
3. **Missing Translations** - LEFT JOIN might be filtering out untranslated content
4. **App Context** - Different app_context_id values
5. **Case Sensitivity** - Mismatched case in screen_location
6. **Soft Deletes** - Hidden or deleted_at fields
7. **Data Integrity** - Trailing spaces or special characters
8. **Parent-Child Structure** - Steps might be nested under step 1
9. **Wrong Table** - Data might be in a different table
10. **Schema Issues** - API might be querying wrong schema

## Action Items for Database Team

### Immediate Actions:
1. **Run query #17 above** - This will show exactly what the server sees
2. **Send screenshot of query results** from the "MOST IMPORTANT" query 
3. **Confirm database name** - Are we querying the right database?
4. **Check recent changes** - Were these steps recently added/modified?

### If They Find The Steps Exist:
Please provide:
- The exact `screen_location` values
- The exact `component_type` values  
- The exact `is_active` values
- Any other field that might affect visibility

**This should help identify the issue within minutes!**

---

**Response Needed By:** URGENT - Blocking refinance functionality
**Contact:** Development Team
**Priority:** CRITICAL - Production feature not working
**Expected Resolution Time:** Within hours - This is blocking a production feature
-- Migration: Fix Dropdown Field Name Mapping
-- Description: Update content_keys to match component expectations
-- Date: 2025-01-07
-- Issue: Components expect debt_types and field_of_activity, but API provides types and activity

BEGIN;

-- ===========================================
-- PHASE 1: Update debt_types key mapping
-- ===========================================

-- Update the existing debt_types content keys to match component expectations
-- From: calculate_credit_3_debt_types → should stay as is (this is correct)
-- From: calculate_credit_3_types → needs to be available as debt_types shortname

-- The issue is the API shortens the keys incorrectly. 
-- Let's make the content_keys match what components expect

-- ===========================================
-- PHASE 2: Update field_of_activity key mapping  
-- ===========================================

-- Update the field_of_activity keys to match component expectations
-- From: calculate_credit_3_field_of_activity → already correct in database
-- From: calculate_credit_3_activity (API key) → needs to be field_of_activity

-- The API is shortening field_of_activity to just "activity"
-- But component expects "field_of_activity"

-- Let's check what keys exist and what the API logic expects
-- ===========================================
-- PHASE 3: Add alternative keys to support both patterns
-- ===========================================

-- Strategy: Add debt_types entries that mirror the existing debt_types ones
-- This ensures the component gets data whether it looks for 'types' or 'debt_types'

INSERT INTO content_items (content_key, component_type, screen_location, category, is_active, created_at, created_by)
SELECT 
  REPLACE(content_key, '_debt_types', '_types') as content_key,
  component_type,
  screen_location, 
  category,
  is_active,
  NOW() as created_at,
  1 as created_by
FROM content_items
WHERE screen_location = 'calculate_credit_3' 
  AND content_key LIKE '%debt_types%'
  AND NOT EXISTS (
    SELECT 1 FROM content_items ci2 
    WHERE ci2.content_key = REPLACE(content_items.content_key, '_debt_types', '_types')
    AND ci2.screen_location = 'calculate_credit_3'
  );

-- Copy translations for debt_types → types mapping
INSERT INTO content_translations (content_item_id, language_code, content_value, status, is_default, created_at)
SELECT 
  (SELECT id FROM content_items WHERE content_key = REPLACE(ci.content_key, '_debt_types', '_types') AND screen_location = 'calculate_credit_3'),
  ct.language_code,
  ct.content_value,
  ct.status,
  ct.is_default,
  NOW()
FROM content_items ci
JOIN content_translations ct ON ci.id = ct.content_item_id
WHERE ci.screen_location = 'calculate_credit_3'
  AND ci.content_key LIKE '%debt_types%'
  AND ct.status = 'approved'
  AND EXISTS (
    SELECT 1 FROM content_items ci2 
    WHERE ci2.content_key = REPLACE(ci.content_key, '_debt_types', '_types')
    AND ci2.screen_location = 'calculate_credit_3'
  );

-- ===========================================
-- PHASE 4: Add alternative keys for field_of_activity
-- ===========================================

-- Add activity entries that mirror field_of_activity  
INSERT INTO content_items (content_key, component_type, screen_location, category, is_active, created_at, created_by)
SELECT 
  REPLACE(content_key, '_field_of_activity', '_activity') as content_key,
  component_type,
  screen_location,
  category, 
  is_active,
  NOW() as created_at,
  1 as created_by
FROM content_items
WHERE screen_location = 'calculate_credit_3'
  AND content_key LIKE '%field_of_activity%'
  AND NOT EXISTS (
    SELECT 1 FROM content_items ci2
    WHERE ci2.content_key = REPLACE(content_items.content_key, '_field_of_activity', '_activity')
    AND ci2.screen_location = 'calculate_credit_3'
  );

-- Copy translations for field_of_activity → activity mapping
INSERT INTO content_translations (content_item_id, language_code, content_value, status, is_default, created_at)
SELECT 
  (SELECT id FROM content_items WHERE content_key = REPLACE(ci.content_key, '_field_of_activity', '_activity') AND screen_location = 'calculate_credit_3'),
  ct.language_code,
  ct.content_value,
  ct.status,
  ct.is_default,
  NOW()
FROM content_items ci
JOIN content_translations ct ON ci.id = ct.content_item_id
WHERE ci.screen_location = 'calculate_credit_3'
  AND ci.content_key LIKE '%field_of_activity%' 
  AND ct.status = 'approved'
  AND EXISTS (
    SELECT 1 FROM content_items ci2
    WHERE ci2.content_key = REPLACE(ci.content_key, '_field_of_activity', '_activity')  
    AND ci2.screen_location = 'calculate_credit_3'
  );

-- ===========================================
-- PHASE 5: Verification
-- ===========================================

-- Verify the results
SELECT 
  ci.content_key,
  ci.component_type,
  COUNT(ct.id) as translation_count,
  string_agg(ct.language_code, ', ' ORDER BY ct.language_code) as languages
FROM content_items ci
LEFT JOIN content_translations ct ON ci.id = ct.content_item_id AND ct.status = 'approved'
WHERE ci.screen_location = 'calculate_credit_3'
  AND (ci.content_key LIKE '%_types%' OR ci.content_key LIKE '%_activity%')
GROUP BY ci.content_key, ci.component_type, ci.id
ORDER BY ci.content_key;

COMMIT;

-- Migration Summary:
-- ✅ Added calculate_credit_3_types entries (duplicated from debt_types)
-- ✅ Added calculate_credit_3_activity entries (duplicated from field_of_activity)
-- ✅ Both dropdown patterns now supported by API:
--    - Component calls 'debt_types' → API maps to calculate_credit_3_debt_types
--    - API shortening creates 'types' → points to calculate_credit_3_types  
--    - Component calls 'field_of_activity' → API maps to calculate_credit_3_field_of_activity
--    - API shortening creates 'activity' → points to calculate_credit_3_activity
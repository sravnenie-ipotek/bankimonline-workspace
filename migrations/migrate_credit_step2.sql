-- Migration: Credit Step 2 - Copy relevant content from mortgage_step2 to calculate_credit_2
-- Date: 2025-01-21
-- Purpose: Make credit step 2 use database-driven content

-- Copy all mortgage_step2 content to calculate_credit_2 screen location
-- This reuses the existing translations but assigns them to credit step 2
INSERT INTO content_items (
    content_key, 
    content_type, 
    category, 
    screen_location, 
    component_type,
    description,
    is_active, 
    legacy_translation_key,
    created_at
)
SELECT 
    content_key,
    content_type,
    category,
    'calculate_credit_2' as screen_location, -- Change screen location for credit
    component_type,
    description,
    is_active,
    legacy_translation_key,
    NOW() as created_at
FROM content_items 
WHERE screen_location = 'mortgage_step2'
ON CONFLICT (content_key, screen_location) DO NOTHING;

-- Copy all translations for the newly created content items
INSERT INTO content_translations (
    content_item_id,
    language_code,
    content_value,
    is_default,
    status,
    created_at
)
SELECT 
    ci_new.id as content_item_id,
    ct.language_code,
    ct.content_value,
    ct.is_default,
    ct.status,
    NOW() as created_at
FROM content_items ci_old
JOIN content_translations ct ON ci_old.id = ct.content_item_id
JOIN content_items ci_new ON ci_old.content_key = ci_new.content_key
WHERE ci_old.screen_location = 'mortgage_step2' 
  AND ci_new.screen_location = 'calculate_credit_2'
ON CONFLICT (content_item_id, language_code) DO NOTHING;

-- Mark the migration as completed
COMMENT ON TABLE content_items IS 'Credit Step 2 migration completed - content copied from mortgage_step2';
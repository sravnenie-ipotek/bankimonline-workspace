-- ================================================================
-- FIX 3: Add Refinance Mortgage Content (SAFE VERSION)
-- ================================================================
-- This script adds missing dropdown content for refinance_mortgage screens
-- SAFETY: Uses WHERE NOT EXISTS to prevent duplicates
-- WILL NOT DELETE: Only adds missing content
-- 
-- Content to add:
-- - Bank dropdown and options (refinance_mortgage_1)
-- - Property type dropdown (refinance_mortgage_2) 
-- - Registration dropdown and options (refinance_mortgage_2)
-- - Refinance purpose dropdown and options (refinance_mortgage_2)
-- - Placeholders and labels for all dropdowns
-- - Step headers and navigation
-- 
-- Date: 2025-01-25
-- ================================================================

BEGIN;

-- ================================================================
-- STEP 1: Fix existing items categories (12 items with null categories)
-- ================================================================

UPDATE content_items 
SET category = 'buttons' 
WHERE content_key LIKE 'app.mortgage_refi.step%.button' AND category IS NULL;

UPDATE content_items 
SET category = 'text' 
WHERE content_key LIKE 'app.mortgage_refi.step%.description' AND category IS NULL;

UPDATE content_items 
SET category = 'headers' 
WHERE content_key LIKE 'app.mortgage_refi.step%.title' AND category IS NULL;

-- ================================================================
-- STEP 2: Add Bank Selection Dropdown - refinance_mortgage_1
-- ================================================================

-- Bank dropdown container
INSERT INTO content_items (content_key, component_type, screen_location, category, is_active)
SELECT 'mortgage_refinance_bank', 'dropdown', 'refinance_mortgage_1', 'form', true
WHERE NOT EXISTS (
    SELECT 1 FROM content_items 
    WHERE content_key = 'mortgage_refinance_bank' 
    AND screen_location = 'refinance_mortgage_1'
);

-- Bank options
INSERT INTO content_items (content_key, component_type, screen_location, category, is_active)
SELECT 'mortgage_refinance_bank_hapoalim', 'option', 'refinance_mortgage_1', 'form', true
WHERE NOT EXISTS (
    SELECT 1 FROM content_items 
    WHERE content_key = 'mortgage_refinance_bank_hapoalim' 
    AND screen_location = 'refinance_mortgage_1'
);

INSERT INTO content_items (content_key, component_type, screen_location, category, is_active)
SELECT 'mortgage_refinance_bank_leumi', 'option', 'refinance_mortgage_1', 'form', true
WHERE NOT EXISTS (
    SELECT 1 FROM content_items 
    WHERE content_key = 'mortgage_refinance_bank_leumi' 
    AND screen_location = 'refinance_mortgage_1'
);

INSERT INTO content_items (content_key, component_type, screen_location, category, is_active)
SELECT 'mortgage_refinance_bank_discount', 'option', 'refinance_mortgage_1', 'form', true
WHERE NOT EXISTS (
    SELECT 1 FROM content_items 
    WHERE content_key = 'mortgage_refinance_bank_discount' 
    AND screen_location = 'refinance_mortgage_1'
);

INSERT INTO content_items (content_key, component_type, screen_location, category, is_active)
SELECT 'mortgage_refinance_bank_massad', 'option', 'refinance_mortgage_1', 'form', true
WHERE NOT EXISTS (
    SELECT 1 FROM content_items 
    WHERE content_key = 'mortgage_refinance_bank_massad' 
    AND screen_location = 'refinance_mortgage_1'
);

-- Bank placeholder and label
INSERT INTO content_items (content_key, component_type, screen_location, category, is_active)
SELECT 'mortgage_refinance_bank_ph', 'placeholder', 'refinance_mortgage_1', 'form', true
WHERE NOT EXISTS (
    SELECT 1 FROM content_items 
    WHERE content_key = 'mortgage_refinance_bank_ph' 
    AND screen_location = 'refinance_mortgage_1'
);

INSERT INTO content_items (content_key, component_type, screen_location, category, is_active)
SELECT 'mortgage_refinance_bank_label', 'label', 'refinance_mortgage_1', 'form', true
WHERE NOT EXISTS (
    SELECT 1 FROM content_items 
    WHERE content_key = 'mortgage_refinance_bank_label' 
    AND screen_location = 'refinance_mortgage_1'
);

-- Form field labels for refinance_mortgage_1
INSERT INTO content_items (content_key, component_type, screen_location, category, is_active)
SELECT 'mortgage_refinance_left_label', 'label', 'refinance_mortgage_1', 'form', true
WHERE NOT EXISTS (
    SELECT 1 FROM content_items 
    WHERE content_key = 'mortgage_refinance_left_label' 
    AND screen_location = 'refinance_mortgage_1'
);

INSERT INTO content_items (content_key, component_type, screen_location, category, is_active)
SELECT 'mortgage_refinance_price_label', 'label', 'refinance_mortgage_1', 'form', true
WHERE NOT EXISTS (
    SELECT 1 FROM content_items 
    WHERE content_key = 'mortgage_refinance_price_label' 
    AND screen_location = 'refinance_mortgage_1'
);

INSERT INTO content_items (content_key, component_type, screen_location, category, is_active)
SELECT 'mortgage_refinance_step_1_label', 'label', 'refinance_mortgage_1', 'headers', true
WHERE NOT EXISTS (
    SELECT 1 FROM content_items 
    WHERE content_key = 'mortgage_refinance_step_1_label' 
    AND screen_location = 'refinance_mortgage_1'
);

-- ================================================================
-- STEP 3: Add Content for refinance_mortgage_2
-- ================================================================

-- Property Type Dropdown
INSERT INTO content_items (content_key, component_type, screen_location, category, is_active)
SELECT 'mortgage_refinance_type', 'dropdown', 'refinance_mortgage_2', 'form', true
WHERE NOT EXISTS (
    SELECT 1 FROM content_items 
    WHERE content_key = 'mortgage_refinance_type' 
    AND screen_location = 'refinance_mortgage_2'
);

INSERT INTO content_items (content_key, component_type, screen_location, category, is_active)
SELECT 'mortgage_refinance_type_ph', 'placeholder', 'refinance_mortgage_2', 'form', true
WHERE NOT EXISTS (
    SELECT 1 FROM content_items 
    WHERE content_key = 'mortgage_refinance_type_ph' 
    AND screen_location = 'refinance_mortgage_2'
);

INSERT INTO content_items (content_key, component_type, screen_location, category, is_active)
SELECT 'mortgage_refinance_type_label', 'label', 'refinance_mortgage_2', 'form', true
WHERE NOT EXISTS (
    SELECT 1 FROM content_items 
    WHERE content_key = 'mortgage_refinance_type_label' 
    AND screen_location = 'refinance_mortgage_2'
);

-- Registration Status Dropdown
INSERT INTO content_items (content_key, component_type, screen_location, category, is_active)
SELECT 'mortgage_refinance_registered', 'dropdown', 'refinance_mortgage_2', 'form', true
WHERE NOT EXISTS (
    SELECT 1 FROM content_items 
    WHERE content_key = 'mortgage_refinance_registered' 
    AND screen_location = 'refinance_mortgage_2'
);

INSERT INTO content_items (content_key, component_type, screen_location, category, is_active)
SELECT 'mortgage_refinance_reg_option_1', 'option', 'refinance_mortgage_2', 'form', true
WHERE NOT EXISTS (
    SELECT 1 FROM content_items 
    WHERE content_key = 'mortgage_refinance_reg_option_1' 
    AND screen_location = 'refinance_mortgage_2'
);

INSERT INTO content_items (content_key, component_type, screen_location, category, is_active)
SELECT 'mortgage_refinance_reg_option_2', 'option', 'refinance_mortgage_2', 'form', true
WHERE NOT EXISTS (
    SELECT 1 FROM content_items 
    WHERE content_key = 'mortgage_refinance_reg_option_2' 
    AND screen_location = 'refinance_mortgage_2'
);

INSERT INTO content_items (content_key, component_type, screen_location, category, is_active)
SELECT 'mortgage_refinance_registered_ph', 'placeholder', 'refinance_mortgage_2', 'form', true
WHERE NOT EXISTS (
    SELECT 1 FROM content_items 
    WHERE content_key = 'mortgage_refinance_registered_ph' 
    AND screen_location = 'refinance_mortgage_2'
);

INSERT INTO content_items (content_key, component_type, screen_location, category, is_active)
SELECT 'mortgage_refinance_registered_label', 'label', 'refinance_mortgage_2', 'form', true
WHERE NOT EXISTS (
    SELECT 1 FROM content_items 
    WHERE content_key = 'mortgage_refinance_registered_label' 
    AND screen_location = 'refinance_mortgage_2'
);

-- Refinance Purpose Dropdown
INSERT INTO content_items (content_key, component_type, screen_location, category, is_active)
SELECT 'mortgage_refinance_why', 'dropdown', 'refinance_mortgage_2', 'form', true
WHERE NOT EXISTS (
    SELECT 1 FROM content_items 
    WHERE content_key = 'mortgage_refinance_why' 
    AND screen_location = 'refinance_mortgage_2'
);

INSERT INTO content_items (content_key, component_type, screen_location, category, is_active)
SELECT 'mortgage_refinance_why_option_1', 'option', 'refinance_mortgage_2', 'form', true
WHERE NOT EXISTS (
    SELECT 1 FROM content_items 
    WHERE content_key = 'mortgage_refinance_why_option_1' 
    AND screen_location = 'refinance_mortgage_2'
);

INSERT INTO content_items (content_key, component_type, screen_location, category, is_active)
SELECT 'mortgage_refinance_why_option_2', 'option', 'refinance_mortgage_2', 'form', true
WHERE NOT EXISTS (
    SELECT 1 FROM content_items 
    WHERE content_key = 'mortgage_refinance_why_option_2' 
    AND screen_location = 'refinance_mortgage_2'
);

INSERT INTO content_items (content_key, component_type, screen_location, category, is_active)
SELECT 'mortgage_refinance_why_option_3', 'option', 'refinance_mortgage_2', 'form', true
WHERE NOT EXISTS (
    SELECT 1 FROM content_items 
    WHERE content_key = 'mortgage_refinance_why_option_3' 
    AND screen_location = 'refinance_mortgage_2'
);

INSERT INTO content_items (content_key, component_type, screen_location, category, is_active)
SELECT 'mortgage_refinance_why_option_4', 'option', 'refinance_mortgage_2', 'form', true
WHERE NOT EXISTS (
    SELECT 1 FROM content_items 
    WHERE content_key = 'mortgage_refinance_why_option_4' 
    AND screen_location = 'refinance_mortgage_2'
);

INSERT INTO content_items (content_key, component_type, screen_location, category, is_active)
SELECT 'mortgage_refinance_why_option_5', 'option', 'refinance_mortgage_2', 'form', true
WHERE NOT EXISTS (
    SELECT 1 FROM content_items 
    WHERE content_key = 'mortgage_refinance_why_option_5' 
    AND screen_location = 'refinance_mortgage_2'
);

INSERT INTO content_items (content_key, component_type, screen_location, category, is_active)
SELECT 'mortgage_refinance_why_ph', 'placeholder', 'refinance_mortgage_2', 'form', true
WHERE NOT EXISTS (
    SELECT 1 FROM content_items 
    WHERE content_key = 'mortgage_refinance_why_ph' 
    AND screen_location = 'refinance_mortgage_2'
);

INSERT INTO content_items (content_key, component_type, screen_location, category, is_active)
SELECT 'mortgage_refinance_why_label', 'label', 'refinance_mortgage_2', 'form', true
WHERE NOT EXISTS (
    SELECT 1 FROM content_items 
    WHERE content_key = 'mortgage_refinance_why_label' 
    AND screen_location = 'refinance_mortgage_2'
);

INSERT INTO content_items (content_key, component_type, screen_location, category, is_active)
SELECT 'mortgage_refinance_step_2_label', 'label', 'refinance_mortgage_2', 'headers', true
WHERE NOT EXISTS (
    SELECT 1 FROM content_items 
    WHERE content_key = 'mortgage_refinance_step_2_label' 
    AND screen_location = 'refinance_mortgage_2'
);

-- ================================================================
-- STEP 4: Add Step Headers for refinance_mortgage_3 and refinance_mortgage_4
-- ================================================================

INSERT INTO content_items (content_key, component_type, screen_location, category, is_active)
SELECT 'mortgage_refinance_step_3_label', 'label', 'refinance_mortgage_3', 'headers', true
WHERE NOT EXISTS (
    SELECT 1 FROM content_items 
    WHERE content_key = 'mortgage_refinance_step_3_label' 
    AND screen_location = 'refinance_mortgage_3'
);

INSERT INTO content_items (content_key, component_type, screen_location, category, is_active)
SELECT 'mortgage_refinance_step_4_label', 'label', 'refinance_mortgage_4', 'headers', true
WHERE NOT EXISTS (
    SELECT 1 FROM content_items 
    WHERE content_key = 'mortgage_refinance_step_4_label' 
    AND screen_location = 'refinance_mortgage_4'
);

COMMIT; 
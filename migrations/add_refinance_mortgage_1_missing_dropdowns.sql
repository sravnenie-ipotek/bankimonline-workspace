-- ================================================================
-- ADD MISSING DROPDOWNS FOR REFINANCE MORTGAGE 1
-- ================================================================
-- This script adds the missing dropdowns and options for refinance_mortgage_1
-- FOLLOWS: @dropDownsInDBLogic standards
-- 
-- Problem: Frontend expects dropdowns in refinance_mortgage_1 but they're in refinance_mortgage_2
-- Solution: Create new dropdown structure for refinance_mortgage_1 with unique content keys
-- 
-- Date: 2025-01-25
-- ================================================================

BEGIN;

-- ================================================================
-- STEP 1: Add Missing Dropdown Containers for refinance_mortgage_1
-- ================================================================

INSERT INTO content_items (content_key, component_type, screen_location, category, is_active)
VALUES 
('refinance_mortgage_1_registered', 'dropdown', 'refinance_mortgage_1', 'form', true),
('refinance_mortgage_1_why', 'dropdown', 'refinance_mortgage_1', 'form', true),
('refinance_mortgage_1_property_type', 'dropdown', 'refinance_mortgage_1', 'form', true);

-- ================================================================
-- STEP 2: Add Registration Options
-- ================================================================

INSERT INTO content_items (content_key, component_type, screen_location, category, is_active)
VALUES 
('refinance_mortgage_1_registered_option_1', 'option', 'refinance_mortgage_1', 'form', true),
('refinance_mortgage_1_registered_option_2', 'option', 'refinance_mortgage_1', 'form', true);

-- ================================================================
-- STEP 3: Add Why Options
-- ================================================================

INSERT INTO content_items (content_key, component_type, screen_location, category, is_active)
VALUES 
('refinance_mortgage_1_why_option_1', 'option', 'refinance_mortgage_1', 'form', true),
('refinance_mortgage_1_why_option_2', 'option', 'refinance_mortgage_1', 'form', true),
('refinance_mortgage_1_why_option_3', 'option', 'refinance_mortgage_1', 'form', true),
('refinance_mortgage_1_why_option_4', 'option', 'refinance_mortgage_1', 'form', true),
('refinance_mortgage_1_why_option_5', 'option', 'refinance_mortgage_1', 'form', true);

-- ================================================================
-- STEP 4: Add Property Type Options
-- ================================================================

INSERT INTO content_items (content_key, component_type, screen_location, category, is_active)
VALUES 
('refinance_mortgage_1_property_type_option_1', 'option', 'refinance_mortgage_1', 'form', true),
('refinance_mortgage_1_property_type_option_2', 'option', 'refinance_mortgage_1', 'form', true),
('refinance_mortgage_1_property_type_option_3', 'option', 'refinance_mortgage_1', 'form', true);

-- ================================================================
-- STEP 5: Add Labels and Placeholders
-- ================================================================

INSERT INTO content_items (content_key, component_type, screen_location, category, is_active)
VALUES 
('refinance_mortgage_1_registered_label', 'label', 'refinance_mortgage_1', 'form', true),
('refinance_mortgage_1_registered_ph', 'placeholder', 'refinance_mortgage_1', 'form', true),
('refinance_mortgage_1_why_label', 'label', 'refinance_mortgage_1', 'form', true),
('refinance_mortgage_1_why_ph', 'placeholder', 'refinance_mortgage_1', 'form', true),
('refinance_mortgage_1_property_type_label', 'label', 'refinance_mortgage_1', 'form', true),
('refinance_mortgage_1_property_type_ph', 'placeholder', 'refinance_mortgage_1', 'form', true);

COMMIT;

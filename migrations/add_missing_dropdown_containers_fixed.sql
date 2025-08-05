-- ================================================================
-- FIX 2: Add Missing Dropdown Containers (FIXED VERSION)
-- ================================================================
-- This script adds missing dropdown containers for screens with orphaned options
-- 
-- Screens Fixed:
-- - refinance_credit_1: 13 options, 0 dropdowns
-- - refinance_credit_3: 19 options, 0 dropdowns  
-- - refinance_step1: 21 options, 0 dropdowns
-- - mortgage_step3: 23 options, 0 dropdowns
-- - mortgage_step4: 4 options, 0 dropdowns
-- - temporary_franchise: 23 options, 0 dropdowns
-- - tenders_for_brokers: 27 options, 0 dropdowns
-- - tenders_for_lawyers: 20 options, 0 dropdowns
-- - cooperation: 10 options, 0 dropdowns
-- 
-- Date: 2025-01-25
-- ================================================================

BEGIN;

-- ================================================================
-- REFINANCE_CREDIT_1 - Add dropdown containers
-- ================================================================

-- Bank selection dropdown
INSERT INTO content_items (content_key, component_type, screen_location, category, is_active)
VALUES ('refinance_credit_bank', 'dropdown', 'refinance_credit_1', 'form', true);

-- Why refinance dropdown  
INSERT INTO content_items (content_key, component_type, screen_location, category, is_active)
VALUES ('refinance_credit_why', 'dropdown', 'refinance_credit_1', 'form', true);

-- ================================================================
-- REFINANCE_CREDIT_3 - Add dropdown containers
-- ================================================================

-- Debt types dropdown
INSERT INTO content_items (content_key, component_type, screen_location, category, is_active)
VALUES ('refinance_credit_debt_types', 'dropdown', 'refinance_credit_3', 'form', true);

-- Additional income dropdown
INSERT INTO content_items (content_key, component_type, screen_location, category, is_active)
VALUES ('refinance_credit_additional_income', 'dropdown', 'refinance_credit_3', 'form', true);

-- Main source dropdown
INSERT INTO content_items (content_key, component_type, screen_location, category, is_active)
VALUES ('refinance_credit_main_source', 'dropdown', 'refinance_credit_3', 'form', true);

-- ================================================================
-- REFINANCE_STEP1 - Add dropdown containers
-- ================================================================

-- Bank selection dropdown
INSERT INTO content_items (content_key, component_type, screen_location, category, is_active)
VALUES ('refinance_step1_bank', 'dropdown', 'refinance_step1', 'form', true);

-- Program selection dropdown
INSERT INTO content_items (content_key, component_type, screen_location, category, is_active)
VALUES ('refinance_step1_program', 'dropdown', 'refinance_step1', 'form', true);

-- Property type dropdown
INSERT INTO content_items (content_key, component_type, screen_location, category, is_active)
VALUES ('refinance_step1_property_type', 'dropdown', 'refinance_step1', 'form', true);

-- Registration status dropdown
INSERT INTO content_items (content_key, component_type, screen_location, category, is_active)
VALUES ('refinance_step1_registration', 'dropdown', 'refinance_step1', 'form', true);

-- Why refinance dropdown
INSERT INTO content_items (content_key, component_type, screen_location, category, is_active)
VALUES ('refinance_step1_why', 'dropdown', 'refinance_step1', 'form', true);

-- ================================================================
-- MORTGAGE_STEP3 - Add dropdown containers
-- ================================================================

-- Main source dropdown
INSERT INTO content_items (content_key, component_type, screen_location, category, is_active)
VALUES ('mortgage_step3_main_source', 'dropdown', 'mortgage_step3', 'form', true);

-- Additional income dropdown
INSERT INTO content_items (content_key, component_type, screen_location, category, is_active)
VALUES ('mortgage_step3_additional_income', 'dropdown', 'mortgage_step3', 'form', true);

-- Obligations dropdown
INSERT INTO content_items (content_key, component_type, screen_location, category, is_active)
VALUES ('mortgage_step3_obligations', 'dropdown', 'mortgage_step3', 'form', true);

-- ================================================================
-- MORTGAGE_STEP4 - Add dropdown containers
-- ================================================================

-- Filter dropdown
INSERT INTO content_items (content_key, component_type, screen_location, category, is_active)
VALUES ('mortgage_step4_filter', 'dropdown', 'mortgage_step4', 'form', true);

-- ================================================================
-- TEMPORARY_FRANCHISE - Add dropdown containers
-- ================================================================

-- Includes dropdown
INSERT INTO content_items (content_key, component_type, screen_location, category, is_active)
VALUES ('temporary_franchise_includes', 'dropdown', 'temporary_franchise', 'form', true);

-- Steps dropdown
INSERT INTO content_items (content_key, component_type, screen_location, category, is_active)
VALUES ('temporary_franchise_steps', 'dropdown', 'temporary_franchise', 'form', true);

-- ================================================================
-- TENDERS_FOR_BROKERS - Add dropdown containers
-- ================================================================

-- License features dropdown
INSERT INTO content_items (content_key, component_type, screen_location, category, is_active)
VALUES ('tenders_for_brokers_license_features', 'dropdown', 'tenders_for_brokers', 'form', true);

-- Steps dropdown
INSERT INTO content_items (content_key, component_type, screen_location, category, is_active)
VALUES ('tenders_for_brokers_steps', 'dropdown', 'tenders_for_brokers', 'form', true);

-- ================================================================
-- TENDERS_FOR_LAWYERS - Add dropdown containers
-- ================================================================

-- Process dropdown
INSERT INTO content_items (content_key, component_type, screen_location, category, is_active)
VALUES ('tenders_for_lawyers_process', 'dropdown', 'tenders_for_lawyers', 'form', true);

-- Steps dropdown
INSERT INTO content_items (content_key, component_type, screen_location, category, is_active)
VALUES ('tenders_for_lawyers_steps', 'dropdown', 'tenders_for_lawyers', 'form', true);

-- ================================================================
-- COOPERATION - Add dropdown containers
-- ================================================================

-- Steps dropdown
INSERT INTO content_items (content_key, component_type, screen_location, category, is_active)
VALUES ('cooperation_steps', 'dropdown', 'cooperation', 'form', true);

COMMIT; 
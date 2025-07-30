-- ================================================================
-- CRITICAL FIX: Refinance Mortgage Screens
-- ================================================================
-- This script fixes all critically broken refinance mortgage screens:
-- - refinance_mortgage_1, refinance_mortgage_2, refinance_mortgage_3, refinance_mortgage_4
-- 
-- Issues Fixed:
-- 1. All null categories
-- 2. Missing dropdown containers
-- 3. Missing dropdown options
-- 4. Missing placeholders and labels
-- 5. Missing translations
-- 
-- Date: 2025-01-25
-- ================================================================

BEGIN;

-- ================================================================
-- STEP 1: Fix Existing Broken Items (12 items with null categories)
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
-- STEP 2: Add Dropdown Structure for refinance_mortgage_1
-- ================================================================

-- Add Bank Selection Dropdown Container
INSERT INTO content_items (content_key, component_type, screen_location, category, is_active)
VALUES ('mortgage_refinance_bank', 'dropdown', 'refinance_mortgage_1', 'form', true)
ON CONFLICT (content_key, screen_location) DO NOTHING;

-- Add Bank Options
INSERT INTO content_items (content_key, component_type, screen_location, category, is_active)
VALUES 
('mortgage_refinance_bank_hapoalim', 'option', 'refinance_mortgage_1', 'form', true),
('mortgage_refinance_bank_leumi', 'option', 'refinance_mortgage_1', 'form', true),
('mortgage_refinance_bank_discount', 'option', 'refinance_mortgage_1', 'form', true),
('mortgage_refinance_bank_massad', 'option', 'refinance_mortgage_1', 'form', true)
ON CONFLICT (content_key, screen_location) DO NOTHING;

-- Add Bank Dropdown Placeholder and Label
INSERT INTO content_items (content_key, component_type, screen_location, category, is_active)
VALUES 
('mortgage_refinance_bank_ph', 'placeholder', 'refinance_mortgage_1', 'form', true),
('mortgage_refinance_bank_label', 'label', 'refinance_mortgage_1', 'form', true)
ON CONFLICT (content_key, screen_location) DO NOTHING;

-- Add Form Field Labels for refinance_mortgage_1
INSERT INTO content_items (content_key, component_type, screen_location, category, is_active)
VALUES 
('mortgage_refinance_left_label', 'label', 'refinance_mortgage_1', 'form', true),
('mortgage_refinance_price_label', 'label', 'refinance_mortgage_1', 'form', true),
('mortgage_refinance_step_1_label', 'label', 'refinance_mortgage_1', 'headers', true)
ON CONFLICT (content_key, screen_location) DO NOTHING;

-- ================================================================
-- STEP 3: Add Dropdown Structure for refinance_mortgage_2
-- ================================================================

-- Add Property Type Dropdown Container
INSERT INTO content_items (content_key, component_type, screen_location, category, is_active)
VALUES ('mortgage_refinance_type', 'dropdown', 'refinance_mortgage_2', 'form', true)
ON CONFLICT (content_key, screen_location) DO NOTHING;

-- Add Property Type Placeholder and Label
INSERT INTO content_items (content_key, component_type, screen_location, category, is_active)
VALUES 
('mortgage_refinance_type_ph', 'placeholder', 'refinance_mortgage_2', 'form', true),
('mortgage_refinance_type_label', 'label', 'refinance_mortgage_2', 'form', true)
ON CONFLICT (content_key, screen_location) DO NOTHING;

-- Add Registration Status Dropdown Container
INSERT INTO content_items (content_key, component_type, screen_location, category, is_active)
VALUES ('mortgage_refinance_registered', 'dropdown', 'refinance_mortgage_2', 'form', true)
ON CONFLICT (content_key, screen_location) DO NOTHING;

-- Add Registration Status Options
INSERT INTO content_items (content_key, component_type, screen_location, category, is_active)
VALUES 
('mortgage_refinance_reg_option_1', 'option', 'refinance_mortgage_2', 'form', true),
('mortgage_refinance_reg_option_2', 'option', 'refinance_mortgage_2', 'form', true)
ON CONFLICT (content_key, screen_location) DO NOTHING;

-- Add Registration Status Placeholder and Label
INSERT INTO content_items (content_key, component_type, screen_location, category, is_active)
VALUES 
('mortgage_refinance_registered_ph', 'placeholder', 'refinance_mortgage_2', 'form', true),
('mortgage_refinance_registered_label', 'label', 'refinance_mortgage_2', 'form', true)
ON CONFLICT (content_key, screen_location) DO NOTHING;

-- Add Refinance Purpose Dropdown Container
INSERT INTO content_items (content_key, component_type, screen_location, category, is_active)
VALUES ('mortgage_refinance_why', 'dropdown', 'refinance_mortgage_2', 'form', true)
ON CONFLICT (content_key, screen_location) DO NOTHING;

-- Add Refinance Purpose Options
INSERT INTO content_items (content_key, component_type, screen_location, category, is_active)
VALUES 
('mortgage_refinance_why_option_1', 'option', 'refinance_mortgage_2', 'form', true),
('mortgage_refinance_why_option_2', 'option', 'refinance_mortgage_2', 'form', true),
('mortgage_refinance_why_option_3', 'option', 'refinance_mortgage_2', 'form', true),
('mortgage_refinance_why_option_4', 'option', 'refinance_mortgage_2', 'form', true),
('mortgage_refinance_why_option_5', 'option', 'refinance_mortgage_2', 'form', true)
ON CONFLICT (content_key, screen_location) DO NOTHING;

-- Add Refinance Purpose Placeholder and Label
INSERT INTO content_items (content_key, component_type, screen_location, category, is_active)
VALUES 
('mortgage_refinance_why_ph', 'placeholder', 'refinance_mortgage_2', 'form', true),
('mortgage_refinance_why_label', 'label', 'refinance_mortgage_2', 'form', true),
('mortgage_refinance_step_2_label', 'label', 'refinance_mortgage_2', 'headers', true)
ON CONFLICT (content_key, screen_location) DO NOTHING;

-- ================================================================
-- STEP 4: Add Step Headers for refinance_mortgage_3 and refinance_mortgage_4
-- ================================================================

INSERT INTO content_items (content_key, component_type, screen_location, category, is_active)
VALUES 
('mortgage_refinance_step_3_label', 'label', 'refinance_mortgage_3', 'headers', true),
('mortgage_refinance_step_4_label', 'label', 'refinance_mortgage_4', 'headers', true)
ON CONFLICT (content_key, screen_location) DO NOTHING;

-- ================================================================
-- STEP 5: Add English Translations
-- ================================================================

-- Bank Dropdown - refinance_mortgage_1
INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'en', 'Current Bank', 'approved' 
FROM content_items ci 
WHERE ci.content_key = 'mortgage_refinance_bank_label' AND ci.screen_location = 'refinance_mortgage_1'
ON CONFLICT (content_item_id, language_code) DO NOTHING;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'en', 'Bank Hapoalim', 'approved' 
FROM content_items ci 
WHERE ci.content_key = 'mortgage_refinance_bank_hapoalim' AND ci.screen_location = 'refinance_mortgage_1'
ON CONFLICT (content_item_id, language_code) DO NOTHING;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'en', 'Bank Leumi', 'approved' 
FROM content_items ci 
WHERE ci.content_key = 'mortgage_refinance_bank_leumi' AND ci.screen_location = 'refinance_mortgage_1'
ON CONFLICT (content_item_id, language_code) DO NOTHING;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'en', 'Discount Bank', 'approved' 
FROM content_items ci 
WHERE ci.content_key = 'mortgage_refinance_bank_discount' AND ci.screen_location = 'refinance_mortgage_1'
ON CONFLICT (content_item_id, language_code) DO NOTHING;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'en', 'Massad Bank', 'approved' 
FROM content_items ci 
WHERE ci.content_key = 'mortgage_refinance_bank_massad' AND ci.screen_location = 'refinance_mortgage_1'
ON CONFLICT (content_item_id, language_code) DO NOTHING;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'en', 'Select Bank from List', 'approved' 
FROM content_items ci 
WHERE ci.content_key = 'mortgage_refinance_bank_ph' AND ci.screen_location = 'refinance_mortgage_1'
ON CONFLICT (content_item_id, language_code) DO NOTHING;

-- Form Field Labels - refinance_mortgage_1
INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'en', 'Remaining Mortgage Balance', 'approved' 
FROM content_items ci 
WHERE ci.content_key = 'mortgage_refinance_left_label' AND ci.screen_location = 'refinance_mortgage_1'
ON CONFLICT (content_item_id, language_code) DO NOTHING;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'en', 'Current Property Value', 'approved' 
FROM content_items ci 
WHERE ci.content_key = 'mortgage_refinance_price_label' AND ci.screen_location = 'refinance_mortgage_1'
ON CONFLICT (content_item_id, language_code) DO NOTHING;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'en', 'Step 1 - Existing mortgage details', 'approved' 
FROM content_items ci 
WHERE ci.content_key = 'mortgage_refinance_step_1_label' AND ci.screen_location = 'refinance_mortgage_1'
ON CONFLICT (content_item_id, language_code) DO NOTHING;

-- Property Type Dropdown - refinance_mortgage_2
INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'en', 'Current Interest Type', 'approved' 
FROM content_items ci 
WHERE ci.content_key = 'mortgage_refinance_type_label' AND ci.screen_location = 'refinance_mortgage_2'
ON CONFLICT (content_item_id, language_code) DO NOTHING;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'en', 'Select Interest Type', 'approved' 
FROM content_items ci 
WHERE ci.content_key = 'mortgage_refinance_type_ph' AND ci.screen_location = 'refinance_mortgage_2'
ON CONFLICT (content_item_id, language_code) DO NOTHING;

-- Registration Status Dropdown - refinance_mortgage_2
INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'en', 'Is the Mortgage Registered?', 'approved' 
FROM content_items ci 
WHERE ci.content_key = 'mortgage_refinance_registered_label' AND ci.screen_location = 'refinance_mortgage_2'
ON CONFLICT (content_item_id, language_code) DO NOTHING;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'en', 'Yes, Registered in Land Registry', 'approved' 
FROM content_items ci 
WHERE ci.content_key = 'mortgage_refinance_reg_option_1' AND ci.screen_location = 'refinance_mortgage_2'
ON CONFLICT (content_item_id, language_code) DO NOTHING;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'en', 'No, Not Registered', 'approved' 
FROM content_items ci 
WHERE ci.content_key = 'mortgage_refinance_reg_option_2' AND ci.screen_location = 'refinance_mortgage_2'
ON CONFLICT (content_item_id, language_code) DO NOTHING;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'en', 'Select Registration Status', 'approved' 
FROM content_items ci 
WHERE ci.content_key = 'mortgage_refinance_registered_ph' AND ci.screen_location = 'refinance_mortgage_2'
ON CONFLICT (content_item_id, language_code) DO NOTHING;

-- Refinance Purpose Dropdown - refinance_mortgage_2
INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'en', 'Purpose of Mortgage Refinance', 'approved' 
FROM content_items ci 
WHERE ci.content_key = 'mortgage_refinance_why_label' AND ci.screen_location = 'refinance_mortgage_2'
ON CONFLICT (content_item_id, language_code) DO NOTHING;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'en', 'Lower Interest Rate', 'approved' 
FROM content_items ci 
WHERE ci.content_key = 'mortgage_refinance_why_option_1' AND ci.screen_location = 'refinance_mortgage_2'
ON CONFLICT (content_item_id, language_code) DO NOTHING;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'en', 'Reduce Monthly Payment', 'approved' 
FROM content_items ci 
WHERE ci.content_key = 'mortgage_refinance_why_option_2' AND ci.screen_location = 'refinance_mortgage_2'
ON CONFLICT (content_item_id, language_code) DO NOTHING;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'en', 'Shorten Mortgage Term', 'approved' 
FROM content_items ci 
WHERE ci.content_key = 'mortgage_refinance_why_option_3' AND ci.screen_location = 'refinance_mortgage_2'
ON CONFLICT (content_item_id, language_code) DO NOTHING;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'en', 'Cash Out Refinance', 'approved' 
FROM content_items ci 
WHERE ci.content_key = 'mortgage_refinance_why_option_4' AND ci.screen_location = 'refinance_mortgage_2'
ON CONFLICT (content_item_id, language_code) DO NOTHING;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'en', 'Consolidate Debts', 'approved' 
FROM content_items ci 
WHERE ci.content_key = 'mortgage_refinance_why_option_5' AND ci.screen_location = 'refinance_mortgage_2'
ON CONFLICT (content_item_id, language_code) DO NOTHING;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'en', 'Select Refinance Purpose', 'approved' 
FROM content_items ci 
WHERE ci.content_key = 'mortgage_refinance_why_ph' AND ci.screen_location = 'refinance_mortgage_2'
ON CONFLICT (content_item_id, language_code) DO NOTHING;

-- Step Headers
INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'en', 'Step 2 - Personal details', 'approved' 
FROM content_items ci 
WHERE ci.content_key = 'mortgage_refinance_step_2_label' AND ci.screen_location = 'refinance_mortgage_2'
ON CONFLICT (content_item_id, language_code) DO NOTHING;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'en', 'Step 3 - Income details', 'approved' 
FROM content_items ci 
WHERE ci.content_key = 'mortgage_refinance_step_3_label' AND ci.screen_location = 'refinance_mortgage_3'
ON CONFLICT (content_item_id, language_code) DO NOTHING;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'en', 'Step 4 - Application summary', 'approved' 
FROM content_items ci 
WHERE ci.content_key = 'mortgage_refinance_step_4_label' AND ci.screen_location = 'refinance_mortgage_4'
ON CONFLICT (content_item_id, language_code) DO NOTHING;

-- ================================================================
-- STEP 6: Add Hebrew Translations
-- ================================================================

-- Bank Dropdown - refinance_mortgage_1
INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'he', 'בנק המשכנתא הנוכחית', 'approved' 
FROM content_items ci 
WHERE ci.content_key = 'mortgage_refinance_bank_label' AND ci.screen_location = 'refinance_mortgage_1'
ON CONFLICT (content_item_id, language_code) DO NOTHING;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'he', 'בנק הפועלים', 'approved' 
FROM content_items ci 
WHERE ci.content_key = 'mortgage_refinance_bank_hapoalim' AND ci.screen_location = 'refinance_mortgage_1'
ON CONFLICT (content_item_id, language_code) DO NOTHING;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'he', 'בנק לאומי', 'approved' 
FROM content_items ci 
WHERE ci.content_key = 'mortgage_refinance_bank_leumi' AND ci.screen_location = 'refinance_mortgage_1'
ON CONFLICT (content_item_id, language_code) DO NOTHING;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'he', 'בנק דיסקונט', 'approved' 
FROM content_items ci 
WHERE ci.content_key = 'mortgage_refinance_bank_discount' AND ci.screen_location = 'refinance_mortgage_1'
ON CONFLICT (content_item_id, language_code) DO NOTHING;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'he', 'בנק מסד', 'approved' 
FROM content_items ci 
WHERE ci.content_key = 'mortgage_refinance_bank_massad' AND ci.screen_location = 'refinance_mortgage_1'
ON CONFLICT (content_item_id, language_code) DO NOTHING;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'he', 'בחר בנק מהרשימה', 'approved' 
FROM content_items ci 
WHERE ci.content_key = 'mortgage_refinance_bank_ph' AND ci.screen_location = 'refinance_mortgage_1'
ON CONFLICT (content_item_id, language_code) DO NOTHING;

-- Form Field Labels - refinance_mortgage_1
INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'he', 'יתרת המשכנתא', 'approved' 
FROM content_items ci 
WHERE ci.content_key = 'mortgage_refinance_left_label' AND ci.screen_location = 'refinance_mortgage_1'
ON CONFLICT (content_item_id, language_code) DO NOTHING;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'he', 'שווי הנכס הנוכחי', 'approved' 
FROM content_items ci 
WHERE ci.content_key = 'mortgage_refinance_price_label' AND ci.screen_location = 'refinance_mortgage_1'
ON CONFLICT (content_item_id, language_code) DO NOTHING;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'he', 'שלב 1 - פרטי המשכנתא הקיימת', 'approved' 
FROM content_items ci 
WHERE ci.content_key = 'mortgage_refinance_step_1_label' AND ci.screen_location = 'refinance_mortgage_1'
ON CONFLICT (content_item_id, language_code) DO NOTHING;

-- Property Type Dropdown - refinance_mortgage_2
INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'he', 'סוג הנכס', 'approved' 
FROM content_items ci 
WHERE ci.content_key = 'mortgage_refinance_type_label' AND ci.screen_location = 'refinance_mortgage_2'
ON CONFLICT (content_item_id, language_code) DO NOTHING;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'he', 'בחר סוג נכס', 'approved' 
FROM content_items ci 
WHERE ci.content_key = 'mortgage_refinance_type_ph' AND ci.screen_location = 'refinance_mortgage_2'
ON CONFLICT (content_item_id, language_code) DO NOTHING;

-- Registration Status Dropdown - refinance_mortgage_2
INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'he', 'האם המשכנתא רשומה בטאבו?', 'approved' 
FROM content_items ci 
WHERE ci.content_key = 'mortgage_refinance_registered_label' AND ci.screen_location = 'refinance_mortgage_2'
ON CONFLICT (content_item_id, language_code) DO NOTHING;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'he', 'כן, רשומה בטאבו', 'approved' 
FROM content_items ci 
WHERE ci.content_key = 'mortgage_refinance_reg_option_1' AND ci.screen_location = 'refinance_mortgage_2'
ON CONFLICT (content_item_id, language_code) DO NOTHING;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'he', 'לא, לא רשומה', 'approved' 
FROM content_items ci 
WHERE ci.content_key = 'mortgage_refinance_reg_option_2' AND ci.screen_location = 'refinance_mortgage_2'
ON CONFLICT (content_item_id, language_code) DO NOTHING;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'he', 'בחר אפשרות רישום', 'approved' 
FROM content_items ci 
WHERE ci.content_key = 'mortgage_refinance_registered_ph' AND ci.screen_location = 'refinance_mortgage_2'
ON CONFLICT (content_item_id, language_code) DO NOTHING;

-- Refinance Purpose Dropdown - refinance_mortgage_2
INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'he', 'מטרת מחזור המשכנתא', 'approved' 
FROM content_items ci 
WHERE ci.content_key = 'mortgage_refinance_why_label' AND ci.screen_location = 'refinance_mortgage_2'
ON CONFLICT (content_item_id, language_code) DO NOTHING;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'he', 'הפחתת הריבית', 'approved' 
FROM content_items ci 
WHERE ci.content_key = 'mortgage_refinance_why_option_1' AND ci.screen_location = 'refinance_mortgage_2'
ON CONFLICT (content_item_id, language_code) DO NOTHING;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'he', 'הפחתת התשלום החודשי', 'approved' 
FROM content_items ci 
WHERE ci.content_key = 'mortgage_refinance_why_option_2' AND ci.screen_location = 'refinance_mortgage_2'
ON CONFLICT (content_item_id, language_code) DO NOTHING;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'he', 'קיצור תקופת המשכנתא', 'approved' 
FROM content_items ci 
WHERE ci.content_key = 'mortgage_refinance_why_option_3' AND ci.screen_location = 'refinance_mortgage_2'
ON CONFLICT (content_item_id, language_code) DO NOTHING;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'he', 'משיכת מזומן נוסף', 'approved' 
FROM content_items ci 
WHERE ci.content_key = 'mortgage_refinance_why_option_4' AND ci.screen_location = 'refinance_mortgage_2'
ON CONFLICT (content_item_id, language_code) DO NOTHING;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'he', 'איחוד חובות', 'approved' 
FROM content_items ci 
WHERE ci.content_key = 'mortgage_refinance_why_option_5' AND ci.screen_location = 'refinance_mortgage_2'
ON CONFLICT (content_item_id, language_code) DO NOTHING;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'he', 'בחר מטרת מחזור', 'approved' 
FROM content_items ci 
WHERE ci.content_key = 'mortgage_refinance_why_ph' AND ci.screen_location = 'refinance_mortgage_2'
ON CONFLICT (content_item_id, language_code) DO NOTHING;

-- Step Headers
INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'he', 'שלב 2 - פרטים אישיים', 'approved' 
FROM content_items ci 
WHERE ci.content_key = 'mortgage_refinance_step_2_label' AND ci.screen_location = 'refinance_mortgage_2'
ON CONFLICT (content_item_id, language_code) DO NOTHING;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'he', 'שלב 3 - פרטי הכנסה', 'approved' 
FROM content_items ci 
WHERE ci.content_key = 'mortgage_refinance_step_3_label' AND ci.screen_location = 'refinance_mortgage_3'
ON CONFLICT (content_item_id, language_code) DO NOTHING;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'he', 'שלב 4 - סיכום הבקשה', 'approved' 
FROM content_items ci 
WHERE ci.content_key = 'mortgage_refinance_step_4_label' AND ci.screen_location = 'refinance_mortgage_4'
ON CONFLICT (content_item_id, language_code) DO NOTHING;

-- ================================================================
-- STEP 7: Add Russian Translations
-- ================================================================

-- Bank Dropdown - refinance_mortgage_1
INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'ru', 'Банк текущей ипотеки', 'approved' 
FROM content_items ci 
WHERE ci.content_key = 'mortgage_refinance_bank_label' AND ci.screen_location = 'refinance_mortgage_1'
ON CONFLICT (content_item_id, language_code) DO NOTHING;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'ru', 'Банк Апоалим', 'approved' 
FROM content_items ci 
WHERE ci.content_key = 'mortgage_refinance_bank_hapoalim' AND ci.screen_location = 'refinance_mortgage_1'
ON CONFLICT (content_item_id, language_code) DO NOTHING;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'ru', 'Банк Леуми', 'approved' 
FROM content_items ci 
WHERE ci.content_key = 'mortgage_refinance_bank_leumi' AND ci.screen_location = 'refinance_mortgage_1'
ON CONFLICT (content_item_id, language_code) DO NOTHING;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'ru', 'Банк Дисконт', 'approved' 
FROM content_items ci 
WHERE ci.content_key = 'mortgage_refinance_bank_discount' AND ci.screen_location = 'refinance_mortgage_1'
ON CONFLICT (content_item_id, language_code) DO NOTHING;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'ru', 'Банк Масад', 'approved' 
FROM content_items ci 
WHERE ci.content_key = 'mortgage_refinance_bank_massad' AND ci.screen_location = 'refinance_mortgage_1'
ON CONFLICT (content_item_id, language_code) DO NOTHING;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'ru', 'Выберите банк из списка', 'approved' 
FROM content_items ci 
WHERE ci.content_key = 'mortgage_refinance_bank_ph' AND ci.screen_location = 'refinance_mortgage_1'
ON CONFLICT (content_item_id, language_code) DO NOTHING;

-- Form Field Labels - refinance_mortgage_1
INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'ru', 'Остаток по ипотеке', 'approved' 
FROM content_items ci 
WHERE ci.content_key = 'mortgage_refinance_left_label' AND ci.screen_location = 'refinance_mortgage_1'
ON CONFLICT (content_item_id, language_code) DO NOTHING;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'ru', 'Текущая стоимость недвижимости', 'approved' 
FROM content_items ci 
WHERE ci.content_key = 'mortgage_refinance_price_label' AND ci.screen_location = 'refinance_mortgage_1'
ON CONFLICT (content_item_id, language_code) DO NOTHING;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'ru', 'Шаг 1 - Данные существующей ипотеки', 'approved' 
FROM content_items ci 
WHERE ci.content_key = 'mortgage_refinance_step_1_label' AND ci.screen_location = 'refinance_mortgage_1'
ON CONFLICT (content_item_id, language_code) DO NOTHING;

-- Property Type Dropdown - refinance_mortgage_2
INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'ru', 'Тип недвижимости', 'approved' 
FROM content_items ci 
WHERE ci.content_key = 'mortgage_refinance_type_label' AND ci.screen_location = 'refinance_mortgage_2'
ON CONFLICT (content_item_id, language_code) DO NOTHING;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'ru', 'Выберите тип недвижимости', 'approved' 
FROM content_items ci 
WHERE ci.content_key = 'mortgage_refinance_type_ph' AND ci.screen_location = 'refinance_mortgage_2'
ON CONFLICT (content_item_id, language_code) DO NOTHING;

-- Registration Status Dropdown - refinance_mortgage_2
INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'ru', 'Зарегистрирована ли ипотека в земельном реестре?', 'approved' 
FROM content_items ci 
WHERE ci.content_key = 'mortgage_refinance_registered_label' AND ci.screen_location = 'refinance_mortgage_2'
ON CONFLICT (content_item_id, language_code) DO NOTHING;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'ru', 'Да, зарегистрирована в реестре', 'approved' 
FROM content_items ci 
WHERE ci.content_key = 'mortgage_refinance_reg_option_1' AND ci.screen_location = 'refinance_mortgage_2'
ON CONFLICT (content_item_id, language_code) DO NOTHING;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'ru', 'Нет, не зарегистрирована', 'approved' 
FROM content_items ci 
WHERE ci.content_key = 'mortgage_refinance_reg_option_2' AND ci.screen_location = 'refinance_mortgage_2'
ON CONFLICT (content_item_id, language_code) DO NOTHING;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'ru', 'Выберите вариант регистрации', 'approved' 
FROM content_items ci 
WHERE ci.content_key = 'mortgage_refinance_registered_ph' AND ci.screen_location = 'refinance_mortgage_2'
ON CONFLICT (content_item_id, language_code) DO NOTHING;

-- Refinance Purpose Dropdown - refinance_mortgage_2
INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'ru', 'Цель рефинансирования ипотеки', 'approved' 
FROM content_items ci 
WHERE ci.content_key = 'mortgage_refinance_why_label' AND ci.screen_location = 'refinance_mortgage_2'
ON CONFLICT (content_item_id, language_code) DO NOTHING;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'ru', 'Снижение процентной ставки', 'approved' 
FROM content_items ci 
WHERE ci.content_key = 'mortgage_refinance_why_option_1' AND ci.screen_location = 'refinance_mortgage_2'
ON CONFLICT (content_item_id, language_code) DO NOTHING;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'ru', 'Снижение ежемесячного платежа', 'approved' 
FROM content_items ci 
WHERE ci.content_key = 'mortgage_refinance_why_option_2' AND ci.screen_location = 'refinance_mortgage_2'
ON CONFLICT (content_item_id, language_code) DO NOTHING;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'ru', 'Сокращение срока ипотеки', 'approved' 
FROM content_items ci 
WHERE ci.content_key = 'mortgage_refinance_why_option_3' AND ci.screen_location = 'refinance_mortgage_2'
ON CONFLICT (content_item_id, language_code) DO NOTHING;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'ru', 'Получение дополнительных наличных', 'approved' 
FROM content_items ci 
WHERE ci.content_key = 'mortgage_refinance_why_option_4' AND ci.screen_location = 'refinance_mortgage_2'
ON CONFLICT (content_item_id, language_code) DO NOTHING;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'ru', 'Консолидация долгов', 'approved' 
FROM content_items ci 
WHERE ci.content_key = 'mortgage_refinance_why_option_5' AND ci.screen_location = 'refinance_mortgage_2'
ON CONFLICT (content_item_id, language_code) DO NOTHING;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'ru', 'Выберите цель рефинансирования', 'approved' 
FROM content_items ci 
WHERE ci.content_key = 'mortgage_refinance_why_ph' AND ci.screen_location = 'refinance_mortgage_2'
ON CONFLICT (content_item_id, language_code) DO NOTHING;

-- Step Headers
INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'ru', 'Шаг 2 - Личные данные', 'approved' 
FROM content_items ci 
WHERE ci.content_key = 'mortgage_refinance_step_2_label' AND ci.screen_location = 'refinance_mortgage_2'
ON CONFLICT (content_item_id, language_code) DO NOTHING;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'ru', 'Шаг 3 - Сведения о доходах', 'approved' 
FROM content_items ci 
WHERE ci.content_key = 'mortgage_refinance_step_3_label' AND ci.screen_location = 'refinance_mortgage_3'
ON CONFLICT (content_item_id, language_code) DO NOTHING;

INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT ci.id, 'ru', 'Шаг 4 - Итоги заявки', 'approved' 
FROM content_items ci 
WHERE ci.content_key = 'mortgage_refinance_step_4_label' AND ci.screen_location = 'refinance_mortgage_4'
ON CONFLICT (content_item_id, language_code) DO NOTHING;

COMMIT;

-- ================================================================
-- VALIDATION QUERIES (Run after migration to verify success)
-- ================================================================

-- Check all categories are fixed (should return 0 null_categories)
-- SELECT screen_location, COUNT(*) as total,
--        COUNT(CASE WHEN category IS NULL THEN 1 END) as null_categories
-- FROM content_items 
-- WHERE screen_location LIKE 'refinance_mortgage_%'
-- GROUP BY screen_location;

-- Check dropdown structure is created
-- SELECT screen_location, component_type, COUNT(*) as count
-- FROM content_items 
-- WHERE screen_location LIKE 'refinance_mortgage_%'
-- GROUP BY screen_location, component_type
-- ORDER BY screen_location, component_type;

-- Check translations exist (should have 3 translations per item)
-- SELECT ci.screen_location, ci.component_type, COUNT(ct.id) as translation_count
-- FROM content_items ci
-- LEFT JOIN content_translations ct ON ci.id = ct.content_item_id
-- WHERE ci.screen_location LIKE 'refinance_mortgage_%'
-- GROUP BY ci.screen_location, ci.component_type
-- ORDER BY ci.screen_location, ci.component_type; 
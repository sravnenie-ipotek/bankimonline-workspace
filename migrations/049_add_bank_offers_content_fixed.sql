-- Migration: Add Bank Offers and Mortgage Step 4 Content (Fixed for content database)
-- Date: 2025-01-27
-- Purpose: Add missing translations for bank offers and mortgage step 4 to content database

-- =====================================================
-- BANK OFFERS COMPONENT CONTENT
-- =====================================================

-- Prime Rate Mortgage
INSERT INTO content_items (content_key, screen_location, component_type, category, is_active, created_at)
VALUES ('mortgage_prime_percent', 'bank_offers', 'label', 'program_types', true, NOW())
ON CONFLICT (content_key, screen_location) DO NOTHING;

INSERT INTO content_translations (content_item_id, language_code, content_value, status, created_at)
SELECT id, 'he', 'משכנתא בריבית פריים', 'approved', NOW()
FROM content_items WHERE content_key = 'mortgage_prime_percent' AND screen_location = 'bank_offers'
ON CONFLICT (content_item_id, language_code) DO NOTHING;

-- Fixed Rate Mortgage
INSERT INTO content_items (content_key, screen_location, component_type, category, is_active, created_at)
VALUES ('mortgage_fix_percent', 'bank_offers', 'label', 'program_types', true, NOW())
ON CONFLICT (content_key, screen_location) DO NOTHING;

INSERT INTO content_translations (content_item_id, language_code, content_value, status, created_at)
SELECT id, 'he', 'משכנתא בריבית קבועה', 'approved', NOW()
FROM content_items WHERE content_key = 'mortgage_fix_percent' AND screen_location = 'bank_offers'
ON CONFLICT (content_item_id, language_code) DO NOTHING;

-- Variable Rate Mortgage
INSERT INTO content_items (content_key, screen_location, component_type, category, is_active, created_at)
VALUES ('mortgage_float_percent', 'bank_offers', 'label', 'program_types', true, NOW())
ON CONFLICT (content_key, screen_location) DO NOTHING;

INSERT INTO content_translations (content_item_id, language_code, content_value, status, created_at)
SELECT id, 'he', 'משכנתא בריבית משתנה', 'approved', NOW()
FROM content_items WHERE content_key = 'mortgage_float_percent' AND screen_location = 'bank_offers'
ON CONFLICT (content_item_id, language_code) DO NOTHING;

-- Mortgage Registration
INSERT INTO content_items (content_key, screen_location, component_type, category, is_active, created_at)
VALUES ('mortgage_register', 'bank_offers', 'label', 'labels', true, NOW())
ON CONFLICT (content_key, screen_location) DO NOTHING;

INSERT INTO content_translations (content_item_id, language_code, content_value, status, created_at)
SELECT id, 'he', 'רישום משכנתא', 'approved', NOW()
FROM content_items WHERE content_key = 'mortgage_register' AND screen_location = 'bank_offers'
ON CONFLICT (content_item_id, language_code) DO NOTHING;

-- Monthly Payment
INSERT INTO content_items (content_key, screen_location, component_type, category, is_active, created_at)
VALUES ('mortgage_monthly', 'bank_offers', 'label', 'field_labels', true, NOW())
ON CONFLICT (content_key, screen_location) DO NOTHING;

INSERT INTO content_translations (content_item_id, language_code, content_value, status, created_at)
SELECT id, 'he', 'תשלום חודשי', 'approved', NOW()
FROM content_items WHERE content_key = 'mortgage_monthly' AND screen_location = 'bank_offers'
ON CONFLICT (content_item_id, language_code) DO NOTHING;

-- Total Amount
INSERT INTO content_items (content_key, screen_location, component_type, category, is_active, created_at)
VALUES ('mortgage_total', 'bank_offers', 'label', 'field_labels', true, NOW())
ON CONFLICT (content_key, screen_location) DO NOTHING;

INSERT INTO content_translations (content_item_id, language_code, content_value, status, created_at)
SELECT id, 'he', 'סכום כולל', 'approved', NOW()
FROM content_items WHERE content_key = 'mortgage_total' AND screen_location = 'bank_offers'
ON CONFLICT (content_item_id, language_code) DO NOTHING;

-- Interest Rate
INSERT INTO content_items (content_key, screen_location, component_type, category, is_active, created_at)
VALUES ('mortgage_percnt', 'bank_offers', 'label', 'field_labels', true, NOW())
ON CONFLICT (content_key, screen_location) DO NOTHING;

INSERT INTO content_translations (content_item_id, language_code, content_value, status, created_at)
SELECT id, 'he', 'שיעור ריבית', 'approved', NOW()
FROM content_items WHERE content_key = 'mortgage_percnt' AND screen_location = 'bank_offers'
ON CONFLICT (content_item_id, language_code) DO NOTHING;

-- Repayment Period
INSERT INTO content_items (content_key, screen_location, component_type, category, is_active, created_at)
VALUES ('mortgage_term', 'bank_offers', 'label', 'field_labels', true, NOW())
ON CONFLICT (content_key, screen_location) DO NOTHING;

INSERT INTO content_translations (content_item_id, language_code, content_value, status, created_at)
SELECT id, 'he', 'תקופת החזר', 'approved', NOW()
FROM content_items WHERE content_key = 'mortgage_term' AND screen_location = 'bank_offers'
ON CONFLICT (content_item_id, language_code) DO NOTHING;

-- =====================================================
-- MORTGAGE STEP 4 CONTENT (for BankCard component)
-- =====================================================

-- Total Return
INSERT INTO content_items (content_key, screen_location, component_type, category, is_active, created_at)
VALUES ('mortgage_total_return', 'mortgage_step4', 'label', 'field_labels', true, NOW())
ON CONFLICT (content_key, screen_location) DO NOTHING;

INSERT INTO content_translations (content_item_id, language_code, content_value, status, created_at)
SELECT id, 'he', 'סה"כ החזר', 'approved', NOW()
FROM content_items WHERE content_key = 'mortgage_total_return' AND screen_location = 'mortgage_step4'
ON CONFLICT (content_item_id, language_code) DO NOTHING;

-- Select Bank Button
INSERT INTO content_items (content_key, screen_location, component_type, category, is_active, created_at)
VALUES ('mortgage_select_bank', 'mortgage_step4', 'button', 'actions', true, NOW())
ON CONFLICT (content_key, screen_location) DO NOTHING;

INSERT INTO content_translations (content_item_id, language_code, content_value, status, created_at)
SELECT id, 'he', 'בחר בנק זה', 'approved', NOW()
FROM content_items WHERE content_key = 'mortgage_select_bank' AND screen_location = 'mortgage_step4'
ON CONFLICT (content_item_id, language_code) DO NOTHING;

-- Also add labels to mortgage_step4 for consistency
INSERT INTO content_items (content_key, screen_location, component_type, category, is_active, created_at)
VALUES ('mortgage_total', 'mortgage_step4', 'label', 'field_labels', true, NOW())
ON CONFLICT (content_key, screen_location) DO NOTHING;

INSERT INTO content_translations (content_item_id, language_code, content_value, status, created_at)
SELECT id, 'he', 'סכום כולל', 'approved', NOW()
FROM content_items WHERE content_key = 'mortgage_total' AND screen_location = 'mortgage_step4'
ON CONFLICT (content_item_id, language_code) DO NOTHING;

INSERT INTO content_items (content_key, screen_location, component_type, category, is_active, created_at)
VALUES ('mortgage_monthly', 'mortgage_step4', 'label', 'field_labels', true, NOW())
ON CONFLICT (content_key, screen_location) DO NOTHING;

INSERT INTO content_translations (content_item_id, language_code, content_value, status, created_at)
SELECT id, 'he', 'תשלום חודשי', 'approved', NOW()
FROM content_items WHERE content_key = 'mortgage_monthly' AND screen_location = 'mortgage_step4'
ON CONFLICT (content_item_id, language_code) DO NOTHING;

-- Final commit message
-- Added essential Hebrew translations for bank offers and mortgage step 4 to content database
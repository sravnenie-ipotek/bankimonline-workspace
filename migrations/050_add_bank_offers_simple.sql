-- Migration: Add Bank Offers Hebrew Translations (Simple)
-- Date: 2025-01-27
-- Purpose: Add essential Hebrew translations for bank offers display

-- Check and insert only if not exists
DO $$
BEGIN
    -- mortgage_prime_percent for bank_offers
    IF NOT EXISTS (SELECT 1 FROM content_items WHERE content_key = 'mortgage_prime_percent' AND screen_location = 'bank_offers') THEN
        INSERT INTO content_items (content_key, screen_location, component_type, category, is_active, created_at)
        VALUES ('mortgage_prime_percent', 'bank_offers', 'label', 'program_types', true, NOW());
    END IF;
    
    -- mortgage_fix_percent for bank_offers
    IF NOT EXISTS (SELECT 1 FROM content_items WHERE content_key = 'mortgage_fix_percent' AND screen_location = 'bank_offers') THEN
        INSERT INTO content_items (content_key, screen_location, component_type, category, is_active, created_at)
        VALUES ('mortgage_fix_percent', 'bank_offers', 'label', 'program_types', true, NOW());
    END IF;
    
    -- mortgage_float_percent for bank_offers
    IF NOT EXISTS (SELECT 1 FROM content_items WHERE content_key = 'mortgage_float_percent' AND screen_location = 'bank_offers') THEN
        INSERT INTO content_items (content_key, screen_location, component_type, category, is_active, created_at)
        VALUES ('mortgage_float_percent', 'bank_offers', 'label', 'program_types', true, NOW());
    END IF;
    
    -- mortgage_register for bank_offers
    IF NOT EXISTS (SELECT 1 FROM content_items WHERE content_key = 'mortgage_register' AND screen_location = 'bank_offers') THEN
        INSERT INTO content_items (content_key, screen_location, component_type, category, is_active, created_at)
        VALUES ('mortgage_register', 'bank_offers', 'label', 'labels', true, NOW());
    END IF;
END $$;

-- Add Hebrew translations
INSERT INTO content_translations (content_item_id, language_code, content_value, status, created_at)
SELECT id, 'he', 'משכנתא בריבית פריים', 'approved', NOW()
FROM content_items WHERE content_key = 'mortgage_prime_percent' AND screen_location = 'bank_offers'
AND NOT EXISTS (
    SELECT 1 FROM content_translations ct 
    WHERE ct.content_item_id = content_items.id AND ct.language_code = 'he'
);

INSERT INTO content_translations (content_item_id, language_code, content_value, status, created_at)
SELECT id, 'he', 'משכנתא בריבית קבועה', 'approved', NOW()
FROM content_items WHERE content_key = 'mortgage_fix_percent' AND screen_location = 'bank_offers'
AND NOT EXISTS (
    SELECT 1 FROM content_translations ct 
    WHERE ct.content_item_id = content_items.id AND ct.language_code = 'he'
);

INSERT INTO content_translations (content_item_id, language_code, content_value, status, created_at)
SELECT id, 'he', 'משכנתא בריבית משתנה', 'approved', NOW()
FROM content_items WHERE content_key = 'mortgage_float_percent' AND screen_location = 'bank_offers'
AND NOT EXISTS (
    SELECT 1 FROM content_translations ct 
    WHERE ct.content_item_id = content_items.id AND ct.language_code = 'he'
);

INSERT INTO content_translations (content_item_id, language_code, content_value, status, created_at)
SELECT id, 'he', 'רישום משכנתא', 'approved', NOW()
FROM content_items WHERE content_key = 'mortgage_register' AND screen_location = 'bank_offers'
AND NOT EXISTS (
    SELECT 1 FROM content_translations ct 
    WHERE ct.content_item_id = content_items.id AND ct.language_code = 'he'
);
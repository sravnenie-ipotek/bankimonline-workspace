-- Migration: Add admin-configurable bank fallback settings
-- Date: 2025-01-20
-- Purpose: Enable flexible, admin-controlled bank fallback behavior

-- Add fallback configuration columns to banks table
ALTER TABLE banks ADD COLUMN IF NOT EXISTS show_in_fallback BOOLEAN DEFAULT true;
ALTER TABLE banks ADD COLUMN IF NOT EXISTS fallback_priority INTEGER DEFAULT 1;
ALTER TABLE banks ADD COLUMN IF NOT EXISTS fallback_interest_rate DECIMAL(5,2) DEFAULT 5.0;
ALTER TABLE banks ADD COLUMN IF NOT EXISTS fallback_approval_rate DECIMAL(5,2) DEFAULT 80.0;

-- Add fallback configuration table for system-wide settings
CREATE TABLE IF NOT EXISTS bank_fallback_config (
    id SERIAL PRIMARY KEY,
    enable_fallback BOOLEAN DEFAULT true,
    fallback_method VARCHAR(50) DEFAULT 'database_relaxed', -- 'database_relaxed', 'database_all', 'disabled'
    max_fallback_banks INTEGER DEFAULT 3,
    default_term_years INTEGER DEFAULT 25,
    language_preference VARCHAR(10) DEFAULT 'auto', -- 'auto', 'en', 'he', 'ru'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default configuration
INSERT INTO bank_fallback_config (enable_fallback, fallback_method, max_fallback_banks) 
VALUES (true, 'database_relaxed', 3)
ON CONFLICT (id) DO NOTHING;

-- Update existing banks to be included in fallback by default
UPDATE banks SET show_in_fallback = true WHERE show_in_fallback IS NULL;

-- Add comments for documentation
COMMENT ON COLUMN banks.show_in_fallback IS 'Whether this bank should appear in fallback scenarios when no real offers match';
COMMENT ON COLUMN banks.fallback_priority IS 'Priority order for fallback display (lower = higher priority)';
COMMENT ON COLUMN banks.fallback_interest_rate IS 'Default interest rate to use for fallback calculations';
COMMENT ON COLUMN banks.fallback_approval_rate IS 'Simulated approval rate percentage for fallback scenarios';
COMMENT ON TABLE bank_fallback_config IS 'System-wide configuration for bank fallback behavior';
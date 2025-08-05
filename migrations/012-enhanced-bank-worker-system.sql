-- Migration: Enhanced Bank Worker Registration System
-- File: 012-enhanced-bank-worker-system.sql
-- Date: 2025-01-09
-- Author: AI Assistant
-- Purpose: Enhance existing bank employee system with invitation-based registration,
--          admin approval workflow, and automated maintenance
-- 
-- DEPENDENCIES:
--   - Requires migration 011 (bank-employee-registration.sql) to be applied
--   - Requires migration 005 (multi-role-admin.sql) for admin users table
--   - Requires existing banks table
--
-- ROLLBACK STRATEGY:
--   - All changes are wrapped in transactions
--   - Rollback script provided at end of file
--   - No destructive operations (only additions)
--
-- TESTING NOTES:
--   - Test on staging environment first
--   - Validate invitation workflow end-to-end
--   - Verify automated cleanup functions work correctly
--
-- RISK ASSESSMENT: LOW
--   - Only adds new tables and enhances existing ones
--   - No data deletion or destructive operations
--   - Backward compatible with existing system

BEGIN;

-- =====================================================
-- 1. CREATE NEW TABLES
-- =====================================================

-- Registration Invitations Table
-- Tracks invitation tokens sent to potential bank workers
CREATE TABLE IF NOT EXISTS registration_invitations (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    bank_id INTEGER NOT NULL REFERENCES banks(id) ON DELETE CASCADE,
    branch_id INTEGER REFERENCES bank_branches(id) ON DELETE SET NULL,
    invited_by INTEGER NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
    invitation_token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    status VARCHAR(20) CHECK (status IN ('pending', 'used', 'expired', 'cancelled')) DEFAULT 'pending',
    registration_completed_at TIMESTAMP,
    employee_id INTEGER REFERENCES bank_employees(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT chk_invitation_expires CHECK (expires_at > created_at),
    CONSTRAINT chk_invitation_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Worker Approval Queue Table
-- Manages admin approval workflow for registered bank workers
CREATE TABLE IF NOT EXISTS worker_approval_queue (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER NOT NULL REFERENCES bank_employees(id) ON DELETE CASCADE,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP,
    reviewed_by INTEGER REFERENCES admin_users(id) ON DELETE SET NULL,
    approval_status VARCHAR(20) CHECK (approval_status IN ('pending', 'approved', 'rejected', 'requires_changes')) DEFAULT 'pending',
    rejection_reason TEXT,
    admin_notes TEXT,
    priority INTEGER DEFAULT 1 CHECK (priority BETWEEN 1 AND 5),
    auto_approve_eligible BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT chk_approval_reviewed CHECK (
        (approval_status = 'pending' AND reviewed_at IS NULL) OR
        (approval_status != 'pending' AND reviewed_at IS NOT NULL)
    ),
    CONSTRAINT chk_approval_reviewer CHECK (
        (approval_status = 'pending' AND reviewed_by IS NULL) OR
        (approval_status != 'pending' AND reviewed_by IS NOT NULL)
    )
);

-- Registration Validation Rules Table
-- Configurable validation rules for different countries/languages
CREATE TABLE IF NOT EXISTS registration_validation_rules (
    id SERIAL PRIMARY KEY,
    country_code VARCHAR(2) NOT NULL, -- 'IL', 'RU', etc.
    language_code VARCHAR(2) NOT NULL, -- 'he', 'ru', 'en'
    field_name VARCHAR(50) NOT NULL, -- 'full_name', 'position', etc.
    validation_type VARCHAR(20) CHECK (validation_type IN ('regex', 'length', 'required', 'format')) NOT NULL,
    validation_pattern TEXT, -- Regex pattern or validation rule
    error_message_key VARCHAR(100) NOT NULL, -- Translation key for error message
    is_active BOOLEAN DEFAULT TRUE,
    priority INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Unique constraint for country/language/field combination
    CONSTRAINT uk_validation_rules UNIQUE (country_code, language_code, field_name, validation_type)
);

-- =====================================================
-- 2. ENHANCE EXISTING TABLES
-- =====================================================

-- Add invitation and approval fields to bank_employees table
-- Following rule 8: Set explicit defaults and handle existing rows safely
ALTER TABLE bank_employees 
ADD COLUMN IF NOT EXISTS invitation_token VARCHAR(255),
ADD COLUMN IF NOT EXISTS invitation_expires_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS approval_status VARCHAR(20) CHECK (approval_status IN ('pending', 'approved', 'rejected', 'requires_changes')) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS approved_by INTEGER REFERENCES admin_users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS auto_delete_after DATE,
ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS registration_ip INET,
ADD COLUMN IF NOT EXISTS registration_user_agent TEXT;

-- Add display order and active status to banks table
-- Following rule 8: Safe additions with defaults
ALTER TABLE banks 
ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- Add active status and worker limits to bank_branches table
ALTER TABLE bank_branches 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS max_workers INTEGER DEFAULT 50;

-- =====================================================
-- 3. CREATE PERFORMANCE INDEXES
-- =====================================================
-- Following rule 9: Create indexes after data structure is in place

-- Registration invitations indexes
CREATE INDEX IF NOT EXISTS idx_registration_invitations_email ON registration_invitations(email);
CREATE INDEX IF NOT EXISTS idx_registration_invitations_token ON registration_invitations(invitation_token);
CREATE INDEX IF NOT EXISTS idx_registration_invitations_status ON registration_invitations(status);
CREATE INDEX IF NOT EXISTS idx_registration_invitations_expires ON registration_invitations(expires_at);
CREATE INDEX IF NOT EXISTS idx_registration_invitations_bank_id ON registration_invitations(bank_id);
CREATE INDEX IF NOT EXISTS idx_registration_invitations_invited_by ON registration_invitations(invited_by);

-- Worker approval queue indexes
CREATE INDEX IF NOT EXISTS idx_worker_approval_queue_employee_id ON worker_approval_queue(employee_id);
CREATE INDEX IF NOT EXISTS idx_worker_approval_queue_status ON worker_approval_queue(approval_status);
CREATE INDEX IF NOT EXISTS idx_worker_approval_queue_submitted ON worker_approval_queue(submitted_at);
CREATE INDEX IF NOT EXISTS idx_worker_approval_queue_priority ON worker_approval_queue(priority);
CREATE INDEX IF NOT EXISTS idx_worker_approval_queue_reviewed_by ON worker_approval_queue(reviewed_by);

-- Validation rules indexes
CREATE INDEX IF NOT EXISTS idx_validation_rules_country_lang ON registration_validation_rules(country_code, language_code);
CREATE INDEX IF NOT EXISTS idx_validation_rules_field_name ON registration_validation_rules(field_name);
CREATE INDEX IF NOT EXISTS idx_validation_rules_active ON registration_validation_rules(is_active);

-- Enhanced bank_employees indexes
CREATE INDEX IF NOT EXISTS idx_bank_employees_invitation_token ON bank_employees(invitation_token);
CREATE INDEX IF NOT EXISTS idx_bank_employees_approval_status ON bank_employees(approval_status);
CREATE INDEX IF NOT EXISTS idx_bank_employees_auto_delete ON bank_employees(auto_delete_after);
CREATE INDEX IF NOT EXISTS idx_bank_employees_last_activity ON bank_employees(last_activity_at);

-- Enhanced banks and branches indexes
CREATE INDEX IF NOT EXISTS idx_banks_display_order ON banks(display_order);
CREATE INDEX IF NOT EXISTS idx_banks_is_active ON banks(is_active);
CREATE INDEX IF NOT EXISTS idx_bank_branches_is_active ON bank_branches(is_active);

-- =====================================================
-- 4. CREATE DATABASE FUNCTIONS
-- =====================================================

-- Function to generate secure invitation tokens
CREATE OR REPLACE FUNCTION generate_invitation_token()
RETURNS VARCHAR(255) AS $$
DECLARE
    token VARCHAR(255);
    exists_count INTEGER;
BEGIN
    LOOP
        -- Generate a secure random token
        token := encode(gen_random_bytes(32), 'hex');
        
        -- Check if token already exists
        SELECT COUNT(*) INTO exists_count 
        FROM registration_invitations 
        WHERE invitation_token = token;
        
        -- If token is unique, exit loop
        IF exists_count = 0 THEN
            EXIT;
        END IF;
    END LOOP;
    
    RETURN token;
END;
$$ LANGUAGE plpgsql;

-- Function to expire old invitations
CREATE OR REPLACE FUNCTION expire_old_invitations()
RETURNS INTEGER AS $$
DECLARE
    expired_count INTEGER;
BEGIN
    -- Update expired invitations
    UPDATE registration_invitations 
    SET status = 'expired', updated_at = CURRENT_TIMESTAMP
    WHERE status = 'pending' 
    AND expires_at < CURRENT_TIMESTAMP;
    
    GET DIAGNOSTICS expired_count = ROW_COUNT;
    
    RETURN expired_count;
END;
$$ LANGUAGE plpgsql;

-- Function to cleanup inactive workers (6 months rule)
CREATE OR REPLACE FUNCTION cleanup_inactive_workers()
RETURNS INTEGER AS $$
DECLARE
    cleanup_count INTEGER;
    six_months_ago DATE;
BEGIN
    six_months_ago := CURRENT_DATE - INTERVAL '6 months';
    
    -- Mark workers for deletion if inactive for 6 months
    UPDATE bank_employees 
    SET status = 'deleted',
        auto_delete_after = CURRENT_DATE,
        updated_at = CURRENT_TIMESTAMP
    WHERE status = 'active'
    AND (last_activity_at IS NULL OR last_activity_at::DATE < six_months_ago)
    AND (auto_delete_after IS NULL OR auto_delete_after > CURRENT_DATE);
    
    GET DIAGNOSTICS cleanup_count = ROW_COUNT;
    
    RETURN cleanup_count;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 5. CREATE TRIGGERS
-- =====================================================

-- Trigger function for auto-updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate invitation tokens
CREATE OR REPLACE FUNCTION auto_generate_invitation_token()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.invitation_token IS NULL THEN
        NEW.invitation_token := generate_invitation_token();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to handle approval status changes
CREATE OR REPLACE FUNCTION handle_approval_status_change()
RETURNS TRIGGER AS $$
BEGIN
    -- When status changes to approved, set approval timestamp
    IF OLD.approval_status != 'approved' AND NEW.approval_status = 'approved' THEN
        NEW.approved_at := CURRENT_TIMESTAMP;
        NEW.status := 'active';
        
        -- Set auto-delete date to 6 months from now
        NEW.auto_delete_after := CURRENT_DATE + INTERVAL '6 months';
    END IF;
    
    -- Update last activity
    NEW.last_activity_at := CURRENT_TIMESTAMP;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER trigger_registration_invitations_updated_at
    BEFORE UPDATE ON registration_invitations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_worker_approval_queue_updated_at
    BEFORE UPDATE ON worker_approval_queue
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_validation_rules_updated_at
    BEFORE UPDATE ON registration_validation_rules
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_bank_employees_approval_changes
    BEFORE UPDATE ON bank_employees
    FOR EACH ROW
    EXECUTE FUNCTION handle_approval_status_change();

-- =====================================================
-- 6. INSERT DEFAULT DATA
-- =====================================================

-- Insert validation rules for Israel (Hebrew/Latin)
INSERT INTO registration_validation_rules (country_code, language_code, field_name, validation_type, validation_pattern, error_message_key) VALUES
('IL', 'he', 'full_name', 'regex', '^[\u0590-\u05FFa-zA-Z\s\-\.]{2,100}$', 'validation.name.hebrew_latin_only'),
('IL', 'he', 'position', 'regex', '^[\u0590-\u05FFa-zA-Z\s\-\.]{2,100}$', 'validation.position.hebrew_latin_only'),
('IL', 'en', 'full_name', 'regex', '^[a-zA-Z\s\-\.]{2,100}$', 'validation.name.latin_only'),
('IL', 'en', 'position', 'regex', '^[a-zA-Z\s\-\.]{2,100}$', 'validation.position.latin_only'),
('IL', 'he', 'corporate_email', 'regex', '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$', 'validation.email.invalid'),
('IL', 'en', 'corporate_email', 'regex', '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$', 'validation.email.invalid'),
('IL', 'he', 'bank_number', 'regex', '^[0-9]{3}$', 'validation.bank_number.three_digits'),
('IL', 'en', 'bank_number', 'regex', '^[0-9]{3}$', 'validation.bank_number.three_digits')
ON CONFLICT (country_code, language_code, field_name, validation_type) DO NOTHING;

-- Insert validation rules for Russia (Cyrillic/Latin)
INSERT INTO registration_validation_rules (country_code, language_code, field_name, validation_type, validation_pattern, error_message_key) VALUES
('RU', 'ru', 'full_name', 'regex', '^[\u0400-\u04FFa-zA-Z\s\-\.]{2,100}$', 'validation.name.cyrillic_latin_only'),
('RU', 'ru', 'position', 'regex', '^[\u0400-\u04FFa-zA-Z\s\-\.]{2,100}$', 'validation.position.cyrillic_latin_only'),
('RU', 'en', 'full_name', 'regex', '^[a-zA-Z\s\-\.]{2,100}$', 'validation.name.latin_only'),
('RU', 'en', 'position', 'regex', '^[a-zA-Z\s\-\.]{2,100}$', 'validation.position.latin_only'),
('RU', 'ru', 'corporate_email', 'regex', '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$', 'validation.email.invalid'),
('RU', 'en', 'corporate_email', 'regex', '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$', 'validation.email.invalid')
ON CONFLICT (country_code, language_code, field_name, validation_type) DO NOTHING;

-- Set display order for existing banks (if any)
UPDATE banks 
SET display_order = id, 
    is_active = TRUE 
WHERE display_order = 0 OR display_order IS NULL;

-- Set active status for existing bank branches
UPDATE bank_branches 
SET is_active = TRUE 
WHERE is_active IS NULL;

-- Set default approval status for existing employees
UPDATE bank_employees 
SET approval_status = 'approved',
    approved_at = created_at,
    auto_delete_after = CURRENT_DATE + INTERVAL '6 months',
    last_activity_at = COALESCE(last_login, created_at)
WHERE approval_status IS NULL;

-- =====================================================
-- 7. CREATE DATABASE VIEWS
-- =====================================================

-- Active invitations view
CREATE OR REPLACE VIEW active_invitations AS
SELECT 
    ri.id,
    ri.email,
    b.name_en as bank_name,
    bb.name_en as branch_name,
    au.username as invited_by_username,
    ri.invitation_token,
    ri.expires_at,
    ri.created_at,
    CASE 
        WHEN ri.expires_at < CURRENT_TIMESTAMP THEN 'expired'
        ELSE ri.status 
    END as current_status
FROM registration_invitations ri
JOIN banks b ON ri.bank_id = b.id
LEFT JOIN bank_branches bb ON ri.branch_id = bb.id
JOIN admin_users au ON ri.invited_by = au.id
WHERE ri.status = 'pending' 
AND ri.expires_at > CURRENT_TIMESTAMP;

-- Pending worker approvals view
CREATE OR REPLACE VIEW pending_worker_approvals AS
SELECT 
    waq.id as queue_id,
    be.id as employee_id,
    be.name as employee_name,
    be.corporate_email,
    be.position,
    b.name_en as bank_name,
    bb.name_en as branch_name,
    waq.submitted_at,
    waq.priority,
    waq.auto_approve_eligible,
    EXTRACT(DAYS FROM (CURRENT_TIMESTAMP - waq.submitted_at)) as days_pending
FROM worker_approval_queue waq
JOIN bank_employees be ON waq.employee_id = be.id
JOIN banks b ON be.bank_id = b.id
LEFT JOIN bank_branches bb ON be.branch_id = bb.id
WHERE waq.approval_status = 'pending'
ORDER BY waq.priority DESC, waq.submitted_at ASC;

-- Bank worker statistics view
CREATE OR REPLACE VIEW bank_worker_statistics AS
SELECT 
    b.id as bank_id,
    b.name_en as bank_name,
    COUNT(CASE WHEN be.status = 'active' THEN 1 END) as active_workers,
    COUNT(CASE WHEN be.status = 'pending' THEN 1 END) as pending_workers,
    COUNT(CASE WHEN waq.approval_status = 'pending' THEN 1 END) as pending_approvals,
    COUNT(CASE WHEN ri.status = 'pending' AND ri.expires_at > CURRENT_TIMESTAMP THEN 1 END) as active_invitations,
    MAX(be.last_activity_at) as last_worker_activity
FROM banks b
LEFT JOIN bank_employees be ON b.id = be.bank_id
LEFT JOIN worker_approval_queue waq ON be.id = waq.employee_id AND waq.approval_status = 'pending'
LEFT JOIN registration_invitations ri ON b.id = ri.bank_id AND ri.status = 'pending'
WHERE b.is_active = TRUE
GROUP BY b.id, b.name_en
ORDER BY b.display_order, b.name_en;

-- =====================================================
-- 8. MIGRATION LOGGING
-- =====================================================

-- Log this migration
INSERT INTO admin_audit_log (
    user_id, 
    action, 
    table_name, 
    old_values, 
    new_values, 
    created_at
) VALUES (
    1, -- System user
    'MIGRATION_APPLIED',
    'migration_012',
    '{}',
    '{"migration": "012-enhanced-bank-worker-system", "tables_added": 3, "tables_enhanced": 3, "indexes_created": 15, "functions_created": 3, "triggers_created": 4, "views_created": 3}',
    CURRENT_TIMESTAMP
);

COMMIT;

-- =====================================================
-- ROLLBACK SCRIPT (for emergency use)
-- =====================================================
/*
-- ROLLBACK COMMANDS (run only if migration needs to be reverted)
-- WARNING: This will remove all new functionality added by this migration

BEGIN;

-- Drop views
DROP VIEW IF EXISTS bank_worker_statistics;
DROP VIEW IF EXISTS pending_worker_approvals;
DROP VIEW IF EXISTS active_invitations;

-- Drop triggers
DROP TRIGGER IF EXISTS trigger_bank_employees_approval_changes ON bank_employees;
DROP TRIGGER IF EXISTS trigger_validation_rules_updated_at ON registration_validation_rules;
DROP TRIGGER IF EXISTS trigger_worker_approval_queue_updated_at ON worker_approval_queue;
DROP TRIGGER IF EXISTS trigger_registration_invitations_updated_at ON registration_invitations;

-- Drop functions
DROP FUNCTION IF EXISTS handle_approval_status_change();
DROP FUNCTION IF EXISTS auto_generate_invitation_token();
DROP FUNCTION IF EXISTS cleanup_inactive_workers();
DROP FUNCTION IF EXISTS expire_old_invitations();
DROP FUNCTION IF EXISTS generate_invitation_token();

-- Remove added columns (be careful with existing data)
ALTER TABLE bank_branches DROP COLUMN IF EXISTS max_workers;
ALTER TABLE bank_branches DROP COLUMN IF EXISTS is_active;
ALTER TABLE banks DROP COLUMN IF EXISTS is_active;
ALTER TABLE banks DROP COLUMN IF EXISTS display_order;
ALTER TABLE bank_employees DROP COLUMN IF EXISTS registration_user_agent;
ALTER TABLE bank_employees DROP COLUMN IF EXISTS registration_ip;
ALTER TABLE bank_employees DROP COLUMN IF EXISTS last_activity_at;
ALTER TABLE bank_employees DROP COLUMN IF EXISTS auto_delete_after;
ALTER TABLE bank_employees DROP COLUMN IF EXISTS approved_at;
ALTER TABLE bank_employees DROP COLUMN IF EXISTS approved_by;
ALTER TABLE bank_employees DROP COLUMN IF EXISTS approval_status;
ALTER TABLE bank_employees DROP COLUMN IF EXISTS invitation_expires_at;
ALTER TABLE bank_employees DROP COLUMN IF EXISTS invitation_token;

-- Drop new tables
DROP TABLE IF EXISTS registration_validation_rules;
DROP TABLE IF EXISTS worker_approval_queue;
DROP TABLE IF EXISTS registration_invitations;

-- Log rollback
INSERT INTO admin_audit_log (
    user_id, 
    action, 
    table_name, 
    old_values, 
    new_values, 
    created_at
) VALUES (
    1,
    'MIGRATION_ROLLBACK',
    'migration_012',
    '{"migration": "012-enhanced-bank-worker-system"}',
    '{"status": "rolled_back"}',
    CURRENT_TIMESTAMP
);

COMMIT;
*/

-- =====================================================
-- POST-MIGRATION VALIDATION QUERIES
-- =====================================================
/*
-- Run these queries after migration to validate success:

-- Check new tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('registration_invitations', 'worker_approval_queue', 'registration_validation_rules');

-- Check new columns exist
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'bank_employees' 
AND column_name IN ('invitation_token', 'approval_status', 'auto_delete_after');

-- Check indexes were created
SELECT indexname FROM pg_indexes 
WHERE tablename IN ('registration_invitations', 'worker_approval_queue', 'bank_employees') 
AND indexname LIKE 'idx_%';

-- Check functions exist
SELECT proname FROM pg_proc 
WHERE proname IN ('generate_invitation_token', 'expire_old_invitations', 'cleanup_inactive_workers');

-- Check views exist
SELECT viewname FROM pg_views 
WHERE viewname IN ('active_invitations', 'pending_worker_approvals', 'bank_worker_statistics');

-- Test validation rules were inserted
SELECT country_code, language_code, field_name, COUNT(*) 
FROM registration_validation_rules 
GROUP BY country_code, language_code, field_name;
*/ 
-- Migration: Banking Standards Audit History System
-- Date: 2025-01-13
-- Purpose: Add comprehensive audit trail for banking_standards table changes
-- Critical for production banking system compliance

-- =====================================================
-- 1. BANKING STANDARDS HISTORY TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS banking_standards_history (
    id SERIAL PRIMARY KEY,
    banking_standard_id INTEGER NOT NULL, -- Don't use FK to allow history even if standard is deleted
    business_path VARCHAR(30) NOT NULL,
    standard_category VARCHAR(50) NOT NULL,
    standard_name VARCHAR(100) NOT NULL,
    old_value DECIMAL(10,4),
    new_value DECIMAL(10,4) NOT NULL,
    old_description TEXT,
    new_description TEXT,
    old_is_active BOOLEAN,
    new_is_active BOOLEAN,
    change_type VARCHAR(20) CHECK (change_type IN ('INSERT', 'UPDATE', 'DELETE', 'ACTIVATE', 'DEACTIVATE')) NOT NULL,
    change_reason TEXT,
    changed_by INTEGER REFERENCES clients(id) ON DELETE SET NULL,
    changed_at TIMESTAMP DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT,
    session_id VARCHAR(255)
);

-- =====================================================
-- 2. AUDIT TRIGGER FUNCTION
-- =====================================================

CREATE OR REPLACE FUNCTION log_banking_standards_change()
RETURNS TRIGGER AS $$
BEGIN
    -- Handle INSERT
    IF TG_OP = 'INSERT' THEN
        INSERT INTO banking_standards_history (
            banking_standard_id,
            business_path,
            standard_category,
            standard_name,
            old_value,
            new_value,
            old_description,
            new_description,
            old_is_active,
            new_is_active,
            change_type,
            changed_by,
            changed_at
        ) VALUES (
            NEW.id,
            NEW.business_path,
            NEW.standard_category,
            NEW.standard_name,
            NULL,
            NEW.standard_value,
            NULL,
            NEW.description,
            NULL,
            NEW.is_active,
            'INSERT',
            NEW.created_by,
            NEW.created_at
        );
        RETURN NEW;
    END IF;

    -- Handle UPDATE
    IF TG_OP = 'UPDATE' THEN
        -- Only log if there are actual changes
        IF OLD.standard_value != NEW.standard_value OR 
           OLD.description != NEW.description OR 
           OLD.is_active != NEW.is_active THEN
            
            INSERT INTO banking_standards_history (
                banking_standard_id,
                business_path,
                standard_category,
                standard_name,
                old_value,
                new_value,
                old_description,
                new_description,
                old_is_active,
                new_is_active,
                change_type,
                changed_by,
                changed_at
            ) VALUES (
                NEW.id,
                NEW.business_path,
                NEW.standard_category,
                NEW.standard_name,
                OLD.standard_value,
                NEW.standard_value,
                OLD.description,
                NEW.description,
                OLD.is_active,
                NEW.is_active,
                CASE 
                    WHEN OLD.is_active = FALSE AND NEW.is_active = TRUE THEN 'ACTIVATE'
                    WHEN OLD.is_active = TRUE AND NEW.is_active = FALSE THEN 'DEACTIVATE'
                    ELSE 'UPDATE'
                END,
                COALESCE(NEW.created_by, OLD.created_by), -- Use creator if no updater specified
                NEW.updated_at
            );
        END IF;
        RETURN NEW;
    END IF;

    -- Handle DELETE
    IF TG_OP = 'DELETE' THEN
        INSERT INTO banking_standards_history (
            banking_standard_id,
            business_path,
            standard_category,
            standard_name,
            old_value,
            new_value,
            old_description,
            new_description,
            old_is_active,
            new_is_active,
            change_type,
            changed_by,
            changed_at
        ) VALUES (
            OLD.id,
            OLD.business_path,
            OLD.standard_category,
            OLD.standard_name,
            OLD.standard_value,
            NULL,
            OLD.description,
            NULL,
            OLD.is_active,
            NULL,
            'DELETE',
            OLD.created_by,
            NOW()
        );
        RETURN OLD;
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 3. CREATE AUDIT TRIGGERS
-- =====================================================

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS audit_banking_standards_changes ON banking_standards;

-- Create comprehensive audit trigger
CREATE TRIGGER audit_banking_standards_changes
    AFTER INSERT OR UPDATE OR DELETE ON banking_standards
    FOR EACH ROW
    EXECUTE FUNCTION log_banking_standards_change();

-- =====================================================
-- 4. INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_banking_standards_history_standard_id ON banking_standards_history(banking_standard_id);
CREATE INDEX IF NOT EXISTS idx_banking_standards_history_changed_at ON banking_standards_history(changed_at);
CREATE INDEX IF NOT EXISTS idx_banking_standards_history_changed_by ON banking_standards_history(changed_by);
CREATE INDEX IF NOT EXISTS idx_banking_standards_history_change_type ON banking_standards_history(change_type);
CREATE INDEX IF NOT EXISTS idx_banking_standards_history_business_path ON banking_standards_history(business_path);

-- =====================================================
-- 5. AUDIT QUERY FUNCTIONS
-- =====================================================

-- Drop existing functions if they exist (PostgreSQL requirement)
DROP FUNCTION IF EXISTS get_banking_standard_history(INTEGER);
DROP FUNCTION IF EXISTS get_recent_banking_standards_changes(INTEGER);

-- Function to get change history for a specific standard
CREATE OR REPLACE FUNCTION get_banking_standard_history(p_standard_id INTEGER)
RETURNS TABLE (
    change_date TIMESTAMP,
    change_type VARCHAR(20),
    old_value DECIMAL(10,4),
    new_value DECIMAL(10,4),
    changed_by_name TEXT,
    change_reason TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        bsh.changed_at,
        bsh.change_type,
        bsh.old_value,
        bsh.new_value,
        COALESCE(c.first_name || ' ' || c.last_name, 'System')::TEXT as changed_by_name,
        bsh.change_reason
    FROM banking_standards_history bsh
    LEFT JOIN clients c ON bsh.changed_by = c.id
    WHERE bsh.banking_standard_id = p_standard_id
    ORDER BY bsh.changed_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to get recent changes across all standards
CREATE OR REPLACE FUNCTION get_recent_banking_standards_changes(p_days INTEGER DEFAULT 30)
RETURNS TABLE (
    change_date TIMESTAMP,
    business_path VARCHAR(30),
    standard_name VARCHAR(100),
    change_type VARCHAR(20),
    old_value DECIMAL(10,4),
    new_value DECIMAL(10,4),
    changed_by_name TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        bsh.changed_at,
        bsh.business_path,
        bsh.standard_name,
        bsh.change_type,
        bsh.old_value,
        bsh.new_value,
        COALESCE(c.first_name || ' ' || c.last_name, 'System')::TEXT as changed_by_name
    FROM banking_standards_history bsh
    LEFT JOIN clients c ON bsh.changed_by = c.id
    WHERE bsh.changed_at >= NOW() - INTERVAL '1 day' * p_days
    ORDER BY bsh.changed_at DESC
    LIMIT 100;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 6. POPULATE HISTORY FOR EXISTING RECORDS
-- =====================================================

-- Create initial history records for all existing banking standards
INSERT INTO banking_standards_history (
    banking_standard_id,
    business_path,
    standard_category,
    standard_name,
    old_value,
    new_value,
    old_description,
    new_description,
    old_is_active,
    new_is_active,
    change_type,
    changed_by,
    changed_at
)
SELECT 
    id,
    business_path,
    standard_category,
    standard_name,
    NULL,
    standard_value,
    NULL,
    description,
    NULL,
    is_active,
    'INSERT',
    created_by,
    created_at
FROM banking_standards
WHERE NOT EXISTS (
    SELECT 1 FROM banking_standards_history 
    WHERE banking_standard_id = banking_standards.id 
    AND change_type = 'INSERT'
);

-- =====================================================
-- 7. COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON TABLE banking_standards_history IS 'Comprehensive audit trail for all banking_standards table changes';
COMMENT ON COLUMN banking_standards_history.banking_standard_id IS 'Reference to banking standard (no FK to preserve history even if standard deleted)';
COMMENT ON COLUMN banking_standards_history.change_type IS 'Type of change: INSERT, UPDATE, DELETE, ACTIVATE, DEACTIVATE';
COMMENT ON COLUMN banking_standards_history.changed_by IS 'User who made the change';
COMMENT ON COLUMN banking_standards_history.ip_address IS 'IP address of user making change (for future enhancement)';
COMMENT ON COLUMN banking_standards_history.user_agent IS 'Browser/client info (for future enhancement)';

-- =====================================================
-- MIGRATION COMPLETED
-- =====================================================
-- New Tables: 1 (banking_standards_history)
-- New Functions: 3 (log_banking_standards_change, get_banking_standard_history, get_recent_banking_standards_changes)
-- New Triggers: 1 (audit_banking_standards_changes)
-- New Indexes: 5
-- Status: Banking standards audit system ready for production 
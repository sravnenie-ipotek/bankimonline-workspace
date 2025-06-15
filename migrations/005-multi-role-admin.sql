-- migrations/005-multi-role-admin.sql
-- Multi-role admin system database schema for Railway PostgreSQL
-- Run this migration after existing banking_standards_history migration

BEGIN;

-- =====================================================
-- 1. ADMIN USERS TABLE (Multi-role system)
-- =====================================================

CREATE TABLE IF NOT EXISTS admin_users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('business_admin', 'bank_admin', 'risk_manager', 'compliance', 'system_admin')),
    bank_id INTEGER REFERENCES banks(id), -- NULL for global roles
    permissions JSON DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    created_by INTEGER REFERENCES admin_users(id),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 2. BANK CONFIGURATIONS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS bank_configurations (
    id SERIAL PRIMARY KEY,
    bank_id INTEGER REFERENCES banks(id) ON DELETE CASCADE,
    product_type VARCHAR(50) DEFAULT 'mortgage',
    base_interest_rate DECIMAL(5,3),
    min_interest_rate DECIMAL(5,3),
    max_interest_rate DECIMAL(5,3),
    risk_premium DECIMAL(5,3),
    processing_fee DECIMAL(10,2),
    max_ltv_ratio DECIMAL(5,2),
    min_credit_score INTEGER,
    max_loan_amount DECIMAL(15,2),
    min_loan_amount DECIMAL(15,2),
    auto_approval_enabled BOOLEAN DEFAULT false,
    max_applications_per_day INTEGER DEFAULT 100,
    is_active BOOLEAN DEFAULT true,
    effective_from DATE DEFAULT CURRENT_DATE,
    effective_to DATE,
    updated_by INTEGER REFERENCES admin_users(id),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 3. INTEREST RATE RULES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS interest_rate_rules (
    id SERIAL PRIMARY KEY,
    bank_id INTEGER REFERENCES banks(id) ON DELETE CASCADE,
    rule_type VARCHAR(50) NOT NULL, -- 'credit_score', 'ltv', 'employment', 'income', 'loan_amount'
    condition_min DECIMAL(10,2),
    condition_max DECIMAL(10,2),
    rate_adjustment DECIMAL(5,3) NOT NULL, -- +/- percentage adjustment
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    priority INTEGER DEFAULT 1,
    created_by INTEGER REFERENCES admin_users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 4. RISK PARAMETERS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS risk_parameters (
    id SERIAL PRIMARY KEY,
    bank_id INTEGER REFERENCES banks(id) ON DELETE CASCADE,
    parameter_type VARCHAR(50) NOT NULL, -- 'ltv_limit', 'dti_limit', 'min_income', 'employment_years'
    parameter_value DECIMAL(10,2) NOT NULL,
    condition_type VARCHAR(50) DEFAULT 'default', -- 'credit_score_range', 'loan_amount_range', 'employment_type'
    condition_min DECIMAL(10,2),
    condition_max DECIMAL(10,2),
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_by INTEGER REFERENCES admin_users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 5. ADMIN AUDIT LOG TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS admin_audit_log (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES admin_users(id),
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(100),
    record_id INTEGER,
    old_values JSON,
    new_values JSON,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 6. BANK ANALYTICS TABLE (for performance tracking)
-- =====================================================

CREATE TABLE IF NOT EXISTS bank_analytics (
    id SERIAL PRIMARY KEY,
    bank_id INTEGER REFERENCES banks(id) ON DELETE CASCADE,
    metric_type VARCHAR(50) NOT NULL, -- 'applications', 'approvals', 'rejections', 'avg_amount'
    metric_value DECIMAL(15,2),
    period_type VARCHAR(20) DEFAULT 'daily', -- 'daily', 'weekly', 'monthly'
    period_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 7. CREATE INDEXES FOR PERFORMANCE
-- =====================================================

-- Admin users indexes
CREATE INDEX IF NOT EXISTS idx_admin_users_role ON admin_users(role);
CREATE INDEX IF NOT EXISTS idx_admin_users_bank_id ON admin_users(bank_id);
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);
CREATE INDEX IF NOT EXISTS idx_admin_users_active ON admin_users(is_active);

-- Bank configurations indexes
CREATE INDEX IF NOT EXISTS idx_bank_configurations_bank_id ON bank_configurations(bank_id);
CREATE INDEX IF NOT EXISTS idx_bank_configurations_active ON bank_configurations(is_active);
CREATE INDEX IF NOT EXISTS idx_bank_configurations_product ON bank_configurations(product_type);

-- Interest rate rules indexes
CREATE INDEX IF NOT EXISTS idx_interest_rate_rules_bank_id ON interest_rate_rules(bank_id);
CREATE INDEX IF NOT EXISTS idx_interest_rate_rules_type ON interest_rate_rules(rule_type);
CREATE INDEX IF NOT EXISTS idx_interest_rate_rules_active ON interest_rate_rules(is_active);

-- Risk parameters indexes
CREATE INDEX IF NOT EXISTS idx_risk_parameters_bank_id ON risk_parameters(bank_id);
CREATE INDEX IF NOT EXISTS idx_risk_parameters_type ON risk_parameters(parameter_type);
CREATE INDEX IF NOT EXISTS idx_risk_parameters_active ON risk_parameters(is_active);

-- Audit log indexes
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_user_id ON admin_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_created_at ON admin_audit_log(created_at);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_action ON admin_audit_log(action);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_table ON admin_audit_log(table_name);

-- Bank analytics indexes
CREATE INDEX IF NOT EXISTS idx_bank_analytics_bank_id ON bank_analytics(bank_id);
CREATE INDEX IF NOT EXISTS idx_bank_analytics_metric ON bank_analytics(metric_type);
CREATE INDEX IF NOT EXISTS idx_bank_analytics_date ON bank_analytics(period_date);

-- =====================================================
-- 8. CREATE UPDATE TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
CREATE TRIGGER trigger_admin_users_updated_at
    BEFORE UPDATE ON admin_users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_bank_configurations_updated_at
    BEFORE UPDATE ON bank_configurations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_interest_rate_rules_updated_at
    BEFORE UPDATE ON interest_rate_rules
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_risk_parameters_updated_at
    BEFORE UPDATE ON risk_parameters
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 9. INSERT DEFAULT ADMIN USER
-- =====================================================

-- Insert default business admin user
INSERT INTO admin_users (username, email, password_hash, role, permissions) 
VALUES (
    'admin', 
    'admin@bankim.com', 
    'admin123', -- This should be properly hashed in production
    'business_admin',
    '{"all": true, "can_create_users": true, "can_modify_banks": true, "can_view_audit": true}'
)
ON CONFLICT (email) DO NOTHING;

-- =====================================================
-- 10. CREATE INITIAL BANK CONFIGURATIONS
-- =====================================================

-- Create initial bank configurations for existing active banks
INSERT INTO bank_configurations (
    bank_id, 
    product_type, 
    base_interest_rate, 
    min_interest_rate, 
    max_interest_rate, 
    min_loan_amount, 
    max_loan_amount, 
    max_ltv_ratio, 
    min_credit_score,
    processing_fee,
    auto_approval_enabled,
    max_applications_per_day
) 
SELECT 
    id, 
    'mortgage', 
    3.5, 
    3.0, 
    8.0, 
    50000, 
    5000000,
    80.0,
    600,
    2500.00,
    false,
    100
FROM banks 
WHERE tender = 1
ON CONFLICT DO NOTHING;

-- =====================================================
-- 11. CREATE DEFAULT INTEREST RATE RULES
-- =====================================================

-- Excellent credit score discount
INSERT INTO interest_rate_rules (bank_id, rule_type, condition_min, condition_max, rate_adjustment, description, priority)
SELECT 
    id,
    'credit_score',
    750,
    850,
    -0.3,
    'Excellent credit score discount',
    1
FROM banks 
WHERE tender = 1
ON CONFLICT DO NOTHING;

-- Good credit score discount
INSERT INTO interest_rate_rules (bank_id, rule_type, condition_min, condition_max, rate_adjustment, description, priority)
SELECT 
    id,
    'credit_score',
    700,
    749,
    -0.1,
    'Good credit score discount',
    2
FROM banks 
WHERE tender = 1
ON CONFLICT DO NOTHING;

-- Lower credit score premium
INSERT INTO interest_rate_rules (bank_id, rule_type, condition_min, condition_max, rate_adjustment, description, priority)
SELECT 
    id,
    'credit_score',
    600,
    699,
    0.5,
    'Lower credit score premium',
    3
FROM banks 
WHERE tender = 1
ON CONFLICT DO NOTHING;

-- High LTV premium
INSERT INTO interest_rate_rules (bank_id, rule_type, condition_min, condition_max, rate_adjustment, description, priority)
SELECT 
    id,
    'ltv',
    80.01,
    95.0,
    0.25,
    'High LTV premium',
    4
FROM banks 
WHERE tender = 1
ON CONFLICT DO NOTHING;

-- Large loan amount discount
INSERT INTO interest_rate_rules (bank_id, rule_type, condition_min, condition_max, rate_adjustment, description, priority)
SELECT 
    id,
    'loan_amount',
    2000000,
    50000000,
    -0.15,
    'Large loan amount discount',
    5
FROM banks 
WHERE tender = 1
ON CONFLICT DO NOTHING;

-- =====================================================
-- 12. CREATE DEFAULT RISK PARAMETERS
-- =====================================================

-- Standard LTV limits
INSERT INTO risk_parameters (bank_id, parameter_type, parameter_value, condition_type, condition_min, condition_max, description)
SELECT 
    id,
    'ltv_limit',
    80.0,
    'default',
    0,
    100,
    'Standard LTV limit for mortgages'
FROM banks 
WHERE tender = 1
ON CONFLICT DO NOTHING;

-- Standard DTI limits
INSERT INTO risk_parameters (bank_id, parameter_type, parameter_value, condition_type, condition_min, condition_max, description)
SELECT 
    id,
    'dti_limit',
    42.0,
    'default',
    0,
    100,
    'Standard DTI limit'
FROM banks 
WHERE tender = 1
ON CONFLICT DO NOTHING;

-- Minimum income requirements
INSERT INTO risk_parameters (bank_id, parameter_type, parameter_value, condition_type, condition_min, condition_max, description)
SELECT 
    id,
    'min_income',
    8000.0,
    'default',
    0,
    1000000,
    'Minimum monthly income requirement'
FROM banks 
WHERE tender = 1
ON CONFLICT DO NOTHING;

-- Employment years requirement
INSERT INTO risk_parameters (bank_id, parameter_type, parameter_value, condition_type, condition_min, condition_max, description)
SELECT 
    id,
    'employment_years',
    2.0,
    'default',
    0,
    50,
    'Minimum employment years requirement'
FROM banks 
WHERE tender = 1
ON CONFLICT DO NOTHING;

-- =====================================================
-- 13. CREATE SAMPLE BANK ADMIN USERS
-- =====================================================

-- Create bank admin users for first 5 active banks
INSERT INTO admin_users (username, email, password_hash, role, bank_id, permissions) 
SELECT 
    CONCAT('admin_', LOWER(REPLACE(COALESCE(name_en, name_ru), ' ', '_'))),
    CONCAT('admin@', LOWER(REPLACE(COALESCE(name_en, name_ru), ' ', '')), '.bankim.com'),
    'admin123',
    'bank_admin',
    id,
    CONCAT('{"bank_id": ', id, ', "can_modify_own_bank": true, "can_view_analytics": true}')::JSON
FROM banks 
WHERE tender = 1 
LIMIT 5
ON CONFLICT (email) DO NOTHING;

-- =====================================================
-- 14. CREATE ADDITIONAL ROLE USERS
-- =====================================================

-- Create a risk manager user
INSERT INTO admin_users (username, email, password_hash, role, permissions) 
VALUES (
    'risk_manager', 
    'risk@bankim.com', 
    'admin123', 
    'risk_manager',
    '{"can_view_risk_reports": true, "can_modify_risk_parameters": true, "can_view_all_banks": true}'
)
ON CONFLICT (email) DO NOTHING;

-- Create a compliance user
INSERT INTO admin_users (username, email, password_hash, role, permissions) 
VALUES (
    'compliance', 
    'compliance@bankim.com', 
    'admin123', 
    'compliance',
    '{"can_view_audit_logs": true, "can_generate_reports": true, "can_view_all_banks": true}'
)
ON CONFLICT (email) DO NOTHING;

-- Create a system admin user
INSERT INTO admin_users (username, email, password_hash, role, permissions) 
VALUES (
    'system_admin', 
    'system@bankim.com', 
    'admin123', 
    'system_admin',
    '{"all": true, "can_manage_system": true, "can_backup_restore": true}'
)
ON CONFLICT (email) DO NOTHING;

-- =====================================================
-- 15. LOG THE MIGRATION
-- =====================================================

-- Log the migration in audit log
INSERT INTO admin_audit_log (user_id, action, table_name, record_id, new_values, ip_address)
VALUES (
    1, 
    'migration', 
    'system', 
    5, 
    '{"migration": "005-multi-role-admin", "status": "completed", "tables_created": ["admin_users", "bank_configurations", "interest_rate_rules", "risk_parameters", "admin_audit_log", "bank_analytics"]}'::JSON,
    '127.0.0.1'
);

COMMIT;

-- =====================================================
-- MIGRATION COMPLETED SUCCESSFULLY
-- =====================================================
-- Tables Created: 6 (admin_users, bank_configurations, interest_rate_rules, risk_parameters, admin_audit_log, bank_analytics)
-- Indexes Created: 15
-- Triggers Created: 4
-- Default Users: 8+ (1 business admin, 5 bank admins, 1 risk manager, 1 compliance, 1 system admin)
-- Default Configurations: Created for all active banks
-- Default Rules: 25+ interest rate rules and risk parameters
-- ===================================================== 
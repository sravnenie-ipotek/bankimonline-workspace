-- Migration: Add Banking Tables for Real-World Operations
-- Date: 2025-06-13
-- Purpose: Add all missing tables for comprehensive banking loan processing

-- 1. Identity Verification Table
CREATE TABLE IF NOT EXISTS client_identity (
    id SERIAL PRIMARY KEY,
    client_id INTEGER REFERENCES clients(id) ON DELETE CASCADE,
    id_number VARCHAR(20) NOT NULL,
    id_type VARCHAR(20) CHECK (id_type IN ('passport', 'national_id', 'drivers_license')) DEFAULT 'national_id',
    id_expiry_date DATE,
    id_issuing_country VARCHAR(3) DEFAULT 'IL',
    verification_status VARCHAR(20) CHECK (verification_status IN ('pending', 'verified', 'rejected')) DEFAULT 'pending',
    verification_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(client_id, id_type)
);

-- 2. Credit History Table
CREATE TABLE IF NOT EXISTS client_credit_history (
    id SERIAL PRIMARY KEY,
    client_id INTEGER REFERENCES clients(id) ON DELETE CASCADE,
    credit_score INTEGER CHECK (credit_score >= 300 AND credit_score <= 850),
    credit_history_years INTEGER CHECK (credit_history_years >= 0),
    previous_defaults BOOLEAN DEFAULT FALSE,
    bankruptcy_history BOOLEAN DEFAULT FALSE,
    current_credit_utilization DECIMAL(5,2) CHECK (current_credit_utilization >= 0 AND current_credit_utilization <= 100),
    total_credit_limit DECIMAL(12,2),
    active_credit_accounts INTEGER DEFAULT 0,
    last_updated TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(client_id)
);

-- 3. Employment Details Table
CREATE TABLE IF NOT EXISTS client_employment (
    id SERIAL PRIMARY KEY,
    client_id INTEGER REFERENCES clients(id) ON DELETE CASCADE,
    employment_type VARCHAR(20) CHECK (employment_type IN ('permanent', 'temporary', 'freelance', 'self_employed', 'unemployed')) DEFAULT 'permanent',
    company_name VARCHAR(255),
    profession VARCHAR(255),
    field_of_activity VARCHAR(255),
    monthly_income DECIMAL(12,2) CHECK (monthly_income >= 0),
    additional_income DECIMAL(12,2) CHECK (additional_income >= 0) DEFAULT 0,
    years_at_current_job DECIMAL(4,2) CHECK (years_at_current_job >= 0),
    employer_phone VARCHAR(20),
    employer_address TEXT,
    employment_start_date DATE,
    employment_verified BOOLEAN DEFAULT FALSE,
    verification_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 4. Financial Assets Table
CREATE TABLE IF NOT EXISTS client_assets (
    id SERIAL PRIMARY KEY,
    client_id INTEGER REFERENCES clients(id) ON DELETE CASCADE,
    asset_type VARCHAR(20) CHECK (asset_type IN ('bank_account', 'investment', 'property', 'vehicle', 'other')) DEFAULT 'bank_account',
    bank_name VARCHAR(255),
    account_type VARCHAR(20) CHECK (account_type IN ('checking', 'savings', 'investment', 'pension')),
    current_balance DECIMAL(12,2) CHECK (current_balance >= 0),
    average_balance_6months DECIMAL(12,2) CHECK (average_balance_6months >= 0),
    asset_description TEXT,
    estimated_value DECIMAL(12,2) CHECK (estimated_value >= 0),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 5. Property Details Table
CREATE TABLE IF NOT EXISTS properties (
    id SERIAL PRIMARY KEY,
    client_id INTEGER REFERENCES clients(id) ON DELETE CASCADE,
    property_address TEXT NOT NULL,
    property_type VARCHAR(20) CHECK (property_type IN ('apartment', 'house', 'commercial', 'land', 'other')) DEFAULT 'apartment',
    property_age INTEGER CHECK (property_age >= 0),
    property_condition VARCHAR(20) CHECK (property_condition IN ('excellent', 'good', 'fair', 'poor')) DEFAULT 'good',
    property_size_sqm INTEGER CHECK (property_size_sqm > 0),
    purchase_price DECIMAL(12,2) CHECK (purchase_price >= 0),
    current_market_value DECIMAL(12,2) CHECK (current_market_value >= 0),
    appraisal_value DECIMAL(12,2) CHECK (appraisal_value >= 0),
    appraisal_date DATE,
    property_insurance BOOLEAN DEFAULT FALSE,
    insurance_value DECIMAL(12,2),
    ownership_percentage DECIMAL(5,2) DEFAULT 100.00 CHECK (ownership_percentage > 0 AND ownership_percentage <= 100),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 6. Calculation Parameters Table (Enhanced)
CREATE TABLE IF NOT EXISTS calculation_parameters (
    id SERIAL PRIMARY KEY,
    parameter_name VARCHAR(100) UNIQUE NOT NULL,
    parameter_value DECIMAL(10,4) NOT NULL,
    parameter_type VARCHAR(20) CHECK (parameter_type IN ('rate', 'ratio', 'amount', 'percentage', 'years')) NOT NULL,
    description TEXT,
    min_value DECIMAL(10,4),
    max_value DECIMAL(10,4),
    is_active BOOLEAN DEFAULT TRUE,
    effective_from DATE DEFAULT CURRENT_DATE,
    effective_to DATE,
    created_by INTEGER REFERENCES clients(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 7. Loan Applications Table
CREATE TABLE IF NOT EXISTS loan_applications (
    id SERIAL PRIMARY KEY,
    client_id INTEGER REFERENCES clients(id) ON DELETE CASCADE,
    property_id INTEGER REFERENCES properties(id) ON DELETE SET NULL,
    application_number VARCHAR(50) UNIQUE,
    loan_type VARCHAR(30) CHECK (loan_type IN ('mortgage', 'credit', 'refinance_mortgage', 'refinance_credit', 'personal_loan')) NOT NULL,
    loan_purpose TEXT,
    requested_amount DECIMAL(12,2) CHECK (requested_amount > 0) NOT NULL,
    approved_amount DECIMAL(12,2) CHECK (approved_amount >= 0),
    loan_term_years INTEGER CHECK (loan_term_years > 0) NOT NULL,
    interest_rate DECIMAL(5,2) CHECK (interest_rate >= 0),
    monthly_payment DECIMAL(12,2) CHECK (monthly_payment >= 0),
    down_payment DECIMAL(12,2) CHECK (down_payment >= 0) DEFAULT 0,
    loan_to_value_ratio DECIMAL(5,2) CHECK (loan_to_value_ratio >= 0 AND loan_to_value_ratio <= 100),
    debt_to_income_ratio DECIMAL(5,2) CHECK (debt_to_income_ratio >= 0),
    application_status VARCHAR(20) CHECK (application_status IN ('draft', 'submitted', 'under_review', 'approved', 'rejected', 'cancelled')) DEFAULT 'draft',
    approval_status VARCHAR(20) CHECK (approval_status IN ('pending', 'pre_approved', 'approved', 'rejected', 'conditional')) DEFAULT 'pending',
    rejection_reason TEXT,
    bank_id INTEGER REFERENCES banks(id) ON DELETE SET NULL,
    assigned_to INTEGER REFERENCES clients(id) ON DELETE SET NULL,
    submitted_at TIMESTAMP,
    reviewed_at TIMESTAMP,
    approved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 8. Existing Debts Table
CREATE TABLE IF NOT EXISTS client_debts (
    id SERIAL PRIMARY KEY,
    client_id INTEGER REFERENCES clients(id) ON DELETE CASCADE,
    bank_name VARCHAR(255) NOT NULL,
    debt_type VARCHAR(20) CHECK (debt_type IN ('mortgage', 'credit', 'credit_card', 'personal_loan', 'auto_loan', 'other')) NOT NULL,
    original_amount DECIMAL(12,2) CHECK (original_amount > 0) NOT NULL,
    current_balance DECIMAL(12,2) CHECK (current_balance >= 0) NOT NULL,
    monthly_payment DECIMAL(12,2) CHECK (monthly_payment >= 0) NOT NULL,
    interest_rate DECIMAL(5,2) CHECK (interest_rate >= 0),
    start_date DATE NOT NULL,
    end_date DATE,
    remaining_payments INTEGER CHECK (remaining_payments >= 0),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    CHECK (end_date IS NULL OR end_date >= start_date)
);

-- 9. Document Uploads Table
CREATE TABLE IF NOT EXISTS client_documents (
    id SERIAL PRIMARY KEY,
    client_id INTEGER REFERENCES clients(id) ON DELETE CASCADE,
    application_id INTEGER REFERENCES loan_applications(id) ON DELETE CASCADE,
    document_type VARCHAR(50) NOT NULL,
    document_category VARCHAR(30) CHECK (document_category IN ('identity', 'income', 'employment', 'property', 'financial', 'other')) DEFAULT 'other',
    file_name VARCHAR(255) NOT NULL,
    original_file_name VARCHAR(255),
    file_path VARCHAR(500),
    file_size INTEGER CHECK (file_size > 0),
    mime_type VARCHAR(100),
    upload_date TIMESTAMP DEFAULT NOW(),
    verification_status VARCHAR(20) CHECK (verification_status IN ('pending', 'verified', 'rejected', 'expired')) DEFAULT 'pending',
    verified_by INTEGER REFERENCES clients(id) ON DELETE SET NULL,
    verification_date TIMESTAMP,
    verification_notes TEXT,
    expiry_date DATE,
    is_required BOOLEAN DEFAULT FALSE
);

-- 10. Loan Calculation History Table
CREATE TABLE IF NOT EXISTS loan_calculations (
    id SERIAL PRIMARY KEY,
    client_id INTEGER REFERENCES clients(id) ON DELETE CASCADE,
    application_id INTEGER REFERENCES loan_applications(id) ON DELETE CASCADE,
    calculation_type VARCHAR(30) CHECK (calculation_type IN ('mortgage', 'credit', 'refinance', 'affordability')) NOT NULL,
    input_data JSONB NOT NULL,
    calculation_result JSONB NOT NULL,
    calculated_at TIMESTAMP DEFAULT NOW(),
    calculated_by INTEGER REFERENCES clients(id) ON DELETE SET NULL
);

-- Create Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_client_identity_client_id ON client_identity(client_id);
CREATE INDEX IF NOT EXISTS idx_client_identity_id_number ON client_identity(id_number);
CREATE INDEX IF NOT EXISTS idx_client_credit_history_client_id ON client_credit_history(client_id);
CREATE INDEX IF NOT EXISTS idx_client_employment_client_id ON client_employment(client_id);
CREATE INDEX IF NOT EXISTS idx_client_assets_client_id ON client_assets(client_id);
CREATE INDEX IF NOT EXISTS idx_properties_client_id ON properties(client_id);
CREATE INDEX IF NOT EXISTS idx_loan_applications_client_id ON loan_applications(client_id);
CREATE INDEX IF NOT EXISTS idx_loan_applications_status ON loan_applications(application_status);
CREATE INDEX IF NOT EXISTS idx_loan_applications_number ON loan_applications(application_number);
CREATE INDEX IF NOT EXISTS idx_client_debts_client_id ON client_debts(client_id);
CREATE INDEX IF NOT EXISTS idx_client_debts_active ON client_debts(is_active);
CREATE INDEX IF NOT EXISTS idx_client_documents_client_id ON client_documents(client_id);
CREATE INDEX IF NOT EXISTS idx_client_documents_application_id ON client_documents(application_id);
CREATE INDEX IF NOT EXISTS idx_client_documents_type ON client_documents(document_type);
CREATE INDEX IF NOT EXISTS idx_calculation_parameters_name ON calculation_parameters(parameter_name);
CREATE INDEX IF NOT EXISTS idx_loan_calculations_client_id ON loan_calculations(client_id);
CREATE INDEX IF NOT EXISTS idx_loan_calculations_type ON loan_calculations(calculation_type);

-- Create Application Number Sequence
CREATE SEQUENCE IF NOT EXISTS application_number_seq START 100001;

-- Create Function to Generate Application Numbers
CREATE OR REPLACE FUNCTION generate_application_number()
RETURNS TEXT AS $$
BEGIN
    RETURN 'APP-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(nextval('application_number_seq')::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;

-- Create Function to Update Timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create Trigger to Auto-Generate Application Numbers
CREATE OR REPLACE FUNCTION set_application_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.application_number IS NULL THEN
        NEW.application_number := generate_application_number();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_application_number
    BEFORE INSERT ON loan_applications
    FOR EACH ROW
    EXECUTE FUNCTION set_application_number();

-- Create Update Triggers for All Tables
CREATE TRIGGER trigger_update_client_identity_updated_at
    BEFORE UPDATE ON client_identity
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_client_employment_updated_at
    BEFORE UPDATE ON client_employment
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_client_assets_updated_at
    BEFORE UPDATE ON client_assets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_properties_updated_at
    BEFORE UPDATE ON properties
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_loan_applications_updated_at
    BEFORE UPDATE ON loan_applications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_client_debts_updated_at
    BEFORE UPDATE ON client_debts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_calculation_parameters_updated_at
    BEFORE UPDATE ON calculation_parameters
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert Default Calculation Parameters
INSERT INTO calculation_parameters (parameter_name, parameter_value, parameter_type, description, min_value, max_value) VALUES
('base_mortgage_rate', 3.50, 'rate', 'Base mortgage interest rate (%)', 2.00, 8.00),
('base_credit_rate', 5.50, 'rate', 'Base credit interest rate (%)', 3.00, 12.00),
('max_ltv_ratio', 80.00, 'percentage', 'Maximum Loan-to-Value ratio (%)', 50.00, 95.00),
('max_dti_ratio', 42.00, 'percentage', 'Maximum Debt-to-Income ratio (%)', 30.00, 50.00),
('min_credit_score', 600, 'amount', 'Minimum credit score for approval', 500, 750),
('max_loan_term_years', 30, 'years', 'Maximum loan term in years', 5, 35),
('processing_fee_rate', 1.50, 'percentage', 'Processing fee as % of loan amount', 0.50, 3.00),
('appraisal_fee', 2500.00, 'amount', 'Property appraisal fee (ILS)', 1500.00, 5000.00),
('insurance_rate', 0.25, 'percentage', 'Property insurance rate (% of property value)', 0.10, 0.50),
('stress_test_rate', 6.50, 'rate', 'Stress test interest rate (%)', 5.00, 9.00)
ON CONFLICT (parameter_name) DO UPDATE SET
    parameter_value = EXCLUDED.parameter_value,
    updated_at = NOW();

-- Add Comments for Documentation
COMMENT ON TABLE client_identity IS 'Identity verification documents and status for clients';
COMMENT ON TABLE client_credit_history IS 'Credit history and scoring information for loan assessment';
COMMENT ON TABLE client_employment IS 'Employment details and income verification';
COMMENT ON TABLE client_assets IS 'Financial assets and bank account information';
COMMENT ON TABLE properties IS 'Property details for mortgage applications';
COMMENT ON TABLE loan_applications IS 'Loan application tracking and status management';
COMMENT ON TABLE client_debts IS 'Existing debt obligations for DTI calculations';
COMMENT ON TABLE client_documents IS 'Document management for loan applications';
COMMENT ON TABLE calculation_parameters IS 'Configurable parameters for loan calculations';
COMMENT ON TABLE loan_calculations IS 'History of loan calculations performed'; 
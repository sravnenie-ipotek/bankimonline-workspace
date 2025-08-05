-- Migration: Form Session Management and Geolocation Tracking
-- Date: 2025-06-13
-- Purpose: Handle Steps 1-3 form data temporarily and track user geolocation per Confluence spec
-- Requirements: Support property ownership logic and session-based form management

-- =====================================================
-- 1. FORM SESSION MANAGEMENT
-- =====================================================

-- Client Form Sessions Table (for Steps 1-3 data)
CREATE TABLE IF NOT EXISTS client_form_sessions (
    id SERIAL PRIMARY KEY,
    session_id VARCHAR(255) UNIQUE NOT NULL,
    client_id INTEGER REFERENCES clients(id) ON DELETE CASCADE, -- NULL until phone verification
    
    -- Step 1: Property & Loan Details (from Confluence Action #7-#14)
    property_value DECIMAL(12,2), -- Action #7: Стоимость недвижимости
    property_city VARCHAR(100), -- Action #8: Город покупки 
    loan_period_preference VARCHAR(50), -- Action #9: Когда планируете оформить
    initial_payment DECIMAL(12,2), -- Action #10: Первоначальный взнос
    property_type VARCHAR(50), -- Action #11: Тип недвижимости
    property_ownership VARCHAR(100), -- Action #12: Владение недвижимостью (3 options)
    loan_term_years INTEGER, -- Action #13: Срок ипотеки (4-30 years)
    calculated_monthly_payment DECIMAL(12,2), -- Action #14: Calculated payment
    
    -- Step 2: Personal Information (will be filled from other forms)
    personal_data JSONB, -- Flexible storage for personal info
    
    -- Step 3: Financial Information (will be filled from income forms)
    financial_data JSONB, -- Flexible storage for income/employment data
    
    -- Property Ownership Logic (from Confluence Action #12)
    ltv_ratio DECIMAL(5,2), -- Calculated based on property ownership (75%, 50%, 70%)
    financing_percentage DECIMAL(5,2), -- Max financing available
    
    -- Session Management
    current_step INTEGER DEFAULT 1 CHECK (current_step BETWEEN 1 AND 4),
    is_completed BOOLEAN DEFAULT FALSE,
    expires_at TIMESTAMP DEFAULT (NOW() + INTERVAL '24 hours'),
    
    -- Geolocation Tracking (Confluence requirement)
    ip_address INET,
    country_code VARCHAR(3),
    city_detected VARCHAR(100),
    geolocation_data JSONB, -- Flexible for additional geo data
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    step1_completed_at TIMESTAMP,
    step2_completed_at TIMESTAMP, 
    step3_completed_at TIMESTAMP
);

-- =====================================================
-- 2. PROPERTY OWNERSHIP CONFIGURATION
-- =====================================================

-- Property Ownership Options (from Confluence Action #12)
CREATE TABLE IF NOT EXISTS property_ownership_options (
    id SERIAL PRIMARY KEY,
    option_key VARCHAR(50) UNIQUE NOT NULL,
    option_text_ru TEXT NOT NULL,
    option_text_en TEXT,
    option_text_he TEXT,
    ltv_percentage DECIMAL(5,2) NOT NULL, -- 75.00, 50.00, 70.00
    financing_percentage DECIMAL(5,2) NOT NULL, -- 75.00, 50.00, 70.00
    is_active BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- 3. CALCULATION CACHE FOR PERFORMANCE
-- =====================================================

-- Cache calculation results to avoid recalculation
CREATE TABLE IF NOT EXISTS mortgage_calculation_cache (
    id SERIAL PRIMARY KEY,
    session_id VARCHAR(255) REFERENCES client_form_sessions(session_id) ON DELETE CASCADE,
    calculation_input JSONB NOT NULL, -- Input parameters
    calculation_result JSONB NOT NULL, -- Bank offers and calculations
    interest_rate_used DECIMAL(5,3), -- Rate used from banking_standards
    calculated_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP DEFAULT (NOW() + INTERVAL '1 hour')
);

-- =====================================================
-- 4. INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_form_sessions_session_id ON client_form_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_form_sessions_client_id ON client_form_sessions(client_id);
CREATE INDEX IF NOT EXISTS idx_form_sessions_current_step ON client_form_sessions(current_step);
CREATE INDEX IF NOT EXISTS idx_form_sessions_expires_at ON client_form_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_form_sessions_ip_address ON client_form_sessions(ip_address);
CREATE INDEX IF NOT EXISTS idx_property_ownership_key ON property_ownership_options(option_key);
CREATE INDEX IF NOT EXISTS idx_calculation_cache_session_id ON mortgage_calculation_cache(session_id);
CREATE INDEX IF NOT EXISTS idx_calculation_cache_expires_at ON mortgage_calculation_cache(expires_at);

-- =====================================================
-- 5. INSERT DEFAULT PROPERTY OWNERSHIP OPTIONS (Confluence Action #12)
-- =====================================================

INSERT INTO property_ownership_options (option_key, option_text_ru, option_text_en, option_text_he, ltv_percentage, financing_percentage, display_order) VALUES
(
    'no_property', 
    'Нет, я пока не владею недвижимостью',
    'No, I do not currently own property',
    'לא, אני לא בעלים של נכס כרגע',
    75.00, 
    75.00, 
    1
),
(
    'has_property', 
    'Да, у меня уже есть недвижимость',
    'Yes, I already own property',
    'כן, כבר יש לי נכס',
    50.00, 
    50.00, 
    2
),
(
    'selling_property', 
    'Я собираюсь продать единственную недвижимость в ближайшие два года, чтобы использовать полученный капитал для приобретения новой',
    'I plan to sell my only property within two years to use the capital for a new purchase',
    'אני מתכנן למכור את הנכס היחיד שלי בתוך שנתיים כדי להשתמש בהון לרכישה חדשה',
    70.00, 
    70.00, 
    3
)
ON CONFLICT (option_key) DO UPDATE SET
    option_text_ru = EXCLUDED.option_text_ru,
    option_text_en = EXCLUDED.option_text_en,
    option_text_he = EXCLUDED.option_text_he,
    ltv_percentage = EXCLUDED.ltv_percentage,
    financing_percentage = EXCLUDED.financing_percentage;

-- =====================================================
-- 6. UTILITY FUNCTIONS
-- =====================================================

-- Function to generate session ID
CREATE OR REPLACE FUNCTION generate_session_id()
RETURNS TEXT AS $$
BEGIN
    RETURN 'sess_' || TO_CHAR(NOW(), 'YYYYMMDD') || '_' || 
           LPAD(EXTRACT(epoch FROM NOW())::TEXT, 10, '0') || '_' ||
           LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- Function to get property ownership LTV ratio
CREATE OR REPLACE FUNCTION get_property_ownership_ltv(p_option_key VARCHAR(50))
RETURNS DECIMAL(5,2) AS $$
DECLARE
    ltv_ratio DECIMAL(5,2);
BEGIN
    SELECT ltv_percentage INTO ltv_ratio
    FROM property_ownership_options
    WHERE option_key = p_option_key AND is_active = true;
    
    -- Default to 50% if not found (safest option)
    RETURN COALESCE(ltv_ratio, 50.00);
END;
$$ LANGUAGE plpgsql;

-- Function to get configurable interest rate from banking_standards
CREATE OR REPLACE FUNCTION get_current_mortgage_rate()
RETURNS DECIMAL(5,3) AS $$
DECLARE
    current_rate DECIMAL(5,3);
BEGIN
    -- Get from banking_standards table (configurable by admin)
    SELECT standard_value INTO current_rate
    FROM banking_standards
    WHERE business_path = 'mortgage' 
    AND standard_category = 'rate'
    AND standard_name = 'base_mortgage_rate'
    AND is_active = true
    AND (effective_to IS NULL OR effective_to >= CURRENT_DATE)
    LIMIT 1;
    
    -- Fallback to calculation_parameters if not found in banking_standards
    IF current_rate IS NULL THEN
        SELECT parameter_value INTO current_rate
        FROM calculation_parameters
        WHERE parameter_name = 'base_mortgage_rate'
        AND is_active = true
        LIMIT 1;
    END IF;
    
    -- Final fallback (should never happen with proper data)
    RETURN COALESCE(current_rate, 5.0);
END;
$$ LANGUAGE plpgsql;

-- Function to calculate annuity payment (Confluence requirement)
CREATE OR REPLACE FUNCTION calculate_annuity_payment(
    p_loan_amount DECIMAL(12,2),
    p_annual_rate DECIMAL(5,3),
    p_term_years INTEGER
)
RETURNS DECIMAL(12,2) AS $$
DECLARE
    monthly_rate DECIMAL(10,6);
    total_payments INTEGER;
    monthly_payment DECIMAL(12,2);
BEGIN
    -- Convert annual rate to monthly rate
    monthly_rate := (p_annual_rate / 100.0) / 12.0;
    total_payments := p_term_years * 12;
    
    -- Handle zero interest rate case
    IF monthly_rate = 0 THEN
        RETURN p_loan_amount / total_payments;
    END IF;
    
    -- Standard annuity formula: PMT = PV * [r(1+r)^n] / [(1+r)^n - 1]
    monthly_payment := p_loan_amount * 
        (monthly_rate * POWER(1 + monthly_rate, total_payments)) /
        (POWER(1 + monthly_rate, total_payments) - 1);
    
    RETURN ROUND(monthly_payment, 2);
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 7. TRIGGERS FOR AUTOMATIC UPDATES
-- =====================================================

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_form_session_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_form_sessions_timestamp
    BEFORE UPDATE ON client_form_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_form_session_timestamp();

-- Trigger to auto-calculate LTV when property ownership changes
CREATE OR REPLACE FUNCTION auto_calculate_ltv()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.property_ownership IS NOT NULL AND 
       (OLD.property_ownership IS NULL OR OLD.property_ownership != NEW.property_ownership) THEN
        
        NEW.ltv_ratio := get_property_ownership_ltv(NEW.property_ownership);
        NEW.financing_percentage := NEW.ltv_ratio;
        
        -- Recalculate monthly payment if we have enough data
        IF NEW.property_value IS NOT NULL AND NEW.initial_payment IS NOT NULL AND NEW.loan_term_years IS NOT NULL THEN
            DECLARE
                loan_amount DECIMAL(12,2);
                interest_rate DECIMAL(5,3);
            BEGIN
                loan_amount := NEW.property_value - NEW.initial_payment;
                interest_rate := get_current_mortgage_rate();
                
                NEW.calculated_monthly_payment := calculate_annuity_payment(
                    loan_amount, 
                    interest_rate, 
                    NEW.loan_term_years
                );
            END;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auto_calculate_ltv
    BEFORE INSERT OR UPDATE ON client_form_sessions
    FOR EACH ROW
    EXECUTE FUNCTION auto_calculate_ltv();

-- =====================================================
-- 8. CLEANUP FUNCTIONS
-- =====================================================

-- Function to clean up expired sessions and cache
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER := 0;
BEGIN
    -- Delete expired form sessions
    DELETE FROM client_form_sessions 
    WHERE expires_at < NOW() AND is_completed = false;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Delete expired calculation cache
    DELETE FROM mortgage_calculation_cache 
    WHERE expires_at < NOW();
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- MIGRATION COMPLETED
-- =====================================================
-- New Tables: 3 (client_form_sessions, property_ownership_options, mortgage_calculation_cache)
-- New Functions: 5 (generate_session_id, get_property_ownership_ltv, get_current_mortgage_rate, calculate_annuity_payment, cleanup_expired_sessions)
-- New Triggers: 2 (timestamp update, LTV auto-calculation)
-- Default Records: 3 property ownership options with LTV ratios from Confluence
-- Features: Session management, geolocation tracking, property ownership logic, configurable rates 
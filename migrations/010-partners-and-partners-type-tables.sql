-- Migration: Add Partners and PartnersType Tables
-- Date: 2025-01-27
-- Purpose: Add partners management system with type categorization for business partnerships and franchises

-- Create partners_type table to categorize different types of partnerships
CREATE TABLE IF NOT EXISTS partners_type (
    id SERIAL PRIMARY KEY,
    key VARCHAR(50) UNIQUE NOT NULL,
    name_en VARCHAR(100) NOT NULL,
    name_he VARCHAR(100) NOT NULL,
    name_ru VARCHAR(100) NOT NULL,
    description_en TEXT,
    description_he TEXT,
    description_ru TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert initial partner types data
INSERT INTO partners_type (key, name_en, name_he, name_ru, description_en, description_he, description_ru, display_order) VALUES 
    ('real_estate_broker', 'Real Estate Broker', 'מתווך נדל"ן', 'Брокер недвижимости', 'Real estate brokerage partnerships', 'שותפויות תיווך נדל"ן', 'Партнерство в сфере недвижимости', 1),
    ('lawyer_partnership', 'Legal Partnership', 'שותפות משפטית', 'Юридическое партнерство', 'Legal services partnerships', 'שותפויות שירותים משפטיים', 'Партнерство юридических услуг', 2),
    ('financial_advisor', 'Financial Advisor', 'יועץ פיננסי', 'Финансовый консультант', 'Financial advisory partnerships', 'שותפויות ייעוץ פיננסי', 'Партнерство финансовых консультантов', 3),
    ('franchise_partner', 'Franchise Partner', 'שותף זיכיון', 'Партнер франшизы', 'Franchise business partnerships', 'שותפויות עסקי זיכיון', 'Франчайзинговое партнерство', 4),
    ('bank_partner', 'Banking Partner', 'שותף בנקאי', 'Банковский партнер', 'Banking institution partnerships', 'שותפויות מוסדות בנקאיים', 'Партнерство с банковскими учреждениями', 5),
    ('insurance_partner', 'Insurance Partner', 'שותף ביטוח', 'Страховой партнер', 'Insurance company partnerships', 'שותפויות חברות ביטוח', 'Партнерство со страховыми компаниями', 6),
    ('technology_partner', 'Technology Partner', 'שותף טכנולוגי', 'Технологический партнер', 'Technology services partnerships', 'שותפויות שירותים טכנולוגיים', 'Партнерство технологических услуг', 7),
    ('marketing_partner', 'Marketing Partner', 'שותף שיווקי', 'Маркетинговый партнер', 'Marketing and advertising partnerships', 'שותפויות שיווק ופרסום', 'Маркетинговое партнерство', 8)
ON CONFLICT (key) DO NOTHING;

-- Create partners table with foreign key to partners_type
CREATE TABLE IF NOT EXISTS partners (
    id SERIAL PRIMARY KEY,
    partner_type_id INTEGER NOT NULL REFERENCES partners_type(id) ON DELETE RESTRICT,
    company_name VARCHAR(200) NOT NULL,
    contact_person_name VARCHAR(150) NOT NULL,
    contact_email VARCHAR(150) UNIQUE NOT NULL,
    contact_phone VARCHAR(50) NOT NULL,
    company_address TEXT,
    city VARCHAR(100),
    region VARCHAR(100),
    website_url VARCHAR(300),
    license_number VARCHAR(100),
    license_authority VARCHAR(150),
    license_expiry_date DATE,
    business_registration_number VARCHAR(100),
    vat_number VARCHAR(50),
    bank_account_details TEXT,
    commission_rate DECIMAL(5,2),
    payment_terms VARCHAR(100),
    contract_start_date DATE,
    contract_end_date DATE,
    contract_status VARCHAR(50) DEFAULT 'active',
    monthly_target_amount DECIMAL(15,2),
    current_month_volume DECIMAL(15,2) DEFAULT 0,
    total_volume DECIMAL(15,2) DEFAULT 0,
    performance_rating DECIMAL(3,2) DEFAULT 0,
    last_activity_date TIMESTAMP,
    notes TEXT,
    internal_reference VARCHAR(100),
    assigned_manager_id INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    verification_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for faster lookups and foreign key performance
CREATE INDEX IF NOT EXISTS idx_partners_type_name_en ON partners_type(name_en);
CREATE INDEX IF NOT EXISTS idx_partners_type_name_he ON partners_type(name_he);
CREATE INDEX IF NOT EXISTS idx_partners_type_name_ru ON partners_type(name_ru);
CREATE INDEX IF NOT EXISTS idx_partners_type_active ON partners_type(is_active);
CREATE INDEX IF NOT EXISTS idx_partners_type_display_order ON partners_type(display_order);

CREATE INDEX IF NOT EXISTS idx_partners_partner_type_id ON partners(partner_type_id);
CREATE INDEX IF NOT EXISTS idx_partners_company_name ON partners(company_name);
CREATE INDEX IF NOT EXISTS idx_partners_contact_email ON partners(contact_email);
CREATE INDEX IF NOT EXISTS idx_partners_contact_phone ON partners(contact_phone);
CREATE INDEX IF NOT EXISTS idx_partners_city ON partners(city);
CREATE INDEX IF NOT EXISTS idx_partners_region ON partners(region);
CREATE INDEX IF NOT EXISTS idx_partners_contract_status ON partners(contract_status);
CREATE INDEX IF NOT EXISTS idx_partners_license_number ON partners(license_number);
CREATE INDEX IF NOT EXISTS idx_partners_active ON partners(is_active);
CREATE INDEX IF NOT EXISTS idx_partners_verified ON partners(is_verified);
CREATE INDEX IF NOT EXISTS idx_partners_contract_dates ON partners(contract_start_date, contract_end_date);
CREATE INDEX IF NOT EXISTS idx_partners_performance ON partners(performance_rating);
CREATE INDEX IF NOT EXISTS idx_partners_last_activity ON partners(last_activity_date);

-- Create trigger to update updated_at timestamp (reuse existing function)
-- Add triggers for updated_at (only if they don't exist)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_update_partners_type_updated_at') THEN
        CREATE TRIGGER trigger_update_partners_type_updated_at
            BEFORE UPDATE ON partners_type
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_update_partners_updated_at') THEN
        CREATE TRIGGER trigger_update_partners_updated_at
            BEFORE UPDATE ON partners
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- Add constraints for data integrity
ALTER TABLE partners ADD CONSTRAINT chk_partners_contract_status 
    CHECK (contract_status IN ('active', 'pending', 'suspended', 'terminated', 'expired'));

ALTER TABLE partners ADD CONSTRAINT chk_partners_commission_rate 
    CHECK (commission_rate >= 0 AND commission_rate <= 100);

ALTER TABLE partners ADD CONSTRAINT chk_partners_performance_rating 
    CHECK (performance_rating >= 0 AND performance_rating <= 5);

ALTER TABLE partners ADD CONSTRAINT chk_partners_contract_dates 
    CHECK (contract_end_date IS NULL OR contract_end_date >= contract_start_date);

-- Add comments for documentation
COMMENT ON TABLE partners_type IS 'Categories of business partnerships (real estate, legal, financial, etc.)';
COMMENT ON TABLE partners IS 'Business partners and franchise partners management';

COMMENT ON COLUMN partners_type.key IS 'Unique identifier for the partner type';
COMMENT ON COLUMN partners_type.name_he IS 'Partner type name in Hebrew';
COMMENT ON COLUMN partners_type.name_en IS 'Partner type name in English';
COMMENT ON COLUMN partners_type.name_ru IS 'Partner type name in Russian';
COMMENT ON COLUMN partners_type.display_order IS 'Display order for UI sorting';

COMMENT ON COLUMN partners.partner_type_id IS 'Foreign key to partners_type table';
COMMENT ON COLUMN partners.company_name IS 'Legal company name of the partner';
COMMENT ON COLUMN partners.contact_person_name IS 'Primary contact person full name';
COMMENT ON COLUMN partners.license_number IS 'Professional license number (for brokers, lawyers, etc.)';
COMMENT ON COLUMN partners.license_authority IS 'Authority that issued the license';
COMMENT ON COLUMN partners.commission_rate IS 'Commission percentage (0-100)';
COMMENT ON COLUMN partners.contract_status IS 'Current contract status (active, pending, suspended, terminated, expired)';
COMMENT ON COLUMN partners.performance_rating IS 'Performance rating from 0 to 5';
COMMENT ON COLUMN partners.monthly_target_amount IS 'Monthly target amount in ILS';
COMMENT ON COLUMN partners.total_volume IS 'Total business volume generated in ILS';
COMMENT ON COLUMN partners.assigned_manager_id IS 'ID of the internal manager responsible for this partner';
COMMENT ON COLUMN partners.is_verified IS 'Whether the partner has been verified and approved'; 
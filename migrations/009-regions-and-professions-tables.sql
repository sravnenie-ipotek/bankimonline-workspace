-- Migration: Add Regions and Professions Tables for Lawyers Form
-- Date: 2025-06-25
-- Purpose: Add regions table for legal service areas and professions table for professional status

-- Create regions table with multilingual support for legal service areas
CREATE TABLE IF NOT EXISTS regions (
    id SERIAL PRIMARY KEY,
    key VARCHAR(50) UNIQUE NOT NULL,
    name_en VARCHAR(100) NOT NULL,
    name_he VARCHAR(100) NOT NULL,
    name_ru VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert initial regions data for Israel legal service areas
INSERT INTO regions (key, name_en, name_he, name_ru) VALUES 
    ('center', 'Center District', 'מחוז המרכז', 'Центральный округ'),
    ('tel_aviv', 'Tel Aviv District', 'מחוז תל אביב', 'Округ Тель-Авив'),
    ('jerusalem', 'Jerusalem District', 'מחוז ירושלים', 'Иерусалимский округ'),
    ('north', 'Northern District', 'מחוז הצפון', 'Северный округ'),
    ('haifa', 'Haifa District', 'מחוז חיפה', 'Округ Хайфа'),
    ('south', 'Southern District', 'מחוז הדרום', 'Южный округ'),
    ('judea_samaria', 'Judea and Samaria', 'יהודה ושומרון', 'Иудея и Самария'),
    ('nationwide', 'Nationwide Coverage', 'כלל ארצי', 'По всей стране')
ON CONFLICT (key) DO NOTHING;

-- Create professions table with multilingual support
CREATE TABLE IF NOT EXISTS professions (
    id SERIAL PRIMARY KEY,
    key VARCHAR(50) UNIQUE NOT NULL,
    name_en VARCHAR(100) NOT NULL,
    name_he VARCHAR(100) NOT NULL,
    name_ru VARCHAR(100) NOT NULL,
    category VARCHAR(50) DEFAULT 'general',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert initial professions data focusing on legal and related fields
INSERT INTO professions (key, name_en, name_he, name_ru, category) VALUES 
    ('lawyer', 'Lawyer', 'עורך דין', 'Адвокат', 'legal'),
    ('legal_advisor', 'Legal Advisor', 'יועץ משפטי', 'Юрисконсульт', 'legal'),
    ('notary', 'Notary', 'נוטריון', 'Нотариус', 'legal'),
    ('paralegal', 'Paralegal', 'עוזר משפטי', 'Помощник юриста', 'legal'),
    ('legal_consultant', 'Legal Consultant', 'יועץ משפטי עצמאי', 'Консультант-юрист', 'legal'),
    ('corporate_lawyer', 'Corporate Lawyer', 'עורך דין תאגידי', 'Корпоративный юрист', 'legal'),
    ('real_estate_lawyer', 'Real Estate Lawyer', 'עורך דין נדל"ן', 'Юрист по недвижимости', 'legal'),
    ('tax_advisor', 'Tax Advisor', 'יועץ מס', 'Налоговый консультант', 'finance'),
    ('accountant', 'Accountant', 'רואה חשבון', 'Бухгалтер', 'finance'),
    ('financial_advisor', 'Financial Advisor', 'יועץ פיננסי', 'Финансовый консультант', 'finance'),
    ('business_consultant', 'Business Consultant', 'יועץ עסקי', 'Бизнес-консультант', 'business'),
    ('engineer', 'Engineer', 'מהנדס', 'Инженер', 'technical'),
    ('architect', 'Architect', 'אדריכל', 'Архитектор', 'technical'),
    ('doctor', 'Doctor', 'רופא', 'Врач', 'medical'),
    ('teacher', 'Teacher', 'מורה', 'Учитель', 'education'),
    ('manager', 'Manager', 'מנהל', 'Менеджер', 'management'),
    ('entrepreneur', 'Entrepreneur', 'יזם', 'Предприниматель', 'business'),
    ('freelancer', 'Freelancer', 'עצמאי', 'Фрилансер', 'general'),
    ('retired', 'Retired', 'פנסיונר', 'Пенсионер', 'general'),
    ('student', 'Student', 'סטודנט', 'Студент', 'education'),
    ('other', 'Other', 'אחר', 'Другое', 'general')
ON CONFLICT (key) DO NOTHING;

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_regions_name_en ON regions(name_en);
CREATE INDEX IF NOT EXISTS idx_regions_name_he ON regions(name_he);
CREATE INDEX IF NOT EXISTS idx_regions_name_ru ON regions(name_ru);
CREATE INDEX IF NOT EXISTS idx_regions_active ON regions(is_active);

CREATE INDEX IF NOT EXISTS idx_professions_name_en ON professions(name_en);
CREATE INDEX IF NOT EXISTS idx_professions_name_he ON professions(name_he);
CREATE INDEX IF NOT EXISTS idx_professions_name_ru ON professions(name_ru);
CREATE INDEX IF NOT EXISTS idx_professions_category ON professions(category);
CREATE INDEX IF NOT EXISTS idx_professions_active ON professions(is_active);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at (only if they don't exist)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_update_regions_updated_at') THEN
        CREATE TRIGGER trigger_update_regions_updated_at
            BEFORE UPDATE ON regions
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_update_professions_updated_at') THEN
        CREATE TRIGGER trigger_update_professions_updated_at
            BEFORE UPDATE ON professions
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- Add comments for documentation
COMMENT ON TABLE regions IS 'Legal service regions for lawyers and legal professionals';
COMMENT ON TABLE professions IS 'Professional categories and job types for user classification';
COMMENT ON COLUMN regions.key IS 'Unique identifier for the region';
COMMENT ON COLUMN regions.name_he IS 'Region name in Hebrew';
COMMENT ON COLUMN regions.name_en IS 'Region name in English';
COMMENT ON COLUMN regions.name_ru IS 'Region name in Russian';
COMMENT ON COLUMN professions.key IS 'Unique identifier for the profession';
COMMENT ON COLUMN professions.category IS 'Category grouping for the profession (legal, finance, business, etc.)'; 
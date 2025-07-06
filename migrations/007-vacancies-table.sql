-- Migration: Add Vacancies Table for Job Listings
-- Date: 2025-07-06
-- Purpose: Add vacancies table to manage job postings

-- Create vacancies table
CREATE TABLE IF NOT EXISTS vacancies (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('development', 'design', 'management', 'marketing', 'finance', 'customer_service')),
    subcategory VARCHAR(50),
    location VARCHAR(100) NOT NULL,
    employment_type VARCHAR(30) NOT NULL CHECK (employment_type IN ('full_time', 'part_time', 'contract', 'temporary')),
    salary_min DECIMAL(10,2),
    salary_max DECIMAL(10,2),
    salary_currency VARCHAR(3) DEFAULT 'ILS',
    description_he TEXT,
    description_en TEXT,
    description_ru TEXT,
    requirements_he TEXT,
    requirements_en TEXT,
    requirements_ru TEXT,
    benefits_he TEXT,
    benefits_en TEXT,
    benefits_ru TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    posted_date DATE DEFAULT CURRENT_DATE,
    closing_date DATE,
    created_by INTEGER REFERENCES clients(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    -- Constraints
    CHECK (salary_max IS NULL OR salary_min IS NULL OR salary_max >= salary_min),
    CHECK (closing_date IS NULL OR closing_date >= posted_date)
);

-- Create vacancy applications table
CREATE TABLE IF NOT EXISTS vacancy_applications (
    id SERIAL PRIMARY KEY,
    vacancy_id INTEGER REFERENCES vacancies(id) ON DELETE CASCADE,
    applicant_name VARCHAR(255) NOT NULL,
    applicant_email VARCHAR(255) NOT NULL,
    applicant_phone VARCHAR(20),
    cover_letter TEXT,
    resume_file_path VARCHAR(500),
    linkedin_profile VARCHAR(255),
    portfolio_url VARCHAR(255),
    years_experience INTEGER CHECK (years_experience >= 0),
    application_status VARCHAR(20) CHECK (application_status IN ('pending', 'reviewing', 'shortlisted', 'interviewed', 'rejected', 'hired')) DEFAULT 'pending',
    applied_at TIMESTAMP DEFAULT NOW(),
    reviewed_at TIMESTAMP,
    reviewed_by INTEGER REFERENCES clients(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_vacancies_category ON vacancies(category);
CREATE INDEX IF NOT EXISTS idx_vacancies_active ON vacancies(is_active);
CREATE INDEX IF NOT EXISTS idx_vacancies_featured ON vacancies(is_featured);
CREATE INDEX IF NOT EXISTS idx_vacancies_posted_date ON vacancies(posted_date);
CREATE INDEX IF NOT EXISTS idx_vacancy_applications_vacancy_id ON vacancy_applications(vacancy_id);
CREATE INDEX IF NOT EXISTS idx_vacancy_applications_status ON vacancy_applications(application_status);
CREATE INDEX IF NOT EXISTS idx_vacancy_applications_email ON vacancy_applications(applicant_email);

-- Add triggers for updated_at timestamp
CREATE TRIGGER trigger_update_vacancies_updated_at
    BEFORE UPDATE ON vacancies
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_vacancy_applications_updated_at
    BEFORE UPDATE ON vacancy_applications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert sample vacancy data
INSERT INTO vacancies (
    title, 
    category, 
    subcategory, 
    location, 
    employment_type, 
    salary_min, 
    salary_max,
    description_he,
    description_en, 
    description_ru
) VALUES 
(
    'Back-end Developer',
    'development',
    'backend',
    'Tel Aviv',
    'full_time',
    6000,
    12000,
    'אנחנו מחפשים מפתח Back-end מנוסה להצטרף לצוות הסטארט-אפ שלנו בתחום הפינטק. תעבוד עם טכנולוגיות מתקדמות ותשתתף ביצירת פתרונות בנקאיים חדשניים.',
    'We are looking for an experienced Back-end developer to join our fintech startup team. You will work with modern technologies and participate in creating innovative banking solutions.',
    'Мы ищем опытного Back-end разработчика для присоединения к нашей команде финтех-стартапа. Вы будете работать с современными технологиями и участвовать в создании инновационных банковских решений.'
),
(
    'Product Designer',
    'design',
    'product_design',
    'Tel Aviv',
    'full_time',
    5000,
    10000,
    'הצטרף לצוות העיצוב שלנו ועזור ליצור ממשקי משתמש אינטואיטיביים עבור אפליקציות בנקאיות. אנחנו מחפשים מעצב יצירתי עם ניסיון בפינטק.',
    'Join our design team and help create intuitive user interfaces for banking applications. We are looking for a creative designer with fintech experience.',
    'Присоединяйтесь к нашей дизайн-команде и помогите создавать интуитивные пользовательские интерфейсы для банковских приложений. Мы ищем креативного дизайнера с опытом в финтех.'
),
(
    'Frontend Developer',
    'development',
    'frontend',
    'Tel Aviv',
    'full_time',
    5500,
    11000,
    'מחפשים מפתח Frontend מיומן ליצירת חוויות משתמש מרהיבות באפליקציות בנקאיות. ניסיון ב-React ו-TypeScript יתרון.',
    'Looking for a skilled Frontend developer to create amazing user experiences in banking applications. Experience with React and TypeScript is an advantage.',
    'Ищем опытного Frontend разработчика для создания потрясающих пользовательских интерфейсов в банковских приложениях. Опыт работы с React и TypeScript будет преимуществом.'
);

-- Add comment for documentation
COMMENT ON TABLE vacancies IS 'Job vacancies and openings for the company';
COMMENT ON TABLE vacancy_applications IS 'Applications submitted for job vacancies'; 
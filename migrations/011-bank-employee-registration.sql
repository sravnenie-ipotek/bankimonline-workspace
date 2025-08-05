-- Migration: Bank Employee Registration System
-- Description: Creates tables for bank employee registration and management
-- Author: AI Assistant
-- Date: 2025-01-06

-- Bank Branches Table
CREATE TABLE IF NOT EXISTS bank_branches (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    bank_id INTEGER NOT NULL,
    name_en TEXT NOT NULL,
    name_he TEXT,
    name_ru TEXT,
    branch_code TEXT,
    address TEXT,
    city TEXT,
    country TEXT DEFAULT 'IL',
    phone TEXT,
    email TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (bank_id) REFERENCES banks(id) ON DELETE CASCADE
);

-- Bank Employees Table
CREATE TABLE IF NOT EXISTS bank_employees (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    position TEXT NOT NULL,
    corporate_email TEXT UNIQUE NOT NULL,
    bank_id INTEGER NOT NULL,
    branch_id INTEGER,
    bank_number TEXT,
    status TEXT DEFAULT 'pending', -- pending, active, inactive, deleted
    terms_accepted BOOLEAN DEFAULT FALSE,
    terms_accepted_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_login DATETIME,
    password_hash TEXT,
    registration_token TEXT,
    registration_expires DATETIME,
    FOREIGN KEY (bank_id) REFERENCES banks(id) ON DELETE CASCADE,
    FOREIGN KEY (branch_id) REFERENCES bank_branches(id) ON DELETE SET NULL
);

-- Bank Employee Sessions Table
CREATE TABLE IF NOT EXISTS bank_employee_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id INTEGER NOT NULL,
    token TEXT UNIQUE NOT NULL,
    expires_at DATETIME NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES bank_employees(id) ON DELETE CASCADE
);

-- Registration Form Configuration Table
CREATE TABLE IF NOT EXISTS registration_form_config (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    language TEXT NOT NULL, -- en, he, ru
    field_name TEXT NOT NULL, -- title, subtitle, label_name, etc.
    field_value TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(language, field_name)
);

-- Israeli Bank Numbers Reference Table
CREATE TABLE IF NOT EXISTS israeli_bank_numbers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    bank_number TEXT UNIQUE NOT NULL,
    bank_name_en TEXT NOT NULL,
    bank_name_he TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_bank_employees_email ON bank_employees(corporate_email);
CREATE INDEX IF NOT EXISTS idx_bank_employees_bank_id ON bank_employees(bank_id);
CREATE INDEX IF NOT EXISTS idx_bank_employees_status ON bank_employees(status);
CREATE INDEX IF NOT EXISTS idx_bank_branches_bank_id ON bank_branches(bank_id);
CREATE INDEX IF NOT EXISTS idx_employee_sessions_token ON bank_employee_sessions(token);
CREATE INDEX IF NOT EXISTS idx_employee_sessions_expires ON bank_employee_sessions(expires_at);

-- Insert default Israeli bank numbers
INSERT OR IGNORE INTO israeli_bank_numbers (bank_number, bank_name_en, bank_name_he) VALUES
('010', 'Bank Hapoalim', 'בנק הפועלים'),
('011', 'Discount Bank', 'בנק דיסקונט'),
('012', 'Bank Leumi', 'בנק לאומי'),
('013', 'Igud Bank', 'בנק איגוד'),
('014', 'Bank Otsar Ha-Hayal', 'בנק אוצר החייל'),
('017', 'Mercantile Discount Bank', 'בנק מרכנתיל דיסקונט'),
('020', 'Bank Mizrahi-Tefahot', 'בנק מזרחי טפחות'),
('022', 'Bank Yahav', 'בנק יהב'),
('023', 'FIBI Bank', 'בנק פיבי'),
('026', 'UBank', 'יו בנק'),
('031', 'Bank Massad', 'בנק מסד'),
('034', 'Bank Jerusalem', 'בנק ירושלים'),
('039', 'Arab Bank', 'הבנק הערבי'),
('046', 'Bank Dexia', 'בנק דקסיה'),
('052', 'Bank Poalei Agudat Israel', 'בנק פועלי אגודת ישראל'),
('054', 'Bank of Jerusalem', 'בנק ירושלים'),
('065', 'HSBC Bank', 'בנק HSBC'),
('066', 'Citibank', 'סיטיבנק'),
('073', 'JPMorgan Chase Bank', 'ג׳יי פי מורגן צ׳ייס בנק');

-- Insert default registration form configuration
INSERT OR IGNORE INTO registration_form_config (language, field_name, field_value) VALUES
-- English
('en', 'title', 'Registration'),
('en', 'subtitle', 'Register and receive clients'),
('en', 'step1_title', 'Basic Information'),
('en', 'step2_title', 'Service Selection'),
('en', 'label_name', 'Full Name'),
('en', 'label_position', 'Position'),
('en', 'label_email', 'Corporate Email'),
('en', 'label_bank', 'Bank'),
('en', 'label_branch', 'Bank Branch'),
('en', 'label_bank_number', 'Bank Number'),
('en', 'button_continue', 'Continue'),
('en', 'link_login', 'Already have an account? Sign in'),
('en', 'terms_text', 'I agree to the platform terms'),
('en', 'terms_link', 'platform terms'),

-- Hebrew
('he', 'title', 'הרשמה'),
('he', 'subtitle', 'הירשמו וקבלו לקוחות'),
('he', 'step1_title', 'מידע בסיסי'),
('he', 'step2_title', 'בחירת שירות'),
('he', 'label_name', 'שם מלא'),
('he', 'label_position', 'תפקיד'),
('he', 'label_email', 'דוא"ל תאגידי'),
('he', 'label_bank', 'בנק'),
('he', 'label_branch', 'סניף בנק'),
('he', 'label_bank_number', 'מספר בנק'),
('he', 'button_continue', 'המשך'),
('he', 'link_login', 'כבר יש לך חשבון? התחבר'),
('he', 'terms_text', 'אני מסכים לתנאי הפלטפורמה'),
('he', 'terms_link', 'תנאי הפלטפורמה'),

-- Russian
('ru', 'title', 'Регистрация'),
('ru', 'subtitle', 'Зарегистрируйтесь и получайте клиентов'),
('ru', 'step1_title', 'Основная информация'),
('ru', 'step2_title', 'Выбор услуги'),
('ru', 'label_name', 'Имя Фамилия'),
('ru', 'label_position', 'Должность'),
('ru', 'label_email', 'Корпоративный email'),
('ru', 'label_bank', 'Банк'),
('ru', 'label_branch', 'Филиал банка'),
('ru', 'label_bank_number', 'Номер банка'),
('ru', 'button_continue', 'Продолжить'),
('ru', 'link_login', 'Уже есть аккаунт? Войти'),
('ru', 'terms_text', 'Я согласен с правилами платформы'),
('ru', 'terms_link', 'правилами платформы'); 
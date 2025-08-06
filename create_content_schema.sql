-- Create content database schema
-- This script creates the necessary tables for content management

-- Create content_items table
CREATE TABLE IF NOT EXISTS content_items (
    id SERIAL PRIMARY KEY,
    content_key VARCHAR(255) NOT NULL UNIQUE,
    screen_location VARCHAR(100) NOT NULL,
    component_type VARCHAR(100) NOT NULL,
    category VARCHAR(100),
    page_id INTEGER,
    element_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create content_translations table
CREATE TABLE IF NOT EXISTS content_translations (
    id SERIAL PRIMARY KEY,
    content_item_id INTEGER NOT NULL REFERENCES content_items(id) ON DELETE CASCADE,
    language_code VARCHAR(10) NOT NULL,
    field_name VARCHAR(100) NOT NULL,
    content_value TEXT,
    translation_text TEXT,
    status VARCHAR(50) DEFAULT 'approved',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(content_item_id, language_code, field_name)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_content_items_screen_location ON content_items(screen_location);
CREATE INDEX IF NOT EXISTS idx_content_items_content_key ON content_items(content_key);
CREATE INDEX IF NOT EXISTS idx_content_translations_language ON content_translations(language_code);
CREATE INDEX IF NOT EXISTS idx_content_translations_status ON content_translations(status);

-- Insert some basic validation error content
INSERT INTO content_items (content_key, screen_location, component_type, category, element_order, is_active) VALUES
('validation_required', 'validation_errors', 'error_message', 'validation', 1, true),
('validation_email', 'validation_errors', 'error_message', 'validation', 2, true),
('validation_min_length', 'validation_errors', 'error_message', 'validation', 3, true),
('validation_max_length', 'validation_errors', 'error_message', 'validation', 4, true),
('validation_numeric', 'validation_errors', 'error_message', 'validation', 5, true);

-- Insert translations for validation errors
INSERT INTO content_translations (content_item_id, language_code, field_name, content_value, status) VALUES
-- English translations
(1, 'en', 'text', 'This field is required', 'approved'),
(2, 'en', 'text', 'Please enter a valid email address', 'approved'),
(3, 'en', 'text', 'Minimum length is {min} characters', 'approved'),
(4, 'en', 'text', 'Maximum length is {max} characters', 'approved'),
(5, 'en', 'text', 'Please enter a valid number', 'approved'),

-- Hebrew translations
(1, 'he', 'text', 'שדה זה הוא חובה', 'approved'),
(2, 'he', 'text', 'אנא הזן כתובת אימייל תקינה', 'approved'),
(3, 'he', 'text', 'אורך מינימלי הוא {min} תווים', 'approved'),
(4, 'he', 'text', 'אורך מקסימלי הוא {max} תווים', 'approved'),
(5, 'he', 'text', 'אנא הזן מספר תקין', 'approved'),

-- Russian translations
(1, 'ru', 'text', 'Это поле обязательно для заполнения', 'approved'),
(2, 'ru', 'text', 'Пожалуйста, введите корректный email адрес', 'approved'),
(3, 'ru', 'text', 'Минимальная длина {min} символов', 'approved'),
(4, 'ru', 'text', 'Максимальная длина {max} символов', 'approved'),
(5, 'ru', 'text', 'Пожалуйста, введите корректное число', 'approved'); 
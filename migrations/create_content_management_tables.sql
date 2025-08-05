-- Content Management System Tables
-- Creates tables for database-driven content management with multi-language support

-- Content items table - stores the master content items
CREATE TABLE IF NOT EXISTS content_items (
    id SERIAL PRIMARY KEY,
    key VARCHAR(255) NOT NULL,
    screen_location VARCHAR(100) NOT NULL,
    component_type VARCHAR(50) DEFAULT 'text',
    category VARCHAR(100) DEFAULT 'general',
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(key, screen_location)
);

-- Content translations table - stores translations for each content item
CREATE TABLE IF NOT EXISTS content_translations (
    id SERIAL PRIMARY KEY,
    content_item_id INTEGER REFERENCES content_items(id) ON DELETE CASCADE,
    language_code VARCHAR(10) NOT NULL,
    value TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(content_item_id, language_code)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_content_items_screen_location ON content_items(screen_location);
CREATE INDEX IF NOT EXISTS idx_content_items_key ON content_items(key);
CREATE INDEX IF NOT EXISTS idx_content_items_status ON content_items(status);
CREATE INDEX IF NOT EXISTS idx_content_translations_language ON content_translations(language_code);
CREATE INDEX IF NOT EXISTS idx_content_translations_status ON content_translations(status);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
DROP TRIGGER IF EXISTS update_content_items_updated_at ON content_items;
CREATE TRIGGER update_content_items_updated_at
    BEFORE UPDATE ON content_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_content_translations_updated_at ON content_translations;
CREATE TRIGGER update_content_translations_updated_at
    BEFORE UPDATE ON content_translations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert a test item to verify the tables work
INSERT INTO content_items (key, screen_location, component_type, category, status)
VALUES ('test_content', 'test', 'text', 'general', 'active')
ON CONFLICT (key, screen_location) DO NOTHING;

SELECT 'Content management tables created successfully!' as result;
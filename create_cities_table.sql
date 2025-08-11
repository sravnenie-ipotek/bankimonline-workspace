-- Create cities table migration
-- This creates a dedicated cities table for the content database

-- Drop table if exists to ensure clean migration
DROP TABLE IF EXISTS cities CASCADE;

-- Create cities table with multilingual support
CREATE TABLE cities (
    id SERIAL PRIMARY KEY,
    key VARCHAR(100) UNIQUE NOT NULL,
    name_en VARCHAR(255) NOT NULL,
    name_he VARCHAR(255) NOT NULL,
    name_ru VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_cities_key ON cities (key);
CREATE INDEX idx_cities_active ON cities (is_active);
CREATE INDEX idx_cities_sort ON cities (sort_order);

-- Insert major Israeli cities with translations
INSERT INTO cities (key, name_en, name_he, name_ru, sort_order) VALUES
    -- Major Cities (Top Priority)
    ('tel_aviv', 'Tel Aviv', 'תל אביב', 'Тель-Авив', 1),
    ('jerusalem', 'Jerusalem', 'ירושלים', 'Иерусалим', 2),
    ('haifa', 'Haifa', 'חיפה', 'Хайфа', 3),
    ('beer_sheva', 'Beer Sheva', 'באר שבע', 'Беэр-Шева', 4),
    ('netanya', 'Netanya', 'נתניה', 'Нетания', 5),
    ('ashdod', 'Ashdod', 'אשדוד', 'Ашдод', 6),
    ('holon', 'Holon', 'חולון', 'Холон', 7),
    ('petah_tikva', 'Petah Tikva', 'פתח תקווה', 'Петах-Тиква', 8),
    ('rishon_lezion', 'Rishon LeZion', 'ראשון לציון', 'Ришон-ле-Цион', 9),
    ('rehovot', 'Rehovot', 'רחובות', 'Реховот', 10),
    
    -- Central District Cities
    ('ramat_gan', 'Ramat Gan', 'רמת גן', 'Рамат-Ган', 11),
    ('bnei_brak', 'Bnei Brak', 'בני ברק', 'Бней-Брак', 12),
    ('bat_yam', 'Bat Yam', 'בת ים', 'Бат-Ям', 13),
    ('givatayim', 'Givatayim', 'גבעתיים', 'Гиватаим', 14),
    ('herzliya', 'Herzliya', 'הרצליה', 'Герцлия', 15),
    ('kfar_saba', 'Kfar Saba', 'כפר סבא', 'Кфар-Саба', 16),
    ('raanana', 'Raanana', 'רעננה', 'Раанана', 17),
    ('hod_hasharon', 'Hod HaSharon', 'הוד השרון', 'Ход-а-Шарон', 18),
    
    -- Northern Cities
    ('nazareth', 'Nazareth', 'נצרת', 'Назарет', 19),
    ('akko', 'Akko', 'עכו', 'Акко', 20),
    ('tiberias', 'Tiberias', 'טבריה', 'Тверия', 21),
    ('kiryat_shmona', 'Kiryat Shmona', 'קרית שמונה', 'Кирьят-Шмона', 22),
    ('nahariya', 'Nahariya', 'נהריה', 'Нагария', 23),
    
    -- Southern Cities
    ('ashkelon', 'Ashkelon', 'אשקלון', 'Ашкелон', 24),
    ('kiryat_gat', 'Kiryat Gat', 'קרית גת', 'Кирьят-Гат', 25),
    ('dimona', 'Dimona', 'דימונה', 'Димона', 26),
    ('arad', 'Arad', 'ערד', 'Арад', 27),
    ('eilat', 'Eilat', 'אילת', 'Эйлат', 28),
    
    -- Other Major Cities
    ('modi_in', 'Modiin', 'מודיעין', 'Модиин', 29),
    ('lod', 'Lod', 'לוד', 'Лод', 30),
    ('ramla', 'Ramla', 'רמלה', 'Рамла', 31);

-- Update timestamp function
CREATE OR REPLACE FUNCTION update_cities_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update the updated_at column
CREATE TRIGGER trigger_cities_updated_at
    BEFORE UPDATE ON cities
    FOR EACH ROW
    EXECUTE FUNCTION update_cities_updated_at();

-- Verify data insertion
SELECT 
    COUNT(*) as total_cities,
    COUNT(CASE WHEN is_active = true THEN 1 END) as active_cities
FROM cities;

-- Display sample data
SELECT key, name_en, name_he, name_ru 
FROM cities 
ORDER BY sort_order 
LIMIT 10;

COMMIT;
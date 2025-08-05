-- Create cities table with multilingual support
CREATE TABLE IF NOT EXISTS cities (
    id SERIAL PRIMARY KEY,
    key VARCHAR(50) UNIQUE NOT NULL,
    name_en VARCHAR(100) NOT NULL,
    name_he VARCHAR(100) NOT NULL,
    name_ru VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert initial cities data
INSERT INTO cities (key, name_en, name_he, name_ru) VALUES 
    ('tel_aviv', 'Tel Aviv', 'תל אביב', 'Тель-Авив'),
    ('jerusalem', 'Jerusalem', 'ירושלים', 'Иерусалим'),
    ('haifa', 'Haifa', 'חיפה', 'Хайфа'),
    ('beer_sheva', 'Beer Sheva', 'באר שבע', 'Беэр-Шева'),
    ('netanya', 'Netanya', 'נתניה', 'Нетания'),
    ('rishon_lezion', 'Rishon LeZion', 'ראשון לציון', 'Ришон-ле-Цион'),
    ('petah_tikva', 'Petah Tikva', 'פתח תקווה', 'Петах-Тиква'),
    ('ashdod', 'Ashdod', 'אשדוד', 'Ашдод'),
    ('holon', 'Holon', 'חולון', 'Холон'),
    ('bnei_brak', 'Bnei Brak', 'בני ברק', 'Бней-Брак'),
    ('ramat_gan', 'Ramat Gan', 'רמת גן', 'Рамат-Ган'),
    ('ashkelon', 'Ashkelon', 'אשקלון', 'Ашкелон'),
    ('rehovot', 'Rehovot', 'רחובות', 'Реховот'),
    ('bat_yam', 'Bat Yam', 'בת ים', 'Бат-Ям'),
    ('herzliya', 'Herzliya', 'הרצליה', 'Герцлия'),
    ('kfar_saba', 'Kfar Saba', 'כפר סבא', 'Кфар-Саба'),
    ('hadera', 'Hadera', 'חדרה', 'Хадера'),
    ('modiin', 'Modiin', 'מודיעין', 'Модиин'),
    ('raanana', 'Raanana', 'רעננה', 'Раанана'),
    ('nahariya', 'Nahariya', 'נהריה', 'Нагария'),
    ('akko', 'Acre (Akko)', 'עכו', 'Акко'),
    ('ariel', 'Ariel', 'אריאל', 'Ариэль'),
    ('eilat', 'Eilat', 'אילת', 'Эйлат'),
    ('tiberias', 'Tiberias', 'טבריה', 'Тверия'),
    ('kiryat_gat', 'Kiryat Gat', 'קריית גת', 'Кирьят-Гат'),
    ('kiryat_shmona', 'Kiryat Shmona', 'קריית שמונה', 'Кирьят-Шмона'),
    ('lod', 'Lod', 'לוד', 'Лод'),
    ('ramla', 'Ramla', 'רמלה', 'Рамле'),
    ('afula', 'Afula', 'עפולה', 'Афула'),
    ('carmiel', 'Carmiel', 'כרמיאל', 'Кармиэль')
ON CONFLICT (key) DO NOTHING;

-- Create index for faster lookups
CREATE INDEX idx_cities_name_en ON cities(name_en);
CREATE INDEX idx_cities_name_he ON cities(name_he);
CREATE INDEX idx_cities_name_ru ON cities(name_ru);
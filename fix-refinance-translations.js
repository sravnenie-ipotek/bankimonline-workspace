require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:lgqPEzvVbSCviTybKqMbzJkYvOUetJjt@maglev.proxy.rlwy.net:43809/railway'
});

// Load translation files
const enTranslations = JSON.parse(fs.readFileSync(path.join(__dirname, 'translations/en.json'), 'utf8'));
const heTranslations = JSON.parse(fs.readFileSync(path.join(__dirname, 'translations/he.json'), 'utf8'));
const ruTranslations = JSON.parse(fs.readFileSync(path.join(__dirname, 'translations/ru.json'), 'utf8'));

async function fixRefinanceTranslations() {
  try {
    console.log('🔧 Fixing refinance credit translations...\n');

    // First, check the content_translations schema
    const schemaCheck = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'content_translations'
      ORDER BY ordinal_position
    `);
    
    console.log('content_translations columns:', schemaCheck.rows.map(r => r.column_name).join(', '));
    console.log('');

    // Get all content items without translations
    const missingItems = await pool.query(`
      SELECT DISTINCT ci.id, ci.content_key, ci.screen_location
      FROM content_items ci
      LEFT JOIN content_translations ct ON ci.id = ct.content_item_id
      WHERE ci.screen_location LIKE 'refinance_credit_%'
        AND ct.id IS NULL
      ORDER BY ci.screen_location, ci.content_key
    `);

    console.log(`Found ${missingItems.rows.length} items without translations\n`);

    let addedCount = 0;
    let skippedCount = 0;

    for (const item of missingItems.rows) {
      const { id, content_key, screen_location } = item;
      
      // Try to find translations in JSON files
      const enValue = enTranslations[content_key];
      const heValue = heTranslations[content_key];
      const ruValue = ruTranslations[content_key];

      if (!enValue) {
        console.log(`⚠️  Skipped: ${content_key} (no English translation)`);
        skippedCount++;
        continue;
      }

      console.log(`📝 Adding: ${content_key}`);

      try {
        // Add English translation
        await pool.query(`
          INSERT INTO content_translations (content_item_id, language_code, content_value, status, created_at)
          VALUES ($1, 'en', $2, 'approved', NOW())
          ON CONFLICT (content_item_id, language_code) DO UPDATE
          SET content_value = $2, status = 'approved', updated_at = NOW()
        `, [id, enValue]);

        // Add Hebrew translation (fallback to English if missing)
        const hebrewValue = heValue || enValue;
        await pool.query(`
          INSERT INTO content_translations (content_item_id, language_code, content_value, status, created_at)
          VALUES ($1, 'he', $2, 'approved', NOW())
          ON CONFLICT (content_item_id, language_code) DO UPDATE
          SET content_value = $2, status = 'approved', updated_at = NOW()
        `, [id, hebrewValue]);

        // Add Russian translation (fallback to English if missing)
        const russianValue = ruValue || enValue;
        await pool.query(`
          INSERT INTO content_translations (content_item_id, language_code, content_value, status, created_at)
          VALUES ($1, 'ru', $2, 'approved', NOW())
          ON CONFLICT (content_item_id, language_code) DO UPDATE
          SET content_value = $2, status = 'approved', updated_at = NOW()
        `, [id, russianValue]);

        console.log(`   ✅ Added: EN, HE, RU`);
        addedCount++;

      } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log('📊 SUMMARY');
    console.log('='.repeat(50));
    console.log(`✅ Added translations for ${addedCount} items`);
    console.log(`⚠️  Skipped ${skippedCount} items (no translation found)`);

    // Now let's check specific missing keys and add them manually
    console.log('\n🔧 Adding specific refinance credit step 2 translations...\n');

    const specificTranslations = [
      // Step titles
      { key: 'refinance_step2_title', en: 'Personal Details', he: 'פרטים אישיים', ru: 'Личные данные' },
      
      // Name and surname
      { key: 'refinance_step2_name_surname', en: 'Full Name', he: 'שם מלא', ru: 'Полное имя' },
      { key: 'refinance_step2_name_surname_ph', en: 'Enter first name and last name', he: 'הזן שם פרטי ושם משפחה', ru: 'Введите имя и фамилию' },
      
      // Birth date
      { key: 'refinance_step2_birth_date', en: 'Date of Birth', he: 'תאריך לידה', ru: 'Дата рождения' },
      
      // Family status
      { key: 'refinance_step2_family_status', en: 'Marital Status', he: 'מצב משפחתי', ru: 'Семейное положение' },
      { key: 'refinance_step2_family_status_ph', en: 'Select marital status', he: 'בחר מצב משפחתי', ru: 'Выберите семейное положение' },
      { key: 'refinance_step2_family_status_option_1', en: 'Single', he: 'רווק/ה', ru: 'Холост/Не замужем' },
      { key: 'refinance_step2_family_status_option_2', en: 'Married', he: 'נשוי/אה', ru: 'Женат/Замужем' },
      { key: 'refinance_step2_family_status_option_3', en: 'Divorced', he: 'גרוש/ה', ru: 'Разведен/а' },
      { key: 'refinance_step2_family_status_option_4', en: 'Widowed', he: 'אלמן/ה', ru: 'Вдовец/Вдова' },
      { key: 'refinance_step2_family_status_option_5', en: 'Common-law marriage', he: 'ידוע/ה בציבור', ru: 'Гражданский брак' },
      { key: 'refinance_step2_family_status_option_6', en: 'Other', he: 'אחר', ru: 'Другое' },
      
      // Children
      { key: 'refinance_step2_children_count', en: 'Number of children under 18', he: 'מספר ילדים מתחת לגיל 18', ru: 'Количество детей до 18 лет' },
      
      // Education
      { key: 'refinance_step2_education', en: 'Education', he: 'השכלה', ru: 'Образование' },
      { key: 'refinance_step2_education_ph', en: 'Select education level', he: 'בחר רמת השכלה', ru: 'Выберите уровень образования' },
      { key: 'refinance_step2_education_option_1', en: 'No high school certificate', he: 'ללא תעודת בגרות', ru: 'Без аттестата о среднем образовании' },
      { key: 'refinance_step2_education_option_2', en: 'Partial high school certificate', he: 'תעודת בגרות חלקית', ru: 'Неполное среднее образование' },
      { key: 'refinance_step2_education_option_3', en: 'Full high school certificate', he: 'תעודת בגרות מלאה', ru: 'Полное среднее образование' },
      { key: 'refinance_step2_education_option_4', en: 'Post-secondary education', he: 'השכלה על-תיכונית', ru: 'Среднее специальное образование' },
      { key: 'refinance_step2_education_option_5', en: "Bachelor's degree", he: 'תואר ראשון', ru: 'Степень бакалавра' },
      { key: 'refinance_step2_education_option_6', en: "Master's degree", he: 'תואר שני', ru: 'Степень магистра' },
      { key: 'refinance_step2_education_option_7', en: 'Doctoral degree', he: 'תואר שלישי', ru: 'Докторская степень' }
    ];

    for (const trans of specificTranslations) {
      // Check if content_item exists
      const itemCheck = await pool.query(
        'SELECT id FROM content_items WHERE content_key = $1 AND screen_location = $2',
        [trans.key, 'refinance_credit_2']
      );

      if (itemCheck.rows.length === 0) {
        console.log(`⚠️  Content item not found: ${trans.key}`);
        continue;
      }

      const itemId = itemCheck.rows[0].id;

      try {
        // Add all three language translations
        for (const lang of ['en', 'he', 'ru']) {
          await pool.query(`
            INSERT INTO content_translations (content_item_id, language_code, content_value, status, created_at)
            VALUES ($1, $2, $3, 'approved', NOW())
            ON CONFLICT (content_item_id, language_code) DO UPDATE
            SET content_value = $3, status = 'approved', updated_at = NOW()
          `, [itemId, lang, trans[lang]]);
        }
        console.log(`✅ Added: ${trans.key}`);
      } catch (error) {
        console.log(`❌ Error adding ${trans.key}: ${error.message}`);
      }
    }

    // Final verification
    console.log('\n🔍 Final verification...');
    const finalCheck = await pool.query(`
      SELECT 
        ci.content_key,
        ct_en.content_value as en,
        ct_he.content_value as he,
        ct_ru.content_value as ru
      FROM content_items ci
      LEFT JOIN content_translations ct_en ON ci.id = ct_en.content_item_id AND ct_en.language_code = 'en'
      LEFT JOIN content_translations ct_he ON ci.id = ct_he.content_item_id AND ct_he.language_code = 'he'
      LEFT JOIN content_translations ct_ru ON ci.id = ct_ru.content_item_id AND ct_ru.language_code = 'ru'
      WHERE ci.screen_location = 'refinance_credit_2'
        AND ci.content_key IN ('refinance_step2_title', 'refinance_step2_family_status_option_1', 'refinance_step2_education_option_1')
      ORDER BY ci.content_key
    `);

    console.log('\nSample translations after fix:');
    finalCheck.rows.forEach(row => {
      console.log(`\n${row.content_key}:`);
      console.log(`  EN: ${row.en || '[null]'}`);
      console.log(`  HE: ${row.he || '[null]'}`);
      console.log(`  RU: ${row.ru || '[null]'}`);
    });

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

fixRefinanceTranslations();
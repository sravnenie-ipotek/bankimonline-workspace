const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.CONTENT_DATABASE_URL || process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function fixPropertyOptionsTranslations() {
  try {
    console.log('🔧 FIXING PROPERTY OPTION TRANSLATIONS\n');
    
    // Define all translations for property options
    const translations = [
      {
        content_key: 'app.refinance.step1.property_option_1',
        translations: {
          en: 'Apartment',
          he: 'דירה',
          ru: 'Квартира'
        }
      },
      {
        content_key: 'app.refinance.step1.property_option_2',
        translations: {
          en: 'Private House',
          he: 'בית פרטי',
          ru: 'Частный дом'
        }
      },
      {
        content_key: 'app.refinance.step1.property_option_3',
        translations: {
          en: 'Commercial Property',
          he: 'נכס מסחרי',
          ru: 'Коммерческая недвижимость'
        }
      },
      {
        content_key: 'app.refinance.step1.property_option_4',
        translations: {
          en: 'Land',
          he: 'מגרש',
          ru: 'Земельный участок'
        }
      },
      {
        content_key: 'app.refinance.step1.property_option_5',
        translations: {
          en: 'Other',
          he: 'אחר',
          ru: 'Другое'
        }
      }
    ];
    
    // Update translations
    for (const item of translations) {
      console.log(`\n📝 Processing: ${item.content_key}`);
      
      // First, get the content_item_id
      const itemResult = await pool.query(`
        SELECT id FROM content_items 
        WHERE content_key = $1 AND is_active = true
      `, [item.content_key]);
      
      if (itemResult.rows.length === 0) {
        console.log(`   ❌ Content item not found, creating it...`);
        
        // Create the content item
        const insertResult = await pool.query(`
          INSERT INTO content_items (content_key, component_type, category, screen_location, is_active)
          VALUES ($1, 'option', 'refinance', 'refinance_step1', true)
          RETURNING id
        `, [item.content_key]);
        
        const contentItemId = insertResult.rows[0].id;
        console.log(`   ✅ Created content item with ID: ${contentItemId}`);
        
        // Insert all translations
        for (const [lang, value] of Object.entries(item.translations)) {
          await pool.query(`
            INSERT INTO content_translations (content_item_id, language_code, content_value, status)
            VALUES ($1, $2, $3, 'approved')
          `, [contentItemId, lang, value]);
          console.log(`   ✅ Added ${lang}: "${value}"`);
        }
      } else {
        const contentItemId = itemResult.rows[0].id;
        console.log(`   ℹ️  Content item exists with ID: ${contentItemId}`);
        
        // Update or insert translations
        for (const [lang, value] of Object.entries(item.translations)) {
          // Check if translation exists
          const transResult = await pool.query(`
            SELECT id FROM content_translations
            WHERE content_item_id = $1 AND language_code = $2
          `, [contentItemId, lang]);
          
          if (transResult.rows.length === 0) {
            // Insert new translation
            await pool.query(`
              INSERT INTO content_translations (content_item_id, language_code, content_value, status)
              VALUES ($1, $2, $3, 'approved')
            `, [contentItemId, lang, value]);
            console.log(`   ✅ Added missing ${lang}: "${value}"`);
          } else {
            // Update existing translation
            await pool.query(`
              UPDATE content_translations
              SET content_value = $1, status = 'approved'
              WHERE content_item_id = $2 AND language_code = $3
            `, [value, contentItemId, lang]);
            console.log(`   ✅ Updated ${lang}: "${value}"`);
          }
        }
      }
    }
    
    console.log('\n\n✅ All property option translations have been fixed!');
    console.log('The dropdown should now display proper text instead of translation keys.');
    
  } catch (error) {
    console.error('Error:', error.message);
    console.error(error.stack);
  } finally {
    await pool.end();
  }
}

fixPropertyOptionsTranslations();
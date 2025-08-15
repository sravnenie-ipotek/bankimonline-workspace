const { Pool } = require('pg');

// Use content database connection
const contentPool = new Pool({
  connectionString: 'postgresql://postgres:SuFkUevgonaZFXJiJeczFiXYTlICHVJL@shortline.proxy.rlwy.net:33452/railway'
});

async function createCooperationMissingKeys() {
  try {
    // Only 2 missing keys identified in database verification
    const missingKeys = [
      {
        key: 'feature_credit_calc',
        screen_location: 'cooperation',
        component_type: 'text',
        category: 'feature_item',
        translations: {
          en: 'Credit Calculation',
          he: 'חישוב אשראי', 
          ru: 'Расчет кредита'
        }
      },
      {
        key: 'feature_credit_refinance', 
        screen_location: 'cooperation',
        component_type: 'text',
        category: 'feature_item',
        translations: {
          en: 'Credit Refinancing',
          he: 'מיחזור אשראי',
          ru: 'Рефинансирование кредита'
        }
      }
    ];
    
    let createdItems = 0;
    let createdTranslations = 0;
    
    for (const item of missingKeys) {
      try {
        // 1. Create content_item
        const itemResult = await contentPool.query(`
          INSERT INTO content_items (content_key, screen_location, component_type, category, status)
          VALUES ($1, $2, $3, $4, 'active')
          ON CONFLICT (content_key) DO UPDATE SET
            screen_location = EXCLUDED.screen_location,
            component_type = EXCLUDED.component_type,
            category = EXCLUDED.category
          RETURNING id, content_key
        `, [item.key, item.screen_location, item.component_type, item.category]);
        
        const contentItemId = itemResult.rows[0].id;
        `);
        createdItems++;
        
        // 2. Create translations for all languages
        const languages = ['en', 'he', 'ru'];
        for (const lang of languages) {
          const translation = item.translations[lang];
          
          const translationResult = await contentPool.query(`
            INSERT INTO content_translations (content_item_id, language_code, content_value, status)
            VALUES ($1, $2, $3, 'approved')
            ON CONFLICT (content_item_id, language_code) DO UPDATE SET
              content_value = EXCLUDED.content_value,
              status = EXCLUDED.status
            RETURNING id
          `, [contentItemId, lang, translation]);
          
          }: "${translation}"`);
          createdTranslations++;
        }
        
        } catch (error) {
        console.error(`   ❌ Error creating ${item.key}:`, error.message);
      }
    }
    
    if (createdItems === missingKeys.length && createdTranslations === missingKeys.length * 3) {
      `);
      fallbacks from Cooperation.tsx`);
    } else {
      }
    
    // Verify final state
    const verifyResult = await contentPool.query(`
      SELECT ci.content_key, COUNT(ct.id) as translation_count
      FROM content_items ci
      LEFT JOIN content_translations ct ON ci.id = ct.content_item_id
      WHERE ci.content_key IN ('feature_credit_calc', 'feature_credit_refinance')
      GROUP BY ci.id, ci.content_key
      ORDER BY ci.content_key
    `);
    
    verifyResult.rows.forEach(row => {
      const status = row.translation_count === 3 ? '✅' : '⚠️';
      });
    
  } catch (error) {
    console.error('Database creation failed:', error.message);
  } finally {
    await contentPool.end();
  }
}

createCooperationMissingKeys();
const { Pool } = require('pg');

// Use content database connection
const contentPool = new Pool({
  connectionString: 'postgresql://postgres:SuFkUevgonaZFXJiJeczFiXYTlICHVJL@shortline.proxy.rlwy.net:33452/railway'
});

async function checkCooperationContent() {
  try {
    // All 13 cooperation translation keys identified in ULTRATHINK analysis
    const cooperationKeys = [
      'cooperation_title',
      'cooperation_subtitle', 
      'register_partner_program',
      'marketplace_title',
      'marketplace_description',
      'feature_mortgage_calc',
      'feature_mortgage_refinance', 
      'feature_credit_calc',
      'feature_credit_refinance',
      'one_click_mortgage',
      'referral_title',
      'referral_description',
      'cooperation_cta_title'
    ];
    
    let existingCount = 0;
    let missingCount = 0;
    const missingKeys = [];
    const existingKeys = [];
    
    for (const key of cooperationKeys) {
      try {
        // Check if key exists in content_items with any screen_location
        const result = await contentPool.query(`
          SELECT ci.content_key, ci.screen_location, ci.component_type,
                 COUNT(ct.id) as translation_count
          FROM content_items ci
          LEFT JOIN content_translations ct ON ci.id = ct.content_item_id 
          WHERE ci.content_key = $1
          GROUP BY ci.id, ci.content_key, ci.screen_location, ci.component_type
        `, [key]);
        
        if (result.rows.length > 0) {
          const item = result.rows[0];
          existingKeys.push(key);
          existingCount++;
        } else {
          missingKeys.push(key);
          missingCount++;
        }
      } catch (error) {
        missingKeys.push(key);
        missingCount++;
      }
    }
    
    }%)`);
    }%)`);
    
    if (missingCount > 0) {
      missingKeys.forEach((key, index) => {
        });
      } else {
      }
    
    // Check specifically for cooperation screen_location
    const cooperationScreen = await contentPool.query(`
      SELECT ci.content_key, ci.component_type, COUNT(ct.id) as translations
      FROM content_items ci
      LEFT JOIN content_translations ct ON ci.id = ct.content_item_id
      WHERE ci.screen_location = 'cooperation'
      GROUP BY ci.id, ci.content_key, ci.component_type
      ORDER BY ci.content_key
    `);
    
    if (cooperationScreen.rows.length > 0) {
      cooperationScreen.rows.forEach(row => {
        - ${row.translations}/3 translations`);
      });
    } else {
      }
    
  } catch (error) {
    console.error('Database verification failed:', error.message);
  } finally {
    await contentPool.end();
  }
}

checkCooperationContent();
const { Pool } = require('pg');

// Use content database connection
const contentPool = new Pool({
  connectionString: 'postgresql://postgres:SuFkUevgonaZFXJiJeczFiXYTlICHVJL@shortline.proxy.rlwy.net:33452/railway'
});

async function checkCooperationContent() {
  try {
    console.log('=== PHASE 9: COOPERATION DATABASE VERIFICATION ===\n');
    
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
    
    console.log(`📋 Checking ${cooperationKeys.length} cooperation translation keys:\n`);
    
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
          console.log(`✅ EXISTS: ${key}`);
          console.log(`   Screen: ${item.screen_location || 'null'}`);
          console.log(`   Type: ${item.component_type || 'null'}`);
          console.log(`   Translations: ${item.translation_count}/3 languages`);
          console.log('');
          existingKeys.push(key);
          existingCount++;
        } else {
          console.log(`❌ MISSING: ${key}`);
          missingKeys.push(key);
          missingCount++;
        }
      } catch (error) {
        console.log(`❌ ERROR checking ${key}:`, error.message);
        missingKeys.push(key);
        missingCount++;
      }
    }
    
    console.log('=== DATABASE VERIFICATION SUMMARY ===');
    console.log(`✅ Existing keys: ${existingCount}/${cooperationKeys.length} (${Math.round(existingCount/cooperationKeys.length*100)}%)`);
    console.log(`❌ Missing keys: ${missingCount}/${cooperationKeys.length} (${Math.round(missingCount/cooperationKeys.length*100)}%)`);
    
    if (missingCount > 0) {
      console.log(`\n📋 Missing keys that need database creation:`);
      missingKeys.forEach((key, index) => {
        console.log(`${index + 1}. ${key}`);
      });
      console.log(`\n⚡ Next step: Create ${missingCount} content_items + ${missingCount * 3} translations`);
    } else {
      console.log(`\n🎉 All cooperation keys exist in database!`);
      console.log(`⚡ Next step: Verify translation completeness`);
    }
    
    // Check specifically for cooperation screen_location
    console.log(`\n=== COOPERATION SCREEN_LOCATION CHECK ===`);
    const cooperationScreen = await contentPool.query(`
      SELECT ci.content_key, ci.component_type, COUNT(ct.id) as translations
      FROM content_items ci
      LEFT JOIN content_translations ct ON ci.id = ct.content_item_id
      WHERE ci.screen_location = 'cooperation'
      GROUP BY ci.id, ci.content_key, ci.component_type
      ORDER BY ci.content_key
    `);
    
    if (cooperationScreen.rows.length > 0) {
      console.log(`Found ${cooperationScreen.rows.length} existing cooperation screen items:`);
      cooperationScreen.rows.forEach(row => {
        console.log(`- ${row.content_key} (${row.component_type}) - ${row.translations}/3 translations`);
      });
    } else {
      console.log(`No existing content for screen_location='cooperation'`);
      console.log(`All cooperation content will be created fresh.`);
    }
    
  } catch (error) {
    console.error('Database verification failed:', error.message);
  } finally {
    await contentPool.end();
  }
}

checkCooperationContent();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({ connectionString: process.env.CONTENT_DATABASE_URL });

async function verifyFranchiseKeys() {
  try {
    // Load the franchise keys
    const franchiseKeys = JSON.parse(fs.readFileSync('/tmp/franchise_keys.json', 'utf8'));
    
    console.log('=== PHASE 8: Database Verification ===');
    console.log('Checking', franchiseKeys.length, 'franchise translation keys in database...\n');
    
    let foundCount = 0;
    let missingKeys = [];
    
    for (const key of franchiseKeys) {
      try {
        // Check if key exists in content_items
        const result = await pool.query(`
          SELECT 
            ci.content_key, 
            ci.screen_location,
            ci.category,
            COUNT(ct.id) as translation_count
          FROM content_items ci
          LEFT JOIN content_translations ct ON ci.id = ct.content_item_id
          WHERE ci.content_key = $1 
            AND ci.is_active = true
          GROUP BY ci.id, ci.content_key, ci.screen_location, ci.category
        `, [key]);
        
        if (result.rows.length > 0) {
          const item = result.rows[0];
          console.log(`✅ ${key} - Screen: ${item.screen_location}, Translations: ${item.translation_count}`);
          foundCount++;
        } else {
          console.log(`❌ ${key} - NOT FOUND`);
          missingKeys.push(key);
        }
      } catch (error) {
        console.log(`❌ ${key} - ERROR: ${error.message}`);
        missingKeys.push(key);
      }
    }
    
    console.log('\n=== VERIFICATION SUMMARY ===');
    console.log(`Total keys checked: ${franchiseKeys.length}`);
    console.log(`Keys found in database: ${foundCount}`);
    console.log(`Missing keys: ${missingKeys.length}`);
    console.log(`Success rate: ${Math.round((foundCount / franchiseKeys.length) * 100)}%`);
    
    if (missingKeys.length > 0) {
      console.log('\n=== MISSING KEYS ===');
      missingKeys.forEach((key, index) => {
        console.log(`${index + 1}. ${key}`);
      });
      
      // Export missing keys for creation
      fs.writeFileSync('/tmp/missing_franchise_keys.json', JSON.stringify(missingKeys, null, 2));
      console.log('\n❌ Missing keys exported to /tmp/missing_franchise_keys.json');
      console.log('⚠️  PHASE 8 BLOCKED: Need to create missing database entries before optimization');
    } else {
      console.log('\n🎉 ALL KEYS FOUND! Ready for Phase 8 optimization');
    }
    
  } catch (error) {
    console.error('❌ Database verification error:', error.message);
  } finally {
    await pool.end();
  }
}

verifyFranchiseKeys();
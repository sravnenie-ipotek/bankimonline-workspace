require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Use the same connection as server-db.js
const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:lgqPEzvVbSCviTybKqMbzJkYvOUetJjt@maglev.proxy.rlwy.net:43809/railway'
});

async function runRefinanceMigrations() {
  console.log('🚀 Refinance Credit Database Migration');
  console.log('=====================================\n');

  try {
    // Test connection
    const testResult = await pool.query('SELECT NOW()');
    console.log('✅ Database connected:', testResult.rows[0].now);
    console.log('');

    const migrations = [
      'migrate_refinance_credit_step1_dropdowns.sql',
      'migrate_refinance_credit_step2_complete.sql',
      'migrate_refinance_credit_step3_complete.sql',
      'migrate_refinance_credit_step4_complete.sql'
    ];

    for (const migrationFile of migrations) {
      const migrationPath = path.join(__dirname, 'migrations', migrationFile);
      
      if (!fs.existsSync(migrationPath)) {
        console.log(`❌ File not found: ${migrationFile}`);
        continue;
      }

      console.log(`\n📄 Running: ${migrationFile}`);
      
      const sql = fs.readFileSync(migrationPath, 'utf8');
      
      try {
        await pool.query(sql);
        console.log(`✅ Success!`);
        
        // Extract step number and verify
        const stepMatch = migrationFile.match(/step(\d)/);
        if (stepMatch) {
          const step = stepMatch[1];
          const result = await pool.query(
            'SELECT COUNT(*) FROM content_items WHERE screen_location = $1',
            [`refinance_credit_${step}`]
          );
          console.log(`   Created ${result.rows[0].count} items for refinance_credit_${step}`);
        }
      } catch (error) {
        console.log(`❌ Error: ${error.message}`);
        if (error.detail) {
          console.log(`   Detail: ${error.detail}`);
        }
      }
    }

    // Final summary
    console.log('\n' + '='.repeat(50));
    console.log('📊 MIGRATION SUMMARY');
    console.log('='.repeat(50));
    
    const summary = await pool.query(`
      SELECT 
        screen_location,
        COUNT(*) as items,
        COUNT(DISTINCT ct.language_code) as languages
      FROM content_items ci
      LEFT JOIN content_translations ct ON ci.id = ct.content_item_id
      WHERE screen_location LIKE 'refinance_credit_%'
      GROUP BY screen_location
      ORDER BY screen_location
    `);

    if (summary.rows.length === 0) {
      console.log('No refinance credit content found');
    } else {
      summary.rows.forEach(row => {
        console.log(`${row.screen_location}: ${row.items} items, ${row.languages} languages`);
      });
    }

    // Test query that was showing nulls
    console.log('\n🔍 Testing the exact query from the screenshot:');
    const testQuery = await pool.query(`
      SELECT 
        ci.content_key,
        ct_ru.content_value as title_ru,
        ct_he.content_value as title_he,
        ct_en.content_value as title_en
      FROM content_items ci
      LEFT JOIN content_translations ct_ru ON ci.id = ct_ru.content_item_id 
        AND ct_ru.language_code = 'ru' 
        AND (ct_ru.status = 'approved' OR ct_ru.status IS NULL)
      LEFT JOIN content_translations ct_he ON ci.id = ct_he.content_item_id 
        AND ct_he.language_code = 'he' 
        AND (ct_he.status = 'approved' OR ct_he.status IS NULL)
      LEFT JOIN content_translations ct_en ON ci.id = ct_en.content_item_id 
        AND ct_en.language_code = 'en' 
        AND (ct_en.status = 'approved' OR ct_en.status IS NULL)
      WHERE ci.screen_location = 'refinance_credit_2'
        AND ci.is_active = true
      ORDER BY ci.content_key
      LIMIT 5
    `);

    console.log('\nSample results:');
    testQuery.rows.forEach(row => {
      console.log(`${row.content_key}:`);
      console.log(`  EN: ${row.title_en || '[null]'}`);
      console.log(`  HE: ${row.title_he || '[null]'}`);
      console.log(`  RU: ${row.title_ru || '[null]'}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
    console.log('\n✅ Done!');
  }
}

runRefinanceMigrations();
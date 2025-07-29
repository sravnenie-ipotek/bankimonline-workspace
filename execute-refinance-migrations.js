const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function executeMigrations() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  const migrations = [
    {
      file: 'migrate_refinance_credit_step1_dropdowns.sql',
      screen: 'refinance_credit_1',
      description: 'Refinance Credit Step 1 - Dropdowns'
    },
    {
      file: 'migrate_refinance_credit_step2_complete.sql', 
      screen: 'refinance_credit_2',
      description: 'Refinance Credit Step 2 - Personal Details'
    },
    {
      file: 'migrate_refinance_credit_step3_complete.sql',
      screen: 'refinance_credit_3', 
      description: 'Refinance Credit Step 3 - Income Data'
    },
    {
      file: 'migrate_refinance_credit_step4_complete.sql',
      screen: 'refinance_credit_4',
      description: 'Refinance Credit Step 4 - Results'
    }
  ];

  try {
    await client.connect();
    console.log('✅ Connected to database');
    console.log('Database:', process.env.DATABASE_URL ? 'Railway PostgreSQL' : 'Local');
    console.log('');

    // Pre-migration check for duplicates
    console.log('🔍 Pre-Migration Duplicate Check...');
    const duplicateCheck = await client.query(`
      SELECT content_key, ARRAY_AGG(DISTINCT screen_location) AS screens, COUNT(DISTINCT screen_location) as count
      FROM content_items
      WHERE screen_location LIKE 'refinance_credit_%'
      GROUP BY content_key
      HAVING COUNT(DISTINCT screen_location) > 1
    `);

    if (duplicateCheck.rows.length > 0) {
      console.log('⚠️  WARNING: Found duplicate content_keys across screen locations:');
      duplicateCheck.rows.forEach(row => {
        console.log(`   - ${row.content_key}: ${row.screens.join(', ')}`);
      });
      console.log('');
    }

    // Execute each migration
    for (const migration of migrations) {
      const migrationPath = path.join(__dirname, 'migrations', migration.file);
      
      if (!fs.existsSync(migrationPath)) {
        console.log(`❌ Migration file not found: ${migration.file}`);
        continue;
      }

      console.log(`\n📄 Running migration: ${migration.description}`);
      console.log(`   File: ${migration.file}`);
      console.log(`   Screen: ${migration.screen}`);

      const sql = fs.readFileSync(migrationPath, 'utf8');
      
      try {
        // Start transaction for each migration
        await client.query('BEGIN');
        
        // Execute migration
        await client.query(sql);
        
        // Verify migration success
        const verification = await client.query(`
          SELECT 
            COUNT(DISTINCT ci.id) as items,
            COUNT(DISTINCT ct.id) as translations,
            COUNT(DISTINCT ct.language_code) as languages
          FROM content_items ci
          LEFT JOIN content_translations ct ON ci.id = ct.content_item_id
          WHERE ci.screen_location = $1
        `, [migration.screen]);

        const result = verification.rows[0];
        
        if (result.items > 0) {
          await client.query('COMMIT');
          console.log(`   ✅ Success: ${result.items} items, ${result.translations} translations, ${result.languages} languages`);
          
          // Show sample content
          const sample = await client.query(`
            SELECT ci.content_key, ct.language_code, LEFT(ct.content_value, 50) as sample
            FROM content_items ci
            JOIN content_translations ct ON ci.id = ct.content_item_id
            WHERE ci.screen_location = $1
            AND ct.language_code = 'en'
            LIMIT 3
          `, [migration.screen]);
          
          if (sample.rows.length > 0) {
            console.log('   📝 Sample content:');
            sample.rows.forEach(row => {
              console.log(`      - ${row.content_key}: "${row.sample}..."`);
            });
          }
        } else {
          await client.query('ROLLBACK');
          console.log('   ⚠️  No items created - migration may have failed or already exists');
        }
        
      } catch (error) {
        await client.query('ROLLBACK');
        console.log(`   ❌ Error: ${error.message}`);
        if (error.detail) {
          console.log(`      Detail: ${error.detail}`);
        }
      }
    }

    // Final summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 FINAL MIGRATION SUMMARY');
    console.log('='.repeat(60));
    
    const summary = await client.query(`
      SELECT 
        ci.screen_location,
        COUNT(DISTINCT ci.id) as total_items,
        COUNT(DISTINCT CASE WHEN ci.component_type = 'field_label' THEN ci.id END) as labels,
        COUNT(DISTINCT CASE WHEN ci.component_type = 'placeholder' THEN ci.id END) as placeholders,
        COUNT(DISTINCT CASE WHEN ci.component_type = 'option' THEN ci.id END) as options,
        COUNT(DISTINCT ct.language_code) as languages
      FROM content_items ci
      LEFT JOIN content_translations ct ON ci.id = ct.content_item_id
      WHERE ci.screen_location LIKE 'refinance_credit_%'
      GROUP BY ci.screen_location
      ORDER BY ci.screen_location
    `);

    if (summary.rows.length === 0) {
      console.log('❌ No refinance credit content found in database');
    } else {
      summary.rows.forEach(row => {
        console.log(`\n📍 ${row.screen_location}:`);
        console.log(`   Total items: ${row.total_items}`);
        console.log(`   - Labels: ${row.labels}`);
        console.log(`   - Placeholders: ${row.placeholders}`);
        console.log(`   - Options: ${row.options}`);
        console.log(`   Languages: ${row.languages}`);
      });
    }

    // Check for missing translations
    console.log('\n🔍 Checking for missing translations...');
    const missingTranslations = await client.query(`
      SELECT 
        ci.screen_location,
        ci.content_key,
        ARRAY_AGG(DISTINCT ct.language_code ORDER BY ct.language_code) as has_languages
      FROM content_items ci
      LEFT JOIN content_translations ct ON ci.id = ct.content_item_id
      WHERE ci.screen_location LIKE 'refinance_credit_%'
      GROUP BY ci.screen_location, ci.content_key, ci.id
      HAVING COUNT(DISTINCT ct.language_code) < 3
      LIMIT 10
    `);

    if (missingTranslations.rows.length > 0) {
      console.log('⚠️  Found items with missing translations:');
      missingTranslations.rows.forEach(row => {
        const missing = ['en', 'he', 'ru'].filter(lang => !row.has_languages.includes(lang));
        console.log(`   - ${row.screen_location} / ${row.content_key}: Missing ${missing.join(', ')}`);
      });
    } else {
      console.log('✅ All items have translations for all 3 languages');
    }

  } catch (error) {
    console.error('❌ Connection error:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Tip: Make sure your database is running and DATABASE_URL is set correctly');
      console.log('   You may need to run: source .env');
    }
  } finally {
    await client.end();
    console.log('\n✅ Database connection closed');
  }
}

// Execute with better error handling
console.log('🚀 Refinance Credit Database Migration Tool');
console.log('==========================================\n');

executeMigrations().then(() => {
  console.log('\n✅ Migration process completed!');
  console.log('\n📝 Next steps:');
  console.log('1. Verify content displays correctly in the application');
  console.log('2. Test all language switching (EN/HE/RU)');
  console.log('3. Update translation.json files with __MIGRATED_ prefix');
  console.log('4. Run: npm run sync-translations');
}).catch(error => {
  console.error('\n❌ Migration failed:', error.message);
  process.exit(1);
});
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

async function analyzeContentMigration() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  
  try {
    await client.connect();
    console.log('Connected to database\n');
    
    // 1. Check content_items table structure
    console.log('=== CONTENT_ITEMS TABLE STRUCTURE ===');
    const tableStructure = await client.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'content_items' 
      ORDER BY ordinal_position
    `);
    
    console.log('Columns:');
    tableStructure.rows.forEach(col => {
      console.log(`  ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'required'})`);
    });
    
    // 2. Check migration status distribution
    console.log('\n=== MIGRATION STATUS SUMMARY ===');
    const statusSummary = await client.query(`
      SELECT 
        COALESCE(migration_status, 'NULL') as status, 
        COUNT(*) as count 
      FROM content_items 
      GROUP BY migration_status 
      ORDER BY count DESC
    `);
    
    statusSummary.rows.forEach(row => {
      console.log(`  ${row.status}: ${row.count} items`);
    });
    
    // 3. Check pending items
    console.log('\n=== PENDING MIGRATION ITEMS ===');
    const pendingItems = await client.query(`
      SELECT 
        ci.id,
        ci.content_key,
        ci.screen_location,
        ci.component_type,
        ci.migration_status,
        COUNT(ct.id) as translation_count
      FROM content_items ci
      LEFT JOIN content_translations ct ON ci.id = ct.content_item_id
      WHERE ci.migration_status = 'pending' OR ci.migration_status IS NULL
      GROUP BY ci.id
      ORDER BY ci.screen_location, ci.content_key
      LIMIT 20
    `);
    
    console.log(`Found ${pendingItems.rowCount} pending items (showing first 20):`);
    pendingItems.rows.forEach(item => {
      console.log(`  ${item.screen_location}.${item.content_key} - ${item.component_type} (${item.translation_count} translations)`);
    });
    
    // 4. Check personal_cabinet content specifically
    console.log('\n=== PERSONAL CABINET CONTENT ===');
    const personalCabinetContent = await client.query(`
      SELECT 
        ci.content_key,
        ci.component_type,
        ci.category,
        ci.migration_status,
        json_agg(
          json_build_object(
            'lang', ct.language_code,
            'value', ct.content_value,
            'status', ct.status
          ) ORDER BY ct.language_code
        ) as translations
      FROM content_items ci
      LEFT JOIN content_translations ct ON ci.id = ct.content_item_id
      WHERE ci.screen_location = 'personal_cabinet'
      GROUP BY ci.id
      ORDER BY ci.content_key
    `);
    
    console.log(`Found ${personalCabinetContent.rowCount} items in personal_cabinet:`);
    personalCabinetContent.rows.forEach(item => {
      console.log(`\n  Key: ${item.content_key}`);
      console.log(`  Type: ${item.component_type}, Category: ${item.category}`);
      console.log(`  Status: ${item.migration_status || 'NULL'}`);
      console.log(`  Translations:`);
      item.translations.forEach(trans => {
        if (trans.lang) {
          console.log(`    ${trans.lang}: "${trans.value}" (${trans.status})`);
        }
      });
    });
    
    // 5. Compare with JSON files
    console.log('\n=== JSON FILE COMPARISON ===');
    const languages = ['en', 'he', 'ru'];
    const keysToCheck = [
      'main_income_source',
      'employment',
      'self_employed',
      'business',
      'pension',
      'unemployed',
      'select_answer',
      'profession_name'
    ];
    
    for (const lang of languages) {
      const jsonPath = path.join(__dirname, 'public', 'locales', lang, 'translation.json');
      const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
      
      console.log(`\n${lang.toUpperCase()} translations:`);
      keysToCheck.forEach(key => {
        const value = jsonData[key];
        const migratedValue = jsonData[`__MIGRATED_${key}`];
        
        if (value || migratedValue) {
          console.log(`  ${key}:`);
          if (value) console.log(`    Current: "${value}"`);
          if (migratedValue) console.log(`    Migrated: "${migratedValue}"`);
        }
      });
    }
    
    // 6. Check what's in code but not in DB
    console.log('\n=== CODE ANALYSIS - MISSING IN DB ===');
    const codeDropdownKeys = [
      // Income source
      'employment', 'self_employed', 'business', 'pension', 'unemployed',
      // Activity sphere  
      'it_technology', 'finance_banking', 'healthcare', 'education', 
      'construction', 'retail_trade', 'manufacturing', 'government',
      'transport_logistics', 'consulting', 'real_estate', 'other',
      // Additional income
      'alimony', 'rental_income', 'investment_income', 'freelance', 'other_income',
      // Labels
      'main_income_source', 'select_answer', 'profession_name'
    ];
    
    const dbKeys = await client.query(`
      SELECT DISTINCT content_key 
      FROM content_items 
      WHERE screen_location = 'personal_cabinet'
    `);
    
    const dbKeySet = new Set(dbKeys.rows.map(r => r.content_key));
    const missingKeys = codeDropdownKeys.filter(key => !dbKeySet.has(key));
    
    console.log(`Missing keys in database: ${missingKeys.length}`);
    missingKeys.forEach(key => console.log(`  - ${key}`));
    
    // 7. Update migration status for completed items
    console.log('\n=== UPDATING MIGRATION STATUS ===');
    const updateResult = await client.query(`
      UPDATE content_items 
      SET migration_status = 'completed'
      WHERE migration_status = 'pending' 
        AND id IN (
          SELECT ci.id 
          FROM content_items ci
          JOIN content_translations ct ON ci.id = ct.content_item_id
          WHERE ct.status = 'approved'
          GROUP BY ci.id
          HAVING COUNT(DISTINCT ct.language_code) >= 3
        )
      RETURNING content_key, screen_location
    `);
    
    console.log(`Updated ${updateResult.rowCount} items to 'completed' status`);
    updateResult.rows.forEach(item => {
      console.log(`  - ${item.screen_location}.${item.content_key}`);
    });
    
  } catch (error) {
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await client.end();
  }
}

// Run the analysis
analyzeContentMigration()
  .then(() => console.log('\n✅ Analysis complete'))
  .catch(error => console.error('\n❌ Analysis failed:', error.message));
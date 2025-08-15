const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

async function analyzeContentMigration() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  
  try {
    await client.connect();
    // 1. Check content_items table structure
    const tableStructure = await client.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'content_items' 
      ORDER BY ordinal_position
    `);
    
    tableStructure.rows.forEach(col => {
      `);
    });
    
    // 2. Check migration status distribution
    const statusSummary = await client.query(`
      SELECT 
        COALESCE(migration_status, 'NULL') as status, 
        COUNT(*) as count 
      FROM content_items 
      GROUP BY migration_status 
      ORDER BY count DESC
    `);
    
    statusSummary.rows.forEach(row => {
      });
    
    // 3. Check pending items
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
    
    :`);
    pendingItems.rows.forEach(item => {
      `);
    });
    
    // 4. Check personal_cabinet content specifically
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
    
    personalCabinetContent.rows.forEach(item => {
      item.translations.forEach(trans => {
        if (trans.lang) {
          `);
        }
      });
    });
    
    // 5. Compare with JSON files
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
      
      } translations:`);
      keysToCheck.forEach(key => {
        const value = jsonData[key];
        const migratedValue = jsonData[`__MIGRATED_${key}`];
        
        if (value || migratedValue) {
          if (value) if (migratedValue) }
      });
    }
    
    // 6. Check what's in code but not in DB
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
    
    missingKeys.forEach(key => );
    
    // 7. Update migration status for completed items
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
    
    updateResult.rows.forEach(item => {
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
  .then(() => )
  .catch(error => console.error('\n❌ Analysis failed:', error.message));
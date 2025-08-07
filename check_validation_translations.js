const { Pool } = require('pg');
require('dotenv').config();

async function checkValidationTranslations() {
  // Use same config as server-db.js
  const isProduction = process.env.NODE_ENV === 'production';
  const isRailwayProduction = process.env.RAILWAY_ENVIRONMENT === 'production';
  
  let dbConfig;
  if (isProduction || isRailwayProduction) {
    dbConfig = {
      connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/bankim_content',
      ssl: false
    };
  } else {
    dbConfig = {
      connectionString: process.env.DATABASE_URL || 'postgresql://postgres:SuFkUevgonaZFXJiJeczFiXYTlICHVJL@shortline.proxy.rlwy.net:33452/railway',
      ssl: { rejectUnauthorized: false }
    };
  }
  
  console.log('🔧 Using database config for:', isProduction || isRailwayProduction ? 'production' : 'development');
  const pool = new Pool(dbConfig);
  
  try {
    console.log('=== CHECKING VALIDATION TRANSLATIONS IN DATABASE ===\n');
    
    // 1. Check content_items for validation-related content
    console.log('1. CONTENT_ITEMS - Validation Related:');
    const contentItems = await pool.query(`
      SELECT content_key, component_type, screen_location, created_at
      FROM content_items 
      WHERE content_key ILIKE '%required%' 
         OR content_key ILIKE '%validation%'
         OR content_key ILIKE '%error%'
         OR content_key ILIKE '%field%'
      ORDER BY content_key
    `);
    
    if (contentItems.rows.length > 0) {
      contentItems.rows.forEach(row => {
        console.log(`  ${row.content_key} | ${row.component_type} | ${row.screen_location}`);
      });
    } else {
      console.log('  No validation-related content found in content_items');
    }
    
    // 2. Check content_translations for Hebrew validation content
    console.log('\n2. CONTENT_TRANSLATIONS - Hebrew Validation Content:');
    const hebrewValidations = await pool.query(`
      SELECT ci.content_key, ct.content_value, ci.screen_location
      FROM content_items ci
      JOIN content_translations ct ON ci.id = ct.content_item_id
      WHERE ct.language_code = 'he' 
        AND (ci.content_key ILIKE '%required%' 
             OR ci.content_key ILIKE '%validation%'
             OR ci.content_key ILIKE '%error%'
             OR ct.content_value ILIKE '%אנא%'
             OR ct.content_value ILIKE '%שדה%'
             OR ct.content_value ILIKE '%חובה%')
      ORDER BY ci.content_key
    `);
    
    if (hebrewValidations.rows.length > 0) {
      hebrewValidations.rows.forEach(row => {
        console.log(`  ${row.content_key}: ${row.content_value} (${row.screen_location})`);
      });
    } else {
      console.log('  No Hebrew validation content found in content_translations');
    }
    
    // 3. Check locales table for validation messages
    console.log('\n3. LOCALES TABLE - Validation Messages:');
    const localesValidation = await pool.query(`
      SELECT key, en, he, ru
      FROM locales 
      WHERE key ILIKE '%required%' 
         OR key ILIKE '%validation%'
         OR key ILIKE '%error%'
         OR en ILIKE '%required%'
         OR he ILIKE '%אנא%'
         OR he ILIKE '%חובה%'
      ORDER BY key
    `);
    
    if (localesValidation.rows.length > 0) {
      localesValidation.rows.forEach(row => {
        console.log(`  ${row.key}:`);
        console.log(`    EN: ${row.en}`);
        console.log(`    HE: ${row.he}`);
        console.log(`    RU: ${row.ru}`);
        console.log('');
      });
    } else {
      console.log('  No validation messages found in locales table');
    }
    
    // 4. Search for credit-related validation content
    console.log('\n4. CREDIT FORM VALIDATION CONTENT:');
    const creditValidation = await pool.query(`
      SELECT ci.content_key, ct.language_code, ct.content_value, ci.screen_location
      FROM content_items ci
      JOIN content_translations ct ON ci.id = ct.content_item_id
      WHERE (ci.screen_location ILIKE '%credit%' 
             OR ci.content_key ILIKE '%credit%')
        AND (ci.content_key ILIKE '%error%'
             OR ci.content_key ILIKE '%required%'
             OR ct.content_value ILIKE '%required%'
             OR ct.content_value ILIKE '%אנא%')
      ORDER BY ci.content_key, ct.language_code
    `);
    
    if (creditValidation.rows.length > 0) {
      let currentKey = '';
      creditValidation.rows.forEach(row => {
        if (row.content_key !== currentKey) {
          if (currentKey) console.log('');
          console.log(`  ${row.content_key} (${row.screen_location}):`);
          currentKey = row.content_key;
        }
        console.log(`    ${row.language_code}: ${row.content_value}`);
      });
    } else {
      console.log('  No credit validation content found');
    }
    
    // 5. Check for generic 'This field is required' translations
    console.log('\n5. GENERIC FIELD REQUIRED TRANSLATIONS:');
    const fieldRequired = await pool.query(`
      SELECT key, en, he, ru
      FROM locales 
      WHERE en ILIKE '%this field is required%'
         OR en ILIKE '%field is required%'
         OR he ILIKE '%שדה נדרש%'
         OR he ILIKE '%שדה חובה%'
      ORDER BY key
    `);
    
    if (fieldRequired.rows.length > 0) {
      fieldRequired.rows.forEach(row => {
        console.log(`  ${row.key}:`);
        console.log(`    EN: ${row.en}`);
        console.log(`    HE: ${row.he}`);
        console.log(`    RU: ${row.ru}`);
        console.log('');
      });
    } else {
      console.log('  No generic field required translations found');
    }
    
  } catch (error) {
    console.error('Database query error:', error.message);
  } finally {
    await pool.end();
  }
}

checkValidationTranslations();
const { Pool } = require('pg');
require('dotenv').config();

async function checkHebrewValidationTranslations() {
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
  
  const pool = new Pool(dbConfig);
  
  try {
    console.log('=== HEBREW VALIDATION TRANSLATIONS ===\n');
    
    // 1. Check specific validation error messages in Hebrew
    console.log('1. VALIDATION ERROR KEYS WITH HEBREW TRANSLATIONS:');
    const validationErrors = await pool.query(`
      SELECT ci.content_key, ct.content_value
      FROM content_items ci
      JOIN content_translations ct ON ci.id = ct.content_item_id
      WHERE ci.screen_location = 'validation_errors'
        AND ct.language_code = 'he'
        AND (ci.content_key LIKE '%error_%' 
             OR ci.content_key LIKE '%required%'
             OR ci.content_key LIKE '%select_%')
      ORDER BY ci.content_key
    `);
    
    if (validationErrors.rows.length > 0) {
      validationErrors.rows.forEach(row => {
        console.log(`  ${row.content_key}: ${row.content_value}`);
      });
    } else {
      console.log('  No Hebrew validation error translations found');
    }
    
    // 2. Check for 'This field is required' Hebrew equivalent
    console.log('\n2. FIELD REQUIRED MESSAGE TRANSLATIONS:');
    const fieldRequiredMsg = await pool.query(`
      SELECT ci.content_key, ct.language_code, ct.content_value
      FROM content_items ci
      JOIN content_translations ct ON ci.id = ct.content_item_id
      WHERE (ct.content_value ILIKE '%this field is required%'
             OR ct.content_value ILIKE '%field is required%'
             OR ct.content_value ILIKE '%éÓÔ àÓèé%'
             OR ct.content_value ILIKE '%éÓÔ ×ÕÑÔ%'
             OR ct.content_value ILIKE '%éÓÔ ÖÔ àÓèé%'
             OR ct.content_value ILIKE '%×ÕÑÔ ÜÞÜÐ%'
             OR ct.content_value ILIKE '%ÐàÐ Ñ×è%'
             OR ci.content_key = 'error_fill_field'
             OR ci.content_key = 'error_select_answer')
      ORDER BY ci.content_key, ct.language_code
    `);
    
    if (fieldRequiredMsg.rows.length > 0) {
      let currentKey = '';
      fieldRequiredMsg.rows.forEach(row => {
        if (row.content_key !== currentKey) {
          if (currentKey) console.log('');
          console.log(`  ${row.content_key}:`);
          currentKey = row.content_key;
        }
        console.log(`    ${row.language_code}: ${row.content_value}`);
      });
    } else {
      console.log('  No field required message translations found');
    }
    
    // 3. Check for missing Hebrew translations in validation errors
    console.log('\n3. VALIDATION KEYS MISSING HEBREW TRANSLATIONS:');
    const missingHebrew = await pool.query(`
      SELECT DISTINCT ci.content_key
      FROM content_items ci
      WHERE ci.screen_location = 'validation_errors'
        AND ci.content_key LIKE '%error_%'
        AND ci.id NOT IN (
          SELECT ct.content_item_id 
          FROM content_translations ct 
          WHERE ct.language_code = 'he'
        )
      ORDER BY ci.content_key
    `);
    
    if (missingHebrew.rows.length > 0) {
      missingHebrew.rows.forEach(row => {
        console.log(`  ${row.content_key} - MISSING HEBREW TRANSLATION`);
      });
    } else {
      console.log('  All validation error keys have Hebrew translations');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkHebrewValidationTranslations();
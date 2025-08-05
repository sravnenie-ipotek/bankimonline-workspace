const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.CONTENT_DATABASE_URL || process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function searchPropertyOptions() {
  try {
    console.log('🔍 SEARCHING FOR PROPERTY OPTION TRANSLATIONS\n');
    
    // Search for the exact keys shown in the dropdown
    const keys = [
      'app.refinance.step1.property_option_1',
      'app.refinance.step1.property_option_2',
      'app.refinance.step1.property_option_3',
      'app.refinance.step1.property_option_4',
      'app.refinance.step1.property_option_5'
    ];
    
    console.log('📋 1. SEARCHING IN DATABASE:');
    console.log('============================\n');
    
    for (const key of keys) {
      const result = await pool.query(`
        SELECT 
          ci.content_key,
          ci.screen_location,
          ci.component_type,
          ct.language_code,
          ct.content_value,
          ct.status
        FROM content_items ci
        LEFT JOIN content_translations ct ON ci.id = ct.content_item_id
        WHERE ci.content_key = $1
          AND ci.is_active = true
        ORDER BY ct.language_code
      `, [key]);
      
      if (result.rows.length > 0) {
        console.log(`✅ Found: ${key}`);
        result.rows.forEach(row => {
          console.log(`   ${row.language_code}: "${row.content_value}" (${row.status})`);
        });
        console.log('');
      } else {
        console.log(`❌ NOT FOUND: ${key}`);
      }
    }
    
    // Search for similar patterns
    console.log('\n📋 2. SEARCHING FOR SIMILAR PATTERNS:');
    console.log('====================================\n');
    
    const patterns = [
      'property_option%',
      '%property_type%option%',
      'refinance%property%option%'
    ];
    
    for (const pattern of patterns) {
      const result = await pool.query(`
        SELECT DISTINCT
          ci.content_key,
          ci.screen_location
        FROM content_items ci
        WHERE ci.content_key LIKE $1
          AND ci.is_active = true
        ORDER BY ci.content_key
        LIMIT 10
      `, [pattern]);
      
      if (result.rows.length > 0) {
        console.log(`Pattern "${pattern}":`);
        result.rows.forEach(row => {
          console.log(`  - ${row.content_key} (${row.screen_location})`);
        });
        console.log('');
      }
    }
    
    // Check if property type field exists
    console.log('\n📋 3. CHECKING PROPERTY TYPE FIELD:');
    console.log('==================================\n');
    
    const propertyTypeResult = await pool.query(`
      SELECT 
        ci.content_key,
        ci.screen_location,
        ct.language_code,
        ct.content_value
      FROM content_items ci
      JOIN content_translations ct ON ci.id = ct.content_item_id
      WHERE ci.content_key LIKE '%property_type%'
        AND ci.screen_location LIKE '%refinance%'
        AND ci.is_active = true
        AND ct.status = 'approved'
      ORDER BY ci.content_key, ct.language_code
    `);
    
    if (propertyTypeResult.rows.length > 0) {
      let currentKey = '';
      propertyTypeResult.rows.forEach(row => {
        if (currentKey !== row.content_key) {
          console.log(`\n${row.content_key} (${row.screen_location}):`);
          currentKey = row.content_key;
        }
        console.log(`  ${row.language_code}: "${row.content_value}"`);
      });
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

searchPropertyOptions();
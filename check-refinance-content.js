require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:lgqPEzvVbSCviTybKqMbzJkYvOUetJjt@maglev.proxy.rlwy.net:43809/railway'
});

async function checkRefinanceContent() {
  try {
    // Check database schema
    console.log('🔍 Checking database schema...\n');
    
    const schemaCheck = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'content_items' 
      ORDER BY ordinal_position
    `);
    
    console.log('content_items columns:');
    schemaCheck.rows.forEach(row => {
      console.log(`  - ${row.column_name} (${row.data_type})`);
    });

    // Check existing refinance content
    console.log('\n📊 Existing refinance credit content:');
    const existing = await pool.query(`
      SELECT 
        ci.id,
        ci.content_key,
        ci.component_type,
        ci.screen_location,
        COUNT(ct.id) as translation_count
      FROM content_items ci
      LEFT JOIN content_translations ct ON ci.id = ct.content_item_id
      WHERE ci.screen_location = 'refinance_credit_2'
      GROUP BY ci.id, ci.content_key, ci.component_type, ci.screen_location
      ORDER BY ci.content_key
      LIMIT 10
    `);

    console.log(`\nFound ${existing.rows.length} items for refinance_credit_2:`);
    existing.rows.forEach(row => {
      console.log(`  - ${row.content_key} (${row.component_type}): ${row.translation_count} translations`);
    });

    // Check why translations are null
    console.log('\n❓ Checking why translations are null...');
    const nullCheck = await pool.query(`
      SELECT 
        ci.id,
        ci.content_key,
        ct.language_code,
        ct.content_value,
        ct.status
      FROM content_items ci
      LEFT JOIN content_translations ct ON ci.id = ct.content_item_id
      WHERE ci.screen_location = 'refinance_credit_2'
        AND ci.content_key = 'calculate_mortgage_add_partner'
    `);

    if (nullCheck.rows.length === 0) {
      console.log('No translations found for calculate_mortgage_add_partner');
    } else {
      console.log('\nTranslations for calculate_mortgage_add_partner:');
      nullCheck.rows.forEach(row => {
        console.log(`  ${row.language_code || 'NO LANG'}: "${row.content_value || 'NULL'}" (status: ${row.status || 'NULL'})`);
      });
    }

    // Check if we need to add translations
    console.log('\n🔧 Content items missing translations:');
    const missingTranslations = await pool.query(`
      SELECT 
        ci.id,
        ci.content_key,
        ci.component_type
      FROM content_items ci
      LEFT JOIN content_translations ct ON ci.id = ct.content_item_id
      WHERE ci.screen_location = 'refinance_credit_2'
        AND ct.id IS NULL
      LIMIT 10
    `);

    console.log(`Found ${missingTranslations.rows.length} items without any translations`);
    
    if (missingTranslations.rows.length > 0) {
      console.log('\nItems needing translations:');
      missingTranslations.rows.forEach(row => {
        console.log(`  - ID: ${row.id}, Key: ${row.content_key}`);
      });
    }

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkRefinanceContent();
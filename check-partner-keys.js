require('dotenv').config({ path: '.env' });
const { Pool } = require('pg');

// Use Railway connection directly
const DATABASE_URL = 'postgresql://postgres:SxTdAhOmnhHlqKGPwVfGnbIaGEJHqKCr@junction.proxy.rlwy.net:40739/railway';

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function checkPartnerKeys() {
  try {
    console.log('🔍 Checking for AddPartner component translation keys...');
    console.log('Expected keys:');
    console.log('  - calculate_mortgage_add_partner');
    console.log('  - calculate_mortgage_add_partner_title');
    console.log('');
    
    // Search for exact keys the component expects
    const exactQuery = `
      SELECT ci.content_key, ct.content_text_he, ci.screen_location
      FROM content_items ci
      LEFT JOIN content_translations ct ON ci.id = ct.content_item_id
      WHERE ci.content_key IN ('calculate_mortgage_add_partner', 'calculate_mortgage_add_partner_title')
      AND ct.language_code = 'he'
      ORDER BY ci.content_key
    `;
    
    const exactResult = await pool.query(exactQuery);
    console.log('📋 Exact keys found:', exactResult.rows.length);
    
    if (exactResult.rows.length > 0) {
      exactResult.rows.forEach(row => {
        console.log(`✅ Key: ${row.content_key}`);
        console.log(`   Screen: ${row.screen_location}`);
        console.log(`   Hebrew: ${row.content_text_he}`);
        console.log('');
      });
    } else {
      console.log('❌ Exact keys NOT FOUND!');
      console.log('');
      
      // Search for any add_partner variations
      const searchQuery = `
        SELECT ci.content_key, ct.content_text_he, ci.screen_location
        FROM content_items ci
        LEFT JOIN content_translations ct ON ci.id = ct.content_item_id
        WHERE ci.content_key LIKE '%add_partner%'
        AND ct.language_code = 'he'
        ORDER BY ci.content_key
      `;
      
      const searchResult = await pool.query(searchQuery);
      console.log('🔍 Similar add_partner keys found:', searchResult.rows.length);
      
      if (searchResult.rows.length > 0) {
        searchResult.rows.forEach(row => {
          console.log(`📋 Similar key: ${row.content_key}`);
          console.log(`   Screen: ${row.screen_location}`);
          console.log(`   Hebrew: ${row.content_text_he}`);
          console.log('');
        });
      } else {
        console.log('❌ No add_partner keys found at all!');
      }
      
      // Check if mortgage_step2 has any content
      console.log('🔍 Checking all mortgage_step2 content...');
      const step2Query = `
        SELECT ci.content_key, ct.content_text_he
        FROM content_items ci
        LEFT JOIN content_translations ct ON ci.id = ct.content_item_id
        WHERE ci.screen_location = 'mortgage_step2'
        AND ct.language_code = 'he'
        AND ci.content_key LIKE '%partner%'
        ORDER BY ci.content_key
      `;
      
      const step2Result = await pool.query(step2Query);
      console.log('📋 Partner-related keys in mortgage_step2:', step2Result.rows.length);
      
      step2Result.rows.forEach(row => {
        console.log(`📋 Step2 key: ${row.content_key}`);
        console.log(`   Hebrew: ${row.content_text_he}`);
        console.log('');
      });
    }
    
    console.log('✅ Analysis complete');
    
  } catch (error) {
    console.error('❌ Database error:', error.message);
  } finally {
    await pool.end();
  }
}

checkPartnerKeys();
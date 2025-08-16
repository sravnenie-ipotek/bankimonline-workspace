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

async function debugFamilyStatus() {
  try {
    console.log('🔍 Debugging Family Status dropdown values...');
    
    // Check what family_status options exist in database
    const query = `
      SELECT ci.content_key, ct.content_text_he, ct.content_text_en, ct.content_text_ru
      FROM content_items ci
      LEFT JOIN content_translations ct ON ci.id = ct.content_item_id
      WHERE ci.screen_location = 'mortgage_step2'
      AND ci.content_key LIKE '%family_status%'
      AND ci.component_type = 'option'
      ORDER BY ci.content_key
    `;
    
    const result = await pool.query(query);
    console.log('📋 Family Status Options Found:', result.rows.length);
    
    if (result.rows.length > 0) {
      result.rows.forEach(row => {
        console.log(`✅ Key: ${row.content_key}`);
        console.log(`   English: ${row.content_text_en}`);
        console.log(`   Hebrew: ${row.content_text_he}`);
        console.log(`   Russian: ${row.content_text_ru}`);
        console.log('');
      });
    } else {
      console.log('❌ No family status options found in database!');
      
      // Check if any family_status content exists at all
      const searchQuery = `
        SELECT ci.content_key, ci.component_type, ct.content_text_he
        FROM content_items ci
        LEFT JOIN content_translations ct ON ci.id = ct.content_item_id
        WHERE ci.content_key LIKE '%family_status%'
        AND ct.language_code = 'he'
        ORDER BY ci.content_key
      `;
      
      const searchResult = await pool.query(searchQuery);
      console.log('🔍 All family_status keys found:', searchResult.rows.length);
      
      searchResult.rows.forEach(row => {
        console.log(`📋 Key: ${row.content_key} (${row.component_type})`);
        console.log(`   Hebrew: ${row.content_text_he}`);
        console.log('');
      });
    }
    
    // Also check what the API endpoint returns
    console.log('🌐 Testing API endpoint...');
    const fetch = require('node-fetch');
    
    try {
      const response = await fetch('http://localhost:8003/api/dropdowns/mortgage_step2/he');
      if (response.ok) {
        const apiData = await response.json();
        console.log('📡 API Response Status:', apiData.status);
        
        if (apiData.options && apiData.options['mortgage_step2_family_status']) {
          console.log('📋 Family Status Options from API:');
          apiData.options['mortgage_step2_family_status'].forEach(option => {
            console.log(`   ${option.value}: ${option.label}`);
          });
        } else {
          console.log('❌ No family_status options in API response');
          console.log('Available options keys:', Object.keys(apiData.options || {}));
        }
      } else {
        console.log('❌ API request failed:', response.status, response.statusText);
      }
    } catch (apiError) {
      console.log('❌ API test failed:', apiError.message);
    }
    
    console.log('✅ Family Status debugging complete');
    
  } catch (error) {
    console.error('❌ Database error:', error.message);
  } finally {
    await pool.end();
  }
}

debugFamilyStatus();
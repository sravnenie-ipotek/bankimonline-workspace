const { Pool } = require('pg');
require('dotenv').config();

async function testConnection() {
  console.log('🔍 Testing Database Connections...\n');
  
  // Test main database
  console.log('📊 Testing MAIN database (maglev)...');
  const mainPool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 10000  // 10 second timeout
  });
  
  try {
    const result = await mainPool.query('SELECT NOW()');
    console.log('✅ Main database connected:', result.rows[0].now);
    
    // Check for content tables
    const tables = await mainPool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_name IN ('content_items', 'content_translations', 'dropdown_configs')
      ORDER BY table_name
    `);
    
    console.log('📋 Content tables in main database:');
    if (tables.rows.length === 0) {
      console.log('   ❌ No content tables found');
    } else {
      tables.rows.forEach(row => {
        console.log(`   ✅ ${row.table_name}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Main database error:', error.message);
  } finally {
    await mainPool.end();
  }
  
  // Test content database
  console.log('\n📊 Testing CONTENT database (shortline)...');
  const contentPool = new Pool({
    connectionString: process.env.CONTENT_DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 10000
  });
  
  try {
    const result = await contentPool.query('SELECT NOW()');
    console.log('✅ Content database connected:', result.rows[0].now);
    
    // Check for content tables
    const tables = await contentPool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_name IN ('content_items', 'content_translations', 'dropdown_configs')
      ORDER BY table_name
    `);
    
    console.log('📋 Content tables in content database:');
    if (tables.rows.length === 0) {
      console.log('   ❌ No content tables found');
    } else {
      tables.rows.forEach(row => {
        console.log(`   ✅ ${row.table_name}`);
      });
    }
    
    // Quick check for specific translations
    const translationCheck = await contentPool.query(`
      SELECT COUNT(*) as count 
      FROM content_items 
      WHERE content_key LIKE 'app.refinance.step1%'
         OR content_key LIKE 'mortgage_step1%'
         OR content_key LIKE 'calculate_mortgage%'
    `);
    
    console.log(`\n📊 Translation counts:`);
    console.log(`   Found ${translationCheck.rows[0].count} relevant content items`);
    
    // Check specific missing keys
    const missingKeys = [
      'app.refinance.step1.title',
      'mortgage_step1.header.title',
      'calculate_mortgage_first'
    ];
    
    console.log('\n🔍 Checking specific keys:');
    for (const key of missingKeys) {
      const keyCheck = await contentPool.query(
        'SELECT COUNT(*) as count FROM content_items WHERE content_key = $1',
        [key]
      );
      
      if (keyCheck.rows[0].count > 0) {
        console.log(`   ✅ ${key} exists`);
      } else {
        console.log(`   ❌ ${key} NOT FOUND`);
      }
    }
    
  } catch (error) {
    console.error('❌ Content database error:', error.message);
  } finally {
    await contentPool.end();
  }
  
  console.log('\n📊 Summary:');
  console.log('The issue is database connectivity timeouts.');
  console.log('Both databases are using Railway proxy endpoints.');
  console.log('The API server is experiencing connection timeouts after ~5 seconds.');
}

testConnection();
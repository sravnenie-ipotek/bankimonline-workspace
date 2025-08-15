#!/usr/bin/env node
/**
 * Verify database connectivity and content availability
 */

require('dotenv').config();
const { Pool } = require('pg');

async function verifyDatabase() {
  console.log('🔍 Verifying Database Configuration...\n');
  
  // Check environment variables
  const contentDbUrl = process.env.CONTENT_DATABASE_URL;
  const mainDbUrl = process.env.DATABASE_URL;
  
  if (!contentDbUrl) {
    console.log('❌ CONTENT_DATABASE_URL not set');
    process.exit(1);
  }
  
  console.log('✅ Environment variables configured');
  
  // Test content database connection
  const contentPool = new Pool({ connectionString: contentDbUrl });
  
  try {
    console.log('🔌 Testing content database connection...');
    
    // Test connection
    const client = await contentPool.connect();
    console.log('✅ Content database connected');
    client.release();
    
    // Check table structure
    const tablesResult = await contentPool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('content_items', 'content_translations')
      ORDER BY table_name
    `);
    
    const tables = tablesResult.rows.map(r => r.table_name);
    console.log('📋 Tables found:', tables);
    
    if (tables.length !== 2) {
      console.log('❌ Missing required tables: content_items, content_translations');
      process.exit(1);
    }
    
    // Check critical content availability
    const criticalScreens = ['mortgage_step3', 'credit_step3', 'refinance_step3'];
    
    console.log('\n📊 Content Availability Check:');
    
    for (const screen of criticalScreens) {
      const result = await contentPool.query(`
        SELECT COUNT(*) as count 
        FROM content_items 
        WHERE screen_location = $1
      `, [screen]);
      
      const count = parseInt(result.rows[0].count);
      
      if (count === 0) {
        console.log(`❌ ${screen}: 0 items (CRITICAL - dropdowns will fail)`);
      } else if (count < 10) {
        console.log(`⚠️  ${screen}: ${count} items (LOW - may indicate incomplete migration)`);
      } else {
        console.log(`✅ ${screen}: ${count} items`);
      }
    }
    
    // Check translation status
    console.log('\n🌐 Translation Status Check:');
    
    const statusResult = await contentPool.query(`
      SELECT 
        status,
        COUNT(*) as count
      FROM content_translations ct
      JOIN content_items ci ON ct.content_item_id = ci.id
      WHERE ci.screen_location IN ('mortgage_step3', 'credit_step3', 'refinance_step3')
      GROUP BY status
      ORDER BY status
    `);
    
    statusResult.rows.forEach(row => {
      if (row.status === 'draft') {
        console.log(`⚠️  ${row.status}: ${row.count} translations (may cause dropdown filtering issues)`);
      } else {
        console.log(`✅ ${row.status}: ${row.count} translations`);
      }
    });
    
    console.log('\n✅ Database verification complete');
    
  } catch (error) {
    console.error('❌ Database verification failed:', error.message);
    process.exit(1);
  } finally {
    await contentPool.end();
  }
}

verifyDatabase();
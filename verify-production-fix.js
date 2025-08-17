#!/usr/bin/env node

const { Pool } = require('pg');

// Production database connection
const pool = new Pool({
  connectionString: 'postgresql://postgres:lgqPEzvVbSCviTybKqMbzJkYvOUetJjt@maglev.proxy.rlwy.net:43809/railway',
  ssl: { rejectUnauthorized: false }
});

async function verifyProductionFix() {
  console.log('🔍 Verifying Credit Step 4 Fix in Production\n');
  console.log('=' .repeat(60));
  
  try {
    // Check critical content keys
    console.log('\n📋 Checking Critical Content Keys:');
    const criticalKeys = await pool.query(`
      SELECT 
        ci.content_key,
        ct.language_code,
        LEFT(ct.content_value, 50) as content_preview
      FROM content_items ci
      JOIN content_translations ct ON ci.id = ct.content_item_id
      WHERE ci.screen_location = 'credit_step4'
        AND ci.content_key IN ('credit_final', 'credit_warning')
      ORDER BY ci.content_key, ct.language_code
    `);
    
    if (criticalKeys.rows.length === 0) {
      console.log('❌ CRITICAL: No credit_final or credit_warning keys found!');
    } else {
      console.log('✅ Found critical keys:');
      criticalKeys.rows.forEach(row => {
        console.log(`  ${row.content_key} [${row.language_code}]: "${row.content_preview}..."`);
      });
    }
    
    // Check view
    console.log('\n👁️  Checking Database View:');
    const viewCheck = await pool.query(`
      SELECT COUNT(*) as count
      FROM view_credit_step4
      WHERE content_key IN ('credit_final', 'credit_warning')
    `);
    
    console.log(`  View records for critical keys: ${viewCheck.rows[0].count}`);
    
    // Check all content keys
    console.log('\n📊 All Credit Step 4 Content Keys:');
    const allKeys = await pool.query(`
      SELECT DISTINCT content_key
      FROM content_items
      WHERE screen_location = 'credit_step4'
      ORDER BY content_key
      LIMIT 10
    `);
    
    allKeys.rows.forEach(row => {
      const status = row.content_key.startsWith('credit_') && !row.content_key.startsWith('calculate_credit_') 
        ? '✅' : '⚠️';
      console.log(`  ${status} ${row.content_key}`);
    });
    
    // Summary
    console.log('\n' + '=' .repeat(60));
    console.log('📈 PRODUCTION DATABASE STATUS:');
    console.log('=' .repeat(60));
    
    const hasCorrectKeys = criticalKeys.rows.length >= 6; // 2 keys * 3 languages
    if (hasCorrectKeys) {
      console.log('✅ Database has correct credit_final and credit_warning content');
      console.log('✅ All translations are in place');
      console.log('\n📱 Frontend Status:');
      console.log('  - Code expects: getContent("credit_final") and getContent("credit_warning")');
      console.log('  - Database has: These keys with proper translations');
      console.log('  - Result: Should display correctly once deployed');
    } else {
      console.log('❌ Database is missing critical content keys');
      console.log('❌ Frontend will fall back to translation files');
    }
    
    console.log('\n🌐 Production URL to test:');
    console.log('  https://dev2.bankimonline.com/services/calculate-credit/4');
    console.log('\n⏰ If still showing "Credit Registration":');
    console.log('  1. Railway deployment may still be in progress');
    console.log('  2. Browser cache may need clearing');
    console.log('  3. CDN cache may need purging');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

verifyProductionFix().catch(console.error);
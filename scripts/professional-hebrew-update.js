#!/usr/bin/env node

/**
 * Professional Hebrew Translation Database Update Script
 * Handles safe database updates for professional Hebrew translations
 */

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.CONTENT_DATABASE_URL
});

class ProfessionalHebrewUpdater {
  async identifyPriorityTranslations() {
    console.log('🔍 Identifying priority Hebrew translations...');
    
    const criticalPatterns = [
      'calculate_mortgage_property_ownership%',
      'calculate_mortgage_initial_payment%', 
      'bank_offers%',
      'validation_%',
      'error_%'
    ];

    for (const pattern of criticalPatterns) {
      const query = `
        SELECT ci.content_key, ct.content_value, ci.screen_location
        FROM content_items ci 
        JOIN content_translations ct ON ci.id = ct.content_item_id 
        WHERE ct.language_code = 'he' 
        AND ci.content_key LIKE $1
        ORDER BY ci.content_key
      `;
      
      const result = await pool.query(query, [pattern]);
      
      console.log(`\n📋 Pattern: ${pattern}`);
      console.log(`   Found: ${result.rows.length} translations`);
      
      result.rows.slice(0, 3).forEach(row => {
        console.log(`   • ${row.content_key}: "${row.content_value}"`);
      });
    }
  }

  async createProfessionalReviewBatch() {
    console.log('\n🎯 Creating professional review batch...');
    
    const updateQuery = `
      UPDATE content_translations 
      SET status = 'professional_review',
          updated_at = NOW(),
          reviewer_notes = 'Flagged for professional banking Hebrew review'
      WHERE language_code = 'he' 
      AND content_item_id IN (
        SELECT id FROM content_items 
        WHERE content_key LIKE 'calculate_mortgage%' 
        OR content_key LIKE 'bank_offers%'
        OR content_key LIKE 'validation%'
        OR content_key LIKE 'error_%'
      )
      AND status = 'approved'
    `;

    const result = await pool.query(updateQuery);
    console.log(`✅ Marked ${result.rowCount} translations for professional review`);
  }

  async validateTranslationIntegrity() {
    console.log('\n🔍 Validating translation integrity...');
    
    // Check for missing Hebrew translations
    const missingQuery = `
      SELECT ci.content_key, ci.screen_location
      FROM content_items ci
      LEFT JOIN content_translations ct ON ci.id = ct.content_item_id AND ct.language_code = 'he'
      WHERE ct.id IS NULL
      AND ci.status = 'active'
      LIMIT 10
    `;
    
    const missing = await pool.query(missingQuery);
    if (missing.rows.length > 0) {
      console.log(`⚠️  Found ${missing.rows.length} missing Hebrew translations:`);
      missing.rows.forEach(row => {
        console.log(`   • ${row.content_key} (${row.screen_location})`);
      });
    } else {
      console.log('✅ All active content has Hebrew translations');
    }
  }

  async generateProfessionalWorksheet() {
    console.log('\n📊 Generating professional translator worksheet...');
    
    const worksheetQuery = `
      SELECT 
        ci.content_key,
        ci.screen_location,
        ci.category,
        ct_en.content_value as english_text,
        ct_he.content_value as current_hebrew,
        ct_he.status as hebrew_status
      FROM content_items ci
      JOIN content_translations ct_en ON ci.id = ct_en.content_item_id AND ct_en.language_code = 'en'
      JOIN content_translations ct_he ON ci.id = ct_he.content_item_id AND ct_he.language_code = 'he'
      WHERE ct_he.status = 'professional_review'
      ORDER BY 
        CASE ci.category
          WHEN 'mortgage_calculation' THEN 1
          WHEN 'validation' THEN 2  
          WHEN 'bank_offers' THEN 3
          ELSE 4
        END,
        ci.content_key
      LIMIT 50
    `;

    const worksheet = await pool.query(worksheetQuery);
    
    console.log(`📋 Professional Translation Worksheet (${worksheet.rows.length} items):`);
    console.log('=' .repeat(80));
    
    worksheet.rows.forEach((row, index) => {
      console.log(`${index + 1}. ${row.content_key}`);
      console.log(`   Context: ${row.screen_location} (${row.category})`);
      console.log(`   EN: ${row.english_text}`);
      console.log(`   HE: ${row.current_hebrew}`);
      console.log(`   Status: ${row.hebrew_status}`);
      console.log('-'.repeat(60));
    });
  }

  async createRollbackPoint() {
    console.log('\n💾 Creating rollback point...');
    
    const backupQuery = `
      CREATE TABLE IF NOT EXISTS content_translations_backup_${Date.now()} AS
      SELECT * FROM content_translations 
      WHERE language_code = 'he'
    `;
    
    await pool.query(backupQuery);
    console.log('✅ Backup created for Hebrew translations');
  }
}

async function main() {
  const updater = new ProfessionalHebrewUpdater();
  
  try {
    await updater.createRollbackPoint();
    await updater.identifyPriorityTranslations();
    await updater.validateTranslationIntegrity();
    await updater.createProfessionalReviewBatch();
    await updater.generateProfessionalWorksheet();
    
    console.log('\n🎉 Professional Hebrew update preparation complete!');
    console.log('\nNext steps:');
    console.log('1. Share worksheet with professional Hebrew translator');
    console.log('2. Translator updates database content directly');
    console.log('3. Run validation tests');
    console.log('4. Deploy with zero downtime');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  main();
}

module.exports = { ProfessionalHebrewUpdater };
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
      
      result.rows.slice(0, 3).forEach(row => {
        });
    }
  }

  async createProfessionalReviewBatch() {
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
    }

  async validateTranslationIntegrity() {
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
      missing.rows.forEach(row => {
        `);
      });
    } else {
      }
  }

  async generateProfessionalWorksheet() {
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
    
    :`);
    );
    
    worksheet.rows.forEach((row, index) => {
      `);
      );
    });
  }

  async createRollbackPoint() {
    const backupQuery = `
      CREATE TABLE IF NOT EXISTS content_translations_backup_${Date.now()} AS
      SELECT * FROM content_translations 
      WHERE language_code = 'he'
    `;
    
    await pool.query(backupQuery);
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
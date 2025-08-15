const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.CONTENT_DATABASE_URL || process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function analyzeMinimalSteps() {
  try {
    );
    
    // Check what the single items are in steps 2-4
    const minimalSteps = [
      'refinance_step2', 'refinance_step3',
      'refinance_credit_2', 'refinance_credit_3', 'refinance_credit_4'
    ];
    
    :\n');
    
    for (const screen of minimalSteps) {
      const result = await pool.query(`
        SELECT content_key, component_type, category, en, he, ru
        FROM content_items
        WHERE screen_location = $1
      `, [screen]);
      
      if (result.rows.length > 0) {
        result.rows.forEach(row => {
          });
        }
    }
    
    // Compare with complete steps to see what's typically included
    // Complete steps
    const completeSteps = ['mortgage_step2', 'mortgage_step3', 'refinance_step1', 'calculate_credit_1', 'refinance_credit_1'];
    
    for (const screen of completeSteps) {
      const result = await pool.query(`
        SELECT component_type, COUNT(*) as count
        FROM content_items
        WHERE screen_location = $1
        GROUP BY component_type
        ORDER BY count DESC
      `, [screen]);
      
      => sum + parseInt(row.count), 0)} items):`);
      result.rows.forEach(row => {
        });
      }
    
    // Check for patterns in content keys
    const keyPatterns = await pool.query(`
      SELECT 
        screen_location,
        COUNT(CASE WHEN content_key LIKE '%title%' THEN 1 END) as title_count,
        COUNT(CASE WHEN content_key LIKE '%label%' THEN 1 END) as label_count,
        COUNT(CASE WHEN content_key LIKE '%button%' THEN 1 END) as button_count,
        COUNT(CASE WHEN content_key LIKE '%placeholder%' THEN 1 END) as placeholder_count,
        COUNT(CASE WHEN content_key LIKE '%option%' THEN 1 END) as option_count,
        COUNT(CASE WHEN content_key LIKE '%error%' THEN 1 END) as error_count,
        COUNT(CASE WHEN content_key LIKE '%info%' OR content_key LIKE '%help%' THEN 1 END) as info_count
      FROM content_items
      WHERE screen_location IN (
        'mortgage_step2', 'mortgage_step3', 
        'refinance_step1', 'refinance_step2', 'refinance_step3',
        'calculate_credit_1', 'refinance_credit_1'
      )
      GROUP BY screen_location
      ORDER BY screen_location
    `);
    
    keyPatterns.rows.forEach(row => {
      });
    
    // Check what content exists in refinance_credit_1 as it has more items
    :\n');
    
    const sampleContent = await pool.query(`
      SELECT content_key, component_type, en
      FROM content_items
      WHERE screen_location = 'refinance_credit_1'
      ORDER BY content_key
      LIMIT 10
    `);
    
    sampleContent.rows.forEach(row => {
      : "${row.en}"`);
    });
    
    // Summary
    );
    
    ');
    ');
    ');
    
    have 42 items each');
    } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

analyzeMinimalSteps();
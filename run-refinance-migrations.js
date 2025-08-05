const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function runMigrations() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  const migrations = [
    'migrate_refinance_credit_step1_dropdowns.sql',
    'migrate_refinance_credit_step2_complete.sql',
    'migrate_refinance_credit_step3_complete.sql',
    'migrate_refinance_credit_step4_complete.sql'
  ];

  try {
    await client.connect();
    console.log('Connected to database');

    for (const migration of migrations) {
      const migrationPath = path.join(__dirname, 'migrations', migration);
      
      if (!fs.existsSync(migrationPath)) {
        console.log(`Migration file not found: ${migration}`);
        continue;
      }

      console.log(`\nRunning migration: ${migration}`);
      const sql = fs.readFileSync(migrationPath, 'utf8');
      
      try {
        await client.query(sql);
        console.log(`✅ ${migration} completed successfully`);
        
        // Verify the migration
        const stepMatch = migration.match(/step(\d)/);
        if (stepMatch) {
          const stepNum = stepMatch[1];
          const result = await client.query(`
            SELECT COUNT(*) as count 
            FROM content_items 
            WHERE screen_location = 'refinance_credit_${stepNum}'
          `);
          console.log(`   Items created: ${result.rows[0].count}`);
        }
      } catch (error) {
        console.error(`❌ Error in ${migration}:`, error.message);
      }
    }

    // Final verification
    console.log('\n=== Final Verification ===');
    const verifyResult = await client.query(`
      SELECT 
        screen_location,
        COUNT(*) as item_count,
        COUNT(DISTINCT ct.language_code) as languages
      FROM content_items ci
      LEFT JOIN content_translations ct ON ci.id = ct.content_item_id
      WHERE screen_location LIKE 'refinance_credit_%'
      GROUP BY screen_location
      ORDER BY screen_location
    `);
    
    console.log('Refinance credit content in database:');
    verifyResult.rows.forEach(row => {
      console.log(`- ${row.screen_location}: ${row.item_count} items, ${row.languages} languages`);
    });

  } catch (error) {
    console.error('Connection error:', error.message);
  } finally {
    await client.end();
  }
}

// Run the migrations
runMigrations().then(() => {
  console.log('\nMigration process completed!');
}).catch(error => {
  console.error('Migration failed:', error);
  process.exit(1);
});
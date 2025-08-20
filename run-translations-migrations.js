const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Content database connection
const contentPool = new Pool({
  connectionString: process.env.CONTENT_DATABASE_URL || process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function runMigrations() {
  try {
    console.log('🚀 Running translation migrations...\n');
    
    const migrations = [
      '202501_add_refinance_mortgage_translations.sql',
      '202501_add_mortgage_first_apartment_translations.sql'
    ];
    
    for (const migrationFile of migrations) {
      const filePath = path.join(__dirname, 'server', 'migrations', migrationFile);
      
      if (!fs.existsSync(filePath)) {
        console.log(`❌ Migration file not found: ${filePath}`);
        continue;
      }
      
      console.log(`📄 Running migration: ${migrationFile}`);
      const sql = fs.readFileSync(filePath, 'utf8');
      
      try {
        await contentPool.query(sql);
        console.log(`✅ Migration completed: ${migrationFile}\n`);
      } catch (error) {
        console.error(`❌ Migration failed: ${migrationFile}`);
        console.error(`   Error: ${error.message}\n`);
      }
    }
    
    // Verify the migrations worked
    console.log('🔍 Verifying migrations...\n');
    
    // Check refinance translations
    const refinanceCheck = await contentPool.query(`
      SELECT COUNT(*) as count 
      FROM content_items 
      WHERE content_key LIKE 'app.refinance.step1%'
    `);
    console.log(`✅ Refinance mortgage translations: ${refinanceCheck.rows[0].count} items`);
    
    // Check first apartment translations
    const firstApartmentCheck = await contentPool.query(`
      SELECT COUNT(*) as count 
      FROM content_items 
      WHERE content_key IN ('calculate_mortgage_first', 'app.mortgage.step1.first_apartment')
    `);
    console.log(`✅ First apartment translations: ${firstApartmentCheck.rows[0].count} items`);
    
    // Check dropdown configs
    const dropdownCheck = await contentPool.query(`
      SELECT field_name, screen_location 
      FROM dropdown_configs 
      WHERE field_name IN ('first_apartment', 'property_ownership')
      ORDER BY field_name
    `);
    console.log(`✅ Dropdown configurations:`);
    dropdownCheck.rows.forEach(row => {
      console.log(`   - ${row.screen_location}/${row.field_name}`);
    });
    
    console.log('\n🎉 All migrations completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration error:', error.message);
  } finally {
    await contentPool.end();
  }
}

runMigrations();
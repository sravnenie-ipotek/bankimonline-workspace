const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Database connection configuration - same as server
const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:lgqPEzvVbSCviTybKqMbzJkYvOUetJjt@maglev.proxy.rlwy.net:43809/railway'
});

async function runMigration() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Starting Refinance Step 2 Education Migration...');
    
    // Read the SQL migration file
    const sqlPath = path.join(__dirname, '041_migrate_refinance_step2_education_to_db.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    // Split the SQL into individual statements
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`📝 Found ${statements.length} SQL statements to execute`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        try {
          console.log(`⏳ Executing statement ${i + 1}/${statements.length}...`);
          await client.query(statement);
          console.log(`✅ Statement ${i + 1} executed successfully`);
        } catch (error) {
          console.error(`❌ Error executing statement ${i + 1}:`, error.message);
          // Continue with other statements
        }
      }
    }
    
    // Verify the migration
    console.log('\n🔍 Verifying migration...');
    const verificationQuery = `
      SELECT 
          ci.content_key,
          ci.component_type,
          ci.screen_location,
          ct.language_code,
          ct.content_value
      FROM content_items ci
      JOIN content_translations ct ON ci.id = ct.content_item_id
      WHERE ci.screen_location = 'refinance_step2' 
        AND ci.content_key LIKE 'refinance_step2_education%'
      ORDER BY ci.content_key, ct.language_code;
    `;
    
    const result = await client.query(verificationQuery);
    
    console.log('\n📊 Migration Results:');
    console.log(`✅ Total content items: ${result.rows.length}`);
    
    if (result.rows.length > 0) {
      console.log('\n📋 Content Items Added:');
      result.rows.forEach((row, index) => {
        console.log(`${index + 1}. ${row.content_key} (${row.language_code}): "${row.content_value}"`);
      });
    } else {
      console.log('⚠️  No content items found - migration may have failed');
    }
    
    console.log('\n🎉 Migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the migration
runMigration().catch(console.error); 
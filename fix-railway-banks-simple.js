// Fix Railway database banks table schema - simplified
require('dotenv').config();
const { Pool } = require('pg');

// Railway database connection
const railwayPool = new Pool({
  connectionString: 'postgresql://postgres:lgqPEzvVbSCviTybKqMbzJkYvOUetJjt@maglev.proxy.rlwy.net:43809/railway',
  max: 3
});

async function fixRailwayBanksSchema() {
  console.log('🔧 FIXING RAILWAY BANKS TABLE SCHEMA (Simple)');
  console.log('============================================\n');

  try {
    // Update existing banks with generic names for now
    console.log('📊 Updating all banks with generic names...');
    await railwayPool.query(`
      UPDATE banks SET 
        name_en = 'Bank ' || id,
        name_he = 'בנק ' || id,
        name_ru = 'Банк ' || id
      WHERE name_en IS NULL OR name_he IS NULL OR name_ru IS NULL
    `);

    // Create indexes
    console.log('\n📊 Creating indexes for better performance...');
    await railwayPool.query('CREATE INDEX IF NOT EXISTS idx_banks_name_en ON banks(name_en)');
    await railwayPool.query('CREATE INDEX IF NOT EXISTS idx_banks_name_he ON banks(name_he)');
    await railwayPool.query('CREATE INDEX IF NOT EXISTS idx_banks_name_ru ON banks(name_ru)');

    // Verify the fix
    console.log('\n🔍 Verifying the fix...');
    const verifyResult = await railwayPool.query(`
      SELECT id, name_en, name_he, name_ru 
      FROM banks 
      WHERE name_en IS NOT NULL 
      ORDER BY id 
      LIMIT 10
    `);

    console.log('\n✅ Banks with names:');
    verifyResult.rows.forEach(bank => {
      console.log(`  ${bank.id}: ${bank.name_en} | ${bank.name_he} | ${bank.name_ru}`);
    });

    console.log('\n🎉 Railway banks schema fixed successfully!');

  } catch (error) {
    console.error('❌ Error fixing Railway schema:', error.message);
  } finally {
    await railwayPool.end();
  }
}

fixRailwayBanksSchema();
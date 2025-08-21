// Fix Railway database banks table schema
require('dotenv').config();
const { Pool } = require('pg');

// Railway database connection
const railwayPool = new Pool({
  connectionString: 'postgresql://postgres:lgqPEzvVbSCviTybKqMbzJkYvOUetJjt@maglev.proxy.rlwy.net:43809/railway',
  max: 3
});

async function fixRailwayBanksSchema() {
  console.log('🔧 FIXING RAILWAY BANKS TABLE SCHEMA');
  console.log('===================================\n');

  try {
    // Add missing columns
    console.log('📊 Adding missing name columns to banks table...');
    await railwayPool.query(`
      ALTER TABLE banks 
      ADD COLUMN IF NOT EXISTS name_en VARCHAR(255),
      ADD COLUMN IF NOT EXISTS name_he VARCHAR(255),
      ADD COLUMN IF NOT EXISTS name_ru VARCHAR(255)
    `);
    console.log('✅ Columns added successfully');

    // Check existing banks
    console.log('\n📊 Checking existing banks...');
    const existingBanks = await railwayPool.query('SELECT id, key, url, logo FROM banks ORDER BY id');
    console.log(`Found ${existingBanks.rows.length} existing banks`);

    // Update existing banks with proper names
    console.log('\n📊 Updating existing banks with names...');
    
    // Bank of Israel
    await railwayPool.query(`
      UPDATE banks SET 
        name_en = 'Bank of Israel',
        name_he = 'בנק ישראל',
        name_ru = 'Банк Израиля'
      WHERE url LIKE '%bankisrael%' OR key LIKE '%75%'
    `);

    // Bank Hapoalim
    await railwayPool.query(`
      UPDATE banks SET 
        name_en = 'Bank Hapoalim',
        name_he = 'בנק הפועלים',
        name_ru = 'Банк Апоалим'
      WHERE url LIKE '%bankhapoalim%' OR key LIKE '%76%'
    `);

    // Discount Bank
    await railwayPool.query(`
      UPDATE banks SET 
        name_en = 'Discount Bank',
        name_he = 'בנק דיסקונט',
        name_ru = 'Дисконт Банк'
      WHERE url LIKE '%discountbank%' OR key LIKE '%77%'
    `);

    // Generic names for any remaining banks
    await railwayPool.query(`
      UPDATE banks SET 
        name_en = COALESCE(name_en, 'Bank ' || id),
        name_he = COALESCE(name_he, 'בנק ' || id),
        name_ru = COALESCE(name_ru, 'Банк ' || id)
      WHERE name_en IS NULL OR name_he IS NULL OR name_ru IS NULL
    `);

    // Insert additional Israeli banks
    console.log('\n📊 Adding additional Israeli banks...');
    await railwayPool.query(`
      INSERT INTO banks (key, name_en, name_he, name_ru, url, logo, display_order, is_active, show_in_fallback, fallback_priority, fallback_interest_rate, fallback_approval_rate, tender, priority, created_at, updated_at)
      VALUES 
        ('bank_leumi', 'Bank Leumi', 'בנק לאומי', 'Банк Леуми', 'https://www.leumi.co.il/', 'leumi_logo.png', 1, true, true, 1, 5.0, 80.0, 1, 1, NOW(), NOW()),
        ('bank_mizrahi', 'Mizrahi Tefahot Bank', 'בנק מזרחי טפחות', 'Мизрахи Тефахот', 'https://www.mizrahi-tefahot.co.il/', 'mizrahi_logo.png', 2, true, true, 1, 5.0, 80.0, 1, 2, NOW(), NOW()),
        ('bank_igud', 'Union Bank', 'בנק איגוד', 'Юнион Банк', 'https://www.unionbank.co.il/', 'igud_logo.png', 3, true, true, 1, 5.0, 80.0, 1, 3, NOW(), NOW())
      ON CONFLICT (key) DO NOTHING
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
      LIMIT 5
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
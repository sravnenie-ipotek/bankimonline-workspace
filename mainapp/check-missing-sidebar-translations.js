const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const requiredSidebarKeys = [
  // Main navigation
  'sidebar_company',
  'sidebar_company_1',
  'sidebar_company_2',
  'sidebar_company_3',
  'sidebar_company_4',
  'sidebar_company_5',
  'sidebar_company_6',
  'sidebar_business',
  'sidebar_business_1',
  'sidebar_business_2',
  'sidebar_business_3',
  'sidebar_business_4',
  
  // Submenu items
  'sidebar_sub_calculate_mortgage',
  'sidebar_sub_refinance_mortgage',
  'sidebar_sub_calculate_credit',
  'sidebar_sub_refinance_credit',
  'sidebar_sub_bank_apoalim',
  'sidebar_sub_bank_discount',
  'sidebar_sub_bank_leumi',
  'sidebar_sub_bank_beinleumi',
  'sidebar_sub_bank_mercantile_discount',
  'sidebar_sub_bank_jerusalem'
];

const languages = ['en', 'he', 'ru'];

async function checkMissingSidebarTranslations() {
  try {
    console.log('Checking for missing sidebar translations...\n');
    
    // Get existing content
    const result = await pool.query(`
      SELECT 
        ci.content_key,
        ct.language_code
      FROM content_items ci
      LEFT JOIN content_translations ct ON ci.id = ct.content_item_id
      WHERE ci.screen_location = 'sidebar'
        AND ct.status = 'approved'
    `);
    
    // Create a set of existing key-language pairs
    const existing = new Set();
    result.rows.forEach(row => {
      existing.add(`${row.content_key}:${row.language_code}`);
    });
    
    // Check for missing translations
    const missing = [];
    for (const key of requiredSidebarKeys) {
      for (const lang of languages) {
        const checkKey = `${key}:${lang}`;
        if (!existing.has(checkKey)) {
          missing.push({ key, language: lang });
        }
      }
    }
    
    if (missing.length === 0) {
      console.log('✅ All required sidebar translations are present in the database!');
    } else {
      console.log(`❌ Missing ${missing.length} translations:\n`);
      
      // Group by key
      const byKey = {};
      missing.forEach(({ key, language }) => {
        if (!byKey[key]) byKey[key] = [];
        byKey[key].push(language);
      });
      
      Object.entries(byKey).forEach(([key, langs]) => {
        console.log(`  ${key}: Missing in ${langs.join(', ')}`);
      });
      
      console.log('\nTo fix: Add these translations to the database or ensure they exist in JSON files.');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkMissingSidebarTranslations();
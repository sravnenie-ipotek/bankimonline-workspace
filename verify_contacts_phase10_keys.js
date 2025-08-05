const { Pool } = require('pg');

const DATABASE_URL = 'postgresql://postgres:SuFkUevgonaZFXJiJeczFiXYTlICHVJL@shortline.proxy.rlwy.net:33452/railway';
const pool = new Pool({ connectionString: DATABASE_URL });

async function verifyContactsPhase10Keys() {
  console.log('=== PHASE 10: CONTACTS.TSX DATABASE VERIFICATION ===\n');
  
  // All 33 translation keys identified in ULTRATHINK analysis
  const contactsKeys = [
    // Header section (7 keys)
    'contacts_title',
    'contacts_main_office', 
    'contacts_address',
    'contacts_phone_label',
    'contacts_phone',
    'contacts_email_label', 
    'contacts_email',
    
    // Tab navigation (4 keys)
    'contacts_general_questions',
    'contacts_service_questions',
    'contacts_real_estate_questions',
    'contacts_cooperation',
    
    // General questions section (12 keys)
    'contacts_tech_support',
    'contacts_tech_support_phone',
    'contacts_tech_support_email',
    'contacts_tech_support_link',
    'contacts_secretary',
    'contacts_secretary_phone', 
    'contacts_secretary_email',
    'contacts_secretary_link',
    'contacts_customer_service',
    'contacts_customer_service_phone',
    'contacts_customer_service_email',
    'contacts_customer_service_link',
    
    // Service questions section (6 keys)
    'contacts_mortgage_calc',
    'contacts_mortgage_calc_phone',
    'contacts_mortgage_calc_email',
    'contacts_credit_calc',
    'contacts_credit_calc_phone',
    'contacts_credit_calc_email',
    
    // Real estate questions section (6 keys)
    'contacts_real_estate_buy_sell',
    'contacts_real_estate_buy_sell_phone',
    'contacts_real_estate_buy_sell_email',
    'contacts_real_estate_rent',
    'contacts_real_estate_rent_phone',
    'contacts_real_estate_rent_email',
    
    // Cooperation section (7 keys)
    'contacts_cooperation_management',
    'contacts_cooperation_management_phone',
    'contacts_cooperation_management_email', 
    'contacts_management_contacts',
    'contacts_management_contacts_phone',
    'contacts_management_contacts_email',
    'contacts_accounting',
    'contacts_accounting_phone',
    'contacts_accounting_email',
    'contacts_fax',
    'contacts_fax_phone',
    
    // Social media section (1 key)
    'contacts_social_follow'
  ];

  try {
    console.log(`Checking ${contactsKeys.length} translation keys for Contacts page...\n`);
    
    let existingKeys = [];
    let missingKeys = [];
    
    for (const key of contactsKeys) {
      const result = await pool.query(`
        SELECT 
          ci.content_key,
          ci.category,
          ci.screen_location,
          COUNT(ct.language_code) as translation_count
        FROM content_items ci
        LEFT JOIN content_translations ct ON ci.id = ct.content_item_id AND ct.status = 'approved'
        WHERE ci.content_key = $1
        GROUP BY ci.id, ci.content_key, ci.category, ci.screen_location
      `, [key]);
      
      if (result.rows.length > 0) {
        const item = result.rows[0];
        existingKeys.push({
          key: key,
          category: item.category,
          screen_location: item.screen_location,
          translations: parseInt(item.translation_count)
        });
        console.log(`✅ EXISTS: ${key} (${item.translation_count} translations, category: ${item.category})`);
      } else {
        missingKeys.push(key);
        console.log(`❌ MISSING: ${key}`);
      }
    }
    
    console.log(`\n=== PHASE 10 DATABASE VERIFICATION SUMMARY ===`);
    console.log(`Total keys analyzed: ${contactsKeys.length}`);
    console.log(`Existing keys: ${existingKeys.length} (${Math.round(existingKeys.length/contactsKeys.length*100)}%)`);
    console.log(`Missing keys: ${missingKeys.length} (${Math.round(missingKeys.length/contactsKeys.length*100)}%)`);
    
    // Detailed breakdown
    if (existingKeys.length > 0) {
      console.log(`\n=== EXISTING KEYS BREAKDOWN ===`);
      
      // Group by translation count
      const translationGroups = {};
      existingKeys.forEach(item => {
        const count = item.translations;
        if (!translationGroups[count]) translationGroups[count] = [];
        translationGroups[count].push(item.key);
      });
      
      Object.keys(translationGroups).sort((a,b) => b-a).forEach(count => {
        console.log(`${count} translations: ${translationGroups[count].length} keys`);
        translationGroups[count].forEach(key => console.log(`  - ${key}`));
      });
      
      // Group by category
      const categoryGroups = {};
      existingKeys.forEach(item => {
        const cat = item.category || 'uncategorized';
        if (!categoryGroups[cat]) categoryGroups[cat] = [];
        categoryGroups[cat].push(item.key);
      });
      
      console.log(`\n=== EXISTING KEYS BY CATEGORY ===`);
      Object.keys(categoryGroups).forEach(category => {
        console.log(`${category}: ${categoryGroups[category].length} keys`);
      });
    }
    
    if (missingKeys.length > 0) {
      console.log(`\n=== MISSING KEYS FOR CREATION ===`);
      missingKeys.forEach((key, index) => {
        console.log(`${index + 1}. ${key}`);
      });
      
      console.log(`\n=== CREATION SCRIPT NEEDED ===`);
      console.log(`Need to create ${missingKeys.length} database entries with EN/HE/RU translations`);
      console.log(`Total translations to create: ${missingKeys.length * 3} entries`);
    }
    
    // Phase comparison with Phase 9
    console.log(`\n=== PHASE COMPARISON ===`);
    console.log(`Phase 9 (Cooperation): 13 keys, 85% existing coverage`);
    console.log(`Phase 10 (Contacts): ${contactsKeys.length} keys, ${Math.round(existingKeys.length/contactsKeys.length*100)}% existing coverage`);
    console.log(`Complexity increase: ${Math.round((contactsKeys.length/13)*100)}% more keys than Phase 9`);
    
    return {
      total: contactsKeys.length,
      existing: existingKeys.length,
      missing: missingKeys.length,
      missingKeys: missingKeys,
      existingKeys: existingKeys
    };
    
  } catch (error) {
    console.error('Database verification error:', error.message);
    throw error;
  } finally {
    await pool.end();
  }
}

// Execute verification
verifyContactsPhase10Keys()
  .then(result => {
    console.log(`\n=== VERIFICATION COMPLETE ===`);
    console.log(`Database coverage: ${Math.round(result.existing/result.total*100)}%`);
    process.exit(0);
  })
  .catch(error => {
    console.error('Verification failed:', error.message);
    process.exit(1);
  });
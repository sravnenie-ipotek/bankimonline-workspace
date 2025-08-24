#!/usr/bin/env node

/**
 * Map existing JSON translations to new database content keys
 * This bridges the gap between old JSON structure and new database structure
 */

require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const CONTENT_DB_URL = process.env.CONTENT_DATABASE_URL || 'postgresql://postgres:SuFkUevgonaZFXJiJeczFiXYTlICHVJL@shortline.proxy.rlwy.net:33452/railway';

const pool = new Pool({ connectionString: CONTENT_DB_URL, ssl: false });

// Load JSON translations
function loadJSONTranslations() {
  const translations = {};
  const languages = ['en', 'he', 'ru'];
  
  for (const lang of languages) {
    const filePath = path.resolve(__dirname, `../translations/${lang}.json`);
    try {
      const raw = fs.readFileSync(filePath, 'utf-8');
      translations[lang] = JSON.parse(raw);
      console.log(`Loaded ${lang} with ${Object.keys(translations[lang]).length} keys`);
    } catch (e) {
      console.error(`Failed to load ${lang}:`, e.message);
      process.exit(1);
    }
  }
  return translations;
}

// Create mapping from old JSON keys to new database keys
function createKeyMapping() {
  const mapping = {
    // Credit refinancing mappings
    'credit_refi_step1.item_1': 'calculate_credit_amount',
    'credit_refi_step1.item_2': 'calculate_credit_amount_ph',
    'credit_refi_step1.item_3': 'bank_offers_credit_amount',
    'credit_refi_step1.item_4': 'bank_offers_credit_payment',
    'credit_refi_step1.item_5': 'bank_offers_credit_rate',
    'credit_refi_step1.item_6': 'bank_offers_credit_total',
    'credit_refi_step1.item_7': 'calculate_credit_banner_subtitle',
    'credit_refi_step1.item_8': 'amount_credit_title',
    
    // Credit personal data mappings
    'credit_personal_data.item_1': 'personal_data_first_name',
    'credit_personal_data.item_2': 'personal_data_last_name',
    'credit_personal_data.item_3': 'personal_data_email',
    'credit_personal_data.item_4': 'personal_data_phone',
    'credit_personal_data.item_5': 'personal_data_id_number',
    'credit_personal_data.item_6': 'personal_data_address',
    'credit_personal_data.item_7': 'personal_data_city',
    'credit_personal_data.item_8': 'personal_data_postal_code',
    'credit_personal_data.item_9': 'personal_data_date_of_birth',
    'credit_personal_data.item_10': 'personal_data_nationality',
    
    // Credit income employed mappings
    'credit_income_employed.item_1': 'employment_status',
    'credit_income_employed.item_2': 'employer_name',
    'credit_income_employed.item_3': 'position',
    'credit_income_employed.item_4': 'monthly_salary',
    'credit_income_employed.item_5': 'work_experience',
    'credit_income_employed.item_6': 'employment_start_date',
    'credit_income_employed.item_7': 'work_address',
    'credit_income_employed.item_8': 'industry',
    'credit_income_employed.item_9': 'employment_type',
    'credit_income_employed.item_10': 'additional_income',
    
    // Credit registration page mappings
    'credit_registration_page.item_1': 'credit_amount',
    'credit_registration_page.item_2': 'credit_purpose',
    'credit_registration_page.item_3': 'employment_type',
    'credit_registration_page.item_4': 'monthly_income',
    'credit_registration_page.item_5': 'company_name',
    'credit_registration_page.item_6': 'position',
    'credit_registration_page.item_7': 'work_experience',
    'credit_registration_page.item_8': 'additional_income',
    'credit_registration_page.item_9': 'monthly_expenses',
    'credit_registration_page.item_10': 'credit_history',
    
    // Credit refi step2 mappings
    'credit_refi_step2.item_1': 'current_loan_amount',
    'credit_refi_step2.item_2': 'current_interest_rate',
    'credit_refi_step2.item_3': 'monthly_payment',
    'credit_refi_step2.item_4': 'remaining_term',
    'credit_refi_step2.item_5': 'refinancing_purpose',
    'credit_refi_step2.item_6': 'employment_status',
    'credit_refi_step2.item_7': 'monthly_income',
    'credit_refi_step2.item_8': 'employer_name',
    'credit_refi_step2.item_9': 'work_address',
    'credit_refi_step2.item_10': 'employment_start_date',
    
    // Credit refi program selection mappings
    'credit_refi_program_selection.item_1': 'property_value',
    'credit_refi_program_selection.item_2': 'property_address',
    'credit_refi_program_selection.item_3': 'property_type',
    'credit_refi_program_selection.item_4': 'down_payment',
    'credit_refi_program_selection.item_5': 'loan_term',
    
    // Credit refi registration mappings
    'credit_refi_registration.item_1': 'first_name',
    'credit_refi_registration.item_2': 'last_name',
    'credit_refi_registration.item_3': 'email',
    'credit_refi_registration.item_4': 'phone',
    'credit_refi_registration.item_5': 'password',
    'credit_refi_registration.item_6': 'confirm_password',
    'credit_refi_registration.item_7': 'id_number',
    'credit_refi_registration.item_8': 'date_of_birth',
    'credit_refi_registration.item_9': 'address',
    'credit_refi_registration.item_10': 'city',
    
    // Credit refi phone verification mappings
    'credit_refi_phone_verification.item_1': 'verification_code',
    'credit_refi_phone_verification.item_2': 'phone_verification',
    'credit_refi_phone_verification.item_3': 'resend_code',
    'credit_refi_phone_verification.item_4': 'verify_phone',
    'credit_refi_phone_verification.item_5': 'phone_confirmed',
    
    // General form field mappings
    'form_submit': 'submit',
    'form_cancel': 'cancel',
    'form_next': 'next',
    'form_previous': 'previous',
    'form_save': 'save',
    'form_continue': 'continue',
    'form_back': 'back',
    'form_skip': 'skip',
    
    // Error message mappings
    'error_required': 'field_required',
    'error_invalid': 'field_invalid',
    'error_min_length': 'field_too_short',
    'error_max_length': 'field_too_long',
    'error_email': 'invalid_email',
    'error_phone': 'invalid_phone',
    'error_id_number': 'invalid_id_number',
    
    // Validation message mappings
    'validation_required': 'field_required',
    'validation_email': 'invalid_email',
    'validation_phone': 'invalid_phone',
    'validation_id_number': 'invalid_id_number',
    'validation_password': 'invalid_password',
    'validation_confirm_password': 'passwords_dont_match'
  };
  
  return mapping;
}

async function populateFromJSONMapping() {
  console.log('🚀 Mapping JSON translations to database content keys...');
  
  const translations = loadJSONTranslations();
  const keyMapping = createKeyMapping();
  
  // Get missing content items
  const missingSQL = `
    SELECT ci.id, ci.content_key
    FROM content_items ci
    LEFT JOIN content_translations ct ON ci.id = ct.content_item_id
    WHERE ct.id IS NULL
    ORDER BY ci.id
  `;
  
  console.log('Executing SQL query...');
  const { rows } = await pool.query(missingSQL);
  console.log(`Found ${rows.length} content items without translations`);
  if (rows.length > 0) {
    console.log('First few items:', rows.slice(0, 3).map(r => r.content_key));
  }
  
  let inserted = 0;
  let mapped = 0;
  
  for (const row of rows) {
    const { id, content_key } = row;
    
    // Check if we have a mapping for this content key
    const jsonKey = keyMapping[content_key];
    if (!jsonKey) {
      console.log(`⚠️ No mapping found for: ${content_key}`);
      continue;
    }
    
    // Get translations for all languages
    const valuesByLang = {};
    for (const lang of ['en', 'he', 'ru']) {
      const val = translations[lang][jsonKey];
      if (val) {
        valuesByLang[lang] = val;
      }
    }
    
    // Insert translations if we have any
    if (Object.keys(valuesByLang).length > 0) {
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        
        for (const [lang, text] of Object.entries(valuesByLang)) {
          await client.query(
            `INSERT INTO content_translations (content_item_id, language_code, field_name, content_value, status)
             VALUES ($1, $2, 'text', $3, 'approved')
             ON CONFLICT (content_item_id, language_code, field_name) DO UPDATE
             SET content_value = EXCLUDED.content_value, status = 'approved', updated_at = CURRENT_TIMESTAMP`,
            [id, lang, text]
          );
        }
        
        await client.query('COMMIT');
        inserted += Object.keys(valuesByLang).length;
        mapped++;
        
        console.log(`✅ Mapped ${content_key} → ${jsonKey} (${Object.keys(valuesByLang).length} languages)`);
        
      } catch (e) {
        await client.query('ROLLBACK');
        console.error(`❌ Failed to insert for ${content_key}:`, e.message);
      } finally {
        client.release();
      }
    }
  }
  
  console.log(`\n📊 Summary:`);
  console.log(`✅ Mapped ${mapped} content items`);
  console.log(`✅ Inserted ${inserted} translation rows`);
  console.log(`⚠️ ${rows.length - mapped} items still need manual translation`);
  
  await pool.end();
  console.log('Done. Remember to clear API cache.');
}

if (require.main === module) {
  populateFromJSONMapping().catch(err => {
    console.error('Fatal:', err);
    process.exit(1);
  });
}

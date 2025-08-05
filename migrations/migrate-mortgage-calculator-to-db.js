const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Database connection configuration
const pool = new Pool({
  connectionString: process.env.CONTENT_DATABASE_URL || 'postgresql://postgres:SuFkUevgonaZFXJiJeczFiXYTlICHVJL@shortline.proxy.rlwy.net:33452/railway',
  ssl: {
    rejectUnauthorized: false
  }
});

// Load translation files
const enTranslations = JSON.parse(fs.readFileSync(path.join(__dirname, '../mainapp/public/locales/en/translation.json'), 'utf8'));
const heTranslations = JSON.parse(fs.readFileSync(path.join(__dirname, '../mainapp/public/locales/he/translation.json'), 'utf8'));
const ruTranslations = JSON.parse(fs.readFileSync(path.join(__dirname, '../mainapp/public/locales/ru/translation.json'), 'utf8'));

// Define all mortgage calculator content items
const mortgageCalculatorContent = [
  // Headers and Titles
  {
    content_key: 'mortgage_calculation.header.title',
    screen_location: 'mortgage_calculation',
    component_type: 'header',
    category: 'headers',
    migration_status: 'new',
    translation_key: 'calculate_mortgage'
  },
  {
    content_key: 'mortgage_calculation.header.calculator_title',
    screen_location: 'mortgage_calculation',
    component_type: 'header',
    category: 'headers',
    migration_status: 'new',
    translation_key: 'calculate_mortgage_calculator'
  },
  {
    content_key: 'mortgage_calculation.header.filter_title',
    screen_location: 'mortgage_calculation',
    component_type: 'header',
    category: 'headers',
    migration_status: 'new',
    translation_key: 'calculate_mortgage_filter_title'
  },
  {
    content_key: 'mortgage_calculation.video.title',
    screen_location: 'mortgage_calculation',
    component_type: 'header',
    category: 'headers',
    migration_status: 'new',
    translation_key: 'video_calculate_mortgage_title'
  },
  
  // Banner and Subtitles
  {
    content_key: 'mortgage_calculation.banner.subtext',
    screen_location: 'mortgage_calculation',
    component_type: 'text',
    category: 'descriptions',
    migration_status: 'new',
    translation_key: 'calculate_mortgage_banner_subtext'
  },
  
  // Section Headers
  {
    content_key: 'mortgage_calculation.section.parameters',
    screen_location: 'mortgage_calculation',
    component_type: 'section_header',
    category: 'headers',
    migration_status: 'new',
    translation_key: 'calculate_mortgage_parameters'
  },
  {
    content_key: 'mortgage_calculation.section.parameters_initial',
    screen_location: 'mortgage_calculation',
    component_type: 'section_header',
    category: 'headers',
    migration_status: 'new',
    translation_key: 'calculate_mortgage_parameters_initial'
  },
  {
    content_key: 'mortgage_calculation.section.profile_title',
    screen_location: 'mortgage_calculation',
    component_type: 'section_header',
    category: 'headers',
    migration_status: 'new',
    translation_key: 'calculate_mortgage_profile_title'
  },
  
  // Form Field Labels
  {
    content_key: 'mortgage_calculation.field.property_price',
    screen_location: 'mortgage_calculation',
    component_type: 'field_label',
    category: 'labels',
    migration_status: 'new',
    translation_key: 'calculate_mortgage_price'
  },
  {
    content_key: 'mortgage_calculation.field.initial_fee',
    screen_location: 'mortgage_calculation',
    component_type: 'field_label',
    category: 'labels',
    migration_status: 'new',
    translation_key: 'calculate_mortgage_initial_fee'
  },
  {
    content_key: 'mortgage_calculation.field.period',
    screen_location: 'mortgage_calculation',
    component_type: 'field_label',
    category: 'labels',
    migration_status: 'new',
    translation_key: 'calculate_mortgage_period'
  },
  {
    content_key: 'mortgage_calculation.field.monthly_payment',
    screen_location: 'mortgage_calculation',
    component_type: 'field_label',
    category: 'labels',
    migration_status: 'new',
    translation_key: 'calculate_mortgage_monthly_payment'
  },
  {
    content_key: 'mortgage_calculation.field.city',
    screen_location: 'mortgage_calculation',
    component_type: 'field_label',
    category: 'labels',
    migration_status: 'new',
    translation_key: 'calculate_mortgage_city'
  },
  
  // Property Ownership Dropdown
  {
    content_key: 'mortgage_calculation.field.property_ownership',
    screen_location: 'mortgage_calculation',
    component_type: 'field_label',
    category: 'labels',
    migration_status: 'new',
    translation_key: 'calculate_mortgage_property_ownership'
  },
  {
    content_key: 'mortgage_calculation.field.property_ownership_ph',
    screen_location: 'mortgage_calculation',
    component_type: 'placeholder',
    category: 'placeholders',
    migration_status: 'new',
    translation_key: 'calculate_mortgage_property_ownership_ph'
  },
  {
    content_key: 'mortgage_calculation.field.property_ownership_option_1',
    screen_location: 'mortgage_calculation',
    component_type: 'option',
    category: 'options',
    migration_status: 'new',
    translation_key: 'calculate_mortgage_property_ownership_option_1'
  },
  {
    content_key: 'mortgage_calculation.field.property_ownership_option_2',
    screen_location: 'mortgage_calculation',
    component_type: 'option',
    category: 'options',
    migration_status: 'new',
    translation_key: 'calculate_mortgage_property_ownership_option_2'
  },
  {
    content_key: 'mortgage_calculation.field.property_ownership_option_3',
    screen_location: 'mortgage_calculation',
    component_type: 'option',
    category: 'options',
    migration_status: 'new',
    translation_key: 'calculate_mortgage_property_ownership_option_3'
  },
  
  // Property Type Dropdown
  {
    content_key: 'mortgage_calculation.field.type',
    screen_location: 'mortgage_calculation',
    component_type: 'field_label',
    category: 'labels',
    migration_status: 'new',
    translation_key: 'calculate_mortgage_type'
  },
  {
    content_key: 'mortgage_calculation.field.type_ph',
    screen_location: 'mortgage_calculation',
    component_type: 'placeholder',
    category: 'placeholders',
    migration_status: 'new',
    translation_key: 'calculate_mortgage_type_ph'
  },
  {
    content_key: 'mortgage_calculation.field.type_option_1',
    screen_location: 'mortgage_calculation',
    component_type: 'option',
    category: 'options',
    migration_status: 'new',
    translation_key: 'calculate_mortgage_type_options_1'
  },
  {
    content_key: 'mortgage_calculation.field.type_option_2',
    screen_location: 'mortgage_calculation',
    component_type: 'option',
    category: 'options',
    migration_status: 'new',
    translation_key: 'calculate_mortgage_type_options_2'
  },
  {
    content_key: 'mortgage_calculation.field.type_option_3',
    screen_location: 'mortgage_calculation',
    component_type: 'option',
    category: 'options',
    migration_status: 'new',
    translation_key: 'calculate_mortgage_type_options_3'
  },
  {
    content_key: 'mortgage_calculation.field.type_option_4',
    screen_location: 'mortgage_calculation',
    component_type: 'option',
    category: 'options',
    migration_status: 'new',
    translation_key: 'calculate_mortgage_type_options_4'
  },
  {
    content_key: 'mortgage_calculation.field.type_option_5',
    screen_location: 'mortgage_calculation',
    component_type: 'option',
    category: 'options',
    migration_status: 'new',
    translation_key: 'calculate_mortgage_type_options_5'
  },
  
  // First Home Dropdown
  {
    content_key: 'mortgage_calculation.field.first_home',
    screen_location: 'mortgage_calculation',
    component_type: 'field_label',
    category: 'labels',
    migration_status: 'new',
    translation_key: 'calculate_mortgage_first'
  },
  {
    content_key: 'mortgage_calculation.field.first_home_ph',
    screen_location: 'mortgage_calculation',
    component_type: 'placeholder',
    category: 'placeholders',
    migration_status: 'new',
    translation_key: 'calculate_mortgage_first_ph'
  },
  {
    content_key: 'mortgage_calculation.field.first_home_option_1',
    screen_location: 'mortgage_calculation',
    component_type: 'option',
    category: 'options',
    migration_status: 'new',
    translation_key: 'calculate_mortgage_first_options_1'
  },
  {
    content_key: 'mortgage_calculation.field.first_home_option_2',
    screen_location: 'mortgage_calculation',
    component_type: 'option',
    category: 'options',
    migration_status: 'new',
    translation_key: 'calculate_mortgage_first_options_2'
  },
  {
    content_key: 'mortgage_calculation.field.first_home_option_3',
    screen_location: 'mortgage_calculation',
    component_type: 'option',
    category: 'options',
    migration_status: 'new',
    translation_key: 'calculate_mortgage_first_options_3'
  },
  
  // Timeline Dropdown
  {
    content_key: 'mortgage_calculation.field.when_needed',
    screen_location: 'mortgage_calculation',
    component_type: 'field_label',
    category: 'labels',
    migration_status: 'new',
    translation_key: 'calculate_mortgage_when'
  },
  {
    content_key: 'mortgage_calculation.field.when_needed_ph',
    screen_location: 'mortgage_calculation',
    component_type: 'placeholder',
    category: 'placeholders',
    migration_status: 'new',
    translation_key: 'calculate_mortgage_when_options_ph'
  },
  {
    content_key: 'mortgage_calculation.field.when_needed_option_1',
    screen_location: 'mortgage_calculation',
    component_type: 'option',
    category: 'options',
    migration_status: 'new',
    translation_key: 'calculate_mortgage_when_options_1'
  },
  {
    content_key: 'mortgage_calculation.field.when_needed_option_2',
    screen_location: 'mortgage_calculation',
    component_type: 'option',
    category: 'options',
    migration_status: 'new',
    translation_key: 'calculate_mortgage_when_options_2'
  },
  {
    content_key: 'mortgage_calculation.field.when_needed_option_3',
    screen_location: 'mortgage_calculation',
    component_type: 'option',
    category: 'options',
    migration_status: 'new',
    translation_key: 'calculate_mortgage_when_options_3'
  },
  {
    content_key: 'mortgage_calculation.field.when_needed_option_4',
    screen_location: 'mortgage_calculation',
    component_type: 'option',
    category: 'options',
    migration_status: 'new',
    translation_key: 'calculate_mortgage_when_options_4'
  },
  
  // Buttons
  {
    content_key: 'mortgage_calculation.button.show_offers',
    screen_location: 'mortgage_calculation',
    component_type: 'button',
    category: 'buttons',
    migration_status: 'new',
    translation_key: 'show_offers'
  },
  {
    content_key: 'mortgage_calculation.button.add_partner',
    screen_location: 'mortgage_calculation',
    component_type: 'button',
    category: 'buttons',
    migration_status: 'new',
    translation_key: 'calculate_mortgage_add_partner'
  },
  
  // Personal Information Fields
  {
    content_key: 'mortgage_calculation.field.name_surname',
    screen_location: 'mortgage_calculation',
    component_type: 'field_label',
    category: 'labels',
    migration_status: 'new',
    translation_key: 'calculate_mortgage_name_surname'
  },
  {
    content_key: 'mortgage_calculation.field.name_surname_ph',
    screen_location: 'mortgage_calculation',
    component_type: 'placeholder',
    category: 'placeholders',
    migration_status: 'new',
    translation_key: 'calculate_mortgage_name_surname_ph'
  },
  {
    content_key: 'mortgage_calculation.field.birth_date',
    screen_location: 'mortgage_calculation',
    component_type: 'field_label',
    category: 'labels',
    migration_status: 'new',
    translation_key: 'calculate_mortgage_birth_date'
  },
  
  // Education Dropdown
  {
    content_key: 'mortgage_calculation.field.education',
    screen_location: 'mortgage_calculation',
    component_type: 'field_label',
    category: 'labels',
    migration_status: 'new',
    translation_key: 'calculate_mortgage_education'
  },
  {
    content_key: 'mortgage_calculation.field.education_ph',
    screen_location: 'mortgage_calculation',
    component_type: 'placeholder',
    category: 'placeholders',
    migration_status: 'new',
    translation_key: 'calculate_mortgage_education_ph'
  },
  // Add education options 1-7
  ...Array.from({ length: 7 }, (_, i) => ({
    content_key: `mortgage_calculation.field.education_option_${i + 1}`,
    screen_location: 'mortgage_calculation',
    component_type: 'option',
    category: 'options',
    migration_status: 'new',
    translation_key: `calculate_mortgage_education_option_${i + 1}`
  })),
  
  // Marital Status Dropdown
  {
    content_key: 'mortgage_calculation.field.family_status',
    screen_location: 'mortgage_calculation',
    component_type: 'field_label',
    category: 'labels',
    migration_status: 'new',
    translation_key: 'calculate_mortgage_family_status'
  },
  {
    content_key: 'mortgage_calculation.field.family_status_ph',
    screen_location: 'mortgage_calculation',
    component_type: 'placeholder',
    category: 'placeholders',
    migration_status: 'new',
    translation_key: 'calculate_mortgage_family_status_ph'
  },
  // Add family status options 1-6
  ...Array.from({ length: 6 }, (_, i) => ({
    content_key: `mortgage_calculation.field.family_status_option_${i + 1}`,
    screen_location: 'mortgage_calculation',
    component_type: 'option',
    category: 'options',
    migration_status: 'new',
    translation_key: `calculate_mortgage_family_status_option_${i + 1}`
  })),
  
  // Employment Income Fields
  {
    content_key: 'mortgage_calculation.field.company',
    screen_location: 'mortgage_calculation',
    component_type: 'field_label',
    category: 'labels',
    migration_status: 'new',
    translation_key: 'calculate_mortgage_company'
  },
  {
    content_key: 'mortgage_calculation.field.profession',
    screen_location: 'mortgage_calculation',
    component_type: 'field_label',
    category: 'labels',
    migration_status: 'new',
    translation_key: 'calculate_mortgage_profession'
  },
  {
    content_key: 'mortgage_calculation.field.profession_ph',
    screen_location: 'mortgage_calculation',
    component_type: 'placeholder',
    category: 'placeholders',
    migration_status: 'new',
    translation_key: 'calculate_mortgage_profession_ph'
  },
  {
    content_key: 'mortgage_calculation.field.start_date',
    screen_location: 'mortgage_calculation',
    component_type: 'field_label',
    category: 'labels',
    migration_status: 'new',
    translation_key: 'calculate_mortgage_start_date'
  },
  {
    content_key: 'mortgage_calculation.field.monthly_income',
    screen_location: 'mortgage_calculation',
    component_type: 'field_label',
    category: 'labels',
    migration_status: 'new',
    translation_key: 'calculate_mortgage_monthly_income'
  },
  {
    content_key: 'mortgage_calculation.field.monthly_income_ph',
    screen_location: 'mortgage_calculation',
    component_type: 'placeholder',
    category: 'placeholders',
    migration_status: 'new',
    translation_key: 'calculate_mortgage_monthly_income_ph'
  },
  {
    content_key: 'mortgage_calculation.field.monthly_income_hint',
    screen_location: 'mortgage_calculation',
    component_type: 'hint',
    category: 'hints',
    migration_status: 'new',
    translation_key: 'calculate_mortgage_monthly_income_hint'
  },
  
  // Main Income Source Dropdown
  {
    content_key: 'mortgage_calculation.field.main_source',
    screen_location: 'mortgage_calculation',
    component_type: 'field_label',
    category: 'labels',
    migration_status: 'new',
    translation_key: 'calculate_mortgage_main_source'
  },
  {
    content_key: 'mortgage_calculation.field.main_source_ph',
    screen_location: 'mortgage_calculation',
    component_type: 'placeholder',
    category: 'placeholders',
    migration_status: 'new',
    translation_key: 'calculate_mortgage_main_source_ph'
  },
  // Add main source options 1-7
  ...Array.from({ length: 7 }, (_, i) => ({
    content_key: `mortgage_calculation.field.main_source_option_${i + 1}`,
    screen_location: 'mortgage_calculation',
    component_type: 'option',
    category: 'options',
    migration_status: 'new',
    translation_key: `calculate_mortgage_main_source_option_${i + 1}`
  })),
  
  // Professional Field Dropdown
  {
    content_key: 'mortgage_calculation.field.sphere',
    screen_location: 'mortgage_calculation',
    component_type: 'field_label',
    category: 'labels',
    migration_status: 'new',
    translation_key: 'calculate_mortgage_sphere'
  },
  // Add sphere options 1-10
  ...Array.from({ length: 10 }, (_, i) => ({
    content_key: `mortgage_calculation.field.sphere_option_${i + 1}`,
    screen_location: 'mortgage_calculation',
    component_type: 'option',
    category: 'options',
    migration_status: 'new',
    translation_key: `calculate_mortgage_sphere_option_${i + 1}`
  })),
  
  // Additional Income Dropdown
  {
    content_key: 'mortgage_calculation.field.has_additional',
    screen_location: 'mortgage_calculation',
    component_type: 'field_label',
    category: 'labels',
    migration_status: 'new',
    translation_key: 'calculate_mortgage_has_additional'
  },
  {
    content_key: 'mortgage_calculation.field.has_additional_ph',
    screen_location: 'mortgage_calculation',
    component_type: 'placeholder',
    category: 'placeholders',
    migration_status: 'new',
    translation_key: 'calculate_mortgage_has_additional_ph'
  },
  // Add additional income options 1-7
  ...Array.from({ length: 7 }, (_, i) => ({
    content_key: `mortgage_calculation.field.has_additional_option_${i + 1}`,
    screen_location: 'mortgage_calculation',
    component_type: 'option',
    category: 'options',
    migration_status: 'new',
    translation_key: `calculate_mortgage_has_additional_option_${i + 1}`
  })),
  
  // Debt Types Dropdown
  {
    content_key: 'mortgage_calculation.field.debt_types',
    screen_location: 'mortgage_calculation',
    component_type: 'field_label',
    category: 'labels',
    migration_status: 'new',
    translation_key: 'calculate_mortgage_debt_types'
  },
  {
    content_key: 'mortgage_calculation.field.debt_types_ph',
    screen_location: 'mortgage_calculation',
    component_type: 'placeholder',
    category: 'placeholders',
    migration_status: 'new',
    translation_key: 'calculate_mortgage_debt_types_ph'
  },
  // Add debt type options 1-5
  ...Array.from({ length: 5 }, (_, i) => ({
    content_key: `mortgage_calculation.field.debt_types_option_${i + 1}`,
    screen_location: 'mortgage_calculation',
    component_type: 'option',
    category: 'options',
    migration_status: 'new',
    translation_key: `calculate_mortgage_debt_types_option_${i + 1}`
  })),
  
  // Yes/No Questions
  {
    content_key: 'mortgage_calculation.field.citizenship',
    screen_location: 'mortgage_calculation',
    component_type: 'field_label',
    category: 'labels',
    migration_status: 'new',
    translation_key: 'calculate_mortgage_citizenship'
  },
  {
    content_key: 'mortgage_calculation.field.citizenship_ph',
    screen_location: 'mortgage_calculation',
    component_type: 'placeholder',
    category: 'placeholders',
    migration_status: 'new',
    translation_key: 'calculate_mortgage_citizenship_ph'
  },
  {
    content_key: 'mortgage_calculation.field.is_foreigner',
    screen_location: 'mortgage_calculation',
    component_type: 'field_label',
    category: 'labels',
    migration_status: 'new',
    translation_key: 'calculate_mortgage_is_foreigner'
  },
  {
    content_key: 'mortgage_calculation.field.is_medinsurance',
    screen_location: 'mortgage_calculation',
    component_type: 'field_label',
    category: 'labels',
    migration_status: 'new',
    translation_key: 'calculate_mortgage_is_medinsurance'
  },
  {
    content_key: 'mortgage_calculation.field.is_public',
    screen_location: 'mortgage_calculation',
    component_type: 'field_label',
    category: 'labels',
    migration_status: 'new',
    translation_key: 'calculate_mortgage_is_public'
  },
  {
    content_key: 'mortgage_calculation.field.tax',
    screen_location: 'mortgage_calculation',
    component_type: 'field_label',
    category: 'labels',
    migration_status: 'new',
    translation_key: 'calculate_mortgage_tax'
  },
  {
    content_key: 'mortgage_calculation.field.partner_pay_mortgage',
    screen_location: 'mortgage_calculation',
    component_type: 'field_label',
    category: 'labels',
    migration_status: 'new',
    translation_key: 'calculate_mortgage_partner_pay_mortgage'
  },
  
  // Other Fields
  {
    content_key: 'mortgage_calculation.field.borrowers',
    screen_location: 'mortgage_calculation',
    component_type: 'field_label',
    category: 'labels',
    migration_status: 'new',
    translation_key: 'calculate_mortgage_borrowers'
  },
  {
    content_key: 'mortgage_calculation.field.children18',
    screen_location: 'mortgage_calculation',
    component_type: 'field_label',
    category: 'labels',
    migration_status: 'new',
    translation_key: 'calculate_mortgage_children18'
  },
  {
    content_key: 'mortgage_calculation.field.how_much_childrens',
    screen_location: 'mortgage_calculation',
    component_type: 'field_label',
    category: 'labels',
    migration_status: 'new',
    translation_key: 'calculate_mortgage_how_much_childrens'
  },
  
  // Units and Misc
  {
    content_key: 'mortgage_calculation.units.period_min',
    screen_location: 'mortgage_calculation',
    component_type: 'text',
    category: 'units',
    migration_status: 'new',
    translation_key: 'calculate_mortgage_period_units_min'
  },
  {
    content_key: 'mortgage_calculation.units.period_max',
    screen_location: 'mortgage_calculation',
    component_type: 'text',
    category: 'units',
    migration_status: 'new',
    translation_key: 'calculate_mortgage_period_units_max'
  },
  {
    content_key: 'mortgage_calculation.units.months',
    screen_location: 'mortgage_calculation',
    component_type: 'text',
    category: 'units',
    migration_status: 'new',
    translation_key: 'calculate_mortgage_parameters_months'
  },
  {
    content_key: 'mortgage_calculation.text.cost',
    screen_location: 'mortgage_calculation',
    component_type: 'text',
    category: 'descriptions',
    migration_status: 'new',
    translation_key: 'calculate_mortgage_parameters_cost'
  },
  {
    content_key: 'mortgage_calculation.text.monthly_income_title',
    screen_location: 'mortgage_calculation',
    component_type: 'text',
    category: 'descriptions',
    migration_status: 'new',
    translation_key: 'calculate_mortgage_monthy_income_title'
  },
  
  // Context and Help Text
  {
    content_key: 'mortgage_calculation.help.step3_ctx',
    screen_location: 'mortgage_calculation',
    component_type: 'help_text',
    category: 'hints',
    migration_status: 'new',
    translation_key: 'calculate_mortgage_step3_ctx'
  },
  {
    content_key: 'mortgage_calculation.help.ctx',
    screen_location: 'mortgage_calculation',
    component_type: 'help_text',
    category: 'hints',
    migration_status: 'new',
    translation_key: 'calculate_mortgage_ctx'
  },
  {
    content_key: 'mortgage_calculation.help.ctx_1',
    screen_location: 'mortgage_calculation',
    component_type: 'help_text',
    category: 'hints',
    migration_status: 'new',
    translation_key: 'calculate_mortgage_ctx_1'
  },
  
  // Bank and End Date Fields
  {
    content_key: 'mortgage_calculation.field.bank',
    screen_location: 'mortgage_calculation',
    component_type: 'field_label',
    category: 'labels',
    migration_status: 'new',
    translation_key: 'calculate_mortgage_bank'
  },
  {
    content_key: 'mortgage_calculation.field.end_date',
    screen_location: 'mortgage_calculation',
    component_type: 'field_label',
    category: 'labels',
    migration_status: 'new',
    translation_key: 'calculate_mortgage_end_date'
  }
];

async function migrateContent() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    let totalInserted = 0;
    let totalSkipped = 0;
    
    console.log(`Starting migration of ${mortgageCalculatorContent.length} content items...`);
    
    for (const item of mortgageCalculatorContent) {
      try {
        // Check if content item already exists
        const existingCheck = await client.query(
          'SELECT id FROM content_items WHERE content_key = $1',
          [item.content_key]
        );
        
        if (existingCheck.rows.length > 0) {
          console.log(`Skipping existing content: ${item.content_key}`);
          totalSkipped++;
          continue;
        }
        
        // Insert into content_items
        const insertResult = await client.query(
          `INSERT INTO content_items (content_key, screen_location, component_type, category, migration_status, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
           RETURNING id`,
          [item.content_key, item.screen_location, item.component_type, item.category, item.migration_status]
        );
        
        const contentItemId = insertResult.rows[0].id;
        
        // Get translations from JSON files
        const enValue = enTranslations[item.translation_key] || item.translation_key;
        const heValue = heTranslations[item.translation_key] || item.translation_key;
        const ruValue = ruTranslations[item.translation_key] || item.translation_key;
        
        // Insert translations
        const languages = [
          { code: 'en', value: enValue },
          { code: 'he', value: heValue },
          { code: 'ru', value: ruValue }
        ];
        
        for (const lang of languages) {
          await client.query(
            `INSERT INTO content_translations (content_item_id, language_code, content_value, status, created_at, updated_at)
             VALUES ($1, $2, $3, 'approved', NOW(), NOW())`,
            [contentItemId, lang.code, lang.value]
          );
        }
        
        console.log(`✓ Migrated: ${item.content_key} (${item.translation_key})`);
        totalInserted++;
        
      } catch (error) {
        console.error(`Error migrating ${item.content_key}:`, error.message);
        throw error;
      }
    }
    
    await client.query('COMMIT');
    
    console.log(`\nMigration completed successfully!`);
    console.log(`Total items processed: ${mortgageCalculatorContent.length}`);
    console.log(`Inserted: ${totalInserted}`);
    console.log(`Skipped (already existing): ${totalSkipped}`);
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Migration failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the migration
migrateContent().catch(console.error);
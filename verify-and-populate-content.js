const { Client } = require('pg');
const fs = require('fs');
require('dotenv').config();

// Keys needed for Home Page based on the component usage
const HOME_PAGE_KEYS = [
    'title_compare',
    'compare_in_5minutes', 
    'show_offers',
    'calculate_mortgage',
    'refinance_mortgage',
    'calculate_credit',
    'refinance_credit',
    'fill_form',
    'how_it_works',
    'mortgage_calculator',
    'fill_form_text',
    'mortgage_calculator_text',
    'calculator_description',
    'fill_form_description'
];

// Keys for Mortgage Step 1
const MORTGAGE_STEP1_KEYS = [
    'calculate_mortgage_property_ownership',
    'calculate_mortgage_property_ownership_ph',
    'calculate_mortgage_property_ownership_option_1',
    'calculate_mortgage_property_ownership_option_2',
    'calculate_mortgage_property_ownership_option_3',
    'calculate_mortgage_city',
    'calculate_mortgage_price',
    'calculate_mortgage_when',
    'calculate_mortgage_when_options_ph',
    'calculate_mortgage_when_options_1',
    'calculate_mortgage_when_options_2',
    'calculate_mortgage_when_options_3',
    'calculate_mortgage_when_options_4',
    'calculate_mortgage_type',
    'calculate_mortgage_type_ph',
    'calculate_mortgage_type_options_1',
    'calculate_mortgage_type_options_2',
    'calculate_mortgage_type_options_3',
    'calculate_mortgage_type_options_4',
    'calculate_mortgage_first',
    'calculate_mortgage_first_ph',
    'calculate_mortgage_first_options_1',
    'calculate_mortgage_first_options_2',
    'calculate_mortgage_initial_fee',
    'calculate_mortgage_period',
    'calculate_mortgage_initial_payment'
];

// Read translations from JSON files for fallback
function loadTranslations() {
    try {
        const enTranslations = JSON.parse(fs.readFileSync('mainapp/public/locales/en/translation.json', 'utf8'));
        const heTranslations = JSON.parse(fs.readFileSync('mainapp/public/locales/he/translation.json', 'utf8'));
        const ruTranslations = JSON.parse(fs.readFileSync('mainapp/public/locales/ru/translation.json', 'utf8'));
        return { en: enTranslations, he: heTranslations, ru: ruTranslations };
    } catch (error) {
        console.error('⚠️ Error loading translation files:', error.message);
        return { en: {}, he: {}, ru: {} };
    }
}

async function verifyAndPopulateContent() {
    const contentClient = new Client({
        connectionString: process.env.CONTENT_DATABASE_URL
    });

    try {
        console.log('🔄 Connecting to content database...');
        await contentClient.connect();
        console.log('✅ Connected successfully\n');

        const translations = loadTranslations();
        
        // Check and populate Home Page content
        console.log('📋 Checking Home Page content...');
        await ensureContentForScreen(contentClient, 'home_page', HOME_PAGE_KEYS, translations);
        
        // Check and populate Mortgage Step 1 content
        console.log('\n📋 Checking Mortgage Step 1 content...');
        await ensureContentForScreen(contentClient, 'mortgage_step1', MORTGAGE_STEP1_KEYS, translations);
        
        // Check and populate Services Landing content
        console.log('\n📋 Checking Services Landing content...');
        const servicesKeys = [
            'calculate_mortgage',
            'refinance_mortgage',
            'calculate_credit', 
            'refinance_credit'
        ];
        await ensureContentForScreen(contentClient, 'services_landing', servicesKeys, translations);
        
        // Check and populate Credit Step 1 content
        console.log('\n📋 Checking Credit Step 1 content...');
        const creditKeys = MORTGAGE_STEP1_KEYS.map(key => key.replace('mortgage', 'credit'));
        await ensureContentForScreen(contentClient, 'credit_step1', creditKeys, translations);
        
        // Check and populate Contact Page content  
        console.log('\n📋 Checking Contact Page content...');
        const contactKeys = [
            'contact_title',
            'contact_subtitle',
            'contact_name',
            'contact_email',
            'contact_phone',
            'contact_message',
            'contact_submit'
        ];
        await ensureContentForScreen(contentClient, 'contact_page', contactKeys, translations);
        
        console.log('\n✅ Content verification and population completed');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    } finally {
        await contentClient.end();
    }
}

async function ensureContentForScreen(client, screenLocation, keys, translations) {
    let addedCount = 0;
    let existingCount = 0;
    
    for (const key of keys) {
        // Check if content item exists
        const checkResult = await client.query(
            `SELECT id FROM content_items WHERE content_key = $1`,
            [key]
        );
        
        let contentItemId;
        
        if (checkResult.rows.length === 0) {
            // Create content item
            const insertResult = await client.query(
                `INSERT INTO content_items (content_key, screen_location, component_type, category, is_active)
                 VALUES ($1, $2, $3, $4, true) 
                 RETURNING id`,
                [key, screenLocation, determineComponentType(key), 'interface', ]
            );
            contentItemId = insertResult.rows[0].id;
            console.log(`  ✅ Created content_item: ${key}`);
        } else {
            contentItemId = checkResult.rows[0].id;
            existingCount++;
        }
        
        // Ensure translations exist for all languages
        for (const lang of ['en', 'he', 'ru']) {
            const translationCheck = await client.query(
                `SELECT id FROM content_translations 
                 WHERE content_item_id = $1 AND language_code = $2`,
                [contentItemId, lang]
            );
            
            if (translationCheck.rows.length === 0) {
                // Get translation value from JSON or use fallback
                let translationValue = translations[lang][key] || 
                                     translations[lang][`app.${screenLocation}.${key}`] ||
                                     key; // Use key as last resort
                
                // Insert translation
                await client.query(
                    `INSERT INTO content_translations 
                     (content_item_id, language_code, content_value, status)
                     VALUES ($1, $2, $3, 'approved')`,
                    [contentItemId, lang, translationValue]
                );
                addedCount++;
                console.log(`    ✅ Added ${lang} translation for ${key}`);
            }
        }
    }
    
    console.log(`  📊 Summary: ${existingCount} existing items, ${addedCount} translations added`);
}

function determineComponentType(key) {
    if (key.includes('_ph')) return 'placeholder';
    if (key.includes('_option_')) return 'dropdown_option';
    if (key.includes('_title')) return 'title';
    if (key.includes('_text')) return 'text';
    if (key.includes('_button')) return 'button';
    return 'label';
}

verifyAndPopulateContent();
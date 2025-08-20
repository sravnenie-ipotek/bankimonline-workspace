const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function fixRefinanceTranslations() {
    const contentClient = new Client({
        connectionString: process.env.CONTENT_DATABASE_URL
    });

    console.log('🔧 Fixing Refinance Mortgage Translation Issues\n');
    console.log('=' .repeat(60));

    try {
        await contentClient.connect();
        
        // 1. Fix database content
        console.log('\n📋 Step 1: Adding missing database content...');
        
        // Add missing content items with proper screen location
        await contentClient.query(`
            INSERT INTO content_items (content_key, screen_location, component_type, category, is_active) VALUES
            -- Labels for dropdowns
            ('mortgage_refinance_why_label', 'refinance_step1', 'label', 'dropdown', true),
            ('mortgage_refinance_type_label', 'refinance_step1', 'label', 'dropdown', true),
            ('mortgage_refinance_registered_label', 'refinance_step1', 'label', 'dropdown', true),
            ('mortgage_refinance_bank_label', 'refinance_step1', 'label', 'dropdown', true),
            
            -- Placeholders
            ('mortgage_refinance_why_ph', 'refinance_step1', 'placeholder', 'dropdown', true),
            ('mortgage_refinance_type_ph', 'refinance_step1', 'placeholder', 'dropdown', true),
            ('mortgage_refinance_registered_ph', 'refinance_step1', 'placeholder', 'dropdown', true),
            ('mortgage_refinance_bank_ph', 'refinance_step1', 'placeholder', 'dropdown', true),
            
            -- Alternative keys that might be used
            ('app.refinance.step1.why_label', 'refinance_step1', 'label', 'dropdown', true),
            ('app.refinance.step1.property_type_label', 'refinance_step1', 'label', 'dropdown', true),
            ('app.refinance.step1.registered_label', 'refinance_step1', 'label', 'dropdown', true),
            ('app.refinance.step1.current_bank_label', 'refinance_step1', 'label', 'dropdown', true)
            
            ON CONFLICT (content_key) DO UPDATE SET 
                screen_location = EXCLUDED.screen_location,
                component_type = EXCLUDED.component_type,
                is_active = true
        `);
        console.log('✅ Content items added/updated');
        
        // Add translations for all languages
        console.log('\n📋 Step 2: Adding translations...');
        
        // English translations
        await contentClient.query(`
            INSERT INTO content_translations (content_item_id, language_code, content_value, status) VALUES
            -- Main labels
            ((SELECT id FROM content_items WHERE content_key = 'mortgage_refinance_why_label'), 'en', 'Why are you refinancing?', 'approved'),
            ((SELECT id FROM content_items WHERE content_key = 'mortgage_refinance_type_label'), 'en', 'Property Type', 'approved'),
            ((SELECT id FROM content_items WHERE content_key = 'mortgage_refinance_registered_label'), 'en', 'Property Registration', 'approved'),
            ((SELECT id FROM content_items WHERE content_key = 'mortgage_refinance_bank_label'), 'en', 'Current Bank', 'approved'),
            
            -- Placeholders
            ((SELECT id FROM content_items WHERE content_key = 'mortgage_refinance_why_ph'), 'en', 'Select reason for refinancing', 'approved'),
            ((SELECT id FROM content_items WHERE content_key = 'mortgage_refinance_type_ph'), 'en', 'Select property type', 'approved'),
            ((SELECT id FROM content_items WHERE content_key = 'mortgage_refinance_registered_ph'), 'en', 'Select registration status', 'approved'),
            ((SELECT id FROM content_items WHERE content_key = 'mortgage_refinance_bank_ph'), 'en', 'Select your current bank', 'approved'),
            
            -- Alternative keys
            ((SELECT id FROM content_items WHERE content_key = 'app.refinance.step1.why_label'), 'en', 'Why are you refinancing?', 'approved'),
            ((SELECT id FROM content_items WHERE content_key = 'app.refinance.step1.property_type_label'), 'en', 'Property Type', 'approved'),
            ((SELECT id FROM content_items WHERE content_key = 'app.refinance.step1.registered_label'), 'en', 'Property Registration', 'approved'),
            ((SELECT id FROM content_items WHERE content_key = 'app.refinance.step1.current_bank_label'), 'en', 'Current Bank', 'approved')
            
            ON CONFLICT (content_item_id, language_code) DO UPDATE SET 
                content_value = EXCLUDED.content_value,
                status = 'approved'
        `);
        
        // Hebrew translations
        await contentClient.query(`
            INSERT INTO content_translations (content_item_id, language_code, content_value, status) VALUES
            -- Main labels
            ((SELECT id FROM content_items WHERE content_key = 'mortgage_refinance_why_label'), 'he', 'למה אתה מבצע מחזור?', 'approved'),
            ((SELECT id FROM content_items WHERE content_key = 'mortgage_refinance_type_label'), 'he', 'סוג נכס', 'approved'),
            ((SELECT id FROM content_items WHERE content_key = 'mortgage_refinance_registered_label'), 'he', 'רישום נכס', 'approved'),
            ((SELECT id FROM content_items WHERE content_key = 'mortgage_refinance_bank_label'), 'he', 'בנק נוכחי', 'approved'),
            
            -- Placeholders
            ((SELECT id FROM content_items WHERE content_key = 'mortgage_refinance_why_ph'), 'he', 'בחר סיבה למחזור', 'approved'),
            ((SELECT id FROM content_items WHERE content_key = 'mortgage_refinance_type_ph'), 'he', 'בחר סוג נכס', 'approved'),
            ((SELECT id FROM content_items WHERE content_key = 'mortgage_refinance_registered_ph'), 'he', 'בחר סטטוס רישום', 'approved'),
            ((SELECT id FROM content_items WHERE content_key = 'mortgage_refinance_bank_ph'), 'he', 'בחר את הבנק הנוכחי', 'approved'),
            
            -- Alternative keys
            ((SELECT id FROM content_items WHERE content_key = 'app.refinance.step1.why_label'), 'he', 'למה אתה מבצע מחזור?', 'approved'),
            ((SELECT id FROM content_items WHERE content_key = 'app.refinance.step1.property_type_label'), 'he', 'סוג נכס', 'approved'),
            ((SELECT id FROM content_items WHERE content_key = 'app.refinance.step1.registered_label'), 'he', 'רישום נכס', 'approved'),
            ((SELECT id FROM content_items WHERE content_key = 'app.refinance.step1.current_bank_label'), 'he', 'בנק נוכחי', 'approved')
            
            ON CONFLICT (content_item_id, language_code) DO UPDATE SET 
                content_value = EXCLUDED.content_value,
                status = 'approved'
        `);
        
        // Russian translations
        await contentClient.query(`
            INSERT INTO content_translations (content_item_id, language_code, content_value, status) VALUES
            -- Main labels
            ((SELECT id FROM content_items WHERE content_key = 'mortgage_refinance_why_label'), 'ru', 'Почему вы рефинансируете?', 'approved'),
            ((SELECT id FROM content_items WHERE content_key = 'mortgage_refinance_type_label'), 'ru', 'Тип недвижимости', 'approved'),
            ((SELECT id FROM content_items WHERE content_key = 'mortgage_refinance_registered_label'), 'ru', 'Регистрация недвижимости', 'approved'),
            ((SELECT id FROM content_items WHERE content_key = 'mortgage_refinance_bank_label'), 'ru', 'Текущий банк', 'approved'),
            
            -- Placeholders
            ((SELECT id FROM content_items WHERE content_key = 'mortgage_refinance_why_ph'), 'ru', 'Выберите причину рефинансирования', 'approved'),
            ((SELECT id FROM content_items WHERE content_key = 'mortgage_refinance_type_ph'), 'ru', 'Выберите тип недвижимости', 'approved'),
            ((SELECT id FROM content_items WHERE content_key = 'mortgage_refinance_registered_ph'), 'ru', 'Выберите статус регистрации', 'approved'),
            ((SELECT id FROM content_items WHERE content_key = 'mortgage_refinance_bank_ph'), 'ru', 'Выберите ваш текущий банк', 'approved'),
            
            -- Alternative keys
            ((SELECT id FROM content_items WHERE content_key = 'app.refinance.step1.why_label'), 'ru', 'Почему вы рефинансируете?', 'approved'),
            ((SELECT id FROM content_items WHERE content_key = 'app.refinance.step1.property_type_label'), 'ru', 'Тип недвижимости', 'approved'),
            ((SELECT id FROM content_items WHERE content_key = 'app.refinance.step1.registered_label'), 'ru', 'Регистрация недвижимости', 'approved'),
            ((SELECT id FROM content_items WHERE content_key = 'app.refinance.step1.current_bank_label'), 'ru', 'Текущий банк', 'approved')
            
            ON CONFLICT (content_item_id, language_code) DO UPDATE SET 
                content_value = EXCLUDED.content_value,
                status = 'approved'
        `);
        
        console.log('✅ Translations added for all languages');
        
        // 2. Fix translation.json fallback
        console.log('\n📋 Step 3: Updating translation.json fallback files...');
        
        const languages = ['en', 'he', 'ru'];
        const translations = {
            en: {
                'mortgage_refinance_why': 'Why are you refinancing?',
                'mortgage_refinance_why_ph': 'Select reason for refinancing',
                'mortgage_refinance_type': 'Property Type',
                'mortgage_refinance_type_ph': 'Select property type',
                'mortgage_refinance_registered': 'Property Registration',
                'mortgage_refinance_registered_ph': 'Select registration status',
                'mortgage_refinance_bank': 'Current Bank',
                'mortgage_refinance_bank_ph': 'Select your current bank',
                'app.refinance.step1.why_label': 'Why are you refinancing?',
                'app.refinance.step1.property_type_label': 'Property Type',
                'app.refinance.step1.registered_label': 'Property Registration',
                'app.refinance.step1.current_bank_label': 'Current Bank',
                'app.refinance.step1.title': 'Mortgage Refinancing Application',
                'mortgage_refinance_balance': 'Current Mortgage Balance',
                'mortgage_refinance_left': 'Remaining Balance',
                'mortgage_refinance_price': 'Property Value'
            },
            he: {
                'mortgage_refinance_why': 'למה אתה מבצע מחזור?',
                'mortgage_refinance_why_ph': 'בחר סיבה למחזור',
                'mortgage_refinance_type': 'סוג נכס',
                'mortgage_refinance_type_ph': 'בחר סוג נכס',
                'mortgage_refinance_registered': 'רישום נכס',
                'mortgage_refinance_registered_ph': 'בחר סטטוס רישום',
                'mortgage_refinance_bank': 'בנק נוכחי',
                'mortgage_refinance_bank_ph': 'בחר את הבנק הנוכחי',
                'app.refinance.step1.why_label': 'למה אתה מבצע מחזור?',
                'app.refinance.step1.property_type_label': 'סוג נכס',
                'app.refinance.step1.registered_label': 'רישום נכס',
                'app.refinance.step1.current_bank_label': 'בנק נוכחי',
                'app.refinance.step1.title': 'בקשה למחזור משכנתא',
                'mortgage_refinance_balance': 'יתרת משכנתא נוכחית',
                'mortgage_refinance_left': 'יתרה שנותרה',
                'mortgage_refinance_price': 'שווי נכס'
            },
            ru: {
                'mortgage_refinance_why': 'Почему вы рефинансируете?',
                'mortgage_refinance_why_ph': 'Выберите причину рефинансирования',
                'mortgage_refinance_type': 'Тип недвижимости',
                'mortgage_refinance_type_ph': 'Выберите тип недвижимости',
                'mortgage_refinance_registered': 'Регистрация недвижимости',
                'mortgage_refinance_registered_ph': 'Выберите статус регистрации',
                'mortgage_refinance_bank': 'Текущий банк',
                'mortgage_refinance_bank_ph': 'Выберите ваш текущий банк',
                'app.refinance.step1.why_label': 'Почему вы рефинансируете?',
                'app.refinance.step1.property_type_label': 'Тип недвижимости',
                'app.refinance.step1.registered_label': 'Регистрация недвижимости',
                'app.refinance.step1.current_bank_label': 'Текущий банк',
                'app.refinance.step1.title': 'Заявка на рефинансирование ипотеки',
                'mortgage_refinance_balance': 'Текущий баланс ипотеки',
                'mortgage_refinance_left': 'Оставшийся баланс',
                'mortgage_refinance_price': 'Стоимость недвижимости'
            }
        };
        
        for (const lang of languages) {
            const filePath = path.join('mainapp', 'public', 'locales', lang, 'translation.json');
            
            if (fs.existsSync(filePath)) {
                const existingTranslations = JSON.parse(fs.readFileSync(filePath, 'utf8'));
                
                // Merge new translations
                Object.assign(existingTranslations, translations[lang]);
                
                // Write back
                fs.writeFileSync(filePath, JSON.stringify(existingTranslations, null, 2), 'utf8');
                console.log(`✅ Updated ${lang}/translation.json`);
            }
        }
        
        // 3. Verify the fix
        console.log('\n📋 Step 4: Verifying fixes...');
        
        const verifyResult = await contentClient.query(`
            SELECT 
                ci.content_key,
                ct.content_value
            FROM content_items ci
            JOIN content_translations ct ON ci.id = ct.content_item_id
            WHERE ci.screen_location = 'refinance_step1'
                AND ct.language_code = 'en'
                AND ci.content_key IN (
                    'mortgage_refinance_why_label',
                    'mortgage_refinance_type_label',
                    'mortgage_refinance_registered_label',
                    'mortgage_refinance_bank_label'
                )
        `);
        
        console.log(`✅ Verified ${verifyResult.rows.length} dropdown labels in database`);
        verifyResult.rows.forEach(row => {
            console.log(`  - ${row.content_key}: "${row.content_value}"`);
        });
        
        console.log('\n✅ All fixes applied successfully!');
        console.log('\n📋 Next steps:');
        console.log('  1. Clear the cache: curl -X POST http://localhost:8003/api/cache/clear');
        console.log('  2. Restart the frontend: cd mainapp && npm run dev');
        console.log('  3. Test the page: http://localhost:5174/services/refinance-mortgage/1');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error(error.stack);
    } finally {
        await contentClient.end();
    }
}

fixRefinanceTranslations();
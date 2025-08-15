#!/usr/bin/env node

/**
 * Create Missing Mortgage Dropdown Content
 * 
 * This script creates the missing mortgage dropdown content that should have been
 * migrated when the database was recreated. It creates both content_items and
 * content_translations for the two missing Hebrew dropdowns:
 * 
 * 1. "מתי תזדקק למשכנתא?" (when do you need mortgage)
 * 2. "האם מדובר בדירה ראשונה?" (is this a first home)
 */

const { Pool } = require('pg');

// Use Railway database connection for both development and production data sync
const pool = new Pool({ 
    connectionString: 'postgresql://postgres:SuFkUevgonaZFXJiJeczFiXYTlICHVJL@shortline.proxy.rlwy.net:33452/railway',
    ssl: { rejectUnauthorized: false }
});

async function createMortgageDropdownContent() {
    try {
        // 1. CREATE "WHEN NEEDED" DROPDOWN CONTENT
        // Insert content items for "when needed" dropdown
        const whenNeededItems = [
            {
                content_key: 'calculate_mortgage_when_needed',
                screen_location: 'mortgage_calculation', 
                component_type: 'label',
                category: 'dropdown'
            },
            {
                content_key: 'calculate_mortgage_when_needed_ph',
                screen_location: 'mortgage_calculation',
                component_type: 'placeholder', 
                category: 'dropdown'
            },
            {
                content_key: 'calculate_mortgage_when_needed_option_1',
                screen_location: 'mortgage_calculation',
                component_type: 'option',
                category: 'dropdown'
            },
            {
                content_key: 'calculate_mortgage_when_needed_option_2', 
                screen_location: 'mortgage_calculation',
                component_type: 'option',
                category: 'dropdown'
            },
            {
                content_key: 'calculate_mortgage_when_needed_option_3',
                screen_location: 'mortgage_calculation',
                component_type: 'option', 
                category: 'dropdown'
            },
            {
                content_key: 'calculate_mortgage_when_needed_option_4',
                screen_location: 'mortgage_calculation',
                component_type: 'option',
                category: 'dropdown'
            }
        ];
        
        for (const item of whenNeededItems) {
            await pool.query(`
                INSERT INTO content_items (content_key, screen_location, component_type, category, is_active) 
                VALUES ($1, $2, $3, $4, true)
                ON CONFLICT (content_key) DO NOTHING
            `, [item.content_key, item.screen_location, item.component_type, item.category]);
        }
        
        // 2. CREATE "FIRST HOME" DROPDOWN CONTENT
        const firstHomeItems = [
            {
                content_key: 'calculate_mortgage_first_home',
                screen_location: 'mortgage_calculation',
                component_type: 'label',
                category: 'dropdown'
            },
            {
                content_key: 'calculate_mortgage_first_home_ph',
                screen_location: 'mortgage_calculation', 
                component_type: 'placeholder',
                category: 'dropdown'
            },
            {
                content_key: 'calculate_mortgage_first_home_option_1',
                screen_location: 'mortgage_calculation',
                component_type: 'option',
                category: 'dropdown'
            },
            {
                content_key: 'calculate_mortgage_first_home_option_2',
                screen_location: 'mortgage_calculation',
                component_type: 'option', 
                category: 'dropdown'
            },
            {
                content_key: 'calculate_mortgage_first_home_option_3',
                screen_location: 'mortgage_calculation',
                component_type: 'option',
                category: 'dropdown'
            }
        ];
        
        for (const item of firstHomeItems) {
            await pool.query(`
                INSERT INTO content_items (content_key, screen_location, component_type, category, is_active) 
                VALUES ($1, $2, $3, $4, true)
                ON CONFLICT (content_key) DO NOTHING
            `, [item.content_key, item.screen_location, item.component_type, item.category]);
        }
        
        // 3. CREATE TRANSLATIONS
        // Get content item IDs
        const contentItems = await pool.query(`
            SELECT id, content_key 
            FROM content_items 
            WHERE content_key LIKE 'calculate_mortgage_%' 
                AND screen_location = 'mortgage_calculation'
        `);
        
        const itemMap = {};
        contentItems.rows.forEach(row => {
            itemMap[row.content_key] = row.id;
        });
        
        // Define translations
        const translations = [
            // WHEN NEEDED - Hebrew
            { key: 'calculate_mortgage_when_needed', lang: 'he', value: 'מתי תזדקק למשכנתא?' },
            { key: 'calculate_mortgage_when_needed_ph', lang: 'he', value: 'בחר מסגרת זמן' },
            { key: 'calculate_mortgage_when_needed_option_1', lang: 'he', value: 'תוך 3 חודשים' },
            { key: 'calculate_mortgage_when_needed_option_2', lang: 'he', value: '3-6 חודשים' },
            { key: 'calculate_mortgage_when_needed_option_3', lang: 'he', value: '6-12 חודשים' },
            { key: 'calculate_mortgage_when_needed_option_4', lang: 'he', value: 'מעל 12 חודשים' },
            
            // WHEN NEEDED - English
            { key: 'calculate_mortgage_when_needed', lang: 'en', value: 'When do you need the mortgage?' },
            { key: 'calculate_mortgage_when_needed_ph', lang: 'en', value: 'Select timeframe' },
            { key: 'calculate_mortgage_when_needed_option_1', lang: 'en', value: 'Within 3 months' },
            { key: 'calculate_mortgage_when_needed_option_2', lang: 'en', value: '3-6 months' },
            { key: 'calculate_mortgage_when_needed_option_3', lang: 'en', value: '6-12 months' },
            { key: 'calculate_mortgage_when_needed_option_4', lang: 'en', value: 'Over 12 months' },
            
            // WHEN NEEDED - Russian
            { key: 'calculate_mortgage_when_needed', lang: 'ru', value: 'Когда вам нужна ипотека?' },
            { key: 'calculate_mortgage_when_needed_ph', lang: 'ru', value: 'Выберите временные рамки' },
            { key: 'calculate_mortgage_when_needed_option_1', lang: 'ru', value: 'В течение 3 месяцев' },
            { key: 'calculate_mortgage_when_needed_option_2', lang: 'ru', value: '3-6 месяцев' },
            { key: 'calculate_mortgage_when_needed_option_3', lang: 'ru', value: '6-12 месяцев' },
            { key: 'calculate_mortgage_when_needed_option_4', lang: 'ru', value: 'Более 12 месяцев' },
            
            // FIRST HOME - Hebrew
            { key: 'calculate_mortgage_first_home', lang: 'he', value: 'האם מדובר בדירה ראשונה?' },
            { key: 'calculate_mortgage_first_home_ph', lang: 'he', value: 'בחר סטטוס הנכס' },
            { key: 'calculate_mortgage_first_home_option_1', lang: 'he', value: 'כן, דירה ראשונה' },
            { key: 'calculate_mortgage_first_home_option_2', lang: 'he', value: 'לא, יש לי נכס נוסף' },
            { key: 'calculate_mortgage_first_home_option_3', lang: 'he', value: 'השקעה' },
            
            // FIRST HOME - English
            { key: 'calculate_mortgage_first_home', lang: 'en', value: 'Is this a first home?' },
            { key: 'calculate_mortgage_first_home_ph', lang: 'en', value: 'Select property status' },
            { key: 'calculate_mortgage_first_home_option_1', lang: 'en', value: 'Yes, first home' },
            { key: 'calculate_mortgage_first_home_option_2', lang: 'en', value: 'No, I have additional property' },
            { key: 'calculate_mortgage_first_home_option_3', lang: 'en', value: 'Investment' },
            
            // FIRST HOME - Russian
            { key: 'calculate_mortgage_first_home', lang: 'ru', value: 'Это первый дом?' },
            { key: 'calculate_mortgage_first_home_ph', lang: 'ru', value: 'Выберите статус недвижимости' },
            { key: 'calculate_mortgage_first_home_option_1', lang: 'ru', value: 'Да, первый дом' },
            { key: 'calculate_mortgage_first_home_option_2', lang: 'ru', value: 'Нет, у меня есть дополнительная недвижимость' },
            { key: 'calculate_mortgage_first_home_option_3', lang: 'ru', value: 'Инвестиция' }
        ];
        
        // Insert translations
        for (const trans of translations) {
            const contentItemId = itemMap[trans.key];
            if (contentItemId) {
                await pool.query(`
                    INSERT INTO content_translations (content_item_id, language_code, content_value, status) 
                    VALUES ($1, $2, $3, 'approved')
                    ON CONFLICT (content_item_id, language_code) 
                    DO UPDATE SET content_value = $3
                `, [contentItemId, trans.lang, trans.value]);
            }
        }
        
        // 4. VERIFICATION
        const verification = await pool.query(`
            SELECT ci.content_key, ci.component_type, ct.language_code, ct.content_value
            FROM content_items ci
            JOIN content_translations ct ON ci.id = ct.content_item_id  
            WHERE ci.screen_location = 'mortgage_calculation'
                AND ci.content_key LIKE 'calculate_mortgage_%'
                AND ct.status = 'approved'
            ORDER BY ci.content_key, ct.language_code
        `);
        
        let currentKey = '';
        verification.rows.forEach(row => {
            if (row.content_key !== currentKey) {
                currentKey = row.content_key;
                :`);
            }
            });
        
        } catch (error) {
        console.error('❌ Error creating mortgage dropdown content:', error.message);
        throw error;
    } finally {
        await pool.end();
    }
}

// Run the migration
if (require.main === module) {
    createMortgageDropdownContent().catch(console.error);
}

module.exports = createMortgageDropdownContent;
#!/usr/bin/env node

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.CONTENT_DATABASE_URL || process.env.DATABASE_URL || 'postgresql://postgres:lgqPEzvVbSCviTybKqMbzJkYvOUetJjt@maglev.proxy.rlwy.net:43809/railway',
    ssl: { rejectUnauthorized: false }
});

async function executeQuery(query, description) {
    console.log(`\n🔄 ${description}...`);
    try {
        const result = await pool.query(query);
        console.log(`✅ ${description} completed successfully`);
        if (result.rows && result.rows.length > 0) {
            console.table(result.rows);
        } else {
            console.log('   No results found');
        }
        return result;
    } catch (error) {
        console.error(`❌ Error in ${description}:`, error.message);
        return null;
    }
}

async function checkMortgageCalculatorContent() {
    console.log('🔍 CHECKING MORTGAGE CALCULATOR CONTENT');
    console.log('========================================\n');
    
    // Check for mortgage calculator screen locations
    await executeQuery(`
        SELECT DISTINCT screen_location, COUNT(*) as field_count
        FROM content_items 
        WHERE screen_location LIKE '%mortgage%' OR screen_location LIKE '%calculate%'
        GROUP BY screen_location
        ORDER BY screen_location
    `, 'All mortgage/calculate related screen locations');
    
    // Check for specific mortgage calculator content
    await executeQuery(`
        SELECT 
            ci.content_key,
            ci.component_type,
            ci.screen_location,
            ct_he.content_value as hebrew_text,
            ct_en.content_value as english_text,
            ct_ru.content_value as russian_text
        FROM content_items ci
        LEFT JOIN content_translations ct_he ON ci.id = ct_he.content_item_id AND ct_he.language_code = 'he'
        LEFT JOIN content_translations ct_en ON ci.id = ct_en.content_item_id AND ct_en.language_code = 'en'
        LEFT JOIN content_translations ct_ru ON ci.id = ct_ru.content_item_id AND ct_ru.language_code = 'ru'
        WHERE (ci.content_key LIKE '%mortgage%' OR ci.content_key LIKE '%calculate%')
            AND (ct_he.content_value LIKE '%וידאו%' OR ct_he.content_value LIKE '%מחשבון%' OR ct_he.content_value LIKE '%משכנתא%')
        ORDER BY ci.content_key
        LIMIT 20
    `, 'Content containing Hebrew mortgage/calculator/video terms');
    
    // Check for calculate_mortgage_* fields specifically
    await executeQuery(`
        SELECT 
            ci.content_key,
            ci.component_type,
            ci.screen_location,
            ct_he.content_value as hebrew_text
        FROM content_items ci
        LEFT JOIN content_translations ct_he ON ci.id = ct_he.content_item_id AND ct_he.language_code = 'he'
        WHERE ci.content_key LIKE 'calculate_mortgage_%'
            AND ct_he.content_value IS NOT NULL
        ORDER BY ci.content_key
        LIMIT 10
    `, 'calculate_mortgage_* fields with Hebrew content');
    
    // Check for any content with "וידאו מחשבון משכנתה"
    await executeQuery(`
        SELECT 
            ci.content_key,
            ci.component_type,
            ci.screen_location,
            ct_he.content_value as hebrew_text,
            ct_en.content_value as english_text
        FROM content_items ci
        LEFT JOIN content_translations ct_he ON ci.id = ct_he.content_item_id AND ct_he.language_code = 'he'
        LEFT JOIN content_translations ct_en ON ci.id = ct_en.content_item_id AND ct_en.language_code = 'en'
        WHERE ct_he.content_value LIKE '%וידאו%' 
            AND ct_he.content_value LIKE '%מחשבון%'
            AND ct_he.content_value LIKE '%משכנתא%'
        ORDER BY ci.content_key
    `, 'Content containing "וידאו מחשבון משכנתה"');
    
    // Check for mortgage step1 content
    await executeQuery(`
        SELECT 
            ci.content_key,
            ci.component_type,
            ci.screen_location,
            ct_he.content_value as hebrew_text,
            ct_en.content_value as english_text
        FROM content_items ci
        LEFT JOIN content_translations ct_he ON ci.id = ct_he.content_item_id AND ct_he.language_code = 'he'
        LEFT JOIN content_translations ct_en ON ci.id = ct_en.content_item_id AND ct_en.language_code = 'en'
        WHERE ci.screen_location = 'mortgage_step1'
        ORDER BY ci.content_key
        LIMIT 10
    `, 'mortgage_step1 content');
    
    pool.end();
}

checkMortgageCalculatorContent().catch(error => {
    console.error('❌ Script failed:', error);
    pool.end();
    process.exit(1);
}); 
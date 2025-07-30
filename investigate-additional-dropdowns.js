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
        }
        return result;
    } catch (error) {
        console.error(`❌ Error in ${description}:`, error.message);
        return null;
    }
}

async function investigateAdditionalDropdowns() {
    console.log('🔍 INVESTIGATING ADDITIONAL DROPDOWN PROBLEMS');
    console.log('=============================================\n');
    
    // Check the specific problematic fields mentioned
    const problematicFields = [
        'calculate_mortgage_debt_types',
        'calculate_mortgage_family_status', 
        'calculate_mortgage_main_source',
        'calculate_mortgage_when',
        'calculate_mortgage_first'
    ];
    
    await executeQuery(`
        SELECT 
            ci.content_key,
            ci.component_type,
            ci.screen_location,
            COUNT(opt.id) as option_count,
            CASE 
                WHEN ci.component_type = 'dropdown' THEN '✅ CORRECT'
                WHEN ci.component_type = 'text' AND COUNT(opt.id) > 0 THEN '❌ NEEDS FIX'
                WHEN ci.component_type = 'text' AND COUNT(opt.id) = 0 THEN '⚠️ TEXT WITH NO OPTIONS'
                ELSE '❓ UNKNOWN'
            END as status
        FROM content_items ci
        LEFT JOIN content_items opt ON opt.screen_location = ci.screen_location 
            AND opt.content_key LIKE ci.content_key || '_option_%' 
            AND opt.component_type = 'option'
        WHERE ci.content_key IN (${problematicFields.map(f => `'${f}'`).join(',')})
        GROUP BY ci.id, ci.content_key, ci.component_type, ci.screen_location
        ORDER BY ci.content_key
    `, 'Checking Main Dropdown Fields');
    
    // Check the option fields mentioned
    const problematicOptions = [
        'calculate_mortgage_when_options_1',
        'calculate_mortgage_when_options_2', 
        'calculate_mortgage_when_options_3',
        'calculate_mortgage_when_options_4',
        'calculate_mortgage_when_options_Time',
        'calculate_mortgage_first_options_1',
        'calculate_mortgage_first_options_2',
        'calculate_mortgage_first_options_3'
    ];
    
    await executeQuery(`
        SELECT 
            ci.content_key,
            ci.component_type,
            ci.screen_location,
            CASE 
                WHEN ci.component_type = 'option' THEN '✅ CORRECT'
                WHEN ci.component_type = 'text' THEN '❌ NEEDS FIX'
                ELSE '❓ UNKNOWN'
            END as status
        FROM content_items ci
        WHERE ci.content_key IN (${problematicOptions.map(f => `'${f}'`).join(',')})
        ORDER BY ci.content_key
    `, 'Checking Option Fields');
    
    // Check what screen locations these are in
    await executeQuery(`
        SELECT DISTINCT screen_location, COUNT(*) as field_count
        FROM content_items 
        WHERE content_key IN (${problematicFields.concat(problematicOptions).map(f => `'${f}'`).join(',')})
        GROUP BY screen_location
        ORDER BY screen_location
    `, 'Screen Locations for Problematic Fields');
    
    // Check if there are more fields with similar patterns
    await executeQuery(`
        SELECT 
            ci.content_key,
            ci.component_type,
            ci.screen_location,
            COUNT(opt.id) as option_count
        FROM content_items ci
        LEFT JOIN content_items opt ON opt.screen_location = ci.screen_location 
            AND opt.content_key LIKE ci.content_key || '_option_%' 
            AND opt.component_type = 'option'
        WHERE ci.content_key LIKE 'calculate_mortgage_%'
            AND ci.component_type = 'text'
            AND ci.content_key NOT LIKE '%_option_%'
        GROUP BY ci.id, ci.content_key, ci.component_type, ci.screen_location
        HAVING COUNT(opt.id) > 0
        ORDER BY ci.content_key
    `, 'All calculate_mortgage_* fields with options but wrong component_type');
    
    pool.end();
}

investigateAdditionalDropdowns().catch(error => {
    console.error('❌ Script failed:', error);
    pool.end();
    process.exit(1);
}); 
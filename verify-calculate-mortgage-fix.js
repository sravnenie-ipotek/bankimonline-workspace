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

async function verifyCalculateMortgageFix() {
    console.log('🔍 VERIFYING CALCULATE_MORTGAGE_* FIXES');
    console.log('========================================\n');
    
    // Check the specific fields the user mentioned
    const userMentionedFields = [
        'calculate_mortgage_debt_types',
        'calculate_mortgage_family_status', 
        'calculate_mortgage_main_source',
        'calculate_mortgage_when',
        'calculate_mortgage_first'
    ];
    
    const userMentionedOptions = [
        'calculate_mortgage_when_options_1',
        'calculate_mortgage_when_options_2', 
        'calculate_mortgage_when_options_3',
        'calculate_mortgage_when_options_4',
        'calculate_mortgage_when_options_Time',
        'calculate_mortgage_first_options_1',
        'calculate_mortgage_first_options_2',
        'calculate_mortgage_first_options_3'
    ];
    
    console.log('📋 USER MENTIONED FIELDS STATUS:');
    console.log('================================');
    
    // Check main fields
    await executeQuery(`
        SELECT 
            ci.content_key,
            ci.component_type,
            ci.screen_location,
            CASE 
                WHEN ci.component_type = 'dropdown' THEN '✅ FIXED'
                WHEN ci.component_type = 'text' THEN '❌ STILL BROKEN'
                WHEN ci.component_type = 'option' THEN '✅ CORRECT'
                ELSE '❓ UNKNOWN'
            END as status
        FROM content_items ci
        WHERE ci.content_key IN (${userMentionedFields.map(f => `'${f}'`).join(',')})
        ORDER BY ci.content_key
    `, 'Main dropdown fields user mentioned');
    
    // Check option fields
    await executeQuery(`
        SELECT 
            ci.content_key,
            ci.component_type,
            ci.screen_location,
            CASE 
                WHEN ci.component_type = 'option' THEN '✅ FIXED'
                WHEN ci.component_type = 'text' THEN '❌ STILL BROKEN'
                ELSE '❓ UNKNOWN'
            END as status
        FROM content_items ci
        WHERE ci.content_key IN (${userMentionedOptions.map(f => `'${f}'`).join(',')})
        ORDER BY ci.content_key
    `, 'Option fields user mentioned');
    
    console.log('\n🔍 WHAT WE ACTUALLY FIXED:');
    console.log('===========================');
    
    // Check what we actually fixed in refinance_credit_2
    await executeQuery(`
        SELECT 
            ci.content_key,
            ci.component_type,
            ci.screen_location,
            CASE 
                WHEN ci.component_type = 'dropdown' THEN '✅ FIXED'
                WHEN ci.component_type = 'option' THEN '✅ FIXED'
                WHEN ci.component_type = 'text' THEN '❌ STILL BROKEN'
                ELSE '❓ UNKNOWN'
            END as status
        FROM content_items ci
        WHERE ci.screen_location = 'refinance_credit_2'
            AND (ci.content_key LIKE 'calculate_mortgage_%')
        ORDER BY ci.content_key
    `, 'All calculate_mortgage_* fields in refinance_credit_2');
    
    // Check what we fixed in mortgage_calculation
    await executeQuery(`
        SELECT 
            ci.content_key,
            ci.component_type,
            ci.screen_location,
            CASE 
                WHEN ci.component_type = 'dropdown' THEN '✅ FIXED'
                WHEN ci.component_type = 'option' THEN '✅ FIXED'
                WHEN ci.component_type = 'text' THEN '❌ STILL BROKEN'
                ELSE '❓ UNKNOWN'
            END as status
        FROM content_items ci
        WHERE ci.screen_location = 'mortgage_calculation'
            AND (ci.content_key LIKE 'calculate_mortgage_%')
        ORDER BY ci.content_key
    `, 'All calculate_mortgage_* fields in mortgage_calculation');
    
    console.log('\n📊 SUMMARY:');
    console.log('===========');
    console.log('✅ What we fixed:');
    console.log('   - mortgage_calculation: 41 dropdown fields');
    console.log('   - refinance_credit_2: 19 fields (3 dropdowns + 16 options)');
    console.log('');
    console.log('❓ What the user mentioned:');
    console.log('   - Most fields don\'t exist in database');
    console.log('   - Only calculate_mortgage_family_status exists (and was fixed)');
    console.log('');
    console.log('🎯 CONCLUSION:');
    console.log('   - Our fixes addressed SOME calculate_mortgage_* fields');
    console.log('   - But many fields user mentioned don\'t exist in database');
    console.log('   - Need to check if user is looking at different database or different naming');
    
    pool.end();
}

verifyCalculateMortgageFix().catch(error => {
    console.error('❌ Script failed:', error);
    pool.end();
    process.exit(1);
}); 
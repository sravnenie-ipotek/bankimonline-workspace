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

async function fixRefinanceCredit2Dropdowns() {
    console.log('🚀 REFINANCE CREDIT 2 DROPDOWN FIXER');
    console.log('=======================================\n');
    
    // STEP 1: Show current problematic state
    await executeQuery(`
        SELECT 
            ci.content_key,
            ci.component_type as current_type,
            ci.screen_location,
            COUNT(opt.id) as option_count,
            CASE 
                WHEN ci.component_type = 'dropdown' THEN '✅ ALREADY CORRECT'
                WHEN ci.component_type = 'text' AND COUNT(opt.id) > 0 THEN '❌ NEEDS FIX'
                WHEN ci.component_type = 'text' AND COUNT(opt.id) = 0 THEN '⚠️ TEXT WITH NO OPTIONS'
                ELSE '❓ UNKNOWN'
            END as status
        FROM content_items ci
        LEFT JOIN content_items opt ON opt.screen_location = ci.screen_location 
            AND opt.content_key LIKE ci.content_key || '_option_%' 
            AND opt.component_type = 'option'
        WHERE ci.screen_location = 'refinance_credit_2'
            AND ci.component_type = 'text'
            AND ci.content_key NOT LIKE '%_option_%'
        GROUP BY ci.id, ci.content_key, ci.component_type, ci.screen_location
        HAVING COUNT(opt.id) > 0
        ORDER BY ci.content_key
    `, 'BEFORE - Main dropdown fields that need fixing');
    
    await executeQuery(`
        SELECT 
            ci.content_key,
            ci.component_type as current_type,
            ci.screen_location,
            CASE 
                WHEN ci.component_type = 'option' THEN '✅ ALREADY CORRECT'
                WHEN ci.component_type = 'text' THEN '❌ NEEDS FIX'
                ELSE '❓ UNKNOWN'
            END as status
        FROM content_items ci
        WHERE ci.screen_location = 'refinance_credit_2'
            AND ci.content_key LIKE '%_option_%'
            AND ci.component_type = 'text'
        ORDER BY ci.content_key
    `, 'BEFORE - Option fields that need fixing');
    
    console.log('\n🔧 RUNNING REFINANCE CREDIT 2 DROPDOWN FIXES');
    console.log('='.repeat(60));
    
    let totalUpdated = 0;
    
    // STEP 2: Fix main dropdown fields
    const mainDropdownFields = [
        'calculate_mortgage_family_status',
        'calculate_mortgage_education', 
        'calculate_mortgage_add_partner'
    ];
    
    for (const field of mainDropdownFields) {
        const result = await executeQuery(`
            UPDATE content_items 
            SET component_type = 'dropdown'
            WHERE screen_location = 'refinance_credit_2' 
            AND content_key = '${field}'
            AND component_type = 'text'
        `, `Updating ${field} to dropdown`);
        
        if (result) {
            console.log(`   ✅ Updated ${result.rowCount} rows for ${field}`);
            totalUpdated += result.rowCount;
        }
    }
    
    // STEP 3: Fix option fields
    const result = await executeQuery(`
        UPDATE content_items 
        SET component_type = 'option'
        WHERE screen_location = 'refinance_credit_2' 
        AND content_key LIKE '%_option_%'
        AND component_type = 'text'
    `, 'Updating all option fields to option type');
    
    if (result) {
        console.log(`   ✅ Updated ${result.rowCount} option fields`);
        totalUpdated += result.rowCount;
    }
    
    console.log(`\n🎯 TOTAL UPDATED: ${totalUpdated} rows`);
    
    // STEP 4: Verify fixes were applied
    await executeQuery(`
        SELECT 
            ci.content_key,
            ci.component_type as new_type,
            ci.screen_location,
            COUNT(opt.id) as option_count,
            CASE 
                WHEN ci.component_type = 'dropdown' AND COUNT(opt.id) > 0 THEN '✅ FIXED CORRECTLY'
                WHEN ci.component_type = 'dropdown' AND COUNT(opt.id) = 0 THEN '⚠️ DROPDOWN BUT NO OPTIONS'
                WHEN ci.component_type = 'option' THEN '✅ OPTION FIXED'
                WHEN ci.component_type != 'dropdown' AND COUNT(opt.id) > 0 THEN '❌ STILL BROKEN'
                ELSE '✅ OK'
            END as status
        FROM content_items ci
        LEFT JOIN content_items opt ON opt.screen_location = ci.screen_location 
            AND opt.content_key LIKE ci.content_key || '_option_%' 
            AND opt.component_type = 'option'
        WHERE ci.screen_location = 'refinance_credit_2'
            AND (ci.content_key IN (${mainDropdownFields.map(f => `'${f}'`).join(',')})
        GROUP BY ci.id, ci.content_key, ci.component_type, ci.screen_location
        ORDER BY ci.content_key
    `, 'AFTER - Verification of main dropdown fields');
    
    await executeQuery(`
        SELECT 
            ci.content_key,
            ci.component_type as new_type,
            ci.screen_location,
            CASE 
                WHEN ci.component_type = 'option' THEN '✅ FIXED CORRECTLY'
                WHEN ci.component_type = 'text' THEN '❌ STILL BROKEN'
                ELSE '❓ UNKNOWN'
            END as status
        FROM content_items ci
        WHERE ci.screen_location = 'refinance_credit_2'
            AND ci.content_key LIKE '%_option_%'
        ORDER BY ci.content_key
    `, 'AFTER - Verification of option fields');
    
    console.log('\n🎉 REFINANCE CREDIT 2 DROPDOWN FIXES COMPLETED!');
    console.log('==========================================');
    console.log('✅ All problematic dropdown fields should now be properly configured');
    console.log('✅ Drill pages should now show dropdowns instead of text fields');
    console.log('✅ Edit pages should now show dropdown editors instead of text editors');
    
    pool.end();
}

fixRefinanceCredit2Dropdowns().catch(error => {
    console.error('❌ Script failed:', error);
    pool.end();
    process.exit(1);
}); 
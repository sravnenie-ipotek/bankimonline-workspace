#!/usr/bin/env node

const { Pool } = require('pg');
require('dotenv').config();

// Database connection using same config as server-db.js
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
            console.table(result.rows.slice(0, 10)); // Limit to first 10 rows for readability
        }
        return result;
    } catch (error) {
        console.error(`❌ Error in ${description}:`, error.message);
        return null;
    }
}

async function runDropdownFixes() {
    console.log('🚀 DROPDOWN COMPONENT TYPE FIXER');
    console.log('=====================================\n');
    
    // STEP 1: Show current problematic state
    await executeQuery(`
        SELECT 
            ci.content_key,
            ci.component_type as current_type,
            ci.screen_location,
            COUNT(opt.id) as option_count,
            CASE 
                WHEN ci.component_type = 'dropdown' THEN '✅ ALREADY CORRECT'
                WHEN COUNT(opt.id) > 0 THEN '❌ NEEDS FIX'
                ELSE '⚠️ NO OPTIONS'
            END as status
        FROM content_items ci
        LEFT JOIN content_items opt ON opt.screen_location = ci.screen_location 
            AND opt.content_key LIKE ci.content_key || '_option_%' 
            AND opt.component_type = 'option'
        WHERE ci.component_type IN ('text', 'label', 'field_label')
        GROUP BY ci.id, ci.content_key, ci.component_type, ci.screen_location
        HAVING COUNT(opt.id) > 0
        ORDER BY ci.screen_location, ci.content_key
    `, 'BEFORE - Problematic Fields (have options but wrong type)');
    
    console.log('\n🔧 RUNNING DROPDOWN COMPONENT TYPE FIXES');
    console.log('='.repeat(60));
    
    let totalUpdated = 0;
    
    // STEP 2: Apply fixes
    const updates = [
        {
            name: 'Credit Step 1 (2 fields)',
            query: `UPDATE content_items 
                    SET component_type = 'dropdown'
                    WHERE screen_location = 'credit_step1' 
                    AND content_key IN ('calculate_credit_prolong', 'calculate_credit_target')
                    AND component_type = 'field_label'`
        },
        {
            name: 'Credit Step 2 (7 fields)',
            query: `UPDATE content_items 
                    SET component_type = 'dropdown'
                    WHERE screen_location = 'credit_step2' 
                    AND content_key IN (
                        'calculate_credit_citizenship',
                        'calculate_credit_education', 
                        'calculate_credit_family_status',
                        'calculate_credit_foreigner',
                        'calculate_credit_medical_insurance',
                        'calculate_credit_public_person',
                        'calculate_credit_us_tax_reporting'
                    )
                    AND component_type = 'field_label'`
        },
        {
            name: 'Credit Step 3 (4 fields)',
            query: `UPDATE content_items 
                    SET component_type = 'dropdown'
                    WHERE screen_location = 'credit_step3' 
                    AND content_key IN (
                        'calculate_credit_additional_income',
                        'calculate_credit_existing_debts',
                        'calculate_credit_main_source_income',
                        'calculate_credit_professional_sphere'
                    )
                    AND component_type = 'field_label'`
        },
        {
            name: 'Mortgage Step 1 (6 fields)',
            query: `UPDATE content_items 
                    SET component_type = 'dropdown'
                    WHERE screen_location = 'mortgage_step1' 
                    AND content_key IN (
                        'calculate_mortgage_city',
                        'calculate_mortgage_debt_types',
                        'calculate_mortgage_family_status', 
                        'calculate_mortgage_has_additional',
                        'calculate_mortgage_main_source',
                        'mortgage_property_type'
                    )
                    AND component_type IN ('label', 'text', 'field_label')`
        },
        {
            name: 'Mortgage Step 2 (3 fields)',
            query: `UPDATE content_items 
                    SET component_type = 'dropdown'
                    WHERE screen_location = 'mortgage_step2' 
                    AND content_key IN (
                        'calculate_mortgage_borrowers',
                        'calculate_mortgage_children18',
                        'calculate_mortgage_citizenship'
                    )
                    AND component_type = 'label'`
        },
        {
            name: 'Mortgage Step 3 (1 field)',
            query: `UPDATE content_items 
                    SET component_type = 'dropdown'
                    WHERE screen_location = 'mortgage_step3' 
                    AND content_key = 'calculate_mortgage_bank'
                    AND component_type = 'label'`
        },
        {
            name: 'Refinance Credit 2 (3 fields)',
            query: `UPDATE content_items 
                    SET component_type = 'dropdown'
                    WHERE screen_location = 'refinance_credit_2' 
                    AND content_key IN (
                        'calculate_mortgage_borrowers',
                        'calculate_mortgage_children18', 
                        'calculate_mortgage_citizenship'
                    )
                    AND component_type = 'label'`
        },
        {
            name: 'Refinance Mortgage 1 (1 field)',
            query: `UPDATE content_items 
                    SET component_type = 'dropdown'
                    WHERE screen_location = 'refinance_mortgage_1' 
                    AND content_key = 'mortgage_refinance_why'
                    AND component_type = 'text'`
        }
    ];
    
    for (const update of updates) {
        console.log(`\n📝 ${update.name}...`);
        const result = await executeQuery(update.query, `Updating ${update.name}`);
        if (result) {
            const rowsUpdated = result.rowCount;
            console.log(`   ✅ Updated ${rowsUpdated} rows`);
            totalUpdated += rowsUpdated;
        }
    }
    
    console.log(`\n🎯 TOTAL UPDATED: ${totalUpdated} rows`);
    
    if (totalUpdated === 0) {
        console.log('\n⚠️ No rows were updated. This might mean:');
        console.log('   - All fields are already correctly configured');
        console.log('   - The field names or screen locations don\'t match');
        console.log('   - The current component_type conditions don\'t match');
    }
    
    // STEP 3: Verify fixes were applied
    await executeQuery(`
        SELECT 
            ci.content_key,
            ci.component_type as new_type,
            ci.screen_location,
            COUNT(opt.id) as option_count,
            CASE 
                WHEN ci.component_type = 'dropdown' AND COUNT(opt.id) > 0 THEN '✅ FIXED CORRECTLY'
                WHEN ci.component_type = 'dropdown' AND COUNT(opt.id) = 0 THEN '⚠️ DROPDOWN BUT NO OPTIONS'
                WHEN ci.component_type != 'dropdown' AND COUNT(opt.id) > 0 THEN '❌ STILL BROKEN'
                ELSE '✅ OK'
            END as status
        FROM content_items ci
        LEFT JOIN content_items opt ON opt.screen_location = ci.screen_location 
            AND opt.content_key LIKE ci.content_key || '_option_%' 
            AND opt.component_type = 'option'
        WHERE ci.content_key IN (
            'calculate_credit_prolong', 'calculate_credit_target',
            'calculate_credit_citizenship', 'calculate_credit_education', 'calculate_credit_family_status',
            'calculate_credit_foreigner', 'calculate_credit_medical_insurance', 'calculate_credit_public_person', 'calculate_credit_us_tax_reporting',
            'calculate_credit_additional_income', 'calculate_credit_existing_debts', 'calculate_credit_main_source_income', 'calculate_credit_professional_sphere',
            'calculate_mortgage_city', 'calculate_mortgage_debt_types', 'calculate_mortgage_family_status', 
            'calculate_mortgage_has_additional', 'calculate_mortgage_main_source', 'mortgage_property_type',
            'calculate_mortgage_borrowers', 'calculate_mortgage_children18', 'calculate_mortgage_citizenship',
            'calculate_mortgage_bank', 'mortgage_refinance_why'
        )
        GROUP BY ci.id, ci.content_key, ci.component_type, ci.screen_location
        ORDER BY ci.screen_location, ci.content_key
    `, 'AFTER - Verification (should all be ✅ FIXED CORRECTLY)');
    
    // STEP 4: Summary statistics
    await executeQuery(`
        SELECT 
            screen_location,
            COUNT(*) as total_dropdowns,
            SUM(CASE WHEN component_type = 'dropdown' THEN 1 ELSE 0 END) as correct_dropdowns,
            SUM(CASE WHEN component_type != 'dropdown' THEN 1 ELSE 0 END) as still_broken
        FROM content_items 
        WHERE content_key IN (
            'calculate_credit_prolong', 'calculate_credit_target',
            'calculate_credit_citizenship', 'calculate_credit_education', 'calculate_credit_family_status',
            'calculate_credit_foreigner', 'calculate_credit_medical_insurance', 'calculate_credit_public_person', 'calculate_credit_us_tax_reporting',
            'calculate_credit_additional_income', 'calculate_credit_existing_debts', 'calculate_credit_main_source_income', 'calculate_credit_professional_sphere',
            'calculate_mortgage_city', 'calculate_mortgage_debt_types', 'calculate_mortgage_family_status', 
            'calculate_mortgage_has_additional', 'calculate_mortgage_main_source', 'mortgage_property_type',
            'calculate_mortgage_borrowers', 'calculate_mortgage_children18', 'calculate_mortgage_citizenship',
            'calculate_mortgage_bank', 'mortgage_refinance_why'
        )
        GROUP BY screen_location
        ORDER BY screen_location
    `, 'SUMMARY - By Screen Location');
    
    console.log('\n🎉 DROPDOWN COMPONENT TYPE FIXES COMPLETED!');
    console.log('=====================================');
    console.log('✅ All problematic dropdown fields should now be properly configured');
    console.log('✅ Drill pages should now show dropdowns instead of text fields');
    console.log('✅ Edit pages should now show dropdown editors instead of text editors');
    
    pool.end();
}

runDropdownFixes().catch(error => {
    console.error('❌ Script failed:', error);
    pool.end();
    process.exit(1);
}); 
#!/usr/bin/env node

/**
 * ✅ VERIFICATION: Other Borrowers Step 2 - Main Source Dropdown
 * 
 * This script verifies that the missing main_source dropdown has been successfully
 * added to the other_borrowers_step2 screen location and is working correctly.
 * 
 * PROBLEM SOLVED:
 * - MainSourceOfIncome component was looking for 'main_source' field
 * - API endpoint `/api/dropdowns/other_borrowers_step2/he` only returned field_of_activity and obligations
 * - Missing dropdown caused component to fail
 * 
 * SOLUTION IMPLEMENTED:
 * - Added main_source dropdown content to content database
 * - 7 income source options in 3 languages (Hebrew, English, Russian)
 * - Content follows established patterns and naming conventions
 */

const axios = require('axios');

const API_BASE_URL = 'http://localhost:8003';
const LANGUAGES = ['he', 'en', 'ru'];

async function verifyMainSourceDropdown() {
    console.log('🎯 VERIFICATION: Other Borrowers Step 2 - Main Source Dropdown\n');
    
    const results = {
        success: true,
        details: [],
        summary: {}
    };
    
    for (const lang of LANGUAGES) {
        console.log(`🌐 Testing ${lang.toUpperCase()} language...`);
        
        try {
            const response = await axios.get(`${API_BASE_URL}/api/dropdowns/other_borrowers_step2/${lang}`);
            const data = response.data;
            
            // Check that main_source dropdown exists
            const mainSourceKey = 'other_borrowers_step2_main_source';
            const mainSourceDropdown = data.options?.[mainSourceKey];
            
            if (!mainSourceDropdown) {
                results.success = false;
                results.details.push(`❌ ${lang}: main_source dropdown not found`);
                console.log(`  ❌ main_source dropdown not found`);
                continue;
            }
            
            console.log(`  ✅ main_source dropdown found`);
            console.log(`  📊 Options count: ${mainSourceDropdown.length}`);
            
            // Verify expected options are present
            const expectedOptions = ['employee', 'selfemployed', 'pension', 'unemployed', 'unpaid_leave', 'student', 'other'];
            const actualValues = mainSourceDropdown.map(opt => opt.value);
            
            const missingOptions = expectedOptions.filter(opt => !actualValues.includes(opt));
            const extraOptions = actualValues.filter(opt => !expectedOptions.includes(opt));
            
            if (missingOptions.length > 0) {
                results.success = false;
                results.details.push(`❌ ${lang}: Missing options: ${missingOptions.join(', ')}`);
                console.log(`  ❌ Missing options: ${missingOptions.join(', ')}`);
            }
            
            if (extraOptions.length > 0) {
                console.log(`  ⚠️  Extra options: ${extraOptions.join(', ')}`);
            }
            
            // Verify translations are not empty
            const emptyLabels = mainSourceDropdown.filter(opt => !opt.label || opt.label.trim() === '');
            if (emptyLabels.length > 0) {
                results.success = false;
                results.details.push(`❌ ${lang}: ${emptyLabels.length} options have empty labels`);
                console.log(`  ❌ ${emptyLabels.length} options have empty labels`);
            } else {
                console.log(`  ✅ All options have valid translations`);
            }
            
            // Show sample options
            console.log(`  📝 Sample options:`);
            mainSourceDropdown.slice(0, 3).forEach(opt => {
                console.log(`     ${opt.value}: "${opt.label}"`);
            });
            
            results.summary[lang] = {
                found: true,
                optionsCount: mainSourceDropdown.length,
                expectedOptions: expectedOptions.length,
                missingOptions: missingOptions.length,
                hasTranslations: emptyLabels.length === 0
            };
            
        } catch (error) {
            results.success = false;
            results.details.push(`❌ ${lang}: API error - ${error.response?.status || error.message}`);
            console.log(`  ❌ API error: ${error.response?.status || error.message}`);
            
            results.summary[lang] = {
                found: false,
                error: error.message
            };
        }
        
        console.log('');
    }
    
    return results;
}

async function verifyAPIStructure() {
    console.log('🔍 Verifying API Structure...\n');
    
    try {
        const response = await axios.get(`${API_BASE_URL}/api/dropdowns/other_borrowers_step2/he`);
        const data = response.data;
        
        console.log('📊 API Response Structure:');
        console.log(`  Status: ${data.status}`);
        console.log(`  Screen Location: ${data.screen_location}`);
        console.log(`  Language Code: ${data.language_code}`);
        console.log(`  Available Dropdowns: ${Object.keys(data.options || {}).join(', ')}`);
        console.log(`  Cache Status: ${data.cached ? 'Cached' : 'Fresh from DB'}`);
        
        if (data.performance) {
            console.log(`  Performance: ${data.performance.total_items} items, query time: ${data.performance.query_time}`);
        }
        
        console.log('');
        
        return true;
    } catch (error) {
        console.log(`❌ API Structure verification failed: ${error.message}\n`);
        return false;
    }
}

async function main() {
    console.log('🚀 OTHER BORROWERS STEP 2 - MAIN SOURCE DROPDOWN VERIFICATION\n');
    
    // Verify API structure
    const structureOk = await verifyAPIStructure();
    if (!structureOk) {
        console.log('❌ Cannot proceed with verification due to API issues');
        process.exit(1);
    }
    
    // Verify main_source dropdown
    const results = await verifyMainSourceDropdown();
    
    // Print summary
    console.log('📋 VERIFICATION SUMMARY\n');
    
    if (results.success) {
        console.log('✅ SUCCESS: Main source dropdown is working correctly in all languages');
        console.log('');
        console.log('🎉 PROBLEM SOLVED:');
        console.log('   - MainSourceOfIncome component now has required main_source dropdown');
        console.log('   - API endpoint /api/dropdowns/other_borrowers_step2/{lang} returns main_source');
        console.log('   - All 7 income source options available in Hebrew, English, and Russian');
        console.log('   - Dropdown follows established content database patterns');
        console.log('');
        console.log('🔧 TECHNICAL DETAILS:');
        console.log('   - Database: Content items added to content_items and content_translations tables');
        console.log('   - Screen Location: other_borrowers_step2');
        console.log('   - Field Name: main_source');
        console.log('   - API Key: other_borrowers_step2_main_source');
        console.log('   - Options: employee, selfemployed, pension, unemployed, unpaid_leave, student, other');
        
    } else {
        console.log('❌ VERIFICATION FAILED');
        console.log('');
        console.log('Issues found:');
        results.details.forEach(detail => console.log(`   ${detail}`));
    }
    
    console.log('');
    console.log('📊 Results by Language:');
    Object.entries(results.summary).forEach(([lang, summary]) => {
        if (summary.found) {
            console.log(`   ${lang.toUpperCase()}: ✅ ${summary.optionsCount}/${summary.expectedOptions} options, translations: ${summary.hasTranslations ? '✅' : '❌'}`);
        } else {
            console.log(`   ${lang.toUpperCase()}: ❌ ${summary.error || 'Not found'}`);
        }
    });
    
    console.log('');
    console.log('🧪 Next Steps:');
    console.log('   - Test MainSourceOfIncome component in the frontend');
    console.log('   - Verify component receives and displays the dropdown options');
    console.log('   - Test form submission with main_source selection');
    
    process.exit(results.success ? 0 : 1);
}

if (require.main === module) {
    main();
}
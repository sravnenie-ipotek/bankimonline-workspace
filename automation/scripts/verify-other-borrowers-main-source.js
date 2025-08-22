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
    const results = {
        success: true,
        details: [],
        summary: {}
    };
    
    for (const lang of LANGUAGES) {
        } language...`);
        
        try {
            const response = await axios.get(`${API_BASE_URL}/api/dropdowns/other_borrowers_step2/${lang}`);
            const data = response.data;
            
            // Check that main_source dropdown exists
            const mainSourceKey = 'other_borrowers_step2_main_source';
            const mainSourceDropdown = data.options?.[mainSourceKey];
            
            if (!mainSourceDropdown) {
                results.success = false;
                results.details.push(`❌ ${lang}: main_source dropdown not found`);
                continue;
            }
            
            // Verify expected options are present
            const expectedOptions = ['employee', 'selfemployed', 'pension', 'unemployed', 'unpaid_leave', 'student', 'other'];
            const actualValues = mainSourceDropdown.map(opt => opt.value);
            
            const missingOptions = expectedOptions.filter(opt => !actualValues.includes(opt));
            const extraOptions = actualValues.filter(opt => !expectedOptions.includes(opt));
            
            if (missingOptions.length > 0) {
                results.success = false;
                results.details.push(`❌ ${lang}: Missing options: ${missingOptions.join(', ')}`);
                }`);
            }
            
            if (extraOptions.length > 0) {
                }`);
            }
            
            // Verify translations are not empty
            const emptyLabels = mainSourceDropdown.filter(opt => !opt.label || opt.label.trim() === '');
            if (emptyLabels.length > 0) {
                results.success = false;
                results.details.push(`❌ ${lang}: ${emptyLabels.length} options have empty labels`);
                } else {
                }
            
            // Show sample options
            mainSourceDropdown.slice(0, 3).forEach(opt => {
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
            results.summary[lang] = {
                found: false,
                error: error.message
            };
        }
        
        }
    
    return results;
}

async function verifyAPIStructure() {
    try {
        const response = await axios.get(`${API_BASE_URL}/api/dropdowns/other_borrowers_step2/he`);
        const data = response.data;
        
        .join(', ')}`);
        if (data.performance) {
            }
        
        return true;
    } catch (error) {
        return false;
    }
}

async function main() {
    // Verify API structure
    const structureOk = await verifyAPIStructure();
    if (!structureOk) {
        process.exit(1);
    }
    
    // Verify main_source dropdown
    const results = await verifyMainSourceDropdown();
    
    // Print summary
    if (results.success) {
        } else {
        results.details.forEach(detail => );
    }
    
    Object.entries(results.summary).forEach(([lang, summary]) => {
        if (summary.found) {
            }: ✅ ${summary.optionsCount}/${summary.expectedOptions} options, translations: ${summary.hasTranslations ? '✅' : '❌'}`);
        } else {
            }: ❌ ${summary.error || 'Not found'}`);
        }
    });
    
    process.exit(results.success ? 0 : 1);
}

if (require.main === module) {
    main();
}
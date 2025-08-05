#!/usr/bin/env node

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const API_BASE = 'http://localhost:8003';

const testEndpoints = [
    // Step 1
    { screen: 'calculate_credit_1', step: 'Step 1', description: 'Credit amount and loan details' },
    
    // Step 2
    { screen: 'calculate_credit_2', step: 'Step 2', description: 'Personal details and citizenship' },
    
    // Step 3
    { screen: 'step3_header', step: 'Step 3 Header', description: 'Borrower details title' },
    { screen: 'step3_personal_info', step: 'Step 3 Personal Info', description: 'Personal information fields' },
    { screen: 'step3_first_borrower', step: 'Step 3 First Borrower', description: 'Primary borrower section' },
    { screen: 'step3_additional_borrower', step: 'Step 3 Additional Borrower', description: 'Additional borrower section' },
    
    // Step 4
    { screen: 'step4_header', step: 'Step 4 Header', description: 'Income and employment title' },
    { screen: 'step4_employment', step: 'Step 4 Employment', description: 'Employment information fields' },
    { screen: 'step4_income', step: 'Step 4 Income', description: 'Income and expenses fields' },
    
    // Navigation
    { screen: 'navigation', step: 'Navigation', description: 'Navigation buttons' }
];

const languages = ['en', 'he', 'ru'];

async function testCreditCalculatorMigration() {
    console.log('🧪 Testing Credit Calculator Migration');
    console.log('=====================================\n');
    
    let totalTests = 0;
    let passedTests = 0;
    let errors = [];
    
    for (const lang of languages) {
        console.log(`🌍 Testing Language: ${lang.toUpperCase()}`);
        console.log(''.padEnd(40, '-'));
        
        for (const endpoint of testEndpoints) {
            totalTests++;
            
            try {
                const url = `${API_BASE}/api/content/${endpoint.screen}/${lang}`;
                const response = await fetch(url);
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                
                const data = await response.json();
                
                if (data.status === 'success' && data.content_count > 0) {
                    console.log(`✅ ${endpoint.step}: ${data.content_count} items (${endpoint.description})`);
                    passedTests++;
                } else {
                    console.log(`❌ ${endpoint.step}: No content found (${endpoint.description})`);
                    errors.push(`${lang}/${endpoint.screen}: No content found`);
                }
                
            } catch (error) {
                console.log(`❌ ${endpoint.step}: Error - ${error.message}`);
                errors.push(`${lang}/${endpoint.screen}: ${error.message}`);
            }
        }
        console.log('');
    }
    
    // Summary
    console.log('📊 MIGRATION TEST SUMMARY');
    console.log('=========================');
    console.log(`Total Tests: ${totalTests}`);
    console.log(`Passed: ${passedTests}`);
    console.log(`Failed: ${totalTests - passedTests}`);
    console.log(`Success Rate: ${Math.round((passedTests / totalTests) * 100)}%\n`);
    
    if (errors.length > 0) {
        console.log('❌ ERRORS:');
        errors.forEach(error => console.log(`   - ${error}`));
        console.log('');
    }
    
    // Test sample content values
    console.log('🧪 Testing Sample Content Values');
    console.log('=================================');
    
    const sampleTests = [
        { screen: 'step3_header', lang: 'en', expectedKey: 'calculate_credit_step3_title', expectedValue: 'Borrower Details' },
        { screen: 'step4_header', lang: 'en', expectedKey: 'calculate_credit_step4_title', expectedValue: 'Income and Employment Details' },
        { screen: 'step3_header', lang: 'he', expectedKey: 'calculate_credit_step3_title', expectedValue: 'פרטי הלווה' }
    ];
    
    for (const test of sampleTests) {
        try {
            const url = `${API_BASE}/api/content/${test.screen}/${test.lang}`;
            const response = await fetch(url);
            const data = await response.json();
            
            if (data.content && data.content[test.expectedKey] && 
                data.content[test.expectedKey].value === test.expectedValue) {
                console.log(`✅ ${test.screen}/${test.lang}: "${data.content[test.expectedKey].value}"`);
            } else {
                console.log(`❌ ${test.screen}/${test.lang}: Expected "${test.expectedValue}", got "${data.content[test.expectedKey]?.value || 'not found'}"`);
            }
        } catch (error) {
            console.log(`❌ ${test.screen}/${test.lang}: Error - ${error.message}`);
        }
    }
    
    console.log('\n🏁 Migration test complete!');
    
    if (passedTests === totalTests) {
        console.log('🎉 All credit calculator content successfully migrated to database!');
        return true;
    } else {
        console.log('⚠️  Some issues found. Please review the errors above.');
        return false;
    }
}

// Run the test
testCreditCalculatorMigration().catch(console.error);
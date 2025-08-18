const axios = require('axios');
const fs = require('fs');

const BASE_URL = 'http://localhost:8003';

async function testDropdownAPIs() {
    console.log('🔍 TESTING DROPDOWN APIs DIRECTLY\n');
    console.log('=' .repeat(80));
    
    const screens = [
        'mortgage_step1', 'mortgage_step2', 'mortgage_step3', 'mortgage_step4',
        'credit_step1', 'credit_step2', 'credit_step3',
        'refinance_step1', 'refinance_step2', 'refinance_step3',
        'refinance_mortgage_step1', 'refinance_mortgage_step2', 'refinance_mortgage_step3',
        'refinance_credit_step1', 'refinance_credit_step2', 'refinance_credit_step3'
    ];
    
    const results = [];
    const emptyDropdowns = [];
    
    for (const screen of screens) {
        try {
            console.log(`\n📱 Testing ${screen}...`);
            
            const response = await axios.get(`${BASE_URL}/api/dropdowns/${screen}/he`);
            const data = response.data;
            
            // Check if we have options
            const hasOptions = data.options && Object.keys(data.options).length > 0;
            const optionKeys = hasOptions ? Object.keys(data.options) : [];
            
            const screenResult = {
                screen,
                success: true,
                hasOptions,
                optionCount: optionKeys.length,
                fields: []
            };
            
            if (hasOptions) {
                // Check each dropdown field
                for (const [field, options] of Object.entries(data.options)) {
                    const isEmpty = !options || 
                                   !Array.isArray(options) || 
                                   options.length === 0 ||
                                   (options.length === 1 && (!options[0].value || options[0].value === ''));
                    
                    const fieldInfo = {
                        field,
                        isEmpty,
                        optionCount: Array.isArray(options) ? options.length : 0,
                        sampleOptions: Array.isArray(options) ? options.slice(0, 3) : options
                    };
                    
                    screenResult.fields.push(fieldInfo);
                    
                    if (isEmpty) {
                        emptyDropdowns.push({
                            screen,
                            field,
                            data: options
                        });
                        console.log(`   ❌ Empty: ${field}`);
                    } else {
                        console.log(`   ✅ OK: ${field} (${fieldInfo.optionCount} options)`);
                    }
                }
            } else {
                console.log('   ⚠️  No options object in response');
            }
            
            results.push(screenResult);
            
        } catch (error) {
            console.log(`   ❌ Error: ${error.message}`);
            results.push({
                screen,
                success: false,
                error: error.message
            });
        }
    }
    
    // Summary
    console.log('\n' + '=' .repeat(80));
    console.log('\n📊 SUMMARY:');
    console.log('-' .repeat(80));
    
    const totalScreens = results.length;
    const successfulScreens = results.filter(r => r.success).length;
    const totalFields = results.reduce((sum, r) => sum + (r.fields?.length || 0), 0);
    const emptyFieldCount = emptyDropdowns.length;
    
    console.log(`Screens tested: ${totalScreens}`);
    console.log(`Successful API calls: ${successfulScreens}`);
    console.log(`Total dropdown fields: ${totalFields}`);
    console.log(`Empty dropdowns: ${emptyFieldCount}`);
    console.log(`Success rate: ${((totalFields - emptyFieldCount) / totalFields * 100).toFixed(1)}%`);
    
    if (emptyDropdowns.length > 0) {
        console.log('\n❌ EMPTY DROPDOWNS:');
        console.log('-' .repeat(80));
        
        // Group by screen
        const byScreen = {};
        emptyDropdowns.forEach(d => {
            if (!byScreen[d.screen]) byScreen[d.screen] = [];
            byScreen[d.screen].push(d.field);
        });
        
        for (const [screen, fields] of Object.entries(byScreen)) {
            console.log(`\n${screen}:`);
            fields.forEach(f => console.log(`  - ${f}`));
        }
    }
    
    // Save results
    const report = {
        timestamp: new Date().toISOString(),
        summary: {
            totalScreens,
            successfulScreens,
            totalFields,
            emptyFieldCount,
            successRate: ((totalFields - emptyFieldCount) / totalFields * 100).toFixed(1)
        },
        results,
        emptyDropdowns
    };
    
    fs.writeFileSync('dropdown-api-test-results.json', JSON.stringify(report, null, 2));
    console.log('\n✅ Results saved to dropdown-api-test-results.json');
    
    return report;
}

testDropdownAPIs();
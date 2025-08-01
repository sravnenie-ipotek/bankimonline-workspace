#!/usr/bin/env node

async function testAllDropdowns() {
    console.log('=== TESTING ALL MORTGAGE CALCULATOR DROPDOWNS ===\n');
    
    const steps = [
        { step: 1, expectedDropdowns: ['property_ownership', 'property_type', 'type', 'city', 'buying_apartment_timing', 'is_first_apartment'] },
        { step: 2, expectedDropdowns: ['family_status', 'education', 'citizenship'] },
        { step: 3, expectedDropdowns: ['main_source', 'additional_income', 'obligations'] }
    ];
    
    for (const { step, expectedDropdowns } of steps) {
        console.log(`\n=== STEP ${step} ===`);
        
        try {
            const response = await fetch(`http://localhost:8003/api/dropdowns/mortgage_step${step}/he`);
            const data = await response.json();
            
            console.log(`Total dropdowns found: ${Object.keys(data.options).length}`);
            
            // Check each expected dropdown
            for (const dropdown of expectedDropdowns) {
                const key = `mortgage_step${step}_${dropdown}`;
                const options = data.options[key];
                
                if (options && options.length > 0) {
                    console.log(`✅ ${dropdown}: ${options.length} options`);
                    // Show first 3 option values
                    const values = options.slice(0, 3).map(o => o.value).join(', ');
                    console.log(`   Values: ${values}${options.length > 3 ? ', ...' : ''}`);
                } else {
                    console.log(`❌ ${dropdown}: NO OPTIONS FOUND`);
                }
            }
            
            // Check for unexpected dropdowns
            const foundKeys = Object.keys(data.options).map(k => k.replace(`mortgage_step${step}_`, ''));
            const unexpected = foundKeys.filter(k => !expectedDropdowns.includes(k) && k !== `mortgage_step${step}`);
            if (unexpected.length > 0) {
                console.log(`\n⚠️  Unexpected dropdowns found: ${unexpected.join(', ')}`);
            }
            
        } catch (error) {
            console.error(`❌ Error testing step ${step}:`, error.message);
        }
    }
    
    console.log('\n=== TEST COMPLETE ===');
}

testAllDropdowns();
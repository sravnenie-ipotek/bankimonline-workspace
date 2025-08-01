#!/usr/bin/env node

async function testDropdownAPI() {
    console.log('=== TESTING DROPDOWN API FROM PORT 5175 ===\n');
    
    try {
        // Test 1: Direct API call
        console.log('1. Testing direct API call to http://localhost:8003/api/dropdowns/mortgage_step1/he');
        const response = await fetch('http://localhost:8003/api/dropdowns/mortgage_step1/he');
        
        if (!response.ok) {
            console.error(`   ❌ HTTP Error: ${response.status} ${response.statusText}`);
            return;
        }
        
        const data = await response.json();
        console.log(`   ✅ API Response received`);
        console.log(`   Status: ${data.status}`);
        console.log(`   Dropdowns: ${data.dropdowns?.length || 0}`);
        console.log(`   Options groups: ${Object.keys(data.options || {}).length}`);
        
        // Test 2: Check property ownership dropdown specifically
        console.log('\n2. Checking property_ownership dropdown data:');
        const propertyOwnershipKey = 'mortgage_step1_property_ownership';
        const propertyOwnershipOptions = data.options?.[propertyOwnershipKey];
        
        if (propertyOwnershipOptions) {
            console.log(`   ✅ Found ${propertyOwnershipOptions.length} options for property_ownership`);
            propertyOwnershipOptions.forEach((opt, idx) => {
                console.log(`      ${idx + 1}. value: "${opt.value}", label: "${opt.label}"`);
            });
        } else {
            console.log(`   ❌ No options found for key: ${propertyOwnershipKey}`);
            console.log('   Available option keys:', Object.keys(data.options || {}));
        }
        
        // Test 3: Check placeholders and labels
        console.log('\n3. Checking placeholders and labels:');
        const placeholder = data.placeholders?.[propertyOwnershipKey];
        const label = data.labels?.[propertyOwnershipKey];
        
        console.log(`   Placeholder: ${placeholder ? `"${placeholder}"` : 'Not found'}`);
        console.log(`   Label: ${label ? `"${label}"` : 'Not found'}`);
        
        // Test 4: Check if any dropdowns have options
        console.log('\n4. Summary of all dropdowns with options:');
        const dropdownsWithOptions = data.dropdowns?.filter(d => {
            const optionKey = `mortgage_step1_${d.key.replace('mortgage_step1_', '')}`;
            return data.options?.[optionKey]?.length > 0;
        }) || [];
        
        console.log(`   Total dropdowns with options: ${dropdownsWithOptions.length}`);
        dropdownsWithOptions.forEach(d => {
            const optionKey = `mortgage_step1_${d.key.replace('mortgage_step1_', '')}`;
            console.log(`   - ${d.key}: ${data.options[optionKey].length} options`);
        });
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        if (error.cause) {
            console.error('   Cause:', error.cause);
        }
    }
}

// Check if fetch is available (Node 18+)
if (typeof fetch === 'undefined') {
    console.log('Installing node-fetch...');
    const { exec } = require('child_process');
    exec('npm install node-fetch', (err) => {
        if (err) {
            console.error('Failed to install node-fetch:', err);
            return;
        }
        global.fetch = require('node-fetch');
        testDropdownAPI();
    });
} else {
    testDropdownAPI();
}
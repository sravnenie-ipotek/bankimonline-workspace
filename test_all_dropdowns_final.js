#!/usr/bin/env node

async function testAllDropdowns() {
    try {
        console.log('=== TESTING ALL MORTGAGE DROPDOWNS ===\n');
        
        const response = await fetch('http://localhost:8003/api/dropdowns/mortgage_step1/he');
        const data = await response.json();
        
        const dropdownsToCheck = ['when_needed', 'type', 'first_home', 'property_ownership'];
        
        dropdownsToCheck.forEach(dropdown => {
            const key = `mortgage_step1_${dropdown}`;
            const options = data.options[key] || [];
            
            console.log(`\n${dropdown.toUpperCase()} (${options.length} options):`);
            options.forEach((opt, idx) => {
                console.log(`  ${idx + 1}. value: "${opt.value}", label: "${opt.label}"`);
            });
        });
        
    } catch (error) {
        console.error('Error:', error.message);
    }
}

testAllDropdowns();
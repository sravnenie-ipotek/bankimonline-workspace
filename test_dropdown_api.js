#!/usr/bin/env node

const fetch = require('node-fetch');

async function testDropdownAPI() {
    try {
        console.log('=== TESTING DROPDOWN API ===');
        
        const response = await fetch('http://localhost:8003/api/dropdowns/mortgage_step1/he');
        const data = await response.json();
        
        console.log(`\nStatus: ${data.status}`);
        console.log(`Total dropdowns: ${data.dropdowns.length}`);
        
        // Find property ownership dropdown
        const propertyOwnership = data.dropdowns.find(d => d.key === 'mortgage_step1_property_ownership');
        
        if (propertyOwnership) {
            console.log('\n📋 Property Ownership Dropdown:');
            console.log(`  Key: ${propertyOwnership.key}`);
            console.log(`  Label: ${propertyOwnership.label}`);
            console.log(`  Options: ${propertyOwnership.options ? propertyOwnership.options.length : 0}`);
            
            if (propertyOwnership.options && propertyOwnership.options.length > 0) {
                console.log('  Option details:');
                propertyOwnership.options.forEach(opt => {
                    console.log(`    ${opt.value}: "${opt.label}"`);
                });
            } else {
                console.log('  ❌ NO OPTIONS FOUND!');
            }
        } else {
            console.log('\n❌ Property ownership dropdown not found!');
        }
        
        // Check for any dropdowns with options
        const dropdownsWithOptions = data.dropdowns.filter(d => d.options && d.options.length > 0);
        console.log(`\n📊 Dropdowns with options: ${dropdownsWithOptions.length}`);
        
        if (dropdownsWithOptions.length > 0) {
            console.log('\nSample dropdown with options:');
            const sample = dropdownsWithOptions[0];
            console.log(`  ${sample.key}: ${sample.options.length} options`);
            sample.options.slice(0, 3).forEach(opt => {
                console.log(`    ${opt.value}: "${opt.label}"`);
            });
        }
        
        // Check all property-ownership related dropdowns
        const ownershipDropdowns = data.dropdowns.filter(d => d.key.includes('ownership'));
        console.log(`\n🏠 Ownership-related dropdowns: ${ownershipDropdowns.length}`);
        ownershipDropdowns.forEach(dropdown => {
            console.log(`  ${dropdown.key}: "${dropdown.label}" (${dropdown.options ? dropdown.options.length : 0} options)`);
        });
        
    } catch (error) {
        console.error('Error testing dropdown API:', error.message);
    }
}

testDropdownAPI();
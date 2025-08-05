#!/usr/bin/env node
require('dotenv').config();

async function compareLocalVsProduction() {
    try {
        console.log('🔍 Comparing Local vs Production Database Content...\n');
        
        // Fetch from local
        console.log('📍 Fetching from LOCAL (localhost:8003)...');
        const localResponse = await fetch('http://localhost:8003/api/dropdowns/mortgage_step1/he');
        const localData = await localResponse.json();
        
        console.log('📍 Fetching from PRODUCTION (Railway)...');
        const prodResponse = await fetch('https://bankdev2standalone-production.up.railway.app/api/dropdowns/mortgage_step1/he');
        const prodData = await prodResponse.json();
        
        console.log('\n=== COMPARISON RESULTS ===\n');
        
        // Compare dropdown counts
        console.log('📊 Dropdown Counts:');
        console.log(`  Local: ${localData.dropdowns?.length || 0} dropdowns`);
        console.log(`  Production: ${prodData.dropdowns?.length || 0} dropdowns`);
        
        // Compare option keys
        const localKeys = Object.keys(localData.options || {}).sort();
        const prodKeys = Object.keys(prodData.options || {}).sort();
        
        console.log('\n🔑 Option Keys:');
        console.log(`  Local: ${localKeys.length} keys`);
        console.log(`  Production: ${prodKeys.length} keys`);
        
        // Find missing keys in production
        const missingInProd = localKeys.filter(key => !prodKeys.includes(key));
        const extraInProd = prodKeys.filter(key => !localKeys.includes(key));
        
        if (missingInProd.length > 0) {
            console.log('\n❌ Missing in Production (but exist in Local):');
            missingInProd.forEach(key => console.log(`  - ${key}`));
        }
        
        if (extraInProd.length > 0) {
            console.log('\n➕ Extra in Production (not in Local):');
            extraInProd.forEach(key => console.log(`  - ${key}`));
        }
        
        // Check for the specific keys frontend expects
        const expectedKeys = ['when_needed', 'type', 'first_home', 'property_ownership'];
        console.log('\n🎯 Frontend Expected Keys Check:');
        
        expectedKeys.forEach(key => {
            const fullKey = `mortgage_step1_${key}`;
            const inLocal = localKeys.includes(fullKey);
            const inProd = prodKeys.includes(fullKey);
            
            console.log(`  ${key}:`);
            console.log(`    Local: ${inLocal ? '✅' : '❌'}`);
            console.log(`    Production: ${inProd ? '✅' : '❌'}`);
        });
        
        console.log('\n🔧 SOLUTION:');
        if (missingInProd.length > 0) {
            console.log('Production database is missing content that exists locally.');
            console.log('You need to sync the content from local to production database.');
        } else {
            console.log('Content appears to be in sync.');
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

compareLocalVsProduction();
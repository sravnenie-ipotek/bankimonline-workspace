#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🌐 Translation Test Report');
console.log('=========================\n');

const localesPath = path.join(__dirname, 'mainapp', 'public', 'locales');
const languages = ['en', 'he', 'ru'];
const results = {
    summary: {
        total: 0,
        passed: 0,
        warnings: 0,
        errors: 0
    },
    languages: {}
};

// Check each language
languages.forEach(lang => {
    const filePath = path.join(localesPath, lang, 'translation.json');
    console.log(`\n📁 Checking ${lang.toUpperCase()} translations...`);
    
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const translations = JSON.parse(content);
        const keys = Object.keys(translations);
        
        results.languages[lang] = {
            file: filePath,
            totalKeys: keys.length,
            emptyKeys: 0,
            suspiciousKeys: [],
            status: 'PASS'
        };
        
        // Check for empty or suspicious values
        keys.forEach(key => {
            const value = translations[key];
            if (!value || (typeof value === 'string' && value.trim() === '')) {
                results.languages[lang].emptyKeys++;
                results.languages[lang].suspiciousKeys.push(`${key}: [EMPTY]`);
            } else if (lang !== 'en' && typeof value === 'string' && value === key) {
                // Check if non-English translations are same as key (likely untranslated)
                if (!key.includes('_ph') && !key.includes('_option')) {
                    results.languages[lang].suspiciousKeys.push(`${key}: "${value}" (same as key)`);
                }
            }
        });
        
        // Report for this language
        console.log(`  ✅ File exists: ${filePath}`);
        console.log(`  📊 Total keys: ${results.languages[lang].totalKeys}`);
        
        if (results.languages[lang].emptyKeys > 0) {
            console.log(`  ⚠️  Empty keys: ${results.languages[lang].emptyKeys}`);
            results.summary.warnings++;
            results.languages[lang].status = 'WARNING';
        }
        
        if (results.languages[lang].suspiciousKeys.length > 0 && results.languages[lang].suspiciousKeys.length <= 10) {
            console.log(`  ⚠️  Suspicious translations:`);
            results.languages[lang].suspiciousKeys.forEach(key => {
                console.log(`     - ${key}`);
            });
        } else if (results.languages[lang].suspiciousKeys.length > 10) {
            console.log(`  ⚠️  Found ${results.languages[lang].suspiciousKeys.length} suspicious translations (showing first 10):`);
            results.languages[lang].suspiciousKeys.slice(0, 10).forEach(key => {
                console.log(`     - ${key}`);
            });
        }
        
        results.summary.total++;
        if (results.languages[lang].status === 'PASS') {
            results.summary.passed++;
            console.log(`  ✅ Status: PASS`);
        } else {
            console.log(`  ⚠️  Status: ${results.languages[lang].status}`);
        }
        
    } catch (error) {
        console.log(`  ❌ ERROR: ${error.message}`);
        results.languages[lang] = {
            file: filePath,
            error: error.message,
            status: 'ERROR'
        };
        results.summary.errors++;
        results.summary.total++;
    }
});

// Cross-language validation
console.log('\n\n🔍 Cross-Language Validation');
console.log('============================');

if (results.languages.en && results.languages.he && results.languages.ru) {
    const enKeys = Object.keys(JSON.parse(fs.readFileSync(path.join(localesPath, 'en', 'translation.json'), 'utf8')));
    const heKeys = Object.keys(JSON.parse(fs.readFileSync(path.join(localesPath, 'he', 'translation.json'), 'utf8')));
    const ruKeys = Object.keys(JSON.parse(fs.readFileSync(path.join(localesPath, 'ru', 'translation.json'), 'utf8')));
    
    const missingInHe = enKeys.filter(key => !heKeys.includes(key));
    const missingInRu = enKeys.filter(key => !ruKeys.includes(key));
    const extraInHe = heKeys.filter(key => !enKeys.includes(key));
    const extraInRu = ruKeys.filter(key => !enKeys.includes(key));
    
    if (missingInHe.length === 0 && missingInRu.length === 0) {
        console.log('  ✅ All languages have the same keys');
    } else {
        if (missingInHe.length > 0) {
            console.log(`  ⚠️  Missing in HE: ${missingInHe.length} keys`);
            if (missingInHe.length <= 5) {
                missingInHe.forEach(key => console.log(`     - ${key}`));
            }
        }
        if (missingInRu.length > 0) {
            console.log(`  ⚠️  Missing in RU: ${missingInRu.length} keys`);
            if (missingInRu.length <= 5) {
                missingInRu.forEach(key => console.log(`     - ${key}`));
            }
        }
    }
    
    if (extraInHe.length > 0) {
        console.log(`  ℹ️  Extra keys in HE: ${extraInHe.length}`);
    }
    if (extraInRu.length > 0) {
        console.log(`  ℹ️  Extra keys in RU: ${extraInRu.length}`);
    }
}

// Critical translation keys check
console.log('\n\n🔑 Critical Translation Keys');
console.log('=============================');

const criticalKeys = [
    'calculate_mortgage_property_ownership',
    'calculate_mortgage_property_ownership_ph',
    'calculate_mortgage_property_ownership_option_1',
    'calculate_mortgage_property_ownership_option_2',
    'calculate_mortgage_property_ownership_option_3',
    'calculate_credit_credit_goal',
    'calculate_credit_credit_goal_ph',
    'refinance_mortgage_property_ownership',
    'refinance_credit_credit_goal'
];

criticalKeys.forEach(key => {
    const status = [];
    languages.forEach(lang => {
        try {
            const translations = JSON.parse(fs.readFileSync(path.join(localesPath, lang, 'translation.json'), 'utf8'));
            if (translations[key]) {
                status.push(`${lang.toUpperCase()}:✅`);
            } else {
                status.push(`${lang.toUpperCase()}:❌`);
            }
        } catch {
            status.push(`${lang.toUpperCase()}:❌`);
        }
    });
    console.log(`  ${key}: [${status.join(' ')}]`);
});

// Final summary
console.log('\n\n📈 Test Summary');
console.log('===============');
console.log(`Total Languages Tested: ${results.summary.total}`);
console.log(`✅ Passed: ${results.summary.passed}`);
console.log(`⚠️  Warnings: ${results.summary.warnings}`);
console.log(`❌ Errors: ${results.summary.errors}`);

if (results.summary.errors === 0 && results.summary.warnings === 0) {
    console.log('\n🎉 All translation tests PASSED!');
    process.exit(0);
} else if (results.summary.errors === 0) {
    console.log('\n⚠️  Translation tests passed with warnings');
    process.exit(0);
} else {
    console.log('\n❌ Translation tests FAILED');
    process.exit(1);
}
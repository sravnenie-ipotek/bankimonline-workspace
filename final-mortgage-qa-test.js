#!/usr/bin/env node

/**
 * FINAL MORTGAGE CALCULATOR QA TEST
 * Version: 0.1_1755776950000
 * Comprehensive validation of mortgage calculator after database architecture separation
 */

const { Pool } = require('pg');
const axios = require('axios');
require('dotenv').config();

const corePool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: false
});

const contentPool = new Pool({
    connectionString: process.env.CONTENT_DATABASE_URL,  
    ssl: false
});

const API_BASE = 'http://localhost:8003';

class MortgageQATest {
    constructor() {
        this.results = {
            timestamp: new Date().toISOString(),
            tests: []
        };
    }

    async runAllTests() {
        console.log('🏠 MORTGAGE CALCULATOR QA VALIDATION');
        console.log('====================================\n');

        const tests = [
            { name: 'Architecture Separation', fn: () => this.testArchitectureSeparation() },
            { name: 'Property Ownership Business Logic', fn: () => this.testPropertyOwnershipBusinessLogic() },
            { name: 'Property Ownership Translations', fn: () => this.testPropertyOwnershipTranslations() },
            { name: 'Property Ownership Dropdown Config', fn: () => this.testPropertyOwnershipDropdownConfig() },
            { name: 'Mortgage Calculator API', fn: () => this.testMortgageCalculatorAPI() },
            { name: 'Hebrew RTL Support', fn: () => this.testHebrewRTLSupport() },
            { name: 'LTV Calculation Logic', fn: () => this.testLTVCalculationLogic() },
            { name: 'Circuit Breaker Active', fn: () => this.testCircuitBreakerActive() }
        ];

        for (const test of tests) {
            await this.runTest(test.name, test.fn);
        }

        this.generateSummary();
        this.saveResults();
    }

    async runTest(name, testFn) {
        console.log(`🧪 Testing: ${name}`);
        const start = Date.now();
        
        try {
            const result = await testFn();
            const duration = Date.now() - start;
            
            this.results.tests.push({
                name,
                status: 'PASS',
                duration,
                result
            });
            
            console.log(`✅ PASS: ${name} (${duration}ms)`);
        } catch (error) {
            const duration = Date.now() - start;
            
            this.results.tests.push({
                name,
                status: 'FAIL',
                duration,
                error: error.message
            });
            
            console.log(`❌ FAIL: ${name} (${duration}ms) - ${error.message}`);
        }
    }

    async testArchitectureSeparation() {
        // Verify core database has NO content tables
        const contentTablesInCore = await corePool.query(`
            SELECT COUNT(*) as count
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name IN ('content_items', 'content_translations', 'dropdown_configs', 'locales')
        `);

        // Verify content database HAS all content tables
        const contentTablesInContent = await contentPool.query(`
            SELECT COUNT(*) as count
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name IN ('content_items', 'content_translations', 'dropdown_configs', 'locales')
        `);

        // Verify business logic tables exist in core
        const businessTables = await corePool.query(`
            SELECT COUNT(*) as count
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name IN ('property_ownership_rules', 'banking_standards')
        `);

        const coreClean = parseInt(contentTablesInCore.rows[0].count) === 0;
        const contentComplete = parseInt(contentTablesInContent.rows[0].count) === 4;
        const businessLogicPresent = parseInt(businessTables.rows[0].count) >= 2;

        if (!coreClean) throw new Error('Core database still contains content tables');
        if (!contentComplete) throw new Error('Content database missing content tables');
        if (!businessLogicPresent) throw new Error('Business logic tables missing from core');

        return {
            coreClean,
            contentComplete,
            businessLogicPresent
        };
    }

    async testPropertyOwnershipBusinessLogic() {
        // Test LTV business rules
        const rules = await corePool.query(`
            SELECT option_key, ltv_percentage, financing_percentage, min_down_payment_percentage
            FROM property_ownership_rules
            WHERE is_active = true
            ORDER BY display_order
        `);

        const expectedRules = {
            'no_property': { ltv: 75, down: 25 },
            'has_property': { ltv: 50, down: 50 },
            'selling_property': { ltv: 70, down: 30 }
        };

        if (rules.rows.length !== 3) throw new Error('Expected 3 property ownership rules');

        const validationResults = {};
        rules.rows.forEach(rule => {
            const expected = expectedRules[rule.option_key];
            if (!expected) throw new Error(`Unexpected rule: ${rule.option_key}`);
            
            const ltvValid = parseFloat(rule.ltv_percentage) === expected.ltv;
            const downValid = parseFloat(rule.min_down_payment_percentage) === expected.down;
            
            if (!ltvValid || !downValid) {
                throw new Error(`Invalid LTV/down payment for ${rule.option_key}: ${rule.ltv_percentage}%/${rule.min_down_payment_percentage}% vs expected ${expected.ltv}%/${expected.down}%`);
            }
            
            validationResults[rule.option_key] = { ltvValid, downValid };
        });

        return {
            ruleCount: rules.rows.length,
            validationResults
        };
    }

    async testPropertyOwnershipTranslations() {
        // Test all property ownership translations exist
        const translations = await contentPool.query(`
            SELECT 
                ci.content_key,
                COUNT(DISTINCT ct.language_code) as language_count
            FROM content_items ci
            JOIN content_translations ct ON ci.id = ct.content_item_id
            WHERE ci.content_key LIKE 'calculate_mortgage_property_ownership%'
            AND ci.screen_location = 'mortgage_step1'
            AND ct.status IN ('active', 'approved')
            GROUP BY ci.content_key
            ORDER BY ci.content_key
        `);

        // Verify specific translations exist
        const specificTranslations = await contentPool.query(`
            SELECT 
                ci.content_key,
                ct.language_code,
                LENGTH(ct.content_value) as value_length
            FROM content_items ci
            JOIN content_translations ct ON ci.id = ct.content_item_id
            WHERE ci.content_key LIKE 'calculate_mortgage_property_ownership%'
            AND ci.screen_location = 'mortgage_step1'
            AND ct.status IN ('active', 'approved')
            ORDER BY ci.content_key, ct.language_code
        `);

        const expectedKeys = 5; // title, 3 options, placeholder
        const expectedTranslations = 15; // 5 keys × 3 languages

        if (translations.rows.length !== expectedKeys) {
            throw new Error(`Expected ${expectedKeys} translation keys, found ${translations.rows.length}`);
        }

        if (specificTranslations.rows.length !== expectedTranslations) {
            throw new Error(`Expected ${expectedTranslations} translations, found ${specificTranslations.rows.length}`);
        }

        // Verify all keys have all 3 languages
        const incompleteKeys = translations.rows.filter(row => row.language_count < 3);
        if (incompleteKeys.length > 0) {
            throw new Error(`Incomplete translations for keys: ${incompleteKeys.map(k => k.content_key).join(', ')}`);
        }

        return {
            keyCount: translations.rows.length,
            translationCount: specificTranslations.rows.length,
            allComplete: true
        };
    }

    async testPropertyOwnershipDropdownConfig() {
        // Test dropdown configuration exists and is valid
        const config = await contentPool.query(`
            SELECT config
            FROM dropdown_configs
            WHERE field_name = 'property_ownership'
            AND screen_location = 'mortgage_step1'
        `);

        if (config.rows.length !== 1) {
            throw new Error('Property ownership dropdown config not found');
        }

        const configData = config.rows[0].config;
        
        // Validate config structure
        if (!configData.label || !configData.options || !configData.placeholder) {
            throw new Error('Invalid dropdown config structure');
        }

        // Validate all languages present
        const languages = ['en', 'he', 'ru'];
        languages.forEach(lang => {
            if (!configData.label[lang] || !configData.placeholder[lang]) {
                throw new Error(`Missing ${lang} label/placeholder in dropdown config`);
            }
        });

        // Validate options
        if (configData.options.length !== 3) {
            throw new Error(`Expected 3 options, found ${configData.options.length}`);
        }

        const expectedValues = ['no_property', 'has_property', 'selling_property'];
        const actualValues = configData.options.map(opt => opt.value);
        
        expectedValues.forEach(value => {
            if (!actualValues.includes(value)) {
                throw new Error(`Missing option value: ${value}`);
            }
        });

        return {
            configExists: true,
            optionCount: configData.options.length,
            languageSupport: languages,
            optionValues: actualValues
        };
    }

    async testMortgageCalculatorAPI() {
        // Test the main mortgage calculator API endpoint
        const response = await axios.get(`${API_BASE}/api/v1/calculation-parameters?business_path=mortgage`);
        
        if (response.status !== 200) {
            throw new Error(`API returned status ${response.status}`);
        }

        const data = response.data;
        
        // Validate response structure
        if (!data.data || !data.data.property_ownership_ltvs) {
            throw new Error('API response missing property_ownership_ltvs');
        }

        const ltvs = data.data.property_ownership_ltvs;
        
        // Validate LTV values
        const expectedLTVs = {
            'no_property': 75,
            'has_property': 50, 
            'selling_property': 70
        };

        Object.entries(expectedLTVs).forEach(([key, expectedLTV]) => {
            if (!ltvs[key] || ltvs[key].ltv !== expectedLTV) {
                throw new Error(`Invalid LTV for ${key}: expected ${expectedLTV}, got ${ltvs[key]?.ltv}`);
            }
        });

        // Validate other required fields
        if (!data.data.current_interest_rate || !data.data.standards) {
            throw new Error('API response missing required fields');
        }

        return {
            status: response.status,
            hasPropertyOwnershipLTVs: true,
            ltvValues: ltvs,
            hasStandards: !!data.data.standards,
            currentRate: data.data.current_interest_rate
        };
    }

    async testHebrewRTLSupport() {
        // Test Hebrew translations contain Hebrew characters
        const hebrewTranslations = await contentPool.query(`
            SELECT 
                ci.content_key,
                ct.content_value
            FROM content_items ci
            JOIN content_translations ct ON ci.id = ct.content_item_id
            WHERE ci.content_key LIKE 'calculate_mortgage_property_ownership%'
            AND ci.screen_location = 'mortgage_step1'
            AND ct.language_code = 'he'
            AND ct.status IN ('active', 'approved')
            ORDER BY ci.content_key
        `);

        if (hebrewTranslations.rows.length === 0) {
            throw new Error('No Hebrew translations found');
        }

        // Verify Hebrew characters are present
        const hebrewRegex = /[\u0590-\u05FF]/; // Hebrew Unicode range
        const invalidTranslations = hebrewTranslations.rows.filter(row => 
            !hebrewRegex.test(row.content_value)
        );

        if (invalidTranslations.length > 0) {
            throw new Error(`Hebrew translations without Hebrew characters: ${invalidTranslations.map(t => t.content_key).join(', ')}`);
        }

        return {
            hebrewTranslationCount: hebrewTranslations.rows.length,
            allContainHebrewChars: true,
            sampleTranslation: hebrewTranslations.rows[0]?.content_value
        };
    }

    async testLTVCalculationLogic() {
        // Test that LTV calculations match business requirements
        const testCases = [
            { propertyOwnership: 'no_property', expectedLTV: 75, expectedDown: 25 },
            { propertyOwnership: 'has_property', expectedLTV: 50, expectedDown: 50 },
            { propertyOwnership: 'selling_property', expectedLTV: 70, expectedDown: 30 }
        ];

        const results = [];
        for (const testCase of testCases) {
            const rule = await corePool.query(`
                SELECT ltv_percentage, min_down_payment_percentage
                FROM property_ownership_rules
                WHERE option_key = $1 AND is_active = true
            `, [testCase.propertyOwnership]);

            if (rule.rows.length !== 1) {
                throw new Error(`Rule not found for ${testCase.propertyOwnership}`);
            }

            const actualLTV = parseFloat(rule.rows[0].ltv_percentage);
            const actualDown = parseFloat(rule.rows[0].min_down_payment_percentage);

            if (actualLTV !== testCase.expectedLTV || actualDown !== testCase.expectedDown) {
                throw new Error(`LTV mismatch for ${testCase.propertyOwnership}: expected ${testCase.expectedLTV}%/${testCase.expectedDown}%, got ${actualLTV}%/${actualDown}%`);
            }

            results.push({
                propertyOwnership: testCase.propertyOwnership,
                ltvPercentage: actualLTV,
                downPayment: actualDown,
                valid: true
            });
        }

        return {
            testCases: results,
            allValid: true
        };
    }

    async testCircuitBreakerActive() {
        // Verify circuit breaker is active (migrated tables exist)
        const migratedTables = await corePool.query(`
            SELECT table_name
            FROM information_schema.tables
            WHERE table_schema = 'public'
            AND table_name LIKE 'migrated_%'
            ORDER BY table_name
        `);

        const expectedMigratedTables = [
            'migrated_content_items',
            'migrated_content_translations', 
            'migrated_dropdown_configs',
            'migrated_property_ownership_options'
        ];

        if (migratedTables.rows.length < 4) {
            throw new Error(`Expected at least 4 migrated tables, found ${migratedTables.rows.length}`);
        }

        const actualTableNames = migratedTables.rows.map(r => r.table_name);
        expectedMigratedTables.forEach(expectedTable => {
            if (!actualTableNames.includes(expectedTable)) {
                throw new Error(`Missing migrated table: ${expectedTable}`);
            }
        });

        return {
            migratedTableCount: migratedTables.rows.length,
            migratedTables: actualTableNames,
            circuitBreakerActive: true
        };
    }

    generateSummary() {
        const passed = this.results.tests.filter(t => t.status === 'PASS').length;
        const failed = this.results.tests.filter(t => t.status === 'FAIL').length;
        const total = this.results.tests.length;
        
        this.results.summary = {
            total,
            passed,
            failed,
            successRate: total > 0 ? ((passed / total) * 100).toFixed(1) + '%' : '0%',
            status: failed === 0 ? 'ALL_PASS' : 'HAS_FAILURES'
        };

        console.log('\n📊 MORTGAGE CALCULATOR QA SUMMARY');
        console.log('==================================');
        console.log(`Total Tests: ${total}`);
        console.log(`✅ Passed: ${passed}`);
        console.log(`❌ Failed: ${failed}`);
        console.log(`Success Rate: ${this.results.summary.successRate}`);
        console.log(`Status: ${this.results.summary.status}`);

        if (failed > 0) {
            console.log('\n🚨 Failed Tests:');
            this.results.tests.filter(t => t.status === 'FAIL').forEach(test => {
                console.log(`   • ${test.name}: ${test.error}`);
            });
        }
    }

    saveResults() {
        const fs = require('fs');
        const timestamp = Date.now();
        const filename = `mortgage-qa-${timestamp}.json`;
        
        fs.writeFileSync(filename, JSON.stringify(this.results, null, 2));
        console.log(`\n💾 Results saved to: ${filename}`);
    }

    async cleanup() {
        await corePool.end();
        await contentPool.end();
    }
}

async function main() {
    const qa = new MortgageQATest();
    try {
        await qa.runAllTests();
        await qa.cleanup();

        if (qa.results.summary.status === 'ALL_PASS') {
            console.log('\n🎉 ALL MORTGAGE CALCULATOR QA TESTS PASSED!');
            process.exit(0);
        } else {
            console.log('\n⚠️ SOME TESTS FAILED');
            process.exit(1);
        }
    } catch (error) {
        console.error('💥 QA test suite failed:', error);
        await qa.cleanup();
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

module.exports = MortgageQATest;
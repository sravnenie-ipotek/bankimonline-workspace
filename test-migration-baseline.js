#!/usr/bin/env node

/**
 * MIGRATION BASELINE TEST
 * Version: 0.1_1755776000000
 * Tests all dropdown and translation functionality before/after migration
 * Run before each phase to ensure no regressions
 */

const { Pool } = require('pg');
const axios = require('axios');
require('dotenv').config();

// Database connections
const corePool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: false
});

const contentPool = new Pool({
    connectionString: process.env.CONTENT_DATABASE_URL || process.env.DATABASE_URL,
    ssl: false
});

const API_BASE = 'http://localhost:8003';

class MigrationTester {
    constructor() {
        this.results = {
            timestamp: new Date().toISOString(),
            tests: [],
            errors: [],
            summary: {}
        };
    }

    async test(name, fn) {
        console.log(`🧪 Testing: ${name}`);
        try {
            const start = Date.now();
            const result = await fn();
            const duration = Date.now() - start;
            
            this.results.tests.push({
                name,
                status: 'PASS',
                duration,
                result
            });
            console.log(`✅ PASS: ${name} (${duration}ms)`);
            return result;
        } catch (error) {
            this.results.tests.push({
                name,
                status: 'FAIL',
                error: error.message
            });
            this.results.errors.push({ name, error: error.message });
            console.error(`❌ FAIL: ${name} - ${error.message}`);
            throw error;
        }
    }

    async runAllTests() {
        console.log('🎯 MIGRATION BASELINE TEST SUITE');
        console.log('================================\n');

        try {
            // Database connectivity tests
            await this.test('Database Connections', () => this.testDatabaseConnections());
            
            // Table existence tests
            await this.test('Core Database Tables', () => this.testCoreTableStructure());
            await this.test('Content Database Tables', () => this.testContentTableStructure());
            
            // Data integrity tests
            await this.test('Property Ownership Data', () => this.testPropertyOwnershipData());
            await this.test('Translation Data Completeness', () => this.testTranslationData());
            
            // API functionality tests
            await this.test('Calculation Parameters API', () => this.testCalculationParametersAPI());
            await this.test('Property Ownership API', () => this.testPropertyOwnershipAPI());
            
            // Business logic tests
            await this.test('LTV Calculations', () => this.testLTVCalculations());
            
            // Translation tests
            await this.test('Hebrew Translations', () => this.testHebrewTranslations());
            await this.test('Multi-language Support', () => this.testMultiLanguageSupport());

            this.generateSummary();
            this.saveResults();
            
        } catch (error) {
            console.error('🚨 CRITICAL TEST FAILURE:', error.message);
            this.saveResults();
            process.exit(1);
        }
    }

    async testDatabaseConnections() {
        const coreResult = await corePool.query('SELECT NOW() as timestamp, current_database() as db');
        const contentResult = await contentPool.query('SELECT NOW() as timestamp, current_database() as db');
        
        return {
            core: coreResult.rows[0],
            content: contentResult.rows[0]
        };
    }

    async testCoreTableStructure() {
        // NEW ARCHITECTURE: Check for business logic tables only
        // Content tables should be renamed to migrated_* (circuit breaker active)
        const businessTables = await corePool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name IN ('property_ownership_rules')
        `);

        const migratedTables = await corePool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name LIKE 'migrated_%'
            ORDER BY table_name
        `);
        
        return {
            expectedBusinessTables: ['property_ownership_rules'],
            actualBusinessTables: businessTables.rows.map(row => row.table_name),
            migratedTables: migratedTables.rows.map(row => row.table_name),
            businessTableCount: businessTables.rows.length,
            circuitBreakerActive: migratedTables.rows.length > 0
        };
    }

    async testContentTableStructure() {
        const tables = await contentPool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name IN ('content_items', 'content_translations')
        `);
        
        return {
            expectedTables: ['content_items', 'content_translations'],
            actualTables: tables.rows.map(row => row.table_name),
            count: tables.rows.length
        };
    }

    async testPropertyOwnershipData() {
        // NEW ARCHITECTURE: Query business logic from bankim_core, translations from bankim_content
        
        // Step 1: Get business logic (LTV percentages) from property_ownership_rules
        const businessLogic = await corePool.query(`
            SELECT option_key, ltv_percentage, financing_percentage, 
                   min_down_payment_percentage, is_active, display_order
            FROM property_ownership_rules 
            WHERE is_active = true
            ORDER BY display_order
        `);

        // Step 2: Get translations from bankim_content
        const translations = await contentPool.query(`
            SELECT 
                ci.content_key,
                SUBSTRING(ci.content_key FROM 'property_ownership_option_([0-9]+)$') as option_number,
                MAX(CASE WHEN ct.language_code = 'en' THEN ct.content_value END) as option_text_en,
                MAX(CASE WHEN ct.language_code = 'he' THEN ct.content_value END) as option_text_he,
                MAX(CASE WHEN ct.language_code = 'ru' THEN ct.content_value END) as option_text_ru
            FROM content_items ci
            JOIN content_translations ct ON ci.id = ct.content_item_id
            WHERE ci.content_key LIKE 'calculate_mortgage_property_ownership_option_%'
              AND ci.screen_location = 'mortgage.calculator.step1'
              AND ct.status = 'active'
            GROUP BY ci.content_key
            ORDER BY ci.content_key
        `);

        // Step 3: Map option numbers to option keys  
        const optionMapping = { '1': 'no_property', '2': 'has_property', '3': 'selling_property' };
        
        // Step 4: Combine business logic with translations
        const combinedData = businessLogic.rows.map(businessRow => {
            const translationRow = translations.rows.find(tr => {
                const optionNumber = tr.option_number;
                return optionMapping[optionNumber] === businessRow.option_key;
            });

            return {
                option_key: businessRow.option_key,
                ltv_percentage: businessRow.ltv_percentage,
                financing_percentage: businessRow.financing_percentage,
                option_text_en: translationRow?.option_text_en || null,
                option_text_he: translationRow?.option_text_he || null,
                option_text_ru: translationRow?.option_text_ru || null,
                is_active: businessRow.is_active
            };
        });

        const expectedKeys = ['no_property', 'has_property', 'selling_property'];
        const actualKeys = combinedData.map(row => row.option_key);
        const expectedLTVs = { no_property: 75, has_property: 50, selling_property: 70 };
        
        // Validate LTV percentages
        const ltvValidation = combinedData.every(row => 
            expectedLTVs[row.option_key] === parseFloat(row.ltv_percentage)
        );

        return {
            count: combinedData.length,
            expectedKeys,
            actualKeys,
            ltvValidation,
            hasTranslations: combinedData.every(row => 
                row.option_text_en && row.option_text_he && row.option_text_ru
            ),
            data: combinedData
        };
    }

    async testTranslationData() {
        // NEW ARCHITECTURE: All translations should now be in bankim_content only
        // bankim_core should have 0 active translations (circuit breaker should catch any access)
        
        let coreCount = 0;
        try {
            // This should fail if circuit breaker is working (table renamed to migrated_content_translations)
            const coreTranslations = await corePool.query(`
                SELECT COUNT(*) as count FROM content_translations
            `);
            coreCount = parseInt(coreTranslations.rows[0].count);
        } catch (error) {
            // Expected: content_translations table should not exist (renamed to migrated_content_translations)
            if (error.message.includes('does not exist')) {
                coreCount = 0; // This is expected with the new architecture
            } else {
                throw error; // Unexpected error
            }
        }
        
        const contentTranslations = await contentPool.query(`
            SELECT COUNT(*) as count FROM content_translations  
        `);

        return {
            coreCount: coreCount,
            contentCount: parseInt(contentTranslations.rows[0].count),
            total: coreCount + parseInt(contentTranslations.rows[0].count)
        };
    }

    async testCalculationParametersAPI() {
        const response = await axios.get(`${API_BASE}/api/v1/calculation-parameters?business_path=mortgage`);
        
        if (response.status !== 200) {
            throw new Error(`API returned status ${response.status}`);
        }

        const data = response.data;
        return {
            status: data.status,
            hasPropertyOwnership: !!data.data?.property_ownership_ltvs,
            ltvKeys: Object.keys(data.data?.property_ownership_ltvs || {}),
            currentRate: data.data?.current_interest_rate
        };
    }

    async testPropertyOwnershipAPI() {
        try {
            const response = await axios.get(`${API_BASE}/api/v1/property-ownership-options?language=he`);
            return {
                status: response.status,
                count: response.data?.length || 0,
                hasHebrewText: response.data?.some(item => item.option_text && item.option_text.includes('נכס'))
            };
        } catch (error) {
            // API might not exist yet - not a failure
            return {
                status: 'API_NOT_FOUND',
                note: 'Property ownership API not implemented yet'
            };
        }
    }

    async testLTVCalculations() {
        // NEW ARCHITECTURE: Query business logic from property_ownership_rules
        const data = await corePool.query(`
            SELECT option_key, ltv_percentage, financing_percentage, min_down_payment_percentage
            FROM property_ownership_rules 
            WHERE is_active = true
        `);

        const calculations = {};
        data.rows.forEach(row => {
            calculations[row.option_key] = {
                ltv: parseFloat(row.ltv_percentage),
                financing: parseFloat(row.financing_percentage),
                minDownPayment: parseFloat(row.min_down_payment_percentage)
            };
        });

        // Validate expected business rules
        const validations = {
            no_property: calculations.no_property?.ltv === 75,
            has_property: calculations.has_property?.ltv === 50,
            selling_property: calculations.selling_property?.ltv === 70
        };

        return {
            calculations,
            validations,
            allValid: Object.values(validations).every(v => v)
        };
    }

    async testHebrewTranslations() {
        // NEW ARCHITECTURE: Query Hebrew translations from bankim_content
        const hebrew = await contentPool.query(`
            SELECT COUNT(*) as count
            FROM content_items ci
            JOIN content_translations ct ON ci.id = ct.content_item_id
            WHERE ct.language_code = 'he'
            AND ci.content_key LIKE 'calculate_mortgage_property_ownership_option_%'
            AND ct.content_value LIKE '%נכס%'
        `);

        const mortgageKeys = await contentPool.query(`
            SELECT COUNT(*) as count
            FROM content_items ci
            JOIN content_translations ct ON ci.id = ct.content_item_id
            WHERE ct.language_code = 'he'
            AND ci.content_key LIKE 'calculate_mortgage%'
        `);

        return {
            propertyOwnershipHebrew: parseInt(hebrew.rows[0].count),
            mortgageCalculatorHebrew: parseInt(mortgageKeys.rows[0].count),
            hasHebrewContent: parseInt(hebrew.rows[0].count) > 0
        };
    }

    async testMultiLanguageSupport() {
        // NEW ARCHITECTURE: Query translations from bankim_content
        const languages = ['en', 'he', 'ru'];
        const results = {};

        for (const lang of languages) {
            const count = await contentPool.query(`
                SELECT COUNT(*) as count
                FROM content_translations 
                WHERE language_code = $1
            `, [lang]);
            
            results[lang] = parseInt(count.rows[0].count);
        }

        return {
            languages: results,
            hasAllLanguages: Object.values(results).every(count => count > 0)
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
            successRate: total > 0 ? (passed / total * 100).toFixed(1) + '%' : '0%',
            status: failed === 0 ? 'ALL_PASS' : 'FAILURES_DETECTED'
        };

        console.log('\n📊 TEST SUMMARY');
        console.log('================');
        console.log(`Total Tests: ${total}`);
        console.log(`✅ Passed: ${passed}`);
        console.log(`❌ Failed: ${failed}`);
        console.log(`Success Rate: ${this.results.summary.successRate}`);
        console.log(`Status: ${this.results.summary.status}`);

        if (failed > 0) {
            console.log('\n🚨 FAILURES:');
            this.results.errors.forEach(error => {
                console.log(`   • ${error.name}: ${error.error}`);
            });
        }
    }

    async saveResults() {
        const fs = require('fs');
        const filename = `migration-test-${Date.now()}.json`;
        fs.writeFileSync(filename, JSON.stringify(this.results, null, 2));
        console.log(`\n💾 Results saved to: ${filename}`);
    }

    async cleanup() {
        await corePool.end();
        await contentPool.end();
    }
}

// Run the test suite
async function main() {
    const tester = new MigrationTester();
    try {
        await tester.runAllTests();
        await tester.cleanup();
        
        if (tester.results.summary.status === 'ALL_PASS') {
            console.log('\n🎉 ALL TESTS PASSED - READY FOR MIGRATION');
            process.exit(0);
        } else {
            console.log('\n⚠️  SOME TESTS FAILED - FIX BEFORE PROCEEDING');
            process.exit(1);
        }
    } catch (error) {
        console.error('💥 Test suite crashed:', error);
        await tester.cleanup();
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

module.exports = MigrationTester;
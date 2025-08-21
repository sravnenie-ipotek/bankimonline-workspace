#!/usr/bin/env node

/**
 * COMPREHENSIVE QA VALIDATION
 * Version: 0.1_1755776900000
 * Tests all translations and dropdowns after database architecture migration
 * Validates bankim_core (business logic) vs bankim_content (UI content) separation
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

class ComprehensiveQA {
    constructor() {
        this.results = {
            timestamp: new Date().toISOString(),
            architecture: {
                businessLogic: {},
                contentSeparation: {},
                circuitBreaker: {}
            },
            translations: {
                coverage: {},
                integrity: {},
                languages: {}
            },
            dropdowns: {
                configuration: {},
                functionality: {},
                apiEndpoints: {}
            },
            apiValidation: {},
            summary: {}
        };
    }

    async runComprehensiveQA() {
        console.log('🔍 COMPREHENSIVE QA VALIDATION');
        console.log('==============================\n');

        try {
            // Architecture Validation
            await this.validateArchitectureSeparation();
            
            // Translation Validation
            await this.validateAllTranslations();
            
            // Dropdown Validation
            await this.validateAllDropdowns();
            
            // API Endpoint Validation
            await this.validateAPIEndpoints();
            
            // Business Logic Validation
            await this.validateBusinessLogic();
            
            this.generateSummary();
            this.saveResults();
            
        } catch (error) {
            console.error('🚨 QA VALIDATION FAILED:', error.message);
            console.error('Stack:', error.stack);
            process.exit(1);
        }
    }

    async validateArchitectureSeparation() {
        console.log('🏗️ ARCHITECTURE SEPARATION VALIDATION');
        console.log('=====================================');

        // Check bankim_core has ZERO content tables
        const coreContentTables = await corePool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name IN ('content_items', 'content_translations', 'dropdown_configs', 'locales')
        `);

        // Check migrated tables exist (circuit breaker active)
        const migratedTables = await corePool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name LIKE 'migrated_%'
            ORDER BY table_name
        `);

        // Check business logic tables exist
        const businessTables = await corePool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name IN ('property_ownership_rules', 'banking_standards', 'calculation_parameters')
        `);

        // Check content database has all content tables
        const contentTables = await contentPool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name IN ('content_items', 'content_translations', 'dropdown_configs', 'locales')
        `);

        this.results.architecture = {
            businessLogic: {
                coreContentTablesRemoved: coreContentTables.rows.length === 0,
                businessTablesPresent: businessTables.rows.length >= 3,
                businessTables: businessTables.rows.map(r => r.table_name)
            },
            circuitBreaker: {
                active: migratedTables.rows.length >= 4,
                migratedTables: migratedTables.rows.map(r => r.table_name)
            },
            contentSeparation: {
                contentTablesPresent: contentTables.rows.length >= 4,
                contentTables: contentTables.rows.map(r => r.table_name)
            }
        };

        console.log('✅ Core database has ZERO content tables:', this.results.architecture.businessLogic.coreContentTablesRemoved);
        console.log('✅ Circuit breaker active:', this.results.architecture.circuitBreaker.active);
        console.log('✅ Content database complete:', this.results.architecture.contentSeparation.contentTablesPresent);
        console.log();
    }

    async validateAllTranslations() {
        console.log('🌐 TRANSLATION VALIDATION');
        console.log('=========================');

        // Check translation coverage by language
        const translationsByLanguage = await contentPool.query(`
            SELECT 
                ct.language_code,
                COUNT(*) as translation_count,
                COUNT(DISTINCT ci.content_key) as unique_keys
            FROM content_translations ct
            JOIN content_items ci ON ct.content_item_id = ci.id
            WHERE ct.status = 'active'
            GROUP BY ct.language_code
            ORDER BY ct.language_code
        `);

        // Check for missing translations (keys that don't have all 3 languages)
        const missingTranslations = await contentPool.query(`
            SELECT 
                ci.content_key,
                ci.screen_location,
                STRING_AGG(ct.language_code, ', ' ORDER BY ct.language_code) as available_languages,
                COUNT(ct.language_code) as language_count
            FROM content_items ci
            LEFT JOIN content_translations ct ON ci.id = ct.content_item_id AND ct.status = 'active'
            GROUP BY ci.id, ci.content_key, ci.screen_location
            HAVING COUNT(ct.language_code) < 3
            ORDER BY ci.content_key
            LIMIT 20
        `);

        // Check mortgage calculator specific translations
        const mortgageTranslations = await contentPool.query(`
            SELECT 
                ct.language_code,
                COUNT(*) as count
            FROM content_items ci
            JOIN content_translations ct ON ci.id = ct.content_item_id
            WHERE ci.content_key LIKE 'calculate_mortgage%'
            AND ct.status = 'active'
            GROUP BY ct.language_code
            ORDER BY ct.language_code
        `);

        // Check property ownership translations specifically
        const propertyOwnershipTranslations = await contentPool.query(`
            SELECT 
                ci.content_key,
                ct.language_code,
                ct.content_value
            FROM content_items ci
            JOIN content_translations ct ON ci.id = ct.content_item_id
            WHERE ci.content_key LIKE 'calculate_mortgage_property_ownership%'
            AND ci.screen_location = 'mortgage_step1'
            ORDER BY ci.content_key, ct.language_code
        `);

        // Check Hebrew content specifically (RTL validation)
        const hebrewContent = await contentPool.query(`
            SELECT COUNT(*) as count
            FROM content_translations ct
            JOIN content_items ci ON ct.content_item_id = ci.id
            WHERE ct.language_code = 'he'
            AND ct.content_value ~ '[א-ת]'
            AND ci.content_key LIKE 'calculate_mortgage%'
        `);

        this.results.translations = {
            coverage: {
                byLanguage: translationsByLanguage.rows.reduce((acc, row) => {
                    acc[row.language_code] = {
                        count: parseInt(row.translation_count),
                        uniqueKeys: parseInt(row.unique_keys)
                    };
                    return acc;
                }, {}),
                missingTranslationsCount: missingTranslations.rows.length,
                missingTranslations: missingTranslations.rows.slice(0, 10)
            },
            integrity: {
                mortgageTranslations: mortgageTranslations.rows,
                propertyOwnershipComplete: propertyOwnershipTranslations.rows.length === 15, // 5 keys × 3 languages (includes title + 3 options + placeholder)
                hebrewContentValid: parseInt(hebrewContent.rows[0].count) > 0
            },
            languages: {
                propertyOwnership: this.groupPropertyOwnershipTranslations(propertyOwnershipTranslations.rows)
            }
        };

        console.log('📊 Translation Coverage:');
        Object.entries(this.results.translations.coverage.byLanguage).forEach(([lang, data]) => {
            console.log(`   ${lang}: ${data.count} translations (${data.uniqueKeys} unique keys)`);
        });
        console.log('⚠️  Missing translations:', this.results.translations.coverage.missingTranslationsCount);
        console.log('✅ Property ownership complete:', this.results.translations.integrity.propertyOwnershipComplete);
        console.log('✅ Hebrew content valid:', this.results.translations.integrity.hebrewContentValid);
        console.log();
    }

    groupPropertyOwnershipTranslations(rows) {
        const grouped = {};
        rows.forEach(row => {
            const optionMatch = row.content_key.match(/option_(\d+)$/);
            if (optionMatch) {
                const optionNum = optionMatch[1];
                if (!grouped[optionNum]) grouped[optionNum] = {};
                grouped[optionNum][row.language_code] = row.content_value;
            }
        });
        return grouped;
    }

    async validateAllDropdowns() {
        console.log('📋 DROPDOWN VALIDATION');
        console.log('======================');

        // Check dropdown_configs table
        const dropdownConfigs = await contentPool.query(`
            SELECT field_name, screen_location, config
            FROM dropdown_configs
            ORDER BY field_name, screen_location
        `);

        // Check specific dropdown configurations
        const propertyOwnershipConfig = await contentPool.query(`
            SELECT config
            FROM dropdown_configs
            WHERE field_name = 'property_ownership'
            AND screen_location = 'mortgage_step1'
        `);

        // Validate dropdown API endpoints
        const dropdownEndpoints = [
            '/api/v1/dropdowns',
            '/api/v1/dropdowns/property_ownership',
            '/api/v1/calculation-parameters?business_path=mortgage'
        ];

        const apiResults = {};
        for (const endpoint of dropdownEndpoints) {
            try {
                const response = await axios.get(`${API_BASE}${endpoint}`);
                apiResults[endpoint] = {
                    status: response.status,
                    hasData: response.data && Object.keys(response.data).length > 0,
                    dataKeys: response.data ? Object.keys(response.data) : []
                };
            } catch (error) {
                apiResults[endpoint] = {
                    status: error.response?.status || 'ERROR',
                    error: error.message
                };
            }
        }

        this.results.dropdowns = {
            configuration: {
                totalConfigs: dropdownConfigs.rows.length,
                configsByField: dropdownConfigs.rows.reduce((acc, row) => {
                    if (!acc[row.field_name]) acc[row.field_name] = 0;
                    acc[row.field_name]++;
                    return acc;
                }, {}),
                propertyOwnershipConfigured: propertyOwnershipConfig.rows.length > 0
            },
            apiEndpoints: apiResults,
            functionality: {
                allEndpointsWorking: Object.values(apiResults).every(r => r.status === 200)
            }
        };

        console.log('📊 Dropdown Configurations:');
        console.log(`   Total configs: ${this.results.dropdowns.configuration.totalConfigs}`);
        Object.entries(this.results.dropdowns.configuration.configsByField).forEach(([field, count]) => {
            console.log(`   ${field}: ${count} configurations`);
        });
        console.log('✅ Property ownership configured:', this.results.dropdowns.configuration.propertyOwnershipConfigured);
        console.log('✅ All API endpoints working:', this.results.dropdowns.functionality.allEndpointsWorking);
        console.log();
    }

    async validateAPIEndpoints() {
        console.log('🔌 API ENDPOINT VALIDATION');
        console.log('==========================');

        const endpoints = [
            '/api/v1/calculation-parameters?business_path=mortgage',
            '/api/v1/banks',
            '/api/v1/cities'
            // Note: /api/v1/locales endpoints don't exist in current server setup
        ];

        const results = {};
        for (const endpoint of endpoints) {
            try {
                const response = await axios.get(`${API_BASE}${endpoint}`, { timeout: 5000 });
                results[endpoint] = {
                    status: response.status,
                    responseTime: Date.now(),
                    dataSize: JSON.stringify(response.data).length,
                    hasData: response.data && (
                        Array.isArray(response.data) ? response.data.length > 0 : Object.keys(response.data).length > 0
                    )
                };
            } catch (error) {
                results[endpoint] = {
                    status: error.response?.status || 'ERROR',
                    error: error.message
                };
            }
        }

        this.results.apiValidation = {
            endpoints: results,
            allWorking: Object.values(results).every(r => r.status === 200),
            workingCount: Object.values(results).filter(r => r.status === 200).length,
            totalCount: endpoints.length
        };

        console.log('📊 API Endpoint Results:');
        Object.entries(results).forEach(([endpoint, result]) => {
            const status = result.status === 200 ? '✅' : '❌';
            console.log(`   ${status} ${endpoint}: ${result.status} ${result.error ? '(' + result.error + ')' : ''}`);
        });
        console.log();
    }

    async validateBusinessLogic() {
        console.log('⚡ BUSINESS LOGIC VALIDATION');
        console.log('============================');

        // Validate property ownership LTV rules
        const ltvRules = await corePool.query(`
            SELECT option_key, ltv_percentage, financing_percentage, min_down_payment_percentage
            FROM property_ownership_rules
            WHERE is_active = true
            ORDER BY display_order
        `);

        // Validate banking standards
        const bankingStandards = await corePool.query(`
            SELECT COUNT(*) as count
            FROM banking_standards
            WHERE is_active = true
        `);

        // Test LTV calculations
        const ltvCalculations = {};
        const expectedLTVs = {
            'no_property': 75,
            'has_property': 50,
            'selling_property': 70
        };

        ltvRules.rows.forEach(rule => {
            ltvCalculations[rule.option_key] = {
                ltv: parseFloat(rule.ltv_percentage),
                financing: parseFloat(rule.financing_percentage),
                minDownPayment: parseFloat(rule.min_down_payment_percentage),
                valid: parseFloat(rule.ltv_percentage) === expectedLTVs[rule.option_key]
            };
        });

        this.results.businessLogic = {
            ltvRules: {
                count: ltvRules.rows.length,
                calculations: ltvCalculations,
                allValid: Object.values(ltvCalculations).every(calc => calc.valid)
            },
            bankingStandards: {
                activeCount: parseInt(bankingStandards.rows[0].count)
            }
        };

        console.log('📊 Business Logic Validation:');
        console.log(`   LTV rules configured: ${this.results.businessLogic.ltvRules.count}`);
        console.log('   LTV calculations:');
        Object.entries(ltvCalculations).forEach(([key, calc]) => {
            const status = calc.valid ? '✅' : '❌';
            console.log(`     ${status} ${key}: ${calc.ltv}% LTV, ${calc.minDownPayment}% down payment`);
        });
        console.log(`   Banking standards active: ${this.results.businessLogic.bankingStandards.activeCount}`);
        console.log();
    }

    generateSummary() {
        const issues = [];
        
        // Architecture issues
        if (!this.results.architecture.businessLogic.coreContentTablesRemoved) {
            issues.push('Core database still contains content tables');
        }
        if (!this.results.architecture.circuitBreaker.active) {
            issues.push('Circuit breaker not active');
        }
        
        // Translation issues
        if (this.results.translations.coverage.missingTranslationsCount > 0) {
            issues.push(`${this.results.translations.coverage.missingTranslationsCount} missing translations`);
        }
        if (!this.results.translations.integrity.propertyOwnershipComplete) {
            issues.push('Property ownership translations incomplete');
        }
        
        // API issues
        if (!this.results.apiValidation.allWorking) {
            const failedCount = this.results.apiValidation.totalCount - this.results.apiValidation.workingCount;
            issues.push(`${failedCount} API endpoints failing`);
        }
        
        // Business logic issues
        if (!this.results.businessLogic.ltvRules.allValid) {
            issues.push('LTV calculations invalid');
        }

        this.results.summary = {
            overallStatus: issues.length === 0 ? 'PASS' : 'ISSUES_FOUND',
            issueCount: issues.length,
            issues: issues,
            validationAreas: {
                architecture: this.results.architecture.businessLogic.coreContentTablesRemoved && 
                             this.results.architecture.circuitBreaker.active,
                translations: this.results.translations.coverage.missingTranslationsCount === 0,
                dropdowns: this.results.dropdowns.functionality.allEndpointsWorking,
                apiEndpoints: this.results.apiValidation.allWorking,
                businessLogic: this.results.businessLogic.ltvRules.allValid
            }
        };

        console.log('📋 COMPREHENSIVE QA SUMMARY');
        console.log('============================');
        console.log(`Overall Status: ${this.results.summary.overallStatus}`);
        console.log(`Issues Found: ${this.results.summary.issueCount}`);
        
        if (issues.length > 0) {
            console.log('\n🚨 Issues:');
            issues.forEach(issue => console.log(`   • ${issue}`));
        }

        console.log('\n✅ Validation Areas:');
        Object.entries(this.results.summary.validationAreas).forEach(([area, status]) => {
            const emoji = status ? '✅' : '❌';
            console.log(`   ${emoji} ${area}`);
        });
    }

    saveResults() {
        const fs = require('fs');
        const timestamp = Date.now();
        const filename = `comprehensive-qa-${timestamp}.json`;
        
        fs.writeFileSync(filename, JSON.stringify(this.results, null, 2));
        console.log(`\n💾 Results saved to: ${filename}`);
    }

    async cleanup() {
        await corePool.end();
        await contentPool.end();
    }
}

async function main() {
    const qa = new ComprehensiveQA();
    try {
        await qa.runComprehensiveQA();
        await qa.cleanup();
        
        if (qa.results.summary.overallStatus === 'PASS') {
            console.log('\n🎉 COMPREHENSIVE QA VALIDATION PASSED');
            process.exit(0);
        } else {
            console.log('\n⚠️ COMPREHENSIVE QA VALIDATION FOUND ISSUES');
            process.exit(1);
        }
    } catch (error) {
        console.error('💥 QA validation failed:', error);
        await qa.cleanup();
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

module.exports = ComprehensiveQA;
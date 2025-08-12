#!/usr/bin/env node

/**
 * ULTRA-CRITICAL REGRESSION VALIDATION SUITE
 * 
 * Validates dropdown system changes across all affected components:
 * 1. API endpoint validation
 * 2. Screen location detection
 * 3. Component mapping logic
 * 4. Cross-service independence
 * 5. Backward compatibility
 */

const axios = require('axios');

// Simple color functions
const colors = {
    red: (text) => `\x1b[31m${text}\x1b[0m`,
    green: (text) => `\x1b[32m${text}\x1b[0m`,
    yellow: (text) => `\x1b[33m${text}\x1b[0m`,
    blue: (text) => `\x1b[34m${text}\x1b[0m`,
    cyan: (text) => `\x1b[36m${text}\x1b[0m`,
    white: (text) => text,
    bold: {
        red: (text) => `\x1b[1m\x1b[31m${text}\x1b[0m`,
        green: (text) => `\x1b[1m\x1b[32m${text}\x1b[0m`,
        yellow: (text) => `\x1b[1m\x1b[33m${text}\x1b[0m`,
        blue: (text) => `\x1b[1m\x1b[34m${text}\x1b[0m`,
        cyan: (text) => `\x1b[1m\x1b[36m${text}\x1b[0m`
    }
};

const BASE_URL = 'http://localhost:8003';
const FRONTEND_URL = 'http://localhost:5174';

class ValidationSuite {
    constructor() {
        this.results = {
            apiTests: [],
            componentTests: [],
            integrationTests: [],
            errors: [],
            warnings: []
        };
    }

    log(type, message, details = '') {
        const timestamp = new Date().toISOString();
        const colorMap = {
            'SUCCESS': colors.green,
            'ERROR': colors.red,
            'WARNING': colors.yellow,
            'INFO': colors.blue,
            'TEST': colors.cyan
        };
        
        console.log(`${colorMap[type] || colors.white}[${timestamp}] ${type}: ${message}${details}`);
    }

    async validateApiEndpoints() {
        this.log('TEST', '🔍 TESTING API ENDPOINTS');
        
        const endpoints = [
            '/api/dropdowns/mortgage_step1/en',
            '/api/dropdowns/mortgage_step2/en',
            '/api/dropdowns/mortgage_step3/en',
            '/api/dropdowns/mortgage_step4/en',
            '/api/dropdowns/credit_step1/en',
            '/api/dropdowns/credit_step2/en',
            '/api/dropdowns/credit_step3/en',
            '/api/dropdowns/refinance_mortgage_step1/en',
            '/api/dropdowns/refinance_mortgage_step2/en',
            '/api/dropdowns/refinance_mortgage_step3/en'
        ];

        for (const endpoint of endpoints) {
            try {
                const response = await axios.get(`${BASE_URL}${endpoint}`, { timeout: 5000 });
                
                if (response.status === 200) {
                    const data = response.data;
                    
                    // Validate response structure
                    if (data.dropdowns && data.options && data.placeholders) {
                        this.log('SUCCESS', `✅ ${endpoint}`, ` - ${data.dropdowns.length} dropdowns found`);
                        this.results.apiTests.push({
                            endpoint,
                            status: 'SUCCESS',
                            dropdownCount: data.dropdowns.length,
                            hasOptions: Object.keys(data.options).length > 0,
                            hasPlaceholders: Object.keys(data.placeholders).length > 0
                        });
                    } else {
                        this.log('ERROR', `❌ ${endpoint}`, ' - Invalid response structure');
                        this.results.errors.push(`Invalid response structure for ${endpoint}`);
                    }
                } else {
                    this.log('ERROR', `❌ ${endpoint}`, ` - HTTP ${response.status}`);
                    this.results.errors.push(`HTTP ${response.status} for ${endpoint}`);
                }
            } catch (error) {
                this.log('ERROR', `❌ ${endpoint}`, ` - ${error.message}`);
                this.results.errors.push(`${endpoint}: ${error.message}`);
            }
        }
    }

    async validateCriticalDropdowns() {
        this.log('TEST', '🔍 TESTING CRITICAL DROPDOWN CONTENT');
        
        const criticalTests = [
            {
                endpoint: '/api/dropdowns/mortgage_step3/en',
                requiredDropdowns: ['mortgage_step3_main_source', 'mortgage_step3_field_of_activity'],
                description: 'Mortgage Step 3 - Income Components'
            },
            {
                endpoint: '/api/dropdowns/credit_step3/en',
                requiredDropdowns: ['credit_step3_main_source'],
                description: 'Credit Step 3 - Income Components'
            },
            {
                endpoint: '/api/dropdowns/mortgage_step1/en',
                requiredDropdowns: ['mortgage_step1_property_ownership', 'mortgage_step1_when_needed'],
                description: 'Mortgage Step 1 - Basic Params'
            }
        ];

        for (const test of criticalTests) {
            try {
                const response = await axios.get(`${BASE_URL}${test.endpoint}`, { timeout: 5000 });
                const data = response.data;

                this.log('INFO', `Testing ${test.description}`);

                for (const requiredDropdown of test.requiredDropdowns) {
                    const dropdown = data.dropdowns.find(d => d.key === requiredDropdown);
                    const options = data.options[requiredDropdown];
                    const placeholder = data.placeholders[requiredDropdown];

                    if (dropdown && options && options.length > 0) {
                        this.log('SUCCESS', `  ✅ ${requiredDropdown}`, ` - ${options.length} options`);
                        this.results.componentTests.push({
                            test: test.description,
                            dropdown: requiredDropdown,
                            status: 'SUCCESS',
                            optionCount: options.length,
                            hasPlaceholder: !!placeholder
                        });
                    } else {
                        this.log('ERROR', `  ❌ ${requiredDropdown}`, ' - Missing or incomplete');
                        this.results.errors.push(`Missing dropdown: ${requiredDropdown} in ${test.endpoint}`);
                    }
                }
            } catch (error) {
                this.log('ERROR', `❌ ${test.description}`, ` - ${error.message}`);
                this.results.errors.push(`${test.description}: ${error.message}`);
            }
        }
    }

    async validateSemanticMapping() {
        this.log('TEST', '🔍 TESTING SEMANTIC VALUE MAPPING');
        
        try {
            // Test credit step 3 for semantic values
            const response = await axios.get(`${BASE_URL}/api/dropdowns/credit_step3/en`, { timeout: 5000 });
            const data = response.data;
            
            const incomeOptions = data.options['credit_step3_main_source'] || [];
            
            // Check for semantic values (not numeric)
            const hasSemanticValues = incomeOptions.some(opt => 
                ['employee', 'selfemployed', 'pension'].includes(opt.value)
            );
            
            const hasNumericValues = incomeOptions.some(opt => 
                ['1', '2', '3'].includes(opt.value)
            );

            if (hasSemanticValues && !hasNumericValues) {
                this.log('SUCCESS', '✅ Credit Step 3 uses semantic values', ` - Found: ${incomeOptions.map(o => o.value).join(', ')}`);
                this.results.componentTests.push({
                    test: 'Semantic Mapping',
                    status: 'SUCCESS',
                    details: 'Credit uses semantic values, not numeric'
                });
            } else if (hasNumericValues) {
                this.log('WARNING', '⚠️ Credit Step 3 still has numeric values', ` - Found: ${incomeOptions.map(o => o.value).join(', ')}`);
                this.results.warnings.push('Credit step 3 contains numeric values instead of semantic');
            } else {
                this.log('ERROR', '❌ Credit Step 3 income options not found');
                this.results.errors.push('Credit step 3 credit_step3_main_source options missing');
            }
        } catch (error) {
            this.log('ERROR', '❌ Semantic mapping validation failed', ` - ${error.message}`);
            this.results.errors.push(`Semantic mapping test: ${error.message}`);
        }
    }

    async validateCrosServiceIndependence() {
        this.log('TEST', '🔍 TESTING CROSS-SERVICE INDEPENDENCE');
        
        const services = [
            { name: 'Mortgage', step3: '/api/dropdowns/mortgage_step3/en' },
            { name: 'Credit', step3: '/api/dropdowns/credit_step3/en' },
            { name: 'Refinance', step3: '/api/dropdowns/refinance_mortgage_step3/en' }
        ];

        const serviceData = {};
        
        // Fetch data for all services
        for (const service of services) {
            try {
                const response = await axios.get(`${BASE_URL}${service.step3}`, { timeout: 5000 });
                serviceData[service.name] = response.data;
            } catch (error) {
                this.log('ERROR', `❌ Failed to fetch ${service.name} step 3`, ` - ${error.message}`);
                this.results.errors.push(`Cross-service test: Failed to fetch ${service.name}`);
            }
        }

        // Compare content to ensure independence
        if (serviceData.Mortgage && serviceData.Credit) {
            const mortgageIncome = serviceData.Mortgage.options['mortgage_step3_main_source'] || [];
            const creditIncome = serviceData.Credit.options['credit_step3_main_source'] || [];
            
            // They should have same structure but potentially different content/translations
            if (mortgageIncome.length > 0 && creditIncome.length > 0) {
                this.log('SUCCESS', '✅ Both services have income options');
                
                // Check if they're using their own screen locations
                const mortgageHasMortgageContent = JSON.stringify(serviceData.Mortgage).includes('mortgage_step3');
                const creditHasCreditContent = JSON.stringify(serviceData.Credit).includes('credit_step3');
                
                if (mortgageHasMortgageContent && creditHasCreditContent) {
                    this.log('SUCCESS', '✅ Services use independent screen locations');
                    this.results.integrationTests.push({
                        test: 'Cross-Service Independence',
                        status: 'SUCCESS',
                        details: 'Each service uses its own screen location'
                    });
                } else {
                    this.log('WARNING', '⚠️ Services may share screen location content');
                    this.results.warnings.push('Services may not be fully independent');
                }
            } else {
                this.log('ERROR', '❌ Missing income options in one or both services');
                this.results.errors.push('Missing income options in service comparison');
            }
        }
    }

    async validateBackwardCompatibility() {
        this.log('TEST', '🔍 TESTING BACKWARD COMPATIBILITY');
        
        const legacyEndpoints = [
            '/api/v1/calculation-parameters?business_path=mortgage',
            '/api/v1/calculation-parameters?business_path=credit',
            '/api/v1/banks',
            '/api/v1/cities'
        ];

        for (const endpoint of legacyEndpoints) {
            try {
                const response = await axios.get(`${BASE_URL}${endpoint}`, { timeout: 5000 });
                
                if (response.status === 200 && response.data) {
                    this.log('SUCCESS', `✅ Legacy endpoint: ${endpoint}`);
                    this.results.integrationTests.push({
                        test: 'Backward Compatibility',
                        endpoint,
                        status: 'SUCCESS'
                    });
                } else {
                    this.log('ERROR', `❌ Legacy endpoint failed: ${endpoint}`);
                    this.results.errors.push(`Legacy endpoint failed: ${endpoint}`);
                }
            } catch (error) {
                this.log('ERROR', `❌ Legacy endpoint error: ${endpoint}`, ` - ${error.message}`);
                this.results.errors.push(`Legacy endpoint ${endpoint}: ${error.message}`);
            }
        }
    }

    generateReport() {
        this.log('INFO', '📊 GENERATING VALIDATION REPORT');
        
        console.log('\n' + '='.repeat(80));
        console.log(colors.bold.blue('DROPDOWN SYSTEM REGRESSION VALIDATION REPORT'));
        console.log('='.repeat(80));
        
        console.log(colors.bold.green(`\n✅ API TESTS PASSED: ${this.results.apiTests.filter(t => t.status === 'SUCCESS').length}`));
        console.log(colors.bold.green(`✅ COMPONENT TESTS PASSED: ${this.results.componentTests.filter(t => t.status === 'SUCCESS').length}`));
        console.log(colors.bold.green(`✅ INTEGRATION TESTS PASSED: ${this.results.integrationTests.filter(t => t.status === 'SUCCESS').length}`));
        
        if (this.results.warnings.length > 0) {
            console.log(colors.bold.yellow(`\n⚠️ WARNINGS: ${this.results.warnings.length}`));
            this.results.warnings.forEach(warning => console.log(colors.yellow(`  • ${warning}`)));
        }
        
        if (this.results.errors.length > 0) {
            console.log(colors.bold.red(`\n❌ ERRORS: ${this.results.errors.length}`));
            this.results.errors.forEach(error => console.log(colors.red(`  • ${error}`)));
        }
        
        const totalTests = this.results.apiTests.length + this.results.componentTests.length + this.results.integrationTests.length;
        const passedTests = this.results.apiTests.filter(t => t.status === 'SUCCESS').length + 
                           this.results.componentTests.filter(t => t.status === 'SUCCESS').length + 
                           this.results.integrationTests.filter(t => t.status === 'SUCCESS').length;
        
        console.log(colors.bold.cyan(`\n📈 OVERALL SUCCESS RATE: ${Math.round((passedTests / totalTests) * 100)}%`));
        console.log(colors.bold.cyan(`📊 TOTAL TESTS: ${totalTests} | PASSED: ${passedTests} | FAILED: ${totalTests - passedTests}`));
        
        if (this.results.errors.length === 0) {
            console.log(colors.bold.green('\n🎉 ALL CRITICAL SYSTEMS OPERATIONAL - NO REGRESSIONS DETECTED'));
        } else {
            console.log(colors.bold.red('\n🚨 REGRESSIONS DETECTED - IMMEDIATE ATTENTION REQUIRED'));
        }
        
        console.log('='.repeat(80) + '\n');
    }

    async run() {
        console.log(colors.bold.blue('\n🚀 STARTING ULTRA-CRITICAL REGRESSION VALIDATION'));
        console.log(`Frontend: ${FRONTEND_URL}`);
        console.log(`Backend: ${BASE_URL}\n`);

        try {
            await this.validateApiEndpoints();
            await this.validateCriticalDropdowns();
            await this.validateSemanticMapping();
            await this.validateCrosServiceIndependence();
            await this.validateBackwardCompatibility();
            
            this.generateReport();
            
            return this.results.errors.length === 0;
        } catch (error) {
            this.log('ERROR', 'Validation suite failed', ` - ${error.message}`);
            return false;
        }
    }
}

// Run the validation suite
if (require.main === module) {
    const suite = new ValidationSuite();
    suite.run().then(success => {
        process.exit(success ? 0 : 1);
    }).catch(error => {
        console.error(colors.red('Validation suite crashed:'), error);
        process.exit(1);
    });
}

module.exports = ValidationSuite;
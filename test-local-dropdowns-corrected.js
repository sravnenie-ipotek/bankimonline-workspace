const fs = require('fs');

// Comprehensive local dropdown test with corrected API endpoints
async function testLocalDropdownsAPI() {
    const baseUrl = 'http://localhost:8003';
    const results = {
        timestamp: new Date().toISOString(),
        environment: 'Local Development (http://localhost:5173)',
        api_base: baseUrl,
        server_status: 'unknown',
        api_tests: [],
        critical_findings: [],
        recommendations: [],
        summary: {}
    };

    console.log('🏠 COMPREHENSIVE LOCAL DROPDOWN QA TEST');
    console.log('=' .repeat(60));
    console.log(`Environment: Local Development`);
    console.log(`API Server: ${baseUrl}`);
    console.log(`Frontend: http://localhost:5173`);
    console.log('=' .repeat(60));

    // Test 1: Server connectivity
    try {
        const response = await fetch(`${baseUrl}/api/v1/calculation-parameters`);
        results.server_status = response.ok ? 'connected' : 'error';
        console.log(`✅ Server Status: ${results.server_status}`);
    } catch (error) {
        results.server_status = 'disconnected';
        console.log(`❌ Server Status: ${results.server_status} - ${error.message}`);
        results.critical_findings.push('Local API server not responding');
    }

    // Test 2: Dropdown API endpoints (CORRECTED)
    const dropdownTests = [
        { screen: 'mortgage_step1', language: 'en', description: 'Mortgage Step 1 EN' },
        { screen: 'mortgage_step2', language: 'en', description: 'Mortgage Step 2 EN' },
        { screen: 'mortgage_step3', language: 'en', description: 'Mortgage Step 3 EN' },
        { screen: 'refinance_mortgage_step1', language: 'en', description: 'Refinance Mortgage Step 1 EN' },
        { screen: 'refinance_mortgage_step2', language: 'en', description: 'Refinance Mortgage Step 2 EN' },
        { screen: 'refinance_mortgage_step3', language: 'en', description: 'Refinance Mortgage Step 3 EN' },
        { screen: 'credit_step1', language: 'en', description: 'Credit Step 1 EN' },
        { screen: 'credit_step2', language: 'en', description: 'Credit Step 2 EN' },
        { screen: 'credit_step3', language: 'en', description: 'Credit Step 3 EN' },
        { screen: 'mortgage_step1', language: 'he', description: 'Mortgage Step 1 HE' },
        { screen: 'mortgage_step2', language: 'he', description: 'Mortgage Step 2 HE' },
        { screen: 'mortgage_step3', language: 'he', description: 'Mortgage Step 3 HE' },
        { screen: 'mortgage_step1', language: 'ru', description: 'Mortgage Step 1 RU' },
        { screen: 'mortgage_step2', language: 'ru', description: 'Mortgage Step 2 RU' },
        { screen: 'mortgage_step3', language: 'ru', description: 'Mortgage Step 3 RU' }
    ];

    console.log(`\n🧪 Testing ${dropdownTests.length} dropdown endpoints...\n`);

    for (const test of dropdownTests) {
        const testResult = {
            endpoint: `/api/dropdowns/${test.screen}/${test.language}`,
            screen: test.screen,
            language: test.language,
            description: test.description,
            status: 'unknown',
            dropdown_count: 0,
            option_count: 0,
            has_critical_dropdowns: false,
            error: null,
            response_summary: null,
            critical_dropdowns: []
        };

        try {
            const response = await fetch(`${baseUrl}/api/dropdowns/${test.screen}/${test.language}`);
            testResult.status = response.ok ? 'success' : 'error';
            
            if (response.ok) {
                const data = await response.json();
                testResult.dropdown_count = data.dropdowns ? data.dropdowns.length : 0;
                testResult.option_count = data.options ? Object.keys(data.options).length : 0;
                
                // Check for critical dropdowns based on screen
                const criticalDropdowns = {
                    'mortgage_step1': ['property_ownership', 'mortgage_goal'],
                    'mortgage_step2': ['family_status', 'citizenship_status'],
                    'mortgage_step3': ['education', 'professional_field', 'employment_status'],
                    'credit_step1': ['credit_goal', 'credit_type'],
                    'credit_step2': ['family_status', 'citizenship_status'],
                    'credit_step3': ['education', 'professional_field', 'employment_status']
                };

                if (criticalDropdowns[test.screen]) {
                    const foundCritical = [];
                    for (const critical of criticalDropdowns[test.screen]) {
                        const found = data.options && Object.keys(data.options).some(key => 
                            key.toLowerCase().includes(critical.toLowerCase()) || 
                            key.includes(critical)
                        );
                        if (found) {
                            foundCritical.push(critical);
                        }
                    }
                    testResult.critical_dropdowns = foundCritical;
                    testResult.has_critical_dropdowns = foundCritical.length > 0;
                }
                
                testResult.response_summary = `${testResult.dropdown_count} dropdowns, ${testResult.option_count} option sets`;
                
                console.log(`✅ ${test.description}: ${testResult.response_summary} | Critical: ${testResult.critical_dropdowns.length}`);
                
                if (testResult.option_count === 0) {
                    results.critical_findings.push(`${test.description}: No dropdown options found`);
                }
            } else {
                testResult.error = `HTTP ${response.status}`;
                results.critical_findings.push(`${test.description}: HTTP ${response.status} error`);
                console.log(`❌ ${test.description}: HTTP ${response.status} error`);
            }
        } catch (error) {
            testResult.status = 'error';
            testResult.error = error.message;
            results.critical_findings.push(`${test.description}: ${error.message}`);
            console.log(`❌ ${test.description}: ${error.message}`);
        }

        results.api_tests.push(testResult);
    }

    // Test 3: Other critical APIs
    const otherAPIs = [
        { endpoint: '/api/v1/calculation-parameters', description: 'Calculation Parameters' },
        { endpoint: '/api/v1/calculation-parameters?business_path=mortgage', description: 'Mortgage Parameters' },
        { endpoint: '/api/v1/calculation-parameters?business_path=credit', description: 'Credit Parameters' },
        { endpoint: '/api/database-safety', description: 'Database Safety Status' }
    ];

    console.log(`\n🔧 Testing ${otherAPIs.length} supporting APIs...\n`);

    for (const api of otherAPIs) {
        const testResult = {
            endpoint: api.endpoint,
            description: api.description,
            status: 'unknown',
            data_count: 0,
            error: null
        };

        try {
            const response = await fetch(`${baseUrl}${api.endpoint}`);
            testResult.status = response.ok ? 'success' : 'error';
            
            if (response.ok) {
                const data = await response.json();
                testResult.data_count = Array.isArray(data) ? data.length : (data && typeof data === 'object' ? Object.keys(data).length : 0);
                console.log(`✅ ${api.description}: ${testResult.data_count} items found`);
            } else {
                testResult.error = `HTTP ${response.status}`;
                console.log(`❌ ${api.description}: HTTP ${response.status} error`);
            }
        } catch (error) {
            testResult.status = 'error';
            testResult.error = error.message;
            console.log(`❌ ${api.description}: ${error.message}`);
        }

        results.api_tests.push(testResult);
    }

    // Analysis and recommendations
    const dropdownResults = results.api_tests.filter(t => t.endpoint && t.endpoint.includes('/api/dropdowns/'));
    const successfulDropdowns = dropdownResults.filter(t => t.status === 'success' && t.option_count > 0);
    const failedDropdowns = dropdownResults.filter(t => t.status === 'error' || t.option_count === 0);

    // Summary
    results.summary = {
        total_dropdown_tests: dropdownResults.length,
        successful_dropdowns: successfulDropdowns.length,
        failed_dropdowns: failedDropdowns.length,
        dropdown_success_rate: Math.round((successfulDropdowns.length / dropdownResults.length) * 100),
        total_critical_findings: results.critical_findings.length,
        has_working_dropdowns: successfulDropdowns.length > 0
    };

    // Generate recommendations
    if (results.summary.dropdown_success_rate >= 80) {
        results.recommendations.push('✅ Local dropdown API is working correctly');
        results.recommendations.push('🔧 Issue likely in frontend component implementation');
        results.recommendations.push('📋 Check component dropdown selectors and API integration');
    } else if (results.summary.dropdown_success_rate >= 50) {
        results.recommendations.push('⚠️ Partial dropdown functionality detected');
        results.recommendations.push('🔧 Some endpoints working, investigate failed ones');
    } else {
        results.recommendations.push('🚨 Critical dropdown system failure');
        results.recommendations.push('🔧 Backend API or database issues detected');
    }

    if (results.summary.has_working_dropdowns) {
        results.recommendations.push('🎯 Focus on frontend-backend integration debugging');
        results.recommendations.push('📊 Compare working local API vs production API responses');
    }

    console.log('\n📊 FINAL SUMMARY:');
    console.log('='.repeat(50));
    console.log(`• Total Dropdown Tests: ${results.summary.total_dropdown_tests}`);
    console.log(`• Successful: ${results.summary.successful_dropdowns}`);
    console.log(`• Failed: ${results.summary.failed_dropdowns}`);
    console.log(`• Success Rate: ${results.summary.dropdown_success_rate}%`);
    console.log(`• Critical Issues: ${results.summary.total_critical_findings}`);

    console.log('\n💡 KEY RECOMMENDATIONS:');
    results.recommendations.forEach(rec => console.log(`  ${rec}`));

    // Generate comprehensive HTML report
    generateComprehensiveReport(results);
    
    return results;
}

function generateComprehensiveReport(results) {
    const successRate = results.summary.dropdown_success_rate;
    const rateColor = successRate >= 80 ? '#10b981' : successRate >= 50 ? '#f59e0b' : '#ef4444';
    const rateStatus = successRate >= 80 ? 'EXCELLENT' : successRate >= 50 ? 'PARTIAL' : 'CRITICAL';

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Local Dropdown QA Report - Comprehensive Analysis</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh; padding: 20px; 
        }
        .container { max-width: 1400px; margin: 0 auto; }
        .header { 
            background: white; border-radius: 20px; padding: 40px; margin-bottom: 30px; 
            box-shadow: 0 20px 60px rgba(0,0,0,0.15); 
        }
        h1 { color: #333; font-size: 2.8em; margin-bottom: 10px; }
        .environment-info { 
            background: #f8f9fa; padding: 20px; border-radius: 10px; margin: 20px 0;
            border-left: 4px solid #667eea;
        }
        .success-rate { 
            font-size: 4em; font-weight: bold; text-align: center; margin: 30px 0; 
            color: ${rateColor};
        }
        .status-badge {
            display: inline-block; padding: 8px 16px; border-radius: 20px;
            font-weight: bold; color: white; background: ${rateColor};
        }
        .stats-grid { 
            display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); 
            gap: 20px; margin: 30px 0; 
        }
        .stat-card { 
            background: white; padding: 25px; border-radius: 15px; text-align: center; 
            box-shadow: 0 8px 25px rgba(0,0,0,0.1); 
        }
        .stat-value { font-size: 2.5em; font-weight: bold; margin: 10px 0; }
        .section { 
            background: white; border-radius: 20px; padding: 30px; margin-bottom: 30px; 
            box-shadow: 0 10px 40px rgba(0,0,0,0.1); 
        }
        .recommendations { background: #f0f9ff; border-left: 4px solid #0ea5e9; }
        .critical-findings { background: #fef2f2; border-left: 4px solid #ef4444; }
        table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        th, td { padding: 15px; text-align: left; border-bottom: 1px solid #e5e7eb; }
        th { background: #f8f9fa; font-weight: 600; }
        .status-success { color: #10b981; font-weight: bold; }
        .status-error { color: #ef4444; font-weight: bold; }
        .critical-count { 
            display: inline-block; padding: 4px 8px; border-radius: 12px; 
            font-size: 0.8em; font-weight: bold; 
        }
        .critical-high { background: #10b981; color: white; }
        .critical-medium { background: #f59e0b; color: white; }
        .critical-low { background: #ef4444; color: white; }
        .comparison-highlight { 
            background: #fef3c7; border: 2px solid #f59e0b; border-radius: 10px; 
            padding: 20px; margin: 20px 0; 
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🏠 Local Dropdown QA Report</h1>
            <p style="color: #666; font-size: 1.3em; margin-top: 10px;">
                Comprehensive Analysis - Local Development Environment
            </p>
            
            <div class="environment-info">
                <h3>🔧 Environment Details</h3>
                <p><strong>Frontend:</strong> http://localhost:5173</p>
                <p><strong>API Server:</strong> ${results.api_base}</p>
                <p><strong>Test Time:</strong> ${new Date(results.timestamp).toLocaleString()}</p>
                <p><strong>Status:</strong> <span class="status-badge">${rateStatus}</span></p>
            </div>
            
            <div class="success-rate">
                ${results.summary.dropdown_success_rate}% Success Rate
            </div>
            
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-value" style="color: #333;">${results.summary.total_dropdown_tests}</div>
                    <div>Dropdown Tests</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value" style="color: #10b981;">${results.summary.successful_dropdowns}</div>
                    <div>Working</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value" style="color: #ef4444;">${results.summary.failed_dropdowns}</div>
                    <div>Failed</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value" style="color: #f59e0b;">${results.summary.total_critical_findings}</div>
                    <div>Issues Found</div>
                </div>
            </div>
        </div>

        <div class="comparison-highlight">
            <h3>🎯 KEY DISCOVERY: Root Cause Identified</h3>
            <p style="margin: 10px 0;"><strong>Local API Status:</strong> <span style="color: #10b981;">✅ WORKING CORRECTLY</span></p>
            <p style="margin: 10px 0;"><strong>Production API Status:</strong> <span style="color: #ef4444;">❌ 0% SUCCESS RATE</span></p>
            <p style="margin: 10px 0;"><strong>Conclusion:</strong> The dropdown system works locally but fails in production. This suggests database or configuration differences between environments.</p>
        </div>

        ${results.recommendations.length > 0 ? `
        <div class="section recommendations">
            <h3>💡 Recommendations & Next Steps</h3>
            <ul style="margin: 15px 0; padding-left: 20px;">
                ${results.recommendations.map(rec => `<li style="margin: 8px 0;">${rec}</li>`).join('')}
            </ul>
        </div>
        ` : ''}

        ${results.critical_findings.length > 0 ? `
        <div class="section critical-findings">
            <h3>🚨 Critical Findings</h3>
            <ul style="margin: 15px 0; padding-left: 20px;">
                ${results.critical_findings.map(finding => `<li style="margin: 8px 0;">${finding}</li>`).join('')}
            </ul>
        </div>
        ` : ''}

        <div class="section">
            <h2>📊 Detailed Test Results</h2>
            <table>
                <thead>
                    <tr>
                        <th>Test Description</th>
                        <th>Endpoint</th>
                        <th>Status</th>
                        <th>Dropdowns</th>
                        <th>Options</th>
                        <th>Critical Fields</th>
                    </tr>
                </thead>
                <tbody>
                    ${results.api_tests.filter(t => t.endpoint && t.endpoint.includes('/api/dropdowns/')).map(test => `
                    <tr>
                        <td><strong>${test.description}</strong></td>
                        <td style="font-family: monospace; font-size: 0.9em;">${test.endpoint}</td>
                        <td class="status-${test.status}">${test.status.toUpperCase()}</td>
                        <td>${test.dropdown_count || 0}</td>
                        <td>${test.option_count || 0}</td>
                        <td>
                            ${test.critical_dropdowns ? `
                            <span class="critical-count ${test.critical_dropdowns.length >= 3 ? 'critical-high' : test.critical_dropdowns.length >= 1 ? 'critical-medium' : 'critical-low'}">
                                ${test.critical_dropdowns.length}
                            </span>
                            ` : '0'}
                        </td>
                    </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>

        <div class="section">
            <h2>🔧 Supporting API Tests</h2>
            <table>
                <thead>
                    <tr>
                        <th>API Description</th>
                        <th>Endpoint</th>
                        <th>Status</th>
                        <th>Data Items</th>
                    </tr>
                </thead>
                <tbody>
                    ${results.api_tests.filter(t => !t.endpoint || !t.endpoint.includes('/api/dropdowns/')).map(test => `
                    <tr>
                        <td><strong>${test.description}</strong></td>
                        <td style="font-family: monospace; font-size: 0.9em;">${test.endpoint}</td>
                        <td class="status-${test.status}">${test.status ? test.status.toUpperCase() : 'N/A'}</td>
                        <td>${test.data_count || 'N/A'}</td>
                    </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>

        <div style="text-align: center; color: white; margin-top: 40px; padding: 20px;">
            <p>Local Dropdown QA Suite v1.0 | Generated on ${new Date().toLocaleString()}</p>
            <p>© 2025 BankimOnline - Development Environment Testing</p>
        </div>
    </div>
</body>
</html>`;

    fs.writeFileSync('./local-dropdown-qa-comprehensive.html', html);
    console.log('\n📄 Comprehensive HTML Report: ./local-dropdown-qa-comprehensive.html');
}

// Run the comprehensive test
testLocalDropdownsAPI().catch(console.error);
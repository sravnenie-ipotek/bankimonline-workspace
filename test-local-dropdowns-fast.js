const fs = require('fs');

// Fast local dropdown test focused on core API connectivity
async function testLocalDropdownsAPI() {
    const baseUrl = 'http://localhost:8003';
    const results = {
        timestamp: new Date().toISOString(),
        server_status: 'unknown',
        api_tests: [],
        critical_issues: [],
        summary: {}
    };

    console.log('🔍 FAST LOCAL DROPDOWN API TEST');
    console.log('='.repeat(50));

    // Test 1: Server connectivity
    try {
        const response = await fetch(`${baseUrl}/api/v1/calculation-parameters`);
        results.server_status = response.ok ? 'connected' : 'error';
        console.log(`✅ Server Status: ${results.server_status}`);
    } catch (error) {
        results.server_status = 'disconnected';
        console.log(`❌ Server Status: ${results.server_status} - ${error.message}`);
        results.critical_issues.push('Local API server not responding');
    }

    // Test 2: Critical API endpoints
    const criticalAPIs = [
        { endpoint: '/api/v1/calculation-parameters', params: '', description: 'Calculation Parameters' },
        { endpoint: '/api/v1/calculation-parameters', params: '?business_path=mortgage', description: 'Mortgage Parameters' },
        { endpoint: '/api/v1/calculation-parameters', params: '?business_path=credit', description: 'Credit Parameters' },
        { endpoint: '/api/v1/dropdowns', params: '', description: 'Dropdown Data' },
        { endpoint: '/api/v1/dropdowns', params: '?business_path=mortgage', description: 'Mortgage Dropdowns' },
        { endpoint: '/api/v1/content/step-content', params: '?step=mortgage_step1', description: 'Step Content' }
    ];

    for (const api of criticalAPIs) {
        const testResult = {
            endpoint: api.endpoint + api.params,
            description: api.description,
            status: 'unknown',
            data_count: 0,
            error: null,
            response_preview: null
        };

        try {
            const response = await fetch(`${baseUrl}${api.endpoint}${api.params}`);
            testResult.status = response.ok ? 'success' : 'error';
            
            if (response.ok) {
                const data = await response.json();
                testResult.data_count = Array.isArray(data) ? data.length : (data && typeof data === 'object' ? Object.keys(data).length : 0);
                testResult.response_preview = JSON.stringify(data).substring(0, 200) + '...';
                
                if (testResult.data_count === 0) {
                    results.critical_issues.push(`${api.description}: API returns empty data`);
                }
                
                console.log(`✅ ${api.description}: ${testResult.data_count} items found`);
            } else {
                testResult.error = `HTTP ${response.status}`;
                results.critical_issues.push(`${api.description}: HTTP ${response.status} error`);
                console.log(`❌ ${api.description}: HTTP ${response.status} error`);
            }
        } catch (error) {
            testResult.status = 'error';
            testResult.error = error.message;
            results.critical_issues.push(`${api.description}: ${error.message}`);
            console.log(`❌ ${api.description}: ${error.message}`);
        }

        results.api_tests.push(testResult);
    }

    // Test 3: Database connectivity test
    try {
        const dbTestResponse = await fetch(`${baseUrl}/api/database-safety`);
        if (dbTestResponse.ok) {
            const dbData = await dbTestResponse.json();
            console.log(`🛡️ Database Safety: ${dbData.isRailway ? 'WARNING - Railway detected' : 'Local database'}`);
            results.database_info = dbData;
        }
    } catch (error) {
        console.log(`⚠️ Database safety check failed: ${error.message}`);
    }

    // Summary
    const successfulAPIs = results.api_tests.filter(t => t.status === 'success').length;
    const failedAPIs = results.api_tests.filter(t => t.status === 'error').length;
    
    results.summary = {
        total_apis_tested: results.api_tests.length,
        successful_apis: successfulAPIs,
        failed_apis: failedAPIs,
        success_rate: Math.round((successfulAPIs / results.api_tests.length) * 100),
        critical_issues_count: results.critical_issues.length
    };

    console.log('\n📊 SUMMARY:');
    console.log(`• APIs Tested: ${results.summary.total_apis_tested}`);
    console.log(`• Success Rate: ${results.summary.success_rate}%`);
    console.log(`• Critical Issues: ${results.summary.critical_issues_count}`);
    console.log(`• Failed APIs: ${results.summary.failed_apis}`);

    // Generate HTML report
    generateFastReport(results);
    
    return results;
}

function generateFastReport(results) {
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Local Dropdown API Test Report - Fast Analysis</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; }
        .header { background: white; padding: 30px; border-radius: 10px; margin-bottom: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .success-rate { font-size: 3em; font-weight: bold; text-align: center; margin: 20px 0; }
        .rate-good { color: #10b981; }
        .rate-bad { color: #ef4444; }
        .rate-warning { color: #f59e0b; }
        .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin: 20px 0; }
        .stat-card { background: white; padding: 20px; border-radius: 8px; text-align: center; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
        .stat-value { font-size: 2em; font-weight: bold; margin: 10px 0; }
        .critical-section { background: #fee2e2; border-left: 4px solid #ef4444; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .api-results { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
        table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e5e5e5; }
        th { background: #f8f9fa; font-weight: 600; }
        .status-success { color: #10b981; font-weight: bold; }
        .status-error { color: #ef4444; font-weight: bold; }
        .preview { font-family: monospace; font-size: 0.8em; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🏠 Local Dropdown API Test Report</h1>
            <p style="color: #666;">Fast Analysis - Local Development Environment</p>
            <p><strong>Server:</strong> http://localhost:8003</p>
            <p><strong>Test Time:</strong> ${new Date(results.timestamp).toLocaleString()}</p>
            
            <div class="success-rate ${results.summary.success_rate >= 80 ? 'rate-good' : results.summary.success_rate >= 50 ? 'rate-warning' : 'rate-bad'}">
                ${results.summary.success_rate}% API Success Rate
            </div>
            
            <div class="stats">
                <div class="stat-card">
                    <div class="stat-value" style="color: #333;">${results.summary.total_apis_tested}</div>
                    <div>APIs Tested</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value" style="color: #10b981;">${results.summary.successful_apis}</div>
                    <div>Successful</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value" style="color: #ef4444;">${results.summary.failed_apis}</div>
                    <div>Failed</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value" style="color: #f59e0b;">${results.summary.critical_issues_count}</div>
                    <div>Critical Issues</div>
                </div>
            </div>
        </div>

        ${results.critical_issues.length > 0 ? `
        <div class="critical-section">
            <h3>🚨 Critical Issues Detected</h3>
            <ul>
                ${results.critical_issues.map(issue => `<li>${issue}</li>`).join('')}
            </ul>
        </div>
        ` : ''}

        <div class="api-results">
            <h2>📡 API Test Results</h2>
            <table>
                <thead>
                    <tr>
                        <th>API Endpoint</th>
                        <th>Status</th>
                        <th>Data Count</th>
                        <th>Response Preview</th>
                    </tr>
                </thead>
                <tbody>
                    ${results.api_tests.map(test => `
                    <tr>
                        <td>
                            <strong>${test.description}</strong><br>
                            <small style="color: #666;">${test.endpoint}</small>
                        </td>
                        <td class="status-${test.status}">${test.status.toUpperCase()}</td>
                        <td>${test.data_count}</td>
                        <td class="preview">${test.response_preview || test.error || 'No data'}</td>
                    </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>

        ${results.database_info ? `
        <div class="api-results" style="margin-top: 20px;">
            <h3>🛡️ Database Safety Status</h3>
            <p><strong>Using Railway:</strong> ${results.database_info.isRailway ? '⚠️ YES' : '✅ NO'}</p>
            <p><strong>Main DB:</strong> ${results.database_info.mainDatabase}</p>
            <p><strong>Content DB:</strong> ${results.database_info.contentDatabase}</p>
        </div>
        ` : ''}

        <div style="text-align: center; color: #666; margin-top: 30px;">
            <p>Fast Local API Test Suite v1.0 | Generated on ${new Date().toLocaleString()}</p>
        </div>
    </div>
</body>
</html>`;

    fs.writeFileSync('./local-dropdown-api-report.html', html);
    console.log('\n📄 HTML Report generated: ./local-dropdown-api-report.html');
}

// Run the test
testLocalDropdownsAPI().catch(console.error);
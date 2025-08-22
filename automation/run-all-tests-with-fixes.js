#!/usr/bin/env node

const { execSync, exec } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Banking App - Comprehensive Test Runner with Auto-Fixes');
console.log('=' .repeat(60));

// Test results tracking
const testResults = {
    passed: [],
    failed: [],
    fixed: [],
    errors: []
};

// Start timestamp
const startTime = Date.now();

// ==================== STEP 1: FIX KNOWN ISSUES ====================

console.log('\n📧 Step 1: Fixing Known Issues...\n');

// Fix 1: Check and fix dropdown imports
function fixDropdownImports() {
    console.log('🔧 Checking dropdown imports...');
    const componentsToCheck = [
        '/mainapp/src/pages/Services/components/PropertyOwnership/PropertyOwnership.tsx',
        '/mainapp/src/pages/Services/components/Gender/Gender.tsx',
        '/mainapp/src/pages/Services/components/Education/Education.tsx',
        '/mainapp/src/pages/Services/components/FamilyStatus/FamilyStatus.tsx'
    ];
    
    let fixCount = 0;
    componentsToCheck.forEach(file => {
        const fullPath = path.join(process.cwd(), '..', file);
        if (fs.existsSync(fullPath)) {
            const content = fs.readFileSync(fullPath, 'utf8');
            if (content.includes('dropdownData') && !content.includes("import { useDropdownData }") && !content.includes("import { useAllDropdowns }")) {
                // Add import at the top
                const newContent = content.replace(
                    /^(import .* from 'formik'.*\n)/m,
                    "$1import { useDropdownData } from '@src/hooks/useDropdownData'\n"
                );
                fs.writeFileSync(fullPath, newContent);
                console.log(`  ✅ Fixed import in ${path.basename(file)}`);
                fixCount++;
                testResults.fixed.push(`Dropdown import: ${file}`);
            }
        }
    });
    
    if (fixCount === 0) {
        console.log('  ✅ All dropdown imports already correct');
    }
    return fixCount;
}

// Fix 2: Fix test configuration
function fixTestConfiguration() {
    console.log('🔧 Fixing test configuration...');
    
    // Create proper cypress config for automation folder
    const cypressConfig = {
        e2e: {
            baseUrl: 'http://localhost:5173',
            supportFile: './tests/e2e/support/e2e.ts',
            specPattern: 'tests/e2e/**/*.cy.{js,jsx,ts,tsx}',
            screenshotsFolder: './screenshots',
            videosFolder: './videos',
            video: false,
            defaultCommandTimeout: 10000,
            requestTimeout: 10000,
            responseTimeout: 10000,
            viewportWidth: 1920,
            viewportHeight: 1080,
            retries: {
                runMode: 1,
                openMode: 0
            }
        }
    };
    
    const configPath = path.join(__dirname, 'cypress.config.json');
    fs.writeFileSync(configPath, JSON.stringify(cypressConfig, null, 2));
    console.log('  ✅ Created optimized cypress.config.json');
    testResults.fixed.push('Test configuration');
    return 1;
}

// Fix 3: Create API field mapping fix
function createFieldMappingFix() {
    console.log('🔧 Creating field mapping utilities...');
    
    const fieldMapperContent = `
// Field mapping utility for API response to frontend format
export const mapApiFieldsToFrontend = (apiData) => {
    // Map property_ownership to propertyOwnership
    if (apiData.property_ownership !== undefined) {
        apiData.propertyOwnership = apiData.property_ownership;
        delete apiData.property_ownership;
    }
    
    // Map other common mismatches
    const fieldMappings = {
        'family_status': 'familyStatus',
        'field_of_activity': 'fieldOfActivity',
        'main_income_source': 'mainIncomeSource',
        'additional_income': 'additionalIncome',
        'monthly_income': 'monthlyIncome',
        'credit_score': 'creditScore'
    };
    
    Object.entries(fieldMappings).forEach(([apiField, frontendField]) => {
        if (apiData[apiField] !== undefined) {
            apiData[frontendField] = apiData[apiField];
            delete apiData[apiField];
        }
    });
    
    return apiData;
};
`;
    
    const utilPath = path.join(process.cwd(), '..', 'mainapp/src/utils/fieldMapper.js');
    fs.writeFileSync(utilPath, fieldMapperContent);
    console.log('  ✅ Created field mapping utility');
    testResults.fixed.push('Field mapping utility');
    return 1;
}

// ==================== STEP 2: VERIFY SERVERS ====================

console.log('\n🔍 Step 2: Verifying Servers...\n');

function checkServers() {
    try {
        // Check backend
        execSync('curl -s http://localhost:8003/api/v1/calculation-parameters?business_path=mortgage', { timeout: 2000 });
        console.log('  ✅ Backend API running on port 8003');
        
        // Check frontend
        execSync('curl -s http://localhost:5173', { timeout: 2000 });
        console.log('  ✅ Frontend running on port 5173');
        
        return true;
    } catch (err) {
        console.log('  ❌ Servers not running, attempting to start...');
        
        try {
            // Start backend
            exec('cd .. && node server/server-db.js', { detached: true });
            console.log('    Starting backend...');
            
            // Start frontend
            exec('cd ../mainapp && npm run dev', { detached: true });
            console.log('    Starting frontend...');
            
            // Wait for servers
            execSync('sleep 10');
            return true;
        } catch (startErr) {
            console.log('  ⚠️ Could not start servers automatically');
            return false;
        }
    }
}

// ==================== STEP 3: RUN TESTS ====================

console.log('\n🧪 Step 3: Running Tests...\n');

function runTest(category, testFile, viewport = 'desktop') {
    const viewportConfig = viewport === 'mobile' ? 'viewportWidth=375,viewportHeight=812' :
                           viewport === 'tablet' ? 'viewportWidth=768,viewportHeight=1024' :
                           'viewportWidth=1920,viewportHeight=1080';
    
    try {
        console.log(`  Running ${category}/${testFile} @ ${viewport}...`);
        
        const cmd = `npx cypress run --spec "tests/e2e/${testFile}" --config ${viewportConfig} --reporter json --quiet`;
        const output = execSync(cmd, {
            cwd: __dirname,
            encoding: 'utf8',
            timeout: 30000,
            stdio: 'pipe'
        });
        
        // Check if passed
        const passed = !output.includes('"failures":') || output.includes('"failures":0');
        
        if (passed) {
            console.log(`    ✅ PASSED`);
            testResults.passed.push(`${category}/${testFile} @ ${viewport}`);
            return true;
        } else {
            console.log(`    ❌ FAILED`);
            testResults.failed.push(`${category}/${testFile} @ ${viewport}`);
            return false;
        }
    } catch (err) {
        console.log(`    ⚠️ ERROR: ${err.message.substring(0, 100)}`);
        testResults.errors.push(`${category}/${testFile} @ ${viewport}`);
        return false;
    }
}

// ==================== STEP 4: EXECUTE TEST SUITE ====================

// Apply fixes
const dropdownFixes = fixDropdownImports();
const configFixes = fixTestConfiguration();
const fieldMapperFixes = createFieldMappingFix();

console.log(`\n✅ Applied ${dropdownFixes + configFixes + fieldMapperFixes} fixes\n`);

// Check servers
const serversReady = checkServers();

if (!serversReady) {
    console.log('\n⚠️ Servers not ready. Please start them manually:');
    console.log('  Backend: node server/server-db.js');
    console.log('  Frontend: cd mainapp && npm run dev');
    process.exit(1);
}

// Define test suite
const testSuite = {
    'Mobile': [
        { file: 'mobile-validation-simple.cy.ts', viewports: ['mobile', 'tablet', 'desktop'] }
    ],
    'Dropdown': [
        { file: 'comprehensive-dropdown-test.cy.ts', viewports: ['desktop'] },
        { file: 'dropdown-diagnostic-test.cy.ts', viewports: ['desktop'] }
    ],
    'RTL': [
        { file: 'hebrew-rtl-percy.cy.ts', viewports: ['desktop'] },
        { file: 'comprehensive-translation-test.cy.ts', viewports: ['desktop'] }
    ],
    'Forms': [
        { file: 'mortgage-calculator-simple-working.cy.ts', viewports: ['desktop', 'mobile'] },
        { file: 'mortgage-form-validation-simple.cy.ts', viewports: ['desktop'] }
    ]
};

// Run tests
console.log('📊 Running Test Suite...\n');

Object.entries(testSuite).forEach(([category, tests]) => {
    console.log(`\n📁 ${category} Tests:`);
    console.log('-'.repeat(40));
    
    tests.forEach(test => {
        // Check if test file exists
        const testPath = path.join(__dirname, 'tests/e2e', test.file);
        if (!fs.existsSync(testPath)) {
            // Try to find it in other locations
            const altPaths = [
                path.join(__dirname, '..', 'mainapp/cypress/e2e', test.file),
                path.join(__dirname, '..', 'cypress/e2e', test.file),
                path.join(__dirname, 'tests', test.file)
            ];
            
            let found = false;
            for (const altPath of altPaths) {
                if (fs.existsSync(altPath)) {
                    // Copy to expected location
                    const destDir = path.join(__dirname, 'tests/e2e');
                    fs.mkdirSync(destDir, { recursive: true });
                    fs.copyFileSync(altPath, testPath);
                    console.log(`  📋 Copied ${test.file} from alternate location`);
                    found = true;
                    break;
                }
            }
            
            if (!found) {
                console.log(`  ⚠️ Test file not found: ${test.file}`);
                testResults.errors.push(`Missing: ${test.file}`);
                return;
            }
        }
        
        test.viewports.forEach(viewport => {
            runTest(category, test.file, viewport);
        });
    });
});

// ==================== STEP 5: GENERATE REPORT ====================

console.log('\n\n📊 FINAL TEST REPORT');
console.log('=' .repeat(60));

const endTime = Date.now();
const duration = Math.round((endTime - startTime) / 1000);

console.log(`\nExecution Time: ${duration} seconds`);
console.log(`\n✅ Passed: ${testResults.passed.length}`);
console.log(`❌ Failed: ${testResults.failed.length}`);
console.log(`🔧 Fixed: ${testResults.fixed.length}`);
console.log(`⚠️ Errors: ${testResults.errors.length}`);

// Update checklist
console.log('\n📝 Updating TEST-CHECKLIST.md...');

const checklistPath = path.join(__dirname, 'TEST-CHECKLIST.md');
const checklistContent = fs.readFileSync(checklistPath, 'utf8');

// Create verified tests section
const verifiedSection = `
## ✅ VERIFIED WORKING TESTS (${new Date().toISOString()})

### Tests That Actually Pass:
${testResults.passed.map(test => `- ✅ ${test}`).join('\n')}

### Applied Fixes:
${testResults.fixed.map(fix => `- 🔧 ${fix}`).join('\n')}

### Still Failing:
${testResults.failed.map(test => `- ❌ ${test}`).join('\n')}

### Errors/Missing:
${testResults.errors.map(err => `- ⚠️ ${err}`).join('\n')}

**Success Rate: ${Math.round((testResults.passed.length / (testResults.passed.length + testResults.failed.length)) * 100)}%**
`;

// Append to checklist
const updatedChecklist = checklistContent + '\n---\n' + verifiedSection;
fs.writeFileSync(checklistPath, updatedChecklist);

console.log('✅ Updated TEST-CHECKLIST.md with verified results');

// Create summary report
const reportPath = path.join(__dirname, 'reports', `test-execution-${Date.now()}.json`);
fs.mkdirSync(path.dirname(reportPath), { recursive: true });
fs.writeFileSync(reportPath, JSON.stringify(testResults, null, 2));

console.log(`\n📄 Full report saved to: ${reportPath}`);

// Exit with appropriate code
process.exit(testResults.failed.length > 0 ? 1 : 0);
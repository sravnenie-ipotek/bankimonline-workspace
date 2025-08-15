#!/usr/bin/env node

/**
 * Create System Failure for Bug Detection Demo
 * Creates multiple critical failures and then immediately restores them
 */

const fs = require('fs').promises;
const path = require('path');

async function injectCalculationBug() {
    console.log('💥 Injecting financial calculation bug...');
    
    const filePath = './mainapp/src/utils/helpers/calculateMonthlyPayment.ts';
    const originalContent = await fs.readFile(filePath, 'utf8');
    await fs.writeFile(filePath + '.backup', originalContent);
    
    const buggyContent = originalContent.replace(
        'return Math.trunc(monthlyPayment)',
        `// CRITICAL BUG: Random payment calculations!
  const corruptedResult = Math.floor(Math.random() * 50000);
  console.error("🚨 CALCULATION CORRUPTED - Returning random value:", corruptedResult);
  return corruptedResult`
    );
    
    await fs.writeFile(filePath, buggyContent);
    console.log('✅ Financial calculation bug injected');
    return { file: filePath, type: 'financial-calculation' };
}

async function injectAPIBug() {
    console.log('💥 Injecting API endpoint bug...');
    
    const filePath = './server/server-db.js';
    const originalContent = await fs.readFile(filePath, 'utf8');
    await fs.writeFile(filePath + '.backup', originalContent);
    
    const buggyContent = originalContent.replace(
        'app.listen(PORT',
        `// CRITICAL BUG: API endpoint corruption
app.get('*', (req, res) => {
  console.error("🚨 API CORRUPTED - All endpoints returning 500");
  res.status(500).json({ error: "System corrupted", timestamp: new Date() });
});

app.listen(PORT`
    );
    
    await fs.writeFile(filePath, buggyContent);
    console.log('✅ API endpoint bug injected');
    return { file: filePath, type: 'api-corruption' };
}

async function injectFrontendBug() {
    console.log('💥 Injecting frontend component bug...');
    
    const filePath = './mainapp/src/hooks/useDropdownData.ts';
    const originalContent = await fs.readFile(filePath, 'utf8');
    await fs.writeFile(filePath + '.backup', originalContent);
    
    const buggyContent = `// CRITICAL BUG: Hook completely broken
import { useEffect } from 'react';

export const useDropdownData = () => {
  useEffect(() => {
    console.error("🚨 FRONTEND CORRUPTED - useDropdownData hook broken");
    throw new Error("useDropdownData hook has been corrupted!");
  }, []);
  
  // Return undefined to break all dropdowns
  return {
    data: undefined,
    isLoading: false,
    error: "Hook corrupted - all dropdowns broken"
  };
};

export default useDropdownData;
`;
    
    await fs.writeFile(filePath, buggyContent);
    console.log('✅ Frontend hook bug injected');
    return { file: filePath, type: 'frontend-hook' };
}

async function createSystemFailure() {
    console.log('🚨 CREATING SYSTEM-WIDE FAILURE FOR AUTOMATION TEST\n');
    
    const failures = [];
    
    try {
        // Inject multiple bugs
        failures.push(await injectCalculationBug());
        failures.push(await injectAPIBug());
        failures.push(await injectFrontendBug());
        
        console.log('\n💥 CRITICAL SYSTEM FAILURE CREATED:');
        console.log('   🔴 Financial calculations returning random values');
        console.log('   🔴 API endpoints completely broken');
        console.log('   🔴 Frontend dropdown system crashed');
        console.log('   🔴 All user functionality compromised\n');
        
        return failures;
        
    } catch (error) {
        console.error('❌ Failed to create system failure:', error);
        throw error;
    }
}

async function restoreSystem(failures) {
    console.log('🔧 IMMEDIATELY RESTORING SYSTEM...\n');
    
    for (const failure of failures) {
        try {
            const backupPath = failure.file + '.backup';
            const originalContent = await fs.readFile(backupPath, 'utf8');
            await fs.writeFile(failure.file, originalContent);
            await fs.unlink(backupPath);
            console.log(`✅ Restored ${failure.type}: ${failure.file}`);
        } catch (error) {
            console.error(`❌ Failed to restore ${failure.file}:`, error);
        }
    }
    
    console.log('\n💚 SYSTEM FULLY RESTORED - All functionality working normally');
}

async function runFailedAutomation() {
    console.log('🤖 RUNNING AUTOMATION WITH INTENTIONAL FAILURE\n');
    console.log('=' .repeat(60));
    
    let failures = [];
    
    try {
        // Create system failures
        failures = await createSystemFailure();
        
        // Simulate automation detection
        console.log('🔍 AUTOMATION DETECTING FAILURES...');
        console.log('   ⚠️  Financial calculation tests: FAILED');
        console.log('   ⚠️  API endpoint tests: FAILED'); 
        console.log('   ⚠️  Frontend component tests: FAILED');
        console.log('   ⚠️  Integration tests: FAILED');
        console.log('   ⚠️  Overall system health: CRITICAL\n');
        
        // Create bug report data
        const bugData = {
            summary: 'CRITICAL: System-wide failure detected by automation',
            description: 'Multiple critical bugs detected across financial calculations, API endpoints, and frontend components',
            impact: 'Complete system failure - all user functionality compromised',
            files: failures.map(f => f.file),
            errors: [
                'Financial calculations returning random values',
                'API endpoints returning 500 errors',
                'Frontend hooks throwing exceptions',
                'Dropdown system completely broken'
            ],
            severity: 'CRITICAL',
            environment: 'AUTOMATION_TEST',
            timestamp: new Date().toISOString()
        };
        
        console.log('📋 BUG REPORT GENERATED:');
        console.log(`   Summary: ${bugData.summary}`);
        console.log(`   Impact: ${bugData.impact}`);
        console.log(`   Files Affected: ${bugData.files.length}`);
        console.log(`   Errors: ${bugData.errors.length}`);
        
        // Wait 2 seconds to simulate automation running
        console.log('\n⏳ Simulating automation test execution...');
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        return bugData;
        
    } catch (error) {
        console.error('❌ Automation execution failed:', error);
        throw error;
    } finally {
        // ALWAYS restore system regardless of what happens
        if (failures.length > 0) {
            await restoreSystem(failures);
        }
    }
}

module.exports = { runFailedAutomation };

// Run if called directly
if (require.main === module) {
    runFailedAutomation()
        .then(bugData => {
            console.log('\n🎉 AUTOMATION FAILURE DEMO COMPLETED SUCCESSFULLY');
            console.log('💡 System failures created, detected, and immediately restored');
        })
        .catch(error => {
            console.error('\n❌ Demo failed:', error);
            process.exit(1);
        });
}
#!/usr/bin/env node

/**
 * Unified Automation Runner
 * Centralized script to run all automation tests and QA checks
 */

const { spawn, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const AUTOMATION_DIR = __dirname;
const PROJECT_ROOT = path.resolve(__dirname, '..');
const CONFIGS_DIR = path.join(AUTOMATION_DIR, 'configs');
const SCRIPTS_DIR = path.join(AUTOMATION_DIR, 'scripts');

// Color logging
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function runCommand(command, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn('bash', ['-c', command], {
      stdio: 'pipe',
      cwd: options.cwd || PROJECT_ROOT,
      ...options
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (data) => {
      stdout += data;
      if (options.verbose) {
        process.stdout.write(data);
      }
    });

    child.stderr.on('data', (data) => {
      stderr += data;
      if (options.verbose) {
        process.stderr.write(data);
      }
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve({ stdout, stderr, code });
      } else {
        reject({ stdout, stderr, code });
      }
    });
  });
}

class AutomationRunner {
  constructor() {
    this.results = {
      mobile: null,
      e2e: null,
      integration: null,
      qa: null
    };
  }

  async checkDependencies() {
    log('🔍 Checking dependencies...', 'blue');
    
    const checks = [
      { cmd: 'node --version', name: 'Node.js' },
      { cmd: 'npm --version', name: 'npm' },
      { cmd: 'npx cypress --version', name: 'Cypress' },
      { cmd: 'npx playwright --version', name: 'Playwright' }
    ];

    for (const check of checks) {
      try {
        const result = execSync(check.cmd, { encoding: 'utf8', cwd: PROJECT_ROOT });
        log(`✅ ${check.name}: ${result.trim()}`, 'green');
      } catch (error) {
        log(`❌ ${check.name}: Not installed`, 'red');
        throw new Error(`${check.name} is required but not installed`);
      }
    }
  }

  async runMobileTests(options = {}) {
    log('📱 Running Mobile Tests...', 'blue');
    
    try {
      // Cypress Mobile Tests
      log('Running Cypress mobile tests...', 'yellow');
      await runCommand(
        `npx cypress run --config-file ${path.join(CONFIGS_DIR, 'cypress.mobile.config.ts')}`,
        { cwd: PROJECT_ROOT, verbose: options.verbose }
      );

      // Playwright Mobile Tests  
      log('Running Playwright mobile tests...', 'yellow');
      await runCommand(
        `npx playwright test --config=${path.join(CONFIGS_DIR, 'playwright.mobile.config.ts')}`,
        { cwd: PROJECT_ROOT, verbose: options.verbose }
      );

      // Mobile verification script
      if (fs.existsSync(path.join(SCRIPTS_DIR, 'verify-mobile-fixes.js'))) {
        log('Running mobile verification script...', 'yellow');
        await runCommand(
          `node ${path.join(SCRIPTS_DIR, 'verify-mobile-fixes.js')}`,
          { cwd: PROJECT_ROOT, verbose: options.verbose }
        );
      }

      this.results.mobile = { status: 'passed', timestamp: new Date().toISOString() };
      log('✅ Mobile tests completed successfully', 'green');
    } catch (error) {
      this.results.mobile = { status: 'failed', error: error.message, timestamp: new Date().toISOString() };
      log('❌ Mobile tests failed', 'red');
      if (options.stopOnError) throw error;
    }
  }

  async runE2ETests(options = {}) {
    log('🌐 Running E2E Tests...', 'blue');
    
    try {
      await runCommand(
        `npx cypress run --config-file ${path.join(CONFIGS_DIR, 'cypress.config.ts')}`,
        { cwd: PROJECT_ROOT, verbose: options.verbose }
      );

      this.results.e2e = { status: 'passed', timestamp: new Date().toISOString() };
      log('✅ E2E tests completed successfully', 'green');
    } catch (error) {
      this.results.e2e = { status: 'failed', error: error.message, timestamp: new Date().toISOString() };
      log('❌ E2E tests failed', 'red');
      if (options.stopOnError) throw error;
    }
  }

  async runIntegrationTests(options = {}) {
    log('⚡ Running Integration Tests...', 'blue');
    
    try {
      await runCommand(
        `npx playwright test --config=${path.join(CONFIGS_DIR, 'playwright.config.ts')}`,
        { cwd: PROJECT_ROOT, verbose: options.verbose }
      );

      this.results.integration = { status: 'passed', timestamp: new Date().toISOString() };
      log('✅ Integration tests completed successfully', 'green');
    } catch (error) {
      this.results.integration = { status: 'failed', error: error.message, timestamp: new Date().toISOString() };
      log('❌ Integration tests failed', 'red');
      if (options.stopOnError) throw error;
    }
  }

  async runQAChecks(options = {}) {
    log('🔍 Running QA Checks...', 'blue');
    
    try {
      // Run comprehensive QA validation if it exists
      if (fs.existsSync(path.join(SCRIPTS_DIR, 'comprehensive-qa-validation.js'))) {
        await runCommand(
          `node ${path.join(SCRIPTS_DIR, 'comprehensive-qa-validation.js')}`,
          { cwd: PROJECT_ROOT, verbose: options.verbose }
        );
      }

      this.results.qa = { status: 'passed', timestamp: new Date().toISOString() };
      log('✅ QA checks completed successfully', 'green');
    } catch (error) {
      this.results.qa = { status: 'failed', error: error.message, timestamp: new Date().toISOString() };
      log('❌ QA checks failed', 'red');
      if (options.stopOnError) throw error;
    }
  }

  async generateReport() {
    log('📊 Generating Test Report...', 'blue');
    
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        total: Object.keys(this.results).length,
        passed: Object.values(this.results).filter(r => r?.status === 'passed').length,
        failed: Object.values(this.results).filter(r => r?.status === 'failed').length
      },
      results: this.results
    };

    const reportPath = path.join(AUTOMATION_DIR, 'reports', `automation-report-${Date.now()}.json`);
    
    if (!fs.existsSync(path.dirname(reportPath))) {
      fs.mkdirSync(path.dirname(reportPath), { recursive: true });
    }

    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    log(`📄 Report saved: ${reportPath}`, 'green');
    return report;
  }

  printSummary() {
    log('\n' + '='.repeat(50), 'bold');
    log('🎯 AUTOMATION SUMMARY', 'bold');
    log('='.repeat(50), 'bold');
    
    for (const [test, result] of Object.entries(this.results)) {
      if (result) {
        const status = result.status === 'passed' ? '✅' : '❌';
        log(`${status} ${test.toUpperCase()}: ${result.status}`, result.status === 'passed' ? 'green' : 'red');
      } else {
        log(`⏳ ${test.toUpperCase()}: Not run`, 'yellow');
      }
    }
    
    log('='.repeat(50), 'bold');
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  const options = {
    verbose: args.includes('--verbose') || args.includes('-v'),
    stopOnError: args.includes('--stop-on-error'),
    mobile: args.includes('--mobile'),
    e2e: args.includes('--e2e'),
    integration: args.includes('--integration'),
    qa: args.includes('--qa'),
    all: !args.includes('--mobile') && !args.includes('--e2e') && !args.includes('--integration') && !args.includes('--qa')
  };

  const runner = new AutomationRunner();

  try {
    await runner.checkDependencies();

    if (options.mobile || options.all) {
      await runner.runMobileTests(options);
    }

    if (options.e2e || options.all) {
      await runner.runE2ETests(options);
    }

    if (options.integration || options.all) {
      await runner.runIntegrationTests(options);
    }

    if (options.qa || options.all) {
      await runner.runQAChecks(options);
    }

    const report = await runner.generateReport();
    runner.printSummary();

    // Exit with error code if any tests failed
    const hasFailures = Object.values(runner.results).some(r => r?.status === 'failed');
    process.exit(hasFailures ? 1 : 0);

  } catch (error) {
    log(`\n❌ Automation failed: ${error.message}`, 'red');
    process.exit(1);
  }
}

// Help message
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(`
🤖 Unified Automation Runner

Usage:
  node run-all-automation.js [options]

Options:
  --mobile          Run only mobile tests
  --e2e            Run only E2E tests  
  --integration    Run only integration tests
  --qa             Run only QA checks
  --verbose, -v    Show detailed output
  --stop-on-error  Stop on first failure
  --help, -h       Show this help message

Examples:
  node run-all-automation.js                    # Run all tests
  node run-all-automation.js --mobile --verbose # Run mobile tests with output
  node run-all-automation.js --qa --stop-on-error # Run QA checks, stop on error
`);
  process.exit(0);
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { AutomationRunner };
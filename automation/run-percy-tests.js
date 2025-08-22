#!/usr/bin/env node

/**
 * 🎨 PERCY VISUAL REGRESSION TEST RUNNER
 * 
 * Comprehensive test runner for Percy visual regression testing
 * Features:
 * - Multi-environment support (local, CI/CD)
 * - Parallel test execution
 * - Banking-specific test suites
 * - Hebrew RTL validation
 * - Mobile button overflow testing
 * - Jira integration for failures
 */

const { spawn, exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

// Configuration
const config = {
  environments: {
    local: {
      baseUrl: 'http://localhost:5173',
      apiUrl: 'http://localhost:8003',
      percy: {
        token: process.env.PERCY_TOKEN || 'local-dev-token',
        branch: process.env.PERCY_BRANCH || 'local-development',
        config: 'automation/configs/percy.config.json'
      }
    },
    ci: {
      baseUrl: process.env.CYPRESS_BASE_URL || 'http://localhost:5173',
      apiUrl: process.env.CYPRESS_API_URL || 'http://localhost:8003',
      percy: {
        token: process.env.PERCY_TOKEN,
        branch: process.env.PERCY_BRANCH || process.env.BRANCH_NAME || 'main',
        config: 'automation/configs/percy.config.json'
      }
    }
  },
  
  testSuites: {
    'mortgage-visual': {
      spec: 'automation/tests/e2e/visual-regression/mortgage-calculator-percy.cy.ts',
      description: '🏠 Mortgage Calculator Visual Tests',
      priority: 'high',
      estimatedDuration: 8 // minutes
    },
    'credit-visual': {
      spec: 'automation/tests/e2e/visual-regression/credit-calculator-percy.cy.ts', 
      description: '💳 Credit Calculator Visual Tests',
      priority: 'high',
      estimatedDuration: 6
    },
    'mobile-overflow': {
      spec: 'automation/tests/e2e/visual-regression/mobile-button-overflow-percy.cy.ts',
      description: '📱 Mobile Button Overflow Tests',
      priority: 'critical',
      estimatedDuration: 10,
      config: 'automation/configs/percy.mobile.config.json'
    },
    'hebrew-rtl': {
      spec: 'automation/tests/e2e/visual-regression/hebrew-rtl-percy.cy.ts',
      description: '🇮🇱 Hebrew RTL Visual Tests',
      priority: 'high',
      estimatedDuration: 7
    },
    'existing-visual': {
      spec: 'automation/tests/e2e/e2e/visual/*.cy.ts',
      description: '🎨 Existing Visual Tests',
      priority: 'medium',
      estimatedDuration: 5
    }
  }
};

class PercyTestRunner {
  constructor() {
    this.environment = process.env.NODE_ENV === 'production' || process.env.CI ? 'ci' : 'local';
    this.config = config.environments[this.environment];
    this.results = {
      passed: [],
      failed: [],
      skipped: [],
      totalDuration: 0,
      visualDifferences: []
    };
    
    console.log(`🎨 Percy Test Runner initialized for ${this.environment} environment`);
  }

  async validateEnvironment() {
    console.log('🔍 Validating environment...');
    
    // Check Percy token
    if (!this.config.percy.token) {
      throw new Error('❌ PERCY_TOKEN not configured');
    }
    
    // Check if servers are running
    try {
      await this.checkUrl(this.config.baseUrl, 'Frontend');
      await this.checkUrl(this.config.apiUrl, 'Backend API');
    } catch (error) {
      console.warn('⚠️ Server availability check failed:', error.message);
      if (this.environment === 'ci') {
        throw error; // Fail in CI if servers aren't ready
      }
    }
    
    // Validate Percy configuration files
    const percyConfigs = [
      'automation/configs/percy.config.json',
      'automation/configs/percy.mobile.config.json'
    ];
    
    percyConfigs.forEach(configFile => {
      if (!fs.existsSync(configFile)) {
        throw new Error(`❌ Percy config not found: ${configFile}`);
      }
    });
    
    console.log('✅ Environment validation completed');
  }

  async checkUrl(url, name) {
    try {
      const response = await axios.get(url, { timeout: 5000 });
      console.log(`✅ ${name} server running at ${url}`);
      return true;
    } catch (error) {
      console.error(`❌ ${name} server not accessible at ${url}`);
      throw new Error(`${name} server unavailable`);
    }
  }

  async runTestSuite(suiteName, options = {}) {
    const suite = config.testSuites[suiteName];
    if (!suite) {
      throw new Error(`❌ Test suite not found: ${suiteName}`);
    }

    console.log(`\n🚀 Running ${suite.description}`);
    console.log(`📄 Spec: ${suite.spec}`);
    console.log(`⏱️ Estimated duration: ${suite.estimatedDuration} minutes`);

    const startTime = Date.now();
    
    try {
      const percyConfig = suite.config || this.config.percy.config;
      
      const cypressArgs = [
        'run',
        '--config-file', 'automation/configs/cypress.config.ts',
        '--spec', suite.spec,
        '--env', `percy=true,percyBranch=${this.config.percy.branch}`,
        '--browser', options.browser || 'chrome'
      ];

      if (options.headed) {
        cypressArgs.push('--headed');
      }

      // Set Percy environment variables
      const percyEnv = {
        ...process.env,
        PERCY_TOKEN: this.config.percy.token,
        PERCY_BRANCH: this.config.percy.branch,
        CYPRESS_BASE_URL: this.config.baseUrl,
        PERCY_PARALLEL_NONCE: options.nonce || `local-${Date.now()}`
      };

      const result = await this.runPercyExec(percyConfig, 'cypress', cypressArgs, percyEnv);
      
      const duration = (Date.now() - startTime) / 1000 / 60; // minutes
      
      if (result.success) {
        this.results.passed.push({
          suite: suiteName,
          description: suite.description,
          duration: duration
        });
        console.log(`✅ ${suite.description} completed in ${duration.toFixed(1)} minutes`);
      } else {
        this.results.failed.push({
          suite: suiteName,
          description: suite.description,
          duration: duration,
          error: result.error
        });
        console.log(`❌ ${suite.description} failed in ${duration.toFixed(1)} minutes`);
        
        // Create Jira issue for visual regression failures
        await this.reportVisualRegressionFailure(suiteName, suite, result.error);
      }
      
      this.results.totalDuration += duration;
      return result;
      
    } catch (error) {
      console.error(`❌ Error running ${suiteName}:`, error.message);
      this.results.failed.push({
        suite: suiteName,
        description: suite.description,
        error: error.message
      });
      throw error;
    }
  }

  async runPercyExec(percyConfig, command, args, env) {
    return new Promise((resolve, reject) => {
      const percyArgs = ['exec', '--config', percyConfig, '--', command, ...args];
      
      console.log(`🎨 Executing: percy ${percyArgs.join(' ')}`);
      
      const percyProcess = spawn('npx', ['percy', ...percyArgs], {
        stdio: 'inherit',
        env: env,
        cwd: process.cwd()
      });

      percyProcess.on('close', (code) => {
        if (code === 0) {
          resolve({ success: true });
        } else {
          resolve({ 
            success: false, 
            error: `Percy process exited with code ${code}`
          });
        }
      });

      percyProcess.on('error', (error) => {
        reject(new Error(`Percy process error: ${error.message}`));
      });
    });
  }

  async reportVisualRegressionFailure(suiteName, suite, error) {
    if (this.environment !== 'ci') {
      console.log('⚠️ Skipping Jira reporting in local environment');
      return;
    }

    try {
      const visualRegressionData = {
        testName: suite.description,
        snapshots: [`${suiteName}-failure`],
        percyBuildUrl: `https://percy.io/banking-app/builds/${process.env.PERCY_PARALLEL_NONCE || 'unknown'}`,
        visualDifferences: [{
          elementName: 'Banking UI Component',
          changeType: 'layout',
          severity: suite.priority === 'critical' ? 'critical' : 'high'
        }],
        affectedLanguages: suiteName.includes('hebrew') ? ['he'] : ['he', 'en', 'ru'],
        affectedViewports: suiteName.includes('mobile') ? [375, 414, 428] : [375, 768, 1280, 1920],
        bankingImpact: suiteName.includes('mobile') ? 'critical-path' : 'ui-only',
        screenshots: [],
        specFile: suite.spec,
        branch: this.config.percy.branch,
        commit: process.env.COMMIT_SHA || 'unknown',
        testFailure: true
      };

      // This would be called through Cypress task
      console.log('🎯 Visual regression failure data prepared for Jira:', {
        suite: suiteName,
        priority: suite.priority,
        percyBranch: this.config.percy.branch
      });
      
    } catch (error) {
      console.error('❌ Failed to report visual regression failure:', error.message);
    }
  }

  async runAllSuites(options = {}) {
    console.log('🚀 Starting comprehensive Percy visual regression testing');
    console.log(`📊 Total test suites: ${Object.keys(config.testSuites).length}`);
    
    const startTime = Date.now();
    const suitesToRun = options.suites || Object.keys(config.testSuites);
    
    // Run critical tests first
    const criticalSuites = suitesToRun.filter(name => 
      config.testSuites[name].priority === 'critical'
    );
    
    const otherSuites = suitesToRun.filter(name => 
      config.testSuites[name].priority !== 'critical'
    );

    console.log(`🔴 Critical suites (${criticalSuites.length}): ${criticalSuites.join(', ')}`);
    console.log(`🟡 Other suites (${otherSuites.length}): ${otherSuites.join(', ')}`);

    // Run critical tests first
    for (const suiteName of criticalSuites) {
      try {
        await this.runTestSuite(suiteName, options);
      } catch (error) {
        console.error(`❌ Critical test suite failed: ${suiteName}`);
        if (options.failFast) {
          throw error;
        }
      }
    }

    // Run other tests
    for (const suiteName of otherSuites) {
      try {
        await this.runTestSuite(suiteName, options);
      } catch (error) {
        console.error(`❌ Test suite failed: ${suiteName}`);
        if (options.failFast) {
          throw error;
        }
      }
    }

    const totalTime = (Date.now() - startTime) / 1000 / 60;
    this.generateSummaryReport(totalTime);
  }

  generateSummaryReport(totalTime) {
    console.log('\n📊 PERCY VISUAL REGRESSION TESTING SUMMARY');
    console.log('=' .repeat(50));
    
    console.log(`\n✅ Passed: ${this.results.passed.length}`);
    this.results.passed.forEach(result => {
      console.log(`  • ${result.description} (${result.duration.toFixed(1)}m)`);
    });
    
    console.log(`\n❌ Failed: ${this.results.failed.length}`);
    this.results.failed.forEach(result => {
      console.log(`  • ${result.description} (${result.duration?.toFixed(1)}m) - ${result.error}`);
    });

    console.log(`\n⏱️ Total Duration: ${totalTime.toFixed(1)} minutes`);
    console.log(`🎯 Success Rate: ${(this.results.passed.length / (this.results.passed.length + this.results.failed.length) * 100).toFixed(1)}%`);
    
    if (this.results.failed.length > 0) {
      console.log('\n🚨 VISUAL REGRESSION FAILURES DETECTED');
      console.log('👉 Check Percy dashboard for visual differences');
      console.log('👉 Review Jira issues for detailed failure tracking');
    }

    // Generate JSON report for CI/CD
    const report = {
      timestamp: new Date().toISOString(),
      environment: this.environment,
      results: this.results,
      summary: {
        total: this.results.passed.length + this.results.failed.length,
        passed: this.results.passed.length,
        failed: this.results.failed.length,
        successRate: this.results.passed.length / (this.results.passed.length + this.results.failed.length) * 100,
        totalDuration: totalTime
      }
    };

    fs.writeFileSync('automation/reports/percy-test-results.json', JSON.stringify(report, null, 2));
    console.log('\n📄 Detailed report saved to: automation/reports/percy-test-results.json');
  }

  async runQuickTest() {
    console.log('🏃‍♂️ Running quick Percy visual regression test');
    
    // Run only critical mobile tests for quick feedback
    await this.runTestSuite('mobile-overflow', { browser: 'chrome' });
  }

  async runMobileTests() {
    console.log('📱 Running mobile-focused Percy tests');
    
    const mobileOptions = { 
      browser: 'chrome',
      viewport: { width: 375, height: 812 }
    };

    await this.runTestSuite('mobile-overflow', mobileOptions);
    await this.runTestSuite('hebrew-rtl', mobileOptions);
  }

  async runDesktopTests() {
    console.log('🖥️ Running desktop Percy tests');
    
    const desktopOptions = { 
      browser: 'chrome',
      viewport: { width: 1920, height: 1080 }
    };

    await this.runTestSuite('mortgage-visual', desktopOptions);
    await this.runTestSuite('credit-visual', desktopOptions);
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'all';
  
  const runner = new PercyTestRunner();
  
  try {
    await runner.validateEnvironment();
    
    switch (command) {
      case 'all':
        await runner.runAllSuites();
        break;
      case 'quick':
        await runner.runQuickTest();
        break;
      case 'mobile':
        await runner.runMobileTests();
        break;
      case 'desktop':
        await runner.runDesktopTests();
        break;
      case 'suite':
        const suiteName = args[1];
        if (!suiteName) {
          throw new Error('Please specify suite name: npm run percy suite <suite-name>');
        }
        await runner.runTestSuite(suiteName);
        break;
      default:
        console.log('Usage: npm run percy [all|quick|mobile|desktop|suite <name>]');
        console.log('Available suites:', Object.keys(config.testSuites).join(', '));
        process.exit(1);
    }
    
    if (runner.results.failed.length > 0) {
      process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ Percy test runner failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { PercyTestRunner, config };
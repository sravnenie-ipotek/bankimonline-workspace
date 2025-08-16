#!/usr/bin/env node

/**
 * ZERO-DELAY QA Watcher
 * Runs tests in background WITHOUT blocking development
 */

// Check if chokidar is installed
try {
  const chokidar = require('chokidar');
} catch (e) {
  console.error('❌ ERROR: chokidar not installed!');
  console.error('Run: npm install --save-dev chokidar');
  process.exit(1);
}

const chokidar = require('chokidar');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const { updateStats } = require('./qa-stats-generator');

// Configuration for NO DELAYS
const config = {
  // Only watch source files you're actively working on
  watchPaths: process.argv[2] || 'mainapp/src',
  
  // Debounce to avoid multiple triggers (wait 500ms after last change)
  debounceMs: 500,
  
  // Run tests in background with low priority
  testCommand: 'nice -n 19 npm test',
  
  // Don't block anything
  blocking: false
};

console.log('🚀 QA Watcher Started (Zero-Delay Mode)');
console.log(`👀 Watching: ${config.watchPaths}`);

let testTimeout;
let lastTestProcess;

const watcher = chokidar.watch(config.watchPaths, {
  ignored: /(^|[\/\\])\../, // ignore dotfiles
  persistent: true,
  ignoreInitial: true
});

watcher.on('change', (filepath) => {
  // Clear previous pending test
  clearTimeout(testTimeout);
  
  // Kill previous test if still running (to save resources)
  if (lastTestProcess && !lastTestProcess.killed) {
    lastTestProcess.kill();
  }
  
  // Debounce - wait for user to finish typing
  testTimeout = setTimeout(() => {
    runTestsInBackground(filepath);
  }, config.debounceMs);
});

function runTestsInBackground(filepath) {
  const filename = path.basename(filepath);
  
  // Update stats for file change
  updateStats('change', `File modified: ${filename}`);
  
  // Smart test selection - only test related files
  const testFile = findTestFile(filepath);
  if (!testFile) {
    console.log(`⏭️  No tests for ${filename} - skipping`);
    updateStats('skip', `No tests found for ${filename}`);
    return;
  }
  
  console.log(`🧪 Testing ${filename} (background, no delay)...`);
  
  // Run test in background with low CPU priority (cross-platform)
  const isWindows = process.platform === 'win32';
  const testCmd = isWindows 
    ? ['npm', 'test', '--', testFile, '--silent']
    : ['nice', '-n', '19', 'npm', 'test', '--', testFile, '--silent'];
  
  lastTestProcess = spawn(isWindows ? 'npm' : 'nice', isWindows ? testCmd : testCmd.slice(1), {
    detached: true,
    stdio: 'pipe'
  });
  
  // Collect results WITHOUT blocking
  let output = '';
  lastTestProcess.stdout.on('data', (data) => {
    output += data.toString();
  });
  
  lastTestProcess.on('close', (code) => {
    if (code === 0) {
      // Tests passed - just log quietly
      console.log(`✅ ${filename} - tests passed`);
      updateStats('pass', `Tests passed for ${filename}`);
    } else {
      // Tests failed - notify but don't block
      console.log(`⚠️  ${filename} - tests need attention (check .qa-results.log)`);
      updateStats('fail', `Tests failed for ${filename}`);
      fs.appendFileSync('.qa-results.log', `\n[${new Date().toISOString()}] ${filename}:\n${output}\n`);
      
      // Cross-platform notification (if available)
      if (process.platform === 'darwin') {
        spawn('osascript', ['-e', `display notification "Tests failed for ${filename}" with title "QA Alert" sound name "Glass"`]);
      } else if (process.platform === 'win32') {
        spawn('msg', ['*', `/TIME:5`, `QA Alert: Tests failed for ${filename}`]);
      }
    }
  });
}

function findTestFile(filepath) {
  // Handle both mainapp and server structures
  const basename = path.basename(filepath, path.extname(filepath));
  const ext = path.extname(filepath);
  
  // Possible test locations based on project structure
  const testPatterns = [
    // mainapp Cypress tests
    `mainapp/cypress/e2e/**/${basename}.cy.ts`,
    `mainapp/cypress/e2e/**/${basename}.spec.ts`,
    // Root level Playwright tests
    `tests/${basename}.spec.ts`,
    `tests/${basename}.spec.js`,
    // Component tests
    filepath.replace(ext, `.test${ext}`),
    filepath.replace(ext, `.spec${ext}`)
  ];
  
  for (const pattern of testPatterns) {
    if (fs.existsSync(pattern)) {
      return pattern;
    }
  }
  
  return null; // No test file found - skip testing
}

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 QA Watcher stopped');
  if (lastTestProcess && !lastTestProcess.killed) {
    lastTestProcess.kill();
  }
  process.exit(0);
});

console.log('💡 Tip: Tests run in background with low priority - zero delays!');
console.log('📝 Failed tests logged to: .qa-results.log\n');
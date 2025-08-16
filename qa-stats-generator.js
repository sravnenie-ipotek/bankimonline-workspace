#!/usr/bin/env node

/**
 * Lightweight stats generator for QA Dashboard
 * Updates .qa-stats.json file that dashboard reads
 */

const fs = require('fs');
const path = require('path');

// Initialize stats file
let stats = {
  passed: 0,
  failed: 0,
  filesChanged: 0,
  lastRun: 'Never',
  recentLogs: []
};

// Load existing stats if available
try {
  if (fs.existsSync('.qa-stats.json')) {
    stats = JSON.parse(fs.readFileSync('.qa-stats.json', 'utf8'));
  }
} catch (e) {
  // Use defaults
}

// Update stats from qa-watcher logs
function updateStats(type, message) {
  const now = new Date().toLocaleTimeString();
  
  if (type === 'pass') {
    stats.passed++;
  } else if (type === 'fail') {
    stats.failed++;
  } else if (type === 'change') {
    stats.filesChanged++;
  }
  
  stats.lastRun = now;
  
  // Keep only last 20 log entries
  stats.recentLogs.unshift({
    type: type,
    message: `[${now}] ${message}`,
    timestamp: Date.now()
  });
  
  if (stats.recentLogs.length > 20) {
    stats.recentLogs = stats.recentLogs.slice(0, 20);
  }
  
  // Write to file (lightweight operation)
  fs.writeFileSync('.qa-stats.json', JSON.stringify(stats, null, 2));
}

// Export for use by qa-watcher
module.exports = { updateStats };

// If run directly, show current stats
if (require.main === module) {
  console.log('📊 Current QA Stats:');
  console.log(`✅ Passed: ${stats.passed}`);
  console.log(`❌ Failed: ${stats.failed}`);
  console.log(`📝 Files Changed: ${stats.filesChanged}`);
  console.log(`⏰ Last Run: ${stats.lastRun}`);
}
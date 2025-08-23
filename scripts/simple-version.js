#!/usr/bin/env node

/**
 * Simple 0.x Version Management System
 * - Increments 0.x version on each deployment
 * - Tracks version in simple-version.txt file
 * - Injects current datetime
 */

const fs = require('fs');
const path = require('path');

// Version file path
const versionFile = path.resolve(__dirname, 'simple-version.txt');

// Get current version or start at 0.1
let currentVersion = '0.1';
if (fs.existsSync(versionFile)) {
  currentVersion = fs.readFileSync(versionFile, 'utf8').trim();
}

// Parse version number
const versionParts = currentVersion.split('.');
const minor = parseInt(versionParts[1] || '1');

// Increment version
const newVersion = `0.${minor + 1}`;

// Save new version
fs.writeFileSync(versionFile, newVersion);

// Generate timestamp in format: HH:MM DD.MM.YYYY
const now = new Date();
const day = String(now.getDate()).padStart(2, '0');
const month = String(now.getMonth() + 1).padStart(2, '0');
const year = now.getFullYear();
const hours = String(now.getHours()).padStart(2, '0');
const minutes = String(now.getMinutes()).padStart(2, '0');

// Format: HH:MM DD.MM.YYYY (matching the version chip display)
const timestamp = `${hours}:${minutes} ${day}.${month}.${year}`;

// Get git info for build number
let gitCommitCount = 'local';
let gitShortHash = 'local';
try {
  const { execSync } = require('child_process');
  gitCommitCount = execSync('git rev-list --count HEAD').toString().trim();
  gitShortHash = execSync('git rev-parse --short HEAD').toString().trim();
} catch (e) {
  console.log('Git info not available, using defaults');
}

// Update buildInfo.ts
const buildInfoPath = path.resolve(__dirname, '../mainapp/src/config/buildInfo.ts');
const buildInfoContent = `/**
 * Build information - automatically generated during build process
 * DO NOT EDIT MANUALLY - This file is auto-generated
 */

export const BUILD_INFO = {
  version: '${newVersion}',
  buildTime: '${timestamp}',
  environment: import.meta.env.MODE || 'production',
  buildNumber: '${process.env.GITHUB_RUN_NUMBER || gitCommitCount}',
  commit: '${process.env.GITHUB_SHA?.substring(0, 7) || gitShortHash}'
};
`;

fs.writeFileSync(buildInfoPath, buildInfoContent);

console.log(`
✨ Simple Version Updated Successfully!
=====================================
📦 Version: ${currentVersion} → ${newVersion}
🕐 Timestamp: ${timestamp}
🔢 Build: #${process.env.GITHUB_RUN_NUMBER || gitCommitCount}
🔗 Commit: ${process.env.GITHUB_SHA?.substring(0, 7) || gitShortHash}
=====================================
`);

// Output for CI/CD
console.log(`::set-output name=version::${newVersion}`);
console.log(`::set-output name=build::${gitCommitCount}`);
#!/usr/bin/env node

/**
 * Automatic Version Management System
 * - Auto-increments patch version on each deployment
 * - Uses git commit count for build number
 * - Injects current datetime
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get package.json
const packagePath = path.resolve(__dirname, '../mainapp/package.json');
const packageJson = require(packagePath);

// Parse current version
let [major, minor, patch] = packageJson.version.split('.').map(Number);

// Determine version bump strategy
const bumpType = process.argv[2] || 'patch'; // patch, minor, major, or auto

if (bumpType === 'auto') {
  // Auto-increment patch on each deployment
  patch++;
} else if (bumpType === 'patch') {
  patch++;
} else if (bumpType === 'minor') {
  minor++;
  patch = 0;
} else if (bumpType === 'major') {
  major++;
  minor = 0;
  patch = 0;
}

// New version
const newVersion = `${major}.${minor}.${patch}`;

// Get git info for build number
let gitCommitCount = 'local';
let gitShortHash = 'local';
try {
  gitCommitCount = execSync('git rev-list --count HEAD').toString().trim();
  gitShortHash = execSync('git rev-parse --short HEAD').toString().trim();
} catch (e) {
  console.log('Git info not available, using defaults');
}

// Update package.json
packageJson.version = newVersion;
fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2) + '\n');

// Generate timestamp in format: HH:MM DD.MM.YYYY
const now = new Date();
const day = String(now.getDate()).padStart(2, '0');
const month = String(now.getMonth() + 1).padStart(2, '0');
const year = now.getFullYear();
const hours = String(now.getHours()).padStart(2, '0');
const minutes = String(now.getMinutes()).padStart(2, '0');

// Format: HH:MM DD.MM.YYYY (matching the version chip display)
const timestamp = `${hours}:${minutes} ${day}.${month}.${year}`;

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
✨ Version Auto-Updated Successfully!
=====================================
📦 Version: ${packageJson.version} → ${newVersion}
🕐 Timestamp: ${timestamp}
🔢 Build: #${process.env.GITHUB_RUN_NUMBER || gitCommitCount}
🔗 Commit: ${process.env.GITHUB_SHA?.substring(0, 7) || gitShortHash}
=====================================
`);

// Output for CI/CD
console.log(`::set-output name=version::${newVersion}`);
console.log(`::set-output name=build::${gitCommitCount}`);
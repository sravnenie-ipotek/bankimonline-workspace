#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Get version from package.json
const packageJson = require('../package.json');
const version = packageJson.version || '1.0.0';

// Generate current timestamp in dd.mm.yyyy hh:mm format
const now = new Date();
const day = String(now.getDate()).padStart(2, '0');
const month = String(now.getMonth() + 1).padStart(2, '0');
const year = now.getFullYear();
const hours = String(now.getHours()).padStart(2, '0');
const minutes = String(now.getMinutes()).padStart(2, '0');

const buildTime = `${day}.${month}.${year} ${hours}:${minutes}`;

// Get GitHub info if available
const buildNumber = process.env.GITHUB_RUN_NUMBER || 'local';
const commit = process.env.GITHUB_SHA ? process.env.GITHUB_SHA.substring(0, 7) : 'local';

// Path to buildInfo.ts
const buildInfoPath = path.resolve(__dirname, '../src/config/buildInfo.ts');

// Build info content
const buildInfoContent = `/**
 * Build information - automatically generated during build process
 * This file is updated by the build script with the current timestamp
 */

// This will be replaced during build with actual timestamp
export const BUILD_INFO = {
  version: '${version}',
  buildTime: '${buildTime}',
  environment: import.meta.env.MODE || 'development',
  buildNumber: '${buildNumber}',
  commit: '${commit}'
};
`;

// Write the file
fs.writeFileSync(buildInfoPath, buildInfoContent);

console.log(`✅ Build info updated:`);
console.log(`   Version: ${version}`);
console.log(`   Time: ${buildTime}`);
console.log(`   Build: #${buildNumber}`);
console.log(`   Commit: ${commit}`);
console.log(`📁 Updated: ${buildInfoPath}`);
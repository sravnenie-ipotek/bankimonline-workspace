#!/usr/bin/env node

/**
 * Update build info with current timestamp and version
 * This script runs before each build to inject deployment metadata
 */

const fs = require('fs');
const path = require('path');

// Get version from package.json
const packageJson = require('../package.json');
const version = packageJson.version || '1.0.0';

// Generate timestamp in DD.MM.YYYY HH:MM format
const now = new Date();
const pad = (n) => n.toString().padStart(2, '0');
const buildTime = `${pad(now.getDate())}.${pad(now.getMonth() + 1)}.${now.getFullYear()} ${pad(now.getHours())}:${pad(now.getMinutes())}`;

// Get environment
const environment = process.env.NODE_ENV || 'development';

// Build info content
const buildInfoContent = `/**
 * Build information - automatically generated during build process
 * This file is updated by the build script with the current timestamp
 */

// This will be replaced during build with actual timestamp
export const BUILD_INFO = {
  version: '${version}',
  buildTime: '${buildTime}',
  environment: import.meta.env.MODE || '${environment}',
  buildNumber: '${process.env.GITHUB_RUN_NUMBER || 'local'}',
  commit: '${process.env.GITHUB_SHA ? process.env.GITHUB_SHA.substring(0, 7) : 'local'}'
};
`;

// Write to buildInfo.ts
const buildInfoPath = path.join(__dirname, '..', 'src', 'config', 'buildInfo.ts');
fs.writeFileSync(buildInfoPath, buildInfoContent, 'utf8');

console.log(`✅ Build info updated:`);
console.log(`   Version: ${version}`);
console.log(`   Time: ${buildTime}`);
console.log(`   Environment: ${environment}`);
console.log(`   Build: ${process.env.GITHUB_RUN_NUMBER || 'local'}`);
console.log(`   Commit: ${process.env.GITHUB_SHA ? process.env.GITHUB_SHA.substring(0, 7) : 'local'}`);
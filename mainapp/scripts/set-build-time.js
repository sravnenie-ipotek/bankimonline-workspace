#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Generate current timestamp in dd.mm.yyyy hh:mm format
const now = new Date();
const day = String(now.getDate()).padStart(2, '0');
const month = String(now.getMonth() + 1).padStart(2, '0');
const year = now.getFullYear();
const hours = String(now.getHours()).padStart(2, '0');
const minutes = String(now.getMinutes()).padStart(2, '0');

const buildTime = `${day}.${month}.${year} ${hours}:${minutes}`;

// Path to buildInfo.ts
const buildInfoPath = path.resolve(__dirname, '../src/config/buildInfo.ts');

// Build info content
const buildInfoContent = `/**
 * Build information - automatically generated during build process
 * This file is updated by the build script with the current timestamp
 */

// This will be replaced during build with actual timestamp
export const BUILD_INFO = {
  version: '0.1',
  buildTime: '${buildTime}',
  environment: import.meta.env.MODE || 'development'
};
`;

// Write the file
fs.writeFileSync(buildInfoPath, buildInfoContent);

console.log(`✅ Build time set to: ${buildTime}`);
console.log(`📁 Updated: ${buildInfoPath}`);
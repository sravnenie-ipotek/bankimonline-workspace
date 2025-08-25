#!/usr/bin/env node

/**
 * Version Management System
 * 
 * Semantic Versioning:
 * - MAJOR (Z.y.x): Production release (manual trigger)
 * - MINOR (0.Y.x): Test stable version (manual trigger)
 * - PATCH (0.1.X): Every successful deployment (automatic)
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const VERSION_FILE = path.join(__dirname, '..', 'version.json');
const BUILD_INFO_FILE = path.join(__dirname, '..', 'mainapp', 'src', 'config', 'buildInfo.ts');

class VersionManager {
  constructor() {
    this.loadVersion();
  }

  loadVersion() {
    try {
      const data = fs.readFileSync(VERSION_FILE, 'utf8');
      this.versionData = JSON.parse(data);
    } catch (error) {
      console.error('❌ Error loading version.json:', error.message);
      // Initialize with default if file doesn't exist
      this.versionData = {
        version: "0.1.1",
        major: 0,
        minor: 1,
        patch: 1,
        lastDeployment: null,
        lastCommit: null,
        environment: null
      };
    }
  }

  saveVersion() {
    // Update version string
    this.versionData.version = `${this.versionData.major}.${this.versionData.minor}.${this.versionData.patch}`;
    
    // Add metadata
    this.versionData.lastDeployment = new Date().toISOString();
    
    try {
      this.versionData.lastCommit = execSync('git rev-parse --short HEAD').toString().trim();
    } catch (e) {
      this.versionData.lastCommit = 'unknown';
    }

    // Save to file
    fs.writeFileSync(VERSION_FILE, JSON.stringify(this.versionData, null, 2));
    console.log(`✅ Version updated to: ${this.versionData.version}`);
  }

  incrementPatch() {
    this.versionData.patch++;
    this.saveVersion();
    this.updateBuildInfo();
  }

  incrementMinor() {
    this.versionData.minor++;
    this.versionData.patch = 0; // Reset patch on minor increment
    this.saveVersion();
    this.updateBuildInfo();
  }

  incrementMajor() {
    this.versionData.major++;
    this.versionData.minor = 0; // Reset minor
    this.versionData.patch = 0; // Reset patch
    this.saveVersion();
    this.updateBuildInfo();
  }

  updateBuildInfo() {
    const now = new Date();
    const timestamp = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')} ${now.getDate().toString().padStart(2, '0')}.${(now.getMonth() + 1).toString().padStart(2, '0')}.${now.getFullYear()}`;
    
    let buildNumber = 1;
    try {
      // Try to get build number from GitHub Actions
      buildNumber = process.env.GITHUB_RUN_NUMBER || 
                   process.env.BUILD_NUMBER || 
                   Math.floor(Math.random() * 9999);
    } catch (e) {
      buildNumber = Math.floor(Math.random() * 9999);
    }

    const buildInfo = `/**
 * Build information - automatically generated during build process
 * DO NOT EDIT MANUALLY - This file is auto-generated
 */

export const BUILD_INFO = {
  version: '${this.versionData.version}',
  buildTime: '${timestamp}',
  environment: import.meta.env.MODE || 'production',
  buildNumber: '${buildNumber}',
  commit: '${this.versionData.lastCommit || 'unknown'}'
};
`;

    fs.writeFileSync(BUILD_INFO_FILE, buildInfo);
    console.log(`📝 Updated buildInfo.ts with version ${this.versionData.version}`);
  }

  getCurrentVersion() {
    return this.versionData.version;
  }

  displayVersion() {
    console.log(`
╔════════════════════════════════════════╗
║         VERSION INFORMATION            ║
╠════════════════════════════════════════╣
║ Current Version: ${this.versionData.version.padEnd(22)} ║
║ Major: ${String(this.versionData.major).padEnd(32)} ║
║ Minor: ${String(this.versionData.minor).padEnd(32)} ║
║ Patch: ${String(this.versionData.patch).padEnd(32)} ║
║ Last Deploy: ${(this.versionData.lastDeployment || 'Never').substring(0, 26).padEnd(26)} ║
║ Last Commit: ${(this.versionData.lastCommit || 'Unknown').padEnd(26)} ║
╚════════════════════════════════════════╝
    `);
  }
}

// CLI handling
const args = process.argv.slice(2);
const manager = new VersionManager();

switch(args[0]) {
  case 'patch':
  case 'increment':
  case 'deploy':
    console.log('🚀 Incrementing patch version (successful deployment)...');
    manager.incrementPatch();
    break;
    
  case 'minor':
  case 'test-stable':
    console.log('📦 Incrementing minor version (stable test version)...');
    manager.incrementMinor();
    break;
    
  case 'major':
  case 'production':
    console.log('🎉 Incrementing major version (production release)...');
    manager.incrementMajor();
    break;
    
  case 'show':
  case 'current':
  case 'display':
    manager.displayVersion();
    break;
    
  case 'update':
    // Just update buildInfo without incrementing
    console.log('📝 Updating buildInfo.ts without version increment...');
    manager.updateBuildInfo();
    break;
    
  default:
    console.log(`
Version Manager - Semantic Versioning System
=============================================

Usage: node scripts/version-manager.js [command]

Commands:
  patch, increment, deploy  - Increment patch version (0.1.X++) [AUTO on deploy]
  minor, test-stable       - Increment minor version (0.Y.0) [MANUAL trigger]
  major, production        - Increment major version (Z.0.0) [MANUAL trigger]
  show, current, display   - Display current version info
  update                   - Update buildInfo.ts without incrementing

Current Version: ${manager.getCurrentVersion()}

Versioning Rules:
  • Patch (X): Increments automatically on every successful deployment
  • Minor (Y): Manual trigger when TEST environment is stable
  • Major (Z): Manual trigger when PRODUCTION release is successful
    `);
}

module.exports = { VersionManager };
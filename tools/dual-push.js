#!/usr/bin/env node
/**
 * Dual-Push Script for Hybrid 4-Repository Architecture
 * 
 * Implements the dual-push workflow for bankimonline project:
 * 1. Push to development monorepo (bankimonline-workspace)
 * 2. Push filtered content to deployment repositories using git subtree
 * 
 * Architecture: Development Monorepo + Deployment Multi-repos
 * Reference: /server/docs/repositoriesLogic.md
 */

const { spawn, exec } = require('child_process');
const path = require('path');
const fs = require('fs');

// Repository mappings from repositoriesLogic.md
const REPO_MAPPINGS = {
  client: 'git@github.com:sravnenie-ipotek/bankimonline-web.git',
  server: 'git@github.com:sravnenie-ipotek/bankimonline-api.git', 
  shared: 'git@github.com:sravnenie-ipotek/bankimonline-shared.git'
};

// Package directory mappings
const PACKAGE_PATHS = {
  client: 'packages/client',
  server: 'packages/server', 
  shared: 'packages/shared'
};

class DualPushTool {
  constructor(options = {}) {
    this.dryRun = options.dryRun || false;
    this.verbose = options.verbose || false;
    this.workspaceRepo = 'origin'; // Main workspace repository remote
    this.currentBranch = null;
  }

  async init() {
    // Verify we're in a git repository
    if (!fs.existsSync('.git')) {
      throw new Error('❌ Not in a git repository root. Please run from repository root.');
    }

    // Get current branch
    this.currentBranch = await this.getCurrentBranch();
    // Verify packages directory exists
    if (!fs.existsSync('packages')) {
      throw new Error('❌ packages/ directory not found. Ensure workspace structure is set up.');
    }

    if (this.verbose) {
      }
  }

  async getCurrentBranch() {
    return new Promise((resolve, reject) => {
      exec('git rev-parse --abbrev-ref HEAD', (error, stdout) => {
        if (error) {
          reject(new Error(`Failed to get current branch: ${error.message}`));
          return;
        }
        resolve(stdout.trim());
      });
    });
  }

  async checkWorkingDirectory() {
    return new Promise((resolve, reject) => {
      exec('git status --porcelain', (error, stdout) => {
        if (error) {
          reject(new Error(`Failed to check working directory: ${error.message}`));
          return;
        }
        
        const hasChanges = stdout.trim().length > 0;
        if (hasChanges && !this.dryRun) {
          reject(new Error('Working directory not clean'));
          return;
        }
        
        resolve(!hasChanges);
      });
    });
  }

  async pushToWorkspace() {
    ...`);
    
    if (this.dryRun) {
      return true;
    }

    return new Promise((resolve, reject) => {
      const cmd = `git push ${this.workspaceRepo} ${this.currentBranch}`;
      exec(cmd, (error, stdout, stderr) => {
        if (error) {
          reject(new Error(`Failed to push to workspace: ${error.message}\n${stderr}`));
          return;
        }
        
        if (this.verbose) {
          }
        resolve(true);
      });
    });
  }

  async pushPackageToRepo(packageName, repoUrl) {
    const packagePath = PACKAGE_PATHS[packageName];
    
    if (!fs.existsSync(packagePath)) {
      throw new Error(`❌ Package directory not found: ${packagePath}`);
    }

    to ${repoUrl}...`);

    if (this.dryRun) {
      return true;
    }

    // Use git subtree push to sync package to deployment repository
    const cmd = `git subtree push --prefix=${packagePath} ${repoUrl} ${this.currentBranch}`;
    
    return new Promise((resolve, reject) => {
      if (this.verbose) {
        }

      exec(cmd, { maxBuffer: 1024 * 1024 * 10 }, (error, stdout, stderr) => {
        if (error) {
          // Check if it's a "no new commits" error (not actually an error)
          if (stderr.includes('no new commits') || stderr.includes('already up to date')) {
            resolve(true);
            return;
          }
          
          reject(new Error(`Failed to push ${packageName}: ${error.message}\n${stderr}`));
          return;
        }
        
        if (this.verbose) {
          }
        resolve(true);
      });
    });
  }

  async pushSinglePackage(packageName) {
    if (!REPO_MAPPINGS[packageName]) {
      throw new Error(`❌ Unknown package: ${packageName}. Available: ${Object.keys(REPO_MAPPINGS).join(', ')}`);
    }

    // Step 1: Push to workspace (monorepo)
    await this.pushToWorkspace();
    
    // Step 2: Push to deployment repository using git subtree
    await this.pushPackageToRepo(packageName, REPO_MAPPINGS[packageName]);
    
    }

  async pushAllPackages() {
    // Step 1: Push to workspace once
    await this.pushToWorkspace();
    
    // Step 2: Push all packages to their deployment repositories
    const packages = Object.keys(REPO_MAPPINGS);
    
    for (const packageName of packages) {
      try {
        await this.pushPackageToRepo(packageName, REPO_MAPPINGS[packageName]);
      } catch (error) {
        console.error(`❌ Failed to push ${packageName}:`, error.message);
        throw error;
      }
    }
    
    }

  async validatePackages() {
    const packages = Object.keys(PACKAGE_PATHS);
    const issues = [];
    
    for (const packageName of packages) {
      const packagePath = PACKAGE_PATHS[packageName];
      const packageJsonPath = path.join(packagePath, 'package.json');
      
      if (!fs.existsSync(packagePath)) {
        issues.push(`❌ Missing package directory: ${packagePath}`);
        continue;
      }
      
      if (!fs.existsSync(packageJsonPath)) {
        issues.push(`❌ Missing package.json: ${packageJsonPath}`);
        continue;
      }
      
      try {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        const expectedName = `@bankimonline/${packageName}`;
        
        if (packageJson.name !== expectedName) {
          issues.push(`⚠️  ${packageName}: package.json name should be "${expectedName}", found "${packageJson.name}"`);
        }
      } catch (error) {
        issues.push(`❌ Invalid package.json in ${packagePath}: ${error.message}`);
      }
    }
    
    if (issues.length > 0) {
      issues.forEach(issue => );
      
      if (!this.dryRun) {
        throw new Error('Package validation failed. Use --dry-run to see issues without failing.');
      }
    } else {
      }
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  const target = args[0];
  const flags = args.slice(1);
  
  const options = {
    dryRun: flags.includes('--dry-run'),
    verbose: flags.includes('--verbose'),
  };

  if (!target || target === 'help' || target === '--help') {
    server    Push server package (packages/server → bankimonline-api) 
  shared    Push shared package (packages/shared → bankimonline-shared)
  all       Push all packages to their respective repositories
  validate  Validate package structure without pushing

Flags:
  --dry-run    Show what would be pushed without actually pushing
  --verbose    Show detailed output
  --help       Show this help message

Examples:
  node tools/dual-push.js client --dry-run
  node tools/dual-push.js all --verbose
  node tools/dual-push.js validate

Repository Mappings:
  client → git@github.com:sravnenie-ipotek/bankimonline-web.git
  server → git@github.com:sravnenie-ipotek/bankimonline-api.git
  shared → git@github.com:sravnenie-ipotek/bankimonline-shared.git
    `);
    process.exit(0);
  }

  const tool = new DualPushTool(options);

  try {
    await tool.init();
    await tool.checkWorkingDirectory();

    if (target === 'validate') {
      await tool.validatePackages();
      process.exit(0);
    }

    if (target === 'all') {
      await tool.pushAllPackages();
    } else if (['client', 'server', 'shared'].includes(target)) {
      await tool.pushSinglePackage(target);
    } else {
      throw new Error(`❌ Unknown target: ${target}. Use 'client', 'server', 'shared', 'all', or 'validate'`);
    }

    } catch (error) {
    console.error(`\n💥 Dual-push failed:`, error.message);
    
    if (options.verbose) {
      console.error('\n🔍 Stack trace:');
      console.error(error.stack);
    }
    
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { DualPushTool, REPO_MAPPINGS, PACKAGE_PATHS };
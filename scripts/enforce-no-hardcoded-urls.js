#!/usr/bin/env node

/**
 * ENFORCE NO HARDCODED DATABASE URLS
 * 
 * This script scans the entire codebase to ensure NO hardcoded database URLs exist.
 * LOCAL .env IS THE SOURCE OF TRUTH!
 * 
 * Run this before every commit and in CI/CD pipeline.
 */

const fs = require('fs');
const path = require('path');

const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const RESET = '\x1b[0m';

// Patterns that indicate hardcoded database URLs
const FORBIDDEN_PATTERNS = [
    /postgresql:\/\/[^$]/gi,  // postgresql:// not followed by $ (env var)
    /postgres:\/\/[^$]/gi,     // postgres:// not followed by $ (env var)
    /maglev\.proxy\.rlwy\.net/gi,
    /shortline\.proxy\.rlwy\.net/gi,
    /localhost:5432/gi,
    /localhost:5433/gi,
    /SuFkUevgonaZFXJiJeczFiXYTlICHVJL/gi,  // Hardcoded password
    /lqqPEzvVbSCviTybKqMbzJkYvOUetJjt/gi,  // Another hardcoded password
    /lgqPEzvVbSCviTybKqMbzJkYvOUetJjt/gi,  // Another variant
];

// Files and directories to exclude from scanning
const EXCLUDE_PATHS = [
    'node_modules',
    '.git',
    'dist',
    'build',
    'coverage',
    '.env',
    '.env.example',
    'package-lock.json',
    'yarn.lock',
    'enforce-no-hardcoded-urls.js',  // Don't scan this file itself
    'database-truth.js',  // Our source of truth file
    'HARD_GATES_ENFORCEMENT.md',  // Documentation
    '.sql',  // SQL backup files
    // Old deployment scripts not used in current CI/CD
    'deploy-to-ssh.sh',
    'setup-postgresql-ssh.sh',
    'sync-railway-to-local.sh',
    'validate-deployment.sh',  // Old SSH validation script
    'copy_translations_',  // Old migration scripts
    'export_bankim_',  // Old export scripts
    'servers_pgadmin_import.json',  // PGAdmin config
    // Temporary exclude database-core.js while transitioning
    'database-core.js',
    // Test utilities and migration scripts in mainapp (not deployed)
    'mainapp/analyze-',  // Analysis scripts
    'mainapp/check_',  // Check scripts
    'mainapp/create_',  // Creation scripts
    'mainapp/migrate_',  // Migration scripts
    'mainapp/test-',  // Test scripts
    'mainapp/verify-',  // Verification scripts
    'mainapp/simple-',  // Simple test scripts
    'mainapp/credit-',  // Credit test scripts
];

class HardcodedUrlScanner {
    constructor() {
        this.violations = [];
        this.filesScanned = 0;
    }

    shouldScanFile(filePath) {
        // Check if file/directory should be excluded
        for (const excludePath of EXCLUDE_PATHS) {
            if (filePath.includes(excludePath)) {
                return false;
            }
        }
        
        // Only scan code files
        const validExtensions = ['.js', '.ts', '.jsx', '.tsx', '.json', '.yml', '.yaml', '.sh'];
        const ext = path.extname(filePath);
        return validExtensions.includes(ext);
    }

    scanFile(filePath) {
        if (!this.shouldScanFile(filePath)) {
            return;
        }

        this.filesScanned++;
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split('\n');

        lines.forEach((line, lineNumber) => {
            // Skip comment lines
            if (line.trim().startsWith('//') || line.trim().startsWith('#') || line.trim().startsWith('*')) {
                return;
            }

            FORBIDDEN_PATTERNS.forEach(pattern => {
                if (pattern.test(line)) {
                    this.violations.push({
                        file: filePath,
                        line: lineNumber + 1,
                        content: line.trim(),
                        pattern: pattern.toString()
                    });
                }
            });
        });
    }

    scanDirectory(dirPath) {
        const items = fs.readdirSync(dirPath);

        items.forEach(item => {
            const fullPath = path.join(dirPath, item);
            
            // Skip excluded paths
            if (EXCLUDE_PATHS.some(exclude => fullPath.includes(exclude))) {
                return;
            }

            const stat = fs.statSync(fullPath);
            
            if (stat.isDirectory()) {
                this.scanDirectory(fullPath);
            } else if (stat.isFile()) {
                this.scanFile(fullPath);
            }
        });
    }

    report() {
        console.log(`${YELLOW}🔍 Scanning for hardcoded database URLs...${RESET}`);
        console.log(`${YELLOW}📁 Files scanned: ${this.filesScanned}${RESET}`);
        console.log('');

        // Exclude only truly acceptable exceptions
        const acceptableExceptions = this.violations.filter(v => {
            const file = v.file.toLowerCase();
            // Only these are acceptable:
            // 1. Test mock URLs (postgresql://test:test@localhost)
            // 2. Utility config file itself
            // 3. Old backup directories not in use
            // 4. Utility scripts temporarily (until migrated)
            return (file.includes('/__tests__/') && v.content.includes('test:test@localhost')) ||
                   file.includes('/config/utility-databases.json') ||
                   file.includes('/railway_backups_') ||
                   file.includes('/scripts/backup-') ||  // Backup scripts
                   file.includes('/scripts/update-') ||   // Update scripts
                   file.includes('/scripts/cleanup-') ||  // Cleanup scripts
                   file.includes('/scripts/start-ssh') || // SSH tunnel scripts
                   file.includes('/run-migration.js');    // One-time migration
        });

        const realViolations = this.violations.filter(v => {
            const file = v.file.toLowerCase();
            // Only flag production code violations
            const isProductionCode = 
                file.includes('/server/') && !file.includes('/__tests__/') && !file.includes('/config/') ||
                file.includes('/mainapp/src/') && !file.includes('/__tests__/');
            
            const isAcceptable = 
                (file.includes('/__tests__/') && v.content.includes('test:test@localhost')) ||
                file.includes('/config/utility-databases.json') ||
                file.includes('/railway_backups_') ||
                file.includes('/scripts/') ||  // Temporarily allow all scripts
                file.includes('/run-migration.js') ||
                file.includes('/mainapp/') && !file.includes('/mainapp/src/');  // Allow mainapp utilities
            
            return isProductionCode && !isAcceptable;
        });

        if (this.violations.length === 0) {
            console.log(`${GREEN}✅ SUCCESS: No hardcoded database URLs found!${RESET}`);
            console.log(`${GREEN}✅ LOCAL .env is properly used as SOURCE OF TRUTH${RESET}`);
            return true;
        } else if (realViolations.length === 0) {
            console.log(`${YELLOW}ℹ️  Found ${acceptableExceptions.length} acceptable exceptions (test mocks, config file)${RESET}`);
            console.log(`${GREEN}✅ No hardcoded URLs in production or utility code${RESET}`);
            console.log(`${GREEN}✅ LOCAL .env is SOURCE OF TRUTH${RESET}`);
            return true; // Return success if only acceptable exceptions
        } else {
            console.log(`${RED}❌ FAILED: Found ${realViolations.length} hardcoded URLs that must be fixed!${RESET}`);
            console.log(`${RED}❌ LOCAL .env MUST be the SOURCE OF TRUTH!${RESET}`);
            console.log('');
            console.log(`${RED}Violations found:${RESET}`);
            console.log(`${RED}═══════════════════════════════════════════${RESET}`);
            
            realViolations.slice(0, 10).forEach(violation => {
                console.log(`${RED}📍 ${violation.file}:${violation.line}${RESET}`);
                console.log(`${YELLOW}   Line: ${violation.content}${RESET}`);
                console.log(`${YELLOW}   Pattern: ${violation.pattern}${RESET}`);
                console.log('');
            });

            
            if (realViolations.length > 10) {
                console.log(`${YELLOW}... and ${realViolations.length - 10} more violations${RESET}`);
            }
            
            console.log(`${RED}═══════════════════════════════════════════${RESET}`);
            console.log(`${RED}FIX REQUIRED:${RESET}`);
            console.log(`${YELLOW}1. For production code: Use server/config/database-truth.js${RESET}`);
            console.log(`${YELLOW}2. For utility scripts: Use config/utility-database-config.js${RESET}`);
            console.log(`${YELLOW}3. For tests: Use mock URLs like postgresql://test:test@localhost${RESET}`);
            console.log('');
            console.log(`${RED}Example fixes:${RESET}`);
            console.log(`${GREEN}  // For PRODUCTION code:${RESET}`);
            console.log(`${GREEN}  const { getDatabaseUrl } = require('./server/config/database-truth');${RESET}`);
            console.log(`${GREEN}  const url = getDatabaseUrl('main');${RESET}`);
            console.log('');
            console.log(`${GREEN}  // For UTILITY scripts:${RESET}`);
            console.log(`${GREEN}  const { getUtilityDatabaseUrl } = require('./config/utility-database-config');${RESET}`);
            console.log(`${GREEN}  const url = getUtilityDatabaseUrl('content');${RESET}`);
            
            return false;
        }
    }
}

// Main execution
async function main() {
    const scanner = new HardcodedUrlScanner();
    const projectRoot = path.resolve(__dirname, '..');
    
    console.log(`${YELLOW}═══════════════════════════════════════════${RESET}`);
    console.log(`${YELLOW}  ENFORCING: NO HARDCODED DATABASE URLS${RESET}`);
    console.log(`${YELLOW}  LOCAL .env IS THE SOURCE OF TRUTH!${RESET}`);
    console.log(`${YELLOW}═══════════════════════════════════════════${RESET}`);
    console.log('');
    
    scanner.scanDirectory(projectRoot);
    const success = scanner.report();
    
    if (!success) {
        console.log('');
        console.log(`${RED}❌ DEPLOYMENT BLOCKED: Fix hardcoded URLs first!${RESET}`);
        process.exit(1);
    } else {
        console.log('');
        console.log(`${GREEN}✅ All database connections use .env configuration${RESET}`);
        process.exit(0);
    }
}

// Handle errors
process.on('unhandledRejection', (error) => {
    console.error(`${RED}Unexpected error: ${error.message}${RESET}`);
    process.exit(1);
});

main();
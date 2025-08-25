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

        if (this.violations.length === 0) {
            console.log(`${GREEN}✅ SUCCESS: No hardcoded database URLs found!${RESET}`);
            console.log(`${GREEN}✅ LOCAL .env is properly used as SOURCE OF TRUTH${RESET}`);
            return true;
        } else {
            console.log(`${RED}❌ FAILED: Found ${this.violations.length} hardcoded database URLs!${RESET}`);
            console.log(`${RED}❌ LOCAL .env MUST be the SOURCE OF TRUTH!${RESET}`);
            console.log('');
            console.log(`${RED}Violations found:${RESET}`);
            console.log(`${RED}═══════════════════════════════════════════${RESET}`);
            
            this.violations.forEach(violation => {
                console.log(`${RED}📍 ${violation.file}:${violation.line}${RESET}`);
                console.log(`${YELLOW}   Line: ${violation.content}${RESET}`);
                console.log(`${YELLOW}   Pattern: ${violation.pattern}${RESET}`);
                console.log('');
            });

            console.log(`${RED}═══════════════════════════════════════════${RESET}`);
            console.log(`${RED}FIX REQUIRED:${RESET}`);
            console.log(`${YELLOW}1. Remove all hardcoded URLs${RESET}`);
            console.log(`${YELLOW}2. Use process.env.DATABASE_URL from .env${RESET}`);
            console.log(`${YELLOW}3. Import from server/config/database-truth.js${RESET}`);
            console.log('');
            console.log(`${RED}Example fix:${RESET}`);
            console.log(`${GREEN}  // WRONG - Hardcoded URL${RESET}`);
            console.log(`${RED}  const url = 'postgresql://user:pass@host/db' || process.env.DATABASE_URL${RESET}`);
            console.log('');
            console.log(`${GREEN}  // RIGHT - Use .env as source of truth${RESET}`);
            console.log(`${GREEN}  const { getDatabaseUrl } = require('./config/database-truth');${RESET}`);
            console.log(`${GREEN}  const url = getDatabaseUrl('main');${RESET}`);
            
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
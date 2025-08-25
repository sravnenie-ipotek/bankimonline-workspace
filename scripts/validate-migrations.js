#!/usr/bin/env node

/**
 * Migration Validation Script
 * 
 * This script ensures that all database migrations have been applied
 * before allowing deployment. It's a HARD GATE that prevents code-database drift.
 * 
 * USES LOCAL .env AS SOURCE OF TRUTH - NO HARDCODED URLS!
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { getDatabaseUrl, validateAllDatabaseConfigs } = require('../server/config/database-truth');

const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const RESET = '\x1b[0m';

class MigrationValidator {
    constructor() {
        this.errors = [];
        this.warnings = [];
        this.client = null;
        this.requiredMigrations = [];
    }

    async connect() {
        // ENFORCE: Use ONLY .env configuration - NO FALLBACKS!
        console.log(`${YELLOW}🔍 Using database configuration from LOCAL .env (SOURCE OF TRUTH)${RESET}`);
        validateAllDatabaseConfigs();
        
        const connectionString = getDatabaseUrl('main');
        
        this.client = new Client({
            connectionString
        });

        try {
            await this.client.connect();
            console.log(`${GREEN}✅ Connected to database${RESET}`);
            return true;
        } catch (error) {
            console.error(`${RED}❌ Failed to connect to database: ${error.message}${RESET}`);
            return false;
        }
    }

    async ensureMigrationsTable() {
        // Create migrations tracking table if it doesn't exist
        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS schema_migrations (
                id SERIAL PRIMARY KEY,
                filename VARCHAR(255) UNIQUE NOT NULL,
                checksum VARCHAR(64) NOT NULL,
                applied_at TIMESTAMP DEFAULT NOW(),
                success BOOLEAN DEFAULT true,
                error_message TEXT
            )
        `;

        try {
            await this.client.query(createTableQuery);
            console.log(`${GREEN}✅ Migrations table ready${RESET}`);
        } catch (error) {
            this.errors.push(`Failed to create migrations table: ${error.message}`);
        }
    }

    calculateChecksum(content) {
        return crypto.createHash('sha256').update(content).digest('hex');
    }

    async getMigrationFiles() {
        const migrationDirs = [
            path.join(__dirname, '../server/migrations'),
            path.join(__dirname, '../server/migrationDB'),
            path.join(__dirname, '../migrations')
        ];

        const allMigrations = [];

        for (const dir of migrationDirs) {
            if (fs.existsSync(dir)) {
                const files = fs.readdirSync(dir)
                    .filter(f => f.endsWith('.sql'))
                    .map(f => ({
                        filename: f,
                        filepath: path.join(dir, f),
                        content: fs.readFileSync(path.join(dir, f), 'utf8')
                    }));

                allMigrations.push(...files);
            }
        }

        // Sort by filename (assuming they're numbered or dated)
        allMigrations.sort((a, b) => a.filename.localeCompare(b.filename));

        return allMigrations;
    }

    async getAppliedMigrations() {
        try {
            const result = await this.client.query(
                'SELECT filename, checksum FROM schema_migrations WHERE success = true'
            );
            return new Map(result.rows.map(row => [row.filename, row.checksum]));
        } catch (error) {
            // Table might not exist yet
            return new Map();
        }
    }

    async validateMigrations() {
        console.log('\n🔍 Validating Database Migrations');
        console.log('==================================');

        await this.ensureMigrationsTable();

        const migrationFiles = await this.getMigrationFiles();
        const appliedMigrations = await this.getAppliedMigrations();

        console.log(`\nFound ${migrationFiles.length} migration files`);
        console.log(`Applied ${appliedMigrations.size} migrations\n`);

        let unappliedCount = 0;
        let modifiedCount = 0;

        for (const migration of migrationFiles) {
            const checksum = this.calculateChecksum(migration.content);
            const applied = appliedMigrations.get(migration.filename);

            if (!applied) {
                unappliedCount++;
                this.errors.push(`Migration not applied: ${migration.filename}`);
                console.log(`${RED}❌ NOT APPLIED: ${migration.filename}${RESET}`);
                
                // Check if this migration is critical
                if (migration.content.includes('CRITICAL:') || 
                    migration.filename.includes('auth') ||
                    migration.filename.includes('fix')) {
                    console.log(`${RED}   ⚠️  This is a CRITICAL migration!${RESET}`);
                }
            } else if (applied !== checksum) {
                modifiedCount++;
                this.errors.push(`Migration modified after application: ${migration.filename}`);
                console.log(`${RED}❌ MODIFIED: ${migration.filename}${RESET}`);
                console.log(`${RED}   Original checksum: ${applied}${RESET}`);
                console.log(`${RED}   Current checksum:  ${checksum}${RESET}`);
            } else {
                console.log(`${GREEN}✅ APPLIED: ${migration.filename}${RESET}`);
            }
        }

        // Check for critical columns that MUST exist
        await this.validateCriticalSchema();

        return unappliedCount === 0 && modifiedCount === 0;
    }

    async validateCriticalSchema() {
        console.log('\n🔍 Validating Critical Schema Requirements');
        console.log('==========================================');

        const criticalChecks = [
            {
                name: 'clients.role column',
                query: `SELECT column_name FROM information_schema.columns 
                        WHERE table_name = 'clients' AND column_name = 'role'`,
                errorMsg: 'Missing role column in clients table - SMS auth will fail!'
            },
            {
                name: 'banking_standards.value_type column',
                query: `SELECT column_name FROM information_schema.columns 
                        WHERE table_name = 'banking_standards' AND column_name = 'value_type'`,
                errorMsg: 'Missing value_type column in banking_standards - API will fail!'
            },
            {
                name: 'banking_standards.standard_category column',
                query: `SELECT column_name FROM information_schema.columns 
                        WHERE table_name = 'banking_standards' AND column_name = 'standard_category'`,
                errorMsg: 'Missing standard_category column - calculation APIs will fail!'
            }
        ];

        for (const check of criticalChecks) {
            try {
                const result = await this.client.query(check.query);
                if (result.rows.length === 0) {
                    this.errors.push(check.errorMsg);
                    console.log(`${RED}❌ FAILED: ${check.name}${RESET}`);
                    console.log(`${RED}   ${check.errorMsg}${RESET}`);
                } else {
                    console.log(`${GREEN}✅ PASSED: ${check.name}${RESET}`);
                }
            } catch (error) {
                this.errors.push(`${check.name}: ${error.message}`);
                console.log(`${RED}❌ ERROR: ${check.name}: ${error.message}${RESET}`);
            }
        }
    }

    async runAllChecks() {
        if (!await this.connect()) {
            return false;
        }

        try {
            const migrationsValid = await this.validateMigrations();

            // Report results
            console.log('\n========================================');
            console.log('MIGRATION VALIDATION RESULTS:');
            
            if (this.errors.length === 0) {
                console.log(`${GREEN}✅ All migrations applied and schema valid!${RESET}`);
                console.log(`${GREEN}✅ Safe to deploy.${RESET}`);
                return true;
            } else {
                console.log(`${RED}❌ Found ${this.errors.length} critical issues:${RESET}`);
                this.errors.forEach(error => {
                    console.log(`${RED}   - ${error}${RESET}`);
                });
                
                console.log(`\n${RED}⛔ DEPLOYMENT BLOCKED!${RESET}`);
                console.log(`${RED}Fix these issues before deployment:${RESET}`);
                console.log(`1. Apply missing migrations to the database`);
                console.log(`2. Run: npm run test:pre-deploy`);
                console.log(`3. Run: npm test auth-integration.test.js`);
                
                return false;
            }

        } finally {
            await this.client.end();
        }
    }
}

// Run the validator
async function main() {
    const validator = new MigrationValidator();
    const success = await validator.runAllChecks();
    
    if (!success) {
        console.log(`\n${RED}❌ MIGRATION VALIDATION FAILED${RESET}`);
        console.log(`${RED}Deployment cannot proceed until all migrations are applied${RESET}`);
        process.exit(1);
    } else {
        console.log(`\n${GREEN}✅ MIGRATION VALIDATION PASSED${RESET}`);
        process.exit(0);
    }
}

// Handle errors
process.on('unhandledRejection', (error) => {
    console.error(`${RED}Unexpected error: ${error.message}${RESET}`);
    process.exit(1);
});

main();
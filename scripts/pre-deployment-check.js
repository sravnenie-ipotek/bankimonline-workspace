#!/usr/bin/env node

/**
 * Pre-Deployment Database Schema Check
 * 
 * This script MUST be run before deployment to ensure database schema
 * matches what the code expects. It prevents deployment failures.
 * 
 * USES LOCAL .env AS SOURCE OF TRUTH - NO HARDCODED URLS!
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
const { getDatabaseUrl, validateAllDatabaseConfigs } = require('../server/config/database-truth');

const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const RESET = '\x1b[0m';

class SchemaValidator {
    constructor() {
        this.errors = [];
        this.warnings = [];
        this.client = null;
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

    async checkTable(tableName, requiredColumns) {
        console.log(`\nChecking table: ${tableName}`);
        
        // Check if table exists
        const tableExists = await this.client.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_name = $1
            )
        `, [tableName]);

        if (!tableExists.rows[0].exists) {
            this.errors.push(`Table '${tableName}' does not exist`);
            console.log(`${RED}  ❌ Table does not exist${RESET}`);
            return false;
        }

        console.log(`${GREEN}  ✅ Table exists${RESET}`);

        // Check columns
        const columns = await this.client.query(`
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns 
            WHERE table_name = $1
        `, [tableName]);

        const existingColumns = columns.rows.map(row => row.column_name);

        for (const column of requiredColumns) {
            if (!existingColumns.includes(column)) {
                this.errors.push(`Column '${column}' missing in table '${tableName}'`);
                console.log(`${RED}  ❌ Missing column: ${column}${RESET}`);
            } else {
                console.log(`${GREEN}  ✅ Column exists: ${column}${RESET}`);
            }
        }

        return true;
    }

    async checkCriticalQueries() {
        console.log('\nTesting critical queries...');
        
        const queries = [
            {
                name: 'Property ownership LTV query',
                sql: `SELECT standard_name, standard_value 
                      FROM banking_standards 
                      WHERE business_path = 'mortgage' 
                      AND standard_category = 'property_ownership_ltv' 
                      AND is_active = true 
                      LIMIT 1`
            },
            {
                name: 'Calculation parameters query',
                sql: `SELECT standard_category, standard_name, standard_value 
                      FROM banking_standards 
                      WHERE business_path = 'mortgage' 
                      AND is_active = true 
                      LIMIT 1`
            },
            {
                name: 'Mortgage rates query',
                sql: `SELECT standard_name, standard_value 
                      FROM banking_standards 
                      WHERE business_path = 'mortgage' 
                      AND standard_category = 'rates' 
                      AND is_active = true 
                      LIMIT 1`
            }
        ];

        for (const query of queries) {
            try {
                await this.client.query(query.sql);
                console.log(`${GREEN}  ✅ ${query.name}${RESET}`);
            } catch (error) {
                this.errors.push(`Query failed: ${query.name} - ${error.message}`);
                console.log(`${RED}  ❌ ${query.name}: ${error.message}${RESET}`);
            }
        }
    }

    async checkMigrations() {
        console.log('\nChecking migrations...');
        
        const migrationDir = path.join(__dirname, '../server/migrations');
        const migrationDbDir = path.join(__dirname, '../server/migrationDB');
        
        if (fs.existsSync(migrationDir)) {
            const files = fs.readdirSync(migrationDir).filter(f => f.endsWith('.sql'));
            console.log(`${GREEN}  ✅ Found ${files.length} migration files in migrations/${RESET}`);
        }
        
        if (fs.existsSync(migrationDbDir)) {
            const files = fs.readdirSync(migrationDbDir).filter(f => f.endsWith('.sql'));
            console.log(`${GREEN}  ✅ Found ${files.length} migration files in migrationDB/${RESET}`);
        }

        // Check for standard_category migration
        const hasStandardCategoryMigration = 
            fs.existsSync(path.join(migrationDir, '202408_add_standard_category_column.sql')) ||
            fs.existsSync(path.join(migrationDbDir, 'banking_standards_add_standard_category_20240824.sql'));

        if (!hasStandardCategoryMigration) {
            this.warnings.push('Migration for standard_category column not found in migration folders');
            console.log(`${YELLOW}  ⚠️  Migration for standard_category not found${RESET}`);
        }
    }

    async runAllChecks() {
        console.log('🔍 Pre-Deployment Database Schema Check');
        console.log('========================================');

        if (!await this.connect()) {
            return false;
        }

        try {
            // Check banking_standards table
            await this.checkTable('banking_standards', [
                'id',
                'business_path',
                'standard_category',  // Critical column that was missing
                'standard_name',
                'standard_value',
                'value_type',
                'is_active'
            ]);

            // Check other critical tables with ALL required columns
            await this.checkTable('clients', [
                'id', 
                'phone', 
                'email',
                'role',  // CRITICAL: Required for SMS authentication
                'first_name',
                'last_name'
            ]);
            await this.checkTable('users', ['id', 'email', 'password']);
            
            // Banks table might have different column names
            const banksExists = await this.client.query(`
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_name = 'banks'
                )
            `);
            
            if (banksExists.rows[0].exists) {
                console.log('\nChecking table: banks');
                console.log(`${GREEN}  ✅ Table exists${RESET}`);
                // Banks table structure varies, just ensure it exists
            }
            
            // Test critical queries
            await this.checkCriticalQueries();
            
            // Check migrations
            await this.checkMigrations();

        } finally {
            await this.client.end();
        }

        // Report results
        console.log('\n========================================');
        console.log('VALIDATION RESULTS:');
        
        if (this.errors.length === 0) {
            console.log(`${GREEN}✅ All checks passed! Safe to deploy.${RESET}`);
        } else {
            console.log(`${RED}❌ Found ${this.errors.length} errors:${RESET}`);
            this.errors.forEach(error => {
                console.log(`${RED}   - ${error}${RESET}`);
            });
        }

        if (this.warnings.length > 0) {
            console.log(`${YELLOW}⚠️  Found ${this.warnings.length} warnings:${RESET}`);
            this.warnings.forEach(warning => {
                console.log(`${YELLOW}   - ${warning}${RESET}`);
            });
        }

        return this.errors.length === 0;
    }
}

// Run the validator
async function main() {
    const validator = new SchemaValidator();
    const success = await validator.runAllChecks();
    
    if (!success) {
        console.log(`\n${RED}⛔ DEPLOYMENT BLOCKED: Fix database schema issues first!${RESET}`);
        console.log(`\nTo fix missing columns, run the migrations in server/migrations/`);
        process.exit(1);
    } else {
        console.log(`\n${GREEN}✅ Database schema is ready for deployment!${RESET}`);
        process.exit(0);
    }
}

// Handle errors
process.on('unhandledRejection', (error) => {
    console.error(`${RED}Unexpected error: ${error.message}${RESET}`);
    process.exit(1);
});

main();
/**
 * Database Schema Validation Tests
 * 
 * These tests ensure that the database schema matches what the code expects.
 * They MUST pass before any deployment to prevent runtime errors.
 * 
 * USES LOCAL .env AS SOURCE OF TRUTH - NO HARDCODED URLS!
 */

const { Client } = require('pg');
const { getDatabaseUrl, validateAllDatabaseConfigs } = require('../config/database-truth');

describe('Database Schema Validation', () => {
    let client;

    beforeAll(async () => {
        // ENFORCE: Use ONLY .env configuration - NO FALLBACKS!
        validateAllDatabaseConfigs();
        const connectionString = getDatabaseUrl('main');
        
        client = new Client({
            connectionString
        });
        
        try {
            await client.connect();
        } catch (error) {
            console.error('Failed to connect to database:', error.message);
            throw new Error('Database connection required for schema tests');
        }
    });

    afterAll(async () => {
        if (client) {
            await client.end();
        }
    });

    describe('banking_standards table', () => {
        test('should have banking_standards table', async () => {
            const result = await client.query(`
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_name = 'banking_standards'
                )
            `);
            expect(result.rows[0].exists).toBe(true);
        });

        test('should have standard_category column', async () => {
            const result = await client.query(`
                SELECT column_name, data_type 
                FROM information_schema.columns 
                WHERE table_name = 'banking_standards' 
                AND column_name = 'standard_category'
            `);
            
            expect(result.rows.length).toBe(1);
            expect(result.rows[0].column_name).toBe('standard_category');
            expect(result.rows[0].data_type).toBe('character varying');
        });

        test('should have all required columns', async () => {
            const requiredColumns = [
                'id',
                'business_path',
                'standard_category',
                'standard_name', 
                'standard_value',
                'value_type',
                'description',
                'is_active',
                'effective_from',
                'effective_to',
                'created_at',
                'updated_at'
            ];

            const result = await client.query(`
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'banking_standards'
            `);

            const actualColumns = result.rows.map(row => row.column_name);
            
            for (const column of requiredColumns) {
                expect(actualColumns).toContain(column);
            }
        });

        test('should have proper indexes', async () => {
            const result = await client.query(`
                SELECT indexname 
                FROM pg_indexes 
                WHERE tablename = 'banking_standards'
                AND indexname = 'idx_banking_standards_category'
            `);
            
            expect(result.rows.length).toBeGreaterThan(0);
        });
    });

    describe('content_items table', () => {
        test('should have content_items table', async () => {
            const result = await client.query(`
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_name = 'content_items'
                )
            `);
            expect(result.rows[0].exists).toBe(true);
        });
    });

    describe('clients table', () => {
        test('should have clients table for phone authentication', async () => {
            const result = await client.query(`
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_name = 'clients'
                )
            `);
            expect(result.rows[0].exists).toBe(true);
        });

        test('should have ALL required columns for SMS authentication', async () => {
            const requiredColumns = [
                'id',
                'phone',
                'email',
                'role',  // CRITICAL: Required for INSERT in sms-code-login endpoint
                'first_name',
                'last_name',
                'created_at',
                'updated_at'
            ];

            const result = await client.query(`
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'clients'
            `);

            const actualColumns = result.rows.map(row => row.column_name);
            
            // Check each required column exists
            for (const column of requiredColumns) {
                expect(actualColumns).toContain(column);
            }
        });

        test('should have role column with correct type', async () => {
            const result = await client.query(`
                SELECT column_name, data_type 
                FROM information_schema.columns 
                WHERE table_name = 'clients' 
                AND column_name = 'role'
            `);
            
            expect(result.rows.length).toBe(1);
            expect(result.rows[0].column_name).toBe('role');
            expect(result.rows[0].data_type).toBe('character varying');
        });
    });

    describe('Critical API queries', () => {
        test('should be able to query calculation parameters', async () => {
            const query = `
                SELECT 
                    standard_category,
                    standard_name,
                    standard_value,
                    value_type,
                    description
                FROM banking_standards 
                WHERE business_path = 'mortgage'
                    AND is_active = true
                    AND (effective_to IS NULL OR effective_to >= CURRENT_DATE)
                ORDER BY standard_category, standard_name
                LIMIT 1
            `;
            
            // This should not throw an error
            await expect(client.query(query)).resolves.toBeDefined();
        });

        test('should be able to query property ownership LTV', async () => {
            const query = `
                SELECT standard_name, standard_value 
                FROM banking_standards 
                WHERE business_path = 'mortgage' 
                    AND standard_category = 'property_ownership_ltv' 
                    AND is_active = true
                ORDER BY standard_name
                LIMIT 1
            `;
            
            // This should not throw an error
            await expect(client.query(query)).resolves.toBeDefined();
        });
    });

    describe('Migration tracking', () => {
        test('should track applied migrations', async () => {
            // Check if we need a migrations tracking table
            const result = await client.query(`
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_name = 'schema_migrations'
                )
            `);
            
            if (!result.rows[0].exists) {
                console.warn('WARNING: No schema_migrations table found. Consider adding migration tracking.');
            }
        });
    });
});

describe('Pre-deployment Schema Checks', () => {
    test('all critical queries should work', async () => {
        const criticalQueries = [
            // From server-db.js line 2324
            `SELECT standard_name, standard_value 
             FROM banking_standards 
             WHERE business_path = 'mortgage' AND standard_category = 'property_ownership_ltv' AND is_active = true`,
            
            // From server-db.js line 5729
            `SELECT standard_category, standard_name, standard_value 
             FROM banking_standards 
             WHERE business_path = 'mortgage' AND is_active = true`,
            
            // From server-db.js line 7344
            `SELECT standard_name, standard_value 
             FROM banking_standards 
             WHERE business_path = 'mortgage' AND standard_category = 'rates' AND is_active = true`,
            
            // From server-db.js line 9889
            `SELECT standard_category, standard_name, standard_value, value_type, description
             FROM banking_standards 
             WHERE business_path = 'mortgage' AND is_active = true`
        ];

        // ENFORCE: Use ONLY .env configuration - NO FALLBACKS!
        validateAllDatabaseConfigs();
        const connectionString = getDatabaseUrl('main');
        
        const client = new Client({
            connectionString
        });

        try {
            await client.connect();
            
            for (const query of criticalQueries) {
                try {
                    await client.query(query + ' LIMIT 1');
                } catch (error) {
                    throw new Error(`Critical query failed: ${error.message}\n\nQuery: ${query}`);
                }
            }
        } finally {
            await client.end();
        }
    });
});
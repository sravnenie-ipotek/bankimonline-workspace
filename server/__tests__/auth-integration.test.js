/**
 * Authentication Integration Tests
 * 
 * These tests ensure that authentication endpoints work correctly
 * with the actual database schema. These are CRITICAL tests that
 * MUST pass before any deployment.
 * 
 * USES LOCAL .env AS SOURCE OF TRUTH - NO HARDCODED URLS!
 */

const { Client } = require('pg');
const { getDatabaseUrl, validateAllDatabaseConfigs } = require('../config/database-truth');

describe('Authentication Integration Tests', () => {
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
            throw new Error('Database connection required for authentication tests');
        }
    });

    afterAll(async () => {
        if (client) {
            await client.end();
        }
    });

    describe('SMS Authentication Flow', () => {
        test('should be able to INSERT new client with all required fields', async () => {
            // This is the exact query used in server-db.js line 4167
            const insertQuery = `
                INSERT INTO clients (first_name, last_name, phone, email, role, created_at, updated_at) 
                VALUES ($1, $2, $3, $4, $5, NOW(), NOW()) 
                RETURNING *
            `;
            
            // Test with mock data
            const testPhone = '972544999999';
            const testEmail = `test_${Date.now()}@bankim.com`;
            
            try {
                const result = await client.query(insertQuery, [
                    'Test',
                    'Client',
                    testPhone,
                    testEmail,
                    'customer'
                ]);
                
                expect(result.rows).toHaveLength(1);
                expect(result.rows[0].role).toBe('customer');
                expect(result.rows[0].phone).toBe(testPhone);
                
                // Clean up test data
                await client.query('DELETE FROM clients WHERE phone = $1', [testPhone]);
            } catch (error) {
                // If this fails, it means the database schema doesn't match the code
                throw new Error(`SMS authentication will fail: ${error.message}`);
            }
        });

        test('should be able to SELECT client by phone number', async () => {
            // This is the query used in server-db.js line 4158
            const selectQuery = 'SELECT * FROM clients WHERE phone = $1';
            
            // First insert a test client
            const testPhone = '972544888888';
            const testEmail = `test_${Date.now()}@bankim.com`;
            
            await client.query(
                'INSERT INTO clients (first_name, last_name, phone, email, role, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, NOW(), NOW())',
                ['Test', 'Client', testPhone, testEmail, 'customer']
            );
            
            // Now test the SELECT query
            const result = await client.query(selectQuery, [testPhone]);
            
            expect(result.rows).toHaveLength(1);
            expect(result.rows[0].phone).toBe(testPhone);
            expect(result.rows[0].role).toBe('customer');
            
            // Clean up
            await client.query('DELETE FROM clients WHERE phone = $1', [testPhone]);
        });

        test('clients table should have all columns used by auth-verify endpoint', async () => {
            // These are ALL the fields accessed in the auth-verify endpoint
            const requiredFields = [
                'id',           // Used in JWT token
                'phone',        // Used in JWT token and WHERE clause
                'first_name',   // Used in response
                'last_name',    // Used in response
                'email',        // Used in response
                'role'          // Used in INSERT statement
            ];
            
            const result = await client.query(`
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'clients'
            `);
            
            const actualColumns = result.rows.map(row => row.column_name);
            
            for (const field of requiredFields) {
                if (!actualColumns.includes(field)) {
                    throw new Error(
                        `CRITICAL: Column '${field}' missing in clients table. ` +
                        `Auth-verify endpoint will fail with 500 error!`
                    );
                }
            }
        });
    });

    describe('Banking Standards API Queries', () => {
        test('should be able to query calculation parameters with value_type', async () => {
            // This is the exact query from server-db.js line 9888
            const parametersQuery = `
                SELECT 
                    standard_category,
                    standard_name,
                    standard_value,
                    value_type,
                    description
                FROM banking_standards 
                WHERE business_path = $1 
                    AND is_active = true
                    AND (effective_to IS NULL OR effective_to >= CURRENT_DATE)
                ORDER BY standard_category, standard_name
                LIMIT 1
            `;
            
            try {
                const result = await client.query(parametersQuery, ['mortgage']);
                // Query should execute without error
                // If value_type column doesn't exist, this will throw
            } catch (error) {
                throw new Error(
                    `CRITICAL: Calculation parameters API will fail: ${error.message}`
                );
            }
        });

        test('banking_standards table should have value_type column', async () => {
            const result = await client.query(`
                SELECT column_name, data_type 
                FROM information_schema.columns 
                WHERE table_name = 'banking_standards' 
                AND column_name = 'value_type'
            `);
            
            if (result.rows.length === 0) {
                throw new Error(
                    'CRITICAL: value_type column missing in banking_standards table. ' +
                    'Calculation parameters API will fail!'
                );
            }
            
            expect(result.rows[0].column_name).toBe('value_type');
        });
    });

    describe('Pre-deployment Gate Validation', () => {
        test('ALL critical queries must work before deployment', async () => {
            const criticalQueries = [
                {
                    name: 'SMS Authentication INSERT',
                    query: `INSERT INTO clients (first_name, last_name, phone, email, role, created_at, updated_at) 
                            VALUES ('Test', 'User', '972544777777', 'test@test.com', 'customer', NOW(), NOW()) 
                            RETURNING *`,
                    cleanup: `DELETE FROM clients WHERE phone = '972544777777'`
                },
                {
                    name: 'Calculation Parameters SELECT',
                    query: `SELECT standard_category, standard_name, standard_value, value_type, description
                            FROM banking_standards 
                            WHERE business_path = 'mortgage' AND is_active = true LIMIT 1`
                }
            ];

            for (const testQuery of criticalQueries) {
                try {
                    await client.query(testQuery.query);
                    
                    // Clean up if needed
                    if (testQuery.cleanup) {
                        await client.query(testQuery.cleanup);
                    }
                } catch (error) {
                    throw new Error(
                        `❌ DEPLOYMENT MUST BE BLOCKED!\n` +
                        `Critical query failed: ${testQuery.name}\n` +
                        `Error: ${error.message}\n` +
                        `This WILL cause production failures!`
                    );
                }
            }
        });
    });
});
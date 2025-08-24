const { Client } = require('pg');
const fs = require('fs');

const client = new Client({
    connectionString: 'postgresql://postgres:TkHvG72GFaHnOjF3bELDWnKOlGzXBnRs@autorack.proxy.rlwy.net:31169/railway'
});

async function runMigration() {
    try {
        await client.connect();
        console.log('Connected to Railway PostgreSQL');
        
        // Check if column exists
        const checkResult = await client.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'banking_standards' 
            AND column_name = 'standard_category'
        `);
        
        if (checkResult.rows.length > 0) {
            console.log('✅ Column standard_category already exists');
            return;
        }
        
        // Add the column
        console.log('Adding standard_category column...');
        await client.query(`
            ALTER TABLE banking_standards 
            ADD COLUMN standard_category VARCHAR(100)
        `);
        
        // Set default values
        console.log('Setting default values...');
        await client.query(`
            UPDATE banking_standards 
            SET standard_category = 
                CASE 
                    WHEN standard_name LIKE '%ltv%' THEN 'ltv'
                    WHEN standard_name LIKE '%property_ownership%' THEN 'property_ownership_ltv'
                    WHEN standard_name LIKE '%rate%' OR standard_name LIKE '%interest%' THEN 'rates'
                    WHEN standard_name LIKE '%dti%' THEN 'dti'
                    WHEN standard_name LIKE '%credit_score%' OR standard_name LIKE '%minimum_credit%' THEN 'credit_score'
                    WHEN standard_name LIKE '%amount%' OR standard_name LIKE '%loan%' THEN 'amount'
                    WHEN standard_name LIKE '%refinance%' THEN 'refinance'
                    ELSE 'general'
                END
            WHERE standard_category IS NULL
        `);
        
        console.log('✅ Migration completed successfully');
        
    } catch (err) {
        console.error('Migration error:', err.message);
        process.exit(1);
    } finally {
        await client.end();
    }
}

runMigration();

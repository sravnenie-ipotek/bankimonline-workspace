#!/usr/bin/env node

const { Pool } = require('pg');

// Railway connection
const pool = new Pool({
    connectionString: 'postgresql://postgres:lgqPEzvVbSCviTybKqMbzJkYvOUetJjt@maglev.proxy.rlwy.net:43809/railway'
});

async function checkDatabaseStructure() {
    console.log('🔍 Checking Database Structure...\n');
    
    try {
        // Get all table columns
        const tables = ['users', 'banks', 'clients', 'locales', 'params'];
        
        for (const tableName of tables) {
            console.log(`📋 Table: ${tableName}`);
            try {
                const columns = await pool.query(`
                    SELECT column_name, data_type, is_nullable, column_default
                    FROM information_schema.columns 
                    WHERE table_name = $1 
                    ORDER BY ordinal_position
                `, [tableName]);
                
                if (columns.rows.length > 0) {
                    console.log('   Columns:');
                    columns.rows.forEach(col => {
                        console.log(`     ${col.column_name} (${col.data_type}${col.is_nullable === 'NO' ? ', NOT NULL' : ''})`);
                    });
                    
                    // Get sample data
                    const sample = await pool.query(`SELECT * FROM ${tableName} LIMIT 3`);
                    if (sample.rows.length > 0) {
                        console.log('   Sample data:');
                        sample.rows.forEach((row, index) => {
                            console.log(`     Row ${index + 1}:`, JSON.stringify(row));
                        });
                    } else {
                        console.log('   No data found');
                    }
                } else {
                    console.log('   ❌ Table not found or no columns');
                }
            } catch (err) {
                console.log(`   ❌ Error accessing table: ${err.message}`);
            }
            console.log('');
        }

    } catch (err) {
        console.error('❌ Error:', err.message);
    } finally {
        await pool.end();
        console.log('🔌 Database connection closed.');
    }
}

checkDatabaseStructure(); 
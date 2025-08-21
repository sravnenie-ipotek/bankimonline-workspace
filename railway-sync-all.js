const { Client } = require('pg');
const fs = require('fs');
require('dotenv').config();

// Railway configuration
const RAILWAY_MAIN = 'postgresql://postgres:lgqPEzvVbSCviTybKqMbzJkYvOUetJjt@maglev.proxy.rlwy.net:43809/railway';
const RAILWAY_CONTENT = 'postgresql://postgres:SuFkUevgonaZFXJiJeczFiXYTlICHVJL@shortline.proxy.rlwy.net:33452/railway';

// Local configuration
const LOCAL_MAIN = {
    host: 'localhost',
    port: 5432,
    database: 'bankim_core',
    user: 'michaelmishayev'
};

const LOCAL_CONTENT = {
    host: 'localhost',
    port: 5432,
    database: 'bankim_content',
    user: 'michaelmishayev'
};

// Tables to exclude from sync (system tables)
const EXCLUDE_TABLES = [
    'spatial_ref_sys',
    'geography_columns',
    'geometry_columns',
    'raster_columns',
    'raster_overviews'
];

async function getTables(client) {
    const result = await client.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
        AND table_name NOT IN (${EXCLUDE_TABLES.map(t => `'${t}'`).join(',')})
        ORDER BY table_name
    `);
    return result.rows.map(r => r.table_name);
}

async function getTableStructure(client, tableName) {
    const result = await client.query(`
        SELECT 
            column_name,
            data_type,
            is_nullable,
            column_default
        FROM information_schema.columns
        WHERE table_schema = 'public' 
        AND table_name = $1
        ORDER BY ordinal_position
    `, [tableName]);
    return result.rows;
}

async function getRowCount(client, tableName) {
    try {
        const result = await client.query(`SELECT COUNT(*) as count FROM ${tableName}`);
        return parseInt(result.rows[0].count);
    } catch (error) {
        console.error(`  ⚠️ Could not count rows in ${tableName}: ${error.message}`);
        return 0;
    }
}

async function syncTable(sourceClient, targetClient, tableName, report) {
    try {
        console.log(`  📋 Syncing table: ${tableName}`);
        
        // Get row count from source
        const sourceCount = await getRowCount(sourceClient, tableName);
        console.log(`     Source rows: ${sourceCount}`);
        
        if (sourceCount === 0) {
            console.log(`     ⏭️ Skipping empty table`);
            report.skipped.push({ table: tableName, reason: 'empty' });
            return;
        }
        
        // Check if table exists in target
        const tableExists = await targetClient.query(`
            SELECT EXISTS (
                SELECT 1 FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = $1
            )
        `, [tableName]);
        
        if (!tableExists.rows[0].exists) {
            console.log(`     ⚠️ Table doesn't exist in target, creating...`);
            
            // Get table structure from source
            const createTableQuery = await sourceClient.query(`
                SELECT 'CREATE TABLE ' || table_name || ' (' ||
                    string_agg(
                        column_name || ' ' || 
                        data_type || 
                        CASE WHEN is_nullable = 'NO' THEN ' NOT NULL' ELSE '' END ||
                        CASE WHEN column_default IS NOT NULL THEN ' DEFAULT ' || column_default ELSE '' END,
                        ', '
                    ) || ');' as ddl
                FROM information_schema.columns
                WHERE table_schema = 'public' AND table_name = $1
                GROUP BY table_name
            `, [tableName]);
            
            if (createTableQuery.rows.length > 0) {
                await targetClient.query(createTableQuery.rows[0].ddl);
                console.log(`     ✅ Table created`);
            }
        }
        
        // Get data from source
        const sourceData = await sourceClient.query(`SELECT * FROM ${tableName}`);
        
        if (sourceData.rows.length === 0) {
            console.log(`     ⏭️ No data to sync`);
            report.skipped.push({ table: tableName, reason: 'no data' });
            return;
        }
        
        // Clear target table
        await targetClient.query(`TRUNCATE TABLE ${tableName} CASCADE`);
        
        // Get column names
        const columns = Object.keys(sourceData.rows[0]);
        
        // Prepare insert query
        const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
        const insertQuery = `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${placeholders})`;
        
        // Insert data in batches
        const batchSize = 100;
        let inserted = 0;
        
        for (let i = 0; i < sourceData.rows.length; i += batchSize) {
            const batch = sourceData.rows.slice(i, i + batchSize);
            
            for (const row of batch) {
                try {
                    const values = columns.map(col => {
                        const value = row[col];
                        // Handle special data types
                        if (value === null) return null;
                        if (typeof value === 'object' && value.constructor === Date) {
                            return value;
                        }
                        if (typeof value === 'object') {
                            return JSON.stringify(value);
                        }
                        return value;
                    });
                    
                    await targetClient.query(insertQuery, values);
                    inserted++;
                } catch (error) {
                    console.error(`     ❌ Error inserting row: ${error.message}`);
                    report.errors.push({
                        table: tableName,
                        error: error.message,
                        row: i
                    });
                }
            }
        }
        
        // Verify sync
        const targetCount = await getRowCount(targetClient, tableName);
        
        if (targetCount === sourceCount) {
            console.log(`     ✅ Synced ${inserted} rows successfully`);
            report.success.push({
                table: tableName,
                rows: inserted,
                sourceCount,
                targetCount
            });
        } else {
            console.log(`     ⚠️ Row count mismatch: ${targetCount}/${sourceCount}`);
            report.warnings.push({
                table: tableName,
                sourceCount,
                targetCount,
                difference: sourceCount - targetCount
            });
        }
        
    } catch (error) {
        console.error(`  ❌ Error syncing ${tableName}: ${error.message}`);
        report.errors.push({
            table: tableName,
            error: error.message
        });
    }
}

async function syncDatabase(sourceName, sourceUrl, targetConfig, dbName) {
    console.log(`\n🗄️ Syncing ${dbName} Database\n`);
    console.log('=' .repeat(60));
    
    const report = {
        database: dbName,
        started: new Date(),
        success: [],
        warnings: [],
        errors: [],
        skipped: [],
        summary: {}
    };
    
    const sourceClient = new Client({
        connectionString: sourceUrl,
        ssl: { rejectUnauthorized: false },
        connectionTimeoutMillis: 30000
    });
    
    const targetClient = new Client(targetConfig);
    
    try {
        // Connect to databases
        console.log(`📡 Connecting to Railway ${sourceName}...`);
        await sourceClient.connect();
        console.log(`✅ Connected to Railway`);
        
        console.log(`📡 Connecting to local ${dbName}...`);
        await targetClient.connect();
        console.log(`✅ Connected to local\n`);
        
        // Get list of tables
        const sourceTables = await getTables(sourceClient);
        console.log(`📊 Found ${sourceTables.length} tables to sync\n`);
        
        // Start transaction
        await targetClient.query('BEGIN');
        
        // Sync each table
        for (const table of sourceTables) {
            await syncTable(sourceClient, targetClient, table, report);
        }
        
        // Commit transaction
        await targetClient.query('COMMIT');
        console.log(`\n✅ Database sync completed`);
        
    } catch (error) {
        await targetClient.query('ROLLBACK');
        console.error(`\n❌ Database sync failed: ${error.message}`);
        report.errors.push({
            database: dbName,
            error: error.message
        });
    } finally {
        await sourceClient.end();
        await targetClient.end();
        
        // Calculate summary
        report.ended = new Date();
        report.duration = (report.ended - report.started) / 1000;
        report.summary = {
            totalTables: report.success.length + report.errors.length + report.skipped.length,
            synced: report.success.length,
            failed: report.errors.length,
            skipped: report.skipped.length,
            warnings: report.warnings.length,
            totalRows: report.success.reduce((sum, t) => sum + t.rows, 0)
        };
        
        return report;
    }
}

async function main() {
    console.log('🚀 COMPREHENSIVE RAILWAY TO LOCAL DATABASE SYNC');
    console.log('=' .repeat(60));
    console.log(`Started: ${new Date().toISOString()}\n`);
    
    const reports = [];
    
    // Test Railway connectivity first
    console.log('🔍 Testing Railway connectivity...\n');
    
    const testClient = new Client({
        connectionString: RAILWAY_MAIN,
        ssl: { rejectUnauthorized: false },
        connectionTimeoutMillis: 10000
    });
    
    try {
        await testClient.connect();
        console.log('✅ Railway is accessible\n');
        await testClient.end();
    } catch (error) {
        console.error('❌ Cannot connect to Railway:', error.message);
        console.log('\nPlease check:');
        console.log('1. Railway project is active');
        console.log('2. Network connectivity');
        console.log('3. Database credentials');
        process.exit(1);
    }
    
    // Sync Main Database
    const mainReport = await syncDatabase(
        'Main (maglev)',
        RAILWAY_MAIN,
        LOCAL_MAIN,
        'bankim_core'
    );
    reports.push(mainReport);
    
    // Sync Content Database
    const contentReport = await syncDatabase(
        'Content (shortline)',
        RAILWAY_CONTENT,
        LOCAL_CONTENT,
        'bankim_content'
    );
    reports.push(contentReport);
    
    // Generate Final Report
    console.log('\n' + '=' .repeat(60));
    console.log('📊 SYNC REPORT');
    console.log('=' .repeat(60));
    
    for (const report of reports) {
        console.log(`\n📦 ${report.database.toUpperCase()}`);
        console.log('-' .repeat(40));
        console.log(`Duration: ${report.duration.toFixed(2)}s`);
        console.log(`Tables: ${report.summary.totalTables}`);
        console.log(`  ✅ Synced: ${report.summary.synced}`);
        console.log(`  ⏭️ Skipped: ${report.summary.skipped}`);
        console.log(`  ⚠️ Warnings: ${report.summary.warnings}`);
        console.log(`  ❌ Failed: ${report.summary.failed}`);
        console.log(`Total Rows Synced: ${report.summary.totalRows.toLocaleString()}`);
        
        if (report.success.length > 0) {
            console.log('\n✅ Successfully Synced Tables:');
            report.success.forEach(t => {
                console.log(`  - ${t.table}: ${t.rows.toLocaleString()} rows`);
            });
        }
        
        if (report.warnings.length > 0) {
            console.log('\n⚠️ Warnings:');
            report.warnings.forEach(w => {
                console.log(`  - ${w.table}: Expected ${w.sourceCount}, got ${w.targetCount} (diff: ${w.difference})`);
            });
        }
        
        if (report.errors.length > 0) {
            console.log('\n❌ Errors:');
            report.errors.forEach(e => {
                console.log(`  - ${e.table}: ${e.error}`);
            });
        }
        
        if (report.skipped.length > 0) {
            console.log('\n⏭️ Skipped Tables:');
            report.skipped.forEach(s => {
                console.log(`  - ${s.table} (${s.reason})`);
            });
        }
    }
    
    // Save detailed report to file
    const reportFile = `railway-sync-report-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
    fs.writeFileSync(reportFile, JSON.stringify(reports, null, 2));
    console.log(`\n📄 Detailed report saved to: ${reportFile}`);
    
    console.log('\n' + '=' .repeat(60));
    console.log('✅ SYNC PROCESS COMPLETE!');
    console.log(`Ended: ${new Date().toISOString()}`);
    
    // Final summary
    const totalTables = reports.reduce((sum, r) => sum + r.summary.totalTables, 0);
    const totalSynced = reports.reduce((sum, r) => sum + r.summary.synced, 0);
    const totalRows = reports.reduce((sum, r) => sum + r.summary.totalRows, 0);
    const totalErrors = reports.reduce((sum, r) => sum + r.summary.failed, 0);
    
    console.log('\n📈 OVERALL SUMMARY:');
    console.log(`  Databases: ${reports.length}`);
    console.log(`  Tables: ${totalTables}`);
    console.log(`  Synced: ${totalSynced}`);
    console.log(`  Total Rows: ${totalRows.toLocaleString()}`);
    console.log(`  Errors: ${totalErrors}`);
    
    if (totalErrors === 0) {
        console.log('\n🎉 All databases synced successfully!');
    } else {
        console.log('\n⚠️ Sync completed with some errors. Check the report for details.');
    }
}

// Run the sync
main().catch(error => {
    console.error('\n❌ Fatal error:', error.message);
    process.exit(1);
});
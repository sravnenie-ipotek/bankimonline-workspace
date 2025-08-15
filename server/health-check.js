#!/usr/bin/env node

const { Pool } = require('pg');
const { getDatabaseConfig } = require('./config/database-core');

async function checkDatabases() {
    console.log('🏥 Starting health check...\n');
    
    const mainConfig = getDatabaseConfig('main');
    const contentConfig = getDatabaseConfig('content');
    
    const mainPool = new Pool(mainConfig);
    const contentPool = new Pool(contentConfig);
    
    let healthStatus = {
        main: false,
        content: false,
        tables: false,
        overall: false
    };
    
    try {
        // Test main database
        console.log('📊 Checking main database...');
        const mainResult = await mainPool.query('SELECT NOW() as time, version() as version');
        console.log('✅ Main DB: Connected');
        console.log(`   Version: ${mainResult.rows[0].version.split(' ').slice(0, 2).join(' ')}`);
        console.log(`   Time: ${mainResult.rows[0].time}`);
        healthStatus.main = true;
        
        // Test content database
        console.log('\n📊 Checking content database...');
        const contentResult = await contentPool.query('SELECT NOW() as time, version() as version');
        console.log('✅ Content DB: Connected');
        console.log(`   Version: ${contentResult.rows[0].version.split(' ').slice(0, 2).join(' ')}`);
        console.log(`   Time: ${contentResult.rows[0].time}`);
        healthStatus.content = true;
        
        // Test critical tables
        console.log('\n🔍 Checking critical tables...');
        
        const criticalTables = [
            { pool: mainPool, table: 'banks', name: 'Banks' },
            { pool: mainPool, table: 'banking_standards', name: 'Banking Standards' },
            { pool: mainPool, table: 'clients', name: 'Clients' },
            { pool: mainPool, table: 'users', name: 'Users' },
            { pool: contentPool, table: 'content_items', name: 'Content Items' },
            { pool: contentPool, table: 'content_translations', name: 'Content Translations' }
        ];
        
        let tablesOk = true;
        for (const { pool, table, name } of criticalTables) {
            try {
                const result = await pool.query(`SELECT COUNT(*) as count FROM ${table}`);
                console.log(`✅ ${name}: ${result.rows[0].count} records`);
            } catch (err) {
                console.log(`❌ ${name}: ${err.message}`);
                tablesOk = false;
            }
        }
        healthStatus.tables = tablesOk;
        
        // Overall health
        healthStatus.overall = healthStatus.main && healthStatus.content && healthStatus.tables;
        
        console.log('\n' + '='.repeat(50));
        if (healthStatus.overall) {
            console.log('✅ HEALTH CHECK PASSED - All systems operational');
            process.exit(0);
        } else {
            console.log('⚠️ HEALTH CHECK FAILED - Some issues detected');
            console.log('Status:', healthStatus);
            process.exit(1);
        }
        
    } catch (error) {
        console.error('\n❌ Health check failed with error:');
        console.error('   Error:', error.message);
        console.error('   Code:', error.code);
        
        if (error.code === '28P01') {
            console.error('\n🔐 Authentication issue detected!');
            console.error('   Check DATABASE_URL and CONTENT_DATABASE_URL environment variables');
        } else if (error.code === 'ECONNREFUSED') {
            console.error('\n🌐 Connection refused!');
            console.error('   Check if database servers are accessible');
        }
        
        process.exit(1);
    } finally {
        await mainPool.end();
        await contentPool.end();
    }
}

// Run health check
checkDatabases().catch(err => {
    console.error('Unexpected error:', err);
    process.exit(1);
});
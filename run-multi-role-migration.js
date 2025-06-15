#!/usr/bin/env node
require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');

// Railway PostgreSQL connection
const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:lgqPEzvVbSCviTybKqMbzJkYvOUetJjt@maglev.proxy.rlwy.net:43809/railway',
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function testConnection() {
    try {
        console.log('🔗 Testing Railway PostgreSQL connection...');
        const result = await pool.query('SELECT NOW(), version()');
        console.log('✅ Database connected successfully!');
        console.log(`📅 Server time: ${result.rows[0].now}`);
        console.log(`🗄️  PostgreSQL version: ${result.rows[0].version.split(' ')[0]} ${result.rows[0].version.split(' ')[1]}`);
        return true;
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        return false;
    }
}

async function checkExistingTables() {
    try {
        console.log('\n🔍 Checking existing tables...');
        
        const result = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name IN ('admin_users', 'bank_configurations', 'interest_rate_rules', 'risk_parameters', 'admin_audit_log', 'bank_analytics')
            ORDER BY table_name
        `);
        
        if (result.rows.length > 0) {
            console.log('⚠️  Some multi-role tables already exist:');
            result.rows.forEach(row => {
                console.log(`   - ${row.table_name}`);
            });
            console.log('   Migration will use IF NOT EXISTS to avoid conflicts.');
        } else {
            console.log('✅ No existing multi-role tables found. Safe to proceed.');
        }
        
        return result.rows;
    } catch (error) {
        console.error('❌ Error checking existing tables:', error.message);
        return [];
    }
}

async function runMigration() {
    try {
        console.log('\n🚀 Starting multi-role admin migration...');
        
        // Read the migration file
        if (!fs.existsSync('./migrations/005-multi-role-admin.sql')) {
            throw new Error('Migration file not found: ./migrations/005-multi-role-admin.sql');
        }
        
        const migrationSQL = fs.readFileSync('./migrations/005-multi-role-admin.sql', 'utf8');
        console.log('📄 Migration file loaded successfully');
        
        // Execute the migration
        console.log('⚡ Executing migration...');
        const startTime = Date.now();
        
        await pool.query(migrationSQL);
        
        const endTime = Date.now();
        console.log(`✅ Migration completed in ${endTime - startTime}ms`);
        
        return true;
    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        if (error.detail) {
            console.error('📋 Error details:', error.detail);
        }
        return false;
    }
}

async function verifyMigration() {
    try {
        console.log('\n🔍 Verifying migration results...');
        
        // Check tables were created
        const tables = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name IN ('admin_users', 'bank_configurations', 'interest_rate_rules', 'risk_parameters', 'admin_audit_log', 'bank_analytics')
            ORDER BY table_name
        `);
        
        console.log('📋 Tables created:');
        tables.rows.forEach(row => {
            console.log(`   ✅ ${row.table_name}`);
        });
        
        // Check indexes were created
        const indexes = await pool.query(`
            SELECT indexname 
            FROM pg_indexes 
            WHERE schemaname = 'public' 
            AND indexname LIKE 'idx_%admin%' OR indexname LIKE 'idx_%bank%' OR indexname LIKE 'idx_%interest%' OR indexname LIKE 'idx_%risk%'
            ORDER BY indexname
        `);
        
        console.log(`\n📊 Indexes created: ${indexes.rows.length}`);
        
        // Check admin users
        const userCount = await pool.query('SELECT COUNT(*) FROM admin_users');
        console.log(`\n👤 Admin users created: ${userCount.rows[0].count}`);
        
        // Check bank configurations
        const configCount = await pool.query('SELECT COUNT(*) FROM bank_configurations');
        console.log(`🏦 Bank configurations: ${configCount.rows[0].count}`);
        
        // Check interest rate rules
        const rulesCount = await pool.query('SELECT COUNT(*) FROM interest_rate_rules');
        console.log(`📈 Interest rate rules: ${rulesCount.rows[0].count}`);
        
        // Check risk parameters
        const riskCount = await pool.query('SELECT COUNT(*) FROM risk_parameters');
        console.log(`⚖️  Risk parameters: ${riskCount.rows[0].count}`);
        
        // Show sample admin users
        const adminUsers = await pool.query(`
            SELECT username, email, role, bank_id 
            FROM admin_users 
            ORDER BY role, username
        `);
        
        console.log('\n👥 Admin users created:');
        adminUsers.rows.forEach(user => {
            const bankInfo = user.bank_id ? ` (Bank ID: ${user.bank_id})` : ' (Global)';
            console.log(`   📧 ${user.email} - ${user.role}${bankInfo}`);
        });
        
        return true;
    } catch (error) {
        console.error('❌ Verification failed:', error.message);
        return false;
    }
}

async function showLoginCredentials() {
    try {
        console.log('\n🔐 LOGIN CREDENTIALS:');
        console.log('═══════════════════════════════════════');
        
        const users = await pool.query(`
            SELECT username, email, role, bank_id 
            FROM admin_users 
            WHERE role IN ('business_admin', 'risk_manager', 'compliance', 'system_admin')
            ORDER BY 
                CASE role 
                    WHEN 'business_admin' THEN 1
                    WHEN 'system_admin' THEN 2
                    WHEN 'risk_manager' THEN 3
                    WHEN 'compliance' THEN 4
                    ELSE 5
                END
        `);
        
        users.rows.forEach(user => {
            console.log(`\n🎭 ${user.role.toUpperCase().replace('_', ' ')}`);
            console.log(`   📧 Email: ${user.email}`);
            console.log(`   🔑 Password: admin123`);
            console.log(`   👤 Username: ${user.username}`);
        });
        
        console.log('\n🏦 BANK ADMIN USERS:');
        const bankAdmins = await pool.query(`
            SELECT au.username, au.email, au.bank_id, b.name_en, b.name_ru
            FROM admin_users au
            LEFT JOIN banks b ON au.bank_id = b.id
            WHERE au.role = 'bank_admin'
            ORDER BY au.bank_id
        `);
        
        bankAdmins.rows.forEach(user => {
            const bankName = user.name_en || user.name_ru || `Bank ${user.bank_id}`;
            console.log(`   🏪 ${bankName}: ${user.email} / admin123`);
        });
        
        console.log('\n⚠️  IMPORTANT: Change these default passwords in production!');
        console.log('═══════════════════════════════════════');
        
    } catch (error) {
        console.error('❌ Error showing credentials:', error.message);
    }
}

async function main() {
    console.log('🏦 BankIM Multi-Role Admin Migration');
    console.log('=====================================');
    
    // Test connection
    const connected = await testConnection();
    if (!connected) {
        console.error('\n❌ Cannot proceed without database connection');
        process.exit(1);
    }
    
    // Check existing tables
    await checkExistingTables();
    
    // Run migration
    const migrationSuccess = await runMigration();
    if (!migrationSuccess) {
        console.error('\n❌ Migration failed. Exiting.');
        process.exit(1);
    }
    
    // Verify results
    const verificationSuccess = await verifyMigration();
    if (!verificationSuccess) {
        console.error('\n❌ Verification failed. Check the database manually.');
        process.exit(1);
    }
    
    // Show login credentials
    await showLoginCredentials();
    
    console.log('\n🎉 Multi-role admin migration completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('   1. Update server-db.js with multi-role endpoints');
    console.log('   2. Update admin.html with enhanced UI');
    console.log('   3. Test login with the credentials above');
    console.log('   4. Change default passwords in production');
    
    await pool.end();
    process.exit(0);
}

// Handle errors
process.on('unhandledRejection', (error) => {
    console.error('❌ Unhandled rejection:', error);
    process.exit(1);
});

process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught exception:', error);
    process.exit(1);
});

// Run the migration
main().catch(error => {
    console.error('❌ Migration script failed:', error);
    process.exit(1);
}); 
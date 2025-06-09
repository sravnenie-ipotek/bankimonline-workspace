#!/usr/bin/env node

const { Pool } = require('pg');

// Railway connection
const pool = new Pool({
    connectionString: 'postgresql://postgres:lgqPEzvVbSCviTybKqMbzJkYvOUetJjt@maglev.proxy.rlwy.net:43809/railway'
});

async function getLoginData() {
    console.log('📱 Getting Login Data from Railway Database...\n');
    
    try {
        // Get existing users for login testing
        console.log('👥 Existing Users:');
        const usersResult = await pool.query('SELECT id, name, phone, email, role FROM users LIMIT 10');
        
        if (usersResult.rows.length === 0) {
            console.log('   ❌ No users found in database');
        } else {
            console.log(`   ✅ Found ${usersResult.rows.length} users:`);
            usersResult.rows.forEach((user, index) => {
                console.log(`   ${index + 1}. ID: ${user.id}`);
                console.log(`      Name: ${user.name || 'N/A'}`);
                console.log(`      Phone: ${user.phone || 'N/A'}`);
                console.log(`      Email: ${user.email || 'N/A'}`);
                console.log(`      Role: ${user.role || 'N/A'}`);
                console.log('');
            });
        }

        // Get banks data
        console.log('🏦 Available Banks:');
        const banksResult = await pool.query('SELECT id, name_ru, name_en, name_he FROM banks LIMIT 5');
        
        if (banksResult.rows.length > 0) {
            console.log(`   ✅ Found ${banksResult.rows.length} banks:`);
            banksResult.rows.forEach((bank, index) => {
                console.log(`   ${index + 1}. ${bank.name_ru || bank.name_en || bank.name_he}`);
            });
        } else {
            console.log('   ❌ No banks found');
        }
        console.log('');

        // Get locales
        console.log('🌐 Available Locales:');
        const localesResult = await pool.query('SELECT * FROM locales LIMIT 5');
        if (localesResult.rows.length > 0) {
            console.log(`   ✅ Found ${localesResult.rows.length} locale entries`);
        } else {
            console.log('   ❌ No locales found');
        }
        console.log('');

        // Test registration by inserting a new user
        console.log('📝 Testing User Registration...');
        const testPhone = '+972501234567';
        const testName = 'Test User Registration';
        
        // Check if test user already exists
        const existingUser = await pool.query('SELECT * FROM users WHERE phone = $1', [testPhone]);
        
        if (existingUser.rows.length > 0) {
            console.log(`   ⚠️  Test user with phone ${testPhone} already exists:`);
            console.log(`      ID: ${existingUser.rows[0].id}`);
            console.log(`      Name: ${existingUser.rows[0].name}`);
            console.log(`      Created: ${existingUser.rows[0].created_at}`);
        } else {
            // Insert new test user
            const newUser = await pool.query(`
                INSERT INTO users (name, phone, email, password, role, created_at, updated_at) 
                VALUES ($1, $2, $3, $4, $5, NOW(), NOW()) 
                RETURNING id, name, phone, email, role, created_at
            `, [testName, testPhone, `${testPhone}@bankim.com`, 'hashed-password', 'user']);
            
            console.log('   ✅ Successfully registered new user:');
            console.log(`      ID: ${newUser.rows[0].id}`);
            console.log(`      Name: ${newUser.rows[0].name}`);
            console.log(`      Phone: ${newUser.rows[0].phone}`);
            console.log(`      Email: ${newUser.rows[0].email}`);
            console.log(`      Role: ${newUser.rows[0].role}`);
            console.log(`      Created: ${newUser.rows[0].created_at}`);
        }
        
        console.log('\n🎯 LOGIN TESTING RECOMMENDATIONS:');
        console.log('   1. Try any of the existing phone numbers listed above');
        console.log(`   2. Or use the test phone: ${testPhone}`);
        console.log('   3. Use SMS code: 1234 (or any 4-digit code for testing)');
        console.log('   4. New registrations will be automatically added to the database');

    } catch (err) {
        console.error('❌ Error:', err.message);
    } finally {
        await pool.end();
        console.log('\n🔌 Database connection closed.');
    }
}

getLoginData(); 
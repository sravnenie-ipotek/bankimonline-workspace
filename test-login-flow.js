#!/usr/bin/env node

const { Pool } = require('pg');

// Railway connection
const pool = new Pool({
    connectionString: 'postgresql://postgres:lgqPEzvVbSCviTybKqMbzJkYvOUetJjt@maglev.proxy.rlwy.net:43809/railway'
});

async function testLoginFlow() {
    console.log('🔐 Testing Login Flow with Real Database...\n');
    
    try {
        // Get existing users from users table (email-based)
        console.log('👥 EXISTING USERS (Email-based):');
        const usersResult = await pool.query('SELECT id, name, email, role FROM users WHERE email IS NOT NULL LIMIT 5');
        
        if (usersResult.rows.length > 0) {
            console.log(`   ✅ Found ${usersResult.rows.length} users with emails:`);
            usersResult.rows.forEach((user, index) => {
                console.log(`   ${index + 1}. Name: ${user.name}`);
                console.log(`      Email: ${user.email}`);
                console.log(`      Role: ${user.role}`);
                console.log(`      ID: ${user.id}`);
                console.log('');
            });
        } else {
            console.log('   ❌ No users with emails found');
        }

        // Get existing clients from clients table (phone-based)
        console.log('📱 EXISTING CLIENTS (Phone-based):');
        const clientsResult = await pool.query('SELECT id, first_name, last_name, email, phone FROM clients WHERE phone IS NOT NULL LIMIT 5');
        
        if (clientsResult.rows.length > 0) {
            console.log(`   ✅ Found ${clientsResult.rows.length} clients with phones:`);
            clientsResult.rows.forEach((client, index) => {
                console.log(`   ${index + 1}. Name: ${client.first_name} ${client.last_name}`);
                console.log(`      Phone: ${client.phone}`);
                console.log(`      Email: ${client.email}`);
                console.log(`      ID: ${client.id}`);
                console.log('');
            });
        } else {
            console.log('   ❌ No clients with phones found');
        }

        // Test inserting a new client for phone-based authentication
        console.log('📝 TESTING CLIENT REGISTRATION (Phone-based)...');
        const testPhone = '+972501234567';
        const testFirstName = 'Test';
        const testLastName = 'User';
        const testEmail = 'test@bankim.com';
        
        // Check if test client already exists
        const existingClient = await pool.query('SELECT * FROM clients WHERE phone = $1', [testPhone]);
        
        if (existingClient.rows.length > 0) {
            console.log(`   ⚠️  Test client with phone ${testPhone} already exists:`);
            console.log(`      ID: ${existingClient.rows[0].id}`);
            console.log(`      Name: ${existingClient.rows[0].first_name} ${existingClient.rows[0].last_name}`);
            console.log(`      Email: ${existingClient.rows[0].email}`);
            console.log(`      Created: ${existingClient.rows[0].created_at}`);
        } else {
            // Insert new test client
            const newClient = await pool.query(`
                INSERT INTO clients (first_name, last_name, email, phone, created_at, updated_at) 
                VALUES ($1, $2, $3, $4, NOW(), NOW()) 
                RETURNING id, first_name, last_name, email, phone, created_at
            `, [testFirstName, testLastName, testEmail, testPhone]);
            
            console.log('   ✅ Successfully registered new client:');
            console.log(`      ID: ${newClient.rows[0].id}`);
            console.log(`      Name: ${newClient.rows[0].first_name} ${newClient.rows[0].last_name}`);
            console.log(`      Phone: ${newClient.rows[0].phone}`);
            console.log(`      Email: ${newClient.rows[0].email}`);
            console.log(`      Created: ${newClient.rows[0].created_at}`);
        }

        // Test user registration (for admin access)
        console.log('\n👤 TESTING USER REGISTRATION (Email-based)...');
        const testUserEmail = 'newuser@bankim.com';
        const testUserName = 'New Test User';
        
        const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [testUserEmail]);
        
        if (existingUser.rows.length > 0) {
            console.log(`   ⚠️  Test user with email ${testUserEmail} already exists:`);
            console.log(`      ID: ${existingUser.rows[0].id}`);
            console.log(`      Name: ${existingUser.rows[0].name}`);
            console.log(`      Role: ${existingUser.rows[0].role}`);
        } else {
            const newUser = await pool.query(`
                INSERT INTO users (name, email, password, role, created_at, updated_at) 
                VALUES ($1, $2, $3, $4, NOW(), NOW()) 
                RETURNING id, name, email, role, created_at
            `, [testUserName, testUserEmail, 'hashed-password-123', 'user']);
            
            console.log('   ✅ Successfully registered new user:');
            console.log(`      ID: ${newUser.rows[0].id}`);
            console.log(`      Name: ${newUser.rows[0].name}`);
            console.log(`      Email: ${newUser.rows[0].email}`);
            console.log(`      Role: ${newUser.rows[0].role}`);
            console.log(`      Created: ${newUser.rows[0].created_at}`);
        }
        
        console.log('\n🎯 LOGIN TESTING GUIDE:');
        console.log('========================');
        console.log('\n📱 FOR PHONE LOGIN (SMS Flow):');
        console.log(`   Phone Number: ${testPhone}`);
        console.log('   SMS Code: Any 4-digit code (e.g., 1234)');
        console.log('   Result: Will create/update client record');
        
        console.log('\n📧 FOR EMAIL LOGIN (if implementing email auth):');
        console.log(`   Email: ${testUserEmail}`);
        console.log('   Password: Any password (validation needed)');
        console.log('   Result: Will authenticate against users table');
        
        console.log('\n🏦 AVAILABLE BANKS TO TEST:');
        const banks = await pool.query('SELECT name_ru, name_en FROM banks LIMIT 3');
        banks.rows.forEach((bank, index) => {
            console.log(`   ${index + 1}. ${bank.name_ru} / ${bank.name_en}`);
        });

    } catch (err) {
        console.error('❌ Error:', err.message);
    } finally {
        await pool.end();
        console.log('\n🔌 Database connection closed.');
    }
}

testLoginFlow(); 
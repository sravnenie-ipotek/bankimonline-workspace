#!/usr/bin/env node

/**
 * Direct Twilio Authentication Test
 * Tests the exact credentials and diagnoses the 401 error
 */

require('dotenv').config({ path: '.env.whatsapp' });
const axios = require('axios');

async function testTwilioAuth() {
    console.log('🔐 Direct Twilio Authentication Test\n');
    
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    
    console.log('📋 Testing Credentials:');
    console.log(`   Account SID: ${accountSid}`);
    console.log(`   Auth Token: ${authToken}`);
    console.log('');
    
    // Test 1: Check account details (should work if auth is valid)
    console.log('🧪 Test 1: Checking account details...');
    try {
        const response = await axios.get(
            `https://api.twilio.com/2010-04-01/Accounts/${accountSid}.json`,
            {
                auth: {
                    username: accountSid,
                    password: authToken
                }
            }
        );
        
        console.log('✅ Account authentication: SUCCESS');
        console.log(`   Account Status: ${response.data.status}`);
        console.log(`   Account Type: ${response.data.type}`);
        console.log(`   Account Name: ${response.data.friendly_name}`);
        
    } catch (error) {
        console.log('❌ Account authentication: FAILED');
        console.log(`   Error: ${error.response?.status} - ${error.response?.data?.message || error.message}`);
        
        if (error.response?.status === 401) {
            console.log('🚨 DIAGNOSIS: Invalid credentials - check Account SID and Auth Token');
            return;
        }
    }
    
    console.log('');
    
    // Test 2: List phone numbers (to check WhatsApp capability)
    console.log('🧪 Test 2: Checking WhatsApp phone numbers...');
    try {
        const response = await axios.get(
            `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/IncomingPhoneNumbers.json`,
            {
                auth: {
                    username: accountSid,
                    password: authToken
                }
            }
        );
        
        console.log('✅ Phone number check: SUCCESS');
        console.log(`   Available numbers: ${response.data.incoming_phone_numbers.length}`);
        
        const whatsappNumbers = response.data.incoming_phone_numbers.filter(
            num => num.capabilities?.sms || num.capabilities?.mms
        );
        console.log(`   WhatsApp capable: ${whatsappNumbers.length}`);
        
    } catch (error) {
        console.log('❌ Phone number check: FAILED');
        console.log(`   Error: ${error.response?.status} - ${error.response?.data?.message || error.message}`);
    }
    
    console.log('');
    
    // Test 3: Try sending to sandbox number first
    console.log('🧪 Test 3: Testing WhatsApp sandbox...');
    try {
        const testMessage = `🧪 Twilio WhatsApp Test
Time: ${new Date().toLocaleString()}
Status: Testing authentication and sandbox access`;

        const response = await axios.post(
            `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
            new URLSearchParams({
                From: 'whatsapp:+14155238886',
                To: 'whatsapp:+972544345287',
                Body: testMessage
            }),
            {
                auth: {
                    username: accountSid,
                    password: authToken
                },
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );
        
        console.log('✅ WhatsApp message: SUCCESS!');
        console.log(`   Message SID: ${response.data.sid}`);
        console.log(`   Status: ${response.data.status}`);
        console.log('📱 Check your WhatsApp for the test message!');
        
    } catch (error) {
        console.log('❌ WhatsApp message: FAILED');
        console.log(`   Error: ${error.response?.status} - ${error.response?.data?.message || error.message}`);
        
        if (error.response?.status === 401) {
            console.log('🔍 401 Error Analysis:');
            console.log('   This typically means:');
            console.log('   1. Your phone number (+972544345287) is not in the Twilio sandbox');
            console.log('   2. You need to send "join <code>" to +14155238886 first');
            console.log('   3. Or your account needs phone number verification');
        }
        
        if (error.response?.data) {
            console.log('\n📋 Full error details:');
            console.log(JSON.stringify(error.response.data, null, 2));
        }
    }
    
    console.log('\n🔧 Next Steps:');
    console.log('1. Go to: https://console.twilio.com/us1/develop/sms/try-it-out/whatsapp-learn');
    console.log('2. Look for your sandbox code (usually something like "JoinXXXX")');
    console.log('3. Send "join <that-code>" to +1 415 523 8886 from your WhatsApp');
    console.log('4. Wait for confirmation from Twilio');
    console.log('5. Run this test again');
}

testTwilioAuth().catch(console.error);
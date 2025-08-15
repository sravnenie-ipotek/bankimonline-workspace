#!/usr/bin/env node

/**
 * Test Basic SMS (simpler than WhatsApp)
 * If this fails, credentials are definitely wrong
 */

require('dotenv').config({ path: '.env.whatsapp' });
const axios = require('axios');

async function testBasicSMS() {
    console.log('📱 Testing Basic SMS (simpler than WhatsApp)\n');
    
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    
    console.log('🔑 Credential Format Check:');
    console.log(`   Account SID format: ${accountSid?.startsWith('AC') ? '✅ Correct (starts with AC)' : '❌ Should start with AC'}`);
    console.log(`   Auth Token length: ${authToken?.length === 32 ? '✅ Correct (32 chars)' : `❌ Should be 32 chars (currently ${authToken?.length})`}`);
    console.log('');
    
    // Try the most basic Twilio API call
    console.log('🧪 Testing most basic API call...');
    try {
        const response = await axios.get(
            `https://api.twilio.com/2010-04-01/Accounts/${accountSid}.json`,
            {
                auth: {
                    username: accountSid,
                    password: authToken
                },
                timeout: 10000
            }
        );
        
        console.log('✅ CREDENTIALS ARE VALID!');
        console.log(`   Account: ${response.data.friendly_name}`);
        console.log(`   Status: ${response.data.status}`);
        console.log(`   Type: ${response.data.type}`);
        
        // If basic auth works, the WhatsApp issue is sandbox-related
        console.log('\n🔍 Since credentials work, the WhatsApp 401 is a sandbox issue');
        console.log('📋 You need to join the WhatsApp sandbox:');
        console.log('   1. Go to: https://console.twilio.com/us1/develop/sms/try-it-out/whatsapp-learn');
        console.log('   2. Send "join <sandbox-code>" to +1 415 523 8886');
        console.log('   3. Use YOUR phone (+972544345287) to send the message');
        
    } catch (error) {
        console.log('❌ CREDENTIALS ARE INVALID');
        console.log(`   HTTP Status: ${error.response?.status}`);
        console.log(`   Error: ${error.response?.data?.message || error.message}`);
        
        if (error.response?.status === 401) {
            console.log('\n🚨 Authentication Failed - Possible Issues:');
            console.log('   1. Account SID is incorrect');
            console.log('   2. Auth Token is incorrect'); 
            console.log('   3. Account has been suspended');
            console.log('   4. Credentials are from a different Twilio account');
            console.log('\n🔧 Get fresh credentials from:');
            console.log('   https://console.twilio.com/us1/account/keys-credentials/api-keys');
        }
        
        return false;
    }
    
    return true;
}

testBasicSMS().catch(console.error);
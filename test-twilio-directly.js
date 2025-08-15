#!/usr/bin/env node

/**
 * Direct Twilio API Test
 * Tests the Twilio WhatsApp API directly with provided credentials
 */

require('dotenv').config({ path: '.env.whatsapp' });
const axios = require('axios');

async function testTwilioDirectly() {
    console.log('🔐 Testing Twilio WhatsApp API directly...\n');
    
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_WHATSAPP_FROM;
    const toNumber = `whatsapp:${process.env.WHATSAPP_DEFAULT_RECIPIENT}`;
    
    console.log('📋 Configuration:');
    console.log(`   Account SID: ${accountSid ? accountSid.substring(0, 10) + '...' : 'MISSING'}`);
    console.log(`   Auth Token: ${authToken ? authToken.substring(0, 10) + '...' : 'MISSING'}`);
    console.log(`   From: ${fromNumber}`);
    console.log(`   To: ${toNumber}`);
    console.log('');
    
    if (!accountSid || !authToken) {
        console.error('❌ Missing Twilio credentials');
        return;
    }
    
    const message = `🚨 CRITICAL BUG DETECTED

📋 Issue: Banking System - Financial Calculation Error
💥 Impact: Mortgage calculations returning random values
🔗 Jira: BANKDEV-CRITICAL-001

⚡ Automated notification from bug detection system
📅 ${new Date().toLocaleString()}`;

    try {
        console.log('📱 Sending WhatsApp message via Twilio...');
        
        const response = await axios.post(
            `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
            new URLSearchParams({
                From: fromNumber,
                To: toNumber,
                Body: message
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
        
        console.log('✅ SUCCESS! WhatsApp message sent!');
        console.log(`📱 Message SID: ${response.data.sid}`);
        console.log(`📱 Status: ${response.data.status}`);
        console.log(`📱 To: ${response.data.to}`);
        console.log(`📱 From: ${response.data.from}`);
        console.log('\n🎉 Check your WhatsApp now!');
        
    } catch (error) {
        console.error('❌ FAILED to send WhatsApp message');
        console.error(`   Status: ${error.response?.status}`);
        console.error(`   Error: ${error.response?.data?.message || error.message}`);
        
        if (error.response?.status === 401) {
            console.error('\n🔍 Authentication Error - Possible issues:');
            console.error('   1. Account SID is incorrect');
            console.error('   2. Auth Token is incorrect');
            console.error('   3. Account may be suspended');
            console.error('   4. Check Twilio console for account status');
        }
        
        if (error.response?.status === 400) {
            console.error('\n🔍 Bad Request - Possible issues:');
            console.error('   1. Phone number format incorrect');
            console.error('   2. WhatsApp sender not verified');
            console.error('   3. Recipient number not verified for sandbox');
        }
        
        if (error.response?.data) {
            console.error('\n📋 Full error response:');
            console.error(JSON.stringify(error.response.data, null, 2));
        }
    }
}

testTwilioDirectly().catch(console.error);
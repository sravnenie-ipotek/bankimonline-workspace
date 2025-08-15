#!/usr/bin/env node

/**
 * Debug Twilio WhatsApp Setup
 */

require('dotenv').config({ path: '.env.whatsapp' });

async function debugTwilioSetup() {
    console.log('🔍 Debugging Twilio WhatsApp Setup\n');
    
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_WHATSAPP_FROM;
    const toNumber = process.env.WHATSAPP_DEFAULT_RECIPIENT;
    
    console.log('📋 Current Configuration:');
    console.log(`   Account SID: ${accountSid ? accountSid.substring(0, 15) + '...' : 'MISSING'}`);
    console.log(`   Auth Token: ${authToken ? authToken.substring(0, 15) + '...' : 'MISSING'}`);
    console.log(`   From Number: ${fromNumber}`);
    console.log(`   Your Number: ${toNumber}`);
    console.log('');
    
    console.log('❌ Error Diagnosis: HTTP 401 (Authentication Failed)');
    console.log('');
    
    console.log('🔧 Possible Solutions:');
    console.log('');
    
    console.log('1️⃣ **Most Likely Issue**: Phone number not in Twilio sandbox');
    console.log('   📱 Go to: https://console.twilio.com/us1/develop/sms/try-it-out/whatsapp-learn');
    console.log(`   📲 Send "join <sandbox-code>" to +1 415 523 8886 from ${toNumber}`);
    console.log('   ✅ This adds your number to the sandbox whitelist');
    console.log('');
    
    console.log('2️⃣ **Alternative**: Check account status');
    console.log('   🌐 Visit: https://console.twilio.com/');
    console.log('   🔍 Verify account is active and not suspended');
    console.log('   💳 Check if trial account has remaining credits');
    console.log('');
    
    console.log('3️⃣ **Verify credentials**:');
    console.log('   📋 Account SID should start with "AC"');
    console.log('   🔑 Auth Token should be 32 characters');
    console.log('   📞 From number should be "whatsapp:+14155238886"');
    console.log('');
    
    console.log('🧪 **Quick Test After Setup**:');
    console.log('   node test-whatsapp-live.js');
    console.log('');
    
    console.log('📱 **Expected WhatsApp Message**:');
    console.log('   🚨 CRITICAL BUG DETECTED');
    console.log('   📋 BANKDEV-CRITICAL-001');
    console.log('   💥 System-wide failure details...');
    console.log('   🔗 Jira link and technical information');
    
    // Show the exact curl command for manual testing
    console.log('\n🔧 **Manual Test Command**:');
    console.log('If you want to test manually, use this curl command after sandbox setup:');
    console.log(`
curl -X POST https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json \\
  --data-urlencode "From=${fromNumber}" \\
  --data-urlencode "Body=🚨 TEST: Twilio WhatsApp working!" \\
  --data-urlencode "To=whatsapp:${toNumber}" \\
  -u ${accountSid}:${authToken}
`);
}

debugTwilioSetup().catch(console.error);
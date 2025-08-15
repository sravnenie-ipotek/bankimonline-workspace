#!/usr/bin/env node

/**
 * Live WhatsApp Test with Real Credentials
 * Tests WhatsApp notification with actual bug scenario
 */

require('dotenv').config({ path: '.env.whatsapp' });
const { sendWhatsAppNotification } = require('./hooks/whatsapp-bug-notification');

async function testLiveWhatsApp() {
    console.log('📱 Testing WhatsApp with Real Credentials\n');
    console.log('=' .repeat(50));
    
    // Check if credentials are loaded
    console.log('🔐 Credential Check:');
    console.log(`   TWILIO_ACCOUNT_SID: ${process.env.TWILIO_ACCOUNT_SID ? '✅ Loaded' : '❌ Missing'}`);
    console.log(`   TWILIO_AUTH_TOKEN: ${process.env.TWILIO_AUTH_TOKEN ? '✅ Loaded' : '❌ Missing'}`);
    console.log(`   RECIPIENT: ${process.env.WHATSAPP_DEFAULT_RECIPIENT || '❌ Missing'}`);
    console.log('');
    
    // Create a realistic critical bug scenario
    const criticalBugData = {
        issueKey: 'BANKDEV-CRITICAL-001',
        summary: 'URGENT: Financial calculation system returning random values',
        description: 'Critical bug detected in calculateMonthlyPayment.ts - mortgage calculations are producing random results instead of accurate financial calculations.',
        impact: 'CRITICAL - All mortgage calculations corrupted, affecting customer trust and business operations',
        files: [
            'mainapp/src/utils/helpers/calculateMonthlyPayment.ts',
            'mainapp/src/services/bankingAPI.ts'
        ],
        errors: [
            'TypeError: Math.random() corrupting financial calculations',
            'Console Error: BUG DETECTED: Financial calculations corrupted!'
        ],
        jiraUrl: 'https://bankimonline.atlassian.net/browse/BANKDEV-CRITICAL-001',
        timestamp: new Date().toISOString(),
        severity: 'CRITICAL',
        environment: 'PRODUCTION'
    };
    
    console.log('🚨 Sending CRITICAL Bug Alert to WhatsApp...\n');
    console.log('📋 Bug Details:');
    console.log(`   Issue: ${criticalBugData.summary}`);
    console.log(`   Impact: ${criticalBugData.impact}`);
    console.log(`   Files: ${criticalBugData.files.join(', ')}`);
    console.log(`   Recipient: ${process.env.WHATSAPP_DEFAULT_RECIPIENT}`);
    console.log('');
    
    try {
        const result = await sendWhatsAppNotification(criticalBugData);
        
        console.log('📱 WhatsApp Notification Result:');
        console.log(`   Status: ${result.successCount > 0 ? '✅ SUCCESS' : '❌ FAILED'}`);
        console.log(`   Messages Sent: ${result.successCount}`);
        console.log(`   Messages Failed: ${result.failureCount}`);
        
        if (result.successCount > 0) {
            console.log('\n🎉 SUCCESS! Check your WhatsApp for the notification!');
            console.log(`📱 Message sent to: ${process.env.WHATSAPP_DEFAULT_RECIPIENT}`);
            console.log('\n💬 Expected Message Content:');
            console.log('   🚨 CRITICAL BUG DETECTED');
            console.log('   📋 BANKDEV-CRITICAL-001');
            console.log('   💥 Financial calculation system returning random values');
            console.log('   🔗 Jira link and technical details');
        }
        
        if (result.errors && result.errors.length > 0) {
            console.log('\n⚠️ Errors encountered:');
            result.errors.forEach(error => console.log(`   ❌ ${error}`));
        }
        
    } catch (error) {
        console.error('\n❌ WhatsApp Test Failed:');
        console.error(`   Error: ${error.message}`);
        console.error(`   Details: ${error.stack}`);
        
        // Provide debugging information
        console.log('\n🔍 Debugging Information:');
        console.log(`   Account SID: ${process.env.TWILIO_ACCOUNT_SID?.substring(0, 10)}...`);
        console.log(`   From Number: ${process.env.TWILIO_WHATSAPP_FROM}`);
        console.log(`   To Number: ${process.env.WHATSAPP_DEFAULT_RECIPIENT}`);
    }
}

// Also test a simple message
async function testSimpleMessage() {
    console.log('\n📱 Testing Simple WhatsApp Message...\n');
    
    const simpleTestData = {
        summary: 'WhatsApp Integration Test',
        description: 'Testing the WhatsApp notification system with your actual Twilio credentials.',
        impact: 'Testing system connectivity and message delivery',
        timestamp: new Date().toISOString()
    };
    
    try {
        const result = await sendWhatsAppNotification(simpleTestData);
        
        if (result.successCount > 0) {
            console.log('✅ Simple test message sent successfully!');
        } else {
            console.log('❌ Simple test message failed to send');
        }
        
    } catch (error) {
        console.error('❌ Simple test failed:', error.message);
    }
}

async function runTests() {
    console.log('🚀 WhatsApp Live Testing with Real Credentials\n');
    
    // Test 1: Critical bug notification
    await testLiveWhatsApp();
    
    // Wait a moment between tests
    console.log('\n⏳ Waiting 3 seconds before next test...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Test 2: Simple message
    await testSimpleMessage();
    
    console.log('\n🏁 All WhatsApp tests completed!');
    console.log('📱 Check your WhatsApp messages now!');
}

runTests().catch(console.error);
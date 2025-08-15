#!/usr/bin/env node

/**
 * Test WhatsApp notification system
 */

const { sendWhatsAppNotification } = require('./whatsapp-bug-notification');

async function runTests() {
    console.log('🧪 Testing WhatsApp Bug Notification System...\n');
    
    // Test 1: Critical bug
    console.log('📱 Test 1: Critical Bug Notification');
    const criticalBug = {
        issueKey: 'TVKC-TEST-1',
        summary: 'CRITICAL: Financial calculation system corrupted',
        files: ['src/utils/calculatePayment.ts', 'src/services/bankingAPI.ts'],
        errors: ['TypeError: Cannot read property calculatePayment of undefined'],
        impact: 'All mortgage calculations returning incorrect values'
    };
    
    try {
        const result1 = await sendWhatsAppNotification(criticalBug);
        console.log('✅ Critical bug notification:', result1.successCount > 0 ? 'SUCCESS' : 'FAILED');
    } catch (error) {
        console.log('❌ Critical bug notification FAILED:', error.message);
    }
    
    console.log();
    
    // Test 2: Low severity bug (should be skipped)
    console.log('📱 Test 2: Low Severity Bug (should skip)');
    const lowBug = {
        summary: 'Minor UI alignment issue in footer',
        impact: 'Cosmetic issue only'
    };
    
    try {
        const result2 = await sendWhatsAppNotification(lowBug);
        console.log('✅ Low severity notification:', result2.skipped ? 'CORRECTLY SKIPPED' : 'SENT');
    } catch (error) {
        console.log('❌ Low severity test FAILED:', error.message);
    }
    
    console.log('\n🎉 WhatsApp notification tests completed!');
}

runTests().catch(console.error);

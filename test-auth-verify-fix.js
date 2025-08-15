#!/usr/bin/env node

// Test script to validate the auth-verify fix
const jwt = require('jsonwebtoken');

// Test data that previously caused 500 error
const testPayload = {
    code: '0000',  // Mock code for testing
    mobile_number: '+972544999777'  // Test phone number
};

// Test the endpoint
async function testAuthVerify() {
    try {
        const response = await fetch('http://localhost:8003/api/auth-verify', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(testPayload)
        });
        
        const data = await response.json();
        
        if (response.status === 200) {
            );
            
            // Verify JWT token structure
            if (data.data && data.data.token) {
                const decoded = jwt.decode(data.data.token);
                );
                
                // Verify token contains expected fields
                if (decoded.type === 'client' && decoded.phone && decoded.id) {
                    } else {
                    }
            }
        } else {
            );
        }
    } catch (error) {
        if (error.code === 'ECONNREFUSED') {
            } else {
            console.error('❌ Test error:', error.message);
        }
    }
}

// Check if we're being run directly or imported
if (require.main === module) {
    testAuthVerify();
}

module.exports = { testAuthVerify };
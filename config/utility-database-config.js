#!/usr/bin/env node

/**
 * Utility Database Configuration
 * 
 * FOR UTILITY SCRIPTS ONLY - NOT FOR PRODUCTION CODE!
 * 
 * This module provides database URLs for:
 * - Testing utilities
 * - Migration scripts
 * - Backup/restore operations
 * - Analysis tools
 * 
 * PRODUCTION CODE MUST USE: server/config/database-truth.js
 */

const fs = require('fs');
const path = require('path');

// Try to load from environment first (SOURCE OF TRUTH)
function getUtilityDatabaseUrl(type = 'main') {
    // FIRST: Always try environment variables (SOURCE OF TRUTH)
    if (process.env.DATABASE_URL) {
        switch(type) {
            case 'main':
            case 'core':
                return process.env.DATABASE_URL;
            case 'content':
                return process.env.CONTENT_DATABASE_URL || process.env.DATABASE_URL;
            case 'management':
                return process.env.MANAGEMENT_DATABASE_URL || process.env.DATABASE_URL;
            default:
                return process.env.DATABASE_URL;
        }
    }
    
    // SECOND: For utilities only, load from config file
    console.warn('⚠️  WARNING: Using utility database config - NOT for production!');
    console.warn('⚠️  Set DATABASE_URL in .env for production usage');
    
    try {
        const configPath = path.join(__dirname, 'utility-databases.json');
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        
        // Return development URLs for utilities
        switch(type) {
            case 'main':
            case 'core':
                return config.development.railway_core.url;
            case 'content':
                return config.development.railway_content.url;
            case 'management':
                return config.development.railway_management.url;
            case 'test':
                return config.test.mock;
            default:
                return config.development.railway_core.url;
        }
    } catch (error) {
        console.error('❌ Failed to load utility database config:', error.message);
        console.error('❌ Please ensure config/utility-databases.json exists');
        process.exit(1);
    }
}

// Get test database URL (for test files only)
function getTestDatabaseUrl() {
    return getUtilityDatabaseUrl('test');
}

// Check if running in utility context
function isUtilityScript() {
    const scriptPath = process.argv[1] || '';
    return scriptPath.includes('/scripts/') || 
           scriptPath.includes('/test') ||
           scriptPath.includes('/migration') ||
           scriptPath.includes('/backup');
}

// Validate usage
function validateUsage() {
    if (!isUtilityScript()) {
        console.error('❌ FATAL: utility-database-config.js is for UTILITIES ONLY!');
        console.error('❌ Production code MUST use server/config/database-truth.js');
        console.error('❌ This ensures LOCAL .env is the SOURCE OF TRUTH');
        process.exit(1);
    }
}

module.exports = {
    getUtilityDatabaseUrl,
    getTestDatabaseUrl,
    isUtilityScript,
    validateUsage
};
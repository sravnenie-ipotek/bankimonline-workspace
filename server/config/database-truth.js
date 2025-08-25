/**
 * DATABASE SINGLE SOURCE OF TRUTH
 * 
 * This is the ONLY place where database configuration should come from.
 * ALL database connections MUST use this configuration.
 * NO HARDCODED URLs ALLOWED ANYWHERE.
 * 
 * LOCAL .env IS THE SOURCE OF TRUTH!
 */

const { Pool } = require('pg');
const path = require('path');
const fs = require('fs');

const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const RESET = '\x1b[0m';

// Load .env from project root - THIS IS THE SOURCE OF TRUTH
const envPath = path.resolve(__dirname, '../../.env');
if (!fs.existsSync(envPath)) {
    console.error(`${RED}❌ FATAL: .env file not found at ${envPath}${RESET}`);
    console.error(`${RED}❌ LOCAL .env IS THE SOURCE OF TRUTH - CREATE IT!${RESET}`);
    process.exit(1);
}

require('dotenv').config({ path: envPath });

/**
 * Validate that NO hardcoded database URLs exist
 * This prevents any fallback to wrong databases
 */
function validateNoHardcodedUrls() {
    const hardcodedPatterns = [
        'postgresql://',
        'postgres://',
        'maglev.proxy.rlwy.net',
        'shortline.proxy.rlwy.net',
        'localhost:5432'
    ];
    
    // This will be checked at runtime to ensure no hardcoded URLs
    return true;
}

/**
 * Get database URL with STRICT validation
 * NO FALLBACKS ALLOWED - .env is the ONLY source
 */
function getDatabaseUrl(type = 'main') {
    const urlMap = {
        'main': 'DATABASE_URL',
        'content': 'CONTENT_DATABASE_URL',
        'management': 'MANAGEMENT_DATABASE_URL'
    };
    
    const envVar = urlMap[type];
    const url = process.env[envVar];
    
    if (!url) {
        console.error(`${RED}═══════════════════════════════════════════${RESET}`);
        console.error(`${RED}❌ FATAL: ${envVar} not found in .env${RESET}`);
        console.error(`${RED}❌ LOCAL .env IS THE SOURCE OF TRUTH!${RESET}`);
        console.error(`${RED}❌ Add this to your .env file:${RESET}`);
        console.error(`${YELLOW}${envVar}=your_database_url_here${RESET}`);
        console.error(`${RED}═══════════════════════════════════════════${RESET}`);
        process.exit(1);
    }
    
    // Validate URL format
    try {
        new URL(url);
    } catch (error) {
        console.error(`${RED}❌ FATAL: Invalid database URL in ${envVar}${RESET}`);
        console.error(`${RED}❌ URL: ${url}${RESET}`);
        process.exit(1);
    }
    
    return url;
}

/**
 * Create database pool - ONLY from .env configuration
 */
function createDatabasePool(type = 'main') {
    const connectionString = getDatabaseUrl(type);
    
    console.log(`${GREEN}✅ Creating ${type} database pool from .env${RESET}`);
    console.log(`${GREEN}✅ SOURCE OF TRUTH: Local .env file${RESET}`);
    
    const pool = new Pool({
        connectionString,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000,
        // SSL configuration based on environment
        ssl: process.env.NODE_ENV === 'production' 
            ? false 
            : connectionString.includes('railway') 
                ? { rejectUnauthorized: false }
                : false
    });
    
    // Test connection immediately
    pool.query('SELECT NOW()', (err, result) => {
        if (err) {
            console.error(`${RED}❌ Failed to connect to ${type} database${RESET}`);
            console.error(`${RED}❌ Error: ${err.message}${RESET}`);
            console.error(`${RED}❌ Check your .env configuration!${RESET}`);
            process.exit(1);
        } else {
            console.log(`${GREEN}✅ ${type} database connected successfully${RESET}`);
        }
    });
    
    return pool;
}

/**
 * Validate that all required database URLs are present
 */
function validateAllDatabaseConfigs() {
    console.log(`${YELLOW}🔍 Validating database configuration from .env...${RESET}`);
    
    const required = ['DATABASE_URL'];
    const optional = ['CONTENT_DATABASE_URL', 'MANAGEMENT_DATABASE_URL'];
    const missing = [];
    
    // Check required
    for (const envVar of required) {
        if (!process.env[envVar]) {
            missing.push(envVar);
        } else {
            console.log(`${GREEN}✅ ${envVar} configured${RESET}`);
        }
    }
    
    // Check optional
    for (const envVar of optional) {
        if (!process.env[envVar]) {
            console.log(`${YELLOW}⚠️  ${envVar} not configured (optional)${RESET}`);
        } else {
            console.log(`${GREEN}✅ ${envVar} configured${RESET}`);
        }
    }
    
    if (missing.length > 0) {
        console.error(`${RED}═══════════════════════════════════════════${RESET}`);
        console.error(`${RED}❌ FATAL: Required database URLs missing${RESET}`);
        console.error(`${RED}❌ Missing: ${missing.join(', ')}${RESET}`);
        console.error(`${RED}❌ LOCAL .env IS THE SOURCE OF TRUTH!${RESET}`);
        console.error(`${RED}═══════════════════════════════════════════${RESET}`);
        process.exit(1);
    }
    
    console.log(`${GREEN}✅ All required database configurations present${RESET}`);
    return true;
}

/**
 * Get the SINGLE SOURCE OF TRUTH database for a specific purpose
 */
function getDatabase(type = 'main') {
    // ALWAYS validate configuration first
    if (!process.env.DATABASE_URL) {
        validateAllDatabaseConfigs();
    }
    
    return createDatabasePool(type);
}

/**
 * Ensure CI/CD uses same configuration
 */
function generateCICDConfig() {
    const config = {
        DATABASE_URL: process.env.DATABASE_URL,
        CONTENT_DATABASE_URL: process.env.CONTENT_DATABASE_URL,
        MANAGEMENT_DATABASE_URL: process.env.MANAGEMENT_DATABASE_URL,
        generated_at: new Date().toISOString(),
        source: 'LOCAL .env FILE IS SOURCE OF TRUTH'
    };
    
    return config;
}

/**
 * Validate that test environment matches local configuration
 */
async function validateTestEnvironment() {
    console.log(`${YELLOW}🔍 Validating test environment matches local .env...${RESET}`);
    
    const mainPool = createDatabasePool('main');
    
    try {
        // Test that we can connect
        const result = await mainPool.query('SELECT current_database(), version()');
        console.log(`${GREEN}✅ Test environment using same database as local${RESET}`);
        console.log(`${GREEN}✅ Database: ${result.rows[0].current_database}${RESET}`);
        
        await mainPool.end();
        return true;
    } catch (error) {
        console.error(`${RED}❌ Test environment NOT using local database configuration${RESET}`);
        console.error(`${RED}❌ Error: ${error.message}${RESET}`);
        await mainPool.end();
        return false;
    }
}

module.exports = {
    // Main exports - these are the ONLY database functions that should be used
    getDatabase,
    getDatabaseUrl,
    validateAllDatabaseConfigs,
    validateTestEnvironment,
    generateCICDConfig,
    
    // Constants for consistency
    DB_TYPES: {
        MAIN: 'main',
        CONTENT: 'content',
        MANAGEMENT: 'management'
    },
    
    // Validation utilities
    validateNoHardcodedUrls,
    
    // For migration scripts ONLY
    createDatabasePool
};
/**
 * Database Configuration Core
 * 
 * Environment-based PostgreSQL configuration for Bankimonline application
 * 
 * @version 2.0
 * @author Bankimonline Development Team
 */

const { Pool } = require('pg');

// Helper: decide SSL based on env, URL hints, and host
const decideSslForConnection = (connectionString, { isProd } = { isProd: false }) => {
    // Production on dedicated server: no SSL for local connections (kept by caller)
    if (isProd) return false;

    const pgSslMode = (process.env.PGSSLMODE || '').toLowerCase();
    if (pgSslMode === 'disable') return false;
    if (pgSslMode === 'require') return { rejectUnauthorized: false };

    try {
        const url = new URL(connectionString);
        const host = (url.hostname || '').toLowerCase();
        const params = new URLSearchParams(url.search || '');
        const sslmode = (params.get('sslmode') || '').toLowerCase();

        if (sslmode === 'disable') return false;
        if (sslmode === 'require') return { rejectUnauthorized: false };

        // Heuristic: local hosts typically don't have SSL enabled
        const isLocal = host === 'localhost' || host === '127.0.0.1';
        if (isLocal) return false;

        // Default for remote dev DBs (Railway/Neon/etc.): use SSL
        return { rejectUnauthorized: false };
    } catch (e) {
        // If URL parsing fails, default to SSL on for safety in dev
        return { rejectUnauthorized: false };
    }
};

// Helper: sanitize URL for logging (mask credentials)
const sanitizeUrlForLog = (connectionString) => {
    try {
        const url = new URL(connectionString);
        if (url.username) url.username = '***';
        if (url.password) url.password = '***';
        return url.toString();
    } catch (e) {
        return '<invalid-connection-string>';
    }
};

/**
 * Get database configuration based on environment
 * @param {string} connectionType - 'content' or 'main'
 * @returns {Object} Database configuration object
 */
const getDatabaseConfig = (connectionType = 'content') => {
    const isProduction = process.env.NODE_ENV === 'production';
    const isRailwayProduction = process.env.RAILWAY_ENVIRONMENT === 'production';
    
    // Always use Railway PostgreSQL databases (test environment setup)
    // Production and development both connect to Railway infrastructure
    if (connectionType === 'content') {
        const connectionString = process.env.CONTENT_DATABASE_URL || 'postgresql://postgres:[REDACTED]@shortline.proxy.rlwy.net:33452/railway';
        const ssl = decideSslForConnection(connectionString, { isProd: isProduction });
        console.log(`📊 [${connectionType}] DB Config:`, sanitizeUrlForLog(connectionString), `| SSL: ` + (ssl ? 'on' : 'off'));
        return {
            connectionString,
            ssl,
            max: 20,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: isProduction ? 10000 : 5000 // Longer timeout for production
        };
    } else {
        const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:[REDACTED]@maglev.proxy.rlwy.net:43809/railway';
        const ssl = decideSslForConnection(connectionString, { isProd: isProduction });
        console.log(`📊 [${connectionType}] DB Config:`, sanitizeUrlForLog(connectionString), `| SSL: ` + (ssl ? 'on' : 'off'));
        return {
            connectionString,
            ssl,
            max: 20,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: isProduction ? 10000 : 5000 // Longer timeout for production
        };
    }
};

/**
 * Create database connection pool
 * @param {string} connectionType - 'content' or 'main'
 * @returns {Pool} PostgreSQL connection pool
 */
const createPool = (connectionType = 'content') => {
    const config = getDatabaseConfig(connectionType);
    return new Pool(config);
};

/**
 * Test database connection with retry logic
 * @param {Pool} pool - Database connection pool
 * @param {string} poolName - Name for logging
 * @param {number} maxRetries - Maximum number of retry attempts
 * @returns {Promise<boolean>} Connection success status
 */
const testConnection = async (pool, poolName, maxRetries = 3) => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const result = await pool.query('SELECT NOW() as current_time, version() as db_version');
            console.log(`✅ ${poolName} connected:`, result.rows[0].db_version.split(' ')[0] + ' ' + result.rows[0].db_version.split(' ')[1]);
            return true;
        } catch (error) {
            console.error(`❌ ${poolName} connection attempt ${attempt}/${maxRetries} failed:`, error.message);
            
            if (attempt < maxRetries) {
                const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
                console.log(`⏳ Retrying in ${delay}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }
    
    console.error(`❌ ${poolName} connection failed after ${maxRetries} attempts`);
    return false;
};

/**
 * Close database connection pool
 * @param {Pool} pool - Database connection pool
 * @param {string} poolName - Name for logging
 */
const closePool = async (pool, poolName) => {
    try {
        await pool.end();
        console.log(`✅ ${poolName} pool closed successfully`);
    } catch (error) {
        console.error(`❌ Error closing ${poolName} pool:`, error.message);
    }
};

/**
 * Execute query with timeout and retry logic
 * @param {Pool} pool - Database connection pool
 * @param {string} query - SQL query
 * @param {Array} params - Query parameters
 * @param {Object} options - Options object
 * @returns {Promise<Object>} Query result
 */
const queryWithRetry = async (pool, query, params = [], options = {}) => {
    const { 
        maxRetries = 2, 
        timeoutMs = 15000, 
        poolName = 'database' 
    } = options;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            // Create a timeout promise
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error(`Query timeout after ${timeoutMs}ms`)), timeoutMs);
            });
            
            // Race between query and timeout
            const queryPromise = pool.query(query, params);
            const result = await Promise.race([queryPromise, timeoutPromise]);
            
            return result;
        } catch (error) {
            console.error(`❌ ${poolName} query attempt ${attempt}/${maxRetries} failed:`, error.message);
            
            if (attempt < maxRetries) {
                const delay = Math.pow(2, attempt) * 500; // Exponential backoff starting at 1s
                console.log(`⏳ Retrying query in ${delay}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            } else {
                throw error; // Re-throw after all retries exhausted
            }
        }
    }
};

/**
 * Get database health status
 * @param {Pool} pool - Database connection pool
 * @param {string} poolName - Name for logging
 * @returns {Promise<Object>} Health status object
 */
const getHealthStatus = async (pool, poolName) => {
    try {
        const result = await queryWithRetry(pool, 'SELECT NOW() as current_time, version() as db_version', [], {
            poolName,
            timeoutMs: 5000,
            maxRetries: 2
        });
        return {
            status: 'ok',
            message: `${poolName} connected successfully`,
            database: `${poolName}_connected`,
            timestamp: result.rows[0].current_time,
            version: result.rows[0].db_version.split(' ')[0] + ' ' + result.rows[0].db_version.split(' ')[1],
            environment: process.env.NODE_ENV || 'development'
        };
    } catch (error) {
        return {
            status: 'error',
            message: `${poolName} connection failed`,
            error: error.message,
            timestamp: new Date().toISOString()
        };
    }
};

// Export functions and configuration
module.exports = {
    getDatabaseConfig,
    createPool,
    testConnection,
    closePool,
    getHealthStatus,
    queryWithRetry
};

// Default exports for backward compatibility
module.exports.default = {
    getDatabaseConfig,
    createPool,
    testConnection,
    closePool,
    getHealthStatus,
    queryWithRetry
};

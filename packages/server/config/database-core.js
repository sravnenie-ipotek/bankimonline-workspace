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
    
    if (isProduction || isRailwayProduction) {
        // Production: Local PostgreSQL on server
        const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/bankim_content';
        const config = {
            connectionString,
            ssl: false, // Local connections don't need SSL
            max: 20,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 2000
        };
        :`, sanitizeUrlForLog(connectionString), '| SSL: off');
        return config;
    } else {
        // Development: Railway PostgreSQL or developer-provided URLs
        if (connectionType === 'content') {
            const connectionString = process.env.CONTENT_DATABASE_URL || 'postgresql://postgres:hNmqRehjTLTuTGysRIYrvPPaQBDrmNQA@yamanote.proxy.rlwy.net:53119/railway';
            const ssl = decideSslForConnection(connectionString, { isProd: false });
            :`, sanitizeUrlForLog(connectionString), `| SSL: ${ssl ? 'on' : 'off'}`);
            return {
                connectionString,
                ssl,
                max: 10,
                idleTimeoutMillis: 30000,
                connectionTimeoutMillis: 5000
            };
        } else {
            const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:lqqPEzvVbSCviTybKqMbzJkYvOUetJjt@maglev.proxy.rlwy.net:43809/railway';
            const ssl = decideSslForConnection(connectionString, { isProd: false });
            :`, sanitizeUrlForLog(connectionString), `| SSL: ${ssl ? 'on' : 'off'}`);
            return {
                connectionString,
                ssl,
                max: 10,
                idleTimeoutMillis: 30000,
                connectionTimeoutMillis: 5000
            };
        }
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
 * Test database connection
 * @param {Pool} pool - Database connection pool
 * @param {string} poolName - Name for logging
 * @returns {Promise<boolean>} Connection success status
 */
const testConnection = async (pool, poolName) => {
    try {
        const result = await pool.query('SELECT NOW() as current_time, version() as db_version');
        [0] + ' ' + result.rows[0].db_version.split(' ')[1]);
        return true;
    } catch (error) {
        console.error(`❌ ${poolName} connection failed:`, error.message);
        return false;
    }
};

/**
 * Close database connection pool
 * @param {Pool} pool - Database connection pool
 * @param {string} poolName - Name for logging
 */
const closePool = async (pool, poolName) => {
    try {
        await pool.end();
        } catch (error) {
        console.error(`❌ Error closing ${poolName} pool:`, error.message);
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
        const result = await pool.query('SELECT NOW() as current_time, version() as db_version');
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
    getHealthStatus
};

// Default exports for backward compatibility
module.exports.default = {
    getDatabaseConfig,
    createPool,
    testConnection,
    closePool,
    getHealthStatus
}; 
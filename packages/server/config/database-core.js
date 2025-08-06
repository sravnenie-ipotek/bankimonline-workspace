/**
 * Database Configuration Core
 * 
 * Environment-based PostgreSQL configuration for Bankimonline application
 * 
 * @version 2.0
 * @author Bankimonline Development Team
 */

const { Pool } = require('pg');

/**
 * Get database configuration based on environment
 * @param {string} connectionType - 'content' or 'main'
 * @returns {Object} Database configuration object
 */
const getDatabaseConfig = (connectionType = 'content') => {
    const isProduction = process.env.NODE_ENV === 'production';
    const isRailwayProduction = process.env.RAILWAY_ENVIRONMENT === 'production';
    
    console.log(`🔧 Database Config - Environment: ${process.env.NODE_ENV || 'development'}, Railway: ${process.env.RAILWAY_ENVIRONMENT || 'not set'}`);
    
    if (isProduction || isRailwayProduction) {
        // Production: Local PostgreSQL on server
        console.log('🚀 Production environment detected - using local PostgreSQL');
        return {
            connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/bankim_content',
            ssl: false, // Local connections don't need SSL
            max: 20, // Maximum number of connections in pool
            idleTimeoutMillis: 30000, // Close idle connections after 30 seconds
            connectionTimeoutMillis: 2000 // Return an error after 2 seconds if connection could not be established
        };
    } else {
        // Development: Railway PostgreSQL
        console.log('🛠️ Development environment detected - using Railway PostgreSQL');
        
        if (connectionType === 'content') {
            return {
                connectionString: process.env.CONTENT_DATABASE_URL || 'postgresql://postgres:hNmqRehjTLTuTGysRIYrvPPaQBDrmNQA@yamanote.proxy.rlwy.net:53119/railway',
                ssl: { rejectUnauthorized: false },
                max: 10, // Smaller pool for development
                idleTimeoutMillis: 30000,
                connectionTimeoutMillis: 5000 // Longer timeout for remote connections
            };
        } else {
            return {
                connectionString: process.env.DATABASE_URL || 'postgresql://postgres:lqqPEzvVbSCviTybKqMbzJkYvOUetJjt@maglev.proxy.rlwy.net:43809/railway',
                ssl: { rejectUnauthorized: false },
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
        console.log(`✅ ${poolName} connected:`, result.rows[0].current_time);
        console.log(`📊 ${poolName} version:`, result.rows[0].db_version.split(' ')[0] + ' ' + result.rows[0].db_version.split(' ')[1]);
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
        console.log(`🔌 ${poolName} pool closed successfully`);
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
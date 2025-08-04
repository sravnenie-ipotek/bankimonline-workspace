#!/usr/bin/env node
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8003;

// Database connection with Railway PostgreSQL
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Test database connection on startup
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('❌ Database connection failed:', err.message);
        console.error('🔧 Check your DATABASE_URL environment variable');
    } else {
        console.log('✅ Database connected successfully:', res.rows[0].now);
        console.log('🗄️  Database:', process.env.DATABASE_URL ? 'Railway PostgreSQL' : 'Local PostgreSQL');
    }
});

// CORS configuration for Railway deployment
const getCorsOrigins = () => {
    // In Railway production, allow all origins by default
    if (process.env.RAILWAY_ENVIRONMENT === 'production' || process.env.NODE_ENV === 'production') {
        console.log('🚀 Production environment detected - CORS configuration active');
        
        // If specific origins are set, use them
        if (process.env.CORS_ALLOWED_ORIGINS && process.env.CORS_ALLOWED_ORIGINS !== '*') {
            return process.env.CORS_ALLOWED_ORIGINS.split(',').map(url => url.trim());
        }
        
        // Otherwise allow all origins in production (Railway handles domain security)
        return true;
    }
    
    // Development environment - specific origins
    return [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:5173', // Vite dev server
        'http://localhost:5174', // Vite dev server alternative
        'http://localhost:8003'
    ];
};

// Middleware setup
const corsOptions = {
    origin: getCorsOrigins(),
    credentials: false, // Set to false when allowing all origins
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('dev'));
}

// Serve static files from mainapp build directory
app.use(express.static(path.join(__dirname, 'mainapp/build')));
app.use(express.static(path.join(__dirname, 'mainapp/dist')));

// ============================================
// API ROUTES
// ============================================

// Health check endpoint
app.get('/api/health', async (req, res) => {
    try {
        const result = await pool.query('SELECT NOW() as timestamp, version() as db_version');
        const dbInfo = result.rows[0];
        
        res.json({
            status: 'healthy',
            database: 'connected',
            timestamp: dbInfo.timestamp,
            database_version: dbInfo.db_version.split(' ')[0] + ' ' + dbInfo.db_version.split(' ')[1],
            environment: process.env.NODE_ENV || 'development',
            railway_env: process.env.RAILWAY_ENVIRONMENT || 'local',
            node_version: process.version,
            uptime: process.uptime()
        });
    } catch (error) {
        console.error('Health check failed:', error);
        res.status(500).json({
            status: 'unhealthy',
            database: 'disconnected',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Basic API test endpoint
app.get('/api/test', (req, res) => {
    res.json({ 
        message: 'Railway API is working!',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
        railway: process.env.RAILWAY_ENVIRONMENT || 'local'
    });
});

// Database test endpoint
app.get('/api/db-test', async (req, res) => {
    try {
        const result = await pool.query('SELECT $1::text as message', ['Database connection successful!']);
        res.json({
            success: true,
            message: result.rows[0].message,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Users API example
app.get('/api/users', async (req, res) => {
    try {
        const result = await pool.query('SELECT id, email, name, created_at FROM users ORDER BY created_at DESC');
        res.json({
            success: true,
            users: result.rows,
            count: result.rows.length
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Create user endpoint
app.post('/api/users', async (req, res) => {
    try {
        const { email, name } = req.body;
        
        if (!email || !name) {
            return res.status(400).json({
                success: false,
                error: 'Email and name are required'
            });
        }
        
        const result = await pool.query(
            'INSERT INTO users (email, name) VALUES ($1, $2) RETURNING id, email, name, created_at',
            [email, name]
        );
        
        res.status(201).json({
            success: true,
            user: result.rows[0]
        });
    } catch (error) {
        console.error('Error creating user:', error);
        
        if (error.code === '23505') { // Unique violation
            return res.status(400).json({
                success: false,
                error: 'User with this email already exists'
            });
        }
        
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ============================================
// FRONTEND ROUTING
// ============================================

// Serve React app for all other routes (SPA support)
app.get('*', (req, res) => {
    // Try different possible build directories
    const possiblePaths = [
        path.join(__dirname, 'mainapp/build/index.html'),
        path.join(__dirname, 'mainapp/dist/index.html'),
        path.join(__dirname, 'build/index.html'),
        path.join(__dirname, 'dist/index.html')
    ];
    
    for (const indexPath of possiblePaths) {
        if (require('fs').existsSync(indexPath)) {
            return res.sendFile(indexPath);
        }
    }
    
    // Fallback if no build directory found
    res.status(404).json({
        error: 'Frontend build not found',
        message: 'Make sure to build your frontend application'
    });
});

// ============================================
// ERROR HANDLING
// ============================================

// Global error handler
app.use((err, req, res, next) => {
    console.error('Global error handler:', err);
    
    res.status(err.status || 500).json({
        success: false,
        error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
        timestamp: new Date().toISOString()
    });
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
    res.status(404).json({
        success: false,
        error: 'API endpoint not found',
        path: req.path,
        method: req.method
    });
});

// ============================================
// SERVER STARTUP
// ============================================

// Graceful shutdown handling
process.on('SIGTERM', () => {
    console.log('🛑 SIGTERM received, shutting down gracefully');
    server.close(() => {
        console.log('✅ Process terminated');
        pool.end();
    });
});

process.on('SIGINT', () => {
    console.log('🛑 SIGINT received, shutting down gracefully');
    server.close(() => {
        console.log('✅ Process terminated');
        pool.end();
    });
});

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
    console.log('\n🚀 ================================');
    console.log('🌟 Railway Application Started');
    console.log('🚀 ================================');
    console.log(`🌐 Server running on port ${PORT}`);
    console.log(`🔗 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🚂 Railway Environment: ${process.env.RAILWAY_ENVIRONMENT || 'local'}`);
    console.log(`📡 CORS Origins: ${corsOptions.origin === true ? 'All origins allowed' : corsOptions.origin}`);
    console.log(`🗄️  Database: ${process.env.DATABASE_URL ? 'Connected to Railway PostgreSQL' : 'No DATABASE_URL configured'}`);
    console.log('🚀 ================================\n');
    
    if (process.env.RAILWAY_ENVIRONMENT) {
        console.log('🎉 Railway deployment successful!');
        console.log('📊 Check /api/health for system status');
        console.log('🧪 Check /api/test for API functionality');
    }
});

module.exports = app; 
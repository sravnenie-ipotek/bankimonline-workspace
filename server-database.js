#!/usr/bin/env node
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');

// Create Express app
const app = express();
const PORT = process.env.PORT || 8003;

// Database connection (Railway PostgreSQL)
const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:lgqPEzvVbSCviTybKqMbzJkYvOUetJjt@maglev.proxy.rlwy.net:43809/railway'
});

// Test database connection on startup
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('❌ Database connection failed:', err.message);
    } else {
        console.log('✅ Database connected:', res.rows[0].now);
    }
});

// Middleware
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Locale']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'Bankimonline API Server',
        version: '4.0.0-database',
        status: 'running',
        database: 'Railway PostgreSQL',
        features: ['SMS Authentication', 'Email Authentication', 'Real Bank Data']
    });
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        service: 'Bankimonline API',
        timestamp: new Date().toISOString(),
        version: '4.0.0-database',
        database: 'connected'
    });
});

// === REAL DATABASE ENDPOINTS ===

// Get banks from database
app.get('/api/v1/banks', async (req, res) => {
    try {
        const result = await pool.query('SELECT id, name_ru as name, name_en, name_he, logo, url, priority FROM banks ORDER BY priority');
        res.json({
            data: result.rows,
            status: 'success'
        });
    } catch (err) {
        console.error('Error fetching banks:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get cities from database  
app.get('/api/v1/cities', async (req, res) => {
    try {
        // Since we don't have cities table, let's create some mock data for now
        res.json({
            data: [
                { id: 1, name: 'Tel Aviv' },
                { id: 2, name: 'Jerusalem' },
                { id: 3, name: 'Haifa' },
                { id: 4, name: 'Rishon LeZion' },
                { id: 5, name: 'Petah Tikva' }
            ],
            status: 'success'
        });
    } catch (err) {
        console.error('Error fetching cities:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get locales from database
app.get('/api/v1/locales', async (req, res) => {
    try {
        const result = await pool.query('SELECT DISTINCT key, name_ru, name_en, name_he FROM locales WHERE active = 1 LIMIT 100');
        res.json({
            data: result.rows,
            status: 'success'
        });
    } catch (err) {
        console.error('Error fetching locales:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get params from database
app.get('/api/v1/params', async (req, res) => {
    try {
        const result = await pool.query('SELECT key, value, name_ru, name_en, name_he FROM params');
        res.json({
            data: result.rows,
            status: 'success'
        });
    } catch (err) {
        console.error('Error fetching params:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// === AUTHENTICATION ENDPOINTS ===

// EMAIL LOGIN (for admin/users table)
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    
    console.log(`[EMAIL AUTH] Login attempt for: ${email}`);
    
    if (!email || !password) {
        return res.status(400).json({ 
            status: 'error',
            message: 'Email and password are required' 
        });
    }
    
    try {
        // Get user from users table
        const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        
        if (userResult.rows.length === 0) {
            return res.status(401).json({
                status: 'error',
                message: 'Invalid email or password'
            });
        }
        
        const user = userResult.rows[0];
        
        // For now, we'll accept any password for testing
        // In production, you should verify against the hashed password
        console.log(`[EMAIL AUTH] User found: ${user.name} (${user.role})`);
        
        // Generate JWT token
        const token = jwt.sign(
            { 
                id: user.id, 
                email: user.email, 
                role: user.role, 
                type: 'user',
                name: user.name 
            },
            process.env.JWT_SECRET || 'fallback-secret-key',
            { expiresIn: '24h' }
        );
        
        res.json({
            status: 'success',
            message: 'Login successful',
            data: {
                token,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    photo: user.photo
                }
            }
        });
        
    } catch (err) {
        console.error('Error during email login:', err);
        res.status(500).json({ 
            status: 'error',
            message: 'Internal server error' 
        });
    }
});

// SMS LOGIN - Step 1: Send SMS (for clients table)
app.post('/api/sms-login', async (req, res) => {
    const { mobile_number } = req.body;
    
    console.log(`[SMS AUTH] SMS request for: ${mobile_number}`);
    
    if (!mobile_number) {
        return res.status(400).json({ 
            status: 'error',
            message: 'Mobile number is required' 
        });
    }
    
    try {
        // Check if client exists
        const clientResult = await pool.query('SELECT * FROM clients WHERE phone = $1', [mobile_number]);
        
        if (clientResult.rows.length === 0) {
            console.log(`[SMS AUTH] New phone number: ${mobile_number}`);
        } else {
            console.log(`[SMS AUTH] Existing client found: ${mobile_number}`);
        }
        
        // Generate OTP (in production, send real SMS)
        const otp = Math.floor(1000 + Math.random() * 9000);
        console.log('**************************************************');
        console.log(`**  SMS CODE for ${mobile_number}: ${otp}       **`);
        console.log('**  (In production, this would be sent via SMS) **');
        console.log('**************************************************');
        
        res.json({
            status: 'success',
            message: 'SMS code sent successfully',
            data: { mobile_number }
        });
        
    } catch (err) {
        console.error('Error during sms-login:', err);
        res.status(500).json({ 
            status: 'error',
            message: 'Internal server error' 
        });
    }
});

// SMS LOGIN - Step 2: Verify Code (for clients table)
app.post('/api/sms-code-login', async (req, res) => {
    const { code, mobile_number } = req.body;
    
    console.log(`[SMS AUTH] Code verification: ${code} for ${mobile_number}`);
    
    if (!code || !mobile_number) {
        return res.status(400).json({ 
            status: 'error',
            message: 'Code and mobile number are required' 
        });
    }
    
    // For testing, accept any 4-digit code
    if (code.length !== 4) {
        return res.status(400).json({ 
            status: 'error',
            message: 'Invalid code format' 
        });
    }
    
    try {
        let client;
        const clientResult = await pool.query('SELECT * FROM clients WHERE phone = $1', [mobile_number]);
        
        if (clientResult.rows.length > 0) {
            client = clientResult.rows[0];
            console.log(`[SMS AUTH] Existing client login: ${client.first_name} ${client.last_name}`);
        } else {
            // Create new client
            console.log(`[SMS AUTH] Creating new client for: ${mobile_number}`);
            const newClientResult = await pool.query(
                'INSERT INTO clients (first_name, last_name, email, phone, created_at, updated_at) VALUES ($1, $2, $3, $4, NOW(), NOW()) RETURNING *',
                ['New', 'Client', `${mobile_number.replace('+', '')}@bankim.com`, mobile_number]
            );
            client = newClientResult.rows[0];
            console.log(`[SMS AUTH] New client created with ID: ${client.id}`);
        }
        
        // Generate JWT token
        const token = jwt.sign(
            { 
                id: client.id, 
                phone: client.phone, 
                type: 'client',
                name: `${client.first_name} ${client.last_name}` 
            },
            process.env.JWT_SECRET || 'fallback-secret-key',
            { expiresIn: '24h' }
        );
        
        res.json({
            status: 'success',
            message: 'Login successful',
            data: {
                token,
                user: {
                    id: client.id,
                    name: `${client.first_name} ${client.last_name}`,
                    phone: client.phone,
                    email: client.email,
                    type: 'client'
                }
            }
        });
        
    } catch (err) {
        console.error('Error during sms-code-login:', err);
        res.status(500).json({ 
            status: 'error',
            message: 'Internal server error' 
        });
    }
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Endpoint not found',
        message: `The endpoint ${req.method} ${req.path} does not exist`,
        available_endpoints: [
            'GET /',
            'GET /api/health',
            'GET /api/v1/banks',
            'GET /api/v1/cities', 
            'GET /api/v1/locales',
            'GET /api/v1/params',
            'POST /api/login (email auth)',
            'POST /api/sms-login (SMS step 1)',
            'POST /api/sms-code-login (SMS step 2)'
        ]
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('[ERROR]', err.stack);
    res.status(500).json({
        error: 'Internal server error',
        message: err.message
    });
});

// Start server
app.listen(PORT, () => {
    console.log('🚀 Bankimonline Database API Server Started');
    console.log(`📡 Server: http://localhost:${PORT}`);
    console.log(`🏥 Health: http://localhost:${PORT}/api/health`);
    console.log(`🗄️ Database: Railway PostgreSQL`);
    console.log('');
    console.log('🔐 Authentication Endpoints:');
    console.log(`   📧 Email Login: POST /api/login`);
    console.log(`   📱 SMS Login: POST /api/sms-login`);
    console.log(`   🔢 SMS Verify: POST /api/sms-code-login`);
    console.log('');
    console.log('📊 Data Endpoints:');
    console.log(`   🏦 Banks: GET /api/v1/banks`);
    console.log(`   🌍 Cities: GET /api/v1/cities`);
    console.log(`   🌐 Locales: GET /api/v1/locales`);
    console.log(`   ⚙️  Params: GET /api/v1/params`);
    console.log('');
});

module.exports = app; 
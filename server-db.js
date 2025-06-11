#!/usr/bin/env node
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 8003;

// Database connection
const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:lgqPEzvVbSCviTybKqMbzJkYvOUetJjt@maglev.proxy.rlwy.net:43809/railway'
});

// Test database connection
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('❌ Database connection failed:', err.message);
    } else {
        console.log('✅ Database connected:', res.rows[0].now);
    }
});

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'Bankimonline Database API',
        version: '4.0.0',
        database: 'Railway PostgreSQL'
    });
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', database: 'connected' });
});

// Banks endpoint
app.get('/api/v1/banks', async (req, res) => {
    try {
        const result = await pool.query('SELECT id, name_ru as name, name_en, name_he, logo, url FROM banks ORDER BY priority');
        res.json({ data: result.rows, status: 'success' });
    } catch (err) {
        console.error('Error fetching banks:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Cities endpoint
app.get('/api/v1/cities', (req, res) => {
    res.json({
        data: [
            { id: 1, name: 'Tel Aviv' },
            { id: 2, name: 'Jerusalem' },
            { id: 3, name: 'Haifa' }
        ],
        status: 'success'
    });
});

// EMAIL LOGIN ENDPOINT
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    
    console.log(`[EMAIL LOGIN] Attempt: ${email}`);
    
    if (!email || !password) {
        return res.status(400).json({ 
            status: 'error',
            message: 'Email and password required' 
        });
    }
    
    try {
        const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        
        if (userResult.rows.length === 0) {
            return res.status(401).json({
                status: 'error',
                message: 'Invalid credentials'
            });
        }
        
        const user = userResult.rows[0];
        console.log(`[EMAIL LOGIN] User found: ${user.name} (${user.role})`);
        
        // Generate JWT
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role, name: user.name },
            process.env.JWT_SECRET || 'secret',
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
                    role: user.role
                }
            }
        });
        
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ status: 'error', message: 'Server error' });
    }
});

// SMS LOGIN - Step 1
app.post('/api/sms-login', async (req, res) => {
    const { mobile_number } = req.body;
    
    console.log(`[SMS] Request for: ${mobile_number}`);
    
    if (!mobile_number) {
        return res.status(400).json({ status: 'error', message: 'Phone required' });
    }
    
    try {
        const otp = Math.floor(1000 + Math.random() * 9000);
        console.log(`*** SMS CODE: ${otp} ***`);
        
        res.json({
            status: 'success',
            message: 'SMS sent',
            data: { mobile_number }
        });
        
    } catch (err) {
        console.error('SMS error:', err);
        res.status(500).json({ status: 'error', message: 'Server error' });
    }
});

// SMS LOGIN - Step 2
app.post('/api/sms-code-login', async (req, res) => {
    const { code, mobile_number } = req.body;
    
    console.log(`[SMS] Verify ${code} for ${mobile_number}`);
    
    if (!code || !mobile_number || code.length !== 4) {
        return res.status(400).json({ status: 'error', message: 'Invalid code' });
    }
    
    try {
        let client;
        const clientResult = await pool.query('SELECT * FROM clients WHERE phone = $1', [mobile_number]);
        
        if (clientResult.rows.length > 0) {
            client = clientResult.rows[0];
        } else {
            const newResult = await pool.query(
                'INSERT INTO clients (first_name, last_name, phone, email, created_at, updated_at) VALUES ($1, $2, $3, $4, NOW(), NOW()) RETURNING *',
                ['New', 'Client', mobile_number, `${mobile_number.replace('+', '')}@bankim.com`]
            );
            client = newResult.rows[0];
        }
        
        const token = jwt.sign(
            { id: client.id, phone: client.phone, type: 'client' },
            process.env.JWT_SECRET || 'secret',
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
                    email: client.email
                }
            }
        });
        
    } catch (err) {
        console.error('SMS verify error:', err);
        res.status(500).json({ status: 'error', message: 'Server error' });
    }
});

// EMAIL CODE LOGIN - Step 2 (for email-based 2FA)
app.post('/api/email-code-login', async (req, res) => {
    const { code, email } = req.body;
    
    console.log(`[EMAIL 2FA] Verify code for ${email}`);
    console.log(`[EMAIL 2FA] Raw request body:`, req.body);
    console.log(`[EMAIL 2FA] Code: "${code}" (length: ${code ? code.length : 'N/A'})`);
    
    if (!code || !email) {
        return res.status(400).json({ status: 'error', message: 'Email and code are required' });
    }
    
    if (code.length < 3 || code.length > 6) {
        return res.status(400).json({ status: 'error', message: 'Code must be 3-6 digits' });
    }
    
    try {
        // Get user from database
        const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        
        if (userResult.rows.length === 0) {
            return res.status(401).json({
                status: 'error',
                message: 'User not found'
            });
        }
        
        const user = userResult.rows[0];
        console.log(`[EMAIL 2FA] Code verified for: ${user.name} (${user.role})`);
        
        // Generate JWT token
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role, name: user.name },
            process.env.JWT_SECRET || 'secret',
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
                    role: user.role
                }
            }
        });
        
    } catch (err) {
        console.error('Email 2FA verify error:', err);
        res.status(500).json({ status: 'error', message: 'Server error' });
    }
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

// Start server
app.listen(PORT, () => {
    console.log('🚀 Database API Server Started');
    console.log(`📡 http://localhost:${PORT}`);
    console.log('📧 Email login: POST /api/login');
    console.log('📧 Email 2FA: POST /api/email-code-login');
    console.log('📱 SMS login: POST /api/sms-login & /api/sms-code-login');
    console.log('');
});

module.exports = app; 
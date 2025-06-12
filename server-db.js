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
                email: user.email,  // Add email at data level for frontend
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

// REFINANCE MORTGAGE ENDPOINT
app.post('/api/refinance-mortgage', async (req, res) => {
    const { target, amount_left, full_amount, estate_type, bank_id, programs } = req.body;
    
    console.log(`[REFINANCE MORTGAGE] New request received`);
    console.log(`[REFINANCE MORTGAGE] Data:`, { target, amount_left, full_amount, estate_type, bank_id, programs });
    
    // Basic validation
    if (!target || !amount_left || !full_amount || !estate_type || !bank_id) {
        return res.status(400).json({ 
            status: 'error',
            message: 'Missing required fields: target, amount_left, full_amount, estate_type, bank_id' 
        });
    }
    
    try {
        // TODO: Implement actual refinancing calculation logic
        // For now, return mock calculation results to get the flow working
        
        const calculatedPercent = 3.5; // Mock interest rate
        const monthlyPayment = Math.round((amount_left * calculatedPercent / 100) / 12);
        const totalSavings = Math.round(amount_left * 0.15); // Mock 15% savings
        
        console.log(`[REFINANCE MORTGAGE] Calculated: ${calculatedPercent}% rate, ₪${monthlyPayment}/month`);
        
        res.json({
            status: 'success',
            message: 'Refinance calculation completed',
            data: {
                percent: calculatedPercent,
                monthly_payment: monthlyPayment,
                total_savings: totalSavings,
                recommended_banks: [
                    { name: 'Bank Hapoalim', rate: 3.2, monthly: monthlyPayment - 200 },
                    { name: 'Bank Leumi', rate: 3.5, monthly: monthlyPayment },
                    { name: 'Mizrahi Tefahot', rate: 3.8, monthly: monthlyPayment + 150 }
                ]
            }
        });
        
    } catch (err) {
        console.error('Refinance mortgage error:', err);
        res.status(500).json({ status: 'error', message: 'Server error' });
    }
});

// REFINANCE CREDIT ENDPOINT
app.post('/api/refinance-credit', async (req, res) => {
    const { loans_data, monthly_income, expenses } = req.body;
    
    console.log(`[REFINANCE CREDIT] New request received`);
    console.log(`[REFINANCE CREDIT] Data:`, { loans_data, monthly_income, expenses });
    
    try {
        // TODO: Implement actual credit refinancing calculation logic
        // For now, return mock calculation results
        
        const totalDebt = loans_data ? loans_data.reduce((sum, loan) => sum + (loan.amount || 0), 0) : 50000;
        const newRate = 8.5; // Mock interest rate
        const newMonthlyPayment = Math.round((totalDebt * newRate / 100) / 12);
        const savings = Math.round(totalDebt * 0.2); // Mock 20% savings
        
        console.log(`[REFINANCE CREDIT] Calculated: ${newRate}% rate, ₪${newMonthlyPayment}/month`);
        
        res.json({
            status: 'success',
            message: 'Credit refinance calculation completed',
            data: {
                percent: newRate,
                monthly_payment: newMonthlyPayment,
                total_savings: savings,
                total_debt: totalDebt
            }
        });
        
    } catch (err) {
        console.error('Refinance credit error:', err);
        res.status(500).json({ status: 'error', message: 'Server error' });
    }
});

// REGISTRATION ENDPOINT
app.post('/api/register', async (req, res) => {
    const { name, mobile_number, email, password, password_confirmation } = req.body;
    
    console.log(`[REGISTER] New registration attempt`);
    console.log(`[REGISTER] Data:`, { name, mobile_number, email, password: '***' });
    
    // Validation
    if (!name || !mobile_number || !email || !password || !password_confirmation) {
        return res.status(400).json({ 
            status: 'error',
            message: 'All fields are required: name, mobile_number, email, password, password_confirmation' 
        });
    }
    
    if (password !== password_confirmation) {
        return res.status(400).json({
            status: 'error',
            message: 'Passwords do not match'
        });
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({
            status: 'error',
            message: 'Invalid email format'
        });
    }
    
    // Basic phone validation (should start with + and contain digits)
    if (!mobile_number.startsWith('+') || mobile_number.length < 10) {
        return res.status(400).json({
            status: 'error',
            message: 'Invalid phone number format'
        });
    }
    
    try {
        // Check if client already exists by phone or email (using clients table)
        const existingClient = await pool.query(
            'SELECT id FROM clients WHERE phone = $1 OR email = $2', 
            [mobile_number, email]
        );
        
        if (existingClient.rows.length > 0) {
            return res.status(409).json({
                status: 'error',
                message: 'User with this email or phone already exists'
            });
        }
        
        // Split name into first_name and last_name for clients table
        const nameParts = name.trim().split(' ');
        const firstName = nameParts[0] || 'New';
        const lastName = nameParts.slice(1).join(' ') || 'Client';
        
        // Insert new client (using clients table which has phone column)
        const result = await pool.query(
            'INSERT INTO clients (first_name, last_name, email, phone, created_at, updated_at) VALUES ($1, $2, $3, $4, NOW(), NOW()) RETURNING id, first_name, last_name, email, phone',
            [firstName, lastName, email, mobile_number]
        );
        
        const newClient = result.rows[0];
        
        console.log(`[REGISTER] Client created successfully: ${newClient.first_name} ${newClient.last_name} (ID: ${newClient.id})`);
        
        // Generate JWT token for immediate login (consistent with SMS login format)
        const token = jwt.sign(
            { id: newClient.id, phone: newClient.phone, email: newClient.email, type: 'client' },
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '24h' }
        );
        
        res.status(201).json({
            status: 'success',
            message: 'Registration successful',
            data: {
                token,
                user: {
                    id: newClient.id,
                    name: `${newClient.first_name} ${newClient.last_name}`,
                    email: newClient.email,
                    phone: newClient.phone,
                    type: 'client'
                }
            }
        });
        
    } catch (err) {
        console.error('Registration error:', err);
        console.error('Error details:', err.message);
        console.error('Error code:', err.code);
        
        // Handle specific database errors
        if (err.code === '23505') { // Unique constraint violation
            return res.status(409).json({
                status: 'error',
                message: 'User with this email or phone already exists'
            });
        }
        
        res.status(500).json({ 
            status: 'error', 
            message: 'Server error during registration' 
        });
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
    console.log('👤 Registration: POST /api/register');
    console.log('🏠 Refinance mortgage: POST /api/refinance-mortgage');
    console.log('💳 Refinance credit: POST /api/refinance-credit');
    console.log('');
});

module.exports = app; 
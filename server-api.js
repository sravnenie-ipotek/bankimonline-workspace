#!/usr/bin/env node

/**
 * Bankimonline Railway API Server
 * Standalone server optimized for Railway deployment
 * No database dependencies - pure mock endpoints for immediate functionality
 */

const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 8003;

// Middleware
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Locale']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'Bankimonline Railway API Server',
        version: '5.0.0-railway',
        status: 'running',
        endpoints: {
            health: '/api/health',
            auth: ['/api/sms-login', '/api/sms-code-login', '/api/register'],
            services: ['/api/refinance-credit', '/api/refinance-mortgage'],
            data: ['/api/v1/banks', '/api/v1/cities']
        }
    });
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        service: 'Bankimonline API',
        timestamp: new Date().toISOString(),
        version: '5.0.0-railway',
        environment: 'production'
    });
});

// SMS Login - Step 1
app.post('/api/sms-login', (req, res) => {
    const { mobile_number } = req.body;
    
    console.log(`[SMS LOGIN] Request for: ${mobile_number}`);
    
    if (!mobile_number) {
        return res.status(400).json({ 
            status: 'error', 
            message: 'Mobile number is required' 
        });
    }
    
    // Mock OTP generation
    const otp = Math.floor(1000 + Math.random() * 9000);
    console.log(`[SMS] Generated OTP: ${otp} for ${mobile_number}`);
    
    res.json({
        status: 'success',
        message: 'SMS sent successfully. Use code 1234 for testing.',
        data: { mobile_number }
    });
});

// SMS Login - Step 2 (Code Verification)
app.post('/api/sms-code-login', (req, res) => {
    const { code, mobile_number } = req.body;
    
    console.log(`[SMS VERIFY] Code: ${code} for ${mobile_number}`);
    
    if (!code || !mobile_number) {
        return res.status(400).json({ 
            status: 'error', 
            message: 'Code and mobile number are required' 
        });
    }
    
    // Accept any 4-digit code for testing
    if (code.length === 4) {
        res.json({
            status: 'success',
            message: 'Login successful',
            data: {
                token: 'mock-jwt-token-' + Date.now(),
                user: {
                    id: 1,
                    name: 'Test User',
                    phone: mobile_number,
                    email: `${mobile_number.replace('+', '')}@bankim.com`,
                    type: 'client'
                }
            }
        });
    } else {
        res.status(400).json({
            status: 'error',
            message: 'Invalid code format. Use any 4-digit code.'
        });
    }
});

// User Registration
app.post('/api/register', (req, res) => {
    const { name, mobile_number, email, password, password_confirmation } = req.body;
    
    console.log(`[REGISTER] ${name}, ${mobile_number}, ${email}`);
    
    // Validation
    if (!name || !mobile_number || !email || !password || !password_confirmation) {
        return res.status(400).json({ 
            status: 'error',
            message: 'All fields are required' 
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
    
    // Mock successful registration
    res.status(201).json({
        status: 'success',
        message: 'Registration successful',
        data: {
            token: 'mock-jwt-token-' + Date.now(),
            user: {
                id: Math.floor(Math.random() * 1000),
                name: name,
                email: email,
                phone: mobile_number,
                type: 'client'
            }
        }
    });
});

// Refinance Credit Calculation
app.post('/api/refinance-credit', (req, res) => {
    const { loans_data, monthly_income, expenses } = req.body;
    
    console.log(`[REFINANCE CREDIT] Calculation request`);
    
    // Mock calculation
    const totalDebt = loans_data ? loans_data.reduce((sum, loan) => sum + (loan.amount || 0), 0) : 50000;
    const newRate = 8.5;
    const newMonthlyPayment = Math.round((totalDebt * newRate / 100) / 12);
    const savings = Math.round(totalDebt * 0.2);
    
    res.json({
        status: 'success',
        message: 'Credit refinance calculation completed',
        data: {
            percent: newRate,
            monthly_payment: newMonthlyPayment,
            total_savings: savings,
            total_debt: totalDebt,
            recommended_banks: [
                { name: 'Bank Hapoalim', rate: 8.2, monthly: newMonthlyPayment - 100 },
                { name: 'Bank Leumi', rate: 8.5, monthly: newMonthlyPayment },
                { name: 'Mizrahi Tefahot', rate: 8.8, monthly: newMonthlyPayment + 100 }
            ]
        }
    });
});

// Refinance Mortgage Calculation
app.post('/api/refinance-mortgage', (req, res) => {
    const { target, amount_left, full_amount, estate_type, bank_id } = req.body;
    
    console.log(`[REFINANCE MORTGAGE] Calculation request`);
    
    // Mock calculation
    const calculatedPercent = 3.5;
    const monthlyPayment = Math.round((amount_left * calculatedPercent / 100) / 12);
    const totalSavings = Math.round(amount_left * 0.15);
    
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
});

// Banks data
app.get('/api/v1/banks', (req, res) => {
    res.json({
        data: [
            { id: 1, name: 'Bank Leumi', code: 'leumi', logo: 'leumi.png' },
            { id: 2, name: 'Bank Hapoalim', code: 'hapoalim', logo: 'hapoalim.png' },
            { id: 3, name: 'Mizrahi Tefahot', code: 'mizrahi', logo: 'mizrahi.png' },
            { id: 4, name: 'Bank Discount', code: 'discount', logo: 'discount.png' },
            { id: 5, name: 'First International Bank', code: 'fibi', logo: 'fibi.png' }
        ],
        status: 'success'
    });
});

// Cities data
app.get('/api/v1/cities', (req, res) => {
    res.json({
        data: [
            { id: 1, name: 'Tel Aviv' },
            { id: 2, name: 'Jerusalem' },
            { id: 3, name: 'Haifa' },
            { id: 4, name: 'Rishon LeZion' },
            { id: 5, name: 'Petah Tikva' },
            { id: 6, name: 'Ashdod' },
            { id: 7, name: 'Netanya' },
            { id: 8, name: 'Beer Sheva' }
        ],
        status: 'success'
    });
});

// 404 handler for undefined routes
app.use((req, res) => {
    res.status(404).json({ 
        error: 'Endpoint not found',
        path: req.path,
        method: req.method,
        available_endpoints: [
            'GET /',
            'GET /api/health',
            'POST /api/sms-login',
            'POST /api/sms-code-login', 
            'POST /api/register',
            'POST /api/refinance-credit',
            'POST /api/refinance-mortgage',
            'GET /api/v1/banks',
            'GET /api/v1/cities'
        ]
    });
});

// Start server
app.listen(PORT, () => {
    console.log('🚀 Bankimonline Railway API Server Started');
    console.log(`📡 Server running on port: ${PORT}`);
    console.log(`🏥 Health check: /api/health`);
    console.log('📱 SMS Login: POST /api/sms-login & /api/sms-code-login');
    console.log('👤 Registration: POST /api/register');
    console.log('🏠 Refinance Mortgage: POST /api/refinance-mortgage');
    console.log('💳 Refinance Credit: POST /api/refinance-credit');
    console.log('🏦 Banks: GET /api/v1/banks');
    console.log('🏙️ Cities: GET /api/v1/cities');
    console.log('');
    console.log('✅ All endpoints available and ready for Railway deployment');
});

module.exports = app; 
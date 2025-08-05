#!/usr/bin/env node
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

// Create Express app
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
app.use(morgan('dev'));

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'Bankimonline API Server (Simple Version)',
        version: '3.0.0-simple',
        status: 'running',
        node_version: process.version,
        database: 'not connected'
    });
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        service: 'Bankimonline API',
        timestamp: new Date().toISOString(),
        version: '3.0.0-simple'
    });
});

// Mock banks endpoint
app.get('/api/v1/banks', (req, res) => {
    res.json({
        data: [
            { id: 1, name: 'Bank Leumi', code: 'leumi' },
            { id: 2, name: 'Bank Hapoalim', code: 'hapoalim' },
            { id: 3, name: 'Mizrahi Tefahot', code: 'mizrahi' }
        ],
        status: 'success'
    });
});

// Mock cities endpoint
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

// Mock authentication endpoints
app.post('/api/auth-mobile', (req, res) => {
    const { mobile_number } = req.body;
    
    console.log(`[AUTH] SMS login request for: ${mobile_number}`);
    
    res.json({
        status: 'success',
        message: 'Mock SMS sent. Use code 1234',
        data: { mobile_number }
    });
});

app.post('/api/auth-verify', (req, res) => {
    const { code, mobile_number } = req.body;
    
    console.log(`[AUTH] Code verification: ${code} for ${mobile_number}`);
    
    if (code === '1234') {
        res.json({
            status: 'success',
            message: 'Login successful',
            data: {
                token: 'mock-jwt-token',
                user: {
                    id: 1,
                    name: 'Test User',
                    phone: mobile_number
                }
            }
        });
    } else {
        res.status(400).json({
            status: 'error',
            message: 'Invalid code. Use 1234'
        });
    }
});

// Mock refinance credit endpoint
app.post('/api/refinance-credit', (req, res) => {
    const { loans_data, monthly_income, expenses } = req.body;
    
    console.log(`[REFINANCE CREDIT] Mock calculation`);
    
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
            total_debt: totalDebt
        }
    });
});

// Mock registration endpoint
app.post('/api/register', (req, res) => {
    const { name, mobile_number, email, password, password_confirmation } = req.body;
    
    console.log(`[REGISTER] Mock registration for: ${name}, ${mobile_number}`);
    
    if (!name || !mobile_number || !email || !password) {
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
    
    res.status(201).json({
        status: 'success',
        message: 'Registration successful',
        data: {
            token: 'mock-jwt-token',
            user: {
                id: 1,
                name: name,
                email: email,
                phone: mobile_number,
                type: 'client'
            }
        }
    });
});

// Start server
app.listen(PORT, () => {
    console.log('🚀 Bankimonline API Server Started');
    console.log(`📡 Server running on: http://localhost:${PORT}`);
    console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
    console.log('💡 This is a simplified version without database');
    console.log('🔧 Use "node test-db.js" to test database connection');
    console.log('');
});

module.exports = app; 
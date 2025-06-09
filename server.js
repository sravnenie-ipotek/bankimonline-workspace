#!/usr/bin/env node
require('dotenv').config(); // Load environment variables from .env file

/**
 * Bankimonline REAL API Server - Node.js Version
 * Connects to a PostgreSQL database and replaces the mock server functionality.
 *
 * Features:
 * - Real API endpoints (port 8003)
 * - PostgreSQL database connection
 * - JWT-based authentication
 * - CORS support
 * - Comprehensive logging
 */

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { Pool } = require('pg'); // PostgreSQL client
const jwt = require('jsonwebtoken'); // JSON Web Token for authentication

// Create Express app
const app = express();

// --- Database Connection ---
// Use the DATABASE_URL from the .env file to connect to Railway PostgreSQL
const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:lgqPEzvVbSCviTybKqMbzJkYvOUetJjt@maglev.proxy.rlwy.net:43809/railway'
});

// Test the database connection
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('❌ Error connecting to the database', err.stack);
    } else {
        console.log('✅ Database connected successfully at:', res.rows[0].now);
    }
});


// Middleware
app.use(cors({
    origin: '*', // In production, you should restrict this to your frontend's URL
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Locale']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev')); // Request logging

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'Bankimonline API Server',
        version: '3.0.0-db',
        status: 'running',
        node_version: process.version,
        database: 'connected'
    });
});

// --- REAL API ENDPOINTS ---

// Health check endpoint (no changes needed)
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        service: 'Bankimonline API',
        timestamp: new Date().toISOString(),
        version: '3.0.0-db'
    });
});

// Get all banks from the database
app.get('/api/v1/banks', async (req, res) => {
    try {
        // Query the 'banks' table
        const result = await pool.query('SELECT id, name_ru as name, logo as code FROM banks ORDER BY name_ru');
        res.json({
            data: result.rows,
            status: 'success'
        });
    } catch (err) {
        console.error('Error fetching banks:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get all cities from the database
app.get('/api/v1/cities', async (req, res) => {
    try {
        const result = await pool.query('SELECT id, name_ru as name FROM cities ORDER BY id');
        res.json({
            data: result.rows,
            status: 'success'
        });
    } catch (err) {
        console.error('Error fetching cities:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});


// --- AUTHENTICATION FLOW ---

// Step 1: User provides phone number.
// The frontend calls this endpoint to check if the user exists and to trigger an OTP.
app.post('/api/sms-login', async (req, res) => {
    const { mobile_number } = req.body;

    if (!mobile_number) {
        return res.status(400).json({ error: 'Mobile number is required' });
    }

    try {
        const clientResult = await pool.query('SELECT * FROM clients WHERE phone = $1', [mobile_number]);

        if (clientResult.rows.length === 0) {
            // New phone number - will create client record after OTP verification
            console.log(`[AUTH] New phone number attempt: ${mobile_number}. Allowing to proceed.`);
        } else {
            console.log(`[AUTH] Existing client found for phone: ${mobile_number}`);
        }
        
        // --- SMS Sending Simulation ---
        // In a real application, you would integrate an SMS service like Twilio here
        // and send a real OTP to the user's phone.
        const otp = Math.floor(1000 + Math.random() * 9000); // Generate a 4-digit OTP
        console.log('**************************************************');
        console.log(`**  OTP for ${mobile_number} is: ${otp}  **`);
        console.log('**  In production, this would be sent via SMS.  **');
        console.log('**************************************************');
        
        // You might store this OTP in the database with an expiry to verify it in the next step.
        // For this implementation, we will accept a hardcoded code for simplicity.

        res.json({
            status: 'success',
            message: 'OTP initiated. Check console for the code.',
            data: { mobile_number } // Send back the number for the next step
        });

    } catch (err) {
        console.error('Error during sms-login:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});


// Step 2: User provides the OTP code they received.
app.post('/api/sms-code-login', async (req, res) => {
    const { code, mobile_number } = req.body;

    console.log(`[AUTH] Attempting to verify code '${code}' for number '${mobile_number}'`);

    // --- OTP Verification Simulation ---
    // For this example, we'll accept any 4-digit code.
    // A real implementation would compare the user's input with the stored OTP.
    if (!code || code.length !== 4) {
        return res.status(400).json({ status: 'error', message: 'Invalid code format.' });
    }

    try {
        let client;
        const clientResult = await pool.query('SELECT * FROM clients WHERE phone = $1', [mobile_number]);

        if (clientResult.rows.length > 0) {
            client = clientResult.rows[0];
        } else {
            // If the client doesn't exist, create a new one.
            console.log(`[AUTH] Client not found. Creating new client for phone: ${mobile_number}`);
            const newClientResult = await pool.query(
                'INSERT INTO clients (first_name, last_name, email, phone, created_at, updated_at) VALUES ($1, $2, $3, $4, NOW(), NOW()) RETURNING *',
                ['New', 'Client', `${mobile_number}@bankim.com`, mobile_number]
            );
            client = newClientResult.rows[0];
        }

        // --- JWT Generation ---
        // Once OTP is "verified", create a JWT for the client.
        const token = jwt.sign(
            { id: client.id, phone: client.phone, type: 'client', name: `${client.first_name} ${client.last_name}` },
            process.env.JWT_SECRET || 'fallback-secret-key',
            { expiresIn: '1h' } // Token expires in 1 hour
        );

        console.log(`[AUTH] Login successful for ${mobile_number}. JWT issued.`);
        
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
        console.error('Error during sms-code-login:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});


// Fallback for other endpoints not yet converted
app.all('/api/v1/*', (req, res) => {
    res.status(404).json({
        error: 'Endpoint not implemented in DB version',
        message: `The ${req.method} endpoint ${req.path} exists in mock server but is not yet connected to the database.`
    });
});


// 404 handler for any other routes
app.use((req, res) => {
    res.status(404).json({
        error: 'Endpoint not found',
        message: `The endpoint ${req.method} ${req.path} does not exist.`
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
const PORT = process.env.PORT || 8003;

app.listen(PORT, () => {
    console.log('='.repeat(60));
    console.log(`  Bankimonline REAL API Server (Node.js + PostgreSQL)`);
    console.log(`  API listening on: http://localhost:${PORT}`);
    console.log('='.repeat(60));
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\nShutting down server...');
    pool.end(() => {
        console.log('Database pool has been closed.');
        process.exit(0);
    });
});
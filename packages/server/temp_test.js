#!/usr/bin/env node
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { createPool } = require('../config/database-core');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const NodeCache = require('node-cache');

const app = express();
const PORT = process.env.PORT || 8003;

// Initialize cache for content endpoints (5-minute TTL)
const contentCache = new NodeCache({ 
    stdTTL: 300, // 5 minutes
    checkperiod: 60, // Check for expired keys every 60 seconds
    useClones: false // Better performance for JSON objects
});

// Main database connection (Core Database)
const pool = createPool('main');

// Content database connection (SECOND database for content/translations)
const contentPool = createPool('content');

// Test main database connection
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('❌ Main Database connection failed:', err.message);
    } else {
        console.log('✅ Main Database connected successfully');
    }
});

// Test content database connection
contentPool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('❌ Content Database connection failed:', err.message);
    } else {
        console.log('✅ Content Database connected successfully');
        // Delete test-content table if it exists (cleanup)
        contentPool.query('DROP TABLE IF EXISTS "test-content" CASCADE', (dropErr, dropRes) => {
            if (dropErr) {
                console.error('❌ Failed to delete test-content table:', dropErr.message);
            } else {
                console.log('✅ Test content table cleanup completed');
            }
        });
    }
});

// Server mode identification endpoint
app.get('/api/server-mode', (req, res) => {
    res.json({
        mode: 'modern',
        server: 'packages',
        file: 'packages/server/src/server.js',
        warning: false,
        message: 'MODERN MODE - PACKAGES SERVER',
        status: 'PRODUCTION READY'
    });
});

// Helper function for content database queries
async function queryContentDB(query, params = []) {
    try {
        const result = await contentPool.query(query, params);
        return result;
    } catch (error) {
        console.error('❌ Content DB Query Error:', error.message);
        throw error;
    }
}

// Export contentPool for direct access when needed
global.contentPool = contentPool;
global.queryContentDB = queryContentDB;

// Get CORS origins - Railway deployment should allow all origins
const getCorsOrigins = () => {
    // Check if we're in Railway production environment
    if (process.env.RAILWAY_ENVIRONMENT === 'production' || process.env.NODE_ENV === 'production') {
        return true; // Allow all origins in production
    }
    
    if (process.env.CORS_ALLOWED_ORIGINS) {
        // If it's just '*', return true to allow all origins
        if (process.env.CORS_ALLOWED_ORIGINS.trim() === '*') {
            return true;
        }
        // Otherwise split comma-separated values
        return process.env.CORS_ALLOWED_ORIGINS.split(',').map(url => url.trim());
    }
    
    // Default origins for development and Railway deployment
    return [
        'http://localhost:3001',
        'http://localhost:3000',
        'http://localhost:5173', // Vite dev server
        'http://localhost:5174', // Vite dev server (alternative port)
        'http://localhost:5175', // Vite dev server (another alternative port)
        'http://localhost:8003',
        // Production domain
        'https://bankimonline.com'
    ];
};

// Middleware
const corsOptions = {
    origin: getCorsOrigins(),
    credentials: false, // Set to false when allowing all origins
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    optionsSuccessStatus: 200
};

// Log CORS configuration for debugging
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
        // Create unique filename with timestamp
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'resume-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const uploadFile = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: function (req, file, cb) {
        // Allow only specific file types
        const allowedTypes = /pdf|doc|docx/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only PDF, DOC, DOCX files are allowed'));
        }
    }
});

// Serve static files from React build

// Serve React build files (for Railway deployment)
app.use(express.static(path.join(__dirname, 'mainapp/build')));

// Serve root static files (admin.html, etc.)
app.use(express.static(__dirname));

// Root endpoint - serve React app
app.get('/', (req, res) => {
    const reactIndexPath = path.join(__dirname, 'mainapp/build/index.html');
    
    // Check if React build exists, otherwise serve API info
    if (fs.existsSync(reactIndexPath)) {
        res.sendFile(reactIndexPath);
    } else {
        res.json({
            message: 'Bankimonline Database API',
            version: '4.0.0',
            database: 'Railway PostgreSQL',
            note: 'React build not found - serving API only'
        });
    }
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        database: 'connected',
        version: '5.2.0-regex-greedy-fix',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        corsEnabled: true
    });
});

// Content database health check
app.get('/api/content-db/health', async (req, res) => {
    try {
        const result = await contentPool.query('SELECT NOW() as current_time, version() as db_version');
        res.json({
            status: 'ok',
            message: 'Content database connected successfully',
            database: 'content_db_connected',
            timestamp: result.rows[0].current_time,
            version: result.rows[0].db_version.split(' ')[0] + ' ' + result.rows[0].db_version.split(' ')[1],
            environment: process.env.NODE_ENV || 'development'
        });
    } catch (error) {
        console.error('❌ Content DB health check failed:', error.message);
        res.status(500).json({
            status: 'error',
            message: 'Content database connection failed',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Content database test endpoint
app.get('/api/content-db/test', async (req, res) => {
    try {
        // Create a test table for content
        await contentPool.query(`
            CREATE TABLE IF NOT EXISTS content_test (
                id SERIAL PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                content TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Insert test data
        const insertResult = await contentPool.query(`
            INSERT INTO content_test (title, content) 
            VALUES ($1, $2) 
            RETURNING *
        `, ['Test Content', 'This is a test content entry for the content database']);

        // Retrieve all content
        const selectResult = await contentPool.query('SELECT * FROM content_test ORDER BY created_at DESC LIMIT 5');

        res.json({
            status: 'success',
            message: 'Content database test completed successfully',
            inserted_record: insertResult.rows[0],
            recent_records: selectResult.rows,
            total_records: selectResult.rowCount
        });
    } catch (error) {
        console.error('❌ Content DB test failed:', error.message);
        res.status(500).json({
            status: 'error',
            message: 'Content database test failed',
            error: error.message
        });
    }
});

// =====================================================
// MORTGAGE FORM DATA SAVING ENDPOINTS
// =====================================================

// 1. Save/Update Mortgage Form Session Data (Progressive Saving)
app.post('/api/v1/mortgage/save-session', async (req, res) => {
    try {
        const {
            session_id,
            step_number,
            form_data,
            user_ip = req.ip,
            user_agent = req.get('User-Agent')
        } = req.body;

        if (!session_id || !step_number || !form_data) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: session_id, step_number, form_data'
            });
        }

        // Check if session exists
        const existingSession = await pool.query(
            'SELECT * FROM client_form_sessions WHERE session_id = $1',
            [session_id]
        );

        let result;
        if (existingSession.rows.length > 0) {
            // Update existing session
            result = await pool.query(`
                UPDATE client_form_sessions 
                SET 
                    current_step = $1,
                    personal_data = $2,
                    updated_at = CURRENT_TIMESTAMP
                WHERE session_id = $3
                RETURNING *
            `, [step_number, JSON.stringify(form_data), session_id]);
        } else {
            // Create new session
            result = await pool.query(`
                INSERT INTO client_form_sessions (
                    session_id, 
                    current_step, 
                    personal_data, 
                    ip_address,
                    created_at,
                    updated_at
                ) VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                RETURNING *
            `, [session_id, step_number, JSON.stringify(form_data), user_ip]);
        }

        res.json({
            success: true,
            message: 'Mortgage form session saved successfully',
            session: result.rows[0]
        });

    } catch (error) {
        console.error('❌ Error saving mortgage session:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to save mortgage form session',
            error: error.message
        });
    }
});

// 2. Get Mortgage Form Session Data
app.get('/api/v1/mortgage/get-session/:session_id', async (req, res) => {
    try {
        const { session_id } = req.params;

        const result = await pool.query(
            'SELECT * FROM client_form_sessions WHERE session_id = $1',
            [session_id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Session not found'
            });
        }

        res.json({
            success: true,
            session: result.rows[0]
        });

    } catch (error) {
        console.error('❌ Error retrieving mortgage session:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve mortgage form session',
            error: error.message
        });
    }
});

// 3. Save Mortgage Step 1 Data (Property & Loan Details)
app.post('/api/v1/mortgage/save-step1', async (req, res) => {
    try {
        const {
            session_id,
            priceOfEstate,
            cityWhereYouBuy,
            whenDoYouNeedMoney,
            initialFee,
            typeSelect,
            willBeYourFirst,
            propertyOwnership,
            period,
            monthlyPayment
        } = req.body;

        if (!session_id) {
            return res.status(400).json({
                success: false,
                message: 'session_id is required'
            });
        }

        // Save to client_form_sessions with step-specific data
        const step1Data = {
            priceOfEstate,
            cityWhereYouBuy,
            whenDoYouNeedMoney,
            initialFee,
            typeSelect,
            willBeYourFirst,
            propertyOwnership,
            period,
            monthlyPayment,
            step: 1,
            timestamp: new Date().toISOString()
        };

        const result = await pool.query(`
            INSERT INTO client_form_sessions (
                session_id,
                current_step,
                property_value,
                property_city,
                loan_period_preference,
                initial_payment,
                property_type,
                property_ownership,
                loan_term_years,
                calculated_monthly_payment,
                personal_data,
                created_at,
                updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            ON CONFLICT (session_id) DO UPDATE SET
                current_step = EXCLUDED.current_step,
                property_value = EXCLUDED.property_value,
                property_city = EXCLUDED.property_city,
                loan_period_preference = EXCLUDED.loan_period_preference,
                initial_payment = EXCLUDED.initial_payment,
                property_type = EXCLUDED.property_type,
                property_ownership = EXCLUDED.property_ownership,
                loan_term_years = EXCLUDED.loan_term_years,
                calculated_monthly_payment = EXCLUDED.calculated_monthly_payment,
                personal_data = EXCLUDED.personal_data,
                updated_at = CURRENT_TIMESTAMP
            RETURNING *
        `, [
            session_id,
            1,
            priceOfEstate,
            cityWhereYouBuy,
            whenDoYouNeedMoney,
            initialFee,
            typeSelect,
            propertyOwnership,
            period,
            monthlyPayment,
            JSON.stringify(step1Data)
        ]);

        res.json({
            success: true,
            message: 'Mortgage Step 1 data saved successfully',
            data: result.rows[0]
        });

    } catch (error) {
        console.error('❌ Error saving mortgage step 1:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to save mortgage step 1 data',
            error: error.message
        });
    }
});

// 4. Save Mortgage Step 2 Data (Personal Information)
app.post('/api/v1/mortgage/save-step2', async (req, res) => {
    try {
        const {
            session_id,
            nameSurname,
            birthday,
            education,
            additionalCitizenships,
            citizenshipsDropdown,
            taxes,
            countriesPayTaxes,
            childrens,
            howMuchChildrens,
            medicalInsurance,
            isForeigner,
            publicPerson,
            borrowers,
            familyStatus,
            partnerPayMortgage,
            addPartner,
            address,
            idDocument,
            documentIssueDate,
            gender
        } = req.body;

        if (!session_id) {
            return res.status(400).json({
                success: false,
                message: 'session_id is required'
            });
        }

        // Save to client_form_sessions with step-specific data
        const step2Data = {
            nameSurname,
            birthday,
            education,
            additionalCitizenships,
            citizenshipsDropdown,
            taxes,
            countriesPayTaxes,
            childrens,
            howMuchChildrens,
            medicalInsurance,
            isForeigner,
            publicPerson,
            borrowers,
            familyStatus,
            partnerPayMortgage,
            addPartner,
            address,
            idDocument,
            documentIssueDate,
            gender,
            step: 2,
            timestamp: new Date().toISOString()
        };

        const result = await pool.query(`
            UPDATE client_form_sessions 
            SET 
                current_step = $1,
                personal_data = $2,
                updated_at = CURRENT_TIMESTAMP
            WHERE session_id = $3
            RETURNING *
        `, [
            2,
            JSON.stringify(step2Data),
            session_id
        ]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Session not found. Please complete Step 1 first.'
            });
        }

        res.json({
            success: true,
            message: 'Mortgage Step 2 data saved successfully',
            data: result.rows[0]
        });

    } catch (error) {
        console.error('❌ Error saving mortgage step 2:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to save mortgage step 2 data',
            error: error.message
        });
    }
});

// 5. Save Mortgage Step 3 Data (Financial Information)
app.post('/api/v1/mortgage/save-step3', async (req, res) => {
    try {
        const {
            session_id,
            mainSourceOfIncome,
            monthlyIncome,
            startDate,
            fieldOfActivity,
            profession,
            companyName,
            additionalIncome,
            additionalIncomeAmount,
            obligation,
            bank,
            monthlyPaymentForAnotherBank,
            endDate,
            amountIncomeCurrentYear,
            noIncome,
            whoAreYouForBorrowers
        } = req.body;

        if (!session_id) {
            return res.status(400).json({
                success: false,
                message: 'session_id is required'
            });
        }

        // Save to client_form_sessions with step-specific data
        const step3Data = {
            mainSourceOfIncome,
            monthlyIncome,
            startDate,
            fieldOfActivity,
            profession,
            companyName,
            additionalIncome,
            additionalIncomeAmount,
            obligation,
            bank,
            monthlyPaymentForAnotherBank,
            endDate,
            amountIncomeCurrentYear,
            noIncome,
            whoAreYouForBorrowers,
            step: 3,
            timestamp: new Date().toISOString()
        };

        const result = await pool.query(`
            UPDATE client_form_sessions 
            SET 
                current_step = $1,
                financial_data = $2,
                updated_at = CURRENT_TIMESTAMP
            WHERE session_id = $3
            RETURNING *
        `, [
            3,
            JSON.stringify(step3Data),
            session_id
        ]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Session not found. Please complete previous steps first.'
            });
        }

        res.json({
            success: true,
            message: 'Mortgage Step 3 data saved successfully',
            data: result.rows[0]
        });

    } catch (error) {
        console.error('❌ Error saving mortgage step 3:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to save mortgage step 3 data',
            error: error.message
        });
    }
});

// 6. Submit Complete Mortgage Application (Final Submission)
app.post('/api/v1/mortgage/submit-application', async (req, res) => {
    try {
        const { session_id } = req.body;

        if (!session_id) {
            return res.status(400).json({
                success: false,
                message: 'session_id is required'
            });
        }

        // Get complete session data
        const sessionResult = await pool.query(
            'SELECT * FROM client_form_sessions WHERE session_id = $1',
            [session_id]
        );

        if (sessionResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Session not found'
            });
        }

        const sessionData = sessionResult.rows[0];
        const personalData = sessionData.personal_data || {};
        const financialData = sessionData.financial_data || {};

        // Begin transaction
        await pool.query('BEGIN');

        try {
            // 1. Create or update client record
            const fullName = personalData.nameSurname || 'Unknown';
            const nameParts = fullName.split(' ');
            const firstName = nameParts[0] || 'Unknown';
            const lastName = nameParts.slice(1).join(' ') || '';
            
            const clientResult = await pool.query(`
                INSERT INTO clients (
                    first_name,
                    last_name,
                    email,
                    phone,
                    created_at,
                    updated_at
                ) VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                RETURNING id
            `, [
                firstName,
                lastName,
                personalData.email || '',
                personalData.phone || ''
            ]);

            const clientId = clientResult.rows[0].id;

            // 2. Create loan application record
            const loanResult = await pool.query(`
                INSERT INTO loan_applications (
                    client_id,
                    loan_type,
                    requested_amount,
                    loan_term_years,
                    monthly_payment,
                    down_payment,
                    application_status,
                    submitted_at,
                    created_at,
                    updated_at
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                RETURNING id
            `, [
                clientId,
                'mortgage',
                (sessionData.property_value - sessionData.initial_payment),
                sessionData.loan_term_years,
                sessionData.calculated_monthly_payment,
                sessionData.initial_payment,
                'submitted'
            ]);

            const loanApplicationId = loanResult.rows[0].id;

            // 3. Mark session as completed
            await pool.query(`
                UPDATE client_form_sessions 
                SET 
                    is_completed = true,
                    client_id = $1,
                    updated_at = CURRENT_TIMESTAMP
                WHERE session_id = $2
            `, [clientId, session_id]);

            // Commit transaction
            await pool.query('COMMIT');

            res.json({
                success: true,
                message: 'Mortgage application submitted successfully',
                data: {
                    client_id: clientId,
                    loan_application_id: loanApplicationId,
                    session_id: session_id
                }
            });

        } catch (error) {
            // Rollback transaction
            await pool.query('ROLLBACK');
            throw error;
        }

    } catch (error) {
        console.error('❌ Error submitting mortgage application:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to submit mortgage application',
            error: error.message
        });
    }
});

// 7. Get All Mortgage Applications (Admin endpoint)
app.get('/api/v1/admin/mortgage-applications', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                la.id,
                la.loan_type,
                la.requested_amount,
                la.loan_term_years,
                la.monthly_payment,
                la.down_payment,
                la.application_status,
                la.created_at,
                CONCAT(c.first_name, ' ', c.last_name) as full_name,
                c.email,
                c.phone
            FROM loan_applications la
            JOIN clients c ON la.client_id = c.id
            WHERE la.loan_type = 'mortgage'
            ORDER BY la.created_at DESC
        `);

        res.json({
            success: true,
            applications: result.rows,
            total: result.rows.length
        });

    } catch (error) {
        console.error('❌ Error fetching mortgage applications:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch mortgage applications',
            error: error.message
        });
    }
});

// Content database cleanup endpoint
app.delete('/api/content-db/cleanup', async (req, res) => {
    try {
        await contentPool.query('DROP TABLE IF EXISTS content_test CASCADE');
        res.json({
            status: 'success',
            message: 'Content database test table cleaned up successfully'
        });
    } catch (error) {
        console.error('❌ Content DB cleanup failed:', error.message);
        res.status(500).json({
            status: 'error',
            message: 'Content database cleanup failed',
            error: error.message
        });
    }
});

// Delete specific test-content table from bankim_content database
app.delete('/api/content-db/delete-test-content', async (req, res) => {
    try {
        // Delete test-content table (with quotes for exact name matching)
        const result = await contentPool.query('DROP TABLE IF EXISTS "test-content" CASCADE');
        
        // Also check for variations without quotes
        await contentPool.query('DROP TABLE IF EXISTS test_content CASCADE');
        
        // Verify table is deleted by checking if it exists
        const tableCheck = await contentPool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND (table_name = 'test-content' OR table_name = 'test_content')
        `);
        
        res.json({
            status: 'success',
            message: 'test-content table deleted successfully from bankim_content database',
            tables_found: tableCheck.rowCount,
            deleted_tables: ['test-content', 'test_content'],
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('❌ Failed to delete test-content table:', error.message);
        res.status(500).json({
            status: 'error',
            message: 'Failed to delete test-content table',
            error: error.message
        });
    }
});

// List all tables in content database
app.get('/api/content-db/tables', async (req, res) => {
    try {
        const result = await contentPool.query(`
            SELECT table_name, table_type 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            ORDER BY table_name
        `);
        
        res.json({
            status: 'success',
            database: 'bankim_content',
            total_tables: result.rowCount,
            tables: result.rows
        });
    } catch (error) {
        console.error('❌ Failed to list content database tables:', error.message);
        res.status(500).json({
            status: 'error',
            message: 'Failed to list content database tables',
            error: error.message
        });
    }
});

// ===================================================================
// CONTENT MANAGEMENT API ENDPOINTS - Phase 1
// ===================================================================

// DEBUG ENDPOINT: Fix translation status from draft to approved
app.post('/api/content/fix-status', async (req, res) => {
    try {
        const result = await contentPool.query(`
            UPDATE content_translations 
            SET status = 'approved' 
            WHERE status = 'draft'
            RETURNING id, content_item_id, language_code, status
        `);
        
        res.json({
            status: 'success',
            message: 'Translation status updated successfully',
            updated_count: result.rowCount,
            updated_translations: result.rows
        });
        
    } catch (error) {
        console.error('❌ Failed to update translation status:', error.message);
        res.status(500).json({
            status: 'error',
            message: 'Failed to update translation status',
            error: error.message
        });
    }
});

// GET /api/content/cache/stats - Get cache statistics and management
app.get('/api/content/cache/stats', (req, res) => {
    try {
        const stats = contentCache.getStats();
        const keys = contentCache.keys();
        
        res.json({
            status: 'success',
            cache_stats: {
                keys_count: keys.length,
                hits: stats.hits,
                misses: stats.misses,
                hit_rate: stats.hits + stats.misses > 0 ? (stats.hits / (stats.hits + stats.misses) * 100).toFixed(2) + '%' : '0%',
                keys: keys.length > 20 ? keys.slice(0, 20).concat(['... and ' + (keys.length - 20) + ' more']) : keys
            },
            ttl: '300 seconds (5 minutes)',
            checkperiod: '60 seconds'
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Failed to get cache stats',
            error: error.message
        });
    }
});

// DELETE /api/content/cache/clear - Clear content cache
app.delete('/api/content/cache/clear', (req, res) => {
    try {
        const keysBefore = contentCache.keys().length;
        contentCache.flushAll();
        
        res.json({
            status: 'success',
            message: 'Content cache cleared successfully',
            keys_cleared: keysBefore
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Failed to clear cache',
            error: error.message
        });
    }
});

// GET /api/content/:screen/:language - Get content for specific screen with optional type filtering and caching
app.get('/api/content/:screen/:language', async (req, res) => {
    try {
        const { screen, language } = req.params;
        const { type } = req.query; // Optional type filter
        
        // Create cache key including type filter
        const cacheKey = `content_${screen}_${language}_${type || 'all'}`;
        
        // Check cache first
        const cached = contentCache.get(cacheKey);
        if (cached) {
            return res.json(cached);
        }
        
        // Build query with optional type filtering
        let query = `
            SELECT 
                content_items.content_key,
                content_items.component_type,
                content_items.category,
                content_translations.content_value,
                content_translations.language_code,
                content_translations.status
            FROM content_items
            JOIN content_translations ON content_items.id = content_translations.content_item_id
            WHERE content_items.screen_location = $1 
                AND content_translations.language_code = $2 
                AND content_translations.status = 'approved'
                AND content_items.is_active = true`;
        
        const params = [screen, language];
        
        // Add type filter if specified
        if (type) {
            query += ' AND content_items.component_type = $3';
            params.push(type);
        }
        
        query += ' ORDER BY content_items.content_key';
        
        const result = await contentPool.query(query, params);
        
        // Transform to key-value object for frontend
        const content = {};
        result.rows.forEach(row => {
            content[row.content_key] = {
                value: row.content_value,
                component_type: row.component_type,
                category: row.category,
                language: row.language_code,
                status: row.status
            };
        });
        
        const response = {
            status: 'success',
            screen_location: screen,
            language_code: language,
            content_count: result.rowCount,
            content: content,
            ...(type && { filtered_by_type: type }),
            cached: false
        };
        
        // Cache the response for 5 minutes
        contentCache.set(cacheKey, { ...response, cached: true });
        
        res.json(response);
        
    } catch (error) {
        console.error('❌ Failed to get content for screen:', error.message);
        res.status(500).json({
            status: 'error',
            message: 'Failed to retrieve content for screen',
            error: error.message
        });
    }
});

// POST /api/cache/clear - Clear content cache
app.post('/api/cache/clear', (req, res) => {
    contentCache.flushAll();
    res.json({ status: 'success', message: 'Cache cleared' });
});

// GET /api/dropdowns/:screen/:language - Get structured dropdown data with caching
app.get('/api/dropdowns/:screen/:language', async (req, res) => {
    try {
        const { screen, language } = req.params;
        
        // Create cache key for dropdowns
        const cacheKey = `dropdowns_${screen}_${language}`;
        
        // Check cache first
        const cached = contentCache.get(cacheKey);
        if (cached) {
            return res.json(cached);
        }
        
        // Fetch all dropdown-related content for the screen
        const result = await contentPool.query(`
            SELECT 
                content_items.content_key,
                content_items.component_type,
                content_translations.content_value
            FROM content_items
            JOIN content_translations ON content_items.id = content_translations.content_item_id
            WHERE content_items.screen_location = $1 
                AND content_translations.language_code = $2
                AND content_translations.status = 'approved'
                AND content_items.is_active = true
                AND content_items.component_type IN ('dropdown_container', 'dropdown_option', 'option', 'placeholder', 'label')
            ORDER BY content_items.content_key, content_items.component_type
        `, [screen, language]);
        // Structure the response according to the specification
        const response = {
            status: 'success',
            screen_location: screen,
            language_code: language,
            dropdowns: [],
            options: {},
            placeholders: {},
            labels: {},
            cached: false
        };
        
        // Group by dropdown field - extract field name from content_key
        const dropdownMap = new Map();
        
        result.rows.forEach(row => {
            `);
            
            // Extract field name using multiple patterns to handle various key formats
            // Examples: mortgage_step1.field.property_ownership, app.mortgage.form.calculate_mortgage_city
            let fieldName = null;
            
            // Pattern 1: mortgage_step1.field.{fieldname} (handles both container and options)
            // First check if this is an option that needs to be grouped
            // Special pattern for numbered options like additional_income_0_no_additional_income
            let match = row.content_key.match(/^[^.]*\.field\.([^.]+?)_[0-9]_(?:no_additional_income|no_obligations)/);
            if (match) {
                fieldName = match[1];
            } else {
                match = row.content_key.match(/^[^.]*\.field\.([^.]+)_(?:has_property|no_property|selling_property|within_3_months|3_to_6_months|6_to_12_months|over_12_months|apartment|garden_apartment|penthouse|private_house|other|yes_first_home|no_additional_property|investment|fixed_rate|variable_rate|mixed_rate|not_sure|im_|i_no_|i_own_|selling_|no_|has_|single|married|divorced|widowed|partner|commonlaw_partner|no_high_school_diploma|partial_high_school_diploma|full_high_school_diploma|postsecondary_education|bachelors|masters|doctorate|employee|selfemployed|pension|student|unemployed|unpaid_leave|additional_salary|additional_work|property_rental_income|no_additional_income|bank_loan|consumer_credit|credit_card|no_obligations|hapoalim|leumi|discount|massad|mizrahi)/);
                if (match) {
                    fieldName = match[1];
                }
            }
            if (!fieldName) {
                // Fix: Handle underscores in field names like field_of_activity
                // First try to match the full field name including underscores
                match = row.content_key.match(/^[^.]*\.field\.([^.]+?)_(?:agriculture|technology|healthcare|education|finance|real_estate|construction|retail|manufacturing|government|transport|consulting|entertainment|other)/);
                if (match) {
                    fieldName = match[1];
                } else {
                    // Fallback to original pattern
                    match = row.content_key.match(/^[^.]*\.field\.([^.]+)/);
                    if (match) {
                        fieldName = match[1];
                    }
                }
            }
            
            // Pattern 1.5: mortgage_stepN_{fieldname} (handles both container and options)
            // Supports keys like: mortgage_step1_when_needed, mortgage_step1_when_needed_option_1, mortgage_step1_when_needed_ph
            if (!fieldName) {
                // Placeholder pattern (support both _ph and _options_ph)
                match = row.content_key.match(/^mortgage_step\d+_([^_]+(?:_[^_]+)*)_(?:options_)?ph$/);
                if (match) {
                    fieldName = match[1];
                } else if (row.content_key.includes('_option_') || row.content_key.includes('_options_')) {
                    // Option pattern (support _option_N and _options_N)
                    match = row.content_key.match(/^mortgage_step\d+_([^_]+(?:_[^_]+)*)_(?:option|options)_\d+$/);
                    if (match) {
                        fieldName = match[1];
                    }
                } else {
                    // Base container label
                    match = row.content_key.match(/^mortgage_step\d+_([^_]+(?:_[^_]+)*)$/);
                    if (match) {
                        fieldName = match[1];
                    }
                }
            }

            // Pattern 2: app.mortgage.form.calculate_mortgage_{fieldname} (handles both container and options)
            // FIXED: Properly group placeholders and options under base field name
            if (!fieldName) {
                if (row.content_key.includes('_ph')) {
                    // For placeholders: calculate_mortgage_main_source_ph → main_source  
                    match = row.content_key.match(/calculate_mortgage_([^_]+(?:_[^_]+)*)_ph$/);
                    if (match) {
                        fieldName = match[1];
                    }
                } else if (row.content_key.includes('_option_')) {
                    // For options: calculate_mortgage_main_source_option_1 → main_source
                    match = row.content_key.match(/calculate_mortgage_([^_]+(?:_[^_]+)*)_option_\d+$/);
                    if (match) {
                        fieldName = match[1];
                    }
                } else {
                    // For labels and other suffixes: calculate_mortgage_main_source → main_source
                    // Also handle legacy patterns with specific endings
                    match = row.content_key.match(/calculate_mortgage_([^_]+(?:_[^_]+)*)_(?:im_|i_no_|i_own_|selling_|no_|has_)/);
                    if (match) {
                        fieldName = match[1];
                    } else {
                        // For base containers: calculate_mortgage_main_source → main_source
                        match = row.content_key.match(/calculate_mortgage_([^_]+(?:_[^_]+)*)$/);
                        if (match) {
                            fieldName = match[1];
                        }
                    }
                }
            }
            
            // Pattern 3: mortgage_calculation.field.{fieldname} (handles both container and options)
            if (!fieldName) {
                // For options like: mortgage_calculation.field.property_ownership_selling_property
                match = row.content_key.match(/mortgage_calculation\.field\.([^.]+?)_(?:im_|i_no_|i_own_|selling_|no_|has_)/);
                if (match) {
                    fieldName = match[1];
                } else {
                    // For containers like: mortgage_calculation.field.property_ownership
                    match = row.content_key.match(/mortgage_calculation\.field\.([^.]+)/);
                    if (match) {
                        fieldName = match[1];
                    }
                }
            }
            
            // Pattern 4: refinance_step1_{fieldname} (handles both container and options)
            if (!fieldName) {
                // For options like: refinance_step1_why_lower_interest_rate
                match = row.content_key.match(/refinance_step1_([^_]+(?:_[^_]+)*)_(?:lower_interest_rate|reduce_monthly_payment|shorten_mortgage_term|cash_out_refinance|consolidate_debts|fixed_interest|variable_interest|prime_interest|mixed_interest|other|apartment|private_house|commercial|land|other|land|no_not_registered|hapoalim|leumi|discount|massad)/);
                if (match) {
                    fieldName = match[1];
                } else {
                    // For containers like: refinance_step1_why
                    match = row.content_key.match(/refinance_step1_([^_]+(?:_[^_]+)*)(?:_ph|$)/);
                    if (match) {
                        fieldName = match[1];
                    }
                }
            }
            
            // Pattern 4.5: refinance_step2_{fieldname} (handles both container and options)
            if (!fieldName) {
                // For options like: refinance_step2_education_bachelors, refinance_step2_education_masters, etc.
                match = row.content_key.match(/refinance_step2_([^_]+(?:_[^_]+)*)_(?:bachelors|masters|doctorate|full_certificate|partial_certificate|no_certificate|post_secondary|postsecondary_education|full_high_school_certificate|partial_high_school_certificat|no_high_school_certificate)/);
                if (match) {
                    fieldName = match[1];
                } else {
                    // For containers like: refinance_step2_education
                    match = row.content_key.match(/refinance_step2_([^_]+(?:_[^_]+)*)(?:_ph|$)/);
                    if (match) {
                        fieldName = match[1];
                    }
                }
            }

            // Pattern 5: Simple field name extraction from various patterns
            if (!fieldName) {
                // Try to extract from patterns like field_name_option_X or field_name_ph
                match = row.content_key.match(/([^._]+)(?:_option_|_ph|$)/);
                if (match && match[1] !== 'mortgage' && match[1] !== 'step1' && match[1] !== 'field') {
                    fieldName = match[1];
                }
            }
            
            // Fallback: use the content_key itself if no pattern matches
            if (!fieldName) {
                fieldName = row.content_key.replace(/[._]/g, '_');
            }
console.log('ok');

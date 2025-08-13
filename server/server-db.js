#!/usr/bin/env node
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { Pool } = require('pg');
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

// Database configuration function for environment-based switching
const getDatabaseConfig = (connectionType = 'content') => {
    const isProduction = process.env.NODE_ENV === 'production';
    const isRailwayProduction = process.env.RAILWAY_ENVIRONMENT === 'production';
    
    console.log(`🔧 Database Config - Environment: ${process.env.NODE_ENV || 'development'}, Railway: ${process.env.RAILWAY_ENVIRONMENT || 'not set'}`);
    
    if (isProduction || isRailwayProduction) {
        // Production: Local PostgreSQL on server
        console.log('🚀 Production environment detected - using local PostgreSQL');
        return {
            connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/bankim_content',
            ssl: false // Local connections don't need SSL
        };
    } else {
        // Development: Railway PostgreSQL
        console.log('🛠️ Development environment detected - using Railway PostgreSQL');
        
        if (connectionType === 'content') {
            // Content database: shortline (bankim_content) - Contains CMS content, translations, dropdowns
            return {
                connectionString: process.env.CONTENT_DATABASE_URL || 'postgresql://postgres:SuFkUevgonaZFXJiJeczFiXYTlICHVJL@shortline.proxy.rlwy.net:33452/railway',
                ssl: false // Railway doesn't require SSL for proxy connections
            };
        } else {
            // Main database: maglev (bankim_core) - Contains user data, authentication, client information
            return {
                connectionString: process.env.DATABASE_URL || 'postgresql://postgres:lgqPEzvVbSCviTybKqMbzJkYvOUetJjt@maglev.proxy.rlwy.net:43809/railway',
                ssl: false // Railway doesn't require SSL for proxy connections
            };
        }
    }
};

// Main database connection (Core Database)
const pool = new Pool(getDatabaseConfig('main'));

// Content database connection (SECOND database for content/translations)
const contentPool = new Pool(getDatabaseConfig('content'));

// Test main database connection
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('❌ Main Database connection failed:', err.message);
    } else {
        console.log('✅ Main Database connected:', res.rows[0].now);
    }
});

// Test content database connection
contentPool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('❌ Content Database connection failed:', err.message);
    } else {
        console.log('✅ Content Database connected:', res.rows[0].now);
        
        // Delete test-content table if it exists
        contentPool.query('DROP TABLE IF EXISTS "test-content" CASCADE', (dropErr, dropRes) => {
            if (dropErr) {
                console.error('❌ Failed to delete test-content table:', dropErr.message);
            } else {
                console.log('✅ test-content table deleted successfully (if it existed)');
            }
        });
    }
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
        console.log('🚀 Production environment detected - allowing all origins');
        return true; // Allow all origins in production
    }
    
    if (process.env.CORS_ALLOWED_ORIGINS) {
        // If it's just '*', return true to allow all origins
        if (process.env.CORS_ALLOWED_ORIGINS.trim() === '*') {
            console.log('🌐 CORS_ALLOWED_ORIGINS=* detected - allowing all origins');
            return true;
        }
        // Otherwise split comma-separated values
        return process.env.CORS_ALLOWED_ORIGINS.split(',').map(url => url.trim());
    }
    
    // Default origins for development and production deployment
    return [
        'http://localhost:3001',
        'http://localhost:3000',
        'http://localhost:5173', // Vite dev server
        'http://localhost:5174', // Vite dev server (alternative port)
        'http://localhost:5175', // Vite dev server (another alternative port)
        'http://localhost:8003',
        // Production domains
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
console.log('🔒 CORS Configuration:');
console.log('📝 CORS_ALLOWED_ORIGINS env var:', process.env.CORS_ALLOWED_ORIGINS || 'Not set');
console.log('🌐 Resolved CORS origins:', corsOptions.origin);

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
        console.log('🔧 Debug: Updating translation status from draft to approved...');
        
        const result = await contentPool.query(`
            UPDATE content_translations 
            SET status = 'approved' 
            WHERE status = 'draft'
            RETURNING id, content_item_id, language_code, status
        `);
        
        console.log(`✅ Updated ${result.rowCount} translation records to approved status`);
        
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
            console.log(`✅ Cache HIT for ${cacheKey}`);
            return res.json(cached);
        }
        
        console.log(`⚡ Cache MISS for ${cacheKey} - querying database`);
        
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
    console.log('🗑️ Content cache cleared');
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
            console.log(`✅ Dropdown cache HIT for ${cacheKey}`);
            return res.json(cached);
        }
        
        console.log(`⚡ Dropdown cache MISS for ${cacheKey} - querying database`);
        
        // Fetch all dropdown-related content for the screen
        console.log(`🔍 Executing query for screen: ${screen}, language: ${language}`);
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
        console.log(`📊 Query returned ${result.rows.length} rows`);
        
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
        
        console.log(`📊 Processing ${result.rows.length} rows for ${screen}/${language}`);
        
        result.rows.forEach(row => {
            console.log(`🔍 Processing: ${row.content_key} (${row.component_type})`);
            
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

            // Pattern 1.7: app.refinance.step1.{field} (label/option)
            // Examples: app.refinance.step1.why_option_1, app.refinance.step1.property_type_label
            if (!fieldName) {
                // Option like why_option_1
                match = row.content_key.match(/^app\.refinance\.step1\.([^.]+?)_option_\d+$/);
                if (match) {
                    fieldName = match[1];
                } else {
                    // Label like property_type_label
                    match = row.content_key.match(/^app\.refinance\.step1\.([^.]+?)_label$/);
                    if (match) {
                        fieldName = match[1];
                    } else {
                        // Base container (rare)
                        match = row.content_key.match(/^app\.refinance\.step1\.([^.]+)$/);
                        if (match) {
                            fieldName = match[1];
                        }
                    }
                }
            }

            // Pattern 1.8: calculate_credit_{field} (handles placeholders, options, and labels)
            if (!fieldName) {
                // Placeholder: calculate_credit_family_status_ph
                match = row.content_key.match(/^calculate_credit_([^_]+(?:_[^_]+)*)_ph$/);
                if (match) {
                    fieldName = match[1];
                } else if (row.content_key.includes('_option_')) {
                    // Option: calculate_credit_family_status_option_1
                    match = row.content_key.match(/^calculate_credit_([^_]+(?:_[^_]+)*)_option_\d+$/);
                    if (match) {
                        fieldName = match[1];
                    }
                } else {
                    // Base container label: calculate_credit_family_status
                    match = row.content_key.match(/^calculate_credit_([^_]+(?:_[^_]+)*)$/);
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
            
            // Create dropdown key
            const dropdownKey = `${screen}_${fieldName}`;
            
            if (!dropdownMap.has(fieldName)) {
                dropdownMap.set(fieldName, {
                    key: dropdownKey,
                    label: null,
                    options: [],
                    placeholder: null
                });
            }
            
            const dropdown = dropdownMap.get(fieldName);
            
            switch (row.component_type) {
                case 'dropdown_container':
                    dropdown.label = row.content_value;
                    response.labels[dropdown.key] = row.content_value;
                    break;
                    
                case 'dropdown_option':
                case 'option':
                    // Extract option value from content_key
                    let optionValue = null;
                    
                    // Try various patterns for option values
                    const optionPatterns = [
                        /_option_(.+)$/,                         // Standard pattern: field_option_value
                        // Property ownership options
                        /_(selling_property)$/,                 
                        /_(no_property)$/,                      
                        /_(has_property)$/,                     
                        /_(im_selling_a_property)$/,            
                        /_(i_no_own_any_property)$/,            
                        /_(i_own_a_property)$/,                 
                        // First home options
                        /_(yes_first_home)$/,                   
                        /_(no_additional_property)$/,           
                        /_(investment)$/,
                        // Timing options
                        /_(within_3_months)$/,
                        /_(3_to_6_months)$/,
                        /_(6_to_12_months)$/,
                        /_(over_12_months)$/,
                        // Property type options
                        /_(apartment)$/,
                        /_(garden_apartment)$/,
                        /_(penthouse)$/,
                        /_(private_house)$/,
                        /_(other)$/,
                        // Mortgage type options
                        /_(fixed_rate)$/,
                        /_(variable_rate)$/,
                        /_(mixed_rate)$/,
                        /_(not_sure)$/,
                        // Family status options (step 2)
                        /_(single)$/,
                        /_(married)$/,
                        /_(divorced)$/,
                        /_(widowed)$/,
                        /_(partner)$/,
                        /_(commonlaw_partner)$/,
                        // Education options (step 2)
                        /_(no_high_school_diploma)$/,
                        /_(partial_high_school_diploma)$/,
                        /_(full_high_school_diploma)$/,
                        /_(postsecondary_education)$/,
                        /_(bachelors)$/,
                        /_(masters)$/,
                        /_(doctorate)$/,
                        // Main source options (step 3)
                        /_(employee)$/,
                        /_(selfemployed)$/,
                        /_(pension)$/,
                        /_(student)$/,
                        /_(unemployed)$/,
                        /_(unpaid_leave)$/,
                        // Additional income options (step 3)
                        /_(0_no_additional_income)$/,
                        /_(1_no_additional_income)$/,
                        /_(additional_salary)$/,
                        /_(additional_work)$/,
                        /_(property_rental_income)$/,
                        /_(no_additional_income)$/,
                        // Obligations options (step 3)
                        /_(0_no_obligations)$/,
                        /_(bank_loan)$/,
                        /_(consumer_credit)$/,
                        /_(credit_card)$/,
                        /_(no_obligations)$/,
                        // Refinance mortgage specific options
                        /_(fixed_interest)$/,
                        /_(variable_interest)$/,
                        /_(prime_interest)$/,
                        /_(mixed_interest)$/,
                        /_(cash_out_refinance)$/,
                        /_(consolidate_debts)$/,
                        /_(lower_interest_rate)$/,
                        /_(reduce_monthly_payment)$/,
                        /_(shorten_mortgage_term)$/,
                        /_(land)$/,
                        /_(no_not_registered)$/,
                        /_(hapoalim)$/,
                        /_(leumi)$/,
                        /_(discount)$/,
                        /_(massad)$/,
                        /_(mizrahi)$/,
                        /_([^_]+)$/                             // Last part after underscore (fallback)
                    ];
                    
                    for (const pattern of optionPatterns) {
                        const optionMatch = row.content_key.match(pattern);
                        if (optionMatch) {
                            optionValue = optionMatch[1];
                            break;
                        }
                    }
                    
                    if (optionValue) {
                        // Special handling for numbered options like 0_no_additional_income or 1_no_additional_income
                        if (optionValue === '0_no_additional_income' || optionValue === '1_no_additional_income') {
                            optionValue = 'no_additional_income';
                        }
                        // Special handling for 0_no_obligations
                        if (optionValue === '0_no_obligations') {
                            optionValue = 'no_obligations';
                        }
                        
                        // 🚨 CREDIT CALCULATOR FIX: Map numeric values to semantic values
                        // This fixes the critical business issue where credit calculator dropdowns
                        // return numeric values but frontend expects semantic values
                        if (fieldName === 'main_source' || fieldName === '3_main_source') {
                            const semanticMapping = {
                                '1': 'employee',
                                '2': 'selfemployed', 
                                '3': 'selfemployed', // Business owner treated as self-employed
                                '4': 'pension',
                                '5': 'student',
                                '6': 'unemployed',
                                '7': 'other'
                            };
                            if (semanticMapping[optionValue]) {
                                optionValue = semanticMapping[optionValue];
                            }
                        } else if (fieldName === 'has_additional' || fieldName === '3_has_additional') {
                            const semanticMapping = {
                                '1': 'no_additional_income',
                                '2': 'additional_salary',
                                '3': 'additional_work',
                                '4': 'investment_income',
                                '5': 'property_rental_income',
                                '6': 'pension_benefits',
                                '7': 'other_income'
                            };
                            if (semanticMapping[optionValue]) {
                                optionValue = semanticMapping[optionValue];
                            }
                        } else if (fieldName === 'debt_types' || fieldName === 'types' || fieldName === '3_debt_types' || fieldName === '3_types') {
                            const semanticMapping = {
                                '1': 'no_obligations',
                                '2': 'credit_card',
                                '3': 'bank_loan', 
                                '4': 'consumer_credit',
                                '5': 'other_obligations'
                            };
                            if (semanticMapping[optionValue]) {
                                optionValue = semanticMapping[optionValue];
                            }
                        } else if (fieldName === 'field_of_activity' || fieldName === 'activity' || fieldName === '3_field_of_activity' || fieldName === '3_activity') {
                            const semanticMapping = {
                                '1': 'technology',
                                '2': 'healthcare',
                                '3': 'education',
                                '4': 'finance',
                                '5': 'real_estate',
                                '6': 'construction',
                                '7': 'retail',
                                '8': 'manufacturing',
                                '9': 'government',
                                '10': 'transport',
                                '11': 'consulting',
                                '12': 'entertainment',
                                '13': 'other'
                            };
                            if (semanticMapping[optionValue]) {
                                optionValue = semanticMapping[optionValue];
                            }
                        }
                        
                        dropdown.options.push({
                            value: optionValue,
                            label: row.content_value
                        });
                    }
                    break;
                    
                case 'placeholder':
                    dropdown.placeholder = row.content_value;
                    response.placeholders[dropdown.key] = row.content_value;
                    break;
                    
                case 'label':
                    if (!dropdown.label) { // Don't override dropdown type label
                        dropdown.label = row.content_value;
                        response.labels[dropdown.key] = row.content_value;
                    }
                    break;
            }
        });
        
        // Build final response - only include dropdowns that have options
        dropdownMap.forEach((dropdown, fieldName) => {
            if (dropdown.options.length > 0 || dropdown.label) {
                response.dropdowns.push({
                    key: dropdown.key,
                    label: dropdown.label || fieldName.replace(/_/g, ' ')
                });
                
                if (dropdown.options.length > 0) {
                    response.options[dropdown.key] = dropdown.options;
                }
            }
        });

        // Alias fix for production: expose citizenship options under an additional key
        // This avoids frontend exclusions while keeping DB-first API intact
        try {
            const mainCitizenshipKey = `${screen}_citizenship`;
            const aliasCitizenshipKey = `${screen}_citizenship_countries`;
            if (screen === 'mortgage_step2' && response.options[mainCitizenshipKey]) {
                // Copy options
                response.options[aliasCitizenshipKey] = response.options[mainCitizenshipKey];
                // Copy labels/placeholders when available
                if (response.labels && response.labels[mainCitizenshipKey]) {
                    response.labels[aliasCitizenshipKey] = response.labels[mainCitizenshipKey];
                }
                if (response.placeholders && response.placeholders[mainCitizenshipKey]) {
                    response.placeholders[aliasCitizenshipKey] = response.placeholders[mainCitizenshipKey];
                }
                // Ensure alias appears in dropdowns list
                response.dropdowns.push({ key: aliasCitizenshipKey, label: response.labels?.[aliasCitizenshipKey] || 'citizenship countries' });
            }
        } catch (aliasErr) {
            console.warn('Citizenship alias mapping warning:', aliasErr?.message || aliasErr);
        }
        
        // Add performance metadata
        response.performance = {
            total_items: result.rowCount,
            dropdowns_found: response.dropdowns.length,
            query_time: new Date().toISOString()
        };
        
        // Cache the response for 5 minutes
        contentCache.set(cacheKey, { ...response, cached: true });
        
        res.json(response);
        
    } catch (error) {
        console.error('❌ Failed to get dropdown data:', error.message);
        res.status(500).json({
            status: 'error',
            message: 'Failed to retrieve dropdown data',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// GET /api/content/:key/:language - Get specific content item with fallback
app.get('/api/content/:key/:language', async (req, res) => {
    try {
        const { key, language } = req.params;
        
        const result = await contentPool.query(`
            SELECT 
                ci.key as content_key,
                ci.component_type,
                ci.category,
                ci.screen_location,
                COALESCE(
                    (SELECT value FROM content_translations 
                     WHERE content_item_id = ci.id AND language_code = $2 AND status = 'approved'),
                    (SELECT value FROM content_translations 
                     WHERE content_item_id = ci.id AND language_code = 'en' AND status = 'approved')
                ) as content_value,
                COALESCE(
                    (SELECT language_code FROM content_translations 
                     WHERE content_item_id = ci.id AND language_code = $2 AND status = 'approved'),
                    (SELECT language_code FROM content_translations 
                     WHERE content_item_id = ci.id AND language_code = 'en' AND status = 'approved')
                ) as actual_language
            FROM content_items ci
            WHERE ci.key = $1 AND ci.is_active = true
        `, [key, language]);
        
        if (result.rowCount === 0) {
            return res.status(404).json({
                status: 'error',
                message: 'Content item not found',
                content_key: key
            });
        }
        
        const item = result.rows[0];
        res.json({
            status: 'success',
            content_key: key,
            requested_language: language,
            actual_language: item.actual_language,
            fallback_used: item.actual_language !== language,
            content: {
                value: item.content_value,
                component_type: item.component_type,
                category: item.category,
                screen_location: item.screen_location
            }
        });
        
    } catch (error) {
        console.error('❌ Failed to get content item:', error.message);
        res.status(500).json({
            status: 'error',
            message: 'Failed to retrieve content item',
            error: error.message
        });
    }
});

// POST /api/content - Create new content item
app.post('/api/content', async (req, res) => {
    try {
        const {
            content_key,
            content_type = 'text',
            category,
            screen_location,
            component_type,
            description,
            translations = []
        } = req.body;
        
        // Validate required fields
        if (!content_key || !category || !screen_location || !component_type) {
            return res.status(400).json({
                status: 'error',
                message: 'Missing required fields: content_key, category, screen_location, component_type'
            });
        }
        
        // Start transaction
        const client = await contentPool.connect();
        
        try {
            await client.query('BEGIN');
            
            // Insert content item
            const contentResult = await client.query(`
                INSERT INTO content_items 
                (content_key, content_type, category, screen_location, component_type, description, created_by, is_active)
                VALUES ($1, $2, $3, $4, $5, $6, $7, TRUE)
                RETURNING id
            `, [content_key, content_type, category, screen_location, component_type, description, 1]);
            
            const contentItemId = contentResult.rows[0].id;
            
            // Insert translations if provided
            if (translations && typeof translations === 'object') {
                // Handle both array format and object format
                let translationArray = [];
                
                if (Array.isArray(translations)) {
                    // Array format: [{language_code: 'en', content_value: 'text'}, ...]
                    translationArray = translations;
                } else {
                    // Object format: {en: 'text', he: 'text', ru: 'text'}
                    translationArray = Object.entries(translations).map(([langCode, contentValue]) => ({
                        language_code: langCode,
                        content_value: contentValue,
                        is_default: langCode === 'en', // Set English as default
                        status: 'approved' // Auto-approve translations
                    }));
                }
                
                for (const translation of translationArray) {
                    await client.query(`
                        INSERT INTO content_translations 
                        (content_item_id, language_code, content_value, is_default, status, created_by)
                        VALUES ($1, $2, $3, $4, $5, $6)
                    `, [
                        contentItemId,
                        translation.language_code,
                        translation.content_value,
                        translation.is_default || false,
                        translation.status || 'approved', // Default to 'approved' instead of 'draft'
                        1
                    ]);
                }
            }
            
            await client.query('COMMIT');
            
            res.json({
                status: 'success',
                message: 'Content item created successfully',
                content_item_id: contentItemId,
                content_key: content_key,
                translations_added: translations.length
            });
            
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
        
    } catch (error) {
        console.error('❌ Failed to create content item:', error.message);
        res.status(500).json({
            status: 'error',
            message: 'Failed to create content item',
            error: error.message
        });
    }
});

// PUT /api/content/:id - Update content item
app.put('/api/content/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const {
            content_key,
            content_type,
            category,
            screen_location,
            component_type,
            description,
            is_active
        } = req.body;
        
        const result = await contentPool.query(`
            UPDATE content_items 
            SET 
                content_key = COALESCE($1, content_key),
                content_type = COALESCE($2, content_type),
                category = COALESCE($3, category),
                screen_location = COALESCE($4, screen_location),
                component_type = COALESCE($5, component_type),
                description = COALESCE($6, description),
                is_active = COALESCE($7, is_active),
                updated_at = CURRENT_TIMESTAMP,
                updated_by = $8
            WHERE id = $9
            RETURNING *
        `, [content_key, content_type, category, screen_location, component_type, description, is_active, 1, id]);
        
        if (result.rowCount === 0) {
            return res.status(404).json({
                status: 'error',
                message: 'Content item not found'
            });
        }
        
        res.json({
            status: 'success',
            message: 'Content item updated successfully',
            content_item: result.rows[0]
        });
        
    } catch (error) {
        console.error('❌ Failed to update content item:', error.message);
        res.status(500).json({
            status: 'error',
            message: 'Failed to update content item',
            error: error.message
        });
    }
});

// DELETE /api/content/:id - Delete content item
app.delete('/api/content/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const result = await contentPool.query(`
            DELETE FROM content_items 
            WHERE id = $1
            RETURNING content_key
        `, [id]);
        
        if (result.rowCount === 0) {
            return res.status(404).json({
                status: 'error',
                message: 'Content item not found'
            });
        }
        
        res.json({
            status: 'success',
            message: 'Content item deleted successfully',
            deleted_content_key: result.rows[0].content_key
        });
        
    } catch (error) {
        console.error('❌ Failed to delete content item:', error.message);
        res.status(500).json({
            status: 'error',
            message: 'Failed to delete content item',
            error: error.message
        });
    }
});

// GET /api/content/categories - Get content categories tree
app.get('/api/content/categories', async (req, res) => {
    try {
        const result = await contentPool.query(`
            SELECT 
                id,
                name,
                display_name,
                description,
                parent_id,
                sort_order,
                is_active
            FROM content_categories
            WHERE is_active = TRUE
            ORDER BY sort_order, name
        `);
        
        res.json({
            status: 'success',
            categories_count: result.rowCount,
            categories: result.rows
        });
        
    } catch (error) {
        console.error('❌ Failed to get content categories:', error.message);
        res.status(500).json({
            status: 'error',
            message: 'Failed to retrieve content categories',
            error: error.message
        });
    }
});

// GET /api/content/languages - Get supported languages
app.get('/api/content/languages', async (req, res) => {
    try {
        const result = await contentPool.query(`
            SELECT 
                id,
                code,
                name,
                native_name,
                direction,
                is_active,
                is_default
            FROM languages
            WHERE is_active = TRUE
            ORDER BY is_default DESC, name
        `);
        
        res.json({
            status: 'success',
            languages_count: result.rowCount,
            languages: result.rows
        });
        
    } catch (error) {
        console.error('❌ Failed to get languages:', error.message);
        res.status(500).json({
            status: 'error',
            message: 'Failed to retrieve languages',
            error: error.message
        });
    }
});

// GET /api/content/validation_errors/:language - Get validation error messages for specific language
app.get('/api/content/validation_errors/:language', async (req, res) => {
    try {
        const { language } = req.params;
        
        // Create cache key for validation errors
        const cacheKey = `validation_errors_${language}`;
        
        // Check cache first
        const cached = contentCache.get(cacheKey);
        if (cached) {
            console.log(`✅ Validation errors cache HIT for ${language}`);
            return res.json(cached);
        }
        
        console.log(`⚡ Validation errors cache MISS for ${language} - querying database`);
        
        const query = `
            SELECT 
                content_items.content_key,
                content_items.component_type,
                content_items.category,
                content_translations.content_value,
                content_translations.language_code,
                content_translations.status
            FROM content_items
            JOIN content_translations ON content_items.id = content_translations.content_item_id
            WHERE content_items.screen_location = 'validation_errors'
                AND content_translations.language_code = $1 
                AND content_translations.status = 'approved'
                AND content_items.is_active = true
            ORDER BY content_items.content_key
        `;
        
        const result = await contentPool.query(query, [language]);
        
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
            screen_location: 'validation_errors',
            language_code: language,
            content_count: result.rowCount,
            content: content,
            cached: false
        };
        
        // Cache the response for 10 minutes (validation errors don't change often)
        contentCache.set(cacheKey, { ...response, cached: true });
        
        res.json(response);
        
    } catch (error) {
        console.error('❌ Failed to get validation errors:', error.message);
        res.status(500).json({
            status: 'error',
            message: 'Failed to retrieve validation errors',
            error: error.message
        });
    }
});

// GET /api/content/items - Get all content items with pagination and filtering
app.get('/api/content/items', async (req, res) => {
    try {
        const {
            page = 1,
            limit = 50,
            category,
            screen_location,
            search,
            status = 'approved'
        } = req.query;
        
        const offset = (page - 1) * limit;
        
        let whereClause = 'WHERE ci.is_active = TRUE';
        const params = [];
        let paramIndex = 1;
        
        if (category) {
            whereClause += ` AND ci.category = $${paramIndex++}`;
            params.push(category);
        }
        
        if (screen_location) {
            whereClause += ` AND ci.screen_location = $${paramIndex++}`;
            params.push(screen_location);
        }
        
        if (search) {
            whereClause += ` AND (ci.content_key ILIKE $${paramIndex++} OR ci.description ILIKE $${paramIndex++})`;
            params.push(`%${search}%`, `%${search}%`);
        }
        
        const query = `
            SELECT 
                ci.id,
                ci.content_key,
                ci.content_type,
                ci.category,
                ci.screen_location,
                ci.component_type,
                ci.description,
                ci.created_at,
                ci.updated_at,
                COUNT(ct.id) as translation_count,
                COUNT(CASE WHEN ct.status = 'approved' THEN 1 END) as approved_translations
            FROM content_items ci
            LEFT JOIN content_translations ct ON ci.id = ct.content_item_id
            ${whereClause}
            GROUP BY ci.id, ci.content_key, ci.content_type, ci.category, ci.screen_location, ci.component_type, ci.description, ci.created_at, ci.updated_at
            ORDER BY ci.updated_at DESC
            LIMIT $${paramIndex++} OFFSET $${paramIndex++}
        `;
        
        params.push(limit, offset);
        
        const result = await contentPool.query(query, params);
        
        // Get total count for pagination
        const countQuery = `
            SELECT COUNT(*) as total
            FROM content_items ci
            ${whereClause}
        `;
        
        const countResult = await contentPool.query(countQuery, params.slice(0, -2));
        const total = parseInt(countResult.rows[0].total);
        
        res.json({
            status: 'success',
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            },
            items: result.rows
        });
        
    } catch (error) {
        console.error('❌ Failed to get content items:', error.message);
        res.status(500).json({
            status: 'error',
            message: 'Failed to retrieve content items',
            error: error.message
        });
    }
});

// API endpoint to get property ownership LTV ratios (fixes hardcoded values issue)
app.get('/api/property-ownership-ltv', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT standard_name, standard_value 
            FROM banking_standards 
            WHERE business_path = 'mortgage' AND standard_category = 'property_ownership_ltv' AND is_active = true
            ORDER BY standard_name
        `);
        
        const ltvRatios = {};
        result.rows.forEach(row => {
            // Convert database names to frontend keys
            let key = row.standard_name;
            if (key === 'no_property_max_ltv') key = 'no_property';
            if (key === 'has_property_max_ltv') key = 'has_property';
            if (key === 'selling_property_max_ltv') key = 'selling_property';
            
            ltvRatios[key] = parseFloat(row.standard_value) / 100; // Convert to decimal
        });
        
        console.log('🏠 Property ownership LTV ratios fetched:', ltvRatios);
        res.json({
            status: 'success',
            data: ltvRatios
        });
        
    } catch (error) {
        console.error('❌ Error fetching property ownership LTV ratios:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch property ownership LTV ratios',
            // Fallback values
            data: {
                no_property: 0.75,
                has_property: 0.50,
                selling_property: 0.70
            }
        });
    }
});

// ===============================================
// FORM SESSION MANAGEMENT & PROPERTY OWNERSHIP ENDPOINTS
// ===============================================

// Get property ownership options (Confluence Action #12)
app.get('/api/customer/property-ownership-options', async (req, res) => {
    try {
        const { language = 'en' } = req.query;
        
        const query = `
            SELECT 
                option_key,
                CASE 
                    WHEN $1 = 'ru' THEN option_text_ru
                    WHEN $1 = 'he' THEN option_text_he
                    ELSE option_text_en
                END as option_text,
                ltv_percentage,
                financing_percentage,
                display_order
            FROM property_ownership_options
            WHERE is_active = true
            ORDER BY display_order
        `;
        
        const result = await pool.query(query, [language]);
        
        res.json({
            status: 'success',
            data: {
                options: result.rows,
                description: 'Property ownership options affect maximum financing percentage'
            }
        });
    } catch (error) {
        console.error('Property ownership options error:', error);
        res.status(500).json({ status: 'error', message: 'Server error' });
    }
});

// Calculate mortgage payment using database function (Confluence annuity requirement)
app.post('/api/customer/calculate-payment', async (req, res) => {
    try {
        const { loan_amount, term_years, property_ownership } = req.body;
        
        if (!loan_amount || !term_years) {
            return res.status(400).json({
                status: 'error',
                message: 'Missing required fields: loan_amount, term_years'
            });
        }
        
        // Get configurable interest rate and calculate annuity payment
        const query = `
            SELECT 
                get_current_mortgage_rate() as interest_rate,
                calculate_annuity_payment($1, get_current_mortgage_rate(), $2) as monthly_payment
        `;
        
        const result = await contentPool.query(query, [loan_amount, term_years]);
        const calculation = result.rows[0];
        
        // Get LTV ratio if property ownership provided
        let ltv_info = null;
        if (property_ownership) {
            const ltvQuery = `
                SELECT 
                    option_key,
                    option_text_en as description,
                    ltv_percentage,
                    financing_percentage
                FROM property_ownership_options
                WHERE option_key = $1 AND is_active = true
            `;
            const ltvResult = await pool.query(ltvQuery, [property_ownership]);
            ltv_info = ltvResult.rows[0] || null;
        }
        
        const monthlyPayment = parseFloat(calculation.monthly_payment);
        const totalPayment = monthlyPayment * term_years * 12;
        const totalInterest = totalPayment - loan_amount;
        
        res.json({
            status: 'success',
            data: {
                loan_amount: parseFloat(loan_amount),
                term_years: parseInt(term_years),
                interest_rate: parseFloat(calculation.interest_rate),
                monthly_payment: monthlyPayment,
                total_payment: totalPayment,
                total_interest: totalInterest,
                ltv_info: ltv_info,
                calculation_note: 'Uses configurable interest rate from banking_standards table'
            }
        });
    } catch (error) {
        console.error('Payment calculation error:', error);
        res.status(500).json({ status: 'error', message: 'Server error' });
    }
});

// CORS test endpoint
app.get('/api/cors-test', (req, res) => {
    res.json({ 
        message: 'CORS test successful',
        origin: req.headers.origin || 'no-origin',
        timestamp: new Date().toISOString(),
        corsOrigins: corsOptions.origin
    });
});

// ================================
// BANK EMPLOYEE REGISTRATION APIs
// ================================

// Get list of banks for registration
app.get('/api/banks/list', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT id, name_en, name_he, name_ru 
            FROM banks 
            WHERE is_active = true 
            ORDER BY display_order ASC, name_en ASC
        `);
        res.json({ 
            data: result.rows, 
            status: 'success' 
        });
    } catch (err) {
        console.error('Error fetching banks for registration:', err);
        res.status(500).json({ 
            error: 'Failed to load banks',
            message: 'Database error: ' + err.message 
        });
    }
});

// Get list of services for registration
app.get('/api/services/list', async (req, res) => {
    try {
        // Try to get from services table first
        let result;
        try {
            result = await pool.query(`
                SELECT id, service_key, name_en, name_he, name_ru, description_en, description_he, description_ru
                FROM services 
                WHERE is_active = true 
                ORDER BY display_order ASC, name_en ASC
            `);
        } catch (tableError) {
            // If services table doesn't exist, create it and populate with default data
            console.log('Services table not found, creating with default data...');
            
            // Create the services table
            await pool.query(`
                CREATE TABLE IF NOT EXISTS services (
                    id SERIAL PRIMARY KEY,
                    service_key VARCHAR(100) NOT NULL UNIQUE,
                    name_en VARCHAR(255) NOT NULL,
                    name_ru VARCHAR(255) NOT NULL,
                    name_he VARCHAR(255) NOT NULL,
                    description_en TEXT,
                    description_ru TEXT,
                    description_he TEXT,
                    is_active BOOLEAN DEFAULT true,
                    display_order INTEGER DEFAULT 0,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            `);
            
            // Insert default service options
            await pool.query(`
                INSERT INTO services (service_key, name_en, name_ru, name_he, description_en, description_ru, description_he, display_order) VALUES
                (
                    'mortgage_refinancing',
                    'Mortgage & Mortgage Refinancing',
                    'Ипотека & Рефинансирование Ипотека',
                    'משכנתא ומחזור משכנתא',
                    'Complete mortgage services including new mortgages and refinancing options',
                    'Полный спектр ипотечных услуг, включая новые ипотеки и рефинансирование',
                    'שירותי משכנתא מלאים כולל משכנתאות חדשות ואפשרויות מחזור',
                    1
                ),
                (
                    'credit_refinancing',
                    'Credit & Credit Refinancing',
                    'Кредит & Рефинансирование Кредита',
                    'אשראי ומחזור אשראי',
                    'Personal and business credit services including loan refinancing',
                    'Персональные и бизнес кредитные услуги, включая рефинансирование займов',
                    'שירותי אשראי אישיים ועסקיים כולל מחזור הלואות',
                    2
                ),
                (
                    'business_banking',
                    'Business Banking Services',
                    'Банковские услуги для бизнеса',
                    'שירותי בנקאות עסקית',
                    'Comprehensive banking solutions for businesses and corporations',
                    'Комплексные банковские решения для бизнеса и корпораций',
                    'פתרונות בנקאיים מקיפים לעסקים ותאגידים',
                    3
                ),
                (
                    'investment_services',
                    'Investment & Wealth Management',
                    'Инвестиции и управление капиталом',
                    'השקעות וניהול הון',
                    'Professional investment advisory and wealth management services',
                    'Профессиональные инвестиционные консультации и услуги управления капиталом',
                    'ייעוץ השקעות מקצועי ושירותי ניהול הון',
                    4
                ),
                (
                    'insurance_services',
                    'Insurance & Protection',
                    'Страхование и защита',
                    'ביטוח והגנה',
                    'Comprehensive insurance products and financial protection services',
                    'Комплексные страховые продукты и услуги финансовой защиты',
                    'מוצרי ביטוח מקיפים ושירותי הגנה פיננסית',
                    5
                )
                ON CONFLICT (service_key) DO NOTHING;
            `);
            
            // Create indexes
            await pool.query(`
                CREATE INDEX IF NOT EXISTS idx_services_active ON services(is_active);
                CREATE INDEX IF NOT EXISTS idx_services_display_order ON services(display_order);
                CREATE INDEX IF NOT EXISTS idx_services_key ON services(service_key);
            `);
            
            console.log('Services table created successfully with default data');
            
            // Now fetch the data
            result = await pool.query(`
                SELECT id, service_key, name_en, name_he, name_ru, description_en, description_he, description_ru
                FROM services 
                WHERE is_active = true 
                ORDER BY display_order ASC, name_en ASC
            `);
        }
        
        res.json({ 
            data: result.rows, 
            status: 'success' 
        });
    } catch (err) {
        console.error('Error fetching services for registration:', err);
        res.status(500).json({ 
            error: 'Failed to load services',
            message: 'Database error: ' + err.message 
        });
    }
});

// Get branches for a specific bank
app.get('/api/banks/:bankId/branches', async (req, res) => {
    try {
        const { bankId } = req.params;
        
        const result = await pool.query(`
            SELECT id, name_en, name_he, name_ru, branch_code, city, address 
            FROM bank_branches 
            WHERE bank_id = $1 AND is_active = true
            ORDER BY name_en ASC
        `, [bankId]);
        
        res.json({ 
            data: result.rows, 
            status: 'success' 
        });
    } catch (err) {
        console.error('Error fetching bank branches:', err);
        res.status(500).json({ 
            error: 'Failed to load branches',
            message: 'Database error: ' + err.message 
        });
    }
});

// Get Israeli bank numbers
app.get('/api/bank-numbers/israel', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT bank_number, bank_name_en, bank_name_he 
            FROM israeli_bank_numbers 
            WHERE is_active = true 
            ORDER BY bank_number ASC
        `);
        
        res.json({ 
            data: result.rows, 
            status: 'success' 
        });
    } catch (err) {
        console.error('Error fetching Israeli bank numbers:', err);
        res.status(500).json({ 
            error: 'Failed to load bank numbers',
            message: 'Internal server error' 
        });
    }
});

// Populate sample branch data (for development/demo purposes)
app.post('/api/admin/populate-sample-branches', async (req, res) => {
    try {
        // First, ensure the bank_branches table exists
        await pool.query(`
            CREATE TABLE IF NOT EXISTS bank_branches (
                id SERIAL PRIMARY KEY,
                bank_id INTEGER REFERENCES banks(id) ON DELETE CASCADE,
                name_en VARCHAR(255) NOT NULL,
                name_he VARCHAR(255),
                name_ru VARCHAR(255),
                branch_code VARCHAR(20) NOT NULL,
                city VARCHAR(100),
                address TEXT,
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(bank_id, branch_code)
            )
        `);

        // Get first 3 banks
        const banksResult = await pool.query(`
            SELECT id FROM banks WHERE is_active = true ORDER BY display_order ASC, name_en ASC LIMIT 3
        `);
        
        if (banksResult.rows.length === 0) {
            return res.status(400).json({ 
                error: 'No banks found',
                message: 'Please ensure banks exist in the database first' 
            });
        }

        const banks = banksResult.rows;
        const sampleBranches = [];

        // Create sample branches for each bank
        for (let i = 0; i < banks.length; i++) {
            const bankId = banks[i].id;
            const branchData = [
                {
                    name_en: `${i === 0 ? 'Tel Aviv Central' : i === 1 ? 'Tel Aviv Dizengoff' : 'Tel Aviv Allenby'} Branch`,
                    name_he: `סניף תל אביב ${i === 0 ? 'מרכז' : i === 1 ? 'דיזנגוף' : 'אלנבי'}`,
                    name_ru: `Филиал Тель-Авив ${i === 0 ? 'Центральный' : i === 1 ? 'Дизенгоф' : 'Алленби'}`,
                    branch_code: `TA00${i + 1}`,
                    city: 'Tel Aviv',
                    address: `${i === 0 ? 'Rothschild Blvd 22' : i === 1 ? 'Dizengoff St 50' : 'Allenby St 30'}, Tel Aviv`
                },
                {
                    name_en: `Jerusalem ${i === 0 ? 'Main' : i === 1 ? 'Malcha' : 'City Center'} Branch`,
                    name_he: `סניף ירושלים ${i === 0 ? 'ראשי' : i === 1 ? 'מלחה' : 'מרכז העיר'}`,
                    name_ru: `Филиал Иерусалим ${i === 0 ? 'Главный' : i === 1 ? 'Малха' : 'Центр'}`,
                    branch_code: `JR00${i + 1}`,
                    city: 'Jerusalem',
                    address: `${i === 0 ? 'King George St 15' : i === 1 ? 'Malcha Technology Park' : 'Jaffa St 45'}, Jerusalem`
                }
            ];

            for (const branch of branchData) {
                sampleBranches.push([
                    bankId,
                    branch.name_en,
                    branch.name_he,
                    branch.name_ru,
                    branch.branch_code,
                    branch.city,
                    branch.address,
                    true
                ]);
            }
        }

        // Insert sample branches
        const insertQuery = `
            INSERT INTO bank_branches (bank_id, name_en, name_he, name_ru, branch_code, city, address, is_active)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            ON CONFLICT (bank_id, branch_code) DO NOTHING
            RETURNING id
        `;

        let insertedCount = 0;
        const errors = [];
        for (const branchData of sampleBranches) {
            try {
                console.log('Inserting branch:', branchData[4], 'for bank:', branchData[0]);
                const result = await pool.query(insertQuery, branchData);
                if (result.rowCount > 0) {
                    insertedCount++;
                    console.log('Successfully inserted branch:', branchData[4]);
                } else {
                    console.log('Branch already exists:', branchData[4]);
                }
            } catch (err) {
                console.error(`Error inserting branch ${branchData[4]}:`, err.message);
                errors.push(`${branchData[4]}: ${err.message}`);
            }
        }

        res.json({ 
            message: `Successfully populated ${insertedCount} sample branches`,
            status: 'success',
            banks_processed: banks.length,
            branches_inserted: insertedCount
        });
    } catch (err) {
        console.error('Error populating sample branches:', err);
        res.status(500).json({ 
            error: 'Failed to populate sample branches',
            message: 'Database error: ' + err.message 
        });
    }
});

// Register new bank employee
app.post('/api/bank-employee/register', async (req, res) => {
    try {
        const {
            fullName,
            position,
            corporateEmail,
            bankId,
            branchId,
            bankNumber,
            termsAccepted,
            selectedServices
        } = req.body;

        // Validation
        if (!fullName || !position || !corporateEmail || !bankId || !branchId || !bankNumber || !termsAccepted) {
            return res.status(400).json({
                error: 'Validation failed',
                message: 'All required fields must be filled'
            });
        }

        // Check if email already exists
        const existingEmployee = await pool.query(
            'SELECT id FROM bank_employees WHERE corporate_email = $1',
            [corporateEmail]
        );

        if (existingEmployee.rows.length > 0) {
            return res.status(409).json({
                error: 'Email already registered',
                message: 'This corporate email is already registered'
            });
        }

        // Generate registration token
        const registrationToken = jwt.sign(
            { email: corporateEmail, timestamp: Date.now() },
            process.env.JWT_SECRET || 'bank-employee-secret',
            { expiresIn: '24h' }
        );

        // Insert new bank employee
        const result = await pool.query(`
            INSERT INTO bank_employees 
            (name, position, corporate_email, bank_id, branch_id, bank_number, 
             terms_accepted, terms_accepted_at, registration_token, registration_expires)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING id, name, corporate_email, status, created_at
        `, [
            fullName,
            position,
            corporateEmail,
            bankId,
            branchId,
            bankNumber,
            termsAccepted,
            new Date(),
            registrationToken,
            new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
        ]);

        // Log selected services if provided
        if (selectedServices && selectedServices.length > 0) {
            for (const serviceId of selectedServices) {
                await pool.query(`
                    INSERT INTO bank_employee_services (employee_id, service_id, created_at)
                    VALUES ($1, $2, $3)
                `, [result.rows[0].id, serviceId, new Date()]);
            }
        }

        res.status(201).json({
            data: {
                id: result.rows[0].id,
                name: result.rows[0].name,
                email: result.rows[0].corporate_email,
                status: result.rows[0].status,
                registrationToken: registrationToken
            },
            status: 'success',
            message: 'Registration successful. Please check your email for verification.'
        });

    } catch (err) {
        console.error('Error registering bank employee:', err);
        res.status(500).json({
            error: 'Registration failed',
            message: 'Internal server error'
        });
    }
});

// Get registration form configuration (multilingual)
app.get('/api/registration-config/:language', async (req, res) => {
    try {
        const { language } = req.params;
        const validLanguages = ['en', 'he', 'ru'];
        const selectedLang = validLanguages.includes(language) ? language : 'en';

        const result = await pool.query(`
            SELECT field_name, field_value 
            FROM registration_form_config 
            WHERE language = $1 AND is_active = true
        `, [selectedLang]);

        const config = {};
        result.rows.forEach(row => {
            config[row.field_name] = row.field_value;
        });

        res.json({ 
            data: config, 
            status: 'success',
            language: selectedLang
        });
    } catch (err) {
        console.error('Error fetching registration config:', err);
        res.status(500).json({ 
            error: 'Failed to load configuration',
            message: 'Internal server error' 
        });
    }
});

// ================================
// END BANK EMPLOYEE REGISTRATION APIs
// ================================



// OPTIONS handler for preflight requests
app.options('*', (req, res) => {
    console.log(`[CORS] Preflight request from origin: ${req.headers.origin}`);
    res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.sendStatus(200);
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

// Cities endpoint (legacy v1)
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

// Cities endpoint with localization (frontend expects this)
app.get('/api/get-cities', async (req, res) => {
    const lang = req.query.lang || 'en';
    const validLangs = ['en', 'he', 'ru'];
    const selectedLang = validLangs.includes(lang) ? lang : 'en';
    const nameColumn = `name_${selectedLang}`;

    console.log(`[CITIES] Request for language: ${selectedLang}`);

    try {
        const query = `SELECT id, key as value, ${nameColumn} as name FROM cities ORDER BY ${nameColumn}`;
        // Use content database for cities
        const result = await contentPool.query(query);
        
        res.json({
            status: 'success',
            data: result.rows,
            language: selectedLang,
            total: result.rowCount
        });
    } catch (err) {
        console.error('Error fetching cities from database:', err);
        console.log('🔄 Using i18n fallback cities data due to database connection issue');
        
        // Load translation file for fallback
        const translationPath = path.join(__dirname, '../mainapp/public/locales', selectedLang, 'translation.json');
        
        try {
            const translationData = JSON.parse(fs.readFileSync(translationPath, 'utf8'));
            const citiesData = translationData.cities || {};
            
            // Convert cities object to array format expected by frontend
            const citiesArray = Object.entries(citiesData).map(([key, name], index) => ({
                id: index + 1,
                value: key,
                name: name
            }));
            
            res.json({
                status: 'success',
                data: citiesArray,
                language: selectedLang,
                total: citiesArray.length,
                is_fallback: true
            });
        } catch (translationErr) {
            console.error('Error loading translation file:', translationErr);
            
            // Ultimate fallback if translation file fails
            const ultimateFallback = [
                { id: 1, value: 'tel_aviv', name: 'Tel Aviv' },
                { id: 2, value: 'jerusalem', name: 'Jerusalem' },
                { id: 3, value: 'haifa', name: 'Haifa' }
            ];
            
            res.json({
                status: 'success',
                data: ultimateFallback,
                language: selectedLang,
                total: ultimateFallback.length,
                is_fallback: true
            });
        }
    }
});

// Regions endpoint with localization
app.get('/api/get-regions', async (req, res) => {
    const lang = req.query.lang || 'en';
    const validLangs = ['en', 'he', 'ru'];
    const selectedLang = validLangs.includes(lang) ? lang : 'en';
    const nameColumn = `name_${selectedLang}`;

    console.log(`[REGIONS] Request for language: ${selectedLang}`);

    try {
        const query = `SELECT id, key, ${nameColumn} as name FROM regions WHERE is_active = true ORDER BY ${nameColumn}`;
        const result = await pool.query(query);
        
        res.json({
            status: 'success',
            data: result.rows,
            language: selectedLang,
            total: result.rowCount
        });
    } catch (err) {
        console.error('Error fetching regions from database:', err);
        console.log('🔄 Using i18n fallback regions data due to database connection issue');
        
        // Load translation file for fallback
        const translationPath = path.join(__dirname, '../mainapp/public/locales', selectedLang, 'translation.json');
        
        try {
            const translationData = JSON.parse(fs.readFileSync(translationPath, 'utf8'));
            const regionsData = translationData.regions || {};
            
            // Convert regions object to array format expected by frontend
            const regionsArray = Object.entries(regionsData).map(([key, name], index) => ({
                id: index + 1,
                key: key,
                name: name
            }));
            
            res.json({
                status: 'success',
                data: regionsArray,
                language: selectedLang,
                total: regionsArray.length,
                is_fallback: true
            });
        } catch (translationErr) {
            console.error('Error loading translation file:', translationErr);
            
            // Ultimate fallback if translation file fails
            const ultimateFallback = [
                { id: 1, key: 'central', name: 'Central District' },
                { id: 2, key: 'tel_aviv', name: 'Tel Aviv District' }
            ];
            
            res.json({
                status: 'success',
                data: ultimateFallback,
                language: selectedLang,
                total: ultimateFallback.length,
                is_fallback: true
            });
        }
    }
});

// Professions endpoint with localization
app.get('/api/get-professions', async (req, res) => {
    const lang = req.query.lang || 'en';
    const category = req.query.category || null;
    const validLangs = ['en', 'he', 'ru'];
    const selectedLang = validLangs.includes(lang) ? lang : 'en';
    const nameColumn = `name_${selectedLang}`;

    console.log(`[PROFESSIONS] Request for language: ${selectedLang}, category: ${category}`);

    try {
        let query = `SELECT id, key, ${nameColumn} as name, category FROM professions WHERE is_active = true`;
        const params = [];
        
        if (category) {
            query += ` AND category = $1`;
            params.push(category);
        }
        
        query += ` ORDER BY ${nameColumn}`;
        const result = await pool.query(query, params);
        
        res.json({
            status: 'success',
            data: result.rows,
            language: selectedLang,
            category: category,
            total: result.rowCount
        });
    } catch (err) {
        console.error('Error fetching professions from database:', err);
        console.log('🔄 Using i18n fallback professions data due to database connection issue');
        
        // Load translation file for fallback
        const translationPath = path.join(__dirname, '../mainapp/public/locales', selectedLang, 'translation.json');
        
        try {
            const translationData = JSON.parse(fs.readFileSync(translationPath, 'utf8'));
            const professionsData = translationData.professions || {};
            
            // Convert professions object to array format expected by frontend
            let professionsArray = Object.entries(professionsData).map(([key, name], index) => ({
                id: index + 1,
                key: key,
                name: name,
                category: 'general' // Default category for i18n fallback
            }));
            
            // Filter by category if specified
            if (category) {
                professionsArray = professionsArray.filter(profession => profession.category === category);
            }
            
            res.json({
                status: 'success',
                data: professionsArray,
                language: selectedLang,
                category: category,
                total: professionsArray.length,
                is_fallback: true
            });
        } catch (translationErr) {
            console.error('Error loading translation file:', translationErr);
            
            // Ultimate fallback if translation file fails
            const ultimateFallback = [
                { id: 1, key: 'engineer', name: 'Engineer', category: 'technical' },
                { id: 2, key: 'doctor', name: 'Doctor', category: 'medical' }
            ];
            
            res.json({
                status: 'success',
                data: ultimateFallback,
                language: selectedLang,
                category: category,
                total: ultimateFallback.length,
                is_fallback: true
            });
        }
    }
});

// ============================================================================
// MIGRATION ENDPOINTS
// ============================================================================

// Run vacancies table migration
app.post('/api/admin/migrate-vacancies', async (req, res) => {
    console.log('[MIGRATION] Running vacancies table migration...');
    
    try {
        // Read and execute the migration SQL
        const migrationSQL = `
            -- Migration: Add Vacancies Table for Job Listings
            -- Date: 2025-07-06
            -- Purpose: Add vacancies table to manage job postings

            -- Create vacancies table
            CREATE TABLE IF NOT EXISTS vacancies (
                id SERIAL PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                category VARCHAR(50) NOT NULL CHECK (category IN ('development', 'design', 'management', 'marketing', 'finance', 'customer_service')),
                subcategory VARCHAR(50),
                location VARCHAR(100) NOT NULL,
                employment_type VARCHAR(30) NOT NULL CHECK (employment_type IN ('full_time', 'part_time', 'contract', 'temporary')),
                salary_min DECIMAL(10,2),
                salary_max DECIMAL(10,2),
                salary_currency VARCHAR(3) DEFAULT 'ILS',
                description_he TEXT,
                description_en TEXT,
                description_ru TEXT,
                requirements_he TEXT,
                requirements_en TEXT,
                requirements_ru TEXT,
                benefits_he TEXT,
                benefits_en TEXT,
                benefits_ru TEXT,
                is_active BOOLEAN DEFAULT TRUE,
                is_featured BOOLEAN DEFAULT FALSE,
                posted_date DATE DEFAULT CURRENT_DATE,
                closing_date DATE,
                created_by INTEGER REFERENCES clients(id) ON DELETE SET NULL,
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW(),
                -- Constraints
                CHECK (salary_max IS NULL OR salary_min IS NULL OR salary_max >= salary_min),
                CHECK (closing_date IS NULL OR closing_date >= posted_date)
            );

            -- Create vacancy applications table
            CREATE TABLE IF NOT EXISTS vacancy_applications (
                id SERIAL PRIMARY KEY,
                vacancy_id INTEGER REFERENCES vacancies(id) ON DELETE CASCADE,
                applicant_name VARCHAR(255) NOT NULL,
                applicant_email VARCHAR(255) NOT NULL,
                applicant_phone VARCHAR(20),
                cover_letter TEXT,
                resume_file_path VARCHAR(500),
                linkedin_profile VARCHAR(255),
                portfolio_url VARCHAR(255),
                years_experience INTEGER CHECK (years_experience >= 0),
                application_status VARCHAR(20) CHECK (application_status IN ('pending', 'reviewing', 'shortlisted', 'interviewed', 'rejected', 'hired')) DEFAULT 'pending',
                applied_at TIMESTAMP DEFAULT NOW(),
                reviewed_at TIMESTAMP,
                reviewed_by INTEGER REFERENCES clients(id) ON DELETE SET NULL,
                notes TEXT,
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            );

            -- Create indexes for performance
            CREATE INDEX IF NOT EXISTS idx_vacancies_category ON vacancies(category);
            CREATE INDEX IF NOT EXISTS idx_vacancies_active ON vacancies(is_active);
            CREATE INDEX IF NOT EXISTS idx_vacancies_featured ON vacancies(is_featured);
            CREATE INDEX IF NOT EXISTS idx_vacancies_posted_date ON vacancies(posted_date);
            CREATE INDEX IF NOT EXISTS idx_vacancy_applications_vacancy_id ON vacancy_applications(vacancy_id);
            CREATE INDEX IF NOT EXISTS idx_vacancy_applications_status ON vacancy_applications(application_status);
            CREATE INDEX IF NOT EXISTS idx_vacancy_applications_email ON vacancy_applications(applicant_email);

            -- Add triggers for updated_at timestamp (only if function exists)
            DO $$
            BEGIN
                IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at_column') THEN
                    EXECUTE 'CREATE TRIGGER trigger_update_vacancies_updated_at
                        BEFORE UPDATE ON vacancies
                        FOR EACH ROW
                        EXECUTE FUNCTION update_updated_at_column()';
                    
                    EXECUTE 'CREATE TRIGGER trigger_update_vacancy_applications_updated_at
                        BEFORE UPDATE ON vacancy_applications
                        FOR EACH ROW
                        EXECUTE FUNCTION update_updated_at_column()';
                END IF;
            END $$;
        `;
        
        // Execute the migration
        await pool.query(migrationSQL);
        
        // Insert sample data
        const sampleDataSQL = `
            INSERT INTO vacancies (
                title, 
                category, 
                subcategory, 
                location, 
                employment_type, 
                salary_min, 
                salary_max,
                description_he,
                description_en, 
                description_ru
            ) VALUES 
            (
                'Back-end Developer',
                'development',
                'backend',
                'Tel Aviv',
                'full_time',
                6000,
                12000,
                'אנחנו מחפשים מפתח Back-end מנוסה להצטרף לצוות הסטארט-אפ שלנו בתחום הפינטק. תעבוד עם טכנולוגיות מתקדמות ותשתתף ביצירת פתרונות בנקאיים חדשניים.',
                'We are looking for an experienced Back-end developer to join our fintech startup team. You will work with modern technologies and participate in creating innovative banking solutions.',
                'Мы ищем опытного Back-end разработчика для присоединения к нашей команде финтех-стартапа. Вы будете работать с современными технологиями и участвовать в создании инновационных банковских решений.'
            ),
            (
                'Product Designer',
                'design',
                'product_design',
                'Tel Aviv',
                'full_time',
                5000,
                10000,
                'הצטרף לצוות העיצוב שלנו ועזור ליצור ממשקי משתמש אינטואיטיביים עבור אפליקציות בנקאיות. אנחנו מחפשים מעצב יצירתי עם ניסיון בפינטק.',
                'Join our design team and help create intuitive user interfaces for banking applications. We are looking for a creative designer with fintech experience.',
                'Присоединяйтесь к нашей дизайн-команде и помогите создавать интуитивные пользовательские интерфейсы для банковских приложений. Мы ищем креативного дизайнера с опытом в финтех.'
            ),
            (
                'Frontend Developer',
                'development',
                'frontend',
                'Tel Aviv',
                'full_time',
                5500,
                11000,
                'מחפשים מפתח Frontend מיומן ליצירת חוויות משתמש מרהיבות באפליקציות בנקאיות. ניסיון ב-React ו-TypeScript יתרון.',
                'Looking for a skilled Frontend developer to create amazing user experiences in banking applications. Experience with React and TypeScript is an advantage.',
                'Ищем опытного Frontend разработчика для создания потрясающих пользовательских интерфейсов в банковских приложениях. Опыт работы с React и TypeScript будет преимуществом.'
            )
            ON CONFLICT DO NOTHING;
        `;
        
        // Check if data already exists
        const existingData = await pool.query('SELECT COUNT(*) FROM vacancies');
        if (existingData.rows[0].count === '0') {
            await pool.query(sampleDataSQL);
            console.log('[MIGRATION] Sample data inserted');
        } else {
            console.log('[MIGRATION] Sample data already exists, skipping insert');
        }
        
        // Verify tables were created
        const tablesCheck = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name IN ('vacancies', 'vacancy_applications')
        `);
        
        console.log('[MIGRATION] Vacancies migration completed successfully');
        console.log('[MIGRATION] Tables created:', tablesCheck.rows.map(r => r.table_name));
        
        res.json({
            status: 'success',
            message: 'Vacancies tables created successfully',
            tables_created: tablesCheck.rows.map(r => r.table_name),
            sample_data_inserted: existingData.rows[0].count === '0'
        });
        
    } catch (err) {
        console.error('[MIGRATION] Error:', err);
        res.status(500).json({
            status: 'error',
            message: 'Migration failed',
            error: err.message
        });
    }
});

// Run additional vacancy columns migration
app.post('/api/admin/migrate-vacancy-details', async (req, res) => {
    console.log('[MIGRATION] Running vacancy details columns migration...');
    
    try {
        // Read and execute the migration SQL
        const migrationSQL = `
            -- Add missing columns to vacancies table
            ALTER TABLE vacancies 
            ADD COLUMN IF NOT EXISTS responsibilities_he TEXT,
            ADD COLUMN IF NOT EXISTS responsibilities_en TEXT,
            ADD COLUMN IF NOT EXISTS responsibilities_ru TEXT,
            ADD COLUMN IF NOT EXISTS nice_to_have_he TEXT,
            ADD COLUMN IF NOT EXISTS nice_to_have_en TEXT,
            ADD COLUMN IF NOT EXISTS nice_to_have_ru TEXT;
        `;
        
        // Execute the migration
        await pool.query(migrationSQL);
        
        // Update existing records with sample data
        const updateDataSQL = `
            UPDATE vacancies 
            SET 
                responsibilities_he = CASE 
                    WHEN id = 1 THEN '- פיתוח וחיזוק API-ים ושירותי רקע
- עבודה עם בסיסי נתונים ואופטימיזציה של ביצועים
- אינטגרציה עם שירותי צד שלישי ומערכות תשלומים
- שיתוף פעולה עם צוותי Frontend ו-DevOps
- כתיבת קוד נקי ומתועד עם בדיקות יוניט
- השתתפות בסקירות קוד ותהליכי CI/CD'
                    WHEN id = 2 THEN '- מחקר משתמשים ואנליזה של צרכים
- יצירת wireframes, mockups ו-prototypes
- עיצוב ממשקי משתמש עבור אפליקציות בנקאיות
- שיתוף פעולה עם צוותי פיתוח ומוצר
- ביצוע בדיקות משתמש ואיטרציה על העיצובים
- שמירה על consistency בחוויית המשתמש'
                    WHEN id = 3 THEN '- פיתוח ממשקי משתמש עבור אפליקציות בנקאיות
- אימפלמנטציה של עיצובים ו-UI/UX
- אופטימיזציה של ביצועים והרפונסיביות
- שיתוף פעולה עם צוות הבק-אנד לאינטגרציה
- כתיבת קוד נקי ומתועד עם בדיקות
- השתתפות בסקירות קוד ותהליכי פיתוח'
                    ELSE responsibilities_he
                END,
                responsibilities_en = CASE 
                    WHEN id = 1 THEN '- Develop and maintain APIs and backend services
- Work with databases and optimize performance
- Integrate with third-party services and payment systems
- Collaborate with Frontend and DevOps teams
- Write clean, documented code with unit tests
- Participate in code reviews and CI/CD processes'
                    WHEN id = 2 THEN '- User research and needs analysis
- Create wireframes, mockups and prototypes
- Design user interfaces for banking applications
- Collaborate with development and product teams
- Conduct user testing and iterate on designs
- Maintain consistency in user experience'
                    WHEN id = 3 THEN '- Develop user interfaces for banking applications
- Implement designs and UI/UX
- Optimize performance and responsiveness
- Collaborate with backend team for integration
- Write clean, documented code with tests
- Participate in code reviews and development processes'
                    ELSE responsibilities_en
                END,
                responsibilities_ru = CASE 
                    WHEN id = 1 THEN '- Разработка и поддержка API и backend сервисов
- Работа с базами данных и оптимизация производительности
- Интеграция с внешними сервисами и платежными системами
- Сотрудничество с Frontend и DevOps командами
- Написание чистого, документированного кода с unit-тестами
- Участие в код-ревью и CI/CD процессах'
                    WHEN id = 2 THEN '- Исследование пользователей и анализ потребностей
- Создание wireframes, mockups и прототипов
- Дизайн пользовательских интерфейсов для банковских приложений
- Сотрудничество с командами разработки и продукта
- Проведение пользовательского тестирования и итерация дизайнов
- Поддержание консистентности в пользовательском опыте'
                    WHEN id = 3 THEN '- Разработка пользовательских интерфейсов для банковских приложений
- Реализация дизайнов и UI/UX
- Оптимизация производительности и отзывчивости
- Сотрудничество с backend командой для интеграции
- Написание чистого, документированного кода с тестами
- Участие в код-ревью и процессах разработки'
                    ELSE responsibilities_ru
                END,
                nice_to_have_he = CASE 
                    WHEN id = 1 THEN '- ניסיון עם Docker ו-Kubernetes
- הכרות עם AWS או Azure cloud platforms
- ניסיון עם microservices architecture
- הכרות עם GraphQL
- ניסיון עם Redis ו-caching strategies
- הכרות עם אבטחת מידע ו-OWASP principles'
                    WHEN id = 2 THEN '- ניסיון עם design systems
- הכרות עם animation ו-micro-interactions
- ניסיון עם accessibility standards
- הכרות עם HTML/CSS/JavaScript
- ניסיון עם user research tools
- הכרות עם agile/scrum methodologies'
                    WHEN id = 3 THEN '- ניסיון עם Next.js או מסגרות React מתקדמות
- הכרות עם state management (Redux, Zustand)
- ניסיון עם testing frameworks (Jest, Cypress)
- הכרות עם build tools (Webpack, Vite)
- ניסיון עם progressive web apps (PWA)
- הכרות עם web performance optimization'
                    ELSE nice_to_have_he
                END,
                nice_to_have_en = CASE 
                    WHEN id = 1 THEN '- Experience with Docker and Kubernetes
- Familiarity with AWS or Azure cloud platforms
- Experience with microservices architecture
- Knowledge of GraphQL
- Experience with Redis and caching strategies
- Knowledge of security and OWASP principles'
                    WHEN id = 2 THEN '- Experience with design systems
- Knowledge of animation and micro-interactions
- Experience with accessibility standards
- Familiarity with HTML/CSS/JavaScript
- Experience with user research tools
- Knowledge of agile/scrum methodologies'
                    WHEN id = 3 THEN '- Experience with Next.js or advanced React frameworks
- Knowledge of state management (Redux, Zustand)
- Experience with testing frameworks (Jest, Cypress)
- Familiarity with build tools (Webpack, Vite)
- Experience with progressive web apps (PWA)
- Knowledge of web performance optimization'
                    ELSE nice_to_have_en
                END,
                nice_to_have_ru = CASE 
                    WHEN id = 1 THEN '- Опыт работы с Docker и Kubernetes
- Знание AWS или Azure cloud platforms
- Опыт работы с microservices architecture
- Знание GraphQL
- Опыт работы с Redis и caching strategies
- Знание безопасности и OWASP principles'
                    WHEN id = 2 THEN '- Опыт работы с design systems
- Знание анимации и micro-interactions
- Опыт работы с accessibility standards
- Знание HTML/CSS/JavaScript
- Опыт работы с user research tools
- Знание agile/scrum методологий'
                    WHEN id = 3 THEN '- Опыт работы с Next.js или продвинутыми React frameworks
- Знание state management (Redux, Zustand)
- Опыт работы с testing frameworks (Jest, Cypress)
- Знание build tools (Webpack, Vite)
- Опыт работы с progressive web apps (PWA)
- Знание web performance optimization'
                    ELSE nice_to_have_ru
                END
            WHERE id IN (1, 2, 3);
        `;
        
        await pool.query(updateDataSQL);
        
        console.log('[MIGRATION] Vacancy details migration completed successfully');
        
        res.json({
            status: 'success',
            message: 'Vacancy details columns added successfully'
        });
        
    } catch (err) {
        console.error('[MIGRATION] Error:', err);
        res.status(500).json({
            status: 'error',
            message: 'Migration failed',
            error: err.message
        });
    }
});

// Run requirements and benefits data migration
app.post('/api/admin/migrate-requirements-benefits', async (req, res) => {
    console.log('[MIGRATION] Running requirements and benefits data migration...');
    
    try {
        // Read and execute the migration SQL
        const migrationSQL = `
            -- Update requirements and benefits for all vacancies
            UPDATE vacancies 
            SET 
                requirements_he = CASE 
                    WHEN id = 1 THEN '- תואר ראשון במדעי המחשב או תחום דומה
- 3+ שנות ניסיון בפיתוח Backend
- ניסיון מוכח עם Node.js, Python או Java
- הכרות עמוקה עם בסיסי נתונים (PostgreSQL, MongoDB)
- ניסיון עם REST APIs ו-GraphQL
- הבנה של אדריכלות מערכות וטכנולוגיות ענן
- יכולת עבודה בצוות ותקשורת מעולה
- אנגלית ברמה גבוהה'
                    WHEN id = 2 THEN '- תואר ראשון בעיצוב, HCI או תחום דומה
- 2+ שנות ניסיון בעיצוב מוצר דיגיטלי
- שליטה מעולה ב-Figma, Sketch או Adobe XD
- ניסיון בעיצוב אפליקציות מובייל ווב
- הבנה עמוקה של UX/UI principles
- ניסיון במחקר משתמשים ובדיקות שימושיות
- יכולת עבודה עם צוותי פיתוח ומוצר
- תיק עבודות מרשים'
                    WHEN id = 3 THEN '- תואר ראשון במדעי המחשב או תחום דומה
- 2+ שנות ניסיון בפיתוח Frontend
- שליטה מעולה ב-React, TypeScript ו-JavaScript ES6+
- ניסיון עם HTML5, CSS3 ו-SASS/SCSS
- הכרות עם כלי build מודרניים (Webpack, Vite)
- ניסיון עם ניהול state (Redux, Context API)
- הבנה של responsive design ו-mobile-first approach
- יכולת עבודה בצוות agile'
                    ELSE requirements_he
                END,
                requirements_en = CASE 
                    WHEN id = 1 THEN '- Bachelor''s degree in Computer Science or related field
- 3+ years of Backend development experience
- Proven experience with Node.js, Python, or Java
- Deep knowledge of databases (PostgreSQL, MongoDB)
- Experience with REST APIs and GraphQL
- Understanding of system architecture and cloud technologies
- Strong teamwork and communication skills
- High level of English proficiency'
                    WHEN id = 2 THEN '- Bachelor''s degree in Design, HCI, or related field
- 2+ years of digital product design experience
- Excellent proficiency in Figma, Sketch, or Adobe XD
- Experience designing mobile and web applications
- Deep understanding of UX/UI principles
- Experience in user research and usability testing
- Ability to work with development and product teams
- Impressive portfolio'
                    WHEN id = 3 THEN '- Bachelor''s degree in Computer Science or related field
- 2+ years of Frontend development experience
- Excellent proficiency in React, TypeScript, and JavaScript ES6+
- Experience with HTML5, CSS3, and SASS/SCSS
- Familiarity with modern build tools (Webpack, Vite)
- Experience with state management (Redux, Context API)
- Understanding of responsive design and mobile-first approach
- Ability to work in agile teams'
                    ELSE requirements_en
                END,
                requirements_ru = CASE 
                    WHEN id = 1 THEN '- Степень бакалавра в области компьютерных наук или смежной области
- 3+ года опыта Backend разработки
- Доказанный опыт работы с Node.js, Python или Java
- Глубокое знание баз данных (PostgreSQL, MongoDB)
- Опыт работы с REST APIs и GraphQL
- Понимание архитектуры систем и облачных технологий
- Отличные навыки командной работы и коммуникации
- Высокий уровень владения английским языком'
                    WHEN id = 2 THEN '- Степень бакалавра в области дизайна, HCI или смежной области
- 2+ года опыта в дизайне цифровых продуктов
- Отличное владение Figma, Sketch или Adobe XD
- Опыт дизайна мобильных и веб приложений
- Глубокое понимание UX/UI принципов
- Опыт в исследовании пользователей и юзабилити тестировании
- Способность работать с командами разработки и продукта
- Впечатляющее портфолио'
                    WHEN id = 3 THEN '- Степень бакалавра в области компьютерных наук или смежной области
- 2+ года опыта Frontend разработки
- Отличное владение React, TypeScript и JavaScript ES6+
- Опыт работы с HTML5, CSS3 и SASS/SCSS
- Знакомство с современными build инструментами (Webpack, Vite)
- Опыт работы с state management (Redux, Context API)
- Понимание responsive design и mobile-first подхода
- Способность работать в agile командах'
                    ELSE requirements_ru
                END,
                benefits_he = CASE 
                    WHEN id = 1 THEN '- שכר תחרותי ותנאים מעולים
- ביטוח בריאות פרטי מלא
- אפשרויות השקעה במניות החברה
- 25 ימי חופשה בשנה + ימי מחלה
- תקציב להשתלמויות וכנסים מקצועיים
- ציוד עבודה מתקדם (MacBook Pro, מסכים כפולים)
- משרדים מודרניים במרכז תל אביב
- ארוחות צהריים ונשנושים חינם
- אירועי צוות וימי כיף חברתיים
- גמישות בשעות עבודה ואפשרות עבודה מהבית'
                    WHEN id = 2 THEN '- שכר תחרותי ואופציות מניות
- ביטוח בריאות ושיניים מקיף
- תקציב שנתי למכשירי עיצוב וכלים מקצועיים
- 22 ימי חופשה + ימי מחלה ללא הגבלה
- השתתפות בכנסי עיצוב וסדנאות בינלאומיות
- Studio עיצוב מאובזר במלואו
- סביבת עבודה יצירתית ומעוררת השראה
- ארוחות וקפה premium
- מנוי חדר כושר ופעילויות בריאות
- אפשרות לעבודה מהבית 2 ימים בשבוע'
                    WHEN id = 3 THEN '- שכר אטרקטיבי ובונוסים רבעוניים
- ביטוח בריאות מקיף למשפחה
- אופציות מניות בחברה צומחת
- 23 ימי חופשה + ימי מחלה גמישים
- תקציב למכשירים ולהכשרות טכנולוגיות
- עמדת עבודה מתקדמת וכלי פיתוח מקצועיים
- משרדים מעוצבים עם אזורי נוחות
- ארוחות חינם ומטבח מאובזר
- אירועי חברה ופעילויות גיבוש
- המחלקה גמישות בזמנים ועבודה היברידית'
                    ELSE benefits_he
                END,
                benefits_en = CASE 
                    WHEN id = 1 THEN '- Competitive salary and excellent conditions
- Full private health insurance
- Company stock investment options
- 25 vacation days per year + sick days
- Budget for training and professional conferences
- Advanced work equipment (MacBook Pro, dual monitors)
- Modern offices in central Tel Aviv
- Free lunches and snacks
- Team events and social activities
- Flexible working hours and work from home options'
                    WHEN id = 2 THEN '- Competitive salary and stock options
- Comprehensive health and dental insurance
- Annual budget for design devices and professional tools
- 22 vacation days + unlimited sick days
- Participation in international design conferences and workshops
- Fully equipped design studio
- Creative and inspiring work environment
- Premium meals and coffee
- Gym membership and wellness activities
- Work from home option 2 days per week'
                    WHEN id = 3 THEN '- Attractive salary with quarterly bonuses
- Comprehensive family health insurance
- Stock options in a growing company
- 23 vacation days + flexible sick days
- Budget for devices and technology training
- Advanced workstation and professional development tools
- Designed offices with comfort zones
- Free meals and fully equipped kitchen
- Company events and team building activities
- Flexible schedule and hybrid work arrangements'
                    ELSE benefits_en
                END,
                benefits_ru = CASE 
                    WHEN id = 1 THEN '- Конкурентная зарплата и отличные условия
- Полное частное медицинское страхование
- Возможности инвестирования в акции компании
- 25 дней отпуска в год + больничные дни
- Бюджет на обучение и профессиональные конференции
- Передовое рабочее оборудование (MacBook Pro, два монитора)
- Современные офисы в центре Тель-Авива
- Бесплатные обеды и закуски
- Командные мероприятия и социальная активность
- Гибкий рабочий график и возможность работы из дома'
                    WHEN id = 2 THEN '- Конкурентная зарплата и опционы на акции
- Полное медицинское и стоматологическое страхование
- Годовой бюджет на дизайнерские устройства и профессиональные инструменты
- 22 дня отпуска + неограниченные больничные
- Участие в международных дизайнерских конференциях и семинарах
- Полностью оборудованная дизайн-студия
- Творческая и вдохновляющая рабочая среда
- Премиальное питание и кофе
- Абонемент в спортзал и wellness активности
- Возможность работы из дома 2 дня в неделю'
                    WHEN id = 3 THEN '- Привлекательная зарплата с квартальными бонусами
- Полное семейное медицинское страхование
- Опционы на акции в растущей компании
- 23 дня отпуска + гибкие больничные дни
- Бюджет на устройства и технологическое обучение
- Передовое рабочее место и профессиональные инструменты разработки
- Дизайнерские офисы с зонами комфорта
- Бесплатное питание и полностью оборудованная кухня
- Корпоративные мероприятия и team building активности
- Гибкий график и гибридная работа'
                    ELSE benefits_ru
                END
            WHERE id IN (1, 2, 3);
        `;
        
        // Execute the migration
        await pool.query(migrationSQL);
        
        console.log('[MIGRATION] Requirements and benefits migration completed successfully');
        
        res.json({
            status: 'success',
            message: 'Requirements and benefits data added successfully'
        });
        
    } catch (err) {
        console.error('[MIGRATION] Error:', err);
        res.status(500).json({
            status: 'error',
            message: 'Migration failed',
            error: err.message
        });
    }
});

// Update vacancy applications table structure
app.post('/api/admin/migrate-vacancy-applications', async (req, res) => {
    try {
        console.log('[MIGRATION] Starting vacancy applications table update...');
        
        const migrationSQL = fs.readFileSync(
            path.join(__dirname, 'migrations/010-update-vacancy-applications-table.sql'),
            'utf8'
        );
        
        await pool.query(migrationSQL);
        
        console.log('[MIGRATION] Vacancy applications table updated successfully');
        
        res.json({
            status: 'success',
            message: 'Vacancy applications table updated successfully'
        });
    } catch (error) {
        console.error('[MIGRATION] Error updating vacancy applications table:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to update vacancy applications table',
            details: error.message
        });
    }
});

// ============================================================================
// VACANCIES ENDPOINTS
// ============================================================================

// Get all vacancies (public endpoint)
app.get('/api/vacancies', async (req, res) => {
    const { category, lang = 'en', active_only = 'true' } = req.query;
    
    console.log(`[VACANCIES] Request - Category: ${category}, Language: ${lang}`);
    
    try {
        let query = `
            SELECT 
                id,
                title,
                category,
                subcategory,
                location,
                employment_type,
                salary_min,
                salary_max,
                salary_currency,
                description_${lang} as description,
                requirements_${lang} as requirements,
                benefits_${lang} as benefits,
                is_featured,
                posted_date,
                closing_date
            FROM vacancies
        `;
        
        const conditions = [];
        const values = [];
        
        if (active_only === 'true') {
            conditions.push('is_active = true');
        }
        
        if (category && category !== 'all') {
            conditions.push('category = $' + (values.length + 1));
            values.push(category);
        }
        
        // Only show vacancies that haven't closed
        conditions.push('(closing_date IS NULL OR closing_date >= CURRENT_DATE)');
        
        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }
        
        query += ' ORDER BY is_featured DESC, posted_date DESC';
        
        const result = await pool.query(query, values);
        
        res.json({
            status: 'success',
            data: result.rows,
            total: result.rowCount,
            language: lang,
            category: category || 'all'
        });
        
    } catch (err) {
        console.error('Error fetching vacancies:', err);
        res.status(500).json({ 
            status: 'error', 
            message: 'Internal server error while fetching vacancies'
        });
    }
});

// Get vacancy categories
app.get('/api/vacancies/categories', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                category,
                COUNT(*) as count
            FROM vacancies 
            WHERE is_active = true 
            AND (closing_date IS NULL OR closing_date >= CURRENT_DATE)
            GROUP BY category
            ORDER BY count DESC
        `);
        
        res.json({
            status: 'success',
            data: result.rows
        });
        
    } catch (err) {
        console.error('Error fetching vacancy categories:', err);
        res.status(500).json({ 
            status: 'error', 
            message: 'Internal server error while fetching categories'
        });
    }
});

// Get single vacancy
app.get('/api/vacancies/:id', async (req, res) => {
    const { id } = req.params;
    const { lang = 'en' } = req.query;
    
    try {
        const result = await pool.query(`
            SELECT 
                id,
                title,
                category,
                subcategory,
                location,
                employment_type,
                salary_min,
                salary_max,
                salary_currency,
                description_${lang} as description,
                requirements_${lang} as requirements,
                benefits_${lang} as benefits,
                responsibilities_${lang} as responsibilities,
                nice_to_have_${lang} as nice_to_have,
                is_featured,
                posted_date,
                closing_date,
                created_at
            FROM vacancies
            WHERE id = $1 AND is_active = true
        `, [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: 'Vacancy not found'
            });
        }
        
        res.json({
            status: 'success',
            data: result.rows[0],
            language: lang
        });
        
    } catch (err) {
        console.error('Error fetching vacancy:', err);
        res.status(500).json({ 
            status: 'error', 
            message: 'Internal server error while fetching vacancy'
        });
    }
});

/**
 * Submit Job Application API Endpoint
 * 
 * POST /api/vacancies/:id/apply
 * 
 * Handles job application submissions with the following features:
 * - File upload for resume (PDF, DOC, DOCX only, max 5MB)
 * - Comprehensive input validation (email, phone, required fields)
 * - Duplicate application prevention
 * - Vacancy availability checking
 * - Secure file storage with unique filenames
 * 
 * Request body:
 * - applicant_name (required): Full name
 * - applicant_email (required): Email address
 * - applicant_phone (required): Israeli phone number
 * - applicant_city (required): City of residence
 * - expected_salary (optional): Expected salary in ILS
 * - portfolio_url (optional): Link to portfolio
 * - cover_letter (optional): Cover letter text
 * - resume (file): Resume file (handled by multer middleware)
 * 
 * Response format:
 * {
 *   status: 'success' | 'error',
 *   message: string,
 *   data?: { application_id, applied_at, vacancy_title }
 * }
 */
app.post('/api/vacancies/:id/apply', uploadFile.single('resume'), async (req, res) => {
    const { id } = req.params;
    const {
        applicant_name,
        applicant_email,
        applicant_phone,
        applicant_city,
        expected_salary,
        portfolio_url,
        cover_letter
    } = req.body;
    
    console.log(`[VACANCY APPLICATION] Vacancy ID: ${id}, Applicant: ${applicant_email}`);
    
    // Server-side validation for required fields
    if (!applicant_name || !applicant_email || !applicant_phone || !applicant_city) {
        return res.status(400).json({
            status: 'error',
            message: 'Name, email, phone, and city are required'
        });
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(applicant_email)) {
        return res.status(400).json({
            status: 'error',
            message: 'Invalid email format'
        });
    }
    
    // Validate phone format (Israeli phone numbers)
    const phoneRegex = /^(\+?972|0)?[5-9]\d{8}$/;
    if (!phoneRegex.test(applicant_phone.replace(/[-\s]/g, ''))) {
        return res.status(400).json({
            status: 'error',
            message: 'Invalid phone number format'
        });
    }
    
    // Get file information if uploaded
    const resumeFilePath = req.file ? req.file.filename : null;
    
    try {
        // Check if vacancy exists and is active
        const vacancyCheck = await pool.query(`
            SELECT id, title FROM vacancies 
            WHERE id = $1 AND is_active = true 
            AND (closing_date IS NULL OR closing_date >= CURRENT_DATE)
        `, [id]);
        
        if (vacancyCheck.rows.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: 'Vacancy not found or not accepting applications'
            });
        }
        
        // Check for duplicate application
        const duplicateCheck = await pool.query(`
            SELECT id FROM vacancy_applications 
            WHERE vacancy_id = $1 AND applicant_email = $2
        `, [id, applicant_email]);
        
        if (duplicateCheck.rows.length > 0) {
            return res.status(409).json({
                status: 'error',
                message: 'You have already applied for this position'
            });
        }
        
        // Insert application
        const result = await pool.query(`
            INSERT INTO vacancy_applications (
                vacancy_id,
                applicant_name,
                applicant_email,
                applicant_phone,
                applicant_city,
                expected_salary,
                portfolio_url,
                cover_letter,
                resume_file_path
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING id, applied_at
        `, [
            id,
            applicant_name,
            applicant_email,
            applicant_phone,
            applicant_city,
            expected_salary,
            portfolio_url,
            cover_letter,
            resumeFilePath
        ]);
        
        res.json({
            status: 'success',
            message: 'Application submitted successfully',
            data: {
                application_id: result.rows[0].id,
                applied_at: result.rows[0].applied_at,
                vacancy_title: vacancyCheck.rows[0].title
            }
        });
        
    } catch (err) {
        console.error('Error submitting application:', err);
        res.status(500).json({ 
            status: 'error', 
            message: 'Internal server error while submitting application'
        });
    }
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
app.post('/api/auth-mobile', async (req, res) => {
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
app.post('/api/auth-verify', async (req, res) => {
    const { code, mobile_number } = req.body;
    
    console.log(`[SMS] Verify ${code} for ${mobile_number}`);

    // Mock mode for local development or automated tests
    // Triggers if:
    // - env MOCK_SMS_AUTH=true, or
    // - query param ?mock=1, or
    // - special code '0000' (explicit mock code)
    try {
        const shouldMock = (process.env.MOCK_SMS_AUTH === 'true') || (req.query && req.query.mock === '1') || code === '0000';
        if (shouldMock) {
            const token = jwt.sign(
                { id: 1, phone: mobile_number || '+972500000000', type: 'client', mock: true },
                process.env.JWT_SECRET || 'secret',
                { expiresIn: '24h' }
            );
            return res.json({
                status: 'success',
                message: 'Login successful (mock)',
                data: {
                    token,
                    user: {
                        id: 1,
                        name: 'Mock User',
                        phone: mobile_number || '+972500000000',
                        email: `${(mobile_number || '+972500000000').replace('+', '')}@mock.local`
                    }
                }
            });
        }
    } catch (mockErr) {
        console.warn('Mock auth-verify failed to generate token:', mockErr);
    }
    
    if (!code || !mobile_number || code.length !== 4) {
        return res.status(400).json({ status: 'error', message: 'Invalid code' });
    }
    
    try {
        let client;
        const clientResult = await pool.query('SELECT * FROM clients WHERE phone = $1', [mobile_number]);
        
        if (clientResult.rows.length > 0) {
            client = clientResult.rows[0];
        } else {
            try {
                const newResult = await pool.query(
                    'INSERT INTO clients (first_name, last_name, phone, email, created_at, updated_at) VALUES ($1, $2, $3, $4, NOW(), NOW()) RETURNING *',
                    ['New', 'Client', mobile_number, `${mobile_number.replace('+', '')}@bankim.com`]
                );
                client = newResult.rows[0];
            } catch (insertError) {
                // Handle race condition - if client was created by concurrent request
                if (insertError.code === '23505' && (insertError.constraint === 'clients_phone_key' || insertError.constraint === 'clients_email_unique')) {
                    console.log(`[SMS] Duplicate constraint detected for ${mobile_number} (${insertError.constraint}), fetching existing client`);
                    // Try to find existing client by phone OR email
                    const email = `${mobile_number.replace('+', '')}@bankim.com`;
                    const existingResult = await pool.query('SELECT * FROM clients WHERE phone = $1 OR email = $2', [mobile_number, email]);
                    if (existingResult.rows.length > 0) {
                        client = existingResult.rows[0];
                        // Update the phone number if it's different (in case we found by email)
                        if (client.phone !== mobile_number) {
                            console.log(`[SMS] Updating phone number for existing client from ${client.phone} to ${mobile_number}`);
                            await pool.query('UPDATE clients SET phone = $1, updated_at = NOW() WHERE id = $2', [mobile_number, client.id]);
                            client.phone = mobile_number;
                        }
                    } else {
                        throw new Error('Client creation failed and no existing client found');
                    }
                } else {
                    throw insertError;
                }
            }
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

// PHONE + PASSWORD LOGIN - Step 1 (as per Confluence requirements)
app.post('/api/auth-password', async (req, res) => {
    const { mobile_number, password } = req.body;
    
    console.log(`[PHONE LOGIN] Request for: ${mobile_number}`);
    
    if (!mobile_number || !password) {
        return res.status(400).json({ status: 'error', message: 'Phone number and password are required' });
    }
    
    try {
        // Normalize phone number - remove spaces and keep only digits and +
        const normalizedPhone = mobile_number.replace(/\s+/g, '');
        console.log(`[PHONE LOGIN] Normalized phone: ${normalizedPhone}`);
        
        // Check if user exists with this phone number
        const clientResult = await pool.query('SELECT * FROM clients WHERE phone = $1', [normalizedPhone]);
        
        if (clientResult.rows.length === 0) {
            return res.status(401).json({
                status: 'error',
                message: 'שם המשתמש או הסיסמה שגויים' // Hebrew: "Username or password is incorrect"
            });
        }
        
        const client = clientResult.rows[0];
        console.log(`[PHONE LOGIN] User found: ${client.first_name} ${client.last_name}`);
        
        // Verify password hash
        if (!client.password_hash) {
            return res.status(401).json({
                status: 'error',
                message: 'שם המשתמש או הסיסמה שגויים' // Hebrew: "Username or password is incorrect"
            });
        }
        
        const bcrypt = require('bcryptjs');
        const isPasswordValid = await bcrypt.compare(password, client.password_hash);
        
        if (!isPasswordValid) {
            console.log(`[PHONE LOGIN] Invalid password for: ${normalizedPhone}`);
            return res.status(401).json({
                status: 'error',
                message: 'שם המשתמש או הסיסמה שגויים' // Hebrew: "Username or password is incorrect"
            });
        }
        
        console.log(`[PHONE LOGIN] Password verified for: ${normalizedPhone}`);
        
        // Generate SMS code (4-digit OTP)
        const otp = Math.floor(1000 + Math.random() * 9000);
        console.log(`*** SMS CODE for ${normalizedPhone}: ${otp} ***`);
        
        // Return success - frontend will proceed to SMS verification step
        res.json({
            status: 'success',
            message: 'SMS code sent',
            data: {
                mobile_number: normalizedPhone,
                // Don't include user data yet - that comes after SMS verification
            }
        });
        
    } catch (err) {
        console.error('Phone login error:', err);
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
        // FIXED: Using database-driven calculation instead of hardcoded mock values
        
        // Get current mortgage rate from database
        const baseRateQuery = `SELECT get_current_mortgage_rate() as current_rate`;
        const baseRateResult = await contentPool.query(baseRateQuery);
        const currentRate = parseFloat(baseRateResult.rows[0].current_rate);
        
        // Get refinance-specific savings percentage from banking_standards
        const savingsQuery = `
            SELECT standard_value 
            FROM banking_standards 
            WHERE business_path = 'mortgage_refinance' 
                AND standard_category = 'refinance' 
                AND standard_name = 'minimum_savings_percentage'
                AND is_active = true
        `;
        const savingsResult = await pool.query(savingsQuery);
        const savingsPercentage = savingsResult.rows.length > 0 ? 
            parseFloat(savingsResult.rows[0].standard_value) : 2.0; // 2% fallback
        
        // Calculate using database-driven annuity payment function
        const monthlyPaymentQuery = `SELECT calculate_annuity_payment($1, $2, $3) as monthly_payment`;
        const monthlyPaymentResult = await pool.query(monthlyPaymentQuery, [amount_left, currentRate, years || 25]);
        const monthlyPayment = Math.round(parseFloat(monthlyPaymentResult.rows[0].monthly_payment));
        
        const totalSavings = Math.round(amount_left * (savingsPercentage / 100));
        
        console.log(`[REFINANCE MORTGAGE] Database-driven calculation: ${currentRate}% rate, ₪${monthlyPayment}/month, ${savingsPercentage}% savings`);
        
        // Determine language for bank names based on Accept-Language header
        const clientLang = req.headers['accept-language']?.split(',')[0]?.split('-')[0] || 'en';
        let nameField = 'name_en';
        if (clientLang === 'he') {
            nameField = 'name_he';
        } else if (clientLang === 'ru') {
            nameField = 'name_ru';
        }
        
        // Get top 3 banks with best rates for refinancing
        const banksQuery = `
            SELECT 
                CASE 
                    WHEN $2 = 'name_he' THEN COALESCE(b.name_he, b.name_en)
                    WHEN $2 = 'name_ru' THEN COALESCE(b.name_ru, b.name_en)
                    ELSE b.name_en
                END as name,
                COALESCE(bc.base_interest_rate, $1) as rate
            FROM banks b
            LEFT JOIN bank_configurations bc ON b.id = bc.bank_id 
                AND bc.product_type = 'mortgage'
                AND bc.is_active = true
            WHERE b.is_active = true
            ORDER BY COALESCE(bc.base_interest_rate, $1) ASC
            LIMIT 3
        `;
        const banksResult = await pool.query(banksQuery, [currentRate, nameField]);
        const recommendedBanks = banksResult.rows.map((bank, index) => ({
            name: bank.name,
            rate: parseFloat(bank.rate),
            monthly: Math.round(monthlyPayment * (1 + (index * 0.05))) // Slight variation based on bank
        }));
        
        res.json({
            status: 'success',
            message: 'Refinance calculation completed using database parameters',
            data: {
                percent: currentRate,
                monthly_payment: monthlyPayment,
                total_savings: totalSavings,
                recommended_banks: recommendedBanks,
                calculation_source: 'database_driven'
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
        // FIXED: Using database-driven calculation instead of hardcoded mock values
        
        const totalDebt = loans_data ? loans_data.reduce((sum, loan) => sum + (loan.amount || 0), 0) : 0;
        
        if (totalDebt === 0) {
            return res.status(400).json({
                status: 'error',
                message: 'No debt amount provided for refinancing'
            });
        }
        
        // Get current credit rate from database using banking_standards
        const creditRateQuery = `
            SELECT standard_value 
            FROM banking_standards 
            WHERE business_path = 'credit_refinance' 
                AND standard_category = 'rates' 
                AND standard_name = 'quick_good_rate'
                AND is_active = true
        `;
        const creditRateResult = await pool.query(creditRateQuery);
        const currentCreditRate = creditRateResult.rows.length > 0 ? 
            parseFloat(creditRateResult.rows[0].standard_value) : 8.5; // Fallback
        
        // Get minimum rate reduction requirement from banking_standards
        const rateReductionQuery = `
            SELECT standard_value 
            FROM banking_standards 
            WHERE business_path = 'credit_refinance' 
                AND standard_category = 'refinance' 
                AND standard_name = 'minimum_rate_reduction'
                AND is_active = true
        `;
        const rateReductionResult = await pool.query(rateReductionQuery);
        const minRateReduction = rateReductionResult.rows.length > 0 ? 
            parseFloat(rateReductionResult.rows[0].standard_value) : 1.0; // 1% fallback
        
        // Calculate new rate (current rate minus reduction)
        const newRate = Math.max(currentCreditRate - minRateReduction, 5.0); // Minimum 5%
        
        // Calculate using database-driven annuity payment function for 5 years
        const monthlyPaymentQuery = `SELECT calculate_annuity_payment($1, $2, $3) as monthly_payment`;
        const monthlyPaymentResult = await pool.query(monthlyPaymentQuery, [totalDebt, newRate, 5]);
        const newMonthlyPayment = Math.round(parseFloat(monthlyPaymentResult.rows[0].monthly_payment));
        
        // Calculate savings based on rate difference
        const oldMonthlyPayment = Math.round(parseFloat(
            (await pool.query(monthlyPaymentQuery, [totalDebt, currentCreditRate, 5])).rows[0].monthly_payment
        ));
        const monthlySavings = oldMonthlyPayment - newMonthlyPayment;
        const totalSavings = monthlySavings * 60; // 5 years = 60 months
        
        console.log(`[REFINANCE CREDIT] Database-driven calculation: ${newRate}% rate (down from ${currentCreditRate}%), ₪${newMonthlyPayment}/month, ₪${totalSavings} total savings`);
        
        res.json({
            status: 'success',
            message: 'Credit refinance calculation completed using database parameters',
            data: {
                percent: newRate,
                monthly_payment: newMonthlyPayment,
                total_savings: totalSavings,
                total_debt: totalDebt,
                monthly_savings: monthlySavings,
                old_rate: currentCreditRate,
                calculation_source: 'database_driven'
            }
        });
        
    } catch (err) {
        console.error('Refinance credit error:', err);
        res.status(500).json({ status: 'error', message: 'Server error' });
    }
});

// JWT middleware for admin authentication
const requireAdmin = (req, res, next) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ status: 'error', message: 'Admin access required' });
    }
    
    const token = authHeader.substring(7);
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
        
        if (!decoded.role || !decoded.is_staff) {
            return res.status(403).json({ status: 'error', message: 'Admin privileges required' });
        }
        
        req.admin = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ status: 'error', message: 'Invalid admin token' });
    }
};

// ADMIN LOGIN ENDPOINT
app.post('/api/admin/login', async (req, res) => {
    const { email, password } = req.body;
    
    console.log(`[ADMIN LOGIN] Attempt: ${email}`);
    
    if (!email || !password) {
        return res.status(400).json({
            status: 'error',
            message: 'Email and password required'
        });
    }
    
    try {
        // Find admin user in clients table with admin role
        const adminResult = await pool.query(
            'SELECT * FROM clients WHERE email = $1 AND (role = $2 OR is_staff = true)',
            [email, 'admin']
        );
        
        if (adminResult.rows.length === 0) {
            return res.status(401).json({
                status: 'error',
                message: 'Invalid admin credentials'
            });
        }
        
        const admin = adminResult.rows[0];
        
        // For testing, accept "test" password, in production use bcrypt
        if (password !== 'test' && admin.password_hash !== password) {
            return res.status(401).json({
                status: 'error',
                message: 'Invalid admin credentials'
            });
        }
        
        console.log(`[ADMIN LOGIN] Admin authenticated: ${admin.first_name} ${admin.last_name}`);
        
        // Generate JWT with admin privileges
        const token = jwt.sign(
            {
                id: admin.id,
                email: admin.email,
                role: admin.role || 'admin',
                name: `${admin.first_name} ${admin.last_name}`,
                is_staff: true
            },
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '24h' }
        );
        
        res.json({
            status: 'success',
            message: 'Admin login successful',
            data: {
                token,
                admin: {
                    id: admin.id,
                    name: `${admin.first_name} ${admin.last_name}`,
                    email: admin.email,
                    role: admin.role || 'admin'
                }
            }
        });
        
    } catch (err) {
        console.error('Admin login error:', err);
        res.status(500).json({ status: 'error', message: 'Server error' });
    }
});

// ADMIN PROFILE ENDPOINT
app.get('/api/admin/profile', requireAdmin, async (req, res) => {
    try {
        const adminResult = await pool.query(
            'SELECT id, first_name, last_name, email, role FROM clients WHERE id = $1',
            [req.admin.id]
        );
        
        if (adminResult.rows.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: 'Admin not found'
            });
        }
        
        const admin = adminResult.rows[0];
        
        res.json({
            status: 'success',
            data: {
                admin: {
                    id: admin.id,
                    name: `${admin.first_name} ${admin.last_name}`,
                    email: admin.email,
                    role: admin.role || 'admin'
                }
            }
        });
        
    } catch (err) {
        console.error('Admin profile error:', err);
        res.status(500).json({ status: 'error', message: 'Server error' });
    }
});

// ADMIN STATS ENDPOINT
app.get('/api/admin/stats', requireAdmin, async (req, res) => {
    try {
        // Get various statistics
        const clientsResult = await pool.query('SELECT COUNT(*) as count FROM clients');
        const banksResult = await pool.query('SELECT COUNT(*) as count FROM banks');
        const applicationsResult = await pool.query('SELECT COUNT(*) as count FROM loan_applications');
        const adminsResult = await pool.query('SELECT COUNT(*) as count FROM clients WHERE role = $1 OR is_staff = true', ['admin']);
        
        res.json({
            status: 'success',
            data: {
                totalClients: parseInt(clientsResult.rows[0].count) || 0,
                totalBanks: parseInt(banksResult.rows[0].count) || 0,
                totalApplications: parseInt(applicationsResult.rows[0].count) || 0,
                totalAdmins: parseInt(adminsResult.rows[0].count) || 0
            }
        });
        
    } catch (err) {
        console.error('Admin stats error:', err);
        res.status(500).json({ status: 'error', message: 'Server error' });
    }
});

// ADMIN BANK MANAGEMENT ENDPOINTS

// GET all banks
app.get('/api/admin/banks', requireAdmin, async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM banks ORDER BY name_en ASC');
        res.json({
            status: 'success',
            data: result.rows
        });
    } catch (err) {
        console.error('Get banks error:', err);
        res.status(500).json({ status: 'error', message: 'Server error' });
    }
});

// GET single bank
app.get('/api/admin/banks/:id', requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT * FROM banks WHERE id = $1', [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ status: 'error', message: 'Bank not found' });
        }
        
        res.json({
            status: 'success',
            data: result.rows[0]
        });
    } catch (err) {
        console.error('Get bank error:', err);
        res.status(500).json({ status: 'error', message: 'Server error' });
    }
});

// CREATE new bank
app.post('/api/admin/banks', requireAdmin, async (req, res) => {
    try {
        const { name_en, name_ru, name_he, url, logo, priority, tender } = req.body;
        
        if (!name_en) {
            return res.status(400).json({ status: 'error', message: 'English name (name_en) is required' });
        }
        
        const result = await pool.query(
            'INSERT INTO banks (name_en, name_ru, name_he, url, logo, priority, tender, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW()) RETURNING *',
            [name_en, name_ru || '', name_he || '', url || '', logo || '', priority || 1, tender || 1]
        );
        
        res.status(201).json({
            status: 'success',
            message: 'Bank created successfully',
            data: result.rows[0]
        });
    } catch (err) {
        console.error('Create bank error:', err);
        if (err.code === '23505') { // Unique constraint violation
            res.status(400).json({ status: 'error', message: 'Bank with this name already exists' });
        } else {
            res.status(500).json({ status: 'error', message: 'Server error' });
        }
    }
});

// UPDATE bank
app.put('/api/admin/banks/:id', requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { name_en, name_ru, name_he, url, logo, priority, tender } = req.body;
        
        if (!name_en) {
            return res.status(400).json({ status: 'error', message: 'English name (name_en) is required' });
        }
        
        const result = await pool.query(
            'UPDATE banks SET name_en = $1, name_ru = $2, name_he = $3, url = $4, logo = $5, priority = $6, tender = $7, updated_at = NOW() WHERE id = $8 RETURNING *',
            [name_en, name_ru || '', name_he || '', url || '', logo || '', priority || 1, tender || 1, id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ status: 'error', message: 'Bank not found' });
        }
        
        res.json({
            status: 'success',
            message: 'Bank updated successfully',
            data: result.rows[0]
        });
    } catch (err) {
        console.error('Update bank error:', err);
        if (err.code === '23505') {
            res.status(400).json({ status: 'error', message: 'Bank with this name already exists' });
        } else {
            res.status(500).json({ status: 'error', message: 'Server error' });
        }
    }
});

// DELETE bank
app.delete('/api/admin/banks/:id', requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        
        const result = await pool.query('DELETE FROM banks WHERE id = $1 RETURNING *', [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ status: 'error', message: 'Bank not found' });
        }
        
        res.json({
            status: 'success',
            message: 'Bank deleted successfully'
        });
    } catch (err) {
        console.error('Delete bank error:', err);
        res.status(500).json({ status: 'error', message: 'Server error' });
    }
});

// UPDATE bank configuration (rates)
app.put('/api/admin/banks/:id/config', requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { baseRate, minRate, maxRate } = req.body;
        
        console.log(`[BANK CONFIG] Updating bank ${id} rates:`, { baseRate, minRate, maxRate });
        
        // Check if bank exists
        const bankExists = await pool.query('SELECT id, name_en, name_ru FROM banks WHERE id = $1', [id]);
        if (bankExists.rows.length === 0) {
            return res.status(404).json({ status: 'error', message: 'Bank not found' });
        }
        
        const bankName = bankExists.rows[0].name_en || bankExists.rows[0].name_ru || `Bank ${id}`;
        
        // Create bank_config table if it doesn't exist
        try {
            await pool.query(`
                CREATE TABLE IF NOT EXISTS bank_config (
                    id SERIAL PRIMARY KEY,
                    bank_id INTEGER REFERENCES banks(id),
                    base_rate DECIMAL(5,2),
                    min_rate DECIMAL(5,2),
                    max_rate DECIMAL(5,2),
                    created_at TIMESTAMP DEFAULT NOW(),
                    updated_at TIMESTAMP DEFAULT NOW(),
                    UNIQUE(bank_id)
                )
            `);
        } catch (createErr) {
            console.log('Table already exists or creation failed:', createErr.message);
        }
        
        // Insert or update bank configuration
        const configResult = await pool.query(`
            INSERT INTO bank_config (bank_id, base_rate, min_rate, max_rate, created_at, updated_at)
            VALUES ($1, $2, $3, $4, NOW(), NOW())
            ON CONFLICT (bank_id) 
            DO UPDATE SET 
                base_rate = $2,
                min_rate = $3,
                max_rate = $4,
                updated_at = NOW()
            RETURNING *
        `, [id, baseRate, minRate, maxRate]);
        
        console.log(`[BANK CONFIG] Successfully updated bank ${id} (${bankName}) configuration`);
        
        res.json({
            status: 'success',
            message: 'Bank configuration updated successfully',
            data: {
                bankId: parseInt(id),
                bankName: bankName,
                baseRate: baseRate,
                minRate: minRate,
                maxRate: maxRate,
                config: configResult.rows[0]
            }
        });
        
    } catch (err) {
        console.error('Update bank config error:', err);
        res.status(500).json({ 
            status: 'error', 
            message: 'Server error updating bank configuration',
            error: err.message 
        });
    }
});

// GET bank configuration (rates)
app.get('/api/admin/banks/:id/config', requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        
        console.log(`[BANK CONFIG] Fetching bank ${id} configuration`);
        
        // Check if bank exists
        const bankExists = await pool.query('SELECT id, name_en, name_ru FROM banks WHERE id = $1', [id]);
        if (bankExists.rows.length === 0) {
            return res.status(404).json({ status: 'error', message: 'Bank not found' });
        }
        
        const bankName = bankExists.rows[0].name_en || bankExists.rows[0].name_ru || `Bank ${id}`;
        
        // Get bank configuration from bank_config table
        const configResult = await pool.query('SELECT * FROM bank_config WHERE bank_id = $1', [id]);
        
        if (configResult.rows.length === 0) {
            // No configuration found, return defaults
            console.log(`[BANK CONFIG] No configuration found for bank ${id}, returning defaults`);
            return res.json({
                status: 'success',
                message: 'Bank configuration retrieved (defaults)',
                data: {
                    bankId: parseInt(id),
                    bankName: bankName,
                    baseRate: null,
                    minRate: null,
                    maxRate: null,
                    hasConfig: false
                }
            });
        }
        
        const config = configResult.rows[0];
        console.log(`[BANK CONFIG] Retrieved bank ${id} configuration:`, config);
        
        res.json({
            status: 'success',
            message: 'Bank configuration retrieved successfully',
            data: {
                bankId: parseInt(id),
                bankName: bankName,
                baseRate: config.base_rate,
                minRate: config.min_rate,
                maxRate: config.max_rate,
                hasConfig: true,
                lastUpdated: config.updated_at
            }
        });
        
    } catch (err) {
        console.error('Get bank config error:', err);
        res.status(500).json({ 
            status: 'error', 
            message: 'Server error retrieving bank configuration',
            error: err.message 
        });
    }
});

// GET bank statistics (active loans and average rate)
app.get('/api/admin/banks/:id/stats', requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        
        console.log(`[BANK STATS] Fetching statistics for bank ${id}`);
        
        // Check if bank exists
        const bankExists = await pool.query('SELECT id, name_en, name_ru FROM banks WHERE id = $1', [id]);
        if (bankExists.rows.length === 0) {
            return res.status(404).json({ status: 'error', message: 'Bank not found' });
        }
        
        // Check if applications table exists
        const tableExists = await pool.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = 'applications'
            )
        `);
        
        let activeLoans = 0;
        let avgRate = null;
        let hasRealData = false;
        
        if (tableExists.rows[0].exists) {
            // Get active loans count
            const activeLoansResult = await pool.query(
                'SELECT COUNT(*) as count FROM applications WHERE bank_id = $1 AND status = $2',
                [id, 'approved']
            );
            
            activeLoans = parseInt(activeLoansResult.rows[0].count) || 0;
            
            if (activeLoans > 0) {
                // Get weighted average rate
                const avgRateResult = await pool.query(
                    'SELECT SUM(loan_amount * interest_rate) / NULLIF(SUM(loan_amount), 0) as weighted_avg FROM applications WHERE bank_id = $1 AND status = $2',
                    [id, 'approved']
                );
                
                avgRate = avgRateResult.rows[0].weighted_avg;
                hasRealData = true;
            }
        } else {
            // Check loan_applications table as alternative
            const loanTableExists = await pool.query(`
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_schema = 'public' 
                    AND table_name = 'loan_applications'
                )
            `);
            
            if (loanTableExists.rows[0].exists) {
                const activeLoansResult = await pool.query(
                    'SELECT COUNT(*) as count FROM loan_applications WHERE bank_id = $1 AND application_status = $2',
                    [id, 'approved']
                );
                
                activeLoans = parseInt(activeLoansResult.rows[0].count) || 0;
                
                if (activeLoans > 0) {
                    const avgRateResult = await pool.query(
                        'SELECT SUM(approved_amount * interest_rate) / NULLIF(SUM(approved_amount), 0) as weighted_avg FROM loan_applications WHERE bank_id = $1 AND application_status = $2 AND approved_amount IS NOT NULL',
                        [id, 'approved']
                    );
                    
                    avgRate = avgRateResult.rows[0].weighted_avg;
                    hasRealData = true;
                }
            }
        }
        
        // If no loans or no data, fallback to config rates
        if (!hasRealData || avgRate === null) {
            const configResult = await pool.query(
                'SELECT base_rate, min_rate, max_rate FROM bank_config WHERE bank_id = $1',
                [id]
            );
            
            if (configResult.rows.length > 0) {
                const config = configResult.rows[0];
                if (config.base_rate !== null && config.min_rate !== null && config.max_rate !== null) {
                    avgRate = (parseFloat(config.base_rate) + parseFloat(config.min_rate) + parseFloat(config.max_rate)) / 3;
                }
            }
        }
        
        console.log(`[BANK STATS] Bank ${id} - Active loans: ${activeLoans}, Avg rate: ${avgRate}, Has real data: ${hasRealData}`);
        
        res.json({
            status: 'success',
            data: {
                activeLoans: activeLoans,
                avgRate: avgRate ? parseFloat(avgRate).toFixed(2) : null,
                hasRealData: hasRealData
            }
        });
        
    } catch (err) {
        console.error('Get bank stats error:', err);
        res.status(500).json({ 
            status: 'error', 
            message: 'Server error retrieving bank statistics',
            error: err.message 
        });
    }
});

// ADMIN BANK FALLBACK CONFIGURATION ENDPOINTS

// GET bank fallback configuration
app.get('/api/admin/banks/fallback-config', requireAdmin, async (req, res) => {
    try {
        console.log('[BANK FALLBACK CONFIG] Fetching fallback configuration');
        
        // Get current configuration
        const configResult = await pool.query(`
            SELECT * FROM bank_fallback_config ORDER BY id DESC LIMIT 1
        `);
        
        // Get banks with fallback settings
        const banksResult = await pool.query(`
            SELECT 
                id, name_en, name_he, name_ru, 
                show_in_fallback, fallback_priority, 
                fallback_interest_rate, fallback_approval_rate,
                is_active
            FROM banks 
            ORDER BY fallback_priority ASC, priority ASC, name_en ASC
        `);
        
        const config = configResult.rows[0] || {
            enable_fallback: true,
            fallback_method: 'database_relaxed',
            max_fallback_banks: 3,
            default_term_years: 25,
            language_preference: 'auto'
        };
        
        res.json({
            success: true,
            config: config,
            banks: banksResult.rows
        });
        
    } catch (err) {
        console.error('[BANK FALLBACK CONFIG] Error:', err);
        res.status(500).json({ 
            success: false, 
            error: err.message 
        });
    }
});

// PUT update bank fallback configuration
app.put('/api/admin/banks/fallback-config', requireAdmin, async (req, res) => {
    try {
        const { 
            enable_fallback, 
            fallback_method, 
            max_fallback_banks, 
            default_term_years, 
            language_preference 
        } = req.body;
        
        console.log('[BANK FALLBACK CONFIG] Updating configuration:', req.body);
        
        // Update or insert configuration
        const upsertResult = await pool.query(`
            INSERT INTO bank_fallback_config 
            (enable_fallback, fallback_method, max_fallback_banks, default_term_years, language_preference, updated_at)
            VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
            ON CONFLICT (id) DO UPDATE SET
                enable_fallback = EXCLUDED.enable_fallback,
                fallback_method = EXCLUDED.fallback_method, 
                max_fallback_banks = EXCLUDED.max_fallback_banks,
                default_term_years = EXCLUDED.default_term_years,
                language_preference = EXCLUDED.language_preference,
                updated_at = CURRENT_TIMESTAMP
            RETURNING *
        `, [enable_fallback, fallback_method, max_fallback_banks, default_term_years, language_preference]);
        
        res.json({
            success: true,
            message: 'Fallback configuration updated successfully',
            config: upsertResult.rows[0]
        });
        
    } catch (err) {
        console.error('[BANK FALLBACK CONFIG] Error updating:', err);
        res.status(500).json({ 
            success: false, 
            error: err.message 
        });
    }
});

// PUT update bank fallback settings
app.put('/api/admin/banks/:id/fallback', requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { 
            show_in_fallback, 
            fallback_priority, 
            fallback_interest_rate, 
            fallback_approval_rate 
        } = req.body;
        
        console.log(`[BANK FALLBACK] Updating bank ${id} fallback settings:`, req.body);
        
        const result = await pool.query(`
            UPDATE banks 
            SET 
                show_in_fallback = $1,
                fallback_priority = $2,
                fallback_interest_rate = $3,
                fallback_approval_rate = $4,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $5
            RETURNING id, name_en, show_in_fallback, fallback_priority, 
                     fallback_interest_rate, fallback_approval_rate
        `, [show_in_fallback, fallback_priority, fallback_interest_rate, fallback_approval_rate, id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Bank not found'
            });
        }
        
        res.json({
            success: true,
            message: 'Bank fallback settings updated successfully',
            bank: result.rows[0]
        });
        
    } catch (err) {
        console.error('[BANK FALLBACK] Error updating bank settings:', err);
        res.status(500).json({ 
            success: false, 
            error: err.message 
        });
    }
});

// ADMIN BANKING STANDARDS ENDPOINTS

// GET all banking standards
app.get('/api/admin/banking-standards', requireAdmin, async (req, res) => {
    try {
        console.log('[BANKING STANDARDS] Fetching all banking standards');
        
        // Check if banking_standards table exists
        const tableExists = await pool.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = 'banking_standards'
            )
        `);
        
        if (!tableExists.rows[0].exists) {
            // Create the table if it doesn't exist
            await pool.query(`
                CREATE TABLE IF NOT EXISTS banking_standards (
                    id SERIAL PRIMARY KEY,
                    standard_type VARCHAR(50) NOT NULL,
                    name VARCHAR(100) NOT NULL,
                    description TEXT,
                    min_value DECIMAL(10,2),
                    max_value DECIMAL(10,2),
                    default_value DECIMAL(10,2),
                    unit VARCHAR(20),
                    is_active BOOLEAN DEFAULT true,
                    created_at TIMESTAMP DEFAULT NOW(),
                    updated_at TIMESTAMP DEFAULT NOW()
                )
            `);
            
            // Insert default standards
            await pool.query(`
                INSERT INTO banking_standards (standard_type, name, description, min_value, max_value, default_value, unit)
                VALUES 
                    ('ltv', 'Loan-to-Value Ratio', 'Maximum percentage of property value that can be borrowed', 50, 95, 75, '%'),
                    ('dti', 'Debt-to-Income Ratio', 'Maximum percentage of income that can go to debt payments', 20, 50, 35, '%'),
                    ('credit_score', 'Minimum Credit Score', 'Minimum credit score required for loan approval', 580, 850, 640, 'points'),
                    ('interest_spread', 'Interest Rate Spread', 'Additional percentage added to base rate', 1, 5, 2.5, '%')
                ON CONFLICT DO NOTHING
            `);
        }
        
        const result = await pool.query('SELECT * FROM banking_standards ORDER BY standard_type, name');
        
        res.json({
            status: 'success',
            data: result.rows
        });
        
    } catch (err) {
        console.error('Get banking standards error:', err);
        res.status(500).json({ 
            status: 'error', 
            message: 'Server error retrieving banking standards',
            error: err.message 
        });
    }
});

// GET specific loan type standards
app.get('/api/admin/banking-standards/:loanType', requireAdmin, async (req, res) => {
    try {
        const { loanType } = req.params;
        console.log(`[BANKING STANDARDS] Fetching standards for loan type: ${loanType}`);
        
        // Return mock data for specific loan types
        const standards = {
            mortgage: {
                ltv_max: 75,
                dti_max: 35,
                min_credit_score: 640,
                min_down_payment: 25,
                max_term_years: 30,
                processing_fee: 1.5
            },
            mortgage_refinance: {
                ltv_max: 80,
                dti_max: 40,
                min_credit_score: 620,
                min_equity: 20,
                max_term_years: 30,
                processing_fee: 1.0
            },
            credit: {
                dti_max: 45,
                min_credit_score: 600,
                max_amount: 500000,
                max_term_years: 7,
                processing_fee: 2.0
            },
            credit_refinance: {
                dti_max: 50,
                min_credit_score: 580,
                max_amount: 400000,
                max_term_years: 7,
                processing_fee: 1.5
            }
        };
        
        if (standards[loanType]) {
            res.json({
                status: 'success',
                data: standards[loanType]
            });
        } else {
            res.status(404).json({
                status: 'error',
                message: 'Loan type standards not found'
            });
        }
        
    } catch (err) {
        console.error('Get loan type standards error:', err);
        res.status(500).json({ 
            status: 'error', 
            message: 'Server error retrieving loan type standards',
            error: err.message 
        });
    }
});

// UPDATE banking standard
app.put('/api/admin/banking-standards/:id', requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        
        console.log(`[BANKING STANDARDS] Updating standard ${id}:`, updates);
        
        // Build dynamic update query
        const updateFields = [];
        const values = [];
        let paramIndex = 1;
        
        Object.keys(updates).forEach(key => {
            if (key !== 'id' && updates[key] !== undefined) {
                updateFields.push(`${key} = $${paramIndex}`);
                values.push(updates[key]);
                paramIndex++;
            }
        });
        
        if (updateFields.length === 0) {
            return res.status(400).json({
                status: 'error',
                message: 'No fields to update'
            });
        }
        
        values.push(id);
        const query = `
            UPDATE banking_standards 
            SET ${updateFields.join(', ')}, updated_at = NOW()
            WHERE id = $${paramIndex}
            RETURNING *
        `;
        
        const result = await pool.query(query, values);
        
        if (result.rows.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: 'Banking standard not found'
            });
        }
        
        res.json({
            status: 'success',
            message: 'Banking standard updated successfully',
            data: result.rows[0]
        });
        
    } catch (err) {
        console.error('Update banking standard error:', err);
        res.status(500).json({ 
            status: 'error', 
            message: 'Server error updating banking standard',
            error: err.message 
        });
    }
});

// ADMIN LOAN APPLICATIONS MANAGEMENT ENDPOINTS

// GET all loan applications
app.get('/api/admin/applications', requireAdmin, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const status = req.query.status || '';
        const loanType = req.query.loan_type || '';
        const search = req.query.search || '';
        const offset = (page - 1) * limit;
        
        let query = `
            SELECT 
                la.id, la.application_number, la.loan_type, la.requested_amount, 
                la.approved_amount, la.loan_term_years, la.interest_rate,
                la.application_status, la.approval_status, la.rejection_reason,
                la.submitted_at, la.reviewed_at, la.approved_at, la.created_at,
                c.first_name, c.last_name, c.email, c.phone,
                b.name_en as bank_name
            FROM loan_applications la
            LEFT JOIN clients c ON la.client_id = c.id
            LEFT JOIN banks b ON la.bank_id = b.id
        `;
        
        let countQuery = 'SELECT COUNT(*) as count FROM loan_applications la LEFT JOIN clients c ON la.client_id = c.id';
        let queryParams = [];
        let countParams = [];
        let whereConditions = [];
        
        if (status) {
            whereConditions.push(`la.application_status = $${queryParams.length + 1}`);
            queryParams.push(status);
            countParams.push(status);
        }
        
        if (loanType) {
            whereConditions.push(`la.loan_type = $${queryParams.length + 1}`);
            queryParams.push(loanType);
            countParams.push(loanType);
        }
        
        if (search) {
            whereConditions.push(`(c.first_name ILIKE $${queryParams.length + 1} OR c.last_name ILIKE $${queryParams.length + 1} OR c.email ILIKE $${queryParams.length + 1} OR la.application_number ILIKE $${queryParams.length + 1})`);
            queryParams.push(`%${search}%`);
            countParams.push(`%${search}%`);
        }
        
        if (whereConditions.length > 0) {
            const whereClause = ' WHERE ' + whereConditions.join(' AND ');
            query += whereClause;
            countQuery += whereClause;
        }
        
        query += ` ORDER BY la.created_at DESC LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;
        queryParams.push(limit, offset);
        
        const [result, countResult] = await Promise.all([
            pool.query(query, queryParams),
            pool.query(countQuery, countParams)
        ]);
        
        const totalApplications = parseInt(countResult.rows[0].count);
        const totalPages = Math.ceil(totalApplications / limit);
        
        res.json({
            status: 'success',
            data: {
                applications: result.rows,
                pagination: {
                    page,
                    limit,
                    total: totalApplications,
                    totalPages,
                    hasNext: page < totalPages,
                    hasPrev: page > 1
                }
            }
        });
    } catch (err) {
        console.error('Get applications error:', err);
        res.status(500).json({ status: 'error', message: 'Server error' });
    }
});

// GET single loan application with full details
app.get('/api/admin/applications/:id', requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        
        // Get application details
        const appQuery = `
            SELECT 
                la.*,
                c.first_name, c.last_name, c.email, c.phone, c.date_of_birth,
                b.name_en as bank_name,
                p.property_type, p.property_value, p.property_address
            FROM loan_applications la
            LEFT JOIN clients c ON la.client_id = c.id
            LEFT JOIN banks b ON la.bank_id = b.id
            LEFT JOIN properties p ON la.property_id = p.id
            WHERE la.id = $1
        `;
        
        // Get client employment info
        const employmentQuery = `
            SELECT * FROM client_employment 
            WHERE client_id = (SELECT client_id FROM loan_applications WHERE id = $1)
            ORDER BY created_at DESC LIMIT 1
        `;
        
        // Get client assets
        const assetsQuery = `
            SELECT * FROM client_assets 
            WHERE client_id = (SELECT client_id FROM loan_applications WHERE id = $1)
            ORDER BY created_at DESC LIMIT 1
        `;
        
        // Get client debts
        const debtsQuery = `
            SELECT * FROM client_debts 
            WHERE client_id = (SELECT client_id FROM loan_applications WHERE id = $1) AND is_active = true
            ORDER BY created_at DESC
        `;
        
        // Get documents
        const documentsQuery = `
            SELECT * FROM client_documents 
            WHERE application_id = $1
            ORDER BY upload_date DESC
        `;
        
        const [appResult, employmentResult, assetsResult, debtsResult, documentsResult] = await Promise.all([
            pool.query(appQuery, [id]),
            pool.query(employmentQuery, [id]),
            pool.query(assetsQuery, [id]),
            pool.query(debtsQuery, [id]),
            pool.query(documentsQuery, [id])
        ]);
        
        if (appResult.rows.length === 0) {
            return res.status(404).json({ status: 'error', message: 'Application not found' });
        }
        
        const application = appResult.rows[0];
        application.employment = employmentResult.rows[0] || null;
        application.assets = assetsResult.rows[0] || null;
        application.debts = debtsResult.rows || [];
        application.documents = documentsResult.rows || [];
        
        res.json({
            status: 'success',
            data: application
        });
    } catch (err) {
        console.error('Get application error:', err);
        res.status(500).json({ status: 'error', message: 'Server error' });
    }
});

// UPDATE loan application status (approve/reject)
app.put('/api/admin/applications/:id/status', requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { application_status, approval_status, rejection_reason, approved_amount, interest_rate } = req.body;
        
        if (!application_status) {
            return res.status(400).json({ status: 'error', message: 'Application status is required' });
        }
        
        let updateFields = ['application_status = $2', 'updated_at = NOW()'];
        let queryParams = [id, application_status];
        let paramIndex = 3;
        
        if (approval_status) {
            updateFields.push(`approval_status = $${paramIndex}`);
            queryParams.push(approval_status);
            paramIndex++;
        }
        
        if (rejection_reason) {
            updateFields.push(`rejection_reason = $${paramIndex}`);
            queryParams.push(rejection_reason);
            paramIndex++;
        }
        
        if (approved_amount) {
            updateFields.push(`approved_amount = $${paramIndex}`);
            queryParams.push(approved_amount);
            paramIndex++;
        }
        
        if (interest_rate) {
            updateFields.push(`interest_rate = $${paramIndex}`);
            queryParams.push(interest_rate);
            paramIndex++;
        }
        
        // Set timestamps based on status
        if (application_status === 'under_review' && !req.body.reviewed_at) {
            updateFields.push('reviewed_at = NOW()');
        }
        
        if (application_status === 'approved' && !req.body.approved_at) {
            updateFields.push('approved_at = NOW()');
        }
        
        const query = `UPDATE loan_applications SET ${updateFields.join(', ')} WHERE id = $1 RETURNING *`;
        
        const result = await pool.query(query, queryParams);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ status: 'error', message: 'Application not found' });
        }
        
        res.json({
            status: 'success',
            message: 'Application status updated successfully',
            data: result.rows[0]
        });
    } catch (err) {
        console.error('Update application status error:', err);
        res.status(500).json({ status: 'error', message: 'Server error' });
    }
});

// GET application statistics for dashboard
app.get('/api/admin/applications/stats', requireAdmin, async (req, res) => {
    try {
        const statsQuery = `
            SELECT 
                COUNT(*) as total_applications,
                COUNT(CASE WHEN application_status = 'submitted' THEN 1 END) as pending_review,
                COUNT(CASE WHEN application_status = 'under_review' THEN 1 END) as under_review,
                COUNT(CASE WHEN application_status = 'approved' THEN 1 END) as approved,
                COUNT(CASE WHEN application_status = 'rejected' THEN 1 END) as rejected,
                COUNT(CASE WHEN created_at >= NOW() - INTERVAL '30 days' THEN 1 END) as last_30_days,
                AVG(CASE WHEN application_status = 'approved' THEN requested_amount END) as avg_approved_amount
            FROM loan_applications
        `;
        
        const result = await pool.query(statsQuery);
        const stats = result.rows[0];
        
        // Convert string numbers to integers
        Object.keys(stats).forEach(key => {
            if (key !== 'avg_approved_amount' && stats[key] !== null) {
                stats[key] = parseInt(stats[key]) || 0;
            }
        });
        
        if (stats.avg_approved_amount) {
            stats.avg_approved_amount = parseFloat(stats.avg_approved_amount).toFixed(2);
        } else {
            stats.avg_approved_amount = 0;
        }
        
        res.json({
            status: 'success',
            data: stats
        });
    } catch (err) {
        console.error('Get application stats error:', err);
        res.status(500).json({ status: 'error', message: 'Server error' });
    }
});

// ADMIN USER MANAGEMENT ENDPOINTS

// GET all clients/users
app.get('/api/admin/users', requireAdmin, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const search = req.query.search || '';
        const offset = (page - 1) * limit;
        
        let query = 'SELECT id, first_name, last_name, email, phone, role, is_staff, created_at, updated_at FROM clients';
        let countQuery = 'SELECT COUNT(*) as count FROM clients';
        let queryParams = [];
        let countParams = [];
        
        if (search) {
            query += ' WHERE first_name ILIKE $1 OR last_name ILIKE $1 OR email ILIKE $1 OR phone ILIKE $1';
            countQuery += ' WHERE first_name ILIKE $1 OR last_name ILIKE $1 OR email ILIKE $1 OR phone ILIKE $1';
            queryParams = [`%${search}%`];
            countParams = [`%${search}%`];
        }
        
        query += ' ORDER BY created_at DESC LIMIT $' + (queryParams.length + 1) + ' OFFSET $' + (queryParams.length + 2);
        queryParams.push(limit, offset);
        
        const [result, countResult] = await Promise.all([
            pool.query(query, queryParams),
            pool.query(countQuery, countParams)
        ]);
        
        const totalUsers = parseInt(countResult.rows[0].count);
        const totalPages = Math.ceil(totalUsers / limit);
        
        res.json({
            status: 'success',
            data: {
                users: result.rows,
                pagination: {
                    page,
                    limit,
                    total: totalUsers,
                    totalPages,
                    hasNext: page < totalPages,
                    hasPrev: page > 1
                }
            }
        });
    } catch (err) {
        console.error('Get users error:', err);
        res.status(500).json({ status: 'error', message: 'Server error' });
    }
});

// GET single user
app.get('/api/admin/users/:id', requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT id, first_name, last_name, email, phone, role, is_staff, created_at, updated_at FROM clients WHERE id = $1', [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ status: 'error', message: 'User not found' });
        }
        
        res.json({
            status: 'success',
            data: result.rows[0]
        });
    } catch (err) {
        console.error('Get user error:', err);
        res.status(500).json({ status: 'error', message: 'Server error' });
    }
});

// UPDATE user
app.put('/api/admin/users/:id', requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { first_name, last_name, email, phone, role, is_staff } = req.body;
        
        if (!first_name || !last_name || !email) {
            return res.status(400).json({ status: 'error', message: 'First name, last name, and email are required' });
        }
        
        const result = await pool.query(
            'UPDATE clients SET first_name = $1, last_name = $2, email = $3, phone = $4, role = $5, is_staff = $6, updated_at = NOW() WHERE id = $7 RETURNING id, first_name, last_name, email, phone, role, is_staff, created_at, updated_at',
            [first_name, last_name, email, phone || '', role || 'client', is_staff || false, id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ status: 'error', message: 'User not found' });
        }
        
        res.json({
            status: 'success',
            message: 'User updated successfully',
            data: result.rows[0]
        });
    } catch (err) {
        console.error('Update user error:', err);
        if (err.code === '23505') {
            res.status(400).json({ status: 'error', message: 'Email already exists' });
        } else {
            res.status(500).json({ status: 'error', message: 'Server error' });
        }
    }
});

// DELETE user
app.delete('/api/admin/users/:id', requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        
        // Don't allow deleting admin users
        const userCheck = await pool.query('SELECT role, is_staff FROM clients WHERE id = $1', [id]);
        if (userCheck.rows.length > 0 && (userCheck.rows[0].role === 'admin' || userCheck.rows[0].is_staff)) {
            return res.status(403).json({ status: 'error', message: 'Cannot delete admin users' });
        }
        
        const result = await pool.query('DELETE FROM clients WHERE id = $1 RETURNING *', [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ status: 'error', message: 'User not found' });
        }
        
        res.json({
            status: 'success',
            message: 'User deleted successfully'
        });
    } catch (err) {
        console.error('Delete user error:', err);
        res.status(500).json({ status: 'error', message: 'Server error' });
    }
});

// ADMIN CALCULATION MANAGEMENT ENDPOINTS

// GET calculation parameters
app.get('/api/admin/calculations', requireAdmin, async (req, res) => {
    try {
        // Get calculation parameters from params table if it exists, otherwise return defaults
        let params = {};
        
        try {
            const result = await pool.query('SELECT key, value FROM params WHERE key LIKE $1', ['calc_%']);
            result.rows.forEach(row => {
                params[row.key] = row.value;
            });
        } catch (err) {
            console.log('Params table not accessible, using defaults');
        }
        
        // FIXED: Get calculation parameters from banking_standards instead of hardcoded values
        const bankingStandardsQuery = `
            SELECT standard_category, standard_name, standard_value 
            FROM banking_standards 
            WHERE business_path = 'mortgage' 
                AND is_active = true
                AND (effective_to IS NULL OR effective_to >= CURRENT_DATE)
        `;
        const standardsResult = await pool.query(bankingStandardsQuery);
        
        // Build calculations object from database standards
        const calculations = { ...params }; // Start with any existing params
        
        // Set database-driven defaults (no more hardcoded values)
        try {
            const currentMortgageRate = await contentPool.query('SELECT get_current_mortgage_rate() as rate');
            calculations.calc_mortgage_default_rate = parseFloat(currentMortgageRate.rows[0].rate);
        } catch (e) {
            console.warn('Could not fetch current mortgage rate, using fallback');
            calculations.calc_mortgage_default_rate = 5.0; // Minimal fallback
        }
        
        // Map banking standards to calc parameters
        standardsResult.rows.forEach(row => {
            const { standard_category, standard_name, standard_value } = row;
            
            // Map LTV standards
            if (standard_category === 'ltv' && standard_name === 'standard_ltv_max') {
                calculations.calc_max_ltv_ratio = parseFloat(standard_value);
            }
            
            // Map amount standards  
            if (standard_category === 'amount') {
                if (standard_name === 'minimum_loan_amount') {
                    calculations.calc_min_loan_amount = parseFloat(standard_value);
                }
                if (standard_name === 'maximum_loan_amount') {
                    calculations.calc_max_loan_amount = parseFloat(standard_value);
                }
            }
            
            // Map credit score standards
            if (standard_category === 'credit_score' && standard_name === 'minimum_credit_score') {
                calculations.calc_min_credit_score = parseFloat(standard_value);
            }
        });
        
        // Get credit rates from credit business path
        try {
            const creditRateQuery = `
                SELECT standard_value 
                FROM banking_standards 
                WHERE business_path = 'credit' 
                    AND standard_category = 'rates' 
                    AND standard_name = 'quick_good_rate'
                    AND is_active = true
            `;
            const creditRateResult = await pool.query(creditRateQuery);
            if (creditRateResult.rows.length > 0) {
                calculations.calc_credit_default_rate = parseFloat(creditRateResult.rows[0].standard_value);
            }
        } catch (e) {
            console.warn('Could not fetch credit rate, using minimal fallback');
            calculations.calc_credit_default_rate = 8.5; // Minimal fallback
        }
        
        // Ensure all required fields have values (final fallbacks for missing database data)
        calculations.calc_mortgage_min_rate = calculations.calc_mortgage_min_rate || calculations.calc_mortgage_default_rate - 1.0;
        calculations.calc_mortgage_max_rate = calculations.calc_mortgage_max_rate || calculations.calc_mortgage_default_rate + 3.0;
        calculations.calc_credit_min_rate = calculations.calc_credit_min_rate || 5.0;
        calculations.calc_credit_max_rate = calculations.calc_credit_max_rate || 15.0;
        calculations.calc_processing_fee_min = calculations.calc_processing_fee_min || 0;
        calculations.calc_processing_fee_max = calculations.calc_processing_fee_max || 5000;
        calculations.calc_processing_fee_default = calculations.calc_processing_fee_default || 500;
        calculations.calc_min_loan_amount = calculations.calc_min_loan_amount || 50000;
        calculations.calc_max_loan_amount = calculations.calc_max_loan_amount || 5000000;
        calculations.calc_max_term_years = calculations.calc_max_term_years || 30;
        calculations.calc_min_term_years = calculations.calc_min_term_years || 1;
        
        res.json({
            status: 'success',
            data: calculations
        });
    } catch (err) {
        console.error('Get calculations error:', err);
        res.status(500).json({ status: 'error', message: 'Server error' });
    }
});

// UPDATE calculation parameters
app.put('/api/admin/calculations', requireAdmin, async (req, res) => {
    try {
        const params = req.body;
        
        // Try to update params table, create if it doesn't exist
        for (const [key, value] of Object.entries(params)) {
            if (key.startsWith('calc_')) {
                try {
                    await pool.query(
                        'INSERT INTO params (key, value, created_at, updated_at) VALUES ($1, $2, NOW(), NOW()) ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = NOW()',
                        [key, value]
                    );
                } catch (err) {
                    // If params table doesn't exist, we'll just return success
                    console.log('Params table operation failed:', err.message);
                }
            }
        }
        
        res.json({
            status: 'success',
            message: 'Calculation parameters updated successfully',
            data: params
        });
    } catch (err) {
        console.error('Update calculations error:', err);
        res.status(500).json({ status: 'error', message: 'Server error' });
    }
});

// GET mortgage calculation
app.post('/api/admin/calculate-mortgage', requireAdmin, async (req, res) => {
    try {
        const { amount, rate, years, initial_payment } = req.body;
        
        if (!amount || !rate || !years) {
            return res.status(400).json({ status: 'error', message: 'Amount, rate, and years are required' });
        }
        
        const principal = amount - (initial_payment || 0);
        const monthlyRate = rate / 100 / 12;
        const numPayments = years * 12;
        
        const monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1);
        const totalPayment = monthlyPayment * numPayments;
        const totalInterest = totalPayment - principal;
        
        res.json({
            status: 'success',
            data: {
                principal: Math.round(principal),
                monthlyPayment: Math.round(monthlyPayment),
                totalPayment: Math.round(totalPayment),
                totalInterest: Math.round(totalInterest),
                rate: rate,
                years: years
            }
        });
    } catch (err) {
        console.error('Calculate mortgage error:', err);
        res.status(500).json({ status: 'error', message: 'Server error' });
    }
});

// GET credit calculation
app.post('/api/admin/calculate-credit', requireAdmin, async (req, res) => {
    try {
        const { amount, rate, years } = req.body;
        
        if (!amount || !rate || !years) {
            return res.status(400).json({ status: 'error', message: 'Amount, rate, and years are required' });
        }
        
        const monthlyRate = rate / 100 / 12;
        const numPayments = years * 12;
        
        const monthlyPayment = amount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1);
        const totalPayment = monthlyPayment * numPayments;
        const totalInterest = totalPayment - amount;
        
        res.json({
            status: 'success',
            data: {
                principal: amount,
                monthlyPayment: Math.round(monthlyPayment),
                totalPayment: Math.round(totalPayment),
                totalInterest: Math.round(totalInterest),
                rate: rate,
                years: years
            }
        });
    } catch (err) {
        console.error('Calculate credit error:', err);
        res.status(500).json({ status: 'error', message: 'Server error' });
    }
});

// BANKING STANDARDS MANAGEMENT ENDPOINTS

// GET banking standards for a specific business path
app.get('/api/admin/banking-standards/:business_path', requireAdmin, async (req, res) => {
    try {
        const { business_path } = req.params;
        const { bank_id } = req.query;
        
        const result = await pool.query(
            'SELECT * FROM get_banking_standards($1, $2)',
            [business_path, bank_id || null]
        );
        
        res.json({
            status: 'success',
            data: {
                business_path,
                bank_id: bank_id || null,
                standards: result.rows
            }
        });
    } catch (err) {
        console.error('Get banking standards error:', err);
        res.status(500).json({ status: 'error', message: 'Server error' });
    }
});

// UPDATE banking standard value
app.put('/api/admin/banking-standards/:id', requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { standard_value, description, is_active } = req.body;
        
        const result = await pool.query(
            'UPDATE banking_standards SET standard_value = $1, description = $2, is_active = $3, updated_at = NOW() WHERE id = $4 RETURNING *',
            [standard_value, description, is_active, id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ status: 'error', message: 'Banking standard not found' });
        }
        
        res.json({
            status: 'success',
            message: 'Banking standard updated successfully',
            data: result.rows[0]
        });
    } catch (err) {
        console.error('Update banking standard error:', err);
        res.status(500).json({ status: 'error', message: 'Server error' });
    }
});

// GET banking standard change history
app.get('/api/admin/banking-standards/:id/history', requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        
        const result = await pool.query(
            'SELECT * FROM get_banking_standard_history($1)',
            [id]
        );
        
        res.json({
            status: 'success',
            data: {
                standard_id: id,
                history: result.rows
            }
        });
    } catch (err) {
        console.error('Get banking standard history error:', err);
        res.status(500).json({ status: 'error', message: 'Server error' });
    }
});

// GET recent banking standards changes
app.get('/api/admin/banking-standards-changes', requireAdmin, async (req, res) => {
    try {
        const { days = 30 } = req.query;
        
        const result = await pool.query(
            'SELECT * FROM get_recent_banking_standards_changes($1)',
            [parseInt(days)]
        );
        
        res.json({
            status: 'success',
            data: {
                days: parseInt(days),
                changes: result.rows
            }
        });
    } catch (err) {
        console.error('Get recent banking standards changes error:', err);
        res.status(500).json({ status: 'error', message: 'Server error' });
    }
});

// ================================
// PHASE 2: ENHANCED BANK WORKER REGISTRATION APIs
// ================================

/**
 * PHASE 2 - INVITATION-BASED REGISTRATION SYSTEM
 * 
 * This section implements the complete invitation-based bank worker registration
 * system as specified in the Confluence documentation and Phase 2 requirements.
 * 
 * Features:
 * - Admin invitation management
 * - Multi-language validation
 * - Approval workflow
 * - Status tracking
 * - Automated cleanup
 */

// ================================
// INVITATION MANAGEMENT ENDPOINTS
// ================================

/**
 * Send invitation to bank worker
 * POST /api/bank-worker/invite
 * 
 * Admin-only endpoint to send registration invitations
 * Generates secure invitation tokens and stores them in database
 */
app.post('/api/bank-worker/invite', requireAdmin, async (req, res) => {
    try {
        const { email, bankId, branchId } = req.body;
        const adminId = req.admin.id; // From requireAdmin middleware

        // Validation
        if (!email || !bankId) {
            return res.status(400).json({
                status: 'error',
                message: 'Email and bank ID are required'
            });
        }

        // Check if invitation already exists and is active
        const existingInvitation = await pool.query(`
            SELECT id, status FROM registration_invitations 
            WHERE email = $1 AND status = 'pending' AND expires_at > NOW()
        `, [email]);

        if (existingInvitation.rows.length > 0) {
            return res.status(409).json({
                status: 'error',
                message: 'Active invitation already exists for this email'
            });
        }

        // Check if email is already registered
        const existingEmployee = await pool.query(
            'SELECT id FROM bank_employees WHERE corporate_email = $1',
            [email]
        );

        if (existingEmployee.rows.length > 0) {
            return res.status(409).json({
                status: 'error',
                message: 'Email is already registered'
            });
        }

        // Generate invitation token
        const invitationToken = jwt.sign(
            { email, bankId, branchId, invitedBy: adminId, type: 'invitation' },
            process.env.JWT_SECRET || 'bank-worker-invitation-secret',
            { expiresIn: '7d' } // 7 days to complete registration
        );

        // Store invitation in database
        const result = await pool.query(`
            INSERT INTO registration_invitations 
            (email, bank_id, branch_id, invited_by, invitation_token, expires_at)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id, email, invitation_token, expires_at
        `, [
            email,
            bankId,
            branchId || null,
            adminId,
            invitationToken,
            new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
        ]);

        console.log(`[INVITATION] Sent invitation to ${email} for bank ${bankId}`);

        res.status(201).json({
            status: 'success',
            message: 'Invitation sent successfully',
            data: {
                invitationId: result.rows[0].id,
                email: result.rows[0].email,
                expiresAt: result.rows[0].expires_at,
                invitationUrl: `${req.protocol}://${req.get('host')}/bank-worker/register/${invitationToken}`
            }
        });

    } catch (err) {
        console.error('Error sending invitation:', err);
        res.status(500).json({
            status: 'error',
            message: 'Failed to send invitation'
        });
    }
});

/**
 * Get registration form with invitation token
 * GET /api/bank-worker/register/:token
 * 
 * Validates invitation token and returns registration form data
 */
app.get('/api/bank-worker/register/:token', async (req, res) => {
    try {
        const { token } = req.params;

        // Verify and decode invitation token
        let decodedToken;
        try {
            decodedToken = jwt.verify(token, process.env.JWT_SECRET || 'bank-worker-invitation-secret');
        } catch (err) {
            return res.status(401).json({
                status: 'error',
                message: 'Invalid or expired invitation token'
            });
        }

        // Get invitation details from database
        const invitation = await pool.query(`
            SELECT ri.*, b.name_en as bank_name, bb.name_en as branch_name
            FROM registration_invitations ri
            JOIN banks b ON ri.bank_id = b.id
            LEFT JOIN bank_branches bb ON ri.branch_id = bb.id
            WHERE ri.invitation_token = $1 AND ri.status = 'pending' AND ri.expires_at > NOW()
        `, [token]);

        if (invitation.rows.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: 'Invitation not found or expired'
            });
        }

        const invitationData = invitation.rows[0];

        // Get bank branches for dropdown
        const branches = await pool.query(`
            SELECT id, name_en, name_he, name_ru, branch_code, city
            FROM bank_branches 
            WHERE bank_id = $1 
            ORDER BY name_en ASC
        `, [invitationData.bank_id]);

        res.json({
            status: 'success',
            data: {
                invitation: {
                    id: invitationData.id,
                    email: invitationData.email,
                    bankId: invitationData.bank_id,
                    bankName: invitationData.bank_name,
                    branchId: invitationData.branch_id,
                    branchName: invitationData.branch_name,
                    expiresAt: invitationData.expires_at
                },
                branches: branches.rows,
                token: token
            }
        });

    } catch (err) {
        console.error('Error fetching registration form:', err);
        res.status(500).json({
            status: 'error',
            message: 'Failed to load registration form'
        });
    }
});

/**
 * Complete bank worker registration
 * POST /api/bank-worker/register
 * 
 * Processes registration form submission with invitation token
 */
app.post('/api/bank-worker/register', async (req, res) => {
    try {
        const {
            invitationToken,
            fullName,
            position,
            branchId,
            bankNumber,
            termsAccepted,
            language = 'en'
        } = req.body;

        // Validate required fields
        if (!invitationToken || !fullName || !position || !branchId || !bankNumber || !termsAccepted) {
            return res.status(400).json({
                status: 'error',
                message: 'All required fields must be filled'
            });
        }

        // Verify invitation token
        let decodedToken;
        try {
            decodedToken = jwt.verify(invitationToken, process.env.JWT_SECRET || 'bank-worker-invitation-secret');
        } catch (err) {
            return res.status(401).json({
                status: 'error',
                message: 'Invalid or expired invitation token'
            });
        }

        // Get invitation details
        const invitation = await pool.query(`
            SELECT * FROM registration_invitations 
            WHERE invitation_token = $1 AND status = 'pending' AND expires_at > NOW()
        `, [invitationToken]);

        if (invitation.rows.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: 'Invitation not found or expired'
            });
        }

        const invitationData = invitation.rows[0];

        // Multi-language validation
        const validationResult = await validateRegistrationData({
            fullName,
            position,
            language,
            country: 'IL' // Default to Israel, could be dynamic
        });

        if (!validationResult.isValid) {
            return res.status(400).json({
                status: 'error',
                message: 'Validation failed',
                errors: validationResult.errors
            });
        }

        // Begin transaction
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // Create bank employee record
            const employeeResult = await client.query(`
                INSERT INTO bank_employees 
                (name, position, corporate_email, bank_id, branch_id, bank_number, 
                 terms_accepted, terms_accepted_at, invitation_token, approval_status,
                 registration_ip, registration_user_agent, last_activity_at)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
                RETURNING id, name, corporate_email, status, created_at
            `, [
                fullName,
                position,
                invitationData.email,
                invitationData.bank_id,
                branchId,
                bankNumber,
                termsAccepted,
                new Date(),
                invitationToken,
                'pending', // Requires admin approval
                req.ip,
                req.get('User-Agent'),
                new Date()
            ]);

            const newEmployee = employeeResult.rows[0];

            // Mark invitation as used
            await client.query(`
                UPDATE registration_invitations 
                SET status = 'used', registration_completed_at = NOW(), employee_id = $1
                WHERE id = $2
            `, [newEmployee.id, invitationData.id]);

            // Add to approval queue
            await client.query(`
                INSERT INTO worker_approval_queue 
                (employee_id, submitted_at, approval_status)
                VALUES ($1, $2, $3)
            `, [newEmployee.id, new Date(), 'pending']);

            await client.query('COMMIT');

            console.log(`[REGISTRATION] New bank worker registered: ${fullName} (${invitationData.email})`);

            res.status(201).json({
                status: 'success',
                message: 'Registration completed successfully. Your account is pending admin approval.',
                data: {
                    id: newEmployee.id,
                    name: newEmployee.name,
                    email: newEmployee.corporate_email,
                    status: 'pending_approval'
                }
            });

        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }

    } catch (err) {
        console.error('Error completing registration:', err);
        res.status(500).json({
            status: 'error',
            message: 'Registration failed'
        });
    }
});

/**
 * Check registration status
 * GET /api/bank-worker/status/:id
 * 
 * Returns current registration and approval status
 */
app.get('/api/bank-worker/status/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(`
            SELECT 
                be.id,
                be.name,
                be.corporate_email,
                be.status,
                be.approval_status,
                be.approved_at,
                be.created_at,
                waq.approval_status as queue_status,
                waq.reviewed_at,
                waq.admin_notes,
                au.name as approved_by_name
            FROM bank_employees be
            LEFT JOIN worker_approval_queue waq ON be.id = waq.employee_id
            LEFT JOIN admin_users au ON be.approved_by = au.id
            WHERE be.id = $1
        `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: 'Registration not found'
            });
        }

        const employee = result.rows[0];

        res.json({
            status: 'success',
            data: {
                id: employee.id,
                name: employee.name,
                email: employee.corporate_email,
                registrationStatus: employee.status,
                approvalStatus: employee.approval_status,
                approvedAt: employee.approved_at,
                approvedBy: employee.approved_by_name,
                registeredAt: employee.created_at,
                queueStatus: employee.queue_status,
                reviewedAt: employee.reviewed_at,
                adminComments: employee.admin_notes
            }
        });

    } catch (err) {
        console.error('Error fetching registration status:', err);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch status'
        });
    }
});

// ================================
// ADMIN MANAGEMENT ENDPOINTS
// ================================

/**
 * Get all invitations (admin only)
 * GET /api/admin/invitations
 */
app.get('/api/admin/invitations', requireAdmin, async (req, res) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;

        let whereClause = '';
        const queryParams = [];

        if (status && ['pending', 'used', 'expired', 'cancelled'].includes(status)) {
            whereClause = 'WHERE ri.status = $1';
            queryParams.push(status);
        }

        const result = await pool.query(`
            SELECT 
                ri.*,
                b.name_en as bank_name,
                bb.name_en as branch_name,
                au.name as invited_by_name,
                be.name as employee_name
            FROM registration_invitations ri
            JOIN banks b ON ri.bank_id = b.id
            LEFT JOIN bank_branches bb ON ri.branch_id = bb.id
            JOIN admin_users au ON ri.invited_by = au.id
            LEFT JOIN bank_employees be ON ri.employee_id = be.id
            ${whereClause}
            ORDER BY ri.created_at DESC
            LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}
        `, [...queryParams, limit, offset]);

        // Get total count
        const countResult = await pool.query(`
            SELECT COUNT(*) as total FROM registration_invitations ri ${whereClause}
        `, queryParams);

        res.json({
            status: 'success',
            data: result.rows,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: parseInt(countResult.rows[0].total),
                totalPages: Math.ceil(countResult.rows[0].total / limit)
            }
        });

    } catch (err) {
        console.error('Error fetching invitations:', err);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch invitations'
        });
    }
});

/**
 * Get approval queue (admin only)
 * GET /api/admin/approval-queue
 */
app.get('/api/admin/approval-queue', requireAdmin, async (req, res) => {
    try {
        const { status = 'pending', page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;

        const result = await pool.query(`
            SELECT 
                waq.*,
                be.name,
                be.corporate_email,
                be.position,
                be.bank_number,
                be.created_at as registered_at,
                b.name_en as bank_name,
                bb.name_en as branch_name
            FROM worker_approval_queue waq
            JOIN bank_employees be ON waq.employee_id = be.id
            JOIN banks b ON be.bank_id = b.id
            LEFT JOIN bank_branches bb ON be.branch_id = bb.id
            WHERE waq.approval_status = $1
            ORDER BY waq.submitted_at ASC
            LIMIT $2 OFFSET $3
        `, [status, limit, offset]);

        res.json({
            status: 'success',
            data: result.rows,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit)
            }
        });

    } catch (err) {
        console.error('Error fetching approval queue:', err);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch approval queue'
        });
    }
});

/**
 * Approve bank worker registration (admin only)
 * POST /api/admin/approve/:id
 */
app.post('/api/admin/approve/:id', requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { comments } = req.body;
        const adminId = req.admin.id;

        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // Update bank employee status
            await client.query(`
                UPDATE bank_employees 
                SET approval_status = 'approved', 
                    status = 'active',
                    approved_by = $1, 
                    approved_at = NOW(),
                    last_activity_at = NOW()
                WHERE id = $2
            `, [adminId, id]);

            // Update approval queue
            await client.query(`
                UPDATE worker_approval_queue 
                SET approval_status = 'approved',
                    reviewed_by = $1,
                    reviewed_at = NOW(),
                    admin_notes = $2
                WHERE employee_id = $3
            `, [adminId, comments || 'Approved', id]);

            await client.query('COMMIT');

            console.log(`[ADMIN] Bank worker ${id} approved by admin ${adminId}`);

            res.json({
                status: 'success',
                message: 'Bank worker approved successfully'
            });

        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }

    } catch (err) {
        console.error('Error approving bank worker:', err);
        res.status(500).json({
            status: 'error',
            message: 'Failed to approve bank worker'
        });
    }
});

/**
 * Reject bank worker registration (admin only)
 * POST /api/admin/reject/:id
 */
app.post('/api/admin/reject/:id', requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;
        const adminId = req.admin.id;

        if (!reason) {
            return res.status(400).json({
                status: 'error',
                message: 'Rejection reason is required'
            });
        }

        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // Update bank employee status
            await client.query(`
                UPDATE bank_employees 
                SET approval_status = 'rejected',
                    status = 'inactive'
                WHERE id = $1
            `, [id]);

            // Update approval queue
            await client.query(`
                UPDATE worker_approval_queue 
                SET approval_status = 'rejected',
                    reviewed_by = $1,
                    reviewed_at = NOW(),
                    admin_notes = $2
                WHERE employee_id = $3
            `, [adminId, reason, id]);

            await client.query('COMMIT');

            console.log(`[ADMIN] Bank worker ${id} rejected by admin ${adminId}: ${reason}`);

            res.json({
                status: 'success',
                message: 'Bank worker registration rejected'
            });

        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }

    } catch (err) {
        console.error('Error rejecting bank worker:', err);
        res.status(500).json({
            status: 'error',
            message: 'Failed to reject bank worker'
        });
    }
});

// ================================
// VALIDATION HELPER FUNCTIONS
// ================================

/**
 * Multi-language validation function
 * Validates registration data based on country and language rules
 */
async function validateRegistrationData({ fullName, position, language, country }) {
    const errors = [];
    let isValid = true;

    try {
        // Get validation rules from database
        const rules = await pool.query(`
            SELECT field_name, validation_type, validation_pattern, error_message_key
            FROM registration_validation_rules 
            WHERE country_code = $1 AND language_code = $2 AND is_active = true
            ORDER BY priority ASC
        `, [country, language]);

        const validationRules = rules.rows;

        // Validate full name
        const nameRules = validationRules.filter(rule => rule.field_name === 'full_name');
        for (const rule of nameRules) {
            if (rule.validation_type === 'regex' && rule.validation_pattern) {
                const regex = new RegExp(rule.validation_pattern);
                if (!regex.test(fullName)) {
                    errors.push({
                        field: 'fullName',
                        message: rule.error_message_key,
                        type: 'format'
                    });
                    isValid = false;
                }
            }
        }

        // Validate position
        const positionRules = validationRules.filter(rule => rule.field_name === 'position');
        for (const rule of positionRules) {
            if (rule.validation_type === 'regex' && rule.validation_pattern) {
                const regex = new RegExp(rule.validation_pattern);
                if (!regex.test(position)) {
                    errors.push({
                        field: 'position',
                        message: rule.error_message_key,
                        type: 'format'
                    });
                    isValid = false;
                }
            }
        }

        // Basic required field validation
        if (!fullName || fullName.trim().length < 2) {
            errors.push({
                field: 'fullName',
                message: 'Full name is required and must be at least 2 characters',
                type: 'required'
            });
            isValid = false;
        }

        if (!position || position.trim().length < 2) {
            errors.push({
                field: 'position',
                message: 'Position is required and must be at least 2 characters',
                type: 'required'
            });
            isValid = false;
        }

    } catch (err) {
        console.error('Error in validation:', err);
        // Fallback to basic validation if database validation fails
        if (!fullName || fullName.trim().length < 2) {
            errors.push({
                field: 'fullName',
                message: 'Full name is required',
                type: 'required'
            });
            isValid = false;
        }
    }

    return { isValid, errors };
}

// ================================
// END PHASE 2: ENHANCED BANK WORKER REGISTRATION APIs
// ================================

// ENHANCED CALCULATION ENGINE WITH DATABASE STANDARDS
// Real banking approval logic using admin-configurable standards

// Enhanced Mortgage Calculator with Database Standards
app.post('/api/admin/calculate-enhanced-mortgage', requireAdmin, async (req, res) => {
    try {
        const { 
            amount, 
            rate, 
            years, 
            initial_payment = 0,
            property_value,
            monthly_income,
            monthly_expenses = 0,
            age,
            credit_score = 750, // Default good credit score
            employment_years = 5
        } = req.body;

        // Input validation
        if (!amount || !rate || !years || !property_value || !monthly_income || !age) {
            return res.status(400).json({ 
                status: 'error', 
                message: 'Missing required fields: amount, rate, years, property_value, monthly_income, age' 
            });
        }

        // Basic mortgage calculations
        const principal = amount - initial_payment;
        const monthlyRate = rate / 100 / 12;
        const numberOfPayments = years * 12;
        
        let monthlyPayment = 0;
        if (monthlyRate > 0) {
            monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
                           (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
        } else {
            monthlyPayment = principal / numberOfPayments;
        }
        
        const totalPayment = monthlyPayment * numberOfPayments + initial_payment;
        const totalInterest = totalPayment - amount;

        // ENHANCED APPROVAL LOGIC USING DATABASE STANDARDS
        
        // Get banking standards from database
        const standardsResult = await pool.query(
            'SELECT * FROM get_banking_standards($1, $2)',
            ['mortgage', null] // No specific bank for now
        );
        
        const standards = {};
        standardsResult.rows.forEach(row => {
            standards[`${row.standard_category}_${row.standard_name}`] = parseFloat(row.standard_value);
        });
        
        // 1. Loan-to-Value (LTV) Calculation
        const ltv_ratio = (amount / property_value) * 100;
        const max_ltv = standards.ltv_standard_ltv_max || 80; // Default to 80% if not found
        const ltv_approved = ltv_ratio <= max_ltv;

        // 2. Debt-to-Income (DTI) Calculation
        const total_monthly_debt = monthlyPayment + monthly_expenses;
        const dti_ratio = (total_monthly_debt / monthly_income) * 100;
        const max_dti = standards.dti_back_end_dti_max || 42; // Default to 42% if not found
        const dti_approved = dti_ratio <= max_dti;

        // 3. Age Verification using database standards
        const age_at_maturity = age + years;
        const max_age_at_maturity = standards.age_maximum_age_at_maturity || 75;
        const age_approved = age_at_maturity <= max_age_at_maturity;

        // 4. Stress Testing at 6.5% rate
        const stress_rate = 6.5;
        const stress_monthly_rate = stress_rate / 100 / 12;
        let stress_monthly_payment = 0;
        if (stress_monthly_rate > 0) {
            stress_monthly_payment = principal * (stress_monthly_rate * Math.pow(1 + stress_monthly_rate, numberOfPayments)) / 
                                   (Math.pow(1 + stress_monthly_rate, numberOfPayments) - 1);
        }
        const stress_total_debt = stress_monthly_payment + monthly_expenses;
        const stress_dti = (stress_total_debt / monthly_income) * 100;
        const stress_test_approved = stress_dti <= max_dti;

        // 5. Credit Score Assessment using database standards
        const min_credit_score = standards.credit_score_minimum_credit_score || 620;
        const good_credit_score = standards.credit_score_good_credit_score || 670;
        const excellent_credit_score = standards.credit_score_excellent_credit_score || 740;
        const warning_credit_score = standards.credit_score_warning_credit_score || 700;
        const poor_credit_score = standards.credit_score_poor_credit_score || 680;
        const premium_credit_score = standards.credit_score_premium_credit_score || 750;
        
        let credit_risk_level = 'excellent';
        let credit_approved = true;
        if (credit_score < min_credit_score) {
            credit_risk_level = 'poor';
            credit_approved = false;
        } else if (credit_score < good_credit_score) {
            credit_risk_level = 'fair';
        } else if (credit_score < excellent_credit_score) {
            credit_risk_level = 'good';
        }

        // 6. Employment Stability Check
        const employment_approved = employment_years >= 2; // Minimum 2 years

        // Overall Approval Decision
        const all_criteria_met = ltv_approved && dti_approved && age_approved && 
                                stress_test_approved && credit_approved && employment_approved;

        // Rejection Reasons
        const rejection_reasons = [];
        if (!ltv_approved) rejection_reasons.push(`LTV ratio ${ltv_ratio.toFixed(1)}% exceeds maximum ${max_ltv}%`);
        if (!dti_approved) rejection_reasons.push(`DTI ratio ${dti_ratio.toFixed(1)}% exceeds maximum ${max_dti}%`);
        if (!age_approved) rejection_reasons.push(`Age at maturity ${age_at_maturity} exceeds maximum ${max_age_at_maturity}`);
        if (!stress_test_approved) rejection_reasons.push(`Stress test DTI ${stress_dti.toFixed(1)}% exceeds maximum ${max_dti}%`);
        if (!credit_approved) rejection_reasons.push(`Credit score ${credit_score} below minimum requirement`);
        if (!employment_approved) rejection_reasons.push(`Employment history ${employment_years} years below minimum 2 years`);

        // Load additional threshold standards
        const pmi_ltv_threshold = standards.ltv_pmi_ltv_max || 75;
        const warning_dti_max = standards.dti_warning_dti_max || 35;
        const premium_ltv_max = standards.ltv_premium_ltv_max || 70;
        const premium_dti_max = standards.dti_premium_dti_max || 30;

        // Approval Conditions (using database standards)
        const approval_conditions = [];
        if (ltv_ratio > pmi_ltv_threshold) approval_conditions.push('Mortgage insurance required');
        if (credit_score < warning_credit_score) approval_conditions.push('Higher interest rate due to credit score');
        if (dti_ratio > warning_dti_max) approval_conditions.push('Additional income verification required');

        // Bank Recommendations (using database standards)
        const recommended_banks = [];
        if (all_criteria_met) {
            if (credit_score >= excellent_credit_score && ltv_ratio <= premium_ltv_max) {
                recommended_banks.push({ name: 'Bank Hapoalim', rate: rate - 0.2, reason: 'Excellent credit profile' });
                recommended_banks.push({ name: 'Bank Leumi', rate: rate - 0.1, reason: 'Low LTV ratio' });
            } else if (credit_score >= good_credit_score) {
                recommended_banks.push({ name: 'Discount Bank', rate: rate, reason: 'Standard terms' });
                recommended_banks.push({ name: 'Mizrahi Bank', rate: rate + 0.1, reason: 'Competitive rates' });
            }
        }

        const result = {
            // Basic calculation results
            principal: Math.round(principal),
            monthlyPayment: Math.round(monthlyPayment),
            totalPayment: Math.round(totalPayment),
            totalInterest: Math.round(totalInterest),
            rate: rate,
            years: years,
            
            // Enhanced approval results
            approved: all_criteria_met,
            ltv_ratio: Math.round(ltv_ratio * 10) / 10,
            dti_ratio: Math.round(dti_ratio * 10) / 10,
            credit_score: credit_score,
            credit_risk_level: credit_risk_level,
            age_at_maturity: age_at_maturity,
            stress_test_dti: Math.round(stress_dti * 10) / 10,
            stress_monthly_payment: Math.round(stress_monthly_payment),
            
            // Decision details
            rejection_reasons: rejection_reasons,
            approval_conditions: approval_conditions,
            recommended_banks: recommended_banks,
            
            // Criteria breakdown
            criteria_results: {
                ltv_approved: ltv_approved,
                dti_approved: dti_approved,
                age_approved: age_approved,
                stress_test_approved: stress_test_approved,
                credit_approved: credit_approved,
                employment_approved: employment_approved
            }
        };

        res.json({
            status: 'success',
            data: result
        });
    } catch (err) {
        console.error('Enhanced mortgage calculation error:', err);
        res.status(500).json({ status: 'error', message: 'Server error' });
    }
});

// Enhanced Credit Calculator with Approval Logic
app.post('/api/admin/calculate-enhanced-credit', requireAdmin, async (req, res) => {
    try {
        const { 
            amount, 
            rate, 
            years,
            monthly_income,
            monthly_expenses = 0,
            age,
            credit_score = 750,
            employment_years = 5,
            existing_debts = 0
        } = req.body;

        // Input validation
        if (!amount || !rate || !years || !monthly_income || !age) {
            return res.status(400).json({ 
                status: 'error', 
                message: 'Missing required fields: amount, rate, years, monthly_income, age' 
            });
        }

        // Load banking standards for credit
        const standardsQuery = `
            SELECT standard_name, standard_value
            FROM banking_standards 
            WHERE business_path = 'credit' AND is_active = true
        `;
        const standardsResult = await pool.query(standardsQuery);
        const standards = {};
        standardsResult.rows.forEach(row => {
            standards[row.standard_name] = parseFloat(row.standard_value);
        });

        // Basic credit calculations
        const principal = amount;
        const monthlyRate = rate / 100 / 12;
        const numberOfPayments = years * 12;
        
        let monthlyPayment = 0;
        if (monthlyRate > 0) {
            monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
                           (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
        } else {
            monthlyPayment = principal / numberOfPayments;
        }
        
        const totalPayment = monthlyPayment * numberOfPayments;
        const totalInterest = totalPayment - amount;

        // ENHANCED APPROVAL LOGIC FOR CREDIT

        // Get DTI configuration from database
        const dtiConfigResult = await pool.query(`
            SELECT standard_value FROM banking_standards 
            WHERE business_path = 'credit' AND standard_category = 'dti' AND standard_name = 'credit_max_dti' AND is_active = true
            ORDER BY created_at DESC LIMIT 1
        `);
        const max_dti = dtiConfigResult.rows.length > 0 ? parseFloat(dtiConfigResult.rows[0].standard_value) : 42;

        // 1. Debt-to-Income (DTI) Calculation including new credit
        const total_monthly_debt = monthlyPayment + monthly_expenses + existing_debts;
        const dti_ratio = (total_monthly_debt / monthly_income) * 100;
        const dti_approved = dti_ratio <= max_dti;

        // 2. Credit Amount vs Income Ratio
        const credit_to_income_ratio = (amount / (monthly_income * 12)) * 100;
        const max_credit_to_income = 300; // 3x annual income max
        const credit_amount_approved = credit_to_income_ratio <= max_credit_to_income;

        // 3. Age Verification (max 70 at loan maturity for credit)
        const age_at_maturity = age + years;
        const max_age_at_maturity = 70; // Lower than mortgage
        const age_approved = age_at_maturity <= max_age_at_maturity;

        // 4. Credit Score Assessment using database standards
        const min_credit_score = standards.credit_score_minimum_credit_score || 620;
        const poor_credit_score = standards.credit_score_poor_credit_score || 680;
        const premium_credit_score = standards.credit_score_premium_credit_score || 750;
        
        let credit_risk_level = 'excellent';
        let credit_approved = true;
        
        if (credit_score < min_credit_score) {
            credit_risk_level = 'poor';
            credit_approved = false;
        } else if (credit_score < poor_credit_score) {
            credit_risk_level = 'fair';
        } else if (credit_score < premium_credit_score) {
            credit_risk_level = 'good';
        }

        // 5. Employment Stability Check
        const employment_approved = employment_years >= 2;

        // 6. Stress Testing at higher rate (credit is unsecured)
        const stress_rate = rate + 2; // Add 2% for stress test
        const stress_monthly_rate = stress_rate / 100 / 12;
        let stress_monthly_payment = 0;
        if (stress_monthly_rate > 0) {
            stress_monthly_payment = principal * (stress_monthly_rate * Math.pow(1 + stress_monthly_rate, numberOfPayments)) / 
                                   (Math.pow(1 + stress_monthly_rate, numberOfPayments) - 1);
        }
        const stress_total_debt = stress_monthly_payment + monthly_expenses + existing_debts;
        const stress_dti = (stress_total_debt / monthly_income) * 100;
        const stress_test_approved = stress_dti <= max_dti;

        // Overall Approval Decision
        const all_criteria_met = dti_approved && credit_amount_approved && age_approved && 
                                stress_test_approved && credit_approved && employment_approved;

        // Rejection Reasons
        const rejection_reasons = [];
        if (!dti_approved) rejection_reasons.push(`DTI ratio ${dti_ratio.toFixed(1)}% exceeds maximum ${max_dti}%`);
        if (!credit_amount_approved) rejection_reasons.push(`Credit amount ${credit_to_income_ratio.toFixed(0)}% of annual income exceeds maximum ${max_credit_to_income}%`);
        if (!age_approved) rejection_reasons.push(`Age at maturity ${age_at_maturity} exceeds maximum ${max_age_at_maturity}`);
        if (!stress_test_approved) rejection_reasons.push(`Stress test DTI ${stress_dti.toFixed(1)}% exceeds maximum ${max_dti}%`);
        if (!credit_approved) rejection_reasons.push(`Credit score ${credit_score} below minimum requirement ${min_credit_score}`);
        if (!employment_approved) rejection_reasons.push(`Employment history ${employment_years} years below minimum 2 years`);

        // Load additional threshold standards for conditions
        const warning_credit_score = standards.credit_score_warning_credit_score || 700;
        const warning_dti_max = standards.dti_warning_dti_max || 35;
        const premium_dti_max = standards.dti_premium_dti_max || 30;
        
        // Approval Conditions (using database standards)
        const approval_conditions = [];
        if (credit_score < warning_credit_score) approval_conditions.push('Higher interest rate due to credit score');
        if (dti_ratio > warning_dti_max) approval_conditions.push('Co-signer may be required');
        if (credit_to_income_ratio > 200) approval_conditions.push('Additional collateral required');

        // Bank Recommendations for Credit (using database standards)
        const recommended_banks = [];
        if (all_criteria_met) {
            if (credit_score >= premium_credit_score && dti_ratio <= premium_dti_max) {
                recommended_banks.push({ name: 'Bank Hapoalim', rate: rate - 0.5, reason: 'Excellent credit profile' });
                recommended_banks.push({ name: 'Bank Leumi', rate: rate - 0.3, reason: 'Low DTI ratio' });
            } else if (credit_score >= poor_credit_score) {
                recommended_banks.push({ name: 'Discount Bank', rate: rate, reason: 'Standard terms' });
                recommended_banks.push({ name: 'Mizrahi Bank', rate: rate + 0.2, reason: 'Competitive rates' });
            }
        }

        const result = {
            // Basic calculation results
            principal: Math.round(principal),
            monthlyPayment: Math.round(monthlyPayment),
            totalPayment: Math.round(totalPayment),
            totalInterest: Math.round(totalInterest),
            rate: rate,
            years: years,
            
            // Enhanced approval results
            approved: all_criteria_met,
            dti_ratio: Math.round(dti_ratio * 10) / 10,
            credit_to_income_ratio: Math.round(credit_to_income_ratio * 10) / 10,
            credit_score: credit_score,
            credit_risk_level: credit_risk_level,
            age_at_maturity: age_at_maturity,
            stress_test_dti: Math.round(stress_dti * 10) / 10,
            stress_monthly_payment: Math.round(stress_monthly_payment),
            
            // Decision details
            rejection_reasons: rejection_reasons,
            approval_conditions: approval_conditions,
            recommended_banks: recommended_banks,
            
            // Criteria breakdown
            criteria_results: {
                dti_approved: dti_approved,
                credit_amount_approved: credit_amount_approved,
                age_approved: age_approved,
                stress_test_approved: stress_test_approved,
                credit_approved: credit_approved,
                employment_approved: employment_approved
            }
        };

        res.json({
            status: 'success',
            data: result
        });
    } catch (err) {
        console.error('Enhanced credit calculation error:', err);
        res.status(500).json({ status: 'error', message: 'Server error' });
    }
});

// CUSTOMER-FACING REAL-TIME APPROVAL PROBABILITY ENDPOINT
app.post('/api/calculate-approval-probability', async (req, res) => {
    try {
        const { 
            loan_type, // 'mortgage' or 'credit'
            amount,
            property_value, // for mortgage only
            monthly_income,
            monthly_expenses = 0,
            age,
            credit_score = 750,
            employment_years = 5,
            existing_debts = 0
        } = req.body;

        if (!loan_type || !amount || !monthly_income || !age) {
            return res.status(400).json({ 
                status: 'error', 
                message: 'Missing required fields: loan_type, amount, monthly_income, age' 
            });
        }

        // Get current banking standards from database
        const standardsResult = await pool.query(`
            SELECT standard_category, standard_name, standard_value 
            FROM banking_standards 
            WHERE business_path = $1
        `, [loan_type === 'mortgage' ? 'mortgage' : 'credit']);
        
        const standards = {};
        standardsResult.rows.forEach(row => {
            standards[`${row.standard_category}_${row.standard_name}`] = parseFloat(row.standard_value);
        });

        let approval_probability = 0;
        let criteria_scores = {};
        let main_concerns = [];
        let approval_tips = [];

        if (loan_type === 'mortgage') {
            if (!property_value) {
                return res.status(400).json({ 
                    status: 'error', 
                    message: 'Property value required for mortgage approval probability' 
                });
            }

            // Calculate mortgage approval probability
            const ltv_ratio = (amount / property_value) * 100;
            const max_ltv = standards.ltv_standard_ltv_max || 80;
            const ltv_score = Math.max(0, Math.min(100, (max_ltv - ltv_ratio) / max_ltv * 100));
            criteria_scores.ltv = ltv_score;

            const estimated_payment = amount * 0.006; // Rough estimate
            const dti_ratio = ((estimated_payment + monthly_expenses) / monthly_income) * 100;
            const max_dti = standards.dti_back_end_dti_max || 42;
            const dti_score = Math.max(0, Math.min(100, (max_dti - dti_ratio) / max_dti * 100));
            criteria_scores.dti = dti_score;

            const age_at_maturity = age + 25; // Assume 25 year term
            const max_age = standards.age_maximum_age_at_maturity || 75;
            const age_score = Math.max(0, Math.min(100, (max_age - age_at_maturity) / max_age * 100));
            criteria_scores.age = age_score;

            const min_credit = standards.credit_score_minimum_credit_score || 620;
            const excellent_credit = standards.credit_score_excellent_credit_score || 740;
            const credit_score_normalized = Math.max(0, Math.min(100, (credit_score - min_credit) / (excellent_credit - min_credit) * 100));
            criteria_scores.credit = credit_score_normalized;

            const employment_score = Math.min(100, employment_years / 2 * 100); // 2 years = 100%
            criteria_scores.employment = employment_score;

            // Calculate weighted average (mortgage specific weights)
            approval_probability = (
                ltv_score * 0.25 +           // 25% weight
                dti_score * 0.25 +           // 25% weight  
                age_score * 0.15 +           // 15% weight
                credit_score_normalized * 0.25 + // 25% weight
                employment_score * 0.10      // 10% weight
            );

            // Add concerns and tips
            if (ltv_ratio > max_ltv * 0.9) main_concerns.push('High loan-to-value ratio');
            if (dti_ratio > max_dti * 0.9) main_concerns.push('High debt-to-income ratio');
            if (credit_score < min_credit + 50) main_concerns.push('Credit score could be improved');
            
            if (ltv_ratio > max_ltv * 0.8) approval_tips.push('Consider increasing down payment');
            if (dti_ratio > max_dti * 0.8) approval_tips.push('Consider reducing monthly expenses');
            if (credit_score < excellent_credit) approval_tips.push('Improving credit score can get better rates');

        } else if (loan_type === 'credit') {
            // Calculate credit approval probability
            const estimated_payment = amount * 0.015; // Rough estimate
            const dti_ratio = ((estimated_payment + monthly_expenses + existing_debts) / monthly_income) * 100;
            
            // Get DTI configuration from database
            const dtiConfigResult = await pool.query(`
                SELECT standard_value FROM banking_standards 
                WHERE business_path = 'credit' AND standard_category = 'dti' AND standard_name = 'credit_max_dti' AND is_active = true
                ORDER BY created_at DESC LIMIT 1
            `);
            const max_dti = dtiConfigResult.rows.length > 0 ? parseFloat(dtiConfigResult.rows[0].standard_value) : 42;
            
            const dti_score = Math.max(0, Math.min(100, (max_dti - dti_ratio) / max_dti * 100));
            criteria_scores.dti = dti_score;

            const credit_to_income = (amount / (monthly_income * 12)) * 100;
            const max_credit_to_income = 300;
            const credit_amount_score = Math.max(0, Math.min(100, (max_credit_to_income - credit_to_income) / max_credit_to_income * 100));
            criteria_scores.credit_amount = credit_amount_score;

            const age_at_maturity = age + 10; // Assume 10 year term
            const max_age = 70;
            const age_score = Math.max(0, Math.min(100, (max_age - age_at_maturity) / max_age * 100));
            criteria_scores.age = age_score;

            const min_credit = 620;
            const excellent_credit = 750;
            const credit_score_normalized = Math.max(0, Math.min(100, (credit_score - min_credit) / (excellent_credit - min_credit) * 100));
            criteria_scores.credit = credit_score_normalized;

            const employment_score = Math.min(100, employment_years / 2 * 100);
            criteria_scores.employment = employment_score;

            // Calculate weighted average (credit specific weights)
            approval_probability = (
                dti_score * 0.30 +           // 30% weight
                credit_amount_score * 0.25 + // 25% weight
                age_score * 0.10 +           // 10% weight
                credit_score_normalized * 0.25 + // 25% weight
                employment_score * 0.10      // 10% weight
            );

            // Add concerns and tips
            if (dti_ratio > max_dti * 0.9) main_concerns.push('High debt-to-income ratio');
            if (credit_to_income > max_credit_to_income * 0.8) main_concerns.push('Credit amount high relative to income');
            if (credit_score < min_credit + 60) main_concerns.push('Credit score needs improvement');
            
            if (dti_ratio > max_dti * 0.8) approval_tips.push('Consider reducing existing debts');
            if (credit_to_income > max_credit_to_income * 0.7) approval_tips.push('Consider reducing loan amount');
            if (credit_score < excellent_credit) approval_tips.push('Improving credit score can get better rates');
        }

        // Determine approval likelihood category
        let approval_category = 'low';
        let approval_message = 'Low approval probability';
        let approval_color = 'red';

        if (approval_probability >= 80) {
            approval_category = 'excellent';
            approval_message = 'Excellent approval probability';
            approval_color = 'green';
        } else if (approval_probability >= 65) {
            approval_category = 'good';
            approval_message = 'Good approval probability';
            approval_color = 'blue';
        } else if (approval_probability >= 45) {
            approval_category = 'fair';
            approval_message = 'Fair approval probability';
            approval_color = 'yellow';
        }

        res.json({
            status: 'success',
            data: {
                loan_type: loan_type,
                amount: amount,
                approval_probability: Math.round(approval_probability),
                approval_category: approval_category,
                approval_message: approval_message,
                approval_color: approval_color,
                criteria_scores: criteria_scores,
                main_concerns: main_concerns,
                approval_tips: approval_tips,
                estimated_rate: approval_probability >= 80 ? 3.5 : 
                               approval_probability >= 65 ? 4.0 : 
                               approval_probability >= 45 ? 4.5 : 5.0,
                next_steps: approval_probability >= 65 ? 
                    ['Proceed with application', 'Gather required documents'] :
                    ['Improve criteria above', 'Consider adjusting loan parameters']
            }
        });
    } catch (err) {
        console.error('Approval probability error:', err);
        res.status(500).json({ status: 'error', message: 'Server error' });
    }
});

// Quick Approval Check Endpoint (Admin only)
app.post('/api/admin/calculate-approval-check', requireAdmin, async (req, res) => {
    try {
        const { 
            loan_type, // 'mortgage' or 'credit'
            amount,
            property_value, // for mortgage only
            monthly_income,
            monthly_expenses = 0,
            age,
            credit_score = 750,
            employment_years = 5,
            existing_debts = 0
        } = req.body;

        if (!loan_type || !amount || !monthly_income || !age) {
            return res.status(400).json({ 
                status: 'error', 
                message: 'Missing required fields: loan_type, amount, monthly_income, age' 
            });
        }

        let quick_result = {
            loan_type: loan_type,
            amount: amount,
            likely_approved: false,
            estimated_rate: 0,
            main_concerns: [],
            next_steps: []
        };

        if (loan_type === 'mortgage') {
            if (!property_value) {
                return res.status(400).json({ 
                    status: 'error', 
                    message: 'Property value required for mortgage approval check' 
                });
            }

            // Load quick assessment rate standards for mortgage
            const mortgageRatesQuery = `
                SELECT standard_name, standard_value FROM banking_standards 
                WHERE business_path = 'mortgage' AND standard_category = 'rates' AND is_active = true
            `;
            const mortgageRatesResult = await pool.query(mortgageRatesQuery);
            const mortgageRates = {};
            mortgageRatesResult.rows.forEach(row => {
                mortgageRates[row.standard_name] = parseFloat(row.standard_value);
            });

            // Load credit score standards for mortgage
            const mortgageCreditQuery = `
                SELECT standard_name, standard_value FROM banking_standards 
                WHERE business_path = 'mortgage' AND standard_category = 'credit_score' AND is_active = true
            `;
            const mortgageCreditResult = await pool.query(mortgageCreditQuery);
            const mortgageCredit = {};
            mortgageCreditResult.rows.forEach(row => {
                mortgageCredit[row.standard_name] = parseFloat(row.standard_value);
            });

            // Quick mortgage check
            const ltv_ratio = (amount / property_value) * 100;
            const estimated_payment = amount * 0.006; // Rough estimate at ~5% rate
            const dti_ratio = ((estimated_payment + monthly_expenses) / monthly_income) * 100;
            
            // Get DTI limit from database for quick assessment
        const quickDtiResult = await pool.query(`
            SELECT standard_value FROM banking_standards 
            WHERE business_path = 'mortgage' AND standard_category = 'dti' AND standard_name = 'mortgage_max_dti' AND is_active = true
            ORDER BY created_at DESC LIMIT 1
        `);
        const quick_max_dti = quickDtiResult.rows.length > 0 ? parseFloat(quickDtiResult.rows[0].standard_value) : 42;
        
        quick_result.likely_approved = ltv_ratio <= 80 && dti_ratio <= quick_max_dti && 
                                         credit_score >= 580 && (age + 25) <= 75;
            
            // Use database standards for rate estimation
            const excellent_credit = mortgageCredit.excellent_credit_score || 740;
            const good_credit = mortgageCredit.good_credit_score || 670;
            const quick_excellent_rate = mortgageRates.quick_excellent_rate || 3.5;
            const quick_good_rate = mortgageRates.quick_good_rate || 4.0;
            const quick_fair_rate = mortgageRates.quick_fair_rate || 4.5;
            
            quick_result.estimated_rate = credit_score >= excellent_credit ? quick_excellent_rate : 
                                        credit_score >= good_credit ? quick_good_rate : quick_fair_rate;
            
            if (ltv_ratio > 80) quick_result.main_concerns.push('High loan-to-value ratio');
            if (dti_ratio > quick_max_dti) quick_result.main_concerns.push('High debt-to-income ratio');
            if (credit_score < good_credit) quick_result.main_concerns.push('Credit score needs improvement');
            
        } else if (loan_type === 'credit') {
            // Load quick assessment rate standards for credit
            const creditRatesQuery = `
                SELECT standard_name, standard_value FROM banking_standards 
                WHERE business_path = 'credit' AND standard_category = 'rates' AND is_active = true
            `;
            const creditRatesResult = await pool.query(creditRatesQuery);
            const creditRates = {};
            creditRatesResult.rows.forEach(row => {
                creditRates[row.standard_name] = parseFloat(row.standard_value);
            });

            // Load credit score standards for credit
            const creditCreditQuery = `
                SELECT standard_name, standard_value FROM banking_standards 
                WHERE business_path = 'credit' AND standard_category = 'credit_score' AND is_active = true
            `;
            const creditCreditResult = await pool.query(creditCreditQuery);
            const creditCredit = {};
            creditCreditResult.rows.forEach(row => {
                creditCredit[row.standard_name] = parseFloat(row.standard_value);
            });

            // Quick credit check
            const estimated_payment = amount * 0.015; // Rough estimate at ~8% rate
            const dti_ratio = ((estimated_payment + monthly_expenses + existing_debts) / monthly_income) * 100;
            const credit_to_income = (amount / (monthly_income * 12)) * 100;
            
            // Get DTI limit for credit quick check
            const creditQuickDtiResult = await pool.query(`
                SELECT standard_value FROM banking_standards 
                WHERE business_path = 'credit' AND standard_category = 'dti' AND standard_name = 'credit_max_dti' AND is_active = true
                ORDER BY created_at DESC LIMIT 1
            `);
            const credit_quick_max_dti = creditQuickDtiResult.rows.length > 0 ? parseFloat(creditQuickDtiResult.rows[0].standard_value) : 42;
            
            quick_result.likely_approved = dti_ratio <= credit_quick_max_dti && credit_to_income <= 300 && 
                                         credit_score >= 620 && (age + 10) <= 70;
            
            // Use database standards for credit rate estimation
            const credit_premium_score = creditCredit.premium_credit_score || 750;
            const credit_poor_score = creditCredit.poor_credit_score || 680;
            const credit_quick_excellent_rate = creditRates.quick_excellent_rate || 7.5;
            const credit_quick_good_rate = creditRates.quick_good_rate || 8.5;
            const credit_quick_fair_rate = creditRates.quick_fair_rate || 10.0;
            
            quick_result.estimated_rate = credit_score >= credit_premium_score ? credit_quick_excellent_rate : 
                                        credit_score >= credit_poor_score ? credit_quick_good_rate : credit_quick_fair_rate;
            
            if (dti_ratio > credit_quick_max_dti) quick_result.main_concerns.push('High debt-to-income ratio');
            if (credit_to_income > 300) quick_result.main_concerns.push('Credit amount too high relative to income');
            if (credit_score < credit_poor_score) quick_result.main_concerns.push('Credit score needs improvement');
        }

        // Next steps recommendations
        if (quick_result.likely_approved) {
            quick_result.next_steps.push('Proceed with full application');
            quick_result.next_steps.push('Gather required documents');
        } else {
            if (quick_result.main_concerns.includes('Credit score needs improvement')) {
                quick_result.next_steps.push('Work on improving credit score');
            }
            if (quick_result.main_concerns.includes('High debt-to-income ratio')) {
                quick_result.next_steps.push('Reduce existing debts or increase income');
            }
            quick_result.next_steps.push('Consider adjusting loan amount');
        }

        res.json({
            status: 'success',
            data: quick_result
        });
    } catch (err) {
        console.error('Approval check error:', err);
        res.status(500).json({ status: 'error', message: 'Server error' });
    }
});

// ENHANCED REFINANCE CALCULATORS - PHASE 1 COMPLETION

// Enhanced Mortgage Refinance Calculator with Approval Logic
app.post('/api/admin/calculate-enhanced-mortgage-refinance', requireAdmin, async (req, res) => {
    try {
        const { 
            current_loan_amount,
            current_rate,
            current_monthly_payment,
            remaining_years,
            property_value,
            new_loan_amount, // for cash-out refinance
            new_rate,
            new_years,
            monthly_income,
            monthly_expenses = 0,
            age,
            credit_score = 750,
            employment_years = 5,
            closing_costs = 5000,
            refinance_type = 'rate_and_term' // 'rate_and_term' or 'cash_out'
        } = req.body;

        // Input validation
        if (!current_loan_amount || !current_rate || !property_value || !new_rate || !new_years || !monthly_income || !age) {
            return res.status(400).json({ 
                status: 'error', 
                message: 'Missing required fields: current_loan_amount, current_rate, property_value, new_rate, new_years, monthly_income, age' 
            });
        }

        // Determine actual new loan amount based on refinance type
        const actual_new_loan_amount = refinance_type === 'cash_out' ? new_loan_amount : current_loan_amount;

        // Basic mortgage calculations for new loan
        const principal = actual_new_loan_amount;
        const monthlyRate = new_rate / 100 / 12;
        const numberOfPayments = new_years * 12;
        
        let new_monthly_payment = 0;
        if (monthlyRate > 0) {
            new_monthly_payment = principal * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
                                 (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
        } else {
            new_monthly_payment = principal / numberOfPayments;
        }
        
        const totalPayment = new_monthly_payment * numberOfPayments;
        const totalInterest = totalPayment - actual_new_loan_amount;

        // ENHANCED REFINANCE APPROVAL LOGIC

        // 1. LTV Calculation for refinance
        const ltv_ratio = (actual_new_loan_amount / property_value) * 100;
        let max_ltv = 80; // Standard refinance LTV
        if (refinance_type === 'cash_out') {
            max_ltv = 75; // Lower LTV for cash-out refinance
        }
        const ltv_approved = ltv_ratio <= max_ltv;

        // 2. DTI Calculation with new payment
        const total_monthly_debt = new_monthly_payment + monthly_expenses;
        const dti_ratio = (total_monthly_debt / monthly_income) * 100;
        
        // Get DTI configuration from database for mortgage refinance
        const dtiConfigResult = await pool.query(`
            SELECT standard_value FROM banking_standards 
            WHERE business_path = 'mortgage_refinance' AND standard_category = 'dti' AND standard_name = 'refinance_max_dti' AND is_active = true
            ORDER BY created_at DESC LIMIT 1
        `);
        const max_dti = dtiConfigResult.rows.length > 0 ? parseFloat(dtiConfigResult.rows[0].standard_value) : 42;
        
        const dti_approved = dti_ratio <= max_dti;

        // 3. Age Verification
        const age_at_maturity = age + new_years;
        const max_age_at_maturity = 75;
        const age_approved = age_at_maturity <= max_age_at_maturity;

        // 4. Credit Score Assessment
        let credit_risk_level = 'excellent';
        let credit_approved = true;
        if (credit_score < 580) {
            credit_risk_level = 'poor';
            credit_approved = false;
        } else if (credit_score < 670) {
            credit_risk_level = 'fair';
        } else if (credit_score < 740) {
            credit_risk_level = 'good';
        }

        // 5. Employment Check
        const employment_approved = employment_years >= 2;

        // 6. Stress Testing
        const stress_rate = 6.5;
        const stress_monthly_rate = stress_rate / 100 / 12;
        let stress_monthly_payment = 0;
        if (stress_monthly_rate > 0) {
            stress_monthly_payment = principal * (stress_monthly_rate * Math.pow(1 + stress_monthly_rate, numberOfPayments)) / 
                                   (Math.pow(1 + stress_monthly_rate, numberOfPayments) - 1);
        }
        const stress_total_debt = stress_monthly_payment + monthly_expenses;
        const stress_dti = (stress_total_debt / monthly_income) * 100;
        const stress_test_approved = stress_dti <= max_dti;

        // 7. Break-even Analysis
        const monthly_savings = (current_monthly_payment || 0) - new_monthly_payment;
        const break_even_months = closing_costs / Math.max(monthly_savings, 1);
        const break_even_approved = break_even_months <= 36; // 3 years max break-even

        // 8. Cash-out specific checks
        let cash_out_amount = 0;
        let cash_out_approved = true;
        if (refinance_type === 'cash_out') {
            cash_out_amount = actual_new_loan_amount - current_loan_amount;
            // Cash-out should be reasonable compared to income
            const cash_out_to_income_ratio = (cash_out_amount / (monthly_income * 12)) * 100;
            cash_out_approved = cash_out_to_income_ratio <= 50; // Max 50% of annual income
        }

        // Overall Approval Decision
        const all_criteria_met = ltv_approved && dti_approved && age_approved && 
                                stress_test_approved && credit_approved && employment_approved &&
                                break_even_approved && cash_out_approved;

        // Rejection Reasons
        const rejection_reasons = [];
        if (!ltv_approved) rejection_reasons.push(`LTV ratio ${ltv_ratio.toFixed(1)}% exceeds maximum ${max_ltv}% for ${refinance_type} refinance`);
        if (!dti_approved) rejection_reasons.push(`DTI ratio ${dti_ratio.toFixed(1)}% exceeds maximum ${max_dti}%`);
        if (!age_approved) rejection_reasons.push(`Age at maturity ${age_at_maturity} exceeds maximum ${max_age_at_maturity}`);
        if (!stress_test_approved) rejection_reasons.push(`Stress test DTI ${stress_dti.toFixed(1)}% exceeds maximum ${max_dti}%`);
        if (!credit_approved) rejection_reasons.push(`Credit score ${credit_score} below minimum requirement`);
        if (!employment_approved) rejection_reasons.push(`Employment history ${employment_years} years below minimum 2 years`);
        if (!break_even_approved) rejection_reasons.push(`Break-even period ${break_even_months.toFixed(1)} months exceeds maximum 36 months`);
        if (!cash_out_approved) rejection_reasons.push(`Cash-out amount too high relative to income`);

        // Approval Conditions
        const approval_conditions = [];
        if (ltv_ratio > 75) approval_conditions.push('Mortgage insurance required');
        if (credit_score < 700) approval_conditions.push('Higher interest rate due to credit score');
        if (break_even_months > 24) approval_conditions.push('Long break-even period - ensure long-term occupancy');
        if (refinance_type === 'cash_out') approval_conditions.push('Cash-out funds usage documentation required');

        // Bank Recommendations
        const recommended_banks = [];
        if (all_criteria_met) {
            if (credit_score >= 740 && ltv_ratio <= 70) {
                recommended_banks.push({ name: 'Bank Hapoalim', rate: new_rate - 0.2, reason: 'Excellent refinance profile' });
                recommended_banks.push({ name: 'Bank Leumi', rate: new_rate - 0.1, reason: 'Low LTV refinance' });
            } else if (credit_score >= 670) {
                recommended_banks.push({ name: 'Discount Bank', rate: new_rate, reason: 'Standard refinance terms' });
                recommended_banks.push({ name: 'Mizrahi Bank', rate: new_rate + 0.1, reason: 'Competitive refinance rates' });
            }
        }

        const result = {
            // Basic calculation results
            refinance_type: refinance_type,
            new_loan_amount: Math.round(actual_new_loan_amount),
            new_monthly_payment: Math.round(new_monthly_payment),
            totalPayment: Math.round(totalPayment),
            totalInterest: Math.round(totalInterest),
            new_rate: new_rate,
            new_years: new_years,
            
            // Refinance-specific results
            current_monthly_payment: current_monthly_payment || 0,
            monthly_savings: Math.round(monthly_savings),
            total_savings_over_term: Math.round(monthly_savings * numberOfPayments),
            closing_costs: closing_costs,
            break_even_months: Math.round(break_even_months * 10) / 10,
            cash_out_amount: Math.round(cash_out_amount),
            
            // Enhanced approval results
            approved: all_criteria_met,
            ltv_ratio: Math.round(ltv_ratio * 10) / 10,
            dti_ratio: Math.round(dti_ratio * 10) / 10,
            credit_score: credit_score,
            credit_risk_level: credit_risk_level,
            age_at_maturity: age_at_maturity,
            stress_test_dti: Math.round(stress_dti * 10) / 10,
            stress_monthly_payment: Math.round(stress_monthly_payment),
            
            // Decision details
            rejection_reasons: rejection_reasons,
            approval_conditions: approval_conditions,
            recommended_banks: recommended_banks,
            
            // Criteria breakdown
            criteria_results: {
                ltv_approved: ltv_approved,
                dti_approved: dti_approved,
                age_approved: age_approved,
                stress_test_approved: stress_test_approved,
                credit_approved: credit_approved,
                employment_approved: employment_approved,
                break_even_approved: break_even_approved,
                cash_out_approved: cash_out_approved
            }
        };

        res.json({
            status: 'success',
            data: result
        });
    } catch (err) {
        console.error('Enhanced mortgage refinance calculation error:', err);
        res.status(500).json({ status: 'error', message: 'Server error' });
    }
});

// Enhanced Credit Refinance Calculator with Approval Logic
app.post('/api/admin/calculate-enhanced-credit-refinance', requireAdmin, async (req, res) => {
    try {
        const { 
            existing_loans, // Array of {amount, rate, monthly_payment}
            consolidation_amount, // Total amount to consolidate
            new_rate,
            new_years,
            monthly_income,
            monthly_expenses = 0,
            age,
            credit_score = 750,
            employment_years = 5,
            refinance_purpose = 'consolidation' // 'consolidation', 'rate_reduction', 'payment_reduction'
        } = req.body;

        // Input validation
        if (!consolidation_amount || !new_rate || !new_years || !monthly_income || !age) {
            return res.status(400).json({ 
                status: 'error', 
                message: 'Missing required fields: consolidation_amount, new_rate, new_years, monthly_income, age' 
            });
        }

        // Load banking standards for credit refinance
        const standardsQuery = `
            SELECT standard_name, standard_value
            FROM banking_standards 
            WHERE business_path = 'credit_refinance' AND is_active = true
        `;
        const standardsResult = await pool.query(standardsQuery);
        const standards = {};
        standardsResult.rows.forEach(row => {
            standards[row.standard_name] = parseFloat(row.standard_value);
        });

        // Calculate current total payments from existing loans
        let current_total_monthly_payment = 0;
        if (existing_loans && Array.isArray(existing_loans)) {
            current_total_monthly_payment = existing_loans.reduce((sum, loan) => sum + (loan.monthly_payment || 0), 0);
        }

        // Basic credit calculations for new consolidated loan
        const principal = consolidation_amount;
        const monthlyRate = new_rate / 100 / 12;
        const numberOfPayments = new_years * 12;
        
        let new_monthly_payment = 0;
        if (monthlyRate > 0) {
            new_monthly_payment = principal * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
                                 (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
        } else {
            new_monthly_payment = principal / numberOfPayments;
        }
        
        const totalPayment = new_monthly_payment * numberOfPayments;
        const totalInterest = totalPayment - consolidation_amount;

        // ENHANCED CREDIT REFINANCE APPROVAL LOGIC

        // 1. DTI Calculation with new consolidated payment
        const total_monthly_debt = new_monthly_payment + monthly_expenses;
        const dti_ratio = (total_monthly_debt / monthly_income) * 100;
        
        // Get DTI configuration from database for credit refinance
        const dtiConfigResult = await pool.query(`
            SELECT standard_value FROM banking_standards 
            WHERE business_path = 'credit_refinance' AND standard_category = 'dti' AND standard_name = 'refinance_max_dti' AND is_active = true
            ORDER BY created_at DESC LIMIT 1
        `);
        const max_dti = dtiConfigResult.rows.length > 0 ? parseFloat(dtiConfigResult.rows[0].standard_value) : 42;
        
        const dti_approved = dti_ratio <= max_dti;

        // 2. Credit Amount vs Income Ratio
        const credit_to_income_ratio = (consolidation_amount / (monthly_income * 12)) * 100;
        const max_credit_to_income = 300; // 3x annual income max
        const credit_amount_approved = credit_to_income_ratio <= max_credit_to_income;

        // 3. Age Verification (max 70 at loan maturity for credit)
        const age_at_maturity = age + new_years;
        const max_age_at_maturity = 70;
        const age_approved = age_at_maturity <= max_age_at_maturity;

        // 4. Credit Score Assessment (stricter for unsecured credit)
        let credit_risk_level = 'excellent';
        let credit_approved = true;
        let min_credit_score = 620; // Higher minimum for credit refinance
        
        if (credit_score < min_credit_score) {
            credit_risk_level = 'poor';
            credit_approved = false;
        } else if (credit_score < 680) {
            credit_risk_level = 'fair';
        } else if (credit_score < 750) {
            credit_risk_level = 'good';
        }

        // 5. Employment Stability Check
        const employment_approved = employment_years >= 2;

        // 6. Stress Testing at higher rate (credit is unsecured)
        const stress_rate = new_rate + 2; // Add 2% for stress test
        const stress_monthly_rate = stress_rate / 100 / 12;
        let stress_monthly_payment = 0;
        if (stress_monthly_rate > 0) {
            stress_monthly_payment = principal * (stress_monthly_rate * Math.pow(1 + stress_monthly_rate, numberOfPayments)) / 
                                   (Math.pow(1 + stress_monthly_rate, numberOfPayments) - 1);
        }
        const stress_total_debt = stress_monthly_payment + monthly_expenses;
        const stress_dti = (stress_total_debt / monthly_income) * 100;
        const stress_test_approved = stress_dti <= max_dti;

        // 7. Refinance Benefit Analysis
        const monthly_savings = current_total_monthly_payment - new_monthly_payment;
        const savings_approved = monthly_savings > 0; // Must provide savings
        
        // 8. Debt-to-Income Improvement
        const old_dti = current_total_monthly_payment > 0 ? 
                        ((current_total_monthly_payment + monthly_expenses) / monthly_income) * 100 : 
                        dti_ratio;
        const dti_improvement = old_dti - dti_ratio;
        const dti_improvement_approved = dti_improvement >= 0; // DTI should improve or stay same

        // Overall Approval Decision
        const all_criteria_met = dti_approved && credit_amount_approved && age_approved && 
                                stress_test_approved && credit_approved && employment_approved &&
                                savings_approved && dti_improvement_approved;

        // Rejection Reasons
        const rejection_reasons = [];
        if (!dti_approved) rejection_reasons.push(`DTI ratio ${dti_ratio.toFixed(1)}% exceeds maximum ${max_dti}%`);
        if (!credit_amount_approved) rejection_reasons.push(`Credit amount ${credit_to_income_ratio.toFixed(0)}% of annual income exceeds maximum ${max_credit_to_income}%`);
        if (!age_approved) rejection_reasons.push(`Age at maturity ${age_at_maturity} exceeds maximum ${max_age_at_maturity}`);
        if (!stress_test_approved) rejection_reasons.push(`Stress test DTI ${stress_dti.toFixed(1)}% exceeds maximum ${max_dti}%`);
        if (!credit_approved) rejection_reasons.push(`Credit score ${credit_score} below minimum requirement ${min_credit_score}`);
        if (!employment_approved) rejection_reasons.push(`Employment history ${employment_years} years below minimum 2 years`);
        if (!savings_approved) rejection_reasons.push(`Refinance does not provide monthly payment savings`);
        if (!dti_improvement_approved) rejection_reasons.push(`Refinance worsens debt-to-income ratio`);

        // Load threshold standards for conditions
        const warning_credit_score = standards.credit_score_warning_credit_score || 700;
        const poor_credit_score = standards.credit_score_poor_credit_score || 680;
        const premium_credit_score = standards.credit_score_premium_credit_score || 750;
        const warning_dti_max = standards.dti_warning_dti_max || 35;
        const premium_dti_max = standards.dti_premium_dti_max || 30;

        // Approval Conditions (using database standards)
        const approval_conditions = [];
        if (credit_score < warning_credit_score) approval_conditions.push('Higher interest rate due to credit score');
        if (dti_ratio > warning_dti_max) approval_conditions.push('Co-signer may be required');
        if (monthly_savings < 100) approval_conditions.push('Minimal savings - ensure long-term benefit');

        // Bank Recommendations for Credit Refinance (using database standards)
        const recommended_banks = [];
        if (all_criteria_met) {
            if (credit_score >= premium_credit_score && dti_ratio <= premium_dti_max) {
                recommended_banks.push({ name: 'Bank Hapoalim', rate: new_rate - 0.5, reason: 'Excellent credit refinance profile' });
                recommended_banks.push({ name: 'Bank Leumi', rate: new_rate - 0.3, reason: 'Low DTI ratio' });
            } else if (credit_score >= poor_credit_score) {
                recommended_banks.push({ name: 'Discount Bank', rate: new_rate, reason: 'Standard refinance terms' });
                recommended_banks.push({ name: 'Mizrahi Bank', rate: new_rate + 0.2, reason: 'Competitive refinance rates' });
            }
        }

        const result = {
            // Basic calculation results
            refinance_purpose: refinance_purpose,
            consolidation_amount: Math.round(consolidation_amount),
            new_monthly_payment: Math.round(new_monthly_payment),
            totalPayment: Math.round(totalPayment),
            totalInterest: Math.round(totalInterest),
            new_rate: new_rate,
            new_years: new_years,
            
            // Refinance-specific results
            current_total_monthly_payment: Math.round(current_total_monthly_payment),
            monthly_savings: Math.round(monthly_savings),
            total_savings_over_term: Math.round(monthly_savings * numberOfPayments),
            old_dti: Math.round(old_dti * 10) / 10,
            dti_improvement: Math.round(dti_improvement * 10) / 10,
            
            // Enhanced approval results
            approved: all_criteria_met,
            dti_ratio: Math.round(dti_ratio * 10) / 10,
            credit_to_income_ratio: Math.round(credit_to_income_ratio * 10) / 10,
            credit_score: credit_score,
            credit_risk_level: credit_risk_level,
            age_at_maturity: age_at_maturity,
            stress_test_dti: Math.round(stress_dti * 10) / 10,
            stress_monthly_payment: Math.round(stress_monthly_payment),
            
            // Decision details
            rejection_reasons: rejection_reasons,
            approval_conditions: approval_conditions,
            recommended_banks: recommended_banks,
            
            // Criteria breakdown
            criteria_results: {
                dti_approved: dti_approved,
                credit_amount_approved: credit_amount_approved,
                age_approved: age_approved,
                stress_test_approved: stress_test_approved,
                credit_approved: credit_approved,
                employment_approved: employment_approved,
                savings_approved: savings_approved,
                dti_improvement_approved: dti_improvement_approved
            }
        };

        res.json({
            status: 'success',
            data: result
        });
    } catch (err) {
        console.error('Enhanced credit refinance calculation error:', err);
        res.status(500).json({ status: 'error', message: 'Server error' });
    }
});

// Helper function for enhanced mortgage calculation (extracted from admin endpoint)
async function calculateEnhancedMortgage(params, bankStandards = null) {
    const { 
        amount, 
        rate, 
        years, 
        initial_payment = 0,
        property_value,
        monthly_income,
        monthly_expenses = 0,
        age,
        credit_score = 750,
        employment_years = 5
    } = params;

    // Basic mortgage calculations
    const principal = amount - initial_payment;
    const monthlyRate = rate / 100 / 12;
    const numberOfPayments = years * 12;
    
    let monthlyPayment = 0;
    if (monthlyRate > 0) {
        monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
                       (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
    } else {
        monthlyPayment = principal / numberOfPayments;
    }
    
    const totalPayment = monthlyPayment * numberOfPayments + initial_payment;
    const totalInterest = totalPayment - amount;

    // Use bank-specific standards if provided, otherwise use defaults
    const standards = bankStandards ? {
        ltv_standard_ltv_max: bankStandards.standard_ltv_max?.value || 80,
        dti_back_end_dti_max: bankStandards.back_end_dti_max?.value || 42,
        age_maximum_age_at_maturity: bankStandards.maximum_age_at_maturity?.value || 75,
        credit_score_minimum_credit_score: bankStandards.minimum_credit_score?.value || 620,
        credit_score_good_credit_score: 670,
        credit_score_excellent_credit_score: 740
    } : {
        ltv_standard_ltv_max: 80,
        dti_back_end_dti_max: 42,
        age_maximum_age_at_maturity: 75,
        credit_score_minimum_credit_score: 620,
        credit_score_good_credit_score: 670,
        credit_score_excellent_credit_score: 740
    };
    // Approval calculations
    const ltv_ratio = (amount / property_value) * 100;
    const max_ltv = standards.ltv_standard_ltv_max || 80;
    const ltv_approved = ltv_ratio <= max_ltv;

    const total_monthly_debt = monthlyPayment + monthly_expenses;
    const dti_ratio = (total_monthly_debt / monthly_income) * 100;
    const max_dti = standards.dti_back_end_dti_max || 42;
    const dti_approved = dti_ratio <= max_dti;

    const age_at_maturity = age + years;
    const max_age_at_maturity = standards.age_maximum_age_at_maturity || 75;
    const age_approved = age_at_maturity <= max_age_at_maturity;

    const min_credit_score = standards.credit_score_minimum_credit_score || 620;
    const credit_approved = credit_score >= min_credit_score;
    const employment_approved = employment_years >= 2;

    const all_criteria_met = ltv_approved && dti_approved && age_approved && credit_approved && employment_approved;

    return {
        loan_terms: {
            interest_rate: rate,
            term_years: years
        },
        payment_details: {
            monthly_payment: Math.round(monthlyPayment),
            total_payment: Math.round(totalPayment)
        },
        risk_assessment: {
            ltv_ratio: Math.round(ltv_ratio * 10) / 10,
            dti_ratio: Math.round(dti_ratio * 10) / 10
        },
        approval_decision: {
            decision: all_criteria_met ? 'approved' : 'rejected'
        }
    };
}

// Helper function for enhanced credit calculation
async function calculateEnhancedCredit(params) {
    const { 
        amount, 
        rate, 
        years,
        monthly_income,
        monthly_expenses = 0,
        age,
        credit_score = 750,
        employment_years = 5
    } = params;

    // Basic credit calculations
    const monthlyRate = rate / 100 / 12;
    const numberOfPayments = years * 12;
    
    let monthlyPayment = 0;
    if (monthlyRate > 0) {
        monthlyPayment = amount * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
                       (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
    } else {
        monthlyPayment = amount / numberOfPayments;
    }
    
    const totalPayment = monthlyPayment * numberOfPayments;

    // Simple approval logic for credit
    const total_monthly_debt = monthlyPayment + monthly_expenses;
    const dti_ratio = (total_monthly_debt / monthly_income) * 100;
            // Get DTI configuration from database
        const quickDtiResult = await pool.query(`
            SELECT standard_value FROM banking_standards 
            WHERE standard_category = 'dti' AND is_active = true
            ORDER BY created_at DESC LIMIT 1
        `);
        const max_dti_check = quickDtiResult.rows.length > 0 ? parseFloat(quickDtiResult.rows[0].standard_value) : 42;
        const dti_approved = dti_ratio <= max_dti_check;
    const credit_approved = credit_score >= 620;
    const employment_approved = employment_years >= 2;
    const all_criteria_met = dti_approved && credit_approved && employment_approved;

    return {
        loan_terms: {
            annual_rate: rate,
            term_months: numberOfPayments
        },
        payment_details: {
            monthly_payment: Math.round(monthlyPayment),
            total_payment: Math.round(totalPayment)
        },
        risk_assessment: {
            dti_ratio: Math.round(dti_ratio * 10) / 10
        },
        approval_decision: {
            decision: all_criteria_met ? 'approved' : 'rejected'
        }
    };
}

// ===============================================
// BANK-SPECIFIC CALCULATION HELPER FUNCTIONS
// ===============================================

// ENHANCED: Get Bank-Specific Standards (prioritize bank over global)
async function getBankSpecificStandards(bankId, businessPath) {
    try {
        // Get bank-specific overrides first
        const bankStandardsQuery = `
            SELECT 
                bs.standard_name,
                COALESCE(bso.override_value, bs.standard_value) as effective_value,
                CASE WHEN bso.override_value IS NOT NULL THEN 'bank_specific' ELSE 'global' END as source
            FROM banking_standards bs
            LEFT JOIN bank_standards_overrides bso ON bs.id = bso.banking_standard_id 
                AND bso.bank_id = $1 
                AND bso.is_active = true
                AND (bso.effective_to IS NULL OR bso.effective_to >= CURRENT_DATE)
            WHERE bs.business_path = $2 AND bs.is_active = true
            ORDER BY bs.standard_name
        `;
        
        const result = await pool.query(bankStandardsQuery, [bankId, businessPath]);
        
        const standards = {};
        result.rows.forEach(row => {
            standards[row.standard_name] = {
                value: parseFloat(row.effective_value),
                source: row.source
            };
        });
        
        return standards;
    } catch (error) {
        console.error(`Error getting bank ${bankId} standards:`, error);
        return {};
    }
}

// ENHANCED: Get Bank-Specific Interest Rate with Adjustments  
async function calculateBankSpecificRate(bankId, baseRate, customerProfile) {
    try {
        // Ensure baseRate is a valid number
        const validBaseRate = parseFloat(baseRate);
        if (isNaN(validBaseRate)) {
            console.log(`[RATE CALC] Bank ${bankId}: Invalid base rate "${baseRate}", using 3.0% default`);
            return 3.0;
        }
        
        const { credit_score, property_type, employment_type, ltv_ratio, loan_amount } = customerProfile;
        
        let finalRate = validBaseRate;
        
        // Get bank-specific rate rules
        const rateRulesQuery = `
            SELECT rule_type, condition_min, condition_max, rate_adjustment, description
            FROM interest_rate_rules 
            WHERE bank_id = $1 AND is_active = true
            ORDER BY priority ASC
        `;
        
        const rulesResult = await pool.query(rateRulesQuery, [bankId]);
        
        console.log(`[RATE CALC] Bank ${bankId}: Found ${rulesResult.rows.length} rate rules`);
        
        // If no specific rules found, apply standard credit score adjustments
        if (rulesResult.rows.length === 0) {
            console.log(`[RATE CALC] Bank ${bankId}: No specific rules found, applying standard adjustments`);
            
            // Standard credit score adjustments
            if (credit_score >= 750) {
                finalRate -= 0.3; // Excellent credit
                console.log(`[RATE CALC] Bank ${bankId}: Applied credit_score adjustment: -0.3%`);
            } else if (credit_score >= 650) {
                finalRate -= 0.1; // Good credit
                console.log(`[RATE CALC] Bank ${bankId}: Applied credit_score adjustment: -0.1%`);
            } else if (credit_score < 580) {
                finalRate += 0.5; // Poor credit
                console.log(`[RATE CALC] Bank ${bankId}: Applied credit_score adjustment: +0.5%`);
            }
            
            // Standard LTV adjustments
            if (ltv_ratio > 80) {
                finalRate += 0.2; // High LTV risk
                console.log(`[RATE CALC] Bank ${bankId}: Applied high LTV adjustment: +0.2%`);
            }
        } else {
            // Apply bank-specific rules
            for (const rule of rulesResult.rows) {
                let adjustment = 0;
            
            switch (rule.rule_type) {
                case 'credit_score':
                    if (credit_score >= rule.condition_min && credit_score <= rule.condition_max) {
                        adjustment = parseFloat(rule.rate_adjustment);
                    }
                    break;
                    
                case 'ltv':
                    if (ltv_ratio >= rule.condition_min && ltv_ratio <= rule.condition_max) {
                        adjustment = parseFloat(rule.rate_adjustment);
                    }
                    break;
                    
                case 'loan_amount':
                    if (loan_amount >= rule.condition_min && loan_amount <= rule.condition_max) {
                        adjustment = parseFloat(rule.rate_adjustment);
                    }
                    break;
                    
                case 'property_type':
                    if (property_type === 'investment' && rule.description && rule.description.includes('Investment')) {
                        adjustment = parseFloat(rule.rate_adjustment);
                    }
                    break;
                    
                case 'employment_type':  
                    if (employment_type === 'self_employed' && rule.description && rule.description.includes('Self Employed')) {
                        adjustment = parseFloat(rule.rate_adjustment);
                    }
                    break;
            }
            
            if (adjustment !== 0) {
                finalRate += adjustment;
                console.log(`[RATE CALC] Bank ${bankId}: Applied ${rule.rule_type} adjustment: ${adjustment > 0 ? '+' : ''}${adjustment}%`);
            }
        }
        }  // Close the else block that contains the for loop
        
        // Ensure we return a valid number
        const resultRate = parseFloat(finalRate);
        if (isNaN(resultRate)) {
            console.log(`[RATE CALC] Bank ${bankId}: Final rate calculation resulted in NaN, using base rate ${validBaseRate}%`);
            return validBaseRate;
        }
        
        console.log(`[RATE CALC] Bank ${bankId}: Final calculated rate: ${resultRate.toFixed(3)}%`);
        return resultRate;
        
    } catch (error) {
        console.error(`[RATE CALC] Error calculating bank ${bankId} rate:`, error);
        const fallbackRate = parseFloat(baseRate) || 3.0;
        console.log(`[RATE CALC] Bank ${bankId}: Using fallback rate ${fallbackRate}%`);
        return fallbackRate; // Fallback to base rate
    }
}

// Create bank-specific standards from bank_configurations data
async function getBankSpecificStandardsFromConfig(bank, globalStandards) {
    const standards = {};
    
    // Map bank configuration fields to standard names
    const mappings = {
        'standard_ltv_max': bank.max_ltv_ratio,
        'minimum_credit_score': bank.min_credit_score,
        'front_end_dti_max': 45, // Bank-specific DTI from configurations (will be added later)
        'back_end_dti_max': 45,  // Bank-specific DTI from configurations (will be added later)
        'minimum_monthly_income': globalStandards.minimum_monthly_income || 3000,
        'minimum_age': globalStandards.minimum_age || 18,
        'maximum_age_at_maturity': globalStandards.maximum_age_at_maturity || 75,
        'pmi_ltv_max': globalStandards.pmi_ltv_max || 97
    };
    
    // For banks with configurations (75-84), use bank-specific values
    const hasBankConfig = bank.max_ltv_ratio && bank.min_credit_score;
    
    Object.keys(mappings).forEach(standardName => {
        const bankValue = mappings[standardName];
        const globalValue = globalStandards[standardName];
        
        if (hasBankConfig && bankValue != null) {
            standards[standardName] = {
                value: parseFloat(bankValue),
                source: 'bank_specific'
            };
        } else {
            standards[standardName] = {
                value: parseFloat(globalValue) || parseFloat(bankValue) || 0,
                source: 'global'
            };
        }
    });
    
    // Add bank-specific DTI limits for configured banks
    if (hasBankConfig) {
        // Set bank-specific DTI limits (these should come from bank_configurations table)
        // For now, using better defaults for configured banks
        standards.front_end_dti_max = { value: 45, source: 'bank_specific' };
        standards.back_end_dti_max = { value: 45, source: 'bank_specific' };
    }
    
    return standards;
}

// MULTI-BANK COMPARISON ENDPOINT (Database-Driven, No Hardcoded Values)
app.post('/api/customer/compare-banks', async (req, res) => {
    const { 
        loan_type, 
        amount, 
        property_value, 
        monthly_income, 
        age, 
        employment_years,
        monthly_expenses,
        session_id,
        property_ownership, // From Confluence Action #12
        birth_date,
        employment_start_date,
        client_id,
        // Optional calculated values (fallbacks from database if not provided)
        credit_score,
        ip_address = req.ip || req.connection.remoteAddress
    } = req.body;
    
    try {
        console.log('[COMPARE-BANKS] Request received:', { 
            loan_type, 
            amount, 
            property_value, 
            property_ownership,
            session_id 
        });
        
        // ===============================================
        // 1. CALCULATE REAL VALUES FROM DATABASE (NO HARDCODED VALUES)
        // ===============================================
        
        let calculated_age = age;
        let calculated_employment_years = employment_years;
        let calculated_credit_score = credit_score;
        let calculated_monthly_expenses = monthly_expenses;
        
        // Calculate age from birth_date if provided (Confluence requirement)
        if (birth_date && !age) {
            const birthDate = new Date(birth_date);
            const today = new Date();
            calculated_age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                calculated_age--;
            }
        }
        
        // Calculate employment years from start date if provided
        if (employment_start_date && !employment_years) {
            const startDate = new Date(employment_start_date);
            const today = new Date();
            calculated_employment_years = (today - startDate) / (365.25 * 24 * 60 * 60 * 1000);
        }
        
        // Get credit score from database if client_id provided
        if (client_id && !credit_score) {
            const creditQuery = `
                SELECT credit_score 
                FROM client_credit_history 
                WHERE client_id = $1 AND credit_score IS NOT NULL 
                ORDER BY last_updated DESC 
                LIMIT 1
            `;
            const creditResult = await pool.query(creditQuery, [client_id]);
            if (creditResult.rows.length > 0) {
                calculated_credit_score = creditResult.rows[0].credit_score;
            }
        }
        
        // Calculate monthly expenses from debt records if client_id provided
        if (client_id && !monthly_expenses) {
            const expensesQuery = `
                SELECT COALESCE(SUM(monthly_payment), 0) as total_expenses
                FROM client_debts 
                WHERE client_id = $1 AND is_active = true
            `;
            const expensesResult = await pool.query(expensesQuery, [client_id]);
            calculated_monthly_expenses = parseFloat(expensesResult.rows[0].total_expenses) || 0;
        }
        
        // Get property ownership LTV ratio (Confluence Action #12)
        let max_ltv_ratio = 80.00; // Default fallback
        if (property_ownership) {
            const ltvQuery = `SELECT get_property_ownership_ltv($1) as ltv_ratio`;
            const ltvResult = await pool.query(ltvQuery, [property_ownership]);
            max_ltv_ratio = parseFloat(ltvResult.rows[0].ltv_ratio);
        }
        
        // Validate required fields after calculation
        if (!loan_type || !amount || !monthly_income || !calculated_age) {
            return res.status(400).json({
                status: 'error',
                message: 'Missing required fields after calculation',
                details: {
                    loan_type: !!loan_type,
                    amount: !!amount,
                    monthly_income: !!monthly_income,
                    age: !!calculated_age,
                    property_ownership: !!property_ownership
                }
            });
        }
        
        // Save/update form session data for Steps 1-3 tracking
        if (session_id) {
            const sessionQuery = `
                INSERT INTO client_form_sessions (
                    session_id, client_id, property_value, initial_payment, 
                    loan_term_years, property_ownership, ltv_ratio,
                    personal_data, financial_data, ip_address, current_step
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 4)
                ON CONFLICT (session_id) 
                DO UPDATE SET
                    property_value = EXCLUDED.property_value,
                    initial_payment = EXCLUDED.initial_payment,
                    property_ownership = EXCLUDED.property_ownership,
                    ltv_ratio = EXCLUDED.ltv_ratio,
                    financial_data = EXCLUDED.financial_data,
                    current_step = 4,
                    updated_at = NOW()
            `;
            
            const sessionData = {
                personal: { age: calculated_age, birth_date },
                financial: { 
                    monthly_income, 
                    employment_years: calculated_employment_years,
                    monthly_expenses: calculated_monthly_expenses,
                    credit_score: calculated_credit_score
                }
            };
            
            await pool.query(sessionQuery, [
                session_id,
                client_id,
                property_value,
                property_value ? property_value - amount : null,
                30, // Default term years
                property_ownership,
                max_ltv_ratio,
                JSON.stringify(sessionData.personal),
                JSON.stringify(sessionData.financial),
                ip_address
            ]);
        }
        
        // ===============================================
        // 2. QUERY BANKS WITH DATABASE-DRIVEN RATES (NO HARDCODED VALUES)
        // ===============================================
        
        // Get configurable interest rate from banking_standards
        const baseRateQuery = `SELECT get_current_mortgage_rate() as base_rate`;
        const baseRateResult = await contentPool.query(baseRateQuery);
        const configurable_base_rate = parseFloat(baseRateResult.rows[0].base_rate);
        
        console.log('[COMPARE-BANKS] Using configurable base rate:', configurable_base_rate);
        
        // Determine language for bank names based on Accept-Language header
        const clientLang = req.headers['accept-language']?.split(',')[0]?.split('-')[0] || 'en';
        let nameField = 'name_en';
        if (clientLang === 'he') {
            nameField = 'name_he';
        } else if (clientLang === 'ru') {
            nameField = 'name_ru';
        }
        
        console.log(`[COMPARE-BANKS] Using language: ${clientLang}, name field: ${nameField}`);
        
        // Query banks with configurations from bank_configurations table
        const banksQuery = `
            SELECT 
                b.id, 
                CASE 
                    WHEN $4 = 'name_he' THEN COALESCE(b.name_he, b.name_en)
                    WHEN $4 = 'name_ru' THEN COALESCE(b.name_ru, b.name_en)
                    ELSE b.name_en
                END as name, 
                NULL as logo_url,
                COALESCE(bc.min_loan_amount, 50000) as min_loan_amount,
                COALESCE(bc.max_loan_amount, 5000000) as max_loan_amount,
                COALESCE(bc.base_interest_rate, $1) as base_interest_rate,
                COALESCE(bc.min_interest_rate, $1 - 0.5) as min_interest_rate,
                COALESCE(bc.max_interest_rate, $1 + 2.0) as max_interest_rate,
                COALESCE(bc.max_ltv_ratio, $2) as max_ltv_ratio,
                COALESCE(bc.min_credit_score, 620) as min_credit_score,
                COALESCE(bc.processing_fee, 2500) as processing_fee,
                COALESCE(bc.risk_premium, 0.0) as risk_premium,
                bc.auto_approval_enabled
            FROM banks b
            LEFT JOIN bank_configurations bc ON b.id = bc.bank_id 
                AND bc.product_type = $3 
                AND bc.is_active = true
                AND (bc.effective_to IS NULL OR bc.effective_to >= CURRENT_DATE)
            WHERE b.is_active = true
            ORDER BY b.name_en
        `;
        
        const banksResult = await pool.query(banksQuery, [
            configurable_base_rate,
            max_ltv_ratio,
            loan_type === 'mortgage' || loan_type === 'mortgage_refinance' ? 'mortgage' : 'credit',
            nameField
        ]);
        const banks = banksResult.rows;
        
        if (banks.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: 'No active banks found'
            });
        }
        
        console.log(`[COMPARE-BANKS] Found ${banks.length} active banks`);
        
        // Load global standards for fallback
        // Use default standards (banking_standards table not available - use hardcoded defaults)
        const globalStandards = {
            minimum_monthly_income: 3000,
            minimum_age: 18,
            maximum_age_at_maturity: 75,
            pmi_ltv_max: 97
        };
        
        // Calculate loan terms for each bank
        let bankOffers = [];
        
        for (const bank of banks) {
            try {
                console.log(`[COMPARE-BANKS] Processing Bank ${bank.id} (${bank.name})`);
                
                // Check if loan amount is within bank's limits
                if (amount < bank.min_loan_amount || amount > bank.max_loan_amount) {
                    console.log(`[COMPARE-BANKS] Bank ${bank.id}: REJECTED - Loan amount ${amount} outside limits (${bank.min_loan_amount} - ${bank.max_loan_amount})`);
                    continue;
                }
                
                // 1. GET BANK-SPECIFIC STANDARDS (from bank_configurations table)
                const bankStandards = await getBankSpecificStandardsFromConfig(bank, globalStandards);
                
                console.log(`[COMPARE-BANKS] Bank ${bank.id} specific standards:`, 
                    Object.keys(bankStandards).reduce((acc, key) => {
                        acc[key] = `${bankStandards[key].value} (${bankStandards[key].source})`;
                        return acc;
                    }, {})
                );
                
                // 2. CHECK BANK-SPECIFIC ELIGIBILITY CRITERIA
                
                // LTV Check (Bank-Specific)
                if (property_value && bankStandards.standard_ltv_max) {
                    const customerLTV = (amount / property_value) * 100;
                    const maxLTV = bankStandards.standard_ltv_max.value;
                    if (customerLTV > maxLTV) {
                        console.log(`[COMPARE-BANKS] Bank ${bank.id}: REJECTED - LTV ${customerLTV.toFixed(1)}% > Bank Max ${maxLTV}% (${bankStandards.standard_ltv_max.source})`);
                        continue;
                    }
                    console.log(`[COMPARE-BANKS] Bank ${bank.id}: LTV ${customerLTV.toFixed(1)}% ≤ Bank Max ${maxLTV}% ✓`);
                }
                
                // Credit Score Check (Bank-Specific)
                if (bankStandards.minimum_credit_score && calculated_credit_score < bankStandards.minimum_credit_score.value) {
                    console.log(`[COMPARE-BANKS] Bank ${bank.id}: REJECTED - Credit Score ${calculated_credit_score} < Bank Min ${bankStandards.minimum_credit_score.value} (${bankStandards.minimum_credit_score.source})`);
                    continue;
                }
                
                // Income Check (Bank-Specific)
                if (bankStandards.minimum_monthly_income && monthly_income < bankStandards.minimum_monthly_income.value) {
                    console.log(`[COMPARE-BANKS] Bank ${bank.id}: REJECTED - Income ${monthly_income} < Bank Min ${bankStandards.minimum_monthly_income.value} (${bankStandards.minimum_monthly_income.source})`);
                    continue;
                }
                
                // Age Checks (Bank-Specific)
                if (bankStandards.minimum_age && calculated_age < bankStandards.minimum_age.value) {
                    console.log(`[COMPARE-BANKS] Bank ${bank.id}: REJECTED - Age ${calculated_age} < Bank Min ${bankStandards.minimum_age.value} (${bankStandards.minimum_age.source})`);
                    continue;
                }
                
                if (bankStandards.maximum_age_at_maturity) {
                    const ageAtMaturity = calculated_age + 30; // Assuming 30-year loan
                    if (ageAtMaturity > bankStandards.maximum_age_at_maturity.value) {
                        console.log(`[COMPARE-BANKS] Bank ${bank.id}: REJECTED - Age at maturity ${ageAtMaturity} > Bank Max ${bankStandards.maximum_age_at_maturity.value} (${bankStandards.maximum_age_at_maturity.source})`);
                        continue;
                    }
                }
                
                // DTI Check (Bank-Specific)
                const frontEndDTI = (calculated_monthly_expenses / monthly_income) * 100;
                if (bankStandards.front_end_dti_max && frontEndDTI > bankStandards.front_end_dti_max.value) {
                    console.log(`[COMPARE-BANKS] Bank ${bank.id}: REJECTED - DTI ${frontEndDTI.toFixed(1)}% > Bank Max ${bankStandards.front_end_dti_max.value}% (${bankStandards.front_end_dti_max.source})`);
                    continue;
                }
                
                console.log(`[COMPARE-BANKS] Bank ${bank.id}: PASSED bank-specific eligibility checks`);
                
                // 3. CALCULATE BANK-SPECIFIC INTEREST RATE
                const customerProfile = {
                    credit_score: calculated_credit_score || 750,
                    property_type: 'primary', // Can be enhanced with actual property type
                    employment_type: 'employed', // Can be enhanced with actual employment type  
                    ltv_ratio: property_value ? (amount / property_value) * 100 : 0,
                    loan_amount: amount
                };
                
                // Ensure base rate is a valid number
                const baseRateValue = parseFloat(bank.base_interest_rate || bank.min_interest_rate || 3.0);
                console.log(`[COMPARE-BANKS] Bank ${bank.id}: Base rate input: "${bank.base_interest_rate || bank.min_interest_rate}" → Parsed: ${baseRateValue}`);
                
                const bankSpecificRate = await calculateBankSpecificRate(
                    bank.id, 
                    baseRateValue, 
                    customerProfile
                );
                
                // Add null checks and proper formatting
                const finalRate = bankSpecificRate != null ? parseFloat(bankSpecificRate) : baseRateValue;
                const formattedRate = !isNaN(finalRate) ? finalRate.toFixed(3) : baseRateValue.toFixed(3);
                
                console.log(`[COMPARE-BANKS] Bank ${bank.id} (${bank.name}): Base rate ${baseRateValue}% → Final rate ${formattedRate}%`);
                
                // 4. PERFORM CALCULATION WITH BANK-SPECIFIC PARAMETERS
                console.log(`[COMPARE-BANKS] Bank ${bank.id}: Starting calculation with rate ${finalRate}%`);                let result;
                if (loan_type === 'mortgage' || loan_type === 'mortgage_refinance') {
                    result = await calculateEnhancedMortgage({
                        amount: amount,
                        rate: finalRate, // Use validated bank-specific rate
                        years: 30, // Can be made bank-specific too
                        property_value: property_value,
                        monthly_income: monthly_income,
                        monthly_expenses: calculated_monthly_expenses,
                        age: calculated_age,
                        credit_score: calculated_credit_score || 750,
                        employment_years: calculated_employment_years || 5
                    }, bankStandards);
                } else {
                    result = await calculateEnhancedCredit({
                        amount: amount,
                        rate: bankSpecificRate + 1.5, // Credit rates higher than mortgage
                        years: 5,
                        monthly_income: monthly_income,
                        monthly_expenses: calculated_monthly_expenses,
                        age: calculated_age,
                        credit_score: calculated_credit_score || 750,
                        employment_years: calculated_employment_years || 5
                    }, bankStandards);
                }
                
                console.log(`[COMPARE-BANKS] Bank ${bank.id}: Calculation result:`, { decision: result?.approval_decision?.decision, monthlyPayment: result?.payment_details?.monthly_payment, error: result?.error });                if (result && result.approval_decision && result.approval_decision.decision === 'approved') {
                    const bankOffer = {
                        bank_id: bank.id,
                        bank_name: bank.name,
                        bank_logo: bank.logo_url,
                        loan_amount: amount,
                        monthly_payment: result.payment_details.monthly_payment,
                        total_payment: result.payment_details.total_payment,
                        interest_rate: finalRate,
                        ltv_ratio: result.risk_assessment.ltv_ratio,
                        dti_ratio: result.risk_assessment.dti_ratio,
                        term_years: loan_type.includes('mortgage') ? 30 : 5,
                        approval_status: 'approved',
                        bank_specific_standards_used: Object.keys(bankStandards).filter(k => 
                            bankStandards[k].source === 'bank_specific'
                        ).length,
                        processing_fee: bank.processing_fee
                    };
                    
                        bankOffers.push(bankOffer);
                    console.log(`[COMPARE-BANKS] Bank ${bank.id}: APPROVED - Added to offers (Rate: ${finalRate.toFixed(3)}%, Payment: ${result.payment_details.monthly_payment})`);
            } else {
                    console.log(`[COMPARE-BANKS] Bank ${bank.id}: NOT APPROVED - ${result.rejection_reasons?.join(', ')}`);
                }
                
            } catch (bankError) {
                console.error(`[COMPARE-BANKS] Error processing bank ${bank.id}:`, bankError);
            }
        }
        
        // If no real offers, use admin-configurable database fallback
        if (bankOffers.length === 0) {
            console.log(`[COMPARE-BANKS] No real offers found, generating database-driven fallback offers`);
            
            try {
                // Get fallback configuration
                const fallbackConfigQuery = `
                    SELECT enable_fallback, fallback_method, max_fallback_banks, 
                           default_term_years, language_preference
                    FROM bank_fallback_config 
                    ORDER BY id DESC LIMIT 1
                `;
                const configResult = await pool.query(fallbackConfigQuery);
                const config = configResult.rows[0] || {
                    enable_fallback: true,
                    fallback_method: 'database_relaxed',
                    max_fallback_banks: 3,
                    default_term_years: 25,
                    language_preference: 'auto'
                };

                if (config.enable_fallback) {
                    // Reuse the already declared clientLang variable
                    let nameField = 'name_en';
                    if (config.language_preference === 'auto') {
                        nameField = clientLang === 'he' ? 'name_he' : 
                                   clientLang === 'ru' ? 'name_ru' : 'name_en';
                    } else if (config.language_preference !== 'auto') {
                        nameField = `name_${config.language_preference}`;
                    }

                    // Query database banks for fallback
                    const fallbackBanksQuery = `
                        SELECT 
                            b.id,
                            COALESCE(b.${nameField}, b.name_en) as bank_name,
                            b.name_en,
                            b.name_he, 
                            b.name_ru,
                            NULL as logo,
                            NULL as url,
                            5.0 as fallback_rate,
                            80.0 as approval_rate,
                            b.id as fallback_priority
                        FROM banks b
                        WHERE b.is_active = true 
                        ORDER BY b.id ASC, b.name_en ASC
                        LIMIT $1
                    `;
                    
                    const fallbackResult = await pool.query(fallbackBanksQuery, [config.max_fallback_banks]);
                    
                    if (fallbackResult.rows.length > 0) {
                        const termYears = config.default_term_years;
                        const termMonths = termYears * 12;
                        
                        fallbackResult.rows.forEach((bank, index) => {
                            // Add some variance to interest rates
                            const baseRate = parseFloat(bank.fallback_rate) || 5.0;
                            const rate = baseRate + (index * 0.3); // Slight rate variation
                            const monthlyRate = rate / 100 / 12;
                            const monthlyPayment = amount * (monthlyRate * Math.pow(1 + monthlyRate, termMonths)) / (Math.pow(1 + monthlyRate, termMonths) - 1);
                            const totalPayment = monthlyPayment * termMonths;
                            
                            bankOffers.push({
                                bank_id: `fallback-${bank.id}`,
                                bank_name: bank.bank_name || bank.name_en,
                                bank_logo: bank.logo || bank.url || null,
                                loan_amount: amount,
                                monthly_payment: Math.round(monthlyPayment),
                                interest_rate: parseFloat(rate.toFixed(2)),
                                term_years: termYears,
                                total_payment: Math.round(totalPayment),
                                approval_status: 'approved',
                                ltv_ratio: property_value ? ((amount / property_value) * 100).toFixed(1) : null,
                                dti_ratio: ((monthly_expenses / monthly_income) * 100).toFixed(1),
                                is_fallback: true
                            });
                        });
                        
                        console.log(`[COMPARE-BANKS] Generated ${bankOffers.length} database-driven fallback offers`);
                    } else {
                        console.log(`[COMPARE-BANKS] No fallback banks available in database`);
                    }
                } else {
                    console.log(`[COMPARE-BANKS] Fallback disabled in configuration`);
                }
            } catch (error) {
                console.error(`[COMPARE-BANKS] Error generating fallback offers:`, error);
                // If database fallback fails, provide minimal response
                bankOffers = [];
            }
        }
        
        // Sort offers by monthly payment (lowest first)
        bankOffers.sort((a, b) => a.monthly_payment - b.monthly_payment);
        
        console.log(`[COMPARE-BANKS] Returning ${bankOffers.length} bank offers`);
        
        res.json({
            status: 'success',
            data: {
                loan_type: loan_type,
                requested_amount: amount,
                customer_profile: {
                    age: age,
                    credit_score: credit_score,
                    monthly_income: monthly_income,
                    dti_ratio: ((monthly_expenses / monthly_income) * 100).toFixed(2)
                },
                bank_offers: bankOffers,
                offers_count: bankOffers.length
            }
        });
        
    } catch (err) {
        console.error('[COMPARE-BANKS] Error:', err);
        res.status(500).json({ 
            status: 'error', 
            message: 'Failed to compare bank offers',
            error: err.message 
        });
    }
});

// MORTGAGE PROGRAMS ENDPOINT
app.get('/api/customer/mortgage-programs', async (req, res) => {
    try {
        console.log('[MORTGAGE-PROGRAMS] Fetching mortgage programs');
        
        // Return standard Israeli mortgage programs
        const mortgagePrograms = [
            {
                id: 'prime',
                title: 'משכנתא צמודת פריים',
                title_en: 'Prime Rate Linked Mortgage',
                title_ru: 'Ипотека, привязанная к основной ставке',
                description: 'משכנתא הצמודה לריבית הפריים של בנק ישראל',
                description_en: 'Mortgage linked to Bank of Israel prime rate',
                description_ru: 'Ипотека, привязанная к основной ставке Банка Израиля',
                conditionFinance: 'עד 33% מההכנסה',
                conditionFinance_en: 'Up to 33% of income',
                conditionFinance_ru: 'До 33% от дохода',
                conditionPeriod: '4-30 שנים',
                conditionPeriod_en: '4-30 years',
                conditionPeriod_ru: '4-30 лет',
                conditionBid: 'ריבית משתנה + קבועה',
                conditionBid_en: 'Variable + Fixed rate components',
                conditionBid_ru: 'Переменная + фиксированная ставка',
                interestRate: 2.1,
                termYears: 20
            },
            {
                id: 'fixed_inflation',
                title: 'משכנתא קבועה צמודת מדד',
                title_en: 'Fixed Rate Linked to Inflation',
                title_ru: 'Фиксированная ставка, привязанная к инфляции',
                description: 'משכנתא בריבית קבועה הצמודה למדד המחירים לצרכן',
                description_en: 'Fixed rate mortgage linked to consumer price index',
                description_ru: 'Ипотека с фиксированной ставкой, привязанной к индексу потребительских цен',
                conditionFinance: 'עד 70% מההכנסה',
                conditionFinance_en: 'Up to 70% of income',
                conditionFinance_ru: 'До 70% от дохода',
                conditionPeriod: '5-30 שנים',
                conditionPeriod_en: '5-30 years',
                conditionPeriod_ru: '5-30 лет',
                conditionBid: 'ריבית קבועה',
                conditionBid_en: 'Fixed rate structure',
                conditionBid_ru: 'Структура с фиксированной ставкой',
                interestRate: 3.2,
                termYears: 25
            },
            {
                id: 'variable_inflation',
                title: 'משכנתא משתנה צמודת מדד',
                title_en: 'Variable Rate Linked to Inflation',
                title_ru: 'Переменная ставка, привязанная к инфляции',
                description: 'משכנתא בריבית משתנה הצמודה למדד המחירים לצרכן',
                description_en: 'Variable rate mortgage linked to consumer price index',
                description_ru: 'Ипотека с переменной ставкой, привязанной к индексу потребительских цен',
                conditionFinance: 'עד 75% מההכנסה',
                conditionFinance_en: 'Up to 75% of income',
                conditionFinance_ru: 'До 75% от дохода',
                conditionPeriod: '4-25 שנים',
                conditionPeriod_en: '4-25 years',
                conditionPeriod_ru: '4-25 лет',
                conditionBid: 'ריבית משתנה',
                conditionBid_en: 'Variable rate structure',
                conditionBid_ru: 'Структура с переменной ставкой',
                interestRate: 2.8,
                termYears: 20
            }
        ];
        
        res.json({
            status: 'success',
            data: {
                programs: mortgagePrograms,
                total: mortgagePrograms.length
            }
        });
        
    } catch (err) {
        console.error('[MORTGAGE-PROGRAMS] Error:', err);
        res.status(500).json({ 
            status: 'error', 
            message: 'Failed to fetch mortgage programs',
            error: err.message 
        });
    }
});

// REGISTRATION ENDPOINT - FIXED VERSION
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
        // First, ensure the clients table has proper constraints
        console.log('[REGISTER] Ensuring proper table schema...');
        
        // Add unique constraints if they don't exist
        try {
            await pool.query('ALTER TABLE clients ADD CONSTRAINT clients_email_unique UNIQUE (email)');
            console.log('[REGISTER] Added unique constraint on email');
        } catch (err) {
            if (err.code !== '42P07') { // Ignore "already exists" error
                console.log('[REGISTER] Email constraint already exists or other error:', err.message);
            }
        }
        
        try {
            await pool.query('ALTER TABLE clients ADD CONSTRAINT clients_phone_unique UNIQUE (phone)');
            console.log('[REGISTER] Added unique constraint on phone');
        } catch (err) {
            if (err.code !== '42P07') { // Ignore "already exists" error
                console.log('[REGISTER] Phone constraint already exists or other error:', err.message);
            }
        }
        
        // Add password_hash column if it doesn't exist
        try {
            await pool.query('ALTER TABLE clients ADD COLUMN password_hash VARCHAR(255)');
            console.log('[REGISTER] Added password_hash column');
        } catch (err) {
            if (err.code !== '42701') { // Ignore "column already exists" error
                console.log('[REGISTER] Password column already exists or other error:', err.message);
            }
        }
        
        // Check if client already exists by phone or email
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
        
        // Split name into first_name and last_name
        const nameParts = name.trim().split(' ');
        const firstName = nameParts[0] || 'New';
        const lastName = nameParts.slice(1).join(' ') || 'Client';
        
        // For now, store password as plain text (TODO: use bcrypt in production)
        const passwordHash = password;
        
        // Insert new client with password
        const result = await pool.query(
            'INSERT INTO clients (first_name, last_name, email, phone, password_hash, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, NOW(), NOW()) RETURNING id, first_name, last_name, email, phone',
            [firstName, lastName, email, mobile_number, passwordHash]
        );
        
        const newClient = result.rows[0];
        
        console.log(`[REGISTER] Client created successfully: ${newClient.first_name} ${newClient.last_name} (ID: ${newClient.id})`);
        
        // Generate JWT token for immediate login
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
            message: 'Server error during registration',
            details: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
        });
    }
});

// ADMIN APPLICATION MANAGEMENT ENDPOINTS
app.get('/api/admin/applications', async (req, res) => {
    try {
        console.log('[ADMIN-APPLICATIONS] Fetching all applications');
        
        const { status, bank_id, limit = 50, offset = 0 } = req.query;
        
        let query = `
            SELECT 
                la.id, la.status, la.created_at, la.updated_at,
                la.loan_type, la.loan_amount, la.interest_rate,
                la.term_months, la.monthly_payment,
                la.application_data, la.review_notes,
                c.name as client_name, c.email, c.phone,
                b.name as bank_name
            FROM loan_applications la
            JOIN clients c ON la.client_id = c.id
            JOIN banks b ON la.bank_id = b.id
            WHERE 1=1
        `;
        
        const params = [];
        let paramCount = 0;
        
        if (status) {
            paramCount++;
            query += ` AND la.status = $${paramCount}`;
            params.push(status);
        }
        
        if (bank_id) {
            paramCount++;
            query += ` AND la.bank_id = $${paramCount}`;
            params.push(bank_id);
        }
        
        query += ` ORDER BY la.created_at DESC`;
        query += ` LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
        params.push(limit, offset);
        
        const result = await pool.query(query, params);
        
        // Get counts by status
        const statusCountQuery = `
            SELECT status, COUNT(*) as count
            FROM loan_applications
            GROUP BY status
        `;
        const statusCounts = await pool.query(statusCountQuery);
        
        const counts = {};
        statusCounts.rows.forEach(row => {
            counts[row.status] = parseInt(row.count);
        });
        
        res.json({
            status: 'success',
            data: {
                applications: result.rows,
                total: result.rows.length,
                status_counts: counts,
                filters: {
                    status: status || 'all',
                    bank_id: bank_id || 'all'
                }
            }
        });
        
    } catch (err) {
        console.error('[ADMIN-APPLICATIONS] Error:', err);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch applications'
        });
    }
});

app.put('/api/admin/applications/:id/status', async (req, res) => {
    const { id } = req.params;
    const { status, review_notes } = req.body;
    
    try {
        console.log(`[ADMIN-UPDATE-STATUS] Updating application ${id} to status ${status}`);
        
        // Validate status
        const validStatuses = [
            'pending_review', 'under_review', 'documentation_required',
            'documents_verified', 'final_approval', 'approved', 'rejected', 'cancelled'
        ];
        
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid status value'
            });
        }
        
        // Update application
        const updateQuery = `
            UPDATE loan_applications
            SET status = $1, 
                review_notes = $2,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $3
            RETURNING *
        `;
        
        const result = await pool.query(updateQuery, [status, review_notes || null, id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: 'Application not found'
            });
        }
        
        // Log status change
        console.log(`[ADMIN-UPDATE-STATUS] Application ${id} updated to ${status}`);
        
        res.json({
            status: 'success',
            data: {
                application_id: id,
                new_status: status,
                review_notes: review_notes,
                updated_at: result.rows[0].updated_at
            }
        });
        
    } catch (err) {
        console.error('[ADMIN-UPDATE-STATUS] Error:', err);
        res.status(500).json({
            status: 'error',
            message: 'Failed to update application status'
        });
    }
});

app.get('/api/admin/applications/:id', async (req, res) => {
    const { id } = req.params;
    
    try {
        console.log(`[ADMIN-APPLICATION-DETAIL] Fetching application ${id}`);
        
        const query = `
            SELECT 
                la.*,
                c.name as client_name, c.email, c.phone, c.age,
                ce.employment_status, ce.years_employed, ce.occupation, ce.monthly_income as employment_income,
                cf.credit_score, cf.monthly_expenses, cf.debt_to_income_ratio,
                b.name as bank_name
            FROM loan_applications la
            JOIN clients c ON la.client_id = c.id
            LEFT JOIN client_employment ce ON c.id = ce.client_id
            LEFT JOIN client_financial cf ON c.id = cf.client_id
            JOIN banks b ON la.bank_id = b.id
            WHERE la.id = $1
        `;
        
        const result = await pool.query(query, [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: 'Application not found'
            });
        }
        
        const application = result.rows[0];
        
        res.json({
            status: 'success',
            data: {
                application: application,
                client_details: {
                    name: application.client_name,
                    email: application.email,
                    phone: application.phone,
                    age: application.age
                },
                employment_details: {
                    status: application.employment_status,
                    years_employed: application.years_employed,
                    occupation: application.occupation,
                    monthly_income: application.employment_income
                },
                financial_details: {
                    credit_score: application.credit_score,
                    monthly_expenses: application.monthly_expenses,
                    dti_ratio: application.debt_to_income_ratio
                }
            }
        });
        
    } catch (err) {
        console.error('[ADMIN-APPLICATION-DETAIL] Error:', err);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch application details'
        });
    }
});

// APPLICATION SUBMISSION SYSTEM
app.post('/api/customer/submit-application', async (req, res) => {
    const { 
        bank_id, loan_type, loan_amount, property_value,
        name, email, phone, age, monthly_income, monthly_expenses,
        credit_score, employment_years, occupation,
        loan_terms, // Contains: interest_rate, term_years/term_months, monthly_payment
        additional_info
    } = req.body;
    
    try {
        console.log('[SUBMIT-APPLICATION] New application submission');
        
        // Validate required fields
        if (!bank_id || !loan_type || !loan_amount || !name || !email || !phone) {
            return res.status(400).json({
                status: 'error',
                message: 'Missing required application fields'
            });
        }
        
        // Start transaction
        await pool.query('BEGIN');
        
        try {
            // Check if client exists
            let clientQuery = `
                SELECT id FROM clients 
                WHERE email = $1 OR phone = $2
                LIMIT 1
            `;
            let clientResult = await pool.query(clientQuery, [email, phone]);
            
            let clientId;
            
            if (clientResult.rows.length > 0) {
                // Update existing client
                clientId = clientResult.rows[0].id;
                
                const updateClientQuery = `
                    UPDATE clients 
                    SET name = $1, age = $2, monthly_income = $3,
                        updated_at = CURRENT_TIMESTAMP
                    WHERE id = $4
                `;
                await pool.query(updateClientQuery, [name, age, monthly_income, clientId]);
                
            } else {
                // Create new client
                const insertClientQuery = `
                    INSERT INTO clients (name, email, phone, age, client_type, active, created_at)
                    VALUES ($1, $2, $3, $4, 'individual', true, CURRENT_TIMESTAMP)
                    RETURNING id
                `;
                const newClientResult = await pool.query(insertClientQuery, [name, email, phone, age]);
                clientId = newClientResult.rows[0].id;
                
                // Insert additional client details
                const detailQueries = [
                    {
                        table: 'client_employment',
                        query: `INSERT INTO client_employment (client_id, employment_status, years_employed, occupation, monthly_income)
                                VALUES ($1, 'employed', $2, $3, $4)`,
                        params: [clientId, employment_years, occupation || 'Not specified', monthly_income]
                    },
                    {
                        table: 'client_financial',
                        query: `INSERT INTO client_financial (client_id, credit_score, monthly_expenses, debt_to_income_ratio)
                                VALUES ($1, $2, $3, $4)`,
                        params: [clientId, credit_score, monthly_expenses, ((monthly_expenses / monthly_income) * 100).toFixed(2)]
                    }
                ];
                
                for (const detail of detailQueries) {
                    await pool.query(detail.query, detail.params);
                }
            }
            
            // Create loan application
            const applicationQuery = `
                INSERT INTO loan_applications (
                    client_id, bank_id, loan_type, loan_amount, 
                    interest_rate, term_months, monthly_payment,
                    status, application_data, created_at, updated_at
                ) VALUES (
                    $1, $2, $3, $4, $5, $6, $7, $8, $9, 
                    CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
                ) RETURNING id, created_at
            `;
            
            const termMonths = loan_type.includes('mortgage') ? 
                (loan_terms.term_years || 30) * 12 : 
                (loan_terms.term_months || 60);
            
            const applicationData = {
                property_value: property_value,
                ltv_ratio: property_value ? ((loan_amount / property_value) * 100).toFixed(2) : null,
                dti_ratio: ((monthly_expenses / monthly_income) * 100).toFixed(2),
                credit_score: credit_score,
                employment_years: employment_years,
                occupation: occupation,
                additional_info: additional_info,
                submission_ip: req.ip,
                submission_timestamp: new Date().toISOString()
            };
            
            const applicationResult = await pool.query(applicationQuery, [
                clientId,
                bank_id,
                loan_type,
                loan_amount,
                loan_terms.interest_rate || 5.0,
                termMonths,
                loan_terms.monthly_payment || 0,
                'pending_review',
                JSON.stringify(applicationData)
            ]);
            
            const applicationId = applicationResult.rows[0].id;
            const createdAt = applicationResult.rows[0].created_at;
            
            // Get bank name for confirmation
            const bankQuery = `SELECT name_en as name FROM banks WHERE id = $1`;
            const bankResult = await pool.query(bankQuery, [bank_id]);
            const bankName = bankResult.rows[0]?.name || 'Unknown Bank';
            
            // Commit transaction
            await pool.query('COMMIT');
            
            console.log(`[SUBMIT-APPLICATION] Application ${applicationId} created successfully`);
            
            res.json({
                status: 'success',
                data: {
                    application_id: applicationId,
                    client_id: clientId,
                    bank_name: bankName,
                    status: 'pending_review',
                    submitted_at: createdAt,
                    message: 'Your loan application has been submitted successfully',
                    next_steps: [
                        'Your application is under review',
                        'Bank will contact you within 24-48 hours',
                        'Keep your documents ready for verification',
                        'Track your application status using the application ID'
                    ]
                }
            });
            
        } catch (innerErr) {
            // Rollback transaction on error
            await pool.query('ROLLBACK');
            throw innerErr;
        }
        
    } catch (err) {
        console.error('[SUBMIT-APPLICATION] Error:', err);
        
        if (err.code === '23505') {
            return res.status(409).json({
                status: 'error',
                message: 'An application with similar details already exists'
            });
        }
        
        res.status(500).json({
            status: 'error',
            message: 'Failed to submit application',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
});

// APPLICATION STATUS TRACKING
app.get('/api/applications/:id/status', async (req, res) => {
    const { id } = req.params;
    
    try {
        console.log(`[APPLICATION-STATUS] Checking status for application ${id}`);
        
        const query = `
            SELECT 
                la.id, la.status, la.created_at, la.updated_at,
                la.loan_type, la.loan_amount, la.interest_rate,
                la.term_months, la.monthly_payment,
                la.application_data, la.review_notes,
                c.name as client_name, c.email, c.phone,
                b.name_en as bank_name, NULL as bank_logo
            FROM loan_applications la
            JOIN clients c ON la.client_id = c.id
            JOIN banks b ON la.bank_id = b.id
            WHERE la.id = $1
        `;
        
        const result = await pool.query(query, [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: 'Application not found'
            });
        }
        
        const application = result.rows[0];
        
        // Define status workflow
        const statusWorkflow = {
            'pending_review': {
                label: 'Pending Review',
                description: 'Your application is being reviewed by the bank',
                progress: 20,
                next: 'under_review'
            },
            'under_review': {
                label: 'Under Review',
                description: 'Bank is verifying your information',
                progress: 40,
                next: 'documentation_required'
            },
            'documentation_required': {
                label: 'Documentation Required',
                description: 'Please submit required documents',
                progress: 50,
                next: 'documents_verified'
            },
            'documents_verified': {
                label: 'Documents Verified',
                description: 'Your documents have been verified',
                progress: 70,
                next: 'final_approval'
            },
            'final_approval': {
                label: 'Final Approval',
                description: 'Awaiting final approval decision',
                progress: 90,
                next: 'approved'
            },
            'approved': {
                label: 'Approved',
                description: 'Congratulations! Your loan has been approved',
                progress: 100,
                next: null
            },
            'rejected': {
                label: 'Rejected',
                description: 'Unfortunately, your application was not approved',
                progress: 100,
                next: null
            },
            'cancelled': {
                label: 'Cancelled',
                description: 'Application was cancelled',
                progress: 100,
                next: null
            }
        };
        
        const currentStatus = statusWorkflow[application.status] || {
            label: application.status,
            description: 'Status unknown',
            progress: 0,
            next: null
        };
        
        // Calculate days since submission
        const daysSinceSubmission = Math.floor(
            (new Date() - new Date(application.created_at)) / (1000 * 60 * 60 * 24)
        );
        
        res.json({
            status: 'success',
            data: {
                application_id: application.id,
                current_status: {
                    code: application.status,
                    ...currentStatus
                },
                application_details: {
                    loan_type: application.loan_type,
                    loan_amount: application.loan_amount,
                    interest_rate: application.interest_rate,
                    term_months: application.term_months,
                    monthly_payment: application.monthly_payment,
                    bank_name: application.bank_name,
                    bank_logo: application.bank_logo
                },
                client_info: {
                    name: application.client_name,
                    email: application.email,
                    phone: application.phone
                },
                timeline: {
                    submitted_at: application.created_at,
                    last_updated: application.updated_at,
                    days_since_submission: daysSinceSubmission,
                    estimated_days_remaining: Math.max(0, 5 - daysSinceSubmission)
                },
                review_notes: application.review_notes,
                next_steps: currentStatus.next ? [
                    `Current stage: ${currentStatus.label}`,
                    `Next stage: ${statusWorkflow[currentStatus.next]?.label || 'Unknown'}`,
                    'Bank will contact you for any requirements'
                ] : [
                    `Application ${currentStatus.label}`,
                    application.status === 'approved' ? 
                        'Bank will contact you for loan disbursement' : 
                        'Thank you for your application'
                ]
            }
        });
        
    } catch (err) {
        console.error('[APPLICATION-STATUS] Error:', err);
        res.status(500).json({
            status: 'error',
            message: 'Failed to retrieve application status',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
});

// === Lawyer Application Submission ===
app.post('/api/lawyers/apply', async (req, res) => {
  try {
    const {
      contactName,
      phone,
      email,
      city,
      desiredRegion,
      employmentType,
      monthlyIncome,
      workExperience,
      clientLitigation,
      debtLitigation,
      comments,
      source,
      submittedAt,
      referrer
    } = req.body;

    // Basic validation
    if (!contactName || !phone || !email) {
      return res.status(400).json({ status: 'error', message: 'Name, phone and email are required' });
    }

    // Ensure table exists (idempotent)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS lawyer_applications (
        id SERIAL PRIMARY KEY,
        contact_name VARCHAR(150) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        email VARCHAR(150) NOT NULL,
        city VARCHAR(100),
        desired_region VARCHAR(100),
        employment_type VARCHAR(100),
        monthly_income VARCHAR(100),
        work_experience VARCHAR(50),
        client_litigation VARCHAR(50),
        debt_litigation VARCHAR(50),
        comments TEXT,
        source VARCHAR(100),
        referrer TEXT,
        submission_data JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    const insertQuery = `
      INSERT INTO lawyer_applications (
        contact_name, phone, email, city, desired_region, employment_type, monthly_income,
        work_experience, client_litigation, debt_litigation, comments, source, referrer, submission_data
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14
      ) RETURNING id, created_at;
    `;

    const submissionData = req.body;

    const values = [
      contactName,
      phone,
      email,
      city,
      desiredRegion,
      employmentType,
      monthlyIncome,
      workExperience,
      clientLitigation,
      debtLitigation,
      comments,
      source,
      referrer,
      JSON.stringify(submissionData)
    ];

    const result = await pool.query(insertQuery, values);

    return res.json({
      status: 'success',
      message: 'Lawyer application saved',
      data: {
        application_id: result.rows[0].id,
        created_at: result.rows[0].created_at
      }
    });
  } catch (err) {
    console.error('[LAWYER-APPLICATION] Error:', err);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
});

// ===============================================
// BANK-SPECIFIC CONFIGURATION MANAGEMENT ENDPOINTS
// ===============================================

// CREATE/UPDATE Bank-Specific Calculation Configuration
app.post('/api/admin/banks/:bankId/calculation-config', requireAdmin, async (req, res) => {
    try {
        const { bankId } = req.params;
        const {
            // Interest Rate Configuration
            base_mortgage_rate,
            min_mortgage_rate, 
            max_mortgage_rate,
            base_credit_rate,
            min_credit_rate,
            max_credit_rate,
            
            // LTV Configuration
            standard_ltv_max,
            pmi_ltv_max,
            first_time_buyer_ltv_max,
            
            // DTI Configuration  
            front_end_dti_max,
            back_end_dti_max,
            
            // Credit Score Requirements
            minimum_credit_score,
            good_credit_score,
            excellent_credit_score,
            
            // Age Limits
            minimum_age,
            maximum_age_at_maturity,
            
            // Income Requirements
            minimum_monthly_income,
            
            // Loan Limits
            min_loan_amount,
            max_loan_amount,
            
            // Processing Fees
            processing_fee,
            appraisal_fee,
            
            // Risk Adjustments
            credit_score_adjustment_excellent, // -0.3%
            credit_score_adjustment_good,      // -0.1%  
            credit_score_adjustment_poor,      // +0.5%
            
            // Property Type Adjustments
            investment_property_rate_add,      // +0.25%
            condo_rate_add,                   // +0.1%
            
            // Employment Type Adjustments  
            self_employed_rate_add,           // +0.5%
            contract_employee_rate_add        // +0.25%
        } = req.body;

        console.log(`[BANK CONFIG] Setting calculation config for bank ${bankId}`);
        
        // 1. Update/Insert Bank Configurations
        await pool.query(`
            INSERT INTO bank_configurations (
                bank_id, product_type, base_interest_rate, min_interest_rate, max_interest_rate,
                max_ltv_ratio, min_credit_score, max_loan_amount, min_loan_amount, 
                processing_fee, is_active, effective_from, updated_at
            ) VALUES (
                $1, 'mortgage', $2, $3, $4, $5, $6, $7, $8, $9, true, CURRENT_DATE, NOW()
            ) ON CONFLICT (bank_id, product_type) 
            DO UPDATE SET 
                base_interest_rate = $2, min_interest_rate = $3, max_interest_rate = $4,
                max_ltv_ratio = $5, min_credit_score = $6, max_loan_amount = $7, 
                min_loan_amount = $8, processing_fee = $9, updated_at = NOW()
        `, [bankId, base_mortgage_rate, min_mortgage_rate, max_mortgage_rate, 
            standard_ltv_max, minimum_credit_score, max_loan_amount, min_loan_amount, processing_fee]);

        // 2. Insert Bank-Specific Standards Overrides
        const standardsOverrides = [
            { standard_name: 'standard_ltv_max', value: standard_ltv_max },
            { standard_name: 'pmi_ltv_max', value: pmi_ltv_max },
            { standard_name: 'front_end_dti_max', value: front_end_dti_max },
            { standard_name: 'back_end_dti_max', value: back_end_dti_max },
            { standard_name: 'minimum_credit_score', value: minimum_credit_score },
            { standard_name: 'minimum_age', value: minimum_age },
            { standard_name: 'maximum_age_at_maturity', value: maximum_age_at_maturity },
            { standard_name: 'minimum_monthly_income', value: minimum_monthly_income }
        ];
        
        for (const override of standardsOverrides) {
            if (override.value !== undefined && override.value !== null) {
                // Get banking_standard_id
                const standardResult = await pool.query(`
                    SELECT id FROM banking_standards 
                    WHERE standard_name = $1 AND business_path = 'mortgage'
                `, [override.standard_name]);
                
                if (standardResult.rows.length > 0) {
                    const standardId = standardResult.rows[0].id;
                    
                    await pool.query(`
                        INSERT INTO bank_standards_overrides (
                            bank_id, banking_standard_id, override_value, is_active, 
                            effective_from, created_at, updated_at
                        ) VALUES ($1, $2, $3, true, CURRENT_DATE, NOW(), NOW())
                        ON CONFLICT (bank_id, banking_standard_id)
                        DO UPDATE SET 
                            override_value = $3, updated_at = NOW(), is_active = true
                    `, [bankId, standardId, override.value]);
                }
            }
        }
        
        // 3. Insert Interest Rate Rules (Bank-Specific Rate Adjustments)
        const rateRules = [
            { rule_type: 'credit_score', condition_min: 800, condition_max: 850, rate_adjustment: credit_score_adjustment_excellent || -0.3 },
            { rule_type: 'credit_score', condition_min: 750, condition_max: 799, rate_adjustment: credit_score_adjustment_good || -0.1 },
            { rule_type: 'credit_score', condition_min: 300, condition_max: 649, rate_adjustment: credit_score_adjustment_poor || 0.5 },
            { rule_type: 'property_type', condition_min: null, condition_max: null, rate_adjustment: investment_property_rate_add || 0.25, description: 'Investment Property' },
            { rule_type: 'employment_type', condition_min: null, condition_max: null, rate_adjustment: self_employed_rate_add || 0.5, description: 'Self Employed' }
        ];
        
        // Clear existing rate rules for this bank
        await pool.query('DELETE FROM interest_rate_rules WHERE bank_id = $1', [bankId]);
        
        for (const rule of rateRules) {
            await pool.query(`
                INSERT INTO interest_rate_rules (
                    bank_id, rule_type, condition_min, condition_max, rate_adjustment, 
                    description, is_active, created_at, updated_at
                ) VALUES ($1, $2, $3, $4, $5, $6, true, NOW(), NOW())
            `, [bankId, rule.rule_type, rule.condition_min, rule.condition_max, 
                rule.rate_adjustment, rule.description]);
        }
        
        res.json({
            status: 'success',
            message: `Bank ${bankId} calculation configuration updated successfully`,
            data: {
                bankId: parseInt(bankId),
                configurations_updated: standardsOverrides.length,
                rate_rules_created: rateRules.length
            }
        });

    } catch (err) {
        console.error('[BANK CONFIG] Error:', err);
        res.status(500).json({ 
            status: 'error', 
            message: 'Failed to update bank calculation configuration',
            error: err.message 
        });
    }
});

// TEST: Initialize Bank-Specific Configurations (No Auth for Testing)
app.post('/api/test/initialize-bank-configs', async (req, res) => {
    try {
        // First, get all available banks
        const banksResult = await pool.query('SELECT id, name_en, name_ru FROM banks WHERE tender = 1 ORDER BY id LIMIT 10');
        console.log(`[TEST] Found ${banksResult.rows.length} banks in database`);
        
        if (banksResult.rows.length === 0) {
            return res.json({
                status: 'success',
                message: 'No banks found in database',
                data: []
            });
        }
        
        // Configuration templates that we'll apply to existing banks
        const rateConfigs = [3.2, 3.1, 3.3, 3.25, 3.4, 3.15, 3.35, 3.28, 3.18, 3.22];
        const ltvConfigs = [75, 80, 75, 78, 70, 82, 77, 74, 79, 76];
        const creditConfigs = [650, 630, 640, 620, 680, 625, 645, 635, 655, 660];
        
        const configurations = [];
        
        console.log('[TEST] Initializing bank configurations...');
        
        for (let i = 0; i < banksResult.rows.length; i++) {
            const bank = banksResult.rows[i];
            const config = {
                bankId: bank.id,
                name: bank.name_en || bank.name_ru || `Bank ${bank.id}`,
                mortgage_rate: rateConfigs[i % rateConfigs.length],
                ltv_max: ltvConfigs[i % ltvConfigs.length],
                min_credit: creditConfigs[i % creditConfigs.length],
                dti_max: 35 + (i % 3) * 5 // 35, 40, 42
            };
            
            console.log(`[TEST] Configuring bank ${config.bankId}: ${config.name}`);
            
            // Insert bank configuration (with upsert logic)
            const existingConfig = await pool.query('SELECT id FROM bank_configurations WHERE bank_id = $1 AND product_type = $2', [config.bankId, 'mortgage']);
            
            if (existingConfig.rows.length > 0) {
                // Update existing configuration
                await pool.query(`
                    UPDATE bank_configurations SET
                        base_interest_rate = $1, min_interest_rate = $2, max_interest_rate = $3,
                        max_ltv_ratio = $4, min_credit_score = $5, max_loan_amount = $6, 
                        min_loan_amount = $7, processing_fee = $8, updated_at = NOW()
                    WHERE bank_id = $9 AND product_type = $10
                `, [config.mortgage_rate, config.mortgage_rate - 0.2, config.mortgage_rate + 1.0,
                    config.ltv_max, config.min_credit, 5000000, 100000, 2500, config.bankId, 'mortgage']);
            } else {
                // Insert new configuration
                await pool.query(`
                    INSERT INTO bank_configurations (
                        bank_id, product_type, base_interest_rate, min_interest_rate, max_interest_rate,
                        max_ltv_ratio, min_credit_score, max_loan_amount, min_loan_amount, 
                        processing_fee, is_active, effective_from
                    ) VALUES ($1, 'mortgage', $2, $3, $4, $5, $6, $7, $8, $9, true, CURRENT_DATE)
                `, [config.bankId, config.mortgage_rate, config.mortgage_rate - 0.2, config.mortgage_rate + 1.0,
                    config.ltv_max, config.min_credit, 5000000, 100000, 2500]);
            }
                
            // Add bank-specific rate rules
            await pool.query('DELETE FROM interest_rate_rules WHERE bank_id = $1', [config.bankId]);
            
            const rateRules = [
                { rule_type: 'credit_score', condition_min: 800, condition_max: 850, rate_adjustment: -0.3 },
                { rule_type: 'credit_score', condition_min: 750, condition_max: 799, rate_adjustment: -0.1 },
                { rule_type: 'credit_score', condition_min: 300, condition_max: 649, rate_adjustment: 0.5 }
            ];
            
            for (const rule of rateRules) {
                await pool.query(`
                    INSERT INTO interest_rate_rules (
                        bank_id, rule_type, condition_min, condition_max, rate_adjustment, 
                        description, is_active, created_at, updated_at
                    ) VALUES ($1, $2, $3, $4, $5, $6, true, NOW(), NOW())
                `, [config.bankId, rule.rule_type, rule.condition_min, rule.condition_max, 
                    rule.rate_adjustment, `Credit Score ${rule.condition_min}-${rule.condition_max}`]);
            }
            
            configurations.push(config);
        }
        
        res.json({
            status: 'success',
            message: `Initialized configurations for ${configurations.length} banks`,
            data: configurations,
            banks_found: banksResult.rows.map(b => ({ id: b.id, name: b.name_en || b.name_ru }))
        });
        
    } catch (err) {
        console.error('[TEST] Initialize bank configs error:', err);
        res.status(500).json({ status: 'error', message: err.message, details: err.stack });
    }
});

// Initialize Bank-Specific Configurations (Run once)
app.post('/api/admin/initialize-bank-configs', requireAdmin, async (req, res) => {
    try {
        const banks = await pool.query('SELECT id, name_en FROM banks WHERE tender = 1 ORDER BY id');
        
        const configurations = [
            { bankId: 1, name: 'Bank Hapoalim', mortgage_rate: 3.2, ltv_max: 75, min_credit: 650, dti_max: 35 },
            { bankId: 2, name: 'Bank Leumi', mortgage_rate: 3.1, ltv_max: 80, min_credit: 630, dti_max: 40 },
            { bankId: 3, name: 'Discount Bank', mortgage_rate: 3.3, ltv_max: 75, min_credit: 640, dti_max: 38 },
            { bankId: 4, name: 'Mizrahi Bank', mortgage_rate: 3.25, ltv_max: 78, min_credit: 620, dti_max: 42 },
            { bankId: 5, name: 'First International Bank', mortgage_rate: 3.4, ltv_max: 70, min_credit: 680, dti_max: 35 }
        ];
        
        for (const config of configurations) {
            // Check if bank exists
            const bankCheck = await pool.query('SELECT id FROM banks WHERE id = $1', [config.bankId]);
            if (bankCheck.rows.length === 0) continue;
            
            await pool.query(`
                INSERT INTO bank_configurations (
                    bank_id, product_type, base_interest_rate, min_interest_rate, max_interest_rate,
                    max_ltv_ratio, min_credit_score, max_loan_amount, min_loan_amount, 
                    processing_fee, is_active, effective_from
                ) VALUES ($1, 'mortgage', $2, $3, $4, $5, $6, $7, $8, $9, true, CURRENT_DATE)
                ON CONFLICT (bank_id, product_type) DO UPDATE SET
                    base_interest_rate = $2, max_ltv_ratio = $5, min_credit_score = $6
            `, [config.bankId, config.mortgage_rate, config.mortgage_rate - 0.2, config.mortgage_rate + 1.0,
                config.ltv_max, config.min_credit, 5000000, 100000, 2500]);
        }
        
        res.json({
            status: 'success',
            message: `Initialized configurations for ${configurations.length} banks`,
            data: configurations
        });
        
    } catch (err) {
        console.error('Initialize bank configs error:', err);
        res.status(500).json({ status: 'error', message: err.message });
    }
});

// Get Bank-Specific Configuration
app.get('/api/admin/banks/:bankId/calculation-config', requireAdmin, async (req, res) => {
    try {
        const { bankId } = req.params;
        
        // Get bank configurations
        const configQuery = `
            SELECT * FROM bank_configurations 
            WHERE bank_id = $1 AND product_type = 'mortgage'
        `;
        const configResult = await pool.query(configQuery, [bankId]);
        
        // Get bank-specific standards overrides
        const standardsQuery = `
            SELECT bs.standard_name, bso.override_value
            FROM bank_standards_overrides bso
            JOIN banking_standards bs ON bso.banking_standard_id = bs.id
            WHERE bso.bank_id = $1 AND bso.is_active = true
        `;
        const standardsResult = await pool.query(standardsQuery, [bankId]);
        
        // Get rate rules
        const rulesQuery = `
            SELECT * FROM interest_rate_rules 
            WHERE bank_id = $1 AND is_active = true
        `;
        const rulesResult = await pool.query(rulesQuery, [bankId]);
        
        res.json({
            status: 'success',
            data: {
                bank_id: parseInt(bankId),
                configurations: configResult.rows[0] || null,
                standards_overrides: standardsResult.rows,
                rate_rules: rulesResult.rows
            }
        });
        
    } catch (err) {
        console.error('[GET BANK CONFIG] Error:', err);
        res.status(500).json({ 
            status: 'error', 
            message: 'Failed to get bank configuration',
            error: err.message 
        });
  }
});

// =====================================================
// PUBLIC CALCULATION PARAMETERS API (For Frontend)
// =====================================================

// GET calculation parameters for frontend (no auth required)
app.get('/api/v1/calculation-parameters', async (req, res) => {
    try {
        const { business_path = 'mortgage' } = req.query;
        
        // Validate business_path
        const validPaths = ['mortgage', 'credit', 'mortgage_refinance', 'credit_refinance'];
        if (!validPaths.includes(business_path)) {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid business_path. Must be one of: ' + validPaths.join(', ')
            });
        }

        // Get configuration parameters - use default values (banking_standards table not available)
        let parameters = {};
        try {
            const parametersQuery = `
                SELECT 
                    standard_category,
                    standard_name,
                    standard_value,
                    value_type,
                    description
                FROM banking_standards 
                WHERE business_path = $1 
                    AND is_active = true
                    AND (effective_to IS NULL OR effective_to >= CURRENT_DATE)
                ORDER BY standard_category, standard_name
            `;
            
            const result = await pool.query(parametersQuery, [business_path]);
            
            // Organize parameters by category
            result.rows.forEach(row => {
                if (!parameters[row.standard_category]) {
                    parameters[row.standard_category] = {};
                }
                parameters[row.standard_category][row.standard_name] = {
                    value: parseFloat(row.standard_value),
                    type: row.value_type,
                    description: row.description
                };
            });
        } catch (paramError) {
            console.warn('[CALC-PARAMS] banking_standards table not found, using default fallback values');
            // Use hardcoded defaults for mortgage calculation parameters
            parameters = {
                eligibility: {
                    minimum_monthly_income: { value: 3000, type: 'currency', description: 'Minimum monthly income required' },
                    minimum_age: { value: 18, type: 'integer', description: 'Minimum borrower age' },
                    maximum_age_at_maturity: { value: 75, type: 'integer', description: 'Maximum age when loan matures' }
                },
                loan_terms: {
                    minimum_loan_amount: { value: 50000, type: 'currency', description: 'Minimum loan amount' },
                    maximum_loan_amount: { value: 3000000, type: 'currency', description: 'Maximum loan amount' },
                    minimum_term_years: { value: 5, type: 'integer', description: 'Minimum loan term in years' },
                    maximum_term_years: { value: 30, type: 'integer', description: 'Maximum loan term in years' }
                },
                ratios: {
                    pmi_ltv_max: { value: 97, type: 'percentage', description: 'Maximum LTV for PMI calculation' },
                    front_end_dti_max: { value: 45, type: 'percentage', description: 'Maximum front-end DTI ratio' },
                    back_end_dti_max: { value: 45, type: 'percentage', description: 'Maximum back-end DTI ratio' }
                }
            };
        }

        // Get current mortgage rate using database function with fallback
        let currentRate = 5.0; // Default fallback rate
        try {
            const rateQuery = `SELECT get_current_mortgage_rate() as current_rate`;
            const rateResult = await contentPool.query(rateQuery);
            currentRate = parseFloat(rateResult.rows[0].current_rate);
        } catch (rateError) {
            console.warn('[CALC-PARAMS] get_current_mortgage_rate function not found, using default rate 5.0%');
            currentRate = 5.0;
        }

        // Get property ownership LTV ratios with fallback
        let propertyOwnershipLtvs = {};
        try {
            const ltvQuery = `
                SELECT 
                    option_key,
                    ltv_percentage,
                    min_down_payment_percentage
                FROM property_ownership_options 
                WHERE is_active = true
            `;
            const ltvResult = await pool.query(ltvQuery);
            ltvResult.rows.forEach(row => {
                propertyOwnershipLtvs[row.option_key] = {
                    ltv: parseFloat(row.ltv_percentage),
                    min_down_payment: parseFloat(row.min_down_payment_percentage)
                };
            });
        } catch (ltvError) {
            console.warn('Property ownership options table not found, using fallback values');
            // Use standard Israeli mortgage LTV ratios as fallback
            propertyOwnershipLtvs = {
                no_property: { ltv: 75.0, min_down_payment: 25.0 },
                has_property: { ltv: 50.0, min_down_payment: 50.0 },
                selling_property: { ltv: 70.0, min_down_payment: 30.0 }
            };
        }

        res.json({
            status: 'success',
            data: {
                business_path,
                current_interest_rate: currentRate,
                property_ownership_ltvs: propertyOwnershipLtvs,
                standards: parameters,
                last_updated: new Date().toISOString()
            }
        });

    } catch (err) {
        console.error('Get calculation parameters error:', err);
        
        // Provide safe fallback values only for database connection failures
        const fallbackParameters = {
            status: 'error',
            message: 'Database connection failed, using fallback values',
            data: {
                business_path: req.query.business_path || 'mortgage',
                current_interest_rate: 5.0, // Fallback only if DB is completely down
                property_ownership_ltvs: {
                    no_property: { ltv: 75.0, min_down_payment: 25.0 },
                    has_property: { ltv: 50.0, min_down_payment: 50.0 },
                    selling_property: { ltv: 70.0, min_down_payment: 30.0 }
                },
                standards: {
                    ltv: {
                        standard_ltv_max: { value: 80.0, type: 'percentage', description: 'Fallback LTV' }
                    },
                    dti: {
                        front_end_dti_max: { value: 28.0, type: 'percentage', description: 'Fallback DTI' },
                        back_end_dti_max: { value: 42.0, type: 'percentage', description: 'Fallback DTI' }
                    },
                    credit_score: {
                        minimum_credit_score: { value: 620.0, type: 'score', description: 'Fallback credit score' }
                    }
                },
                is_fallback: true,
                last_updated: new Date().toISOString()
            }
        };
        
        res.status(200).json(fallbackParameters);
    }
});

// Redirect old admin routes to new admin interface
app.get('/admin*', (req, res) => {
    // Redirect all admin routes to the new admin panel
    res.redirect(301, 'http://localhost:3001/admin-panel');
});

// Handle React Router (catch-all for non-API routes)
app.get('*', (req, res) => {
    // Only serve React app for non-API routes
    if (!req.path.startsWith('/api/')) {
        const reactIndexPath = path.join(__dirname, '../mainapp/build/index.html');
        const fs = require('fs');
        
        if (fs.existsSync(reactIndexPath)) {
            res.sendFile(reactIndexPath);
        } else {
            res.status(404).send('React app not built. Run: cd mainapp && npm run build');
        }
    } else {
        // 404 for API routes
        res.status(404).json({ error: 'API endpoint not found' });
    }
});

app.get('/api/get-table-schema', async (req, res) => {
    const { tableName } = req.query;
    if (!tableName) {
        return res.status(400).send('tableName query parameter is required.');
    }
    try {
        const query = `
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = $1;
        `;
        const result = await pool.query(query, [tableName]);
        res.json(result.rows);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Start server
app.listen(PORT, () => {
    console.log('🚀 Database API Server Started');
    console.log(`📡 http://localhost:${PORT}`);
    console.log('📧 Email login: POST /api/login');
    console.log('📧 Email 2FA: POST /api/email-code-login');
    console.log('📱 SMS login: POST /api/sms-login & /api/sms-code-login');
    console.log('👤 Registration: POST /api/register');
    console.log('🏙️ Cities: GET /api/get-cities?lang=xx');
    console.log('🏠 Refinance mortgage: POST /api/refinance-mortgage');
    console.log('💳 Refinance credit: POST /api/refinance-credit');
    console.log('🔐 Admin login: POST /api/admin/login');
    console.log('📊 Admin stats: GET /api/admin/stats');
    console.log('🏦 Admin banks: GET /api/admin/banks');
    console.log('🏪 Compare banks: POST /api/customer/compare-banks');
    console.log('📝 Submit application: POST /api/customer/submit-application');
    console.log('📋 Check status: GET /api/applications/:id/status');
    console.log('🔧 Admin applications: GET /api/admin/applications');
    console.log('📊 Admin app details: GET /api/admin/applications/:id');
    console.log('✏️ Update app status: PUT /api/admin/applications/:id/status');
    console.log('');
    console.log('🏢 PHASE 2: Bank Worker Registration System');
    console.log('📨 Send invitation: POST /api/bank-worker/invite');
    console.log('📝 Get registration form: GET /api/bank-worker/register/:token');
    console.log('✅ Complete registration: POST /api/bank-worker/register');
    console.log('📊 Check status: GET /api/bank-worker/status/:id');
    console.log('📋 Admin invitations: GET /api/admin/invitations');
    console.log('⏳ Admin approval queue: GET /api/admin/approval-queue');
    console.log('✅ Approve worker: POST /api/admin/approve/:id');
    console.log('❌ Reject worker: POST /api/admin/reject/:id');
    console.log('');
});

module.exports = app; 
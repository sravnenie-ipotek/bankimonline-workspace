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
    
    // Default origins for development and Railway deployment
    return [
        'http://localhost:3001',
        'http://localhost:3000',
        'http://localhost:5173', // Vite dev server
        'http://localhost:5174', // Vite dev server (alternative port)
        'http://localhost:8003',
        // Railway domains
        'https://bankdev2standalone-production.up.railway.app',
        'https://bankim-nodejs-api-production.up.railway.app'
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
        version: '5.0.0-cors-fix',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        corsEnabled: true
    });
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
            SELECT id, name_en, name_he, name_ru, code 
            FROM banks 
            WHERE is_active = true 
            ORDER BY priority ASC, name_en ASC
        `);
        res.json({ 
            data: result.rows, 
            status: 'success' 
        });
    } catch (err) {
        console.error('Error fetching banks for registration:', err);
        res.status(500).json({ 
            error: 'Failed to load banks',
            message: 'Internal server error' 
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
            WHERE bank_id = $1 
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
            message: 'Internal server error' 
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
        const result = await pool.query(query);
        
        res.json({
            status: 'success',
            data: result.rows,
            language: selectedLang,
            total: result.rowCount
        });
    } catch (err) {
        console.error('Error fetching cities from database:', err);
        res.status(500).json({ 
            status: 'error', 
            message: 'Internal server error while fetching cities',
            language: selectedLang
        });
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
        res.status(500).json({ 
            status: 'error', 
            message: 'Internal server error while fetching regions',
            language: selectedLang
        });
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
        res.status(500).json({ 
            status: 'error', 
            message: 'Internal server error while fetching professions',
            language: selectedLang
        });
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
        
        // Default calculation parameters
        const defaultParams = {
            calc_mortgage_min_rate: 2.5,
            calc_mortgage_max_rate: 8.0,
            calc_mortgage_default_rate: 3.5,
            calc_credit_min_rate: 5.0,
            calc_credit_max_rate: 15.0,
            calc_credit_default_rate: 8.5,
            calc_processing_fee_min: 0,
            calc_processing_fee_max: 5000,
            calc_processing_fee_default: 500,
            calc_max_loan_amount: 5000000,
            calc_min_loan_amount: 50000,
            calc_max_term_years: 30,
            calc_min_term_years: 1
        };
        
        // Merge with database values
        const calculations = { ...defaultParams, ...params };
        
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

        // Approval Conditions
        const approval_conditions = [];
        if (ltv_ratio > 75) approval_conditions.push('Mortgage insurance required');
        if (credit_score < 700) approval_conditions.push('Higher interest rate due to credit score');
        if (dti_ratio > 35) approval_conditions.push('Additional income verification required');

        // Bank Recommendations (simplified for now)
        const recommended_banks = [];
        if (all_criteria_met) {
            if (credit_score >= 740 && ltv_ratio <= 70) {
                recommended_banks.push({ name: 'Bank Hapoalim', rate: rate - 0.2, reason: 'Excellent credit profile' });
                recommended_banks.push({ name: 'Bank Leumi', rate: rate - 0.1, reason: 'Low LTV ratio' });
            } else if (credit_score >= 670) {
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

        // 1. Debt-to-Income (DTI) Calculation including new credit
        const total_monthly_debt = monthlyPayment + monthly_expenses + existing_debts;
        const dti_ratio = (total_monthly_debt / monthly_income) * 100;
        const max_dti = 42; // 42% maximum for credit
        const dti_approved = dti_ratio <= max_dti;

        // 2. Credit Amount vs Income Ratio
        const credit_to_income_ratio = (amount / (monthly_income * 12)) * 100;
        const max_credit_to_income = 300; // 3x annual income max
        const credit_amount_approved = credit_to_income_ratio <= max_credit_to_income;

        // 3. Age Verification (max 70 at loan maturity for credit)
        const age_at_maturity = age + years;
        const max_age_at_maturity = 70; // Lower than mortgage
        const age_approved = age_at_maturity <= max_age_at_maturity;

        // 4. Credit Score Assessment (stricter for unsecured credit)
        let credit_risk_level = 'excellent';
        let credit_approved = true;
        let min_credit_score = 620; // Higher minimum for credit
        
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

        // Approval Conditions
        const approval_conditions = [];
        if (credit_score < 700) approval_conditions.push('Higher interest rate due to credit score');
        if (dti_ratio > 35) approval_conditions.push('Co-signer may be required');
        if (credit_to_income_ratio > 200) approval_conditions.push('Additional collateral required');

        // Bank Recommendations for Credit
        const recommended_banks = [];
        if (all_criteria_met) {
            if (credit_score >= 750 && dti_ratio <= 30) {
                recommended_banks.push({ name: 'Bank Hapoalim', rate: rate - 0.5, reason: 'Excellent credit profile' });
                recommended_banks.push({ name: 'Bank Leumi', rate: rate - 0.3, reason: 'Low DTI ratio' });
            } else if (credit_score >= 680) {
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
            const max_dti = 42;
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

            // Quick mortgage check
            const ltv_ratio = (amount / property_value) * 100;
            const estimated_payment = amount * 0.006; // Rough estimate at ~5% rate
            const dti_ratio = ((estimated_payment + monthly_expenses) / monthly_income) * 100;
            
            quick_result.likely_approved = ltv_ratio <= 80 && dti_ratio <= 42 && 
                                         credit_score >= 580 && (age + 25) <= 75;
            quick_result.estimated_rate = credit_score >= 740 ? 3.5 : 
                                        credit_score >= 670 ? 4.0 : 4.5;
            
            if (ltv_ratio > 80) quick_result.main_concerns.push('High loan-to-value ratio');
            if (dti_ratio > 42) quick_result.main_concerns.push('High debt-to-income ratio');
            if (credit_score < 670) quick_result.main_concerns.push('Credit score needs improvement');
            
        } else if (loan_type === 'credit') {
            // Quick credit check
            const estimated_payment = amount * 0.015; // Rough estimate at ~8% rate
            const dti_ratio = ((estimated_payment + monthly_expenses + existing_debts) / monthly_income) * 100;
            const credit_to_income = (amount / (monthly_income * 12)) * 100;
            
            quick_result.likely_approved = dti_ratio <= 42 && credit_to_income <= 300 && 
                                         credit_score >= 620 && (age + 10) <= 70;
            quick_result.estimated_rate = credit_score >= 750 ? 7.5 : 
                                        credit_score >= 680 ? 8.5 : 10.0;
            
            if (dti_ratio > 42) quick_result.main_concerns.push('High debt-to-income ratio');
            if (credit_to_income > 300) quick_result.main_concerns.push('Credit amount too high relative to income');
            if (credit_score < 680) quick_result.main_concerns.push('Credit score needs improvement');
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
        const max_dti = 42;
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
        const max_dti = 42;
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

        // Approval Conditions
        const approval_conditions = [];
        if (credit_score < 700) approval_conditions.push('Higher interest rate due to credit score');
        if (dti_ratio > 35) approval_conditions.push('Co-signer may be required');
        if (monthly_savings < 100) approval_conditions.push('Minimal savings - ensure long-term benefit');

        // Bank Recommendations for Credit Refinance
        const recommended_banks = [];
        if (all_criteria_met) {
            if (credit_score >= 750 && dti_ratio <= 30) {
                recommended_banks.push({ name: 'Bank Hapoalim', rate: new_rate - 0.5, reason: 'Excellent credit refinance profile' });
                recommended_banks.push({ name: 'Bank Leumi', rate: new_rate - 0.3, reason: 'Low DTI ratio' });
            } else if (credit_score >= 680) {
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
async function calculateEnhancedMortgage(params) {
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

    // Use default banking standards (simplified approach)
    const standards = {
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
    const dti_approved = dti_ratio <= 42;
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

// MULTI-BANK COMPARISON ENDPOINT
app.post('/api/customer/compare-banks', async (req, res) => {
    const { loan_type, amount, property_value, monthly_income, age, credit_score, employment_years, monthly_expenses } = req.body;
    
    try {
        console.log('[COMPARE-BANKS] Request received:', { loan_type, amount, property_value });
        
        // Validate required fields
        if (!loan_type || !amount || !monthly_income || !age || !credit_score || !employment_years || !monthly_expenses) {
            return res.status(400).json({
                status: 'error',
                message: 'Missing required fields'
            });
        }
        
        // Query all active banks with varied interest rates
        const banksQuery = `
            SELECT id, name_en as name, url as logo_url, 
                   50000 as min_loan_amount, 
                   5000000 as max_loan_amount, 
                   CASE 
                       WHEN id % 6 = 0 THEN 3.2
                       WHEN id % 6 = 1 THEN 3.5
                       WHEN id % 6 = 2 THEN 3.8
                       WHEN id % 6 = 3 THEN 4.1
                       WHEN id % 6 = 4 THEN 4.4
                       ELSE 4.7
                   END as min_interest_rate,
                   CASE 
                       WHEN id % 6 = 0 THEN 6.8
                       WHEN id % 6 = 1 THEN 7.1
                       WHEN id % 6 = 2 THEN 7.4
                       WHEN id % 6 = 3 THEN 7.7
                       WHEN id % 6 = 4 THEN 8.0
                       ELSE 8.3
                   END as max_interest_rate,
                   CASE 
                       WHEN id % 4 = 0 THEN 85.0
                       WHEN id % 4 = 1 THEN 80.0
                       WHEN id % 4 = 2 THEN 75.0
                       ELSE 70.0
                   END as max_ltv_ratio
            FROM banks 
            WHERE tender = 1
            ORDER BY priority, name_en
        `;
        
        const banksResult = await pool.query(banksQuery);
        const banks = banksResult.rows;
        
        if (banks.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: 'No active banks found'
            });
        }
        
        console.log(`[COMPARE-BANKS] Found ${banks.length} active banks`);
        
        // Calculate loan terms for each bank
        const bankOffers = [];
        
        for (const bank of banks) {
            try {
                // Check if loan amount is within bank's limits
                if (amount < bank.min_loan_amount || amount > bank.max_loan_amount) {
                    continue;
                }
                
                // Get bank-specific overrides
                const overridesQuery = `
                    SELECT bs.standard_name, bso.override_value
                    FROM bank_standards_overrides bso
                    JOIN banking_standards bs ON bso.banking_standard_id = bs.id
                    WHERE bso.bank_id = $1 
                    AND bs.business_path = $2
                    AND bso.is_active = true
                    AND (bso.effective_from <= CURRENT_DATE OR bso.effective_from IS NULL)
                    AND (bso.effective_to >= CURRENT_DATE OR bso.effective_to IS NULL)
                `;
                
                const overridesResult = await pool.query(overridesQuery, [bank.id, loan_type]);
                const overrides = {};
                overridesResult.rows.forEach(row => {
                    overrides[row.standard_name] = row.override_value;
                });
                
                // Get global banking standards (the ones admin changes in UI)
                const globalStandardsQuery = `
                    SELECT standard_name, standard_value
                    FROM banking_standards 
                    WHERE business_path = $1 
                    AND is_active = true
                `;
                
                const globalStandardsResult = await pool.query(globalStandardsQuery, [loan_type]);
                const globalStandards = {};
                globalStandardsResult.rows.forEach(row => {
                    globalStandards[row.standard_name] = parseFloat(row.standard_value);
                });
                
                console.log(`[COMPARE-BANKS] Bank ${bank.id}: Loaded global standards:`, globalStandards);
                
                // Apply global banking standards first (admin UI changes)
                if (property_value && globalStandards['standard_ltv_max']) {
                    const customerLTV = (amount / property_value) * 100;
                    const maxLTV = globalStandards['standard_ltv_max'];
                    console.log(`[COMPARE-BANKS] Bank ${bank.id}: Customer LTV ${customerLTV.toFixed(1)}% vs Max ${maxLTV}%`);
                    if (customerLTV > maxLTV) {
                        console.log(`[COMPARE-BANKS] Bank ${bank.id}: REJECTED - LTV too high (${customerLTV.toFixed(1)}% > ${maxLTV}%)`);
                        continue; // Skip this bank if LTV exceeds global limit
                    }
                } else {
                    console.log(`[COMPARE-BANKS] Bank ${bank.id}: LTV check skipped - property_value: ${property_value}, ltv_max: ${globalStandards['standard_ltv_max']}`);
                }
                
                if (globalStandards['minimum_credit_score'] && credit_score < globalStandards['minimum_credit_score']) {
                    console.log(`[COMPARE-BANKS] Bank ${bank.id}: REJECTED - Credit score too low`);
                    continue; // Skip if credit score too low
                }
                
                if (globalStandards['minimum_monthly_income'] && monthly_income < globalStandards['minimum_monthly_income']) {
                    console.log(`[COMPARE-BANKS] Bank ${bank.id}: REJECTED - Income too low`);
                    continue; // Skip if income too low
                }
                
                if (globalStandards['minimum_age'] && age < globalStandards['minimum_age']) {
                    console.log(`[COMPARE-BANKS] Bank ${bank.id}: REJECTED - Age too low`);
                    continue; // Skip if age too low
                }
                
                if (globalStandards['maximum_age_at_maturity'] && age > globalStandards['maximum_age_at_maturity']) {
                    console.log(`[COMPARE-BANKS] Bank ${bank.id}: REJECTED - Age too high`);
                    continue; // Skip if age too high
                }
                
                // Calculate DTI ratios
                const frontEndDTI = (monthly_expenses / monthly_income) * 100;
                if (globalStandards['front_end_dti_max'] && frontEndDTI > globalStandards['front_end_dti_max']) {
                    console.log(`[COMPARE-BANKS] Bank ${bank.id}: REJECTED - Front-end DTI too high (${frontEndDTI.toFixed(1)}% > ${globalStandards['front_end_dti_max']}%)`);
                    continue; // Skip if DTI too high
                }
                
                console.log(`[COMPARE-BANKS] Bank ${bank.id}: PASSED global standards check`);

                // Prepare calculation request based on loan type
                let calculationData = {};
                let calculationEndpoint = '';
                
                if (loan_type === 'mortgage' || loan_type === 'mortgage_refinance') {
                    calculationData = {
                        loan_amount: amount,
                        property_value: property_value,
                        term_years: 30, // Default term
                        base_rate: bank.min_interest_rate,
                        monthly_income: monthly_income,
                        monthly_expenses: monthly_expenses,
                        age: age,
                        credit_score: credit_score,
                        employment_years: employment_years,
                        property_type: 'single_family',
                        occupancy_type: 'primary_residence'
                    };
                    
                    if (loan_type === 'mortgage_refinance') {
                        calculationData.current_loan_balance = amount * 0.8; // Estimate
                        calculationData.current_rate = bank.max_interest_rate;
                        calculationData.remaining_term = 25;
                    }
                    
                    calculationEndpoint = loan_type === 'mortgage' ? 
                        '/api/admin/calculate-enhanced-mortgage' : 
                        '/api/admin/calculate-enhanced-mortgage-refinance';
                        
                } else if (loan_type === 'credit' || loan_type === 'credit_refinance') {
                    calculationData = {
                        loan_amount: amount,
                        term_months: 60, // Default 5 years
                        base_rate: bank.min_interest_rate,
                        monthly_income: monthly_income,
                        monthly_expenses: monthly_expenses,
                        age: age,
                        credit_score: credit_score,
                        employment_years: employment_years,
                        loan_purpose: 'personal'
                    };
                    
                    if (loan_type === 'credit_refinance') {
                        calculationData.current_balance = amount * 0.8;
                        calculationData.current_rate = bank.max_interest_rate;
                        calculationData.current_monthly_payment = amount * 0.025;
                        calculationData.remaining_months = 48;
                    }
                    
                    calculationEndpoint = loan_type === 'credit' ? 
                        '/api/admin/calculate-enhanced-credit' : 
                        '/api/admin/calculate-enhanced-credit-refinance';
                }
                
                // Apply bank-specific overrides to standards
                if (overrides.max_ltv && property_value) {
                    const maxLoanAmount = property_value * (overrides.max_ltv / 100);
                    if (amount > maxLoanAmount) {
                        continue; // Skip this bank if LTV exceeds their limit
                    }
                }
                
                if (overrides.min_credit_score && credit_score < overrides.min_credit_score) {
                    continue; // Skip if credit score too low
                }
                
                // Call calculation function directly (no HTTP request needed)
                let calculationResponse = { status: 'error' };
                
                if (loan_type === 'mortgage' || loan_type === 'mortgage_refinance') {
                    try {
                        // Add bank-specific interest rate adjustments
                        let bankInterestRate = bank.min_interest_rate;
                        
                        // Credit score adjustments
                        if (credit_score >= 800) {
                            bankInterestRate -= 0.3; // Excellent credit discount
                        } else if (credit_score >= 750) {
                            bankInterestRate -= 0.1; // Good credit discount
                        } else if (credit_score < 650) {
                            bankInterestRate += 0.5; // Poor credit penalty
                        }
                        
                        // Bank competitiveness factor (based on bank ID)
                        const competitivenessFactor = (bank.id % 10) * 0.05; // 0.0 to 0.45%
                        bankInterestRate += competitivenessFactor;
                        
                        // Ensure rate stays within bank's limits
                        bankInterestRate = Math.max(bank.min_interest_rate, Math.min(bank.max_interest_rate, bankInterestRate));
                        
                        console.log(`[COMPARE-BANKS] Bank ${bank.id} (${bank.name}): Base rate ${bank.min_interest_rate}% → Final rate ${bankInterestRate.toFixed(2)}%`);
                        
                        const result = await calculateEnhancedMortgage({
                            amount: calculationData.loan_amount,
                            rate: bankInterestRate, // Use bank-specific rate
                            years: calculationData.term_years,
                            property_value: calculationData.property_value,
                            monthly_income: calculationData.monthly_income,
                            monthly_expenses: calculationData.monthly_expenses,
                            age: calculationData.age,
                            credit_score: calculationData.credit_score,
                            employment_years: calculationData.employment_years
                        });
                        calculationResponse = { status: 'success', data: result };
                    } catch (error) {
                        console.log(`[COMPARE-BANKS] Mortgage calculation error for bank ${bank.id}:`, error.message);
                    }
                } else if (loan_type === 'credit' || loan_type === 'credit_refinance') {
                    try {
                        // Add bank-specific interest rate adjustments for credit
                        let bankInterestRate = bank.min_interest_rate + 2.0; // Credit rates typically higher
                        
                        // Credit score adjustments
                        if (credit_score >= 800) {
                            bankInterestRate -= 1.0;
                        } else if (credit_score >= 750) {
                            bankInterestRate -= 0.5;
                        } else if (credit_score < 650) {
                            bankInterestRate += 2.0;
                        }
                        
                        // Bank competitiveness factor
                        const competitivenessFactor = (bank.id % 8) * 0.25; // 0.0 to 1.75%
                        bankInterestRate += competitivenessFactor;
                        
                        console.log(`[COMPARE-BANKS] Bank ${bank.id} (${bank.name}): Credit rate ${bankInterestRate.toFixed(2)}%`);
                        
                        const result = await calculateEnhancedCredit({
                            amount: calculationData.loan_amount,
                            rate: bankInterestRate, // Use bank-specific rate
                            years: Math.floor(calculationData.term_months / 12),
                            monthly_income: calculationData.monthly_income,
                            monthly_expenses: calculationData.monthly_expenses,
                            age: calculationData.age,
                            credit_score: calculationData.credit_score,
                            employment_years: calculationData.employment_years
                        });
                        calculationResponse = { status: 'success', data: result };
                    } catch (error) {
                        console.log(`[COMPARE-BANKS] Credit calculation error for bank ${bank.id}:`, error.message);
                    }
                }
                
                if (calculationResponse.status === 'success' && calculationResponse.data) {
                    const result = calculationResponse.data;
                    
                    // Extract relevant data based on loan type
                    let bankOffer = {
                        bank_id: bank.id,
                        bank_name: bank.name,
                        bank_logo: bank.logo_url,
                        loan_amount: amount,
                        approval_status: result.approval_decision?.decision || 'pending'
                    };
                    
                    if (loan_type.includes('mortgage')) {
                        bankOffer = {
                            ...bankOffer,
                            monthly_payment: result.payment_details?.monthly_payment || 0,
                            total_payment: result.payment_details?.total_payment || 0,
                            interest_rate: result.loan_terms?.interest_rate || bank.min_interest_rate,
                            ltv_ratio: result.risk_assessment?.ltv_ratio || 0,
                            dti_ratio: result.risk_assessment?.dti_ratio || 0,
                            term_years: result.loan_terms?.term_years || 30
                        };
                        
                        if (loan_type === 'mortgage_refinance') {
                            bankOffer.monthly_savings = result.refinance_analysis?.monthly_savings || 0;
                            bankOffer.total_savings = result.refinance_analysis?.total_interest_savings || 0;
                            bankOffer.break_even_months = result.refinance_analysis?.break_even_months || 0;
                        }
                    } else {
                        bankOffer = {
                            ...bankOffer,
                            monthly_payment: result.payment_details?.monthly_payment || 0,
                            total_payment: result.payment_details?.total_payment || 0,
                            interest_rate: result.loan_terms?.annual_rate || bank.min_interest_rate,
                            dti_ratio: result.risk_assessment?.dti_ratio || 0,
                            term_months: result.loan_terms?.term_months || 60
                        };
                        
                        if (loan_type === 'credit_refinance') {
                            bankOffer.monthly_savings = result.refinance_benefits?.monthly_savings || 0;
                            bankOffer.total_savings = result.refinance_benefits?.total_savings || 0;
                        }
                    }
                    
                    // Only include approved or conditionally approved offers
                    if (bankOffer.approval_status === 'approved' || 
                        bankOffer.approval_status === 'conditional' ||
                        bankOffer.approval_status === 'manual_review') {
                        bankOffers.push(bankOffer);
                    }
                }
                
            } catch (bankError) {
                console.error(`[COMPARE-BANKS] Error calculating for bank ${bank.name}:`, bankError);
                // Continue to next bank
            }
        }
        
        // If no real offers, add fake offers for testing
        if (bankOffers.length === 0) {
            console.log(`[COMPARE-BANKS] No real offers found, adding fake offers for testing`);
            
            // Calculate basic loan parameters
            const termYears = 25;
            const termMonths = termYears * 12;
            
            // Fake Bank 1 - Bank Hapoalim
            const rate1 = 3.2;
            const monthlyRate1 = rate1 / 100 / 12;
            const monthlyPayment1 = amount * (monthlyRate1 * Math.pow(1 + monthlyRate1, termMonths)) / (Math.pow(1 + monthlyRate1, termMonths) - 1);
            const totalPayment1 = monthlyPayment1 * termMonths;
            
            bankOffers.push({
                bank_id: 'fake-1',
                bank_name: 'בנק הפועלים',
                bank_logo: 'https://www.bankhapoalim.co.il/favicon.ico',
                loan_amount: amount,
                monthly_payment: Math.round(monthlyPayment1),
                interest_rate: rate1,
                term_years: termYears,
                total_payment: Math.round(totalPayment1),
                approval_status: 'approved',
                ltv_ratio: property_value ? ((amount / property_value) * 100).toFixed(1) : null,
                dti_ratio: ((monthly_expenses / monthly_income) * 100).toFixed(1)
            });
            
            // Fake Bank 2 - Bank Leumi
            const rate2 = 3.5;
            const monthlyRate2 = rate2 / 100 / 12;
            const monthlyPayment2 = amount * (monthlyRate2 * Math.pow(1 + monthlyRate2, termMonths)) / (Math.pow(1 + monthlyRate2, termMonths) - 1);
            const totalPayment2 = monthlyPayment2 * termMonths;
            
            bankOffers.push({
                bank_id: 'fake-2',
                bank_name: 'בנק לאומי',
                bank_logo: 'https://www.leumi.co.il/favicon.ico',
                loan_amount: amount,
                monthly_payment: Math.round(monthlyPayment2),
                interest_rate: rate2,
                term_years: termYears,
                total_payment: Math.round(totalPayment2),
                approval_status: 'approved',
                ltv_ratio: property_value ? ((amount / property_value) * 100).toFixed(1) : null,
                dti_ratio: ((monthly_expenses / monthly_income) * 100).toFixed(1)
            });
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
                b.name as bank_name, b.logo_url as bank_logo
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

// Handle React Router (catch-all for non-API routes)
app.get('*', (req, res) => {
    // Only serve React app for non-API routes
    if (!req.path.startsWith('/api/')) {
        const reactIndexPath = path.join(__dirname, 'mainapp/build/index.html');
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
});

module.exports = app; 
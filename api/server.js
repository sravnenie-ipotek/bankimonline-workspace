const express = require('express');
const cors = require('cors');

// Create Express app
const app = express();

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
        message: 'Bankimonline Mock API Server',
        version: '2.0.0',
        status: 'running',
        node_version: process.version
    });
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        service: 'Bankimonline API',
        timestamp: new Date().toISOString(),
        version: '2.0.0'
    });
});

// App parameters endpoint
app.get('/v1/params', (req, res) => {
    res.json({
        data: {
            app_name: 'Bankimonline',
            app_version: '1.0.0',
            api_version: 'v1',
            environment: 'development',
            features: {
                registration: true,
                calculator: true,
                hr_system: true,
                admin_panel: true
            },
            settings: {
                max_file_size: '10MB',
                supported_languages: ['ru', 'en'],
                default_language: 'ru'
            }
        },
        status: 'success'
    });
});

// Simplified params endpoint
app.get('/params', (req, res) => {
    res.json({
        data: {
            app_name: 'Bankimonline',
            working: true
        },
        status: 'success'
    });
});

// Pages endpoint
app.get('/v1/pages', (req, res) => {
    res.json({
        data: [
            { id: 1, slug: 'home', title: 'Главная', url: '/' },
            { id: 2, slug: 'about', title: 'О нас', url: '/about' },
            { id: 3, slug: 'services', title: 'Услуги', url: '/services' },
            { id: 4, slug: 'calculator', title: 'Калькулятор', url: '/calculator' },
            { id: 5, slug: 'contact', title: 'Контакты', url: '/contact' }
        ],
        status: 'success'
    });
});

// Locales endpoints
app.get(['/v1/locales', '/locales'], (req, res) => {
    res.json({
        data: {
            ru: 'Русский',
            en: 'English'
        },
        status: 'success'
    });
});

// Banks endpoints
app.get(['/v1/banks', '/banks'], (req, res) => {
    res.json({
        data: [
            { id: 1, name: 'Сбербанк', code: 'sberbank' },
            { id: 2, name: 'ВТБ', code: 'vtb' },
            { id: 3, name: 'Альфа-Банк', code: 'alfabank' },
            { id: 4, name: 'Газпромбанк', code: 'gazprombank' }
        ],
        status: 'success'
    });
});

// Cities endpoint
app.get('/v1/cities', (req, res) => {
    res.json({
        data: [
            { id: 1, name: 'Москва', region: 'Московская область' },
            { id: 2, name: 'Санкт-Петербург', region: 'Ленинградская область' },
            { id: 3, name: 'Новосибирск', region: 'Новосибирская область' },
            { id: 4, name: 'Екатеринбург', region: 'Свердловская область' }
        ],
        status: 'success'
    });
});

// Get cities with language support
app.get('/get-cities', (req, res) => {
    const lang = req.query.lang || 'en';
    let cities_data;

    switch(lang) {
        case 'en':
            cities_data = [
                'United States', 'Canada', 'United Kingdom', 'Germany',
                'France', 'Spain', 'Italy', 'Netherlands', 'Sweden', 'Norway'
            ];
            break;
        case 'he':
            cities_data = [
                'ישראל', 'ארצות הברית', 'קנדה', 'בריטניה', 'גרמניה',
                'צרפת', 'ספרד', 'איטליה', 'הולנד', 'שוודיה'
            ];
            break;
        default: // Russian
            cities_data = [
                'Россия', 'США', 'Канада', 'Великобритания', 'Германия',
                'Франция', 'Испания', 'Италия', 'Нидерланды', 'Швеция'
            ];
    }

    res.json({
        data: cities_data,
        status: 'success',
        language: lang
    });
});

// Users endpoint
app.get('/users', (req, res) => {
    res.json({
        data: {
            user_id: 1,
            name: 'Test User',
            notices: []
        },
        status: 'success'
    });
});

// User params endpoint
app.get('/user_params', (req, res) => {
    res.json({
        data: {
            theme: 'light',
            language: 'ru'
        },
        status: 'success'
    });
});

// Mock POST endpoints for login
app.post('/sms-password-login', (req, res) => {
    console.log('[MOCK API] SMS password login request:', req.body);
    res.json({
        status: 'success',
        message: 'SMS sent successfully',
        data: {
            phone: req.body.phone || '+1234567890',
            code_sent: true
        }
    });
});

app.post('/sms-code-login', (req, res) => {
    console.log('[MOCK API] SMS code login request:', req.body);
    res.json({
        status: 'success',
        message: 'Login successful',
        data: {
            token: 'mock-jwt-token-' + Date.now(),
            user: {
                id: 1,
                name: 'Test User',
                phone: req.body.phone || '+1234567890'
            }
        }
    });
});

// Generic POST handler
app.post('*', (req, res) => {
    console.log('[MOCK API] POST request to:', req.path);
    res.json({
        message: 'POST request received',
        status: 'success',
        note: 'This is a mock response',
        path: req.path,
        body: req.body
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Endpoint not found',
        message: `The endpoint ${req.path} is not implemented in the mock server`,
        available_endpoints: [
            '/health',
            '/v1/params',
            '/v1/pages',
            '/v1/locales',
            '/v1/banks',
            '/v1/cities',
            '/get-cities?lang=en',
            '/sms-password-login',
            '/sms-code-login',
            '/params',
            '/locales',
            '/banks',
            '/users',
            '/user_params'
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

// Export for Vercel
module.exports = app;
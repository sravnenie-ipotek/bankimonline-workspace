#!/usr/bin/env node
/**
 * Bankimonline Mock API Server - Node.js Version
 * Consolidates all Python mock servers into a single Node.js application
 * 
 * Features:
 * - Mock API endpoints (port 8003)
 * - Proxy functionality for backend.bankimonline.com
 * - CORS support
 * - Comprehensive logging
 */

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { createProxyMiddleware } = require('http-proxy-middleware');

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
app.use(morgan('dev'));

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
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        service: 'Bankimonline API',
        timestamp: new Date().toISOString(),
        version: '2.0.0'
    });
});

// App parameters endpoint
app.get('/api/v1/params', (req, res) => {
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

// Simplified params endpoint (from start-port80-api.py)
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
app.get('/api/v1/pages', (req, res) => {
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
app.get(['/api/v1/locales', '/locales'], (req, res) => {
    res.json({
        data: {
            ru: 'Русский',
            en: 'English'
        },
        status: 'success'
    });
});

// Banks endpoints
app.get(['/api/v1/banks', '/banks'], (req, res) => {
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
app.get('/api/v1/cities', (req, res) => {
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
app.get('/api/get-cities', (req, res) => {
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

// Users endpoint (from start-port80-api.py)
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

// User params endpoint (from start-port80-api.py)
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
app.post('/api/sms-password-login', (req, res) => {
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

app.post('/api/sms-code-login', (req, res) => {
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
            '/api/health',
            '/api/v1/params',
            '/api/v1/pages',
            '/api/v1/locales',
            '/api/v1/banks',
            '/api/v1/cities',
            '/api/get-cities?lang=en',
            '/api/sms-password-login',
            '/api/sms-code-login',
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

// Proxy server functionality (optional - can be enabled with --proxy flag)
function createProxyServer(targetPort) {
    const proxyApp = express();
    
    proxyApp.use('/', createProxyMiddleware({
        target: `http://localhost:${targetPort}`,
        changeOrigin: true,
        onError: (err, req, res) => {
            console.error('[PROXY ERROR]', err);
            res.status(503).json({
                error: 'Proxy error: Backend not available',
                message: `Make sure the backend is running on http://localhost:${targetPort}`
            });
        },
        onProxyReq: (proxyReq, req, res) => {
            console.log(`[PROXY] ${req.method} ${req.path} -> http://localhost:${targetPort}${req.path}`);
        }
    }));
    
    return proxyApp;
}

// Start server
const PORT = process.env.PORT || 8003;
const PROXY_PORT = process.env.PROXY_PORT || 8443;
const enableProxy = process.argv.includes('--proxy');

console.log('='.repeat(60));
console.log('  Bankimonline Mock API Server (Node.js)');
console.log('='.repeat(60));

// Start main API server
app.listen(PORT, () => {
    console.log(`  Mock API listening on: http://localhost:${PORT}`);
    console.log('  Available endpoints:');
    console.log('    GET  /api/health');
    console.log('    GET  /api/v1/params');
    console.log('    GET  /api/v1/pages');
    console.log('    GET  /api/v1/locales');
    console.log('    GET  /api/v1/banks');
    console.log('    GET  /api/v1/cities');
    console.log('    GET  /api/get-cities?lang=en');
    console.log('    POST /api/sms-password-login');
    console.log('    POST /api/sms-code-login');
    console.log('='.repeat(60));
});

// Start proxy server if enabled
if (enableProxy) {
    const proxyApp = createProxyServer(PORT);
    proxyApp.listen(PROXY_PORT, () => {
        console.log(`  Proxy server listening on: http://localhost:${PROXY_PORT}`);
        console.log(`  Proxying to: http://localhost:${PORT}`);
        console.log('='.repeat(60));
        console.log('  Add this to your hosts file:');
        console.log('  127.0.0.1 backend.bankimonline.com');
        console.log('='.repeat(60));
    });
}

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\nShutting down servers...');
    process.exit(0);
});
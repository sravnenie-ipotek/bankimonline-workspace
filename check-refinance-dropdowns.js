const { Client } = require('pg');
const http = require('http');
require('dotenv').config();

async function checkRefinanceDropdowns() {
    const contentClient = new Client({
        connectionString: process.env.CONTENT_DATABASE_URL
    });

    console.log('🔍 Checking Refinance Mortgage Dropdown Configuration\n');
    console.log('=' .repeat(60));

    try {
        await contentClient.connect();
        
        // 1. Check content items for refinance mortgage
        console.log('\n📋 1. Content Items for refinance_step1:');
        const contentItems = await contentClient.query(`
            SELECT content_key, component_type, category
            FROM content_items
            WHERE screen_location = 'refinance_step1'
            ORDER BY content_key
        `);
        
        console.log(`Found ${contentItems.rows.length} content items`);
        if (contentItems.rows.length > 0) {
            contentItems.rows.forEach(row => {
                console.log(`  - ${row.content_key} (${row.component_type})`);
            });
        }
        
        // 2. Check for specific dropdown-related content
        console.log('\n📋 2. Dropdown Labels and Placeholders:');
        const dropdownKeys = [
            'mortgage_refinance_why',
            'mortgage_refinance_type', 
            'mortgage_refinance_registered',
            'mortgage_refinance_bank',
            'app.refinance.step1.why_label',
            'app.refinance.step1.property_type_label',
            'app.refinance.step1.registered_label',
            'app.refinance.step1.current_bank_label'
        ];
        
        for (const key of dropdownKeys) {
            const result = await contentClient.query(`
                SELECT ci.content_key, ct.content_value, ct.language_code
                FROM content_items ci
                LEFT JOIN content_translations ct ON ci.id = ct.content_item_id
                WHERE ci.content_key = $1 AND ct.language_code = 'en'
            `, [key]);
            
            if (result.rows.length > 0) {
                console.log(`  ✅ ${key}: "${result.rows[0].content_value}"`);
            } else {
                console.log(`  ❌ ${key}: NOT FOUND`);
            }
        }
        
        // 3. Check API response
        console.log('\n📋 3. Testing API Endpoints:');
        
        // Test content API
        await testApiEndpoint('/api/content/refinance_step1/en', 'Content API');
        
        // Test dropdown API
        await testApiEndpoint('/api/dropdowns/refinance_step1/en', 'Dropdown API');
        
        // Test specific dropdown fields
        const dropdownFields = ['why', 'property_type', 'registration', 'bank'];
        for (const field of dropdownFields) {
            await testApiEndpoint(`/api/v1/dropdowns?screen=refinance_step1&field=${field}&language=en`, `Dropdown ${field}`);
        }
        
        // 4. Check translation.json fallback
        console.log('\n📋 4. Translation.json Fallback Keys:');
        const fs = require('fs');
        const translationPath = 'mainapp/public/locales/en/translation.json';
        
        if (fs.existsSync(translationPath)) {
            const translations = JSON.parse(fs.readFileSync(translationPath, 'utf8'));
            const fallbackKeys = [
                'mortgage_refinance_why',
                'mortgage_refinance_why_ph',
                'mortgage_refinance_type',
                'mortgage_refinance_bank',
                'mortgage_refinance_registered',
                'app.refinance.step1.why_label',
                'app.refinance.step1.property_type_label',
                'app.refinance.step1.registered_label',
                'app.refinance.step1.current_bank_label'
            ];
            
            fallbackKeys.forEach(key => {
                const value = translations[key] || translations[key.replace(/\./g, '_')];
                if (value) {
                    console.log(`  ✅ ${key}: "${value}"`);
                } else {
                    console.log(`  ❌ ${key}: NOT FOUND`);
                }
            });
        }
        
        // 5. Generate fix SQL
        console.log('\n📋 5. Fix SQL for Missing Content:');
        console.log('```sql');
        console.log('-- Run this in content database to fix missing labels');
        console.log(`
INSERT INTO content_items (content_key, screen_location, component_type, category) VALUES
('mortgage_refinance_why', 'refinance_step1', 'label', 'dropdown'),
('mortgage_refinance_why_ph', 'refinance_step1', 'placeholder', 'dropdown'),
('mortgage_refinance_type', 'refinance_step1', 'label', 'dropdown'),
('mortgage_refinance_type_ph', 'refinance_step1', 'placeholder', 'dropdown'),
('mortgage_refinance_registered', 'refinance_step1', 'label', 'dropdown'),
('mortgage_refinance_registered_ph', 'refinance_step1', 'placeholder', 'dropdown'),
('mortgage_refinance_bank', 'refinance_step1', 'label', 'dropdown'),
('mortgage_refinance_bank_ph', 'refinance_step1', 'placeholder', 'dropdown')
ON CONFLICT (content_key) DO NOTHING;

-- Add English translations
INSERT INTO content_translations (content_item_id, language_code, content_value, status) VALUES
((SELECT id FROM content_items WHERE content_key = 'mortgage_refinance_why'), 'en', 'Why are you refinancing?', 'approved'),
((SELECT id FROM content_items WHERE content_key = 'mortgage_refinance_why_ph'), 'en', 'Select reason for refinancing', 'approved'),
((SELECT id FROM content_items WHERE content_key = 'mortgage_refinance_type'), 'en', 'Property Type', 'approved'),
((SELECT id FROM content_items WHERE content_key = 'mortgage_refinance_type_ph'), 'en', 'Select property type', 'approved'),
((SELECT id FROM content_items WHERE content_key = 'mortgage_refinance_registered'), 'en', 'Property Registration', 'approved'),
((SELECT id FROM content_items WHERE content_key = 'mortgage_refinance_registered_ph'), 'en', 'Select registration status', 'approved'),
((SELECT id FROM content_items WHERE content_key = 'mortgage_refinance_bank'), 'en', 'Current Bank', 'approved'),
((SELECT id FROM content_items WHERE content_key = 'mortgage_refinance_bank_ph'), 'en', 'Select your current bank', 'approved')
ON CONFLICT (content_item_id, language_code) DO UPDATE SET content_value = EXCLUDED.content_value;
        `);
        console.log('```');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await contentClient.end();
    }
}

async function testApiEndpoint(path, name) {
    return new Promise((resolve) => {
        const options = {
            hostname: 'localhost',
            port: 8003,
            path: path,
            method: 'GET'
        };
        
        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    if (json.status === 'success' || json.dropdowns || json.content) {
                        const count = json.content_count || json.dropdowns?.length || Object.keys(json.content || {}).length || 0;
                        console.log(`  ✅ ${name}: ${count} items`);
                    } else {
                        console.log(`  ⚠️ ${name}: ${json.status || 'Unknown status'}`);
                    }
                } catch (e) {
                    console.log(`  ❌ ${name}: Failed to parse response`);
                }
                resolve();
            });
        });
        
        req.on('error', (err) => {
            console.log(`  ❌ ${name}: ${err.message}`);
            resolve();
        });
        
        req.setTimeout(5000, () => {
            req.destroy();
            console.log(`  ❌ ${name}: Timeout`);
            resolve();
        });
        
        req.end();
    });
}

checkRefinanceDropdowns();
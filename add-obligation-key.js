const { Pool } = require('pg');

const contentPool = new Pool({
    connectionString: process.env.CONTENT_DATABASE_URL || process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL || 'postgresql://postgres:lgqPEzvVbSCviTybKqMbzJkYvOUetJjt@maglev.proxy.rlwy.net:43809/railway'
});

async function addObligationKey() {
    try {
        // Check if key already exists
        const checkResult = await contentPool.query(
            'SELECT id FROM content_items WHERE key = $1',
            ['obligation']
        );
        
        if (checkResult.rows.length > 0) {
            console.log('✅ Key obligation already exists in database');
            await contentPool.end();
            return;
        }
        
        // Insert content item
        const insertResult = await contentPool.query(
            `INSERT INTO content_items (key, screen_location, component_type, category, status) 
             VALUES ($1, $2, $3, $4, 'active') 
             RETURNING id`,
            ['obligation', 'mortgage_step3', 'modal_title', 'mortgage']
        );
        
        const contentItemId = insertResult.rows[0].id;
        
        // Add translations
        const translations = {
            en: 'Obligation',
            he: 'התחייבות',
            ru: 'Обязательство'
        };
        
        for (const [lang, value] of Object.entries(translations)) {
            await contentPool.query(
                `INSERT INTO content_translations (content_item_id, language_code, value, status)
                 VALUES ($1, $2, $3, 'approved')`,
                [contentItemId, lang, value]
            );
        }
        
        console.log('✅ Added obligation key to content database');
        
        await contentPool.end();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

addObligationKey();
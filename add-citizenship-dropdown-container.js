const { Pool } = require('pg');
require('dotenv').config();

const contentPool = new Pool({
    connectionString: process.env.CONTENT_DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function addCitizenshipDropdownContainer() {
    const client = await contentPool.connect();
    
    try {
        await client.query('BEGIN');
        console.log('Adding citizenship dropdown container to database...\n');
        
        // Check if dropdown container already exists
        const existingContainer = await client.query(
            'SELECT id FROM content_items WHERE content_key = $1',
            ['calculate_mortgage_citizenship_dropdown']
        );
        
        let containerId;
        
        if (existingContainer.rows.length === 0) {
            // Insert dropdown container
            const containerResult = await client.query(`
                INSERT INTO content_items (
                    content_key,
                    content_type,
                    category,
                    screen_location,
                    component_type,
                    description,
                    is_active,
                    created_at,
                    updated_at
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
                RETURNING id
            `, [
                'calculate_mortgage_citizenship_dropdown',
                'text',
                'form',
                'mortgage_step2',
                'dropdown',
                'Citizenship dropdown container for new options',
                true
            ]);
            
            containerId = containerResult.rows[0].id;
            console.log('✅ Created citizenship dropdown container');
        } else {
            containerId = existingContainer.rows[0].id;
            console.log('⏭️  Citizenship dropdown container already exists');
        }
        
        // Add translations for the dropdown container
        const translations = [
            { lang: 'en', value: 'Select citizenship' },
            { lang: 'he', value: 'בחר אזרחות' },
            { lang: 'ru', value: 'Выберите гражданство' }
        ];
        
        for (const translation of translations) {
            // Check if translation exists
            const existingTranslation = await client.query(
                'SELECT id FROM content_translations WHERE content_item_id = $1 AND language_code = $2',
                [containerId, translation.lang]
            );
            
            if (existingTranslation.rows.length === 0) {
                await client.query(`
                    INSERT INTO content_translations (
                        content_item_id,
                        language_code,
                        content_value,
                        is_default,
                        status,
                        created_at,
                        updated_at
                    ) VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
                `, [
                    containerId,
                    translation.lang,
                    translation.value,
                    translation.lang === 'en',
                    'approved'
                ]);
                console.log(`  ✅ Added ${translation.lang} translation: ${translation.value}`);
            } else {
                console.log(`  ⏭️  Translation already exists for ${translation.lang}`);
            }
        }
        
        await client.query('COMMIT');
        console.log('\n✅ Successfully added citizenship dropdown container!');
        
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Error adding citizenship dropdown container:', error);
        throw error;
    } finally {
        client.release();
        await contentPool.end();
    }
}

addCitizenshipDropdownContainer(); 
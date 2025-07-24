const { Pool } = require('pg');
require('dotenv').config();

const contentPool = new Pool({
    connectionString: process.env.CONTENT_DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function addCitizenshipOptions() {
    const client = await contentPool.connect();
    
    try {
        await client.query('BEGIN');
        console.log('Adding citizenship dropdown options to database...\n');
        
        // Define citizenship options
        const citizenshipOptions = [
            {
                key: 'calculate_mortgage_citizenship_option_1',
                translations: {
                    en: 'Israel',
                    he: 'ישראל',
                    ru: 'Израиль'
                }
            },
            {
                key: 'calculate_mortgage_citizenship_option_2',
                translations: {
                    en: 'United States',
                    he: 'ארצות הברית',
                    ru: 'США'
                }
            },
            {
                key: 'calculate_mortgage_citizenship_option_3',
                translations: {
                    en: 'Russia',
                    he: 'רוסיה',
                    ru: 'Россия'
                }
            },
            {
                key: 'calculate_mortgage_citizenship_option_4',
                translations: {
                    en: 'Germany',
                    he: 'גרמניה',
                    ru: 'Германия'
                }
            },
            {
                key: 'calculate_mortgage_citizenship_option_5',
                translations: {
                    en: 'France',
                    he: 'צרפת',
                    ru: 'Франция'
                }
            },
            {
                key: 'calculate_mortgage_citizenship_option_6',
                translations: {
                    en: 'United Kingdom',
                    he: 'בריטניה',
                    ru: 'Великобритания'
                }
            },
            {
                key: 'calculate_mortgage_citizenship_option_7',
                translations: {
                    en: 'Canada',
                    he: 'קנדה',
                    ru: 'Канада'
                }
            },
            {
                key: 'calculate_mortgage_citizenship_option_8',
                translations: {
                    en: 'Ukraine',
                    he: 'אוקראינה',
                    ru: 'Украина'
                }
            },
            {
                key: 'calculate_mortgage_citizenship_option_9',
                translations: {
                    en: 'Other',
                    he: 'אחר',
                    ru: 'Другое'
                }
            }
        ];
        
        for (const option of citizenshipOptions) {
            // Check if content item already exists
            const existingItem = await client.query(
                'SELECT id FROM content_items WHERE content_key = $1',
                [option.key]
            );
            
            let contentItemId;
            
            if (existingItem.rows.length === 0) {
                // Insert content item
                const itemResult = await client.query(`
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
                    option.key,
                    'text',
                    'mortgage',
                    'mortgage_step2',
                    'option',
                    `Citizenship option: ${option.translations.en}`,
                    true
                ]);
                
                contentItemId = itemResult.rows[0].id;
                console.log(`✅ Created content item: ${option.key}`);
            } else {
                contentItemId = existingItem.rows[0].id;
                console.log(`⏭️  Content item already exists: ${option.key}`);
            }
            
            // Add translations
            for (const [lang, value] of Object.entries(option.translations)) {
                // Check if translation exists
                const existingTranslation = await client.query(
                    'SELECT id FROM content_translations WHERE content_item_id = $1 AND language_code = $2',
                    [contentItemId, lang]
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
                        contentItemId,
                        lang,
                        value,
                        lang === 'en',
                        'approved'
                    ]);
                    console.log(`  ✅ Added ${lang} translation: ${value}`);
                } else {
                    console.log(`  ⏭️  Translation already exists for ${lang}`);
                }
            }
        }
        
        await client.query('COMMIT');
        console.log('\n✅ Successfully added all citizenship options to database!');
        
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Error adding citizenship options:', error);
        throw error;
    } finally {
        client.release();
        await contentPool.end();
    }
}

addCitizenshipOptions();
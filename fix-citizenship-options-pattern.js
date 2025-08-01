const { Pool } = require('pg');
require('dotenv').config();

const contentPool = new Pool({
    connectionString: process.env.CONTENT_DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function fixCitizenshipOptionsPattern() {
    const client = await contentPool.connect();
    
    try {
        await client.query('BEGIN');
        console.log('Fixing citizenship options pattern to match API expectations...\n');
        
        // Define the mapping from old keys to new keys
        const keyMappings = [
            {
                oldKey: 'calculate_mortgage_citizenship_option_1',
                newKey: 'calculate_mortgage_citizenship_option_israel',
                value: 'israel'
            },
            {
                oldKey: 'calculate_mortgage_citizenship_option_2',
                newKey: 'calculate_mortgage_citizenship_option_united_states',
                value: 'united_states'
            },
            {
                oldKey: 'calculate_mortgage_citizenship_option_3',
                newKey: 'calculate_mortgage_citizenship_option_russia',
                value: 'russia'
            },
            {
                oldKey: 'calculate_mortgage_citizenship_option_4',
                newKey: 'calculate_mortgage_citizenship_option_germany',
                value: 'germany'
            },
            {
                oldKey: 'calculate_mortgage_citizenship_option_5',
                newKey: 'calculate_mortgage_citizenship_option_france',
                value: 'france'
            },
            {
                oldKey: 'calculate_mortgage_citizenship_option_6',
                newKey: 'calculate_mortgage_citizenship_option_united_kingdom',
                value: 'united_kingdom'
            },
            {
                oldKey: 'calculate_mortgage_citizenship_option_7',
                newKey: 'calculate_mortgage_citizenship_option_canada',
                value: 'canada'
            },
            {
                oldKey: 'calculate_mortgage_citizenship_option_8',
                newKey: 'calculate_mortgage_citizenship_option_ukraine',
                value: 'ukraine'
            },
            {
                oldKey: 'calculate_mortgage_citizenship_option_9',
                newKey: 'calculate_mortgage_citizenship_option_other',
                value: 'other'
            }
        ];
        
        for (const mapping of keyMappings) {
            // Check if old key exists
            const existingItem = await client.query(
                'SELECT id FROM content_items WHERE content_key = $1',
                [mapping.oldKey]
            );
            
            if (existingItem.rows.length > 0) {
                // Update the content_key to new pattern
                await client.query(
                    'UPDATE content_items SET content_key = $1, updated_at = NOW() WHERE content_key = $2',
                    [mapping.newKey, mapping.oldKey]
                );
                console.log(`✅ Updated: ${mapping.oldKey} → ${mapping.newKey}`);
            } else {
                console.log(`⏭️  Item not found: ${mapping.oldKey}`);
            }
        }
        
        await client.query('COMMIT');
        console.log('\n✅ Successfully updated citizenship options pattern!');
        
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Error updating citizenship options pattern:', error);
        throw error;
    } finally {
        client.release();
        await contentPool.end();
    }
}

fixCitizenshipOptionsPattern(); 
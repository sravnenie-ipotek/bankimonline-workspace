const { Pool } = require('pg');
require('dotenv').config();

const contentPool = new Pool({
    connectionString: process.env.CONTENT_DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function fixCitizenshipOptionsFinal() {
    const client = await contentPool.connect();
    
    try {
        await client.query('BEGIN');
        console.log('Fixing citizenship options to match API pattern expectations...\n');
        
        // Define the mapping to the correct API pattern
        const keyMappings = [
            {
                oldKey: 'calculate_mortgage_citizenship_option_israel',
                newKey: 'calculate_mortgage_citizenship_israel',
                value: 'israel'
            },
            {
                oldKey: 'calculate_mortgage_citizenship_option_united_states',
                newKey: 'calculate_mortgage_citizenship_united_states',
                value: 'united_states'
            },
            {
                oldKey: 'calculate_mortgage_citizenship_option_russia',
                newKey: 'calculate_mortgage_citizenship_russia',
                value: 'russia'
            },
            {
                oldKey: 'calculate_mortgage_citizenship_option_germany',
                newKey: 'calculate_mortgage_citizenship_germany',
                value: 'germany'
            },
            {
                oldKey: 'calculate_mortgage_citizenship_option_france',
                newKey: 'calculate_mortgage_citizenship_france',
                value: 'france'
            },
            {
                oldKey: 'calculate_mortgage_citizenship_option_united_kingdom',
                newKey: 'calculate_mortgage_citizenship_united_kingdom',
                value: 'united_kingdom'
            },
            {
                oldKey: 'calculate_mortgage_citizenship_option_canada',
                newKey: 'calculate_mortgage_citizenship_canada',
                value: 'canada'
            },
            {
                oldKey: 'calculate_mortgage_citizenship_option_ukraine',
                newKey: 'calculate_mortgage_citizenship_ukraine',
                value: 'ukraine'
            },
            {
                oldKey: 'calculate_mortgage_citizenship_option_other',
                newKey: 'calculate_mortgage_citizenship_other',
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
        console.log('\n✅ Successfully updated citizenship options to match API pattern!');
        
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Error updating citizenship options pattern:', error);
        throw error;
    } finally {
        client.release();
        await contentPool.end();
    }
}

fixCitizenshipOptionsFinal(); 
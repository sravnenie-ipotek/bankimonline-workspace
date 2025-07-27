const fs = require('fs');
const { Pool } = require('pg');

// Database connection (same as server-db.js contentPool)
const pool = new Pool({
    connectionString: process.env.CONTENT_DATABASE_URL || 
                     process.env.DATABASE_PUBLIC_URL || 
                     process.env.DATABASE_URL || 
                     'postgresql://postgres:lgqPEzvVbSCviTybKqMbzJkYvOUetJjt@maglev.proxy.rlwy.net:43809/railway',
    ssl: {
        rejectUnauthorized: false
    }
});

async function addPageNumbers() {
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');
        
        console.log('🚀 ADDING PAGE NUMBERS TO CONTENT_ITEMS TABLE');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        
        // Step 1: Add page_number column if it doesn't exist
        console.log('📋 Step 1: Adding page_number column...');
        
        const addColumnQuery = `
            ALTER TABLE content_items 
            ADD COLUMN IF NOT EXISTS page_number INTEGER;
        `;
        
        await client.query(addColumnQuery);
        console.log('✅ Column added successfully');
        
        // Step 2: Load the mapping file
        console.log('📖 Step 2: Loading page-number-mapping.json...');
        const mappingData = JSON.parse(fs.readFileSync('page-number-mapping.json', 'utf8'));
        const mappings = mappingData.mappings;
        console.log(`✅ Loaded ${mappings.length} mappings`);
        
        // Step 3: Create a lookup map for screen_location -> page_number
        const screenLocationToPageNumber = {};
        mappings.forEach(mapping => {
            screenLocationToPageNumber[mapping.screen_location] = mapping.page_number;
        });
        
        // Step 4: Update page_number for each screen_location in the database
        console.log('🔄 Step 3: Updating page numbers in database...');
        
        let updatedCount = 0;
        let errorCount = 0;
        
        for (const [screenLocation, pageNumber] of Object.entries(screenLocationToPageNumber)) {
            try {
                const updateQuery = `
                    UPDATE content_items 
                    SET page_number = $1 
                    WHERE screen_location = $2;
                `;
                
                const result = await client.query(updateQuery, [pageNumber, screenLocation]);
                
                if (result.rowCount > 0) {
                    console.log(`✅ ${screenLocation} → Page ${pageNumber} (${result.rowCount} items updated)`);
                    updatedCount += result.rowCount;
                } else {
                    console.log(`⚠️  ${screenLocation} → Page ${pageNumber} (no items found in DB)`);
                }
            } catch (error) {
                console.log(`❌ ${screenLocation} → Error: ${error.message}`);
                errorCount++;
            }
        }
        
        // Step 5: Verify the updates
        console.log('\n🔍 Step 4: Verification - Checking page number distribution...');
        
        const verificationQuery = `
            SELECT 
                screen_location,
                page_number,
                COUNT(*) as items_count
            FROM content_items 
            WHERE page_number IS NOT NULL
            GROUP BY screen_location, page_number
            ORDER BY page_number, screen_location;
        `;
        
        const verificationResult = await client.query(verificationQuery);
        
        console.log('\n📊 PAGE NUMBER DISTRIBUTION:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        
        verificationResult.rows.forEach(row => {
            console.log(`Page ${row.page_number}: ${row.screen_location} (${row.items_count} items)`);
        });
        
        // Step 6: Check for NULL page_numbers (unmapped content)
        const nullPageQuery = `
            SELECT screen_location, COUNT(*) as items_count
            FROM content_items 
            WHERE page_number IS NULL
            GROUP BY screen_location
            ORDER BY screen_location;
        `;
        
        const nullPageResult = await client.query(nullPageQuery);
        
        if (nullPageResult.rows.length > 0) {
            console.log('\n⚠️  UNMAPPED CONTENT (page_number IS NULL):');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            nullPageResult.rows.forEach(row => {
                console.log(`❌ ${row.screen_location} (${row.items_count} items) - No page number assigned`);
            });
        } else {
            console.log('\n✅ All content items have page numbers assigned!');
        }
        
        await client.query('COMMIT');
        
        // Final summary
        console.log('\n🎉 SUMMARY:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`✅ Total content items updated: ${updatedCount}`);
        console.log(`❌ Errors encountered: ${errorCount}`);
        console.log(`📊 Unique screen_locations with page numbers: ${verificationResult.rows.length}`);
        console.log(`⚠️  Unmapped screen_locations: ${nullPageResult.rows.length}`);
        
        if (errorCount === 0 && nullPageResult.rows.length === 0) {
            console.log('\n🎊 SUCCESS: All content items have been successfully numbered!');
        } else {
            console.log('\n⚠️  PARTIAL SUCCESS: Some issues remain to be resolved.');
        }
        
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Transaction failed:', error.message);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

addPageNumbers(); 
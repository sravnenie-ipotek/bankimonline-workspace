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

async function validatePageMapping() {
    try {
        // Load the mapping file
        const mappingData = JSON.parse(fs.readFileSync('page-number-mapping.json', 'utf8'));
        const mappings = mappingData.mappings;
        
        // Get all screen_locations from the mapping
        const mappedScreenLocations = mappings.map(m => m.screen_location);
        const uniqueMappedLocations = [...new Set(mappedScreenLocations)];
        
        console.log(`🔍 VALIDATION REPORT: Page Number Mapping vs Live Database`);
        console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
        console.log(`📋 Total mappings in JSON: ${mappings.length}`);
        console.log(`🎯 Unique screen_locations in mapping: ${uniqueMappedLocations.length}`);
        console.log();
        
        // Check what's actually in the database
        const dbQuery = `
            SELECT DISTINCT screen_location, COUNT(*) as content_items
            FROM content_items 
            GROUP BY screen_location 
            ORDER BY screen_location;
        `;
        
        const result = await pool.query(dbQuery);
        const dbScreenLocations = result.rows.map(row => row.screen_location);
        
        console.log(`🗄️  LIVE DATABASE SCREEN LOCATIONS (${result.rows.length} unique):`);
        console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
        result.rows.forEach(row => {
            const inMapping = uniqueMappedLocations.includes(row.screen_location);
            const status = inMapping ? '✅' : '❌';
            console.log(`${status} ${row.screen_location} (${row.content_items} items)`);
        });
        console.log();
        
        // Find screen_locations in mapping but NOT in database
        const missingInDb = uniqueMappedLocations.filter(loc => !dbScreenLocations.includes(loc));
        
        console.log(`🚫 MAPPED BUT NOT IN DATABASE (${missingInDb.length}):`);
        console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
        if (missingInDb.length === 0) {
            console.log('✅ All mapped screen_locations exist in database!');
        } else {
            missingInDb.forEach(loc => {
                const mapping = mappings.find(m => m.screen_location === loc);
                console.log(`❌ ${loc} (Page ${mapping.page_number}: ${mapping.confluence_title})`);
            });
        }
        console.log();
        
        // Find screen_locations in database but NOT in mapping
        const missingInMapping = dbScreenLocations.filter(loc => !uniqueMappedLocations.includes(loc));
        
        console.log(`📝 IN DATABASE BUT NOT MAPPED (${missingInMapping.length}):`);
        console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
        if (missingInMapping.length === 0) {
            console.log('✅ All database screen_locations are mapped!');
        } else {
            missingInMapping.forEach(loc => {
                const dbRow = result.rows.find(row => row.screen_location === loc);
                console.log(`📝 ${loc} (${dbRow.content_items} items) - NEEDS MAPPING`);
            });
        }
        console.log();
        
        // Summary
        console.log(`📊 SUMMARY:`);
        console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
        console.log(`✅ Complete matches: ${uniqueMappedLocations.length - missingInDb.length}/${uniqueMappedLocations.length}`);
        console.log(`❌ Mapped but missing in DB: ${missingInDb.length}`);
        console.log(`📝 In DB but not mapped: ${missingInMapping.length}`);
        
        if (missingInDb.length === 0 && missingInMapping.length === 0) {
            console.log(`🎉 PERFECT SYNC: All screen_locations are perfectly synchronized!`);
        } else {
            console.log(`⚠️  ACTION NEEDED: Please review and update mapping or database.`);
        }
        
    } catch (error) {
        console.error('❌ Validation failed:', error.message);
    } finally {
        await pool.end();
    }
}

validatePageMapping(); 
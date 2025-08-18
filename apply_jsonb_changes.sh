#!/bin/bash

# 1. Update getDatabaseConfig to use Neon for content database
sed -i '36,37s/.*/            \/\/ 🚀 JSONB Migration: Using Neon for content database\n            const neonUrl = process.env.NEON_CONTENT_URL || '\''postgresql:\/\/neondb_owner:npg_jbzp4wqldAu7@ep-wild-feather-ad1lx42k.c-2.us-east-1.aws.neon.tech\/neondb?sslmode=require'\'';/' server/server-db.js
sed -i '38s/.*/            console.log('\''🌟 Using Neon cloud database for JSONB dropdowns'\'');/' server/server-db.js
sed -i '39,40s/.*/            return {\n                connectionString: neonUrl,/' server/server-db.js
sed -i '41s/.*/                ssl: { rejectUnauthorized: false }/' server/server-db.js

# 2. Create a temporary file with the new endpoint
cat > /tmp/jsonb_endpoint.txt << 'EOF'
// GET /api/dropdowns/:screen/:language - Get structured dropdown data with caching (JSONB Version)
app.get('/api/dropdowns/:screen/:language', async (req, res) => {
    try {
        const { screen, language } = req.params;
        
        // Create cache key for dropdowns
        const cacheKey = `dropdowns_${screen}_${language}`;
        
        // Check cache first
        const cached = contentCache.get(cacheKey);
        if (cached) {
            console.log(`✅ Dropdown cache HIT for ${cacheKey}`);
            return res.json(cached);
        }
        
        console.log(`⚡ JSONB Dropdown cache MISS for ${cacheKey} - querying Neon database`);
        
        // 🚀 JSONB OPTIMIZED QUERY - Extract language-specific data from nested structure
        const result = await contentPool.query(`
            SELECT 
                dropdown_key,
                field_name,
                dropdown_data->'label'->$2 as label,
                dropdown_data->'placeholder'->$2 as placeholder,
                dropdown_data->'options' as options
            FROM dropdown_configs
            WHERE screen_location = $1 
                AND is_active = true
            ORDER BY dropdown_key
        `, [screen, language]);
        
        console.log(`📊 JSONB query returned ${result.rows.length} dropdowns for ${screen}/${language}`);
        
        // Structure the response according to the specification
        const response = {
            status: 'success',
            screen_location: screen,
            language_code: language,
            dropdowns: [],
            options: {},
            placeholders: {},
            labels: {},
            cached: false
        };
        
        // Process JSONB data with language extraction
        result.rows.forEach(row => {
            const fieldName = row.field_name;
            const label = row.label;
            const placeholder = row.placeholder;
            const options = row.options;
            
            // Process options to extract language-specific text
            let processedOptions = [];
            if (options && Array.isArray(options)) {
                processedOptions = options.map(opt => ({
                    value: opt.value,
                    text: opt.text && opt.text[language] ? opt.text[language] : ''
                }));
            }
            
            // Add to dropdowns array
            response.dropdowns.push({
                field_name: fieldName,
                label: label || '',
                placeholder: placeholder || '',
                options: processedOptions
            });
            
            // Also populate the legacy structure for backward compatibility
            if (label) {
                response.labels[fieldName] = label;
            }
            if (placeholder) {
                response.placeholders[fieldName] = placeholder;
            }
            if (processedOptions.length > 0) {
                response.options[fieldName] = processedOptions;
            }
        });
        
        // Cache the response
        contentCache.set(cacheKey, response);
        console.log(`💾 Cached JSONB dropdown data for ${cacheKey}`);
        
        res.json(response);
        
    } catch (error) {
        console.error('❌ Error fetching JSONB dropdowns:', error);
        res.status(500).json({ 
            status: 'error', 
            message: 'Failed to fetch dropdown data',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});
EOF

# 3. Find and replace the dropdown endpoint
# First, find the line numbers
START_LINE=$(grep -n "app.get('/api/dropdowns/:screen/:language'" server/server-db.js | cut -d: -f1)
# Find the closing brace by searching for the next app.get after our endpoint
NEXT_APP=$(awk "NR>$START_LINE && /^app\\./ {print NR; exit}" server/server-db.js)
END_LINE=$((NEXT_APP - 1))

# Delete the old endpoint
sed -i "${START_LINE},${END_LINE}d" server/server-db.js

# Insert the new endpoint
sed -i "$((START_LINE - 1))r /tmp/jsonb_endpoint.txt" server/server-db.js

echo "✅ JSONB changes applied successfully"
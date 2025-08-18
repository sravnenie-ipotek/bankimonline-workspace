const fs = require('fs');

// Read the server file
const serverPath = '/Users/michaelmishayev/Projects/bankDev2_standalone/server/server-db.js';
let serverContent = fs.readFileSync(serverPath, 'utf8');

// Find the handleJsonbDropdowns function and add debug logging
const functionStart = serverContent.indexOf('async function handleJsonbDropdowns(req, res) {');
const functionEnd = serverContent.indexOf('\n}', functionStart) + 2;

if (functionStart === -1) {
    console.error('❌ Could not find handleJsonbDropdowns function');
    process.exit(1);
}

// Get the function
const oldFunction = serverContent.substring(functionStart, functionEnd);

// Create new function with debug logging
const newFunction = `async function handleJsonbDropdowns(req, res) {
    try {
        const { screen, language } = req.params;
        
        // Create cache key for dropdowns
        const cacheKey = \`dropdowns_jsonb_\${screen}_\${language}\`;
        
        // Check cache first
        const cached = contentCache.get(cacheKey);
        if (cached) {
            console.log(\`✅ JSONB Cache HIT for \${screen}/\${language}\`);
            return res.json(cached);
        }
        
        console.log(\`⚡ JSONB Cache MISS for \${screen}/\${language} - Querying dropdown_configs\`);
        
        // 🚀 JSONB Query: Fetch ALL dropdowns for screen in ONE query
        const result = await contentPool.query(\`
            SELECT 
                dropdown_key,
                field_name,
                dropdown_data
            FROM dropdown_configs
            WHERE screen_location = $1 
                AND is_active = true
            ORDER BY dropdown_key
        \`, [screen]);
        
        console.log(\`🔍 DEBUG: Query returned \${result.rows.length} rows from dropdown_configs\`);
        
        // Structure the response to match existing API format
        const response = {
            status: 'success',
            screen_location: screen,
            language_code: language,
            dropdowns: [],
            options: {},
            placeholders: {},
            labels: {},
            cached: false,
            jsonb_source: true,  // Indicator that this is from JSONB
            performance: {
                query_count: 1,  // Only 1 query instead of 4-6!
                source: 'neon_jsonb',
                total_items: result.rows.length
            }
        };
        
        // Process JSONB data - FIXED VERSION
        result.rows.forEach(row => {
            const { dropdown_key, field_name, dropdown_data } = row;
            
            if (!dropdown_data) {
                console.warn(\`⚠️ Empty dropdown_data for \${dropdown_key}\`);
                return;
            }
            
            // Extract language-specific values
            const label = dropdown_data.label?.[language] || dropdown_data.label?.en || field_name;
            const placeholder = dropdown_data.placeholder?.[language] || dropdown_data.placeholder?.en || \`Select \${field_name}\`;
            
            // Build options array with proper structure
            const options = (dropdown_data.options || []).map(opt => ({
                value: opt.value,
                text: opt.text?.[language] || opt.text?.en || opt.value,
                label: opt.text?.[language] || opt.text?.en || opt.value
            }));
            
            if (field_name === 'education') {
                console.log(\`🎓 DEBUG: Education dropdown - Options count: \${options.length}\`);
                if (options.length === 0) {
                    console.log(\`   dropdown_data.options: \`, dropdown_data.options);
                }
            }
            
            // Add to response
            response.dropdowns.push({
                key: dropdown_key,
                field: field_name,
                label: label,
                placeholder: placeholder,
                options: options
            });
            
            // Also add in the flat structure for backward compatibility
            response.options[dropdown_key] = options;
            response.labels[dropdown_key] = label;
            response.placeholders[dropdown_key] = placeholder;
        });
        
        console.log(\`🔍 DEBUG: Response will have \${response.dropdowns.length} dropdowns\`);
        
        // Cache the response
        contentCache.set(cacheKey, response, 300); // Cache for 5 minutes
        console.log(\`✅ JSONB Response cached for \${screen}/\${language} with \${response.dropdowns.length} dropdowns\`);
        
        res.json(response);
        
    } catch (error) {
        console.error('❌ Error in handleJsonbDropdowns:', error);
        res.status(500).json({ 
            error: 'Failed to fetch dropdown data',
            details: error.message,
            jsonb_source: true
        });
    }
}`;

// Replace the function
serverContent = serverContent.substring(0, functionStart) + newFunction + serverContent.substring(functionEnd);

// Write back to file
fs.writeFileSync(serverPath, serverContent);

console.log('✅ Added debug logging to handleJsonbDropdowns function');
console.log('🔄 Restart the server to see debug output');
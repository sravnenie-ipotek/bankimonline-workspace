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
        
        // 🚀 JSONB OPTIMIZED QUERY - Single query instead of complex JOINs
        const result = await contentPool.query(`
            SELECT 
                dropdown_key,
                field_name,
                dropdown_data->$2 as dropdown_data
            FROM dropdown_configs
            WHERE screen_location = $1 
                AND is_active = true
                AND dropdown_data ? $2
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
        
        // Process JSONB data directly
        result.rows.forEach(row => {
            const dropdownData = row.dropdown_data;
            const fieldName = row.field_name;
            
            if (!dropdownData) return;
            
            // Add to dropdowns array
            response.dropdowns.push({
                field_name: fieldName,
                label: dropdownData.label || '',
                placeholder: dropdownData.placeholder || '',
                options: dropdownData.options || []
            });
            
            // Also populate the legacy structure for backward compatibility
            if (dropdownData.label) {
                response.labels[fieldName] = dropdownData.label;
            }
            if (dropdownData.placeholder) {
                response.placeholders[fieldName] = dropdownData.placeholder;
            }
            if (dropdownData.options && dropdownData.options.length > 0) {
                response.options[fieldName] = dropdownData.options;
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
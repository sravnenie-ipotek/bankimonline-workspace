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
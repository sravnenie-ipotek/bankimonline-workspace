// JSONB Dropdown Endpoint - Replacement for old dropdown API
// This replaces the complex multi-query dropdown endpoint with a single JSONB query

// GET /api/dropdowns/:screen/:language - Get structured dropdown data with JSONB
app.get('/api/dropdowns/:screen/:language', async (req, res) => {
    try {
        const { screen, language } = req.params;
        
        // Create cache key for dropdowns
        const cacheKey = `dropdowns_jsonb_${screen}_${language}`;
        
        // Check cache first
        const cached = contentCache.get(cacheKey);
        if (cached) {
            console.log(`✅ Cache HIT for JSONB dropdowns: ${screen}/${language}`);
            return res.json(cached);
        }
        
        console.log(`❄️  Cache MISS for dropdowns: ${screen}/${language} - Fetching from Neon JSONB`);
        
        // 🚀 JSONB Query: Fetch ALL dropdowns for screen in ONE query
        const result = await contentPool.query(`
            SELECT 
                dropdown_key,
                field_name,
                dropdown_data
            FROM dropdown_configs
            WHERE screen_location = $1 
                AND is_active = true
            ORDER BY dropdown_key
        `, [screen]);
        
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
                source: 'neon_jsonb'
            }
        };
        
        // Process JSONB data
        const dropdownMap = new Map();
        
        // 🚀 JSONB Processing: Extract data directly from JSONB structure
        result.rows.forEach(row => {
            const { dropdown_key, field_name, dropdown_data } = row;
            
            // Extract language-specific values from JSONB
            const label = dropdown_data.label?.[language] || dropdown_data.label?.en || '';
            const placeholder = dropdown_data.placeholder?.[language] || dropdown_data.placeholder?.en || '';
            
            // Build options array with language-specific text
            const options = (dropdown_data.options || []).map(opt => ({
                value: opt.value,
                text: opt.text?.[language] || opt.text?.en || ''
            }));
            
            // Add to dropdown map
            dropdownMap.set(field_name, {
                key: dropdown_key,
                label: label,
                options: options,
                placeholder: placeholder
            });
            
            // Also populate the flat structures for backward compatibility
            response.labels[dropdown_key] = label;
            response.placeholders[dropdown_key] = placeholder;
            
            // Add options to flat structure (for backward compatibility)
            options.forEach((opt) => {
                const optionKey = `${dropdown_key}_option_${opt.value}`;
                response.options[optionKey] = opt.text;
            });
        });
        
        // Build final response - include all dropdowns from JSONB
        dropdownMap.forEach((dropdown, fieldName) => {
            response.dropdowns.push({
                key: dropdown.key,
                label: dropdown.label || fieldName.replace(/_/g, ' ')
            });
            
            // Add options array for this dropdown
            if (dropdown.options.length > 0) {
                response.options[dropdown.key] = dropdown.options;
            }
            
            // Ensure the field exists in the response structure (for components that access by field name)
            if (!response[fieldName]) {
                response[fieldName] = {
                    label: dropdown.label,
                    placeholder: dropdown.placeholder,
                    options: dropdown.options
                };
            }
        });
        
        // Alias fix for production: expose citizenship options under additional keys
        // This maintains backward compatibility with existing frontend code
        try {
            const mainCitizenshipKey = `${screen}_citizenship`;
            const aliasCitizenshipKey = `${screen}_citizenship_countries`;
            if (screen === 'mortgage_step2' && response.options[mainCitizenshipKey]) {
                response.options[aliasCitizenshipKey] = response.options[mainCitizenshipKey];
                if (response.labels && response.labels[mainCitizenshipKey]) {
                    response.labels[aliasCitizenshipKey] = response.labels[mainCitizenshipKey];
                }
                if (response.placeholders && response.placeholders[mainCitizenshipKey]) {
                    response.placeholders[aliasCitizenshipKey] = response.placeholders[mainCitizenshipKey];
                }
                response.dropdowns.push({ 
                    key: aliasCitizenshipKey, 
                    label: response.labels?.[aliasCitizenshipKey] || 'Citizenship Countries' 
                });
            }

            // Step 1 aliases: when_needed/first_home ↔ when/first (non-breaking copies)
            if (screen === 'mortgage_step1') {
                const aliasPairs = [
                    { source: 'when', alias: 'when_needed' },
                    { source: 'first', alias: 'first_home' }
                ];
                for (const { source, alias } of aliasPairs) {
                    const sourceKey = `${screen}_${source}`;
                    const aliasKey = `${screen}_${alias}`;
                    
                    // Create alias if source exists and alias doesn't
                    if (response.options[sourceKey] && !response.options[aliasKey]) {
                        response.options[aliasKey] = response.options[sourceKey];
                        if (response.labels && response.labels[sourceKey]) {
                            response.labels[aliasKey] = response.labels[sourceKey];
                        }
                        if (response.placeholders && response.placeholders[sourceKey]) {
                            response.placeholders[aliasKey] = response.placeholders[sourceKey];
                        }
                        response.dropdowns.push({ 
                            key: aliasKey, 
                            label: response.labels?.[aliasKey] || alias.replace(/_/g, ' ') 
                        });
                    }
                    
                    // Also create reverse alias if needed
                    if (response.options[aliasKey] && !response.options[sourceKey]) {
                        response.options[sourceKey] = response.options[aliasKey];
                        if (response.labels && response.labels[aliasKey]) {
                            response.labels[sourceKey] = response.labels[aliasKey];
                        }
                        if (response.placeholders && response.placeholders[aliasKey]) {
                            response.placeholders[sourceKey] = response.placeholders[aliasKey];
                        }
                        response.dropdowns.push({ 
                            key: sourceKey, 
                            label: response.labels?.[sourceKey] || source.replace(/_/g, ' ') 
                        });
                    }
                }
            }
        } catch (aliasErr) {
            console.warn('Alias mapping warning:', aliasErr?.message || aliasErr);
        }
        
        // Add performance metadata
        response.performance.total_items = result.rowCount;
        response.performance.dropdowns_found = response.dropdowns.length;
        response.performance.query_time = new Date().toISOString();
        
        // Cache the processed data
        contentCache.set(cacheKey, response);
        console.log(`💾 Cached JSONB dropdowns for: ${screen}/${language} (TTL: 5min)`);
        
        res.json(response);
    } catch (error) {
        console.error('❌ Error fetching JSONB dropdowns:', error);
        
        // Fallback: Return empty structure so app doesn't break
        res.status(500).json({ 
            status: 'error', 
            message: 'Failed to fetch dropdown data',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
            screen_location: req.params.screen,
            language_code: req.params.language,
            dropdowns: [],
            options: {},
            placeholders: {},
            labels: {}
        });
    }
});
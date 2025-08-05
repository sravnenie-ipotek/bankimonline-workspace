
-- Check if education dropdown options are in content_items table
SELECT 
    content_key,
    component_type,
    category,
    screen_location
FROM content_items 
WHERE content_key LIKE '%education%' 
ORDER BY content_key;


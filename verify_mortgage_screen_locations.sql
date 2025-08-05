
-- Check what mortgage-related screen_locations actually exist
SELECT DISTINCT screen_location, COUNT(*) as item_count
FROM content_items 
WHERE screen_location LIKE '%mortgage%' 
GROUP BY screen_location
ORDER BY screen_location;

-- Also check if 'mortgage' exists
SELECT DISTINCT screen_location, COUNT(*) as item_count
FROM content_items 
WHERE screen_location = 'mortgage'
GROUP BY screen_location;



-- Check what screen_location values exist for mortgage-related content
SELECT DISTINCT screen_location 
FROM content_items 
WHERE screen_location LIKE '%mortgage%' 
ORDER BY screen_location;


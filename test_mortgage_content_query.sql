
SELECT 
    content_items.content_key,
    content_items.component_type,
    content_items.category,
    content_translations.content_value,
    content_translations.language_code,
    content_translations.status
FROM content_items
JOIN content_translations ON content_items.id = content_translations.content_item_id
WHERE content_items.screen_location = 'mortgage' 
    AND content_translations.language_code = 'en'
    AND content_translations.status = 'approved'
    AND content_items.is_active = true
ORDER BY content_items.content_key;


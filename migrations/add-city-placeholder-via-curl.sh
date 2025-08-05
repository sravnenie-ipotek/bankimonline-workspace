#!/bin/bash

API_BASE="http://localhost:8003/api/content"

echo "🚀 Adding Missing City Placeholder to Database..."

# Function to add content item
add_content() {
    local content_key="$1"
    local component_type="$2"
    local category="$3"
    local description="$4"
    local en_text="$5"
    local he_text="$6"
    local ru_text="$7"
    
    echo "⏳ Adding: $content_key..."
    
    # Create JSON payload
    json_data=$(cat <<EOF
{
    "content_key": "$content_key",
    "component_type": "$component_type",
    "screen_location": "mortgage_step1",
    "category": "$category",
    "description": "$description",
    "translations": {
        "en": "$en_text",
        "he": "$he_text",
        "ru": "$ru_text"
    }
}
EOF
)
    
    # Make API call
    response=$(curl -s -X POST "$API_BASE" \
        -H "Content-Type: application/json" \
        -d "$json_data")
    
    # Check response
    if echo "$response" | grep -q '"status":"success"'; then
        echo "✅ Success: $content_key"
        return 0
    else
        echo "❌ Failed: $content_key - $response"
        return 1
    fi
}

success_count=0
error_count=0

# Add city placeholder following @dropDownsInDBLogic rules
if add_content "mortgage_step1.field.city_ph" "placeholder" "form" "City dropdown placeholder text" "Select city" "בחר עיר" "Выберите город"; then
    ((success_count++))
else
    ((error_count++))
fi

echo ""
echo "📊 Migration Summary:"
echo "✅ Successfully added: $success_count items"
echo "❌ Failed: $error_count items"

if [ $success_count -gt 0 ]; then
    echo ""
    echo "🔍 Verifying migration..."
    verify_response=$(curl -s "$API_BASE/mortgage_step1/he")
    content_count=$(echo "$verify_response" | grep -o '"content_count":[0-9]*' | grep -o '[0-9]*')
    echo "✅ API now returns $content_count content items for mortgage_step1"
    
    # Check specifically for the placeholder
    placeholder_check=$(curl -s "$API_BASE/mortgage_step1/he" | jq '.content."mortgage_step1.field.city_ph"')
    if [ "$placeholder_check" != "null" ]; then
        echo "✅ City placeholder successfully added!"
        echo "📝 Placeholder value: $placeholder_check"
    else
        echo "⚠️  Placeholder not found - may need to restart server"
    fi
fi 
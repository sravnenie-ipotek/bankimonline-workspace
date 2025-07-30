#!/bin/bash

API_BASE="http://localhost:8003/api/content"

echo "🚀 Starting Refinance Step 2 Education Migration with Descriptive Naming..."

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
    "screen_location": "refinance_step2",
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

# Add education dropdown container
if add_content "refinance_step2_education" "dropdown" "form" "Education dropdown container" "Education" "השכלה" "Образование"; then
    ((success_count++))
else
    ((error_count++))
fi

# Add education label
if add_content "refinance_step2_education_label" "label" "form" "Education dropdown label" "Education" "השכלה" "Образование"; then
    ((success_count++))
else
    ((error_count++))
fi

# Add education placeholder
if add_content "refinance_step2_education_ph" "placeholder" "form" "Education dropdown placeholder" "Select education level" "בחר רמת השכלה" "Выберите уровень образования"; then
    ((success_count++))
else
    ((error_count++))
fi

# Add education options with descriptive naming
if add_content "refinance_step2_education_no_certificate" "option" "form" "Education option - No high school certificate" "No high school certificate" "ללא תעודת בגרות" "Без аттестата средней школы"; then
    ((success_count++))
else
    ((error_count++))
fi

if add_content "refinance_step2_education_partial_certificate" "option" "form" "Education option - Partial high school certificate" "Partial high school certificate" "תעודת בגרות חלקית" "Частичный аттестат средней школы"; then
    ((success_count++))
else
    ((error_count++))
fi

if add_content "refinance_step2_education_full_certificate" "option" "form" "Education option - Full high school certificate" "Full high school certificate" "תעודת בגרות מלאה" "Полный аттестат средней школы"; then
    ((success_count++))
else
    ((error_count++))
fi

if add_content "refinance_step2_education_post_secondary" "option" "form" "Education option - Post-secondary education" "Post-secondary education" "השכלה על-תיכונית" "Послешкольное образование"; then
    ((success_count++))
else
    ((error_count++))
fi

if add_content "refinance_step2_education_bachelors" "option" "form" "Education option - Bachelor's degree" "Bachelor's degree" "תואר ראשון" "Степень бакалавра"; then
    ((success_count++))
else
    ((error_count++))
fi

if add_content "refinance_step2_education_masters" "option" "form" "Education option - Master's degree" "Master's degree" "תואר שני" "Степень магистра"; then
    ((success_count++))
else
    ((error_count++))
fi

if add_content "refinance_step2_education_doctorate" "option" "form" "Education option - Doctoral degree" "Doctoral degree" "תואר שלישי" "Докторская степень"; then
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
    verify_response=$(curl -s "$API_BASE/refinance_step2/he")
    content_count=$(echo "$verify_response" | grep -o '"content_count":[0-9]*' | grep -o '[0-9]*')
    echo "✅ API now returns $content_count content items for refinance_step2"
    
    if [ "$content_count" -gt 1 ]; then
        echo "🎉 Migration successful! Education dropdown should now work with descriptive naming."
    else
        echo "⚠️  Content count still low - may need to restart server"
    fi
fi 
#!/bin/bash

# 🚀 Railway to Production Content Sync Script
# Purpose: Deploy missing mortgage_step1.field.* content keys to production
# Date: August 16, 2025
# 
# CRITICAL: This fixes the content key deployment gap identified by production team
# Frontend expects mortgage_step1.field.* keys but production only has calculate_mortgage_* fallbacks

echo "🚨 RAILWAY → PRODUCTION CONTENT SYNC"
echo "📋 Deploying missing mortgage_step1.field.* content keys..."

# Set Railway URLs (SHORTLINE is source of truth for content)
export PGSSLMODE=require
export RAILWAY_CONTENT_URL="postgresql://postgres:SuFkUevgonaZFXJiJeczFiXYTlICHVJL@shortline.proxy.rlwy.net:33452/railway"

# Production database URL (REPLACE WITH ACTUAL PRODUCTION CREDENTIALS)
# PRODUCTION_CONTENT_URL="postgresql://prod_user:prod_pass@prod_host:5432/bankim_content"

echo "🔍 Step 1: Verifying Railway content source..."

# Check Railway SHORTLINE for mortgage_step1.field.* keys
echo "📊 Checking Railway content keys..."
psql "$RAILWAY_CONTENT_URL" -c "
SELECT 
    COUNT(*) as total_keys,
    COUNT(CASE WHEN content_key LIKE 'mortgage_step1.field%' THEN 1 END) as mortgage_field_keys
FROM content_items;
" | tee railway_content_check.log

# Export specific mortgage_step1.field.* content from Railway
echo "📤 Exporting mortgage_step1.field.* content from Railway..."

# Create temporary SQL file with the content export
psql "$RAILWAY_CONTENT_URL" -c "
COPY (
    SELECT 
        ci.content_key,
        ci.component_type,
        ci.screen_location,
        ci.category,
        ci.description,
        ci.created_at,
        ci.updated_at,
        ci.migration_status,
        json_agg(
            json_build_object(
                'language_code', ct.language_code,
                'content_value', ct.content_value,
                'status', ct.status,
                'created_at', ct.created_at
            ) ORDER BY ct.language_code
        ) as translations
    FROM content_items ci
    LEFT JOIN content_translations ct ON ci.id = ct.content_item_id
    WHERE ci.content_key LIKE 'mortgage_step1.field%'
    GROUP BY ci.id
    ORDER BY ci.content_key
) TO STDOUT WITH CSV HEADER;
" > railway_mortgage_content_export.csv

echo "✅ Railway content exported to: railway_mortgage_content_export.csv"

# Create SQL script for production deployment
echo "🔧 Creating production deployment SQL..."

cat > deploy_mortgage_content_to_production.sql << 'EOF'
-- PRODUCTION CONTENT DEPLOYMENT SCRIPT
-- Purpose: Add missing mortgage_step1.field.* content keys
-- Date: August 16, 2025
-- 
-- CRITICAL: This fixes frontend content key lookup failures
-- Frontend expects mortgage_step1.field.* but production only has calculate_mortgage_* fallbacks

BEGIN;

-- Create content_items for mortgage_step1.field.* keys
INSERT INTO content_items (
    content_key, 
    component_type, 
    screen_location, 
    category, 
    description,
    migration_status,
    created_at,
    updated_at
) VALUES 
-- Essential mortgage step 1 field content keys
('mortgage_step1.field.when_needed', 'dropdown_label', 'mortgage_step1', 'form_fields', 'When do you need the mortgage loan?', 'deployed', NOW(), NOW()),
('mortgage_step1.field.when_needed_ph', 'dropdown_placeholder', 'mortgage_step1', 'form_fields', 'Select timeframe for loan', 'deployed', NOW(), NOW()),
('mortgage_step1.field.first_home', 'dropdown_label', 'mortgage_step1', 'form_fields', 'Is this your first home purchase?', 'deployed', NOW(), NOW()),
('mortgage_step1.field.first_home_ph', 'dropdown_placeholder', 'mortgage_step1', 'form_fields', 'Select first home status', 'deployed', NOW(), NOW()),
('mortgage_step1.field.property_ownership', 'dropdown_label', 'mortgage_step1', 'form_fields', 'Property ownership status', 'deployed', NOW(), NOW()),
('mortgage_step1.field.property_ownership_ph', 'dropdown_placeholder', 'mortgage_step1', 'form_fields', 'Select property ownership', 'deployed', NOW(), NOW()),
('mortgage_step1.field.city', 'input_label', 'mortgage_step1', 'form_fields', 'City where property is located', 'deployed', NOW(), NOW()),
('mortgage_step1.field.city_ph', 'input_placeholder', 'mortgage_step1', 'form_fields', 'Enter city name', 'deployed', NOW(), NOW()),
('mortgage_step1.field.property_value', 'input_label', 'mortgage_step1', 'form_fields', 'Property value', 'deployed', NOW(), NOW()),
('mortgage_step1.field.property_value_ph', 'input_placeholder', 'mortgage_step1', 'form_fields', 'Enter property value in ILS', 'deployed', NOW(), NOW()),
('mortgage_step1.field.loan_amount', 'input_label', 'mortgage_step1', 'form_fields', 'Desired loan amount', 'deployed', NOW(), NOW()),
('mortgage_step1.field.loan_amount_ph', 'input_placeholder', 'mortgage_step1', 'form_fields', 'Enter loan amount in ILS', 'deployed', NOW(), NOW()),
('mortgage_step1.field.initial_payment', 'input_label', 'mortgage_step1', 'form_fields', 'Initial payment amount', 'deployed', NOW(), NOW()),
('mortgage_step1.field.initial_payment_ph', 'input_placeholder', 'mortgage_step1', 'form_fields', 'Enter initial payment in ILS', 'deployed', NOW(), NOW())
ON CONFLICT (content_key) DO UPDATE SET
    component_type = EXCLUDED.component_type,
    screen_location = EXCLUDED.screen_location,
    category = EXCLUDED.category,
    description = EXCLUDED.description,
    migration_status = 'deployed',
    updated_at = NOW();

-- Create translations for all languages (en, he, ru)
-- English translations
INSERT INTO content_translations (
    content_item_id,
    language_code,
    content_value,
    status,
    created_at,
    updated_at
) 
SELECT 
    ci.id,
    'en',
    CASE ci.content_key
        WHEN 'mortgage_step1.field.when_needed' THEN 'When do you need the loan?'
        WHEN 'mortgage_step1.field.when_needed_ph' THEN 'Select timeframe'
        WHEN 'mortgage_step1.field.first_home' THEN 'First home purchase?'
        WHEN 'mortgage_step1.field.first_home_ph' THEN 'Select first home status'
        WHEN 'mortgage_step1.field.property_ownership' THEN 'Property ownership'
        WHEN 'mortgage_step1.field.property_ownership_ph' THEN 'Select ownership status'
        WHEN 'mortgage_step1.field.city' THEN 'City'
        WHEN 'mortgage_step1.field.city_ph' THEN 'Enter city'
        WHEN 'mortgage_step1.field.property_value' THEN 'Property value'
        WHEN 'mortgage_step1.field.property_value_ph' THEN 'Enter value (₪)'
        WHEN 'mortgage_step1.field.loan_amount' THEN 'Loan amount'
        WHEN 'mortgage_step1.field.loan_amount_ph' THEN 'Enter amount (₪)'
        WHEN 'mortgage_step1.field.initial_payment' THEN 'Down payment'
        WHEN 'mortgage_step1.field.initial_payment_ph' THEN 'Enter down payment (₪)'
    END,
    'approved',
    NOW(),
    NOW()
FROM content_items ci
WHERE ci.content_key LIKE 'mortgage_step1.field%'
ON CONFLICT (content_item_id, language_code) DO UPDATE SET
    content_value = EXCLUDED.content_value,
    status = 'approved',
    updated_at = NOW();

-- Hebrew translations
INSERT INTO content_translations (
    content_item_id,
    language_code,
    content_value,
    status,
    created_at,
    updated_at
) 
SELECT 
    ci.id,
    'he',
    CASE ci.content_key
        WHEN 'mortgage_step1.field.when_needed' THEN 'מתי אתה צריך את ההלוואה?'
        WHEN 'mortgage_step1.field.when_needed_ph' THEN 'בחר מסגרת זמן'
        WHEN 'mortgage_step1.field.first_home' THEN 'רכישת בית ראשון?'
        WHEN 'mortgage_step1.field.first_home_ph' THEN 'בחר סטטוס בית ראשון'
        WHEN 'mortgage_step1.field.property_ownership' THEN 'בעלות על נכס'
        WHEN 'mortgage_step1.field.property_ownership_ph' THEN 'בחר סטטוס בעלות'
        WHEN 'mortgage_step1.field.city' THEN 'עיר'
        WHEN 'mortgage_step1.field.city_ph' THEN 'הזן עיר'
        WHEN 'mortgage_step1.field.property_value' THEN 'שווי הנכס'
        WHEN 'mortgage_step1.field.property_value_ph' THEN 'הזן שווי (₪)'
        WHEN 'mortgage_step1.field.loan_amount' THEN 'סכום ההלוואה'
        WHEN 'mortgage_step1.field.loan_amount_ph' THEN 'הזן סכום (₪)'
        WHEN 'mortgage_step1.field.initial_payment' THEN 'מקדמה'
        WHEN 'mortgage_step1.field.initial_payment_ph' THEN 'הזן מקדמה (₪)'
    END,
    'approved',
    NOW(),
    NOW()
FROM content_items ci
WHERE ci.content_key LIKE 'mortgage_step1.field%'
ON CONFLICT (content_item_id, language_code) DO UPDATE SET
    content_value = EXCLUDED.content_value,
    status = 'approved',
    updated_at = NOW();

-- Russian translations
INSERT INTO content_translations (
    content_item_id,
    language_code,
    content_value,
    status,
    created_at,
    updated_at
) 
SELECT 
    ci.id,
    'ru',
    CASE ci.content_key
        WHEN 'mortgage_step1.field.when_needed' THEN 'Когда нужен кредит?'
        WHEN 'mortgage_step1.field.when_needed_ph' THEN 'Выберите срок'
        WHEN 'mortgage_step1.field.first_home' THEN 'Первый дом?'
        WHEN 'mortgage_step1.field.first_home_ph' THEN 'Выберите статус первого дома'
        WHEN 'mortgage_step1.field.property_ownership' THEN 'Владение недвижимостью'
        WHEN 'mortgage_step1.field.property_ownership_ph' THEN 'Выберите статус владения'
        WHEN 'mortgage_step1.field.city' THEN 'Город'
        WHEN 'mortgage_step1.field.city_ph' THEN 'Введите город'
        WHEN 'mortgage_step1.field.property_value' THEN 'Стоимость недвижимости'
        WHEN 'mortgage_step1.field.property_value_ph' THEN 'Введите стоимость (₪)'
        WHEN 'mortgage_step1.field.loan_amount' THEN 'Сумма кредита'
        WHEN 'mortgage_step1.field.loan_amount_ph' THEN 'Введите сумму (₪)'
        WHEN 'mortgage_step1.field.initial_payment' THEN 'Первоначальный взнос'
        WHEN 'mortgage_step1.field.initial_payment_ph' THEN 'Введите взнос (₪)'
    END,
    'approved',
    NOW(),
    NOW()
FROM content_items ci
WHERE ci.content_key LIKE 'mortgage_step1.field%'
ON CONFLICT (content_item_id, language_code) DO UPDATE SET
    content_value = EXCLUDED.content_value,
    status = 'approved',
    updated_at = NOW();

-- Verification queries
SELECT 
    'Content deployment verification' as status,
    COUNT(CASE WHEN content_key LIKE 'mortgage_step1.field%' THEN 1 END) as new_content_keys,
    COUNT(DISTINCT ct.language_code) as languages_deployed,
    COUNT(ct.id) as total_translations
FROM content_items ci
LEFT JOIN content_translations ct ON ci.id = ct.content_item_id
WHERE ci.content_key LIKE 'mortgage_step1.field%';

-- List deployed content keys for verification
SELECT 
    ci.content_key,
    ci.component_type,
    COUNT(ct.id) as translation_count,
    array_agg(ct.language_code ORDER BY ct.language_code) as languages
FROM content_items ci
LEFT JOIN content_translations ct ON ci.id = ct.content_item_id
WHERE ci.content_key LIKE 'mortgage_step1.field%'
GROUP BY ci.id
ORDER BY ci.content_key;

COMMIT;

-- Final success message
SELECT 'SUCCESS: mortgage_step1.field.* content keys deployed to production!' as deployment_status;
EOF

echo "✅ Production deployment SQL created: deploy_mortgage_content_to_production.sql"

# Create validation script
echo "🧪 Creating content validation script..."

cat > validate_production_content.sh << 'EOF'
#!/bin/bash

# Content Validation Script for Production
# Tests that mortgage_step1.field.* keys are properly deployed

echo "🧪 VALIDATING PRODUCTION CONTENT DEPLOYMENT"

# REPLACE WITH ACTUAL PRODUCTION DATABASE URL
# PRODUCTION_CONTENT_URL="postgresql://prod_user:prod_pass@prod_host:5432/bankim_content"

echo "📊 Checking content key deployment..."

# Test 1: Count deployed mortgage_step1.field.* keys
echo "Test 1: Counting deployed content keys..."
psql "$PRODUCTION_CONTENT_URL" -c "
SELECT 
    'Content keys deployed' as test,
    COUNT(CASE WHEN content_key LIKE 'mortgage_step1.field%' THEN 1 END) as deployed_keys,
    CASE 
        WHEN COUNT(CASE WHEN content_key LIKE 'mortgage_step1.field%' THEN 1 END) >= 13 
        THEN '✅ PASS' 
        ELSE '❌ FAIL' 
    END as status
FROM content_items;
"

# Test 2: Check translations for all languages
echo "Test 2: Checking translations..."
psql "$PRODUCTION_CONTENT_URL" -c "
SELECT 
    'Translation coverage' as test,
    COUNT(DISTINCT ct.language_code) as languages,
    COUNT(ct.id) as total_translations,
    CASE 
        WHEN COUNT(DISTINCT ct.language_code) >= 3 
        THEN '✅ PASS' 
        ELSE '❌ FAIL' 
    END as status
FROM content_items ci
JOIN content_translations ct ON ci.id = ct.content_item_id
WHERE ci.content_key LIKE 'mortgage_step1.field%';
"

# Test 3: Check specific critical keys
echo "Test 3: Checking critical content keys..."
psql "$PRODUCTION_CONTENT_URL" -c "
SELECT 
    content_key,
    CASE 
        WHEN COUNT(ct.id) >= 3 THEN '✅ PASS'
        ELSE '❌ FAIL - Missing translations'
    END as status,
    COUNT(ct.id) as translation_count,
    array_agg(ct.language_code ORDER BY ct.language_code) as languages
FROM content_items ci
LEFT JOIN content_translations ct ON ci.id = ct.content_item_id
WHERE ci.content_key IN (
    'mortgage_step1.field.when_needed_ph',
    'mortgage_step1.field.first_home_ph', 
    'mortgage_step1.field.property_ownership_ph'
)
GROUP BY ci.content_key
ORDER BY ci.content_key;
"

echo "🎯 VALIDATION COMPLETE"
echo "If all tests show ✅ PASS, then frontend should work correctly!"
echo "If any tests show ❌ FAIL, check the deployment script and re-run."
EOF

chmod +x validate_production_content.sh

echo "✅ Validation script created: validate_production_content.sh"

# Create API test script
echo "🔌 Creating API test script..."

cat > test_content_api.sh << 'EOF'
#!/bin/bash

# API Content Test Script
# Tests that APIs return mortgage_step1.field.* content correctly

echo "🔌 TESTING CONTENT APIs"

# Test production API endpoints
PRODUCTION_API_URL="https://your-production-api.com"  # REPLACE WITH ACTUAL URL

echo "📡 Testing content API endpoints..."

# Test 1: Check content endpoint
echo "Test 1: Content API endpoint..."
curl -s "$PRODUCTION_API_URL/api/content/mortgage_step1/en" | \
    jq '.[] | select(.content_key | contains("mortgage_step1.field"))' | \
    jq -r '"✅ Found: " + .content_key'

# Test 2: Check dropdown API
echo "Test 2: Dropdown API endpoint..."
curl -s "$PRODUCTION_API_URL/api/v1/dropdowns?screen=mortgage_step1" | \
    jq '.[] | select(.content_key | contains("mortgage_step1.field"))' | \
    jq -r '"✅ Found: " + .content_key'

# Test 3: Frontend validation
echo "Test 3: Frontend content lookup simulation..."
echo "In browser console, test these commands:"
echo "getContent('mortgage_step1.field.when_needed_ph')"
echo "getContent('mortgage_step1.field.first_home_ph')"
echo "getContent('mortgage_step1.field.property_ownership_ph')"
echo ""
echo "Expected: Should return actual content, NOT fallback values"
echo "If returns fallback values, content deployment failed"
EOF

chmod +x test_content_api.sh

echo "✅ API test script created: test_content_api.sh"

# Create deployment checklist
echo "📋 Creating deployment checklist..."

cat > PRODUCTION_DEPLOYMENT_CHECKLIST.md << 'EOF'
# 🚨 PRODUCTION CONTENT DEPLOYMENT CHECKLIST

## Pre-Deployment Verification
- [ ] Confirmed Railway SHORTLINE has mortgage_step1.field.* content keys
- [ ] Verified production database connection and credentials
- [ ] Backed up existing production content_items and content_translations tables
- [ ] Tested deployment script on development/staging environment

## Deployment Steps
1. [ ] Update production database credentials in scripts
2. [ ] Run: `psql $PRODUCTION_CONTENT_URL -f deploy_mortgage_content_to_production.sql`
3. [ ] Check for SQL errors or conflicts
4. [ ] Run: `./validate_production_content.sh`
5. [ ] Verify all validation tests show ✅ PASS

## Post-Deployment Testing
- [ ] Test API endpoints: `/api/content/mortgage_step1/en`
- [ ] Test dropdown APIs: `/api/v1/dropdowns?screen=mortgage_step1`
- [ ] Test frontend content lookup in browser console:
  - [ ] `getContent('mortgage_step1.field.when_needed_ph')` 
  - [ ] `getContent('mortgage_step1.field.first_home_ph')`
  - [ ] `getContent('mortgage_step1.field.property_ownership_ph')`
- [ ] Verify mortgage calculator step 1 dropdowns display correctly
- [ ] Test all three languages (en, he, ru)
- [ ] Verify no fallback content is being used

## Success Criteria
- [ ] ✅ 13+ mortgage_step1.field.* content keys deployed
- [ ] ✅ 3 languages (en, he, ru) for each key
- [ ] ✅ Frontend getContent() returns primary keys, not fallbacks
- [ ] ✅ Mortgage calculator dropdowns display proper content
- [ ] ✅ No console errors about missing content keys

## Rollback Plan (if issues)
- [ ] Restore content_items and content_translations from backup
- [ ] Remove deployed mortgage_step1.field.* keys:
  ```sql
  DELETE FROM content_translations WHERE content_item_id IN (
    SELECT id FROM content_items WHERE content_key LIKE 'mortgage_step1.field%'
  );
  DELETE FROM content_items WHERE content_key LIKE 'mortgage_step1.field%';
  ```
- [ ] Verify frontend falls back to calculate_mortgage_* keys
- [ ] Investigate deployment issues before retrying

## Communication Templates

### Success Message:
```
✅ CONTENT DEPLOYMENT SUCCESSFUL
- Deployed 13 mortgage_step1.field.* content keys
- Added translations for en/he/ru languages  
- Frontend should now display proper content instead of fallbacks
- Mortgage calculator dropdowns working correctly
```

### Failure Message:
```
❌ CONTENT DEPLOYMENT FAILED
- Error: [specific error details]
- Rollback completed, site still functional with fallback keys
- Investigation needed before retry
```
EOF

echo "✅ Deployment checklist created: PRODUCTION_DEPLOYMENT_CHECKLIST.md"

# Summary
echo ""
echo "🎉 RAILWAY → PRODUCTION CONTENT SYNC PACKAGE COMPLETE!"
echo ""
echo "📁 Files Created:"
echo "  ├── deploy_mortgage_content_to_production.sql    # Main deployment script"
echo "  ├── validate_production_content.sh               # Content validation"
echo "  ├── test_content_api.sh                         # API testing"
echo "  ├── PRODUCTION_DEPLOYMENT_CHECKLIST.md          # Step-by-step guide"
echo "  ├── railway_content_check.log                   # Railway verification"
echo "  └── railway_mortgage_content_export.csv         # Exported Railway data"
echo ""
echo "🚨 CRITICAL NEXT STEPS:"
echo "1. Update production database credentials in all scripts"
echo "2. Review deployment checklist and follow all steps"
echo "3. Run deployment on production database"
echo "4. Test frontend content lookup functionality"
echo ""
echo "💡 This fixes the exact issue production team identified:"
echo "   Frontend expects mortgage_step1.field.* keys"
echo "   But production only has calculate_mortgage_* fallbacks"
echo ""
echo "✅ After deployment, frontend should display proper content!"
#!/bin/bash

# 🌐 EXTERNAL ENDPOINT VALIDATION
# Tests public endpoints for the BankiMonline deployment system

echo "🌐 TESTING EXTERNAL ENDPOINTS"
echo "============================="
echo ""

# Test dev2.bankimonline.com endpoints
echo "🧪 Testing TEST server endpoints:"
echo ""

echo -n "1. HTTPS Frontend Access: "
response=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 https://dev2.bankimonline.com/ 2>/dev/null)
if [[ "$response" == "200" ]]; then
    echo "✅ PASS (HTTP $response)"
else
    echo "❌ FAIL (HTTP $response)"
fi

echo -n "2. API via HTTPS Proxy: "
response=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 https://dev2.bankimonline.com/api/health 2>/dev/null)
if [[ "$response" == "200" ]]; then
    echo "✅ PASS (HTTP $response)"
else
    echo "❌ FAIL (HTTP $response)"
fi

echo -n "3. HTTP to HTTPS Redirect: "
response=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 http://dev2.bankimonline.com/ 2>/dev/null)
if [[ "$response" == "301" ]]; then
    echo "✅ PASS (HTTP $response - Redirect working)"
else
    echo "❌ FAIL (HTTP $response)"
fi

echo ""
echo "📊 API Response Content:"
echo "------------------------"
curl -s --max-time 10 https://dev2.bankimonline.com/api/health | jq '.' 2>/dev/null || echo "Could not parse JSON response"

echo ""
echo "🏦 Testing PRODUCTION server endpoints:"
echo ""

echo -n "1. HTTPS Frontend Access: "
response=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 https://bankimonline.com/ 2>/dev/null)
if [[ "$response" == "200" ]]; then
    echo "✅ PASS (HTTP $response)"
else
    echo "❌ FAIL (HTTP $response)"
fi

echo -n "2. API Health Check: "
response=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 http://185.253.72.80:8003/api/health 2>/dev/null)
if [[ "$response" == "200" ]]; then
    echo "✅ PASS (HTTP $response)"
else
    echo "❌ FAIL (HTTP $response)"
fi

echo ""
echo "🎉 EXTERNAL ENDPOINT VALIDATION COMPLETE"
echo "========================================"
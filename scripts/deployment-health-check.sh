#!/bin/bash
set -e
echo "🔍 POST-DEPLOYMENT HEALTH CHECK"
echo "================================"
FAILURES=0

# Test PM2 Status
echo -n "Testing PM2 status... "
if pm2 status | grep -q "bankim-api.*online"; then
    echo "✅ PASS"
else
    echo "❌ FAIL"
    FAILURES=$((FAILURES+1))
fi

# Test API Health Endpoint
echo -n "Testing API health endpoint... "
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8003/api/health)
if [ "$RESPONSE" = "200" ]; then
    echo "✅ PASS (HTTP $RESPONSE)"
else
    echo "❌ FAIL (HTTP $RESPONSE)"
    FAILURES=$((FAILURES+1))
fi

# Test HTTPS Frontend
echo -n "Testing HTTPS frontend... "
if [ -n "$1" ] && [ "$1" = "test" ]; then
    DOMAIN="dev2.bankimonline.com"
else
    DOMAIN="bankimonline.com"
fi

RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" https://$DOMAIN/ || echo "000")
if [ "$RESPONSE" = "200" ]; then
    echo "✅ PASS (HTTP $RESPONSE)"
else
    echo "❌ FAIL (HTTP $RESPONSE)"  
    FAILURES=$((FAILURES+1))
fi

# Test API via HTTPS
echo -n "Testing API via HTTPS... "
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" https://$DOMAIN/api/health || echo "000")
if [ "$RESPONSE" = "200" ]; then
    echo "✅ PASS (HTTP $RESPONSE)"
else
    echo "❌ FAIL (HTTP $RESPONSE)"
    FAILURES=$((FAILURES+1))
fi

# Test HTTP Redirect
echo -n "Testing HTTP to HTTPS redirect... "
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://$DOMAIN/ || echo "000")
if [ "$RESPONSE" = "301" ] || [ "$RESPONSE" = "302" ]; then
    echo "✅ PASS (HTTP $RESPONSE)"
else
    echo "❌ FAIL (HTTP $RESPONSE)"
    FAILURES=$((FAILURES+1))
fi

echo "================================"
if [ $FAILURES -eq 0 ]; then
    echo "🎉 ALL HEALTH CHECKS PASSED"
    exit 0
else
    echo "🚨 $FAILURES HEALTH CHECKS FAILED"
    exit 1
fi
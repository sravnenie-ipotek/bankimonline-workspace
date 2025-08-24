#!/bin/bash
# Remove set -e to allow retries
echo "🔍 POST-DEPLOYMENT HEALTH CHECK"
echo "================================"
FAILURES=0

# Function to check PM2 with retries
check_pm2_status() {
    local retries=3
    local wait_time=5
    
    for i in $(seq 1 $retries); do
        if pm2 status | grep -q "bankim-api.*online"; then
            return 0
        fi
        
        if [ $i -lt $retries ]; then
            echo "Retry $i/$retries in ${wait_time}s..."
            sleep $wait_time
            # Try to restart PM2 if it's errored
            pm2 status | grep -q "bankim-api.*errored" && pm2 restart bankim-api --update-env > /dev/null 2>&1
        fi
    done
    return 1
}

# Function to check API with retries
check_api_health() {
    local retries=3
    local wait_time=5
    
    for i in $(seq 1 $retries); do
        RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 http://localhost:8003/api/health || echo "000")
        if [ "$RESPONSE" = "200" ]; then
            return 0
        fi
        
        if [ $i -lt $retries ]; then
            echo "Retry $i/$retries in ${wait_time}s (got HTTP $RESPONSE)..."
            sleep $wait_time
        fi
    done
    return 1
}

# Test PM2 Status with retries
echo -n "Testing PM2 status... "
if check_pm2_status; then
    echo "✅ PASS"
else
    echo "❌ FAIL"
    FAILURES=$((FAILURES+1))
fi

# Test API Health Endpoint with retries
echo -n "Testing API health endpoint... "
if check_api_health; then
    RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 http://localhost:8003/api/health)
    echo "✅ PASS (HTTP $RESPONSE)"
else
    echo "❌ FAIL"
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
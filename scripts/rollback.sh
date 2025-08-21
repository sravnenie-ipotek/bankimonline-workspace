#!/bin/bash

# 🔄 Emergency Rollback Script for Professional CI/CD Pipeline
# Usage: ./scripts/rollback.sh [reason]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
TARGET_HOST="45.83.42.74"
TARGET_USER="root"
HEALTH_CHECK_URL="http://localhost:8003/api/health"
ROLLBACK_REASON="${1:-Manual rollback requested}"

echo -e "${RED}🚨 EMERGENCY ROLLBACK INITIATED${NC}"
echo -e "${YELLOW}Reason: ${ROLLBACK_REASON}${NC}"
echo -e "${BLUE}Time: $(date)${NC}"
echo ""

# Function to print status
print_status() {
    echo -e "${1}${2}${NC}"
}

# Function to check health
check_health() {
    local port=$1
    local timeout=${2:-30}
    
    for i in $(seq 1 $timeout); do
        if curl -sf "http://localhost:$port/api/health" >/dev/null 2>&1; then
            return 0
        fi
        sleep 1
    done
    return 1
}

# Function to get container status
get_container_status() {
    local container_name=$1
    
    if docker ps --format "table {{.Names}}\t{{.Status}}" | grep -q "$container_name.*Up"; then
        echo "running"
    elif docker ps -a --format "table {{.Names}}\t{{.Status}}" | grep -q "$container_name"; then
        echo "stopped"
    else
        echo "missing"
    fi
}

print_status "$BLUE" "🔍 Analyzing current deployment state..."

# Check current environment
BLUE_STATUS=$(get_container_status "bankimonline-blue")
GREEN_STATUS=$(get_container_status "bankimonline-green")

print_status "$BLUE" "📊 Environment Status:"
print_status "$BLUE" "   Blue environment: $BLUE_STATUS"
print_status "$BLUE" "   Green environment: $GREEN_STATUS"

# Determine rollback strategy
if [ "$BLUE_STATUS" = "running" ] && [ "$GREEN_STATUS" = "stopped" ]; then
    CURRENT="blue"
    FALLBACK="green"
    CURRENT_PORT="8003"
    FALLBACK_PORT="8004"
elif [ "$GREEN_STATUS" = "running" ] && [ "$BLUE_STATUS" = "stopped" ]; then
    CURRENT="green"
    FALLBACK="blue"
    CURRENT_PORT="8004"
    FALLBACK_PORT="8003"
elif [ "$BLUE_STATUS" = "running" ] && [ "$GREEN_STATUS" = "running" ]; then
    # Both running - check which one is serving traffic
    if check_health 8003 5; then
        CURRENT="blue"
        FALLBACK="green"
        CURRENT_PORT="8003"
        FALLBACK_PORT="8004"
    else
        CURRENT="green"
        FALLBACK="blue"
        CURRENT_PORT="8004"
        FALLBACK_PORT="8003"
    fi
else
    print_status "$RED" "❌ Cannot determine deployment state for rollback"
    print_status "$YELLOW" "   Blue: $BLUE_STATUS"
    print_status "$YELLOW" "   Green: $GREEN_STATUS"
    exit 1
fi

print_status "$YELLOW" "🎯 Rollback Plan:"
print_status "$YELLOW" "   Current: $CURRENT (port $CURRENT_PORT)"
print_status "$YELLOW" "   Fallback: $FALLBACK (port $FALLBACK_PORT)"
echo ""

# Check if fallback environment exists and get last known good image
print_status "$BLUE" "🔍 Checking fallback environment..."

FALLBACK_IMAGE=""
if [ "$(get_container_status "bankimonline-$FALLBACK")" != "missing" ]; then
    FALLBACK_IMAGE=$(docker inspect bankimonline-$FALLBACK --format='{{.Config.Image}}' 2>/dev/null || echo "")
fi

if [ -z "$FALLBACK_IMAGE" ]; then
    print_status "$YELLOW" "⚠️  No fallback container found. Searching for last known good image..."
    
    # Find last known good image from Docker images
    FALLBACK_IMAGE=$(docker images --format "table {{.Repository}}:{{.Tag}}\t{{.CreatedAt}}" | \
                     grep "ghcr.io.*bankimonline" | \
                     sort -k2 -r | \
                     head -n 2 | \
                     tail -n 1 | \
                     awk '{print $1}')
    
    if [ -z "$FALLBACK_IMAGE" ]; then
        print_status "$RED" "❌ No fallback image available for rollback"
        print_status "$YELLOW" "Available images:"
        docker images | grep bankimonline || echo "No bankimonline images found"
        exit 1
    fi
fi

print_status "$GREEN" "✅ Fallback image found: $FALLBACK_IMAGE"

# Confirm rollback
echo ""
print_status "$YELLOW" "⚠️  Are you sure you want to proceed with rollback? (y/N)"
read -r confirmation
if [[ ! "$confirmation" =~ ^[Yy]$ ]]; then
    print_status "$BLUE" "ℹ️  Rollback cancelled by user"
    exit 0
fi

echo ""
print_status "$RED" "🚀 STARTING ROLLBACK PROCEDURE..."

# Step 1: Stop current problematic environment
print_status "$BLUE" "1️⃣  Stopping current problematic environment ($CURRENT)..."
docker stop bankimonline-$CURRENT 2>/dev/null || true

# Step 2: Start or restart fallback environment
print_status "$BLUE" "2️⃣  Starting fallback environment ($FALLBACK)..."

# Stop and remove existing fallback container
docker stop bankimonline-$FALLBACK 2>/dev/null || true
docker rm bankimonline-$FALLBACK 2>/dev/null || true

# Start fallback environment on main port (8003)
docker run -d \
    --name bankimonline-$FALLBACK \
    --restart unless-stopped \
    -p 8003:8003 \
    --env-file /app/.env.production \
    -v /app/uploads:/app/uploads \
    -v /app/logs:/app/logs \
    --memory=1g \
    --cpus=1.5 \
    "$FALLBACK_IMAGE"

# Step 3: Health check fallback environment
print_status "$BLUE" "3️⃣  Health checking fallback environment..."
if check_health 8003 30; then
    print_status "$GREEN" "✅ Fallback environment is healthy"
else
    print_status "$RED" "❌ Fallback environment health check failed"
    print_status "$YELLOW" "📋 Container logs:"
    docker logs bankimonline-$FALLBACK
    exit 1
fi

# Step 4: Update nginx if exists
print_status "$BLUE" "4️⃣  Updating traffic routing..."
if [ -f /etc/nginx/sites-available/bankimonline ]; then
    sed -i 's/proxy_pass.*:80[0-9][0-9]/proxy_pass http:\/\/localhost:8003/' /etc/nginx/sites-available/bankimonline
    nginx -t && systemctl reload nginx
    print_status "$GREEN" "✅ Nginx configuration updated"
fi

# Step 5: Final validation
print_status "$BLUE" "5️⃣  Final validation..."
sleep 5

if check_health 8003 10; then
    print_status "$GREEN" "✅ ROLLBACK COMPLETED SUCCESSFULLY"
    print_status "$GREEN" "   Active environment: $FALLBACK"
    print_status "$GREEN" "   Image: $FALLBACK_IMAGE"
    print_status "$GREEN" "   URL: https://dev2.bankimonline.com"
    print_status "$GREEN" "   Time: $(date)"
    
    # Clean up problematic environment
    print_status "$BLUE" "🧹 Cleaning up problematic environment..."
    docker rm bankimonline-$CURRENT 2>/dev/null || true
    
else
    print_status "$RED" "❌ ROLLBACK FAILED - SYSTEM UNSTABLE"
    print_status "$YELLOW" "Manual intervention required immediately"
    exit 1
fi

echo ""
print_status "$BLUE" "📋 Rollback Summary:"
print_status "$BLUE" "   Reason: $ROLLBACK_REASON"
print_status "$BLUE" "   Rolled back from: $CURRENT"
print_status "$BLUE" "   Rolled back to: $FALLBACK"
print_status "$BLUE" "   Image: $FALLBACK_IMAGE"
print_status "$BLUE" "   Completed: $(date)"

echo ""
print_status "$YELLOW" "⚠️  Remember to:"
print_status "$YELLOW" "   1. Investigate the root cause of the issue"
print_status "$YELLOW" "   2. Fix the problem before next deployment"
print_status "$YELLOW" "   3. Update incident documentation"
print_status "$YELLOW" "   4. Consider implementing additional monitoring"
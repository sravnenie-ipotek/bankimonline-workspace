#!/bin/bash

# 🩺 Comprehensive Health Check Script for Professional CI/CD Pipeline
# Usage: ./scripts/health-check.sh [--environment production|staging] [--port 8003] [--timeout 30]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Default configuration
ENVIRONMENT="production"
PORT="8003"
TIMEOUT="30"
HOST="localhost"
VERBOSE=false
JSON_OUTPUT=false

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --environment)
            ENVIRONMENT="$2"
            shift 2
            ;;
        --port)
            PORT="$2"
            shift 2
            ;;
        --timeout)
            TIMEOUT="$2"
            shift 2
            ;;
        --host)
            HOST="$2"
            shift 2
            ;;
        --verbose)
            VERBOSE=true
            shift
            ;;
        --json)
            JSON_OUTPUT=true
            shift
            ;;
        --help)
            echo "Health Check Script for BankiMonline"
            echo ""
            echo "Usage: $0 [options]"
            echo ""
            echo "Options:"
            echo "  --environment   Target environment (production|staging) [default: production]"
            echo "  --port         Target port [default: 8003]"
            echo "  --timeout      Timeout in seconds [default: 30]"
            echo "  --host         Target host [default: localhost]"
            echo "  --verbose      Enable verbose output"
            echo "  --json         Output results in JSON format"
            echo "  --help         Show this help message"
            echo ""
            echo "Examples:"
            echo "  $0                                    # Basic health check"
            echo "  $0 --port 8004 --timeout 60         # Check staging environment"
            echo "  $0 --json --verbose                  # JSON output with details"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
done

# Function to print status (only if not JSON mode)
print_status() {
    if [ "$JSON_OUTPUT" = false ]; then
        echo -e "${1}${2}${NC}"
    fi
}

# Function to print verbose info
print_verbose() {
    if [ "$VERBOSE" = true ] && [ "$JSON_OUTPUT" = false ]; then
        echo -e "${CYAN}   ${1}${NC}"
    fi
}

# Initialize results
declare -A RESULTS
OVERALL_STATUS="healthy"
START_TIME=$(date +%s)

# Function to record result
record_result() {
    local test_name="$1"
    local status="$2"
    local details="$3"
    local response_time="$4"
    
    RESULTS["${test_name}_status"]="$status"
    RESULTS["${test_name}_details"]="$details"
    RESULTS["${test_name}_response_time"]="$response_time"
    
    if [ "$status" != "pass" ]; then
        OVERALL_STATUS="unhealthy"
    fi
}

# Function to make HTTP request with timing
http_request() {
    local url="$1"
    local expected_status="${2:-200}"
    local timeout="${3:-10}"
    
    local start_time=$(date +%s.%3N)
    local response=$(curl -s -w "%{http_code}" -o /tmp/health_response --connect-timeout "$timeout" --max-time "$timeout" "$url" 2>/dev/null || echo "000")
    local end_time=$(date +%s.%3N)
    local response_time=$(echo "$end_time - $start_time" | bc -l 2>/dev/null || echo "0")
    
    echo "$response|$response_time"
}

print_status "$BLUE" "🩺 Starting comprehensive health check..."
print_status "$BLUE" "   Environment: $ENVIRONMENT"
print_status "$BLUE" "   Target: $HOST:$PORT"
print_status "$BLUE" "   Timeout: ${TIMEOUT}s"
echo ""

# Test 1: Basic Connectivity
print_status "$CYAN" "1️⃣  Testing basic connectivity..."
start_test=$(date +%s.%3N)

if timeout "$TIMEOUT" bash -c "</dev/tcp/$HOST/$PORT" 2>/dev/null; then
    end_test=$(date +%s.%3N)
    response_time=$(echo "$end_test - $start_test" | bc -l 2>/dev/null || echo "0")
    record_result "connectivity" "pass" "Port $PORT is reachable" "$response_time"
    print_status "$GREEN" "   ✅ Port $PORT is reachable"
    print_verbose "Response time: ${response_time}s"
else
    record_result "connectivity" "fail" "Port $PORT is not reachable" "0"
    print_status "$RED" "   ❌ Port $PORT is not reachable"
fi

# Test 2: Health Endpoint
print_status "$CYAN" "2️⃣  Testing health endpoint..."
health_result=$(http_request "http://$HOST:$PORT/api/health" 200 10)
health_status=$(echo "$health_result" | cut -d'|' -f1)
health_time=$(echo "$health_result" | cut -d'|' -f2)

if [ "$health_status" = "200" ]; then
    health_body=$(cat /tmp/health_response 2>/dev/null || echo "{}")
    record_result "health_endpoint" "pass" "Health endpoint responding correctly" "$health_time"
    print_status "$GREEN" "   ✅ Health endpoint responding (${health_time}s)"
    print_verbose "Response: $health_body"
else
    record_result "health_endpoint" "fail" "Health endpoint returned status $health_status" "$health_time"
    print_status "$RED" "   ❌ Health endpoint failed (status: $health_status)"
fi

# Test 3: API Endpoints
print_status "$CYAN" "3️⃣  Testing critical API endpoints..."

# Test calculation parameters endpoint
calc_result=$(http_request "http://$HOST:$PORT/api/v1/calculation-parameters?business_path=mortgage" 200 15)
calc_status=$(echo "$calc_result" | cut -d'|' -f1)
calc_time=$(echo "$calc_result" | cut -d'|' -f2)

if [ "$calc_status" = "200" ]; then
    record_result "api_calculation" "pass" "Calculation parameters API responding" "$calc_time"
    print_status "$GREEN" "   ✅ Calculation parameters API (${calc_time}s)"
else
    record_result "api_calculation" "fail" "Calculation parameters API failed with status $calc_status" "$calc_time"
    print_status "$RED" "   ❌ Calculation parameters API failed (status: $calc_status)"
fi

# Test banks endpoint
banks_result=$(http_request "http://$HOST:$PORT/api/v1/banks" 200 10)
banks_status=$(echo "$banks_result" | cut -d'|' -f1)
banks_time=$(echo "$banks_result" | cut -d'|' -f2)

if [ "$banks_status" = "200" ]; then
    record_result "api_banks" "pass" "Banks API responding" "$banks_time"
    print_status "$GREEN" "   ✅ Banks API (${banks_time}s)"
else
    record_result "api_banks" "fail" "Banks API failed with status $banks_status" "$banks_time"
    print_status "$RED" "   ❌ Banks API failed (status: $banks_status)"
fi

# Test 4: Database Connectivity (via API)
print_status "$CYAN" "4️⃣  Testing database connectivity..."
db_result=$(http_request "http://$HOST:$PORT/api/v1/cities" 200 15)
db_status=$(echo "$db_result" | cut -d'|' -f1)
db_time=$(echo "$db_result" | cut -d'|' -f2)

if [ "$db_status" = "200" ]; then
    record_result "database" "pass" "Database connectivity via cities API" "$db_time"
    print_status "$GREEN" "   ✅ Database connectivity (${db_time}s)"
else
    record_result "database" "fail" "Database connectivity failed, cities API status $db_status" "$db_time"
    print_status "$RED" "   ❌ Database connectivity failed (status: $db_status)"
fi

# Test 5: Container Health (if running in container environment)
print_status "$CYAN" "5️⃣  Testing container health..."
if command -v docker >/dev/null 2>&1; then
    container_name="bankimonline-blue"
    if [ "$PORT" = "8004" ]; then
        container_name="bankimonline-green"
    fi
    
    if docker ps --format "table {{.Names}}\t{{.Status}}" | grep -q "$container_name.*Up"; then
        container_status=$(docker inspect "$container_name" --format='{{.State.Health.Status}}' 2>/dev/null || echo "unknown")
        uptime=$(docker inspect "$container_name" --format='{{.State.StartedAt}}' 2>/dev/null || echo "unknown")
        
        if [ "$container_status" = "healthy" ] || [ "$container_status" = "unknown" ]; then
            record_result "container" "pass" "Container $container_name is running" "0"
            print_status "$GREEN" "   ✅ Container $container_name is healthy"
            print_verbose "Started: $uptime"
        else
            record_result "container" "fail" "Container $container_name status: $container_status" "0"
            print_status "$RED" "   ❌ Container $container_name is unhealthy"
        fi
    else
        record_result "container" "fail" "Container $container_name not found or not running" "0"
        print_status "$RED" "   ❌ Container $container_name not running"
    fi
else
    record_result "container" "skip" "Docker not available" "0"
    print_status "$YELLOW" "   ⚠️  Docker not available, skipping container check"
fi

# Test 6: Performance Metrics
print_status "$CYAN" "6️⃣  Testing performance metrics..."
perf_start=$(date +%s.%3N)
perf_result=$(http_request "http://$HOST:$PORT/api/health" 200 5)
perf_time=$(echo "$perf_result" | cut -d'|' -f2)

if (( $(echo "$perf_time < 2.0" | bc -l 2>/dev/null || echo "1") )); then
    record_result "performance" "pass" "Response time under 2 seconds" "$perf_time"
    print_status "$GREEN" "   ✅ Performance acceptable (${perf_time}s)"
else
    record_result "performance" "warn" "Response time over 2 seconds" "$perf_time"
    print_status "$YELLOW" "   ⚠️  Performance degraded (${perf_time}s)"
fi

# Calculate total execution time
END_TIME=$(date +%s)
TOTAL_TIME=$((END_TIME - START_TIME))

# Generate summary
echo ""
if [ "$OVERALL_STATUS" = "healthy" ]; then
    print_status "$GREEN" "🎉 Overall Status: HEALTHY"
else
    print_status "$RED" "🚨 Overall Status: UNHEALTHY"
fi

print_status "$BLUE" "   Total execution time: ${TOTAL_TIME}s"
print_status "$BLUE" "   Timestamp: $(date)"

# Output results
if [ "$JSON_OUTPUT" = true ]; then
    # Generate JSON output
    echo "{"
    echo "  \"timestamp\": \"$(date -Iseconds)\","
    echo "  \"environment\": \"$ENVIRONMENT\","
    echo "  \"target\": \"$HOST:$PORT\","
    echo "  \"overall_status\": \"$OVERALL_STATUS\","
    echo "  \"execution_time\": $TOTAL_TIME,"
    echo "  \"tests\": {"
    
    first=true
    for key in connectivity health_endpoint api_calculation api_banks database container performance; do
        if [ "$first" = true ]; then
            first=false
        else
            echo ","
        fi
        
        echo "    \"$key\": {"
        echo "      \"status\": \"${RESULTS[${key}_status]}\","
        echo "      \"details\": \"${RESULTS[${key}_details]}\","
        echo "      \"response_time\": \"${RESULTS[${key}_response_time]}\""
        echo -n "    }"
    done
    
    echo ""
    echo "  }"
    echo "}"
else
    # Print detailed results if verbose
    if [ "$VERBOSE" = true ]; then
        echo ""
        print_status "$BLUE" "📋 Detailed Results:"
        for key in connectivity health_endpoint api_calculation api_banks database container performance; do
            status="${RESULTS[${key}_status]}"
            details="${RESULTS[${key}_details]}"
            response_time="${RESULTS[${key}_response_time]}"
            
            case $status in
                pass)
                    print_status "$GREEN" "   ✅ $key: $details (${response_time}s)"
                    ;;
                fail)
                    print_status "$RED" "   ❌ $key: $details (${response_time}s)"
                    ;;
                warn)
                    print_status "$YELLOW" "   ⚠️  $key: $details (${response_time}s)"
                    ;;
                skip)
                    print_status "$YELLOW" "   ⏭️  $key: $details"
                    ;;
            esac
        done
    fi
fi

# Cleanup
rm -f /tmp/health_response

# Exit with appropriate code
if [ "$OVERALL_STATUS" = "healthy" ]; then
    exit 0
else
    exit 1
fi
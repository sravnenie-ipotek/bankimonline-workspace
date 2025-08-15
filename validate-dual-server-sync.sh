#!/bin/bash
# 🚨 CRITICAL: Dual-Server Dropdown Synchronization Validation Script
# MANDATORY validation script for dual-server dropdown synchronization
# MUST be run after ANY dropdown implementation changes

set -e  # Exit on any error

echo "🚨 CRITICAL: Validating dual-server dropdown synchronization"
echo "============================================================"

# Configuration
LEGACY_PORT=8003
PACKAGES_PORT=8004
SCREENS=("mortgage_step3" "credit_step3" "refinance_step3")
LANGUAGES=("en" "he" "ru")
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to log with colors
log_error() {
    echo -e "${RED}❌ $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️ $1${NC}"
}

# Function to compare server responses
compare_servers() {
    local screen=$1
    local language=$2
    
    echo "📊 Testing ${screen}/${language}..."
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    # Get responses from both servers
    local legacy_response
    local packages_response
    
    legacy_response=$(curl -s -f "http://localhost:${LEGACY_PORT}/api/dropdowns/${screen}/${language}" 2>/dev/null || echo "ERROR")
    packages_response=$(curl -s -f "http://localhost:${PACKAGES_PORT}/api/dropdowns/${screen}/${language}" 2>/dev/null || echo "ERROR")
    
    # Check if both servers responded
    if [[ "$legacy_response" == "ERROR" ]]; then
        log_error "CRITICAL: Legacy server (${LEGACY_PORT}) not responding for ${screen}/${language}"
        FAILED_TESTS=$((FAILED_TESTS + 1))
        return 1
    fi
    
    if [[ "$packages_response" == "ERROR" ]]; then
        log_error "CRITICAL: Packages server (${PACKAGES_PORT}) not responding for ${screen}/${language}"  
        FAILED_TESTS=$((FAILED_TESTS + 1))
        return 1
    fi
    
    # Extract and compare dropdown options (core business logic)
    local legacy_options
    local packages_options
    
    legacy_options=$(echo "$legacy_response" | jq -r '.options // {}' | jq -S . 2>/dev/null || echo "PARSE_ERROR")
    packages_options=$(echo "$packages_response" | jq -r '.options // {}' | jq -S . 2>/dev/null || echo "PARSE_ERROR")
    
    if [[ "$legacy_options" == "PARSE_ERROR" || "$packages_options" == "PARSE_ERROR" ]]; then
        log_error "CRITICAL: JSON parsing failed for ${screen}/${language}"
        FAILED_TESTS=$((FAILED_TESTS + 1))
        return 1
    fi
    
    if [[ "$legacy_options" == "$packages_options" ]]; then
        log_success "PASS: ${screen}/${language} - Options match between servers"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        log_error "CRITICAL FAILURE: ${screen}/${language} - Options DO NOT match"
        echo "Legacy options keys:"
        echo "$legacy_options" | jq 'keys' 2>/dev/null || echo "Failed to parse legacy options"
        echo "Packages options keys:"  
        echo "$packages_options" | jq 'keys' 2>/dev/null || echo "Failed to parse packages options"
        log_error "This WILL cause production failures when switching servers"
        FAILED_TESTS=$((FAILED_TESTS + 1))
        return 1
    fi
    
    # Compare placeholders and labels (secondary validation)
    local legacy_placeholders
    local packages_placeholders
    
    legacy_placeholders=$(echo "$legacy_response" | jq -r '.placeholders // {}' | jq -S . 2>/dev/null)
    packages_placeholders=$(echo "$packages_response" | jq -r '.placeholders // {}' | jq -S . 2>/dev/null)
    
    if [[ "$legacy_placeholders" != "$packages_placeholders" ]]; then
        log_warning "WARNING: ${screen}/${language} - Placeholders differ between servers"
    fi
}

# Check prerequisites
echo "🔍 Checking prerequisites..."

# Check if jq is installed
if ! command -v jq &> /dev/null; then
    log_error "jq is required for JSON processing. Install with: brew install jq (macOS) or apt-get install jq (Ubuntu)"
    exit 1
fi

# Check if curl is available
if ! command -v curl &> /dev/null; then
    log_error "curl is required for API testing"
    exit 1
fi

# Verify both servers are accessible
echo "🔍 Verifying server accessibility..."

if ! curl -s -f "http://localhost:${LEGACY_PORT}/api/dropdowns/mortgage_step3/en" >/dev/null 2>&1; then
    log_error "Legacy server (port ${LEGACY_PORT}) is not accessible"
    echo "Start legacy server with: node server/server-db.js"
    exit 1
fi

if ! curl -s -f "http://localhost:${PACKAGES_PORT}/api/dropdowns/mortgage_step3/en" >/dev/null 2>&1; then
    log_error "Packages server (port ${PACKAGES_PORT}) is not accessible"
    echo "Start packages server with: node server/server-packages.js"
    exit 1
fi

log_success "Both servers are accessible"

# Test all screen/language combinations
echo ""
echo "🔍 Testing all screen/language combinations..."
echo "=============================================="

for screen in "${SCREENS[@]}"; do
    for language in "${LANGUAGES[@]}"; do
        compare_servers "$screen" "$language" || true  # Continue on failure to get full report
    done
done

# Generate final report
echo ""
echo "📊 VALIDATION RESULTS:"
echo "======================"  
echo "Total tests: $TOTAL_TESTS"
echo "Passed: $PASSED_TESTS"
echo "Failed: $FAILED_TESTS"

if [[ $FAILED_TESTS -gt 0 ]]; then
    echo ""
    log_error "CRITICAL: $FAILED_TESTS tests failed"
    log_error "DUAL-SERVER SYNCHRONIZATION HAS FAILED"
    log_error "DO NOT DEPLOY - Will cause production failures"
    echo ""
    echo "Required actions:"
    echo "1. Review failed tests above"
    echo "2. Fix packages server implementation to match legacy server"
    echo "3. Re-run this validation script"
    echo "4. Only deploy when all tests pass"
    exit 1
else
    echo ""
    log_success "SUCCESS: All dual-server synchronization tests passed"
    log_success "Servers are synchronized and ready for deployment"
    echo ""
    echo "🚀 DEPLOYMENT APPROVED: Both servers return identical dropdown data"
    exit 0
fi
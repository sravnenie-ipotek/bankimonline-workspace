#!/bin/bash

# Pre-Deployment CI/CD Configuration Validator
# This script checks for common deployment issues BEFORE pushing to main/production

echo "🔍 PRE-DEPLOYMENT CI/CD VALIDATOR"
echo "================================="
echo "Checking for common issues that cause deployment failures..."
echo

ERRORS=0
WARNINGS=0

# Color codes for output
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

# Function to check for errors
check_error() {
    local test_name=$1
    local condition=$2
    local error_msg=$3
    
    echo -n "✓ $test_name... "
    if eval "$condition"; then
        echo -e "${GREEN}PASS${NC}"
    else
        echo -e "${RED}FAIL${NC}"
        echo "  └─ $error_msg"
        ERRORS=$((ERRORS + 1))
    fi
}

# Function to check for warnings
check_warning() {
    local test_name=$1
    local condition=$2
    local warning_msg=$3
    
    echo -n "✓ $test_name... "
    if eval "$condition"; then
        echo -e "${GREEN}OK${NC}"
    else
        echo -e "${YELLOW}WARNING${NC}"
        echo "  └─ $warning_msg"
        WARNINGS=$((WARNINGS + 1))
    fi
}

echo "📋 GITHUB ACTIONS YAML VALIDATION"
echo "---------------------------------"

# Check 1: YAML syntax validation
for file in .github/workflows/*.yml; do
    if [ -f "$file" ]; then
        filename=$(basename "$file")
        python3 -c "import yaml; yaml.safe_load(open('$file'))" 2>/dev/null
        if [ $? -eq 0 ]; then
            echo -e "✓ $filename syntax... ${GREEN}VALID${NC}"
        else
            echo -e "✓ $filename syntax... ${RED}INVALID${NC}"
            echo "  └─ Fix YAML syntax errors before deployment"
            ERRORS=$((ERRORS + 1))
        fi
    fi
done

# Check 2: Nested heredocs (common YAML error)
echo -n "✓ Checking for nested heredocs... "
NESTED_HEREDOC=0
for file in .github/workflows/*.yml; do
    if [ -f "$file" ]; then
        # Look for SSH blocks with heredocs that contain another heredoc
        if grep -A 30 "ssh.*<<.*'EOF'" "$file" 2>/dev/null | grep -q "cat.*<<.*EOF"; then
            NESTED_HEREDOC=1
            break
        fi
    fi
done
if [ $NESTED_HEREDOC -eq 0 ]; then
    echo -e "${GREEN}NONE FOUND${NC}"
else
    echo -e "${RED}FOUND${NC}"
    echo "  └─ Nested heredocs cause YAML syntax errors. Use echo statements instead."
    ERRORS=$((ERRORS + 1))
fi

echo
echo "📦 PACKAGE CONFIGURATION"
echo "------------------------"

# Check 3: Main package.json scripts
check_error "Main package.json has 'dev' script" \
    "grep -q '\"dev\":' package.json" \
    "Add 'dev' script to package.json"

check_error "Main package.json has 'build' script" \
    "grep -q '\"build\":' package.json" \
    "Add 'build' script to package.json"

check_error "Main package.json has 'start' script" \
    "grep -q '\"start\":' package.json" \
    "Add 'start' script to package.json"

# Check 4: Frontend package.json scripts
check_error "Frontend has version:update script" \
    "grep -q '\"version:update\":' mainapp/package.json" \
    "Add version:update script to mainapp/package.json"

check_error "Frontend has build script" \
    "grep -q '\"build\":' mainapp/package.json" \
    "Add build script to mainapp/package.json"

echo
echo "🔧 PM2 CONFIGURATION"
echo "--------------------"

# Check 5: ecosystem.config.js exists
check_error "ecosystem.config.js exists" \
    "[ -f ecosystem.config.js ]" \
    "Create ecosystem.config.js for PM2 process management"

if [ -f ecosystem.config.js ]; then
    check_warning "ecosystem.config.js has test environment" \
        "grep -q 'env_test' ecosystem.config.js" \
        "Add env_test configuration for test deployments"
    
    check_warning "ecosystem.config.js has production environment" \
        "grep -q 'env_production' ecosystem.config.js" \
        "Add env_production configuration for production deployments"
fi

echo
echo "📚 CRITICAL DEPENDENCIES"
echo "------------------------"

# Check 6: Critical backend dependencies
check_error "dotenv dependency exists" \
    "grep -q '\"dotenv\"' package.json" \
    "npm install dotenv (required for environment variables)"

check_error "express dependency exists" \
    "grep -q '\"express\"' package.json" \
    "npm install express (required for API server)"

check_error "pg dependency exists" \
    "grep -q '\"pg\"' package.json" \
    "npm install pg (required for PostgreSQL)"

check_error "cors dependency exists" \
    "grep -q '\"cors\"' package.json" \
    "npm install cors (required for CORS handling)"

echo
echo "📁 SERVER FILES"
echo "---------------"

# Check 7: Server files exist
check_error "server/server-db.js exists" \
    "[ -f server/server-db.js ]" \
    "server/server-db.js is missing - required for API server"

check_warning "server/serve.js exists" \
    "[ -f server/serve.js ]" \
    "server/serve.js is missing - may be needed for static file serving"

echo
echo "🔍 NGINX CONFIGURATION PATTERNS"
echo "--------------------------------"

# Check 8: Check for common NGINX misconfigurations in CI/CD
echo -n "✓ Checking NGINX try_files patterns... "
BAD_TRY_FILES=0
for file in .github/workflows/*.yml; do
    if [ -f "$file" ]; then
        # Look for malformed try_files directives
        if grep -q 'try_files / /index.html' "$file" 2>/dev/null; then
            BAD_TRY_FILES=1
            break
        fi
    fi
done
if [ $BAD_TRY_FILES -eq 0 ]; then
    echo -e "${GREEN}CORRECT${NC}"
else
    echo -e "${RED}MALFORMED${NC}"
    echo "  └─ Should be: try_files \$uri \$uri/ /index.html"
    ERRORS=$((ERRORS + 1))
fi

# Check 9: Check for environment-specific domains
echo -n "✓ Checking for hardcoded domains... "
if grep -q "server_name.*bankimonline.com" .github/workflows/deploy-multi-env.yml 2>/dev/null; then
    # Check if it's properly separated for test vs production
    TEST_DOMAIN_CORRECT=$(grep -A 5 "Deploy to Test" .github/workflows/deploy-multi-env.yml | grep -c "dev2.bankimonline.com" || echo 0)
    PROD_DOMAIN_CORRECT=$(grep -A 5 "Deploy to Production" .github/workflows/deploy-multi-env.yml | grep -c "bankimonline.com" || echo 0)
    
    if [ $TEST_DOMAIN_CORRECT -gt 0 ] && [ $PROD_DOMAIN_CORRECT -gt 0 ]; then
        echo -e "${GREEN}PROPERLY SEPARATED${NC}"
    else
        echo -e "${YELLOW}CHECK SEPARATION${NC}"
        echo "  └─ Ensure test uses dev2.bankimonline.com and production uses bankimonline.com"
        WARNINGS=$((WARNINGS + 1))
    fi
else
    echo -e "${YELLOW}NOT FOUND${NC}"
    WARNINGS=$((WARNINGS + 1))
fi

echo
echo "🏗️ BUILD DIRECTORY"
echo "------------------"

# Check 10: Frontend build directory
check_warning "Frontend build directory configured" \
    "[ -d mainapp/build ] || [ -d mainapp/dist ]" \
    "Build directory will be created during deployment"

echo
echo "🔐 ENVIRONMENT CONFIGURATION"
echo "----------------------------"

# Check 11: Environment files
check_warning ".env.example exists" \
    "[ -f .env.example ]" \
    "Create .env.example with required environment variables"

# Check 12: Version files
check_warning "Version tracking file exists" \
    "[ -f scripts/simple-version.txt ] || [ -f VERSION ]" \
    "Version tracking helps with deployment validation"

echo
echo "================================="
echo "PRE-DEPLOYMENT CHECK SUMMARY"
echo "================================="
echo

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✅ ALL CHECKS PASSED!${NC}"
    echo "Your project is ready for deployment."
    echo
    echo "Next steps:"
    echo "1. Commit your changes: git add -A && git commit -m 'Fix: deployment configuration'"
    echo "2. Push to main: git push origin main"
    echo "3. Monitor GitHub Actions for deployment status"
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠️  Validation completed with $WARNINGS warning(s)${NC}"
    echo "You can proceed with deployment, but review warnings."
    echo
    echo "Warnings are non-critical but should be addressed for best practices."
else
    echo -e "${RED}❌ VALIDATION FAILED with $ERRORS error(s) and $WARNINGS warning(s)${NC}"
    echo
    echo "CRITICAL: Fix all errors before attempting deployment!"
    echo "Errors will cause deployment failures in GitHub Actions."
fi

echo
echo "📝 Quick Fix Commands:"
echo "---------------------"
if ! grep -q "\"dotenv\"" package.json 2>/dev/null; then
    echo "npm install dotenv"
fi
if ! [ -f ecosystem.config.js ]; then
    echo "cp ecosystem.production.js ecosystem.config.js"
fi
if ! grep -q "\"version:update\":" mainapp/package.json 2>/dev/null; then
    echo "# Add to mainapp/package.json scripts:"
    echo '"version:update": "node ../scripts/simple-version.js"'
fi

exit $ERRORS
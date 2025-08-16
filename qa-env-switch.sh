#!/bin/bash

# QA Environment Switcher for Banking Application
# Usage: ./qa-env-switch.sh [dev|prod|status]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Configuration
DEV_URL="http://localhost:5173"
PROD_URL="https://dev2.bankimonline.com"
ENV_FILE=".env.qa"

# Banner function
print_banner() {
    echo -e "${BLUE}================================================${NC}"
    echo -e "${BLUE}🛠️  QA ENVIRONMENT SWITCHER${NC}"
    echo -e "${BLUE}================================================${NC}"
}

# Status function
show_status() {
    echo -e "\n${PURPLE}📊 CURRENT ENVIRONMENT STATUS:${NC}"
    echo -e "${BLUE}----------------------------------------${NC}"
    
    if [ -f "$ENV_FILE" ]; then
        echo -e "${GREEN}✅ Environment file found: $ENV_FILE${NC}"
        echo ""
        while IFS= read -r line; do
            if [[ $line == PLAYWRIGHT_BASE_URL* ]]; then
                url=$(echo $line | cut -d'=' -f2 | tr -d '"')
                if [[ $url == *"localhost"* ]]; then
                    echo -e "${GREEN}🛠️  Environment: DEVELOPMENT${NC}"
                    echo -e "${GREEN}📍 URL: $url${NC}"
                    echo -e "${GREEN}🔧 Mode: SAFE - Real bugs will be created${NC}"
                elif [[ $url == *"bankimonline.com"* ]]; then
                    echo -e "${RED}🚨 Environment: PRODUCTION${NC}"
                    echo -e "${RED}📍 URL: $url${NC}"
                    echo -e "${RED}🛡️  Mode: SAFE - No real bugs will be created${NC}"
                fi
            elif [[ $line == TEST_ENVIRONMENT* ]]; then
                env=$(echo $line | cut -d'=' -f2 | tr -d '"')
                echo -e "${BLUE}⚙️  Test Environment: $env${NC}"
            elif [[ $line == CREATE_REAL_BUGS* ]]; then
                bugs=$(echo $line | cut -d'=' -f2 | tr -d '"')
                if [ "$bugs" = "true" ]; then
                    echo -e "${YELLOW}🐛 Bug Creation: ENABLED${NC}"
                else
                    echo -e "${GREEN}🛡️  Bug Creation: DISABLED (Safe Mode)${NC}"
                fi
            fi
        done < "$ENV_FILE"
    else
        echo -e "${YELLOW}⚠️  No environment file found${NC}"
        echo -e "${YELLOW}📝 Run './qa-env-switch.sh dev' or './qa-env-switch.sh prod' to set up${NC}"
    fi
    
    echo -e "${BLUE}----------------------------------------${NC}"
    
    # Show available test scripts
    echo -e "\n${PURPLE}🧪 AVAILABLE TEST SCRIPTS:${NC}"
    echo -e "${BLUE}• node test-remaining-bugs.js${NC}"
    echo -e "${BLUE}• node verify-menu-fix-comprehensive.js${NC}"
    echo -e "${BLUE}• node test-property-dropdown-fix.js${NC}"
    echo -e "${BLUE}• node test-dropdown-debug.js${NC}"
    
    echo -e "\n${PURPLE}🚀 QUICK RUN COMMANDS:${NC}"
    echo -e "${BLUE}• source $ENV_FILE && node test-remaining-bugs.js${NC}"
    echo -e "${BLUE}• source $ENV_FILE && npm run test${NC}"
}

# Set development environment
set_development() {
    echo -e "\n${GREEN}🛠️  SETTING DEVELOPMENT ENVIRONMENT...${NC}"
    
    cat > "$ENV_FILE" << EOF
# QA Testing Environment Configuration
# Generated: $(date)

# Development Environment Settings
PLAYWRIGHT_BASE_URL="$DEV_URL"
TEST_ENVIRONMENT="development"
CREATE_REAL_BUGS="true"
SAFETY_MODE="disabled"

# Jira Configuration (Real tickets)
JIRA_CREATE_REAL_ISSUES="true"
JIRA_MOCK_RESPONSES="false"

# Additional Settings
NODE_ENV="test"
DEBUG_MODE="true"
EOF

    echo -e "${GREEN}✅ Development environment configured!${NC}"
    echo -e "${GREEN}📍 URL: $DEV_URL${NC}"
    echo -e "${GREEN}🐛 Bug Creation: ENABLED${NC}"
    echo -e "${GREEN}🔧 Mode: Development testing with real JIRA integration${NC}"
    
    echo -e "\n${YELLOW}💡 To activate this environment, run:${NC}"
    echo -e "${BLUE}source $ENV_FILE${NC}"
}

# Set production environment  
set_production() {
    echo -e "\n${RED}🚨 SETTING PRODUCTION ENVIRONMENT...${NC}"
    
    cat > "$ENV_FILE" << EOF
# QA Testing Environment Configuration  
# Generated: $(date)
# ⚠️  PRODUCTION ENVIRONMENT - SAFETY MODE ENABLED

# Production Environment Settings
PLAYWRIGHT_BASE_URL="$PROD_URL"
TEST_ENVIRONMENT="production"
CREATE_REAL_BUGS="false"
SAFETY_MODE="enabled"

# Jira Configuration (Safe Mode - No real tickets)
JIRA_CREATE_REAL_ISSUES="false"
JIRA_MOCK_RESPONSES="true"

# Additional Settings
NODE_ENV="production"
DEBUG_MODE="false"
EOF

    echo -e "${RED}🚨 PRODUCTION environment configured!${NC}"
    echo -e "${RED}📍 URL: $PROD_URL${NC}"
    echo -e "${RED}🛡️  Bug Creation: DISABLED (Safe Mode)${NC}"
    echo -e "${RED}⚠️  Mode: Production testing - NO real JIRA tickets${NC}"
    
    echo -e "\n${YELLOW}⚠️  PRODUCTION SAFETY WARNINGS:${NC}"
    echo -e "${YELLOW}• Tests will run on LIVE production environment${NC}"
    echo -e "${YELLOW}• No real JIRA tickets will be created${NC}"
    echo -e "${YELLOW}• Bugs will be saved locally for review${NC}"
    echo -e "${YELLOW}• Use read-only tests when possible${NC}"
    
    echo -e "\n${YELLOW}💡 To activate this environment, run:${NC}"
    echo -e "${BLUE}source $ENV_FILE${NC}"
}

# Quick run function
quick_run() {
    local script="$1"
    
    if [ ! -f "$ENV_FILE" ]; then
        echo -e "${RED}❌ No environment configured!${NC}"
        echo -e "${YELLOW}Run './qa-env-switch.sh dev' or './qa-env-switch.sh prod' first${NC}"
        exit 1
    fi
    
    echo -e "\n${BLUE}🚀 QUICK RUN: $script${NC}"
    echo -e "${BLUE}Loading environment from $ENV_FILE...${NC}"
    
    # Source environment and run script
    source "$ENV_FILE"
    
    if [ -f "$script" ]; then
        echo -e "${GREEN}✅ Running: $script${NC}"
        node "$script"
    else
        echo -e "${RED}❌ Script not found: $script${NC}"
        echo -e "${YELLOW}Available scripts:${NC}"
        ls -la *.js | grep -E "(test|verify)" | head -5
    fi
}

# Help function
show_help() {
    echo -e "\n${PURPLE}📖 QA ENVIRONMENT SWITCHER HELP${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo -e "${GREEN}Usage: ./qa-env-switch.sh [COMMAND] [OPTIONS]${NC}"
    echo ""
    echo -e "${YELLOW}COMMANDS:${NC}"
    echo -e "${BLUE}  dev              Set development environment (localhost:5173)${NC}"
    echo -e "${BLUE}  prod             Set production environment (dev2.bankimonline.com)${NC}"
    echo -e "${BLUE}  status           Show current environment status${NC}"
    echo -e "${BLUE}  run <script>     Quick run a test script with current environment${NC}"
    echo -e "${BLUE}  help             Show this help message${NC}"
    echo ""
    echo -e "${YELLOW}EXAMPLES:${NC}"
    echo -e "${BLUE}  ./qa-env-switch.sh dev${NC}"
    echo -e "${BLUE}  ./qa-env-switch.sh prod${NC}"
    echo -e "${BLUE}  ./qa-env-switch.sh status${NC}"
    echo -e "${BLUE}  ./qa-env-switch.sh run test-remaining-bugs.js${NC}"
    echo ""
    echo -e "${YELLOW}WORKFLOW:${NC}"
    echo -e "${BLUE}  1. ./qa-env-switch.sh dev          # Set development${NC}"
    echo -e "${BLUE}  2. source .env.qa                  # Load environment${NC}"
    echo -e "${BLUE}  3. node test-remaining-bugs.js     # Run tests${NC}"
    echo ""
    echo -e "${YELLOW}QUICK WORKFLOW:${NC}"
    echo -e "${BLUE}  ./qa-env-switch.sh dev && source .env.qa && node test-remaining-bugs.js${NC}"
    echo ""
}

# Main execution
print_banner

case "${1:-status}" in
    "dev"|"development")
        set_development
        show_status
        ;;
    "prod"|"production")
        set_production
        show_status
        ;;
    "status"|"")
        show_status
        ;;
    "run")
        if [ -z "$2" ]; then
            echo -e "${RED}❌ Please specify a script to run${NC}"
            echo -e "${YELLOW}Example: ./qa-env-switch.sh run test-remaining-bugs.js${NC}"
            exit 1
        fi
        quick_run "$2"
        ;;
    "help"|"-h"|"--help")
        show_help
        ;;
    *)
        echo -e "${RED}❌ Unknown command: $1${NC}"
        show_help
        exit 1
        ;;
esac

echo -e "\n${GREEN}🎯 Environment switcher completed!${NC}"
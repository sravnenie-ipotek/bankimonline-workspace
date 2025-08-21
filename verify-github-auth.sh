#!/bin/bash

CYAN='\033[36m'
GREEN='\033[32m'
YELLOW='\033[33m'
RED='\033[31m'
NC='\033[0m'

echo -e "${CYAN}════════════════════════════════════════════════════════════════${NC}"
echo -e "${CYAN}🔍 Verifying GitHub Authentication${NC}"
echo -e "${CYAN}════════════════════════════════════════════════════════════════${NC}"

# Check if authenticated
if gh auth status &>/dev/null; then
    echo -e "\n${GREEN}✅ You are authenticated with GitHub!${NC}"
    
    # Show user info
    USER=$(gh api user --jq .login 2>/dev/null)
    NAME=$(gh api user --jq .name 2>/dev/null)
    EMAIL=$(gh api user --jq .email 2>/dev/null)
    
    echo -e "\n${CYAN}Account Information:${NC}"
    echo -e "  Username: ${GREEN}$USER${NC}"
    [ -n "$NAME" ] && echo -e "  Name: $NAME"
    [ -n "$EMAIL" ] && echo -e "  Email: $EMAIL"
    
    # Check repository access
    echo -e "\n${CYAN}Repository Access:${NC}"
    if gh repo view MichaelMishaev/bankDev2_standalone &>/dev/null; then
        echo -e "  ${GREEN}✅ Can access bankDev2_standalone repository${NC}"
    else
        echo -e "  ${RED}❌ Cannot access repository${NC}"
    fi
    
    echo -e "\n${GREEN}Ready to proceed with adding secrets!${NC}"
    echo -e "\n${CYAN}Next step:${NC}"
    echo -e "  Run: ${YELLOW}./add-github-secrets.sh${NC}"
    
else
    echo -e "\n${RED}❌ Not authenticated with GitHub${NC}"
    echo -e "\n${YELLOW}Please complete the authentication process:${NC}"
    echo "1. Go to: https://github.com/login/device"
    echo "2. Enter code: B270-F874"
    echo "3. Authorize GitHub CLI"
    echo "4. Run this script again"
fi

echo -e "${CYAN}════════════════════════════════════════════════════════════════${NC}"
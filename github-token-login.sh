#!/bin/bash

CYAN='\033[36m'
GREEN='\033[32m'
YELLOW='\033[33m'
RED='\033[31m'
NC='\033[0m'

echo -e "${CYAN}════════════════════════════════════════════════════════════════${NC}"
echo -e "${CYAN}🔐 GitHub Token-Based Login${NC}"
echo -e "${CYAN}════════════════════════════════════════════════════════════════${NC}"

echo -e "\n${YELLOW}This method uses a Personal Access Token${NC}"
echo -e "\n${CYAN}Step 1: Create a new token${NC}"
echo "1. Open: https://github.com/settings/tokens/new"
echo "2. Give it a name: 'BankDev2 Deployment'"
echo "3. Select scopes:"
echo "   ✓ repo (Full control of private repositories)"
echo "   ✓ workflow (Update GitHub Action workflows)"
echo "   ✓ read:org (Read org and team membership)"
echo "4. Click 'Generate token'"
echo "5. Copy the token (starts with ghp_)"
echo ""
echo -e "${GREEN}Enter your token (or press Ctrl+C to cancel):${NC}"
read -s TOKEN

if [ -z "$TOKEN" ]; then
    echo -e "${RED}No token provided${NC}"
    exit 1
fi

echo -e "\n${CYAN}Authenticating...${NC}"

# Authenticate with the token
echo "$TOKEN" | gh auth login --with-token

# Check if it worked
if gh auth status &>/dev/null; then
    echo -e "\n${GREEN}✅ Successfully authenticated!${NC}"
    
    USER=$(gh api user --jq .login 2>/dev/null)
    NAME=$(gh api user --jq .name 2>/dev/null)
    
    echo -e "Logged in as: ${GREEN}$USER${NC}"
    [ -n "$NAME" ] && echo -e "Name: $NAME"
    
    # Test repository access
    if gh repo view MichaelMishaev/bankDev2_standalone &>/dev/null; then
        echo -e "\n${GREEN}✅ Can access repository${NC}"
    else
        echo -e "\n${RED}❌ Cannot access repository${NC}"
    fi
    
    echo -e "\n${CYAN}Next steps:${NC}"
    echo "1. Add secrets: ${YELLOW}./add-github-secrets.sh${NC}"
    echo "2. Test setup: ${YELLOW}./test-github-secrets.sh${NC}"
else
    echo -e "\n${RED}❌ Authentication failed${NC}"
    echo -e "${YELLOW}Please check your token has the required scopes:${NC}"
    echo "  • repo"
    echo "  • workflow"
    echo "  • read:org"
fi

echo -e "${CYAN}════════════════════════════════════════════════════════════════${NC}"
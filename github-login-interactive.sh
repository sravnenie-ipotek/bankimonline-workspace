#!/bin/bash

CYAN='\033[36m'
GREEN='\033[32m'
YELLOW='\033[33m'
RED='\033[31m'
NC='\033[0m'

echo -e "${CYAN}════════════════════════════════════════════════════════════════${NC}"
echo -e "${CYAN}🔐 GitHub CLI Interactive Login${NC}"
echo -e "${CYAN}════════════════════════════════════════════════════════════════${NC}"

echo -e "\n${YELLOW}Starting GitHub authentication...${NC}"
echo -e "${CYAN}Follow these steps carefully:${NC}"
echo ""
echo "1. Press ENTER to start"
echo "2. Choose: GitHub.com"
echo "3. Choose: HTTPS"
echo "4. Choose: Login with a web browser"
echo "5. Copy the one-time code shown"
echo "6. Press ENTER to open browser"
echo "7. Paste the code in browser"
echo "8. Authorize GitHub CLI"
echo ""
echo -e "${GREEN}Press ENTER to begin...${NC}"
read

# Start interactive login
gh auth login

# Check if it worked
echo -e "\n${CYAN}Checking authentication...${NC}"
if gh auth status &>/dev/null; then
    echo -e "${GREEN}✅ Successfully authenticated!${NC}"
    
    USER=$(gh api user --jq .login 2>/dev/null)
    echo -e "Logged in as: ${GREEN}$USER${NC}"
    
    echo -e "\n${CYAN}Next steps:${NC}"
    echo "1. Add secrets: ${YELLOW}./add-github-secrets.sh${NC}"
    echo "2. Test setup: ${YELLOW}./test-github-secrets.sh${NC}"
else
    echo -e "${RED}❌ Authentication failed${NC}"
    echo -e "${YELLOW}Please try again${NC}"
fi
#!/bin/bash

# Add Percy Token to GitHub Secrets

CYAN='\033[36m'
GREEN='\033[32m'
YELLOW='\033[33m'
RED='\033[31m'
NC='\033[0m'

echo -e "${CYAN}════════════════════════════════════════════════════════════════${NC}"
echo -e "${CYAN}🎨 Adding Percy Token to GitHub Secrets${NC}"
echo -e "${CYAN}════════════════════════════════════════════════════════════════${NC}"

# Percy token
PERCY_TOKEN="web_9f73a1caca3ef1eeee6eb9bbbc50729ccbaea586614609282e4b00848dbb26bc"
REPO="sravnenie-ipotek/bankimonline-workspace"

# Check if logged in
echo -e "\n${CYAN}Checking GitHub authentication...${NC}"
if ! gh auth status &>/dev/null; then
    echo -e "${RED}❌ Not logged in to GitHub${NC}"
    echo -e "${YELLOW}Please run: gh auth login${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Authenticated with GitHub${NC}"

# Add Percy token
echo -e "\n${CYAN}Adding PERCY_TOKEN to repository secrets...${NC}"
echo "$PERCY_TOKEN" | gh secret set PERCY_TOKEN --repo=$REPO

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Percy token successfully added!${NC}"
else
    echo -e "${YELLOW}⚠️  Token might already exist or there was an error${NC}"
fi

# Verify the secret was added
echo -e "\n${CYAN}Verifying secrets...${NC}"
if gh secret list --repo=$REPO | grep -q "PERCY_TOKEN"; then
    echo -e "${GREEN}✅ PERCY_TOKEN exists in repository secrets${NC}"
    
    # Show when it was updated
    gh secret list --repo=$REPO | grep "PERCY_TOKEN"
else
    echo -e "${RED}❌ PERCY_TOKEN not found in secrets${NC}"
fi

echo -e "\n${CYAN}════════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ Percy Visual Regression Testing should now work!${NC}"
echo -e "${CYAN}════════════════════════════════════════════════════════════════${NC}"

echo -e "\n${CYAN}Next steps:${NC}"
echo "1. The next commit will trigger Percy visual tests"
echo "2. First run will create baseline images"
echo "3. Future runs will compare against baseline"
echo ""
echo "Monitor Percy builds at:"
echo -e "${YELLOW}https://percy.io${NC}"
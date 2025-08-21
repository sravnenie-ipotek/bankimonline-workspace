#!/bin/bash

# GitHub CLI Authentication Fix
# Correctly authenticate with GitHub using a token

CYAN='\033[36m'
GREEN='\033[32m'
YELLOW='\033[33m'
RED='\033[31m'
NC='\033[0m'

echo -e "${CYAN}════════════════════════════════════════════════════════════════${NC}"
echo -e "${CYAN}🔐 GitHub CLI Authentication${NC}"
echo -e "${CYAN}════════════════════════════════════════════════════════════════${NC}"

# The token should be provided as an environment variable or input
# TOKEN="your-github-token-here"
echo "Please provide your GitHub token:"
read -s TOKEN

echo -e "\n${CYAN}Authenticating with GitHub...${NC}"
echo -e "${YELLOW}Using token authentication method${NC}\n"

# Correct way to authenticate with a token
echo "$TOKEN" | gh auth login --with-token

# Check if authentication was successful
if gh auth status &>/dev/null; then
    echo -e "\n${GREEN}✅ Successfully authenticated!${NC}"
    
    # Show who we're logged in as
    USER=$(gh api user --jq .login 2>/dev/null)
    if [ -n "$USER" ]; then
        echo -e "${GREEN}Logged in as: $USER${NC}"
    fi
    
    echo -e "\n${CYAN}Next steps:${NC}"
    echo "1. Add GitHub secrets:"
    echo "   ${YELLOW}./add-github-secrets.sh${NC}"
    echo ""
    echo "2. Test the setup:"
    echo "   ${YELLOW}./test-github-secrets.sh${NC}"
else
    echo -e "\n${RED}❌ Authentication failed${NC}"
    echo -e "${YELLOW}The token might be expired or invalid${NC}"
    echo ""
    echo "Alternative methods to try:"
    echo "1. Interactive login (recommended):"
    echo "   ${YELLOW}gh auth login${NC}"
    echo "   Then choose: GitHub.com → HTTPS → Login with a web browser"
    echo ""
    echo "2. Create a new token at:"
    echo "   ${YELLOW}https://github.com/settings/tokens${NC}"
    echo "   Required scopes: repo, workflow, read:org"
fi

echo -e "${CYAN}════════════════════════════════════════════════════════════════${NC}"
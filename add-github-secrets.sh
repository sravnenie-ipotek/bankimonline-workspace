#!/bin/bash

# GitHub Secrets Automated Setup
# For deploying to 45.83.42.74

set -e

CYAN='\033[36m'
GREEN='\033[32m'
YELLOW='\033[33m'
RED='\033[31m'
NC='\033[0m'

echo -e "${CYAN}════════════════════════════════════════════════════════════════${NC}"
echo -e "${CYAN}🔐 Adding GitHub Secrets for SSH Deployment${NC}"
echo -e "${CYAN}════════════════════════════════════════════════════════════════${NC}"

# Check if logged in
echo -e "\n${CYAN}Checking GitHub authentication...${NC}"
if ! gh auth status &>/dev/null; then
    echo -e "${RED}❌ Not logged in to GitHub${NC}"
    echo -e "${YELLOW}Please run: gh auth login${NC}"
    echo "Then run this script again"
    exit 1
fi

echo -e "${GREEN}✅ Authenticated with GitHub${NC}"

# Get repository name - using the actual workspace repository
REPO="sravnenie-ipotek/bankimonline-workspace"
echo -e "${CYAN}Using repository: ${REPO}${NC}"

# Add secrets
echo -e "\n${CYAN}Adding secrets...${NC}"

# 1. SSH_PRIVATE_KEY
echo -n "  Adding SSH_PRIVATE_KEY... "
if [ -f ~/.ssh/id_ed25519 ]; then
    cat ~/.ssh/id_ed25519 | gh secret set SSH_PRIVATE_KEY --repo=$REPO 2>/dev/null && echo -e "${GREEN}✅${NC}" || echo -e "${YELLOW}Already exists${NC}"
elif [ -f ~/.ssh/id_rsa ]; then
    cat ~/.ssh/id_rsa | gh secret set SSH_PRIVATE_KEY --repo=$REPO 2>/dev/null && echo -e "${GREEN}✅${NC}" || echo -e "${YELLOW}Already exists${NC}"
else
    echo -e "${RED}❌ No SSH key found!${NC}"
    echo "Generate one with: ssh-keygen -t ed25519"
    exit 1
fi

# 2. SSH_HOST
echo -n "  Adding SSH_HOST... "
echo "45.83.42.74" | gh secret set SSH_HOST --repo=$REPO 2>/dev/null && echo -e "${GREEN}✅${NC}" || echo -e "${YELLOW}Already exists${NC}"

# 3. SSH_USER
echo -n "  Adding SSH_USER... "
echo "root" | gh secret set SSH_USER --repo=$REPO 2>/dev/null && echo -e "${GREEN}✅${NC}" || echo -e "${YELLOW}Already exists${NC}"

# 4. SSH_PORT
echo -n "  Adding SSH_PORT... "
echo "22" | gh secret set SSH_PORT --repo=$REPO 2>/dev/null && echo -e "${GREEN}✅${NC}" || echo -e "${YELLOW}Already exists${NC}"

# List secrets
echo -e "\n${CYAN}Verifying secrets...${NC}"
gh secret list --repo=$REPO

echo -e "\n${CYAN}════════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ GitHub Secrets successfully configured!${NC}"
echo -e "${CYAN}════════════════════════════════════════════════════════════════${NC}"

echo -e "\n${CYAN}Next steps:${NC}"
echo "1. Push code to trigger deployment:"
echo "   ${YELLOW}git push origin main${NC}"
echo ""
echo "2. Monitor deployment at:"
echo "   ${YELLOW}https://github.com/${REPO}/actions${NC}"
echo ""
echo -e "${GREEN}Ready to deploy! 🚀${NC}"
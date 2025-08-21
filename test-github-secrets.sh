#!/bin/bash

# Test script to verify GitHub Secrets are properly configured

CYAN='\033[36m'
GREEN='\033[32m'
YELLOW='\033[33m'
RED='\033[31m'
NC='\033[0m'

echo -e "${CYAN}════════════════════════════════════════════════════════════════${NC}"
echo -e "${CYAN}🧪 Testing GitHub Secrets Configuration${NC}"
echo -e "${CYAN}════════════════════════════════════════════════════════════════${NC}"

REPO="sravnenie-ipotek/bankimonline-workspace"
ERRORS=0

# Test 1: GitHub CLI Authentication
echo -e "\n${CYAN}Test 1: GitHub CLI Authentication${NC}"
if gh auth status &>/dev/null; then
    echo -e "  ${GREEN}✅ Authenticated${NC}"
    USER=$(gh api user --jq .login)
    echo -e "  Logged in as: ${GREEN}${USER}${NC}"
else
    echo -e "  ${RED}❌ Not authenticated${NC}"
    echo -e "  ${YELLOW}Fix: Run 'gh auth login'${NC}"
    ((ERRORS++))
fi

# Test 2: Repository Access
echo -e "\n${CYAN}Test 2: Repository Access${NC}"
if gh repo view $REPO &>/dev/null; then
    echo -e "  ${GREEN}✅ Can access repository${NC}"
else
    echo -e "  ${RED}❌ Cannot access repository${NC}"
    echo -e "  ${YELLOW}Fix: Check repository name and permissions${NC}"
    ((ERRORS++))
fi

# Test 3: Check Required Secrets
echo -e "\n${CYAN}Test 3: Required Secrets${NC}"
SECRETS=$(gh secret list --repo=$REPO 2>/dev/null | awk '{print $1}')

REQUIRED_SECRETS=("SSH_PRIVATE_KEY" "SSH_HOST" "SSH_USER" "SSH_PORT")
for SECRET in "${REQUIRED_SECRETS[@]}"; do
    if echo "$SECRETS" | grep -q "^${SECRET}$"; then
        echo -e "  ${GREEN}✅ ${SECRET} exists${NC}"
    else
        echo -e "  ${RED}❌ ${SECRET} missing${NC}"
        ((ERRORS++))
    fi
done

# Test 4: Local SSH Key
echo -e "\n${CYAN}Test 4: Local SSH Key${NC}"
if [ -f ~/.ssh/id_ed25519 ] || [ -f ~/.ssh/id_rsa ]; then
    echo -e "  ${GREEN}✅ SSH key found${NC}"
    if [ -f ~/.ssh/id_ed25519 ]; then
        echo -e "  Type: Ed25519 (recommended)"
    else
        echo -e "  Type: RSA"
    fi
else
    echo -e "  ${RED}❌ No SSH key found${NC}"
    echo -e "  ${YELLOW}Fix: Run 'ssh-keygen -t ed25519'${NC}"
    ((ERRORS++))
fi

# Test 5: Test SSH Connection
echo -e "\n${CYAN}Test 5: SSH Server Connectivity${NC}"
if ping -c 1 -W 2 45.83.42.74 &>/dev/null; then
    echo -e "  ${GREEN}✅ Server is reachable${NC}"
else
    echo -e "  ${YELLOW}⚠️  Server not responding to ping${NC}"
fi

if nc -zv -w 2 45.83.42.74 22 &>/dev/null; then
    echo -e "  ${GREEN}✅ SSH port 22 is open${NC}"
else
    echo -e "  ${RED}❌ SSH port 22 is closed${NC}"
    ((ERRORS++))
fi

# Test 6: GitHub Actions Workflow
echo -e "\n${CYAN}Test 6: GitHub Actions Workflow${NC}"
if [ -f .github/workflows/deploy-to-ssh.yml ] || [ -f .github/workflows/deploy.yml ] || [ -f .github/workflows/deploy-production-WORLD-CLASS.yml ]; then
    echo -e "  ${GREEN}✅ Deployment workflow exists${NC}"
    WORKFLOW=$(ls .github/workflows/*.yml 2>/dev/null | head -1)
    echo -e "  File: ${WORKFLOW}"
else
    echo -e "  ${YELLOW}⚠️  No deployment workflow found${NC}"
    echo -e "  ${YELLOW}Create: .github/workflows/deploy.yml${NC}"
fi

# Results
echo -e "\n${CYAN}════════════════════════════════════════════════════════════════${NC}"
if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✅ All tests passed! Ready for CI/CD deployment${NC}"
    echo -e "\n${CYAN}To deploy, run:${NC}"
    echo -e "  ${YELLOW}git add .${NC}"
    echo -e "  ${YELLOW}git commit -m 'Deploy to production'${NC}"
    echo -e "  ${YELLOW}git push origin main${NC}"
else
    echo -e "${RED}❌ Found ${ERRORS} issue(s) - Fix them before deploying${NC}"
    echo -e "\n${CYAN}Quick fix:${NC}"
    echo -e "  1. Login: ${YELLOW}gh auth login${NC}"
    echo -e "  2. Add secrets: ${YELLOW}./add-github-secrets.sh${NC}"
    echo -e "  3. Test again: ${YELLOW}./test-github-secrets.sh${NC}"
fi
echo -e "${CYAN}════════════════════════════════════════════════════════════════${NC}"
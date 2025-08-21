#!/bin/bash

# Script to remove Atlassian API token from git history
# This will rewrite git history - use with caution!

CYAN='\033[36m'
GREEN='\033[32m'
YELLOW='\033[33m'
RED='\033[31m'
NC='\033[0m'

echo -e "${RED}════════════════════════════════════════════════════════════════${NC}"
echo -e "${RED}⚠️  WARNING: This will rewrite git history!${NC}"
echo -e "${RED}════════════════════════════════════════════════════════════════${NC}"
echo ""
echo "This script will:"
echo "1. Remove the Atlassian API token from all git history"
echo "2. Force push the cleaned history"
echo "3. All collaborators will need to re-clone the repository"
echo ""
echo -e "${YELLOW}Make sure you have a backup before proceeding!${NC}"
echo ""
read -p "Are you sure you want to continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "Aborted."
    exit 1
fi

echo -e "\n${CYAN}Creating backup branch...${NC}"
git branch backup-before-clean-$(date +%Y%m%d-%H%M%S)

echo -e "\n${CYAN}Removing secret from history...${NC}"

# The file containing the secret
FILE_PATH="production-package/api/docs/QA/menuQA/instructions.md"

# Use git filter-branch to remove the secret
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch $FILE_PATH" \
  --prune-empty --tag-name-filter cat -- --all 2>/dev/null

# Alternative: Replace the secret in the file throughout history
echo -e "\n${CYAN}Replacing secret in file history...${NC}"
git filter-branch --force --tree-filter "
  if [ -f $FILE_PATH ]; then
    sed -i.bak \"s/ATATT3xFfGF0aPp_hWACkNsvZC2h4OLBYC4RdbBzGUF-xRCmr04fbGZrUY16c-SduNKCJmBytx_YlhSWeXKcZ_6FX4PcQg0Xpdfa-Q0-6So9WqILv6ihpgEzWxsgwOHPxjwnErjNTjcM7ij1XnDE7o4yOfJsG1VyJaOpJFMHCEE1joT8jOJOpg0=5916F041/YOUR_JIRA_API_TOKEN_HERE/g\" $FILE_PATH
    rm -f ${FILE_PATH}.bak
  fi
" --tag-name-filter cat -- --all

echo -e "\n${GREEN}✅ Secret removed from history${NC}"

echo -e "\n${CYAN}Cleaning up...${NC}"
rm -rf .git/refs/original/
git reflog expire --expire=now --all
git gc --prune=now --aggressive

echo -e "\n${GREEN}✅ Cleanup complete${NC}"

echo -e "\n${CYAN}════════════════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Review the changes:"
echo "   ${YELLOW}git log --oneline${NC}"
echo ""
echo "2. Force push to remote (THIS WILL REWRITE HISTORY):"
echo "   ${YELLOW}git push origin main --force${NC}"
echo ""
echo "3. Notify all collaborators to:"
echo "   - Delete their local repository"
echo "   - Re-clone from GitHub"
echo ""
echo -e "${RED}⚠️  IMPORTANT: The Jira API token should be revoked in Atlassian!${NC}"
echo "Go to: https://id.atlassian.com/manage-profile/security/api-tokens"
echo -e "${CYAN}════════════════════════════════════════════════════════════════${NC}"
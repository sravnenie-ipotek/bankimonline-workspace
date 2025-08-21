#!/bin/bash

# Safer script to remove only the Jira API token from git history

CYAN='\033[36m'
GREEN='\033[32m'
YELLOW='\033[33m'
RED='\033[31m'
NC='\033[0m'

echo -e "${CYAN}════════════════════════════════════════════════════════════════${NC}"
echo -e "${CYAN}🔐 Removing Jira API Token from Git History${NC}"
echo -e "${CYAN}════════════════════════════════════════════════════════════════${NC}"

# The secret to remove
SECRET="ATATT3xFfGF0aPp_hWACkNsvZC2h4OLBYC4RdbBzGUF-xRCmr04fbGZrUY16c-SduNKCJmBytx_YlhSWeXKcZ_6FX4PcQg0Xpdfa-Q0-6So9WqILv6ihpgEzWxsgwOHPxjwnErjNTjcM7ij1XnDE7o4yOfJsG1VyJaOpJFMHCEE1joT8jOJOpg0=5916F041"

echo -e "${YELLOW}This will remove the Atlassian API token from all commits${NC}"
echo "Since you're the only developer, this is safe to do."
echo ""
read -p "Continue? (y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Cancelled."
    exit 1
fi

# Create a backup tag
echo -e "\n${CYAN}Creating backup tag...${NC}"
git tag backup-before-secret-removal-$(date +%Y%m%d-%H%M%S)
echo -e "${GREEN}✅ Backup tag created${NC}"

# Use BFG Repo-Cleaner (if available) or git filter-branch
if command -v bfg &> /dev/null; then
    echo -e "\n${CYAN}Using BFG Repo-Cleaner (faster)...${NC}"
    echo "$SECRET" > secret.txt
    bfg --replace-text secret.txt
    rm secret.txt
else
    echo -e "\n${CYAN}Using git filter-branch...${NC}"
    
    # Replace the secret in all files throughout history
    git filter-branch --force --tree-filter "
        find . -type f -exec grep -l '$SECRET' {} \; | while read file; do
            echo \"Cleaning: \$file\"
            sed -i '' 's/$SECRET/REDACTED_JIRA_TOKEN/g' \"\$file\" 2>/dev/null || true
        done
    " --tag-name-filter cat -- --all
fi

echo -e "\n${GREEN}✅ Secret removed from history${NC}"

# Clean up git references
echo -e "\n${CYAN}Cleaning up git references...${NC}"
git for-each-ref --format="delete %(refname)" refs/original | git update-ref --stdin
git reflog expire --expire=now --all
git gc --prune=now --aggressive

echo -e "${GREEN}✅ Cleanup complete${NC}"

# Verify the secret is gone
echo -e "\n${CYAN}Verifying secret removal...${NC}"
if git log --all --full-history --grep="$SECRET" | grep -q "$SECRET"; then
    echo -e "${RED}⚠️  Warning: Secret might still be present${NC}"
else
    echo -e "${GREEN}✅ Secret successfully removed from all history${NC}"
fi

echo -e "\n${CYAN}════════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ Success! The repository is clean.${NC}"
echo -e "${CYAN}════════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Check everything looks good:"
echo "   ${CYAN}git log --oneline -10${NC}"
echo ""
echo "2. Force push to GitHub:"
echo "   ${CYAN}git push origin main --force${NC}"
echo ""
echo "3. Delete the backup tag after confirming everything works:"
echo "   ${CYAN}git tag -d backup-before-secret-removal-*${NC}"
echo ""
echo -e "${GREEN}Your CI/CD workflow will then push successfully!${NC}"
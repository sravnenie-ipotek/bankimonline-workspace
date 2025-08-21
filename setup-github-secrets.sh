#!/bin/bash

# =============================================================================
# GitHub Secrets Setup Helper for SSH Deployment
# This script helps you add SSH secrets to your GitHub repository
# =============================================================================

CYAN='\033[36m'
GREEN='\033[32m'
YELLOW='\033[33m'
RED='\033[31m'
NC='\033[0m'

echo -e "${CYAN}════════════════════════════════════════════════════════════════${NC}"
echo -e "${CYAN}🔐 GitHub Secrets Setup for SSH Deployment to 45.83.42.74${NC}"
echo -e "${CYAN}════════════════════════════════════════════════════════════════${NC}"

# Check for GitHub CLI
if command -v gh &> /dev/null; then
    echo -e "${GREEN}✅ GitHub CLI is installed${NC}"
    GH_INSTALLED=true
else
    echo -e "${YELLOW}⚠️  GitHub CLI not installed${NC}"
    echo "   Install with: brew install gh"
    echo "   Or visit: https://cli.github.com/"
    GH_INSTALLED=false
fi

# Function to display manual instructions
show_manual_instructions() {
    echo -e "\n${CYAN}📋 Manual Setup Instructions:${NC}"
    echo -e "${CYAN}════════════════════════════════════════════════════════════════${NC}"
    echo ""
    echo -e "${GREEN}Step 1: Copy Your Private Key${NC}"
    echo "Run this command to copy your private key to clipboard:"
    echo ""
    echo -e "${YELLOW}cat ~/.ssh/id_ed25519 | pbcopy${NC}"
    echo ""
    echo "Or if using RSA:"
    echo -e "${YELLOW}cat ~/.ssh/id_rsa | pbcopy${NC}"
    echo ""
    echo -e "${GREEN}Step 2: Go to GitHub${NC}"
    echo "1. Open: https://github.com/MichaelMishaev/bankDev2_standalone/settings/secrets/actions"
    echo "2. Click 'New repository secret'"
    echo ""
    echo -e "${GREEN}Step 3: Add These Secrets${NC}"
    echo ""
    echo "SECRET #1:"
    echo "  Name: SSH_PRIVATE_KEY"
    echo "  Value: [Paste your private key - Cmd+V]"
    echo ""
    echo "SECRET #2:"
    echo "  Name: SSH_HOST"
    echo "  Value: 45.83.42.74"
    echo ""
    echo "SECRET #3:"
    echo "  Name: SSH_USER"
    echo "  Value: root"
    echo ""
    echo "SECRET #4:"
    echo "  Name: SSH_PORT"
    echo "  Value: 22"
    echo ""
}

# Function to setup with GitHub CLI
setup_with_cli() {
    echo -e "\n${CYAN}🚀 Automated Setup with GitHub CLI${NC}"
    echo -e "${CYAN}════════════════════════════════════════════════════════════════${NC}"
    
    # Check if logged in
    if ! gh auth status &>/dev/null; then
        echo -e "${YELLOW}Please login to GitHub first:${NC}"
        gh auth login
    fi
    
    # Get current repo
    REPO=$(gh repo view --json nameWithOwner -q .nameWithOwner 2>/dev/null)
    if [ -z "$REPO" ]; then
        REPO="MichaelMishaev/bankDev2_standalone"
        echo -e "${YELLOW}Using default repo: $REPO${NC}"
    else
        echo -e "${GREEN}Using repo: $REPO${NC}"
    fi
    
    echo ""
    echo -e "${CYAN}Adding secrets to $REPO...${NC}"
    
    # Add SSH_PRIVATE_KEY
    echo -n "Adding SSH_PRIVATE_KEY... "
    if [ -f ~/.ssh/id_ed25519 ]; then
        cat ~/.ssh/id_ed25519 | gh secret set SSH_PRIVATE_KEY --repo=$REPO
    elif [ -f ~/.ssh/id_rsa ]; then
        cat ~/.ssh/id_rsa | gh secret set SSH_PRIVATE_KEY --repo=$REPO
    else
        echo -e "${RED}No SSH key found!${NC}"
        exit 1
    fi
    echo -e "${GREEN}✅${NC}"
    
    # Add SSH_HOST
    echo -n "Adding SSH_HOST... "
    echo "45.83.42.74" | gh secret set SSH_HOST --repo=$REPO
    echo -e "${GREEN}✅${NC}"
    
    # Add SSH_USER
    echo -n "Adding SSH_USER... "
    echo "root" | gh secret set SSH_USER --repo=$REPO
    echo -e "${GREEN}✅${NC}"
    
    # Add SSH_PORT
    echo -n "Adding SSH_PORT... "
    echo "22" | gh secret set SSH_PORT --repo=$REPO
    echo -e "${GREEN}✅${NC}"
    
    echo ""
    echo -e "${GREEN}✅ All secrets added successfully!${NC}"
    
    # List secrets
    echo ""
    echo -e "${CYAN}Current secrets in repository:${NC}"
    gh secret list --repo=$REPO
}

# Main menu
echo ""
echo -e "${CYAN}Choose setup method:${NC}"
echo "1) Automatic setup with GitHub CLI (recommended)"
echo "2) Manual setup (copy/paste instructions)"
echo "3) Exit"
echo ""
read -p "Enter choice [1-3]: " choice

case $choice in
    1)
        if [ "$GH_INSTALLED" = true ]; then
            setup_with_cli
        else
            echo -e "${RED}GitHub CLI not installed!${NC}"
            echo "Install it first with: brew install gh"
            echo ""
            show_manual_instructions
        fi
        ;;
    2)
        show_manual_instructions
        ;;
    3)
        echo "Exiting..."
        exit 0
        ;;
    *)
        echo -e "${RED}Invalid choice${NC}"
        show_manual_instructions
        ;;
esac

echo ""
echo -e "${CYAN}════════════════════════════════════════════════════════════════${NC}"
echo -e "${CYAN}📝 Next Steps:${NC}"
echo -e "${CYAN}════════════════════════════════════════════════════════════════${NC}"
echo ""
echo "1. Verify secrets are added:"
echo "   ${YELLOW}gh secret list${NC}"
echo ""
echo "2. Test the deployment:"
echo "   ${YELLOW}git push origin main${NC}"
echo ""
echo "3. Monitor deployment:"
echo "   Go to: https://github.com/MichaelMishaev/bankDev2_standalone/actions"
echo ""
echo -e "${GREEN}✅ Setup complete!${NC}"
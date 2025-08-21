#!/bin/bash

# SSH Server Key Setup for GitHub Actions
# Run this locally - it will configure the remote server

CYAN='\033[36m'
GREEN='\033[32m'
YELLOW='\033[33m'
RED='\033[31m'
NC='\033[0m'

SSH_HOST="45.83.42.74"
SSH_USER="root"
SSH_PASS="3GM8jHZuTWzDXe"

echo -e "${CYAN}════════════════════════════════════════════════════════════════${NC}"
echo -e "${CYAN}🔐 Setting up SSH Key on Server ${SSH_HOST}${NC}"
echo -e "${CYAN}════════════════════════════════════════════════════════════════${NC}"

# Check if we have an SSH key
if [ ! -f ~/.ssh/id_ed25519 ] && [ ! -f ~/.ssh/id_rsa ]; then
    echo -e "${YELLOW}No SSH key found. Creating one...${NC}"
    ssh-keygen -t ed25519 -f ~/.ssh/id_ed25519 -N "" -C "github-actions@bankimonline"
fi

# Get the public key
if [ -f ~/.ssh/id_ed25519.pub ]; then
    PUB_KEY=$(cat ~/.ssh/id_ed25519.pub)
    KEY_FILE="~/.ssh/id_ed25519"
elif [ -f ~/.ssh/id_rsa.pub ]; then
    PUB_KEY=$(cat ~/.ssh/id_rsa.pub)
    KEY_FILE="~/.ssh/id_rsa"
else
    echo -e "${RED}No public key found!${NC}"
    exit 1
fi

echo -e "\n${CYAN}Your public key:${NC}"
echo "$PUB_KEY"

echo -e "\n${YELLOW}This script will:${NC}"
echo "1. Copy your SSH public key to the server"
echo "2. Set up proper permissions"
echo "3. Test the connection"
echo ""
echo -e "${YELLOW}You'll need to enter the password: ${SSH_PASS}${NC}"
echo -e "${GREEN}Press Enter to continue...${NC}"
read

# Copy SSH key to server
echo -e "\n${CYAN}Copying SSH key to server...${NC}"
echo -e "${YELLOW}Enter password when prompted: ${SSH_PASS}${NC}\n"

# Use ssh-copy-id if available
if command -v ssh-copy-id &> /dev/null; then
    ssh-copy-id -i ${KEY_FILE} ${SSH_USER}@${SSH_HOST}
else
    # Manual method
    echo "$PUB_KEY" | ssh ${SSH_USER}@${SSH_HOST} "mkdir -p ~/.ssh && chmod 700 ~/.ssh && cat >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys"
fi

# Test the connection
echo -e "\n${CYAN}Testing SSH key authentication...${NC}"
if ssh -o BatchMode=yes -o ConnectTimeout=5 ${SSH_USER}@${SSH_HOST} "echo 'SSH key auth successful'" 2>/dev/null; then
    echo -e "${GREEN}✅ SSH key authentication works!${NC}"
else
    echo -e "${YELLOW}⚠️  SSH key auth might not be working. Testing with password...${NC}"
fi

echo -e "\n${CYAN}════════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ SSH key setup complete!${NC}"
echo -e "${CYAN}════════════════════════════════════════════════════════════════${NC}"
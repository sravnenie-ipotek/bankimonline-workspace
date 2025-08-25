#!/bin/bash

# Setup GitHub Secrets for CI/CD
# This script helps configure GitHub secrets that are used as SOURCE OF TRUTH

echo "🔐 GitHub Secrets Setup for CI/CD"
echo "=================================="
echo ""
echo "This script will help you set up GitHub secrets for the CI/CD pipeline."
echo "These secrets are the SOURCE OF TRUTH for database connections."
echo ""
echo "⚠️  IMPORTANT: Make sure you have GitHub CLI installed and authenticated"
echo ""

# Check if gh is installed
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) is not installed"
    echo "Install it from: https://cli.github.com/"
    exit 1
fi

# Check if authenticated
if ! gh auth status &> /dev/null; then
    echo "❌ GitHub CLI is not authenticated"
    echo "Run: gh auth login"
    exit 1
fi

echo "✅ GitHub CLI is ready"
echo ""

# Set the repository (update this to match your repo)
REPO="sravnenie-ipotek/bankimonline-workspace"

echo "Setting secrets for repository: $REPO"
echo ""

# Database URLs (Railway)
echo "1. Setting DATABASE_URL (CORE database - maglev)"
gh secret set DATABASE_URL \
  --repo $REPO \
  --body "postgresql://postgres:lgqPEzvVbSCviTybKqMbzJkYvOUetJjt@maglev.proxy.rlwy.net:43809/railway"

echo "2. Setting CONTENT_DATABASE_URL (CONTENT database - shortline)"
gh secret set CONTENT_DATABASE_URL \
  --repo $REPO \
  --body "postgresql://postgres:SuFkUevgonaZFXJiJeczFiXYTlICHVJL@shortline.proxy.rlwy.net:33452/railway"

echo "3. Setting MANAGEMENT_DATABASE_URL (defaults to CORE)"
gh secret set MANAGEMENT_DATABASE_URL \
  --repo $REPO \
  --body "postgresql://postgres:lgqPEzvVbSCviTybKqMbzJkYvOUetJjt@maglev.proxy.rlwy.net:43809/railway"

# JWT Secrets
echo "4. Setting JWT_SECRET"
gh secret set JWT_SECRET \
  --repo $REPO \
  --body "your-super-secret-jwt-key-change-this-in-production-2024"

echo "5. Setting JWT_BANK_SECRET"
gh secret set JWT_BANK_SECRET \
  --repo $REPO \
  --body "your-bank-secret-key-2024"

echo ""
echo "✅ GitHub secrets have been configured!"
echo ""
echo "📋 Secrets set:"
echo "  - DATABASE_URL (points to CORE/maglev)"
echo "  - CONTENT_DATABASE_URL (points to CONTENT/shortline)"
echo "  - MANAGEMENT_DATABASE_URL (points to CORE/maglev)"
echo "  - JWT_SECRET"
echo "  - JWT_BANK_SECRET"
echo ""
echo "🚀 The CI/CD pipeline will now use these as SOURCE OF TRUTH"
echo ""
echo "⚠️  IMPORTANT NOTES:"
echo "  1. DATABASE_URL must ALWAYS point to maglev (CORE), not shortline (CONTENT)"
echo "  2. These same values are used in the TEST server .env"
echo "  3. For production, update JWT secrets to more secure values"
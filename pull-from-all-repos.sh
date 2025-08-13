#!/bin/bash

echo "🔄 Pulling from all BankIM repositories..."
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠️${NC} $1"
}

print_error() {
    echo -e "${RED}❌${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ️${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "mainapp" ] || [ ! -d "server" ]; then
    print_error "Error: This script must be run from the bankDev2_standalone root directory"
    exit 1
fi

# Check current branch
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ]; then
    print_warning "Current branch: $CURRENT_BRANCH (not main)"
    read -p "Continue pulling to $CURRENT_BRANCH? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Pull cancelled."
        exit 1
    fi
fi

# Check for uncommitted changes
if ! git diff-index --quiet HEAD --; then
    print_warning "You have uncommitted changes"
    read -p "Continue pulling? This may cause merge conflicts (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Pull cancelled. Commit your changes first."
        exit 1
    fi
fi

echo "📍 Current branch: $CURRENT_BRANCH"
echo ""

# Function to pull from a repository
pull_from_repo() {
    local repo_name=$1
    local repo_url=$2
    
    echo "🔄 Pulling from $repo_name repository..."
    
    if git pull $repo_name $CURRENT_BRANCH; then
        print_status "Successfully pulled from $repo_name repository"
    else
        print_error "Failed to pull from $repo_name repository"
        return 1
    fi
    echo ""
}

# Pull from all repositories
SUCCESS_COUNT=0
TOTAL_REPOS=4

# Primary repository (most important)
if pull_from_repo "workspace" "main monorepo"; then
    ((SUCCESS_COUNT++))
fi

# Deployment repositories
if pull_from_repo "web" "frontend deployment"; then
    ((SUCCESS_COUNT++))
fi

if pull_from_repo "api" "backend deployment"; then
    ((SUCCESS_COUNT++))
fi

if pull_from_repo "shared" "shared documentation"; then
    ((SUCCESS_COUNT++))
fi

echo "================================================"
echo "📊 Pull Summary:"
echo "✅ Successful pulls: $SUCCESS_COUNT/$TOTAL_REPOS"

if [ $SUCCESS_COUNT -eq $TOTAL_REPOS ]; then
    print_status "All repositories pulled successfully!"
    echo ""
    echo "🔄 Updating dependencies..."
    
    # Update root dependencies
    echo "📦 Installing root dependencies..."
    if npm install --silent; then
        print_status "Root dependencies updated"
    else
        print_warning "Root dependencies update failed"
    fi
    
    # Update frontend dependencies
    echo "📦 Installing frontend dependencies..."
    if npm install --prefix mainapp --silent; then
        print_status "Frontend dependencies updated"
    else
        print_warning "Frontend dependencies update failed"
    fi
    
    echo ""
    print_info "Next steps:"
    echo "  • Run 'npm run dev' to start development servers"
    echo "  • Run 'npm test' to run tests"
    echo "  • Check for any new migration files in server/migrations/"
    
else
    print_error "Some repositories failed to pull. Check the errors above."
    exit 1
fi

echo ""
print_status "🎉 Pull operation completed!"
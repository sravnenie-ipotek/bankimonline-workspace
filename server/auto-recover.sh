#!/bin/bash

# BankiOnline API Auto-Recovery Script
# Automatically detects and recovers from server/database issues

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
SERVER_PORT=8003
SERVER_PATH="server/server-db.js"
HEALTH_CHECK_PATH="server/health-check.js"
MAX_RETRIES=3
RETRY_DELAY=2

# Function to print colored output
print_status() {
    local color=$1
    local message=$2
    echo -e "${color}${message}${NC}"
}

# Function to check if server is healthy
check_server_health() {
    curl -s http://localhost:${SERVER_PORT}/api/server-mode > /dev/null 2>&1
    return $?
}

# Function to test database connection
test_database() {
    node ${HEALTH_CHECK_PATH} > /dev/null 2>&1
    return $?
}

# Function to kill server processes
kill_server() {
    print_status "$YELLOW" "🔄 Stopping existing server processes..."
    
    # Try graceful shutdown first
    pkill -TERM -f "${SERVER_PATH}" 2>/dev/null
    sleep 2
    
    # Force kill if still running
    if pgrep -f "${SERVER_PATH}" > /dev/null; then
        print_status "$YELLOW" "   Force killing stubborn processes..."
        pkill -9 -f "${SERVER_PATH}" 2>/dev/null
        sleep 1
    fi
    
    # Clear port if still in use
    local pid=$(lsof -ti:${SERVER_PORT})
    if [ ! -z "$pid" ]; then
        print_status "$YELLOW" "   Clearing port ${SERVER_PORT}..."
        kill -9 $pid 2>/dev/null
        sleep 1
    fi
}

# Function to start server
start_server() {
    print_status "$GREEN" "🚀 Starting server..."
    nohup node ${SERVER_PATH} > server.log 2>&1 &
    local server_pid=$!
    
    # Wait for server to initialize
    sleep 3
    
    # Check if process is still running
    if ps -p $server_pid > /dev/null; then
        return 0
    else
        return 1
    fi
}

# Main recovery logic
main() {
    print_status "$GREEN" "=========================================="
    print_status "$GREEN" "🏥 BankiOnline API Recovery Script"
    print_status "$GREEN" "=========================================="
    echo ""
    
    # Step 1: Check current health
    print_status "$YELLOW" "🔍 Checking server health..."
    if check_server_health; then
        print_status "$GREEN" "✅ Server is already healthy!"
        
        # Double-check database
        print_status "$YELLOW" "🔍 Verifying database connections..."
        if test_database; then
            print_status "$GREEN" "✅ Database connections OK"
            print_status "$GREEN" "\n✨ No recovery needed - system is operational"
            exit 0
        else
            print_status "$RED" "❌ Database connection issues detected"
            print_status "$YELLOW" "🔧 Proceeding with recovery..."
        fi
    else
        print_status "$RED" "❌ Server not responding"
    fi
    
    # Step 2: Test database connectivity
    print_status "$YELLOW" "\n🔍 Testing database connectivity..."
    if ! test_database; then
        print_status "$RED" "❌ Database connection failed!"
        print_status "$RED" "   Please check:"
        print_status "$RED" "   1. DATABASE_URL environment variable"
        print_status "$RED" "   2. CONTENT_DATABASE_URL environment variable"
        print_status "$RED" "   3. Network connectivity to Railway databases"
        print_status "$RED" "   4. Database credentials validity"
        exit 1
    fi
    print_status "$GREEN" "✅ Database connection OK"
    
    # Step 3: Attempt recovery
    print_status "$YELLOW" "\n🔧 Starting recovery process..."
    
    local retry_count=0
    while [ $retry_count -lt $MAX_RETRIES ]; do
        retry_count=$((retry_count + 1))
        print_status "$YELLOW" "\n📝 Recovery attempt $retry_count of $MAX_RETRIES"
        
        # Kill existing processes
        kill_server
        
        # Start server
        if start_server; then
            print_status "$GREEN" "✅ Server started"
            
            # Verify it's working
            print_status "$YELLOW" "🔍 Verifying server health..."
            sleep 2
            
            if check_server_health; then
                print_status "$GREEN" "✅ Server is responding"
                
                # Final database check
                if test_database; then
                    print_status "$GREEN" "\n=========================================="
                    print_status "$GREEN" "✅ RECOVERY SUCCESSFUL!"
                    print_status "$GREEN" "   Server is running on port ${SERVER_PORT}"
                    print_status "$GREEN" "   All database connections are healthy"
                    print_status "$GREEN" "=========================================="
                    exit 0
                else
                    print_status "$RED" "❌ Database check failed after restart"
                fi
            else
                print_status "$RED" "❌ Server not responding after restart"
            fi
        else
            print_status "$RED" "❌ Failed to start server"
        fi
        
        if [ $retry_count -lt $MAX_RETRIES ]; then
            print_status "$YELLOW" "⏳ Waiting ${RETRY_DELAY} seconds before retry..."
            sleep $RETRY_DELAY
        fi
    done
    
    # Recovery failed
    print_status "$RED" "\n=========================================="
    print_status "$RED" "❌ RECOVERY FAILED"
    print_status "$RED" "   Manual intervention required!"
    print_status "$RED" "   "
    print_status "$RED" "   Suggested actions:"
    print_status "$RED" "   1. Check server.log for errors"
    print_status "$RED" "   2. Run: node server/health-check.js"
    print_status "$RED" "   3. Verify environment variables"
    print_status "$RED" "   4. Check Railway database status"
    print_status "$RED" "=========================================="
    exit 1
}

# Run main function
main
#!/bin/bash

# =============================================================================
# BankimOnline SSH Database Tunnels Setup
# =============================================================================
# This script establishes SSH tunnels for secure database connections
# Replaces Railway CLI dependency for local development
# =============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SSH_SERVER="root@185.253.72.80"
CONTENT_DB_LOCAL_PORT=5432
CONTENT_DB_REMOTE_HOST="shortline.proxy.rlwy.net"
CONTENT_DB_REMOTE_PORT=33452

MAIN_DB_LOCAL_PORT=5433
MAIN_DB_REMOTE_HOST="maglev.proxy.rlwy.net"  
MAIN_DB_REMOTE_PORT=43809

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if port is in use
check_port() {
    local port=$1
    if lsof -ti:$port > /dev/null 2>&1; then
        return 0  # Port is in use
    else
        return 1  # Port is free
    fi
}

# Function to kill existing tunnel on port
kill_tunnel() {
    local port=$1
    local pids=$(lsof -ti:$port 2>/dev/null || true)
    if [ ! -z "$pids" ]; then
        print_warning "Killing existing process on port $port"
        echo $pids | xargs kill -9 2>/dev/null || true
        sleep 2
    fi
}

# Function to test SSH connectivity
test_ssh_connection() {
    print_status "Testing SSH connection to $SSH_SERVER..."
    if ssh -o ConnectTimeout=10 -o BatchMode=yes $SSH_SERVER exit 2>/dev/null; then
        print_success "SSH connection successful"
        return 0
    else
        print_warning "SSH connection failed to $SSH_SERVER"
        print_warning "This is expected if SSH keys are not configured yet."
        print_status "To set up SSH access:"
        echo "  1. Generate SSH key: ssh-keygen -t rsa -b 4096"
        echo "  2. Copy key to server: ssh-copy-id root@185.253.72.80"
        echo "  3. Or configure password authentication"
        echo
        print_status "Alternative: Use manual tunnel setup with password authentication"
        echo "  ssh -L 5432:shortline.proxy.rlwy.net:33452 root@185.253.72.80 -N"
        echo "  ssh -L 5433:maglev.proxy.rlwy.net:43809 root@185.253.72.80 -N"
        return 1
    fi
}

# Function to establish SSH tunnel
create_tunnel() {
    local local_port=$1
    local remote_host=$2
    local remote_port=$3
    local tunnel_name=$4
    
    print_status "Setting up $tunnel_name tunnel..."
    print_status "Local: localhost:$local_port → Remote: $remote_host:$remote_port"
    
    # Kill existing tunnel if exists
    kill_tunnel $local_port
    
    # Create SSH tunnel in background
    ssh -L $local_port:$remote_host:$remote_port $SSH_SERVER -N -f \
        -o ServerAliveInterval=60 \
        -o ServerAliveCountMax=3 \
        -o ExitOnForwardFailure=yes
    
    # Wait a moment for tunnel to establish
    sleep 3
    
    # Verify tunnel is working
    if check_port $local_port; then
        print_success "$tunnel_name tunnel established on localhost:$local_port"
        return 0
    else
        print_error "Failed to establish $tunnel_name tunnel"
        return 1
    fi
}

# Function to test database connectivity through tunnel
test_database_connection() {
    local port=$1
    local db_name=$2
    local password=$3
    
    print_status "Testing $db_name database connection via localhost:$port..."
    
    # Use psql to test connection (if available)
    if command -v psql > /dev/null 2>&1; then
        PGPASSWORD="$password" psql -h localhost -p $port -U postgres -d railway -c "SELECT NOW();" > /dev/null 2>&1
        if [ $? -eq 0 ]; then
            print_success "$db_name database connection successful"
            return 0
        else
            print_warning "$db_name database connection failed (but tunnel may be working)"
            return 1
        fi
    else
        print_warning "psql not available for database testing, assuming tunnel is working"
        return 0
    fi
}

# Function to show tunnel status
show_tunnel_status() {
    echo
    print_status "Current SSH tunnel status:"
    echo "======================================"
    
    if check_port $CONTENT_DB_LOCAL_PORT; then
        print_success "Content Database tunnel: localhost:$CONTENT_DB_LOCAL_PORT → $CONTENT_DB_REMOTE_HOST:$CONTENT_DB_REMOTE_PORT"
    else
        print_error "Content Database tunnel: NOT RUNNING"
    fi
    
    if check_port $MAIN_DB_LOCAL_PORT; then
        print_success "Main Database tunnel: localhost:$MAIN_DB_LOCAL_PORT → $MAIN_DB_REMOTE_HOST:$MAIN_DB_REMOTE_PORT"
    else
        print_error "Main Database tunnel: NOT RUNNING"
    fi
    
    echo
    print_status "Active SSH tunnel processes:"
    ps aux | grep "ssh -L" | grep -v grep || echo "  No SSH tunnel processes found"
}

# Function to stop all tunnels
stop_tunnels() {
    print_status "Stopping SSH tunnels..."
    
    kill_tunnel $CONTENT_DB_LOCAL_PORT
    kill_tunnel $MAIN_DB_LOCAL_PORT
    
    # Kill any remaining SSH tunnels to our server
    pkill -f "ssh -L.*$SSH_SERVER" || true
    
    print_success "SSH tunnels stopped"
}

# Main execution
main() {
    echo "======================================"
    echo "🏦 BankimOnline SSH Database Tunnels"
    echo "======================================"
    echo
    
    # Handle command line arguments
    case "${1:-start}" in
        "start")
            print_status "Starting SSH tunnels for database connections..."
            
            # Test SSH connection first
            if ! test_ssh_connection; then
                exit 1
            fi
            
            # Create tunnels
            success=0
            
            if create_tunnel $CONTENT_DB_LOCAL_PORT $CONTENT_DB_REMOTE_HOST $CONTENT_DB_REMOTE_PORT "Content Database"; then
                test_database_connection $CONTENT_DB_LOCAL_PORT "Content Database" "SuFkUevgonaZFXJiJeczFiXYTlICHVJL"
                ((success++))
            fi
            
            if create_tunnel $MAIN_DB_LOCAL_PORT $MAIN_DB_REMOTE_HOST $MAIN_DB_REMOTE_PORT "Main Database"; then
                test_database_connection $MAIN_DB_LOCAL_PORT "Main Database" "lqqPEzvVbSCviTybKqMbzJkYvOUetJjt"
                ((success++))
            fi
            
            if [ $success -eq 2 ]; then
                echo
                print_success "✅ All SSH tunnels established successfully!"
                print_success "🚀 You can now start the BankimOnline application"
                echo
                print_status "Next steps:"
                echo "  1. Run: npm run dev"
                echo "  2. Access: http://localhost:5173 (frontend)"
                echo "  3. API: http://localhost:8003 (backend)"
                echo
                print_warning "Keep these tunnels running while developing"
            else
                print_error "❌ Failed to establish all required tunnels"
                exit 1
            fi
            ;;
            
        "stop")
            stop_tunnels
            ;;
            
        "status")
            show_tunnel_status
            ;;
            
        "restart")
            stop_tunnels
            sleep 2
            $0 start
            ;;
            
        *)
            echo "Usage: $0 {start|stop|status|restart}"
            echo
            echo "Commands:"
            echo "  start   - Start SSH tunnels for database connections"
            echo "  stop    - Stop all SSH tunnels"
            echo "  status  - Show current tunnel status"
            echo "  restart - Stop and restart tunnels"
            echo
            echo "Database Tunnels:"
            echo "  Content DB: localhost:$CONTENT_DB_LOCAL_PORT → $CONTENT_DB_REMOTE_HOST:$CONTENT_DB_REMOTE_PORT"
            echo "  Main DB:    localhost:$MAIN_DB_LOCAL_PORT → $MAIN_DB_REMOTE_HOST:$MAIN_DB_REMOTE_PORT"
            exit 1
            ;;
    esac
}

# Run main function
main "$@"
# Port Management Scripts

This document describes the port management scripts available in the project for killing development processes.

## Scripts Overview

### 1. `kill-ports.sh` (Main Script)
**Location**: Root directory  
**Purpose**: Comprehensive port killing script with multiple options

### 2. `scripts/kill-all-ports.sh` (Alias Script)
**Location**: `scripts/` directory  
**Purpose**: Simple alias to the main script for easier access

## Usage

### Basic Usage

```bash
# Kill all common development ports
./kill-ports.sh

# Kill specific ports
./kill-ports.sh 3000 5173 8080

# Kill all ports + Node.js processes
./kill-ports.sh -n

# Kill all ports + package managers
./kill-ports.sh -p

# Show help
./kill-ports.sh -h
```

### Advanced Usage

```bash
# Kill specific ports + Node.js processes
./kill-ports.sh -n 3000 5173

# Kill specific ports + package managers
./kill-ports.sh -p 8080 5000

# Kill everything (all ports + Node.js + package managers)
./kill-ports.sh -n -p
```

## Options

| Option | Description |
|--------|-------------|
| `-h, --help` | Show help message |
| `-a, --all` | Kill all common development ports (default) |
| `-n, --node` | Also kill all Node.js processes |
| `-p, --process` | Also kill all npm/yarn/pnpm processes |

## Common Development Ports

The script automatically targets these common development ports:

### React/Vite Development
- `3000` - React development server
- `3001` - Alternative React port
- `5173` - Vite development server
- `5174` - Alternative Vite port

### Python Development
- `8000` - Python/Django development
- `8003` - Server development port
- `5000` - Flask development

### Alternative Ports
- `8080-8085` - Alternative development ports
- `4000-4005` - Alternative development ports
- `5000-5005` - Alternative development ports
- `6000-6005` - Alternative development ports
- `7000-7005` - Alternative development ports
- `9000-9005` - Alternative development ports

### Other Frameworks
- `4200` - Angular development

## Examples

### Kill Everything (Nuclear Option)
```bash
./kill-ports.sh -n -p
```

### Kill Only Specific Ports
```bash
./kill-ports.sh 3000 5173 8080
```

### Kill All Common Ports
```bash
./kill-ports.sh
```

### Kill Ports + Node.js Processes
```bash
./kill-ports.sh -n
```

## Integration with Development Workflow

### Before Starting Development
```bash
# Clean up any existing processes
./kill-ports.sh

# Start fresh development servers
npm run dev:all
```

### When Ports Are Busy
```bash
# Kill processes on specific busy ports
./kill-ports.sh 3000 5173

# Or kill everything and start fresh
./kill-ports.sh -n -p
```

### Troubleshooting
```bash
# If you can't start a development server
./kill-ports.sh 3000 5173 8080

# If Node.js processes are stuck
./kill-ports.sh -n

# If package managers are stuck
./kill-ports.sh -p
```

## Safety Notes

⚠️ **Warning**: These scripts use `kill -9` which forcefully terminates processes. Make sure to save your work before running them.

### Safe Usage Tips
1. Save all your work before running the scripts
2. Use specific ports when possible instead of killing everything
3. The scripts are safe to run multiple times
4. They only affect development processes, not system processes

## Troubleshooting

### Script Not Working
```bash
# Make sure the script is executable
chmod +x kill-ports.sh

# Check if lsof is available
which lsof
```

### Permission Denied
```bash
# Run with sudo if needed (rarely required)
sudo ./kill-ports.sh
```

### Port Still Busy
```bash
# Check what's using the port
lsof -i :3000

# Kill manually if needed
kill -9 $(lsof -ti:3000)
```

## Contributing

To add new ports to the default list, edit the `DEFAULT_PORTS` array in `kill-ports.sh`:

```bash
DEFAULT_PORTS=(
    3000    # React development server
    5173    # Vite development server
    # Add your new port here
    8080    # Your new service
)
```

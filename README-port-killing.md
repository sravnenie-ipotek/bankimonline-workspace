# Port Killing Scripts - Quick Reference

## 🚀 Quick Start

```bash
# Kill all common development ports
npm run kill-ports

# Kill everything (ports + Node.js + package managers)
npm run kill-ports:all

# Kill specific ports
npm run kill-ports -- 3000 5173 8080
```

## 📋 Available Commands

### NPM Scripts
```bash
npm run kill-ports              # Kill all common development ports
npm run kill-ports:all          # Kill all ports + Node.js + package managers
npm run kill-ports:node         # Kill all ports + Node.js processes
npm run kill-ports:process      # Kill all ports + package managers
```

### Direct Script Usage
```bash
./kill-ports.sh                 # Kill all common development ports
./kill-ports.sh -h              # Show help
./kill-ports.sh 3000 5173      # Kill specific ports
./kill-ports.sh -n              # Kill all ports + Node.js
./kill-ports.sh -p              # Kill all ports + package managers
./kill-ports.sh -n -p           # Kill everything
```

## 🎯 Common Use Cases

### Before Starting Development
```bash
npm run kill-ports
npm run dev:all
```

### When Ports Are Busy
```bash
npm run kill-ports -- 3000 5173
```

### Nuclear Option (Kill Everything)
```bash
npm run kill-ports:all
```

### Troubleshooting Stuck Processes
```bash
# Kill Node.js processes
npm run kill-ports:node

# Kill package managers
npm run kill-ports:process
```

## 📊 What Gets Killed

### Common Development Ports
- **React/Vite**: 3000, 3001, 5173, 5174
- **Python**: 8000, 5000
- **Server**: 8003
- **Alternative**: 8080-8085, 4000-4005, 5000-5005, 6000-6005, 7000-7005, 9000-9005
- **Angular**: 4200

### Process Types (with -n/-p flags)
- **Node.js processes** (`-n` flag)
- **Package managers** (`-p` flag): npm, yarn, pnpm

## ⚠️ Safety Notes

- Scripts use `kill -9` (forceful termination)
- Save your work before running
- Only affects development processes
- Safe to run multiple times

## 📚 Full Documentation

See `docs/port-management.md` for complete documentation.

## 🔧 Files Created

- `kill-ports.sh` - Main script (root directory)
- `scripts/kill-all-ports.sh` - Alias script
- `docs/port-management.md` - Full documentation
- `README-port-killing.md` - This quick reference

## 🚀 Integration

The scripts are integrated into the project's npm scripts for easy access:

```bash
# Quick port cleanup
npm run kill-ports

# Full cleanup before development
npm run kill-ports:all && npm run dev:all
```

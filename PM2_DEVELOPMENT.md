# PM2 Development Setup

This guide explains how to use PM2 for local development, providing production-like environment behavior while maintaining development flexibility.

## Why PM2 in Development?

While production uses the revolutionary PM2-dump architecture (created August 14, 2025), development can benefit from PM2 for:
- **Production parity**: Test PM2-specific behaviors locally
- **Process management**: Single command to start all services
- **Log aggregation**: All logs in one place
- **Auto-restart**: Services restart on crashes
- **Debugging production issues**: Replicate exact PM2 behaviors

## Quick Start

### Option 1: Traditional Development (Recommended for daily work)
```bash
# Simple and direct - use this for regular development
npm run dev                    # Start backend servers
cd mainapp && npm run dev      # Start frontend (separate terminal)
```

### Option 2: PM2 Development (For production-like environment)
```bash
# Start all services with PM2
npm run pm2:dev

# Monitor all services
npm run pm2:status

# View aggregated logs
npm run pm2:logs

# Stop everything
npm run pm2:stop
```

## PM2 Commands Reference

| Command | Description | When to Use |
|---------|-------------|-------------|
| `npm run pm2:dev` | Start all services | Beginning of dev session |
| `npm run pm2:stop` | Stop all services | End of dev session |
| `npm run pm2:restart` | Restart all services | After config changes |
| `npm run pm2:logs` | View all logs | Debugging issues |
| `npm run pm2:status` | Check service status | Monitor health |
| `npm run pm2:monit` | Interactive monitor | Detailed monitoring |
| `npm run pm2:clean` | Kill all PM2 processes | Emergency reset |

## Configuration

The PM2 development configuration is in `ecosystem.dev.config.js`:

### Services Managed by PM2

1. **bankim-dev-api** (Port 8003)
   - Backend API server
   - Auto-restarts on file changes
   - Watches: `server/**/*.js`, `.env`

2. **bankim-dev-files** (Port 3001)
   - Static file server
   - No auto-restart
   - Serves uploaded files

3. **bankim-dev-frontend** (Port 5173)
   - Vite development server
   - Has its own HMR (Hot Module Replacement)
   - No PM2 watching (Vite handles it)

### Environment Variables

PM2 reads from `.env` file in development:
```bash
# Required variables
DATABASE_URL=postgresql://...
CONTENT_DATABASE_URL=postgresql://...
MANAGEMENT_DATABASE_URL=postgresql://...
JWT_SECRET=your-dev-secret
PORT=8003
NODE_ENV=development
```

## Logs Location

PM2 creates log files in `logs/` directory:
- `dev-api-out.log` - API server output
- `dev-api-error.log` - API server errors
- `dev-files-out.log` - File server output
- `dev-frontend-out.log` - Frontend build output

## When to Use PM2 vs NPM

### Use `npm run dev` (Traditional) When:
- ✅ Making quick code changes
- ✅ Need direct console output
- ✅ Debugging with console.log
- ✅ Working on specific features
- ✅ Want simpler setup

### Use `npm run pm2:dev` (PM2) When:
- ✅ Testing PM2-specific features
- ✅ Debugging production issues locally
- ✅ Testing process clustering
- ✅ Need all services managed together
- ✅ Want production-like environment
- ✅ Testing auto-restart behavior

## Troubleshooting

### PM2 processes not starting
```bash
# Check if PM2 is installed
npx pm2 --version

# Clean any stuck processes
npm run pm2:clean

# Try starting again
npm run pm2:dev
```

### Port conflicts
```bash
# Kill processes on specific ports
npm run kill-ports:all

# Or manually
lsof -i :8003 | grep LISTEN
lsof -i :5173 | grep LISTEN
kill -9 <PID>
```

### Logs not showing
```bash
# View specific service logs
npx pm2 logs bankim-dev-api
npx pm2 logs bankim-dev-frontend

# Clear old logs
rm -rf logs/*.log
```

### Environment variables not loading
```bash
# Verify .env file exists
cat .env

# Check PM2 sees the variables
npx pm2 show bankim-dev-api | grep "environment"
```

## Production Architecture Note

**IMPORTANT**: Production uses a unique PM2-dump architecture where:
- Configuration is stored in `~/.pm2/dump.pm2` (created Aug 14, 2025)
- NO .env files are used in production
- Environment variables are embedded in the PM2 dump
- Changes require PM2 commands + `pm2 save`

This development setup uses traditional .env files for flexibility, but you can test dump-based configuration locally:

```bash
# Create a local PM2 dump (like production)
npm run pm2:dev
npx pm2 save

# Test resurrection (like production restart)
npx pm2 kill
npx pm2 resurrect
```

## Best Practices

1. **Keep it simple**: Use `npm run dev` for daily work
2. **Use PM2 for testing**: When you need production-like behavior
3. **Check logs regularly**: `npm run pm2:logs` shows all service outputs
4. **Clean restart**: If issues arise, use `npm run pm2:clean`
5. **Monitor resources**: PM2 shows memory/CPU usage in `pm2 status`

## Summary

You now have two ways to run development:
- **Quick & Simple**: `npm run dev` (recommended for daily work)
- **Production-like**: `npm run pm2:dev` (for testing PM2 features)

Both methods work with the same codebase and database. Choose based on your current needs!
# Development Instructions

## Quick Start (Production Mode)
Use the `launch.bat` file to start both servers in production mode:
```bash
# Windows
./launch.bat

# macOS/Linux  
./launch.sh
```

This will:
1. Install dependencies
2. Build the React app
3. Start API server on http://localhost:8003
4. Start file server on http://localhost:3001

## Development Mode (with Hot Reload)

For development with hot reload, run servers separately:

### Terminal 1: Start API Server
```bash
node server-db.js
```
API will run on http://localhost:8003

### Terminal 2: Start Vite Dev Server
```bash
cd mainapp
npm run dev
```
Frontend will run on http://localhost:5173 with hot reload

## Cities API Configuration

The cities dropdown now uses the database instead of hardcoded values:

- **API Endpoint**: `/api/get-cities?lang=en|he|ru`
- **Database Table**: `cities` (created by migration `006-cities-table.sql`)
- **Languages**: English, Hebrew, Russian
- **Fallback**: Translation keys if API fails

### Vite Proxy
The Vite dev server automatically proxies `/api/*` requests to `http://localhost:8003`

### CORS
The API server accepts requests from:
- http://localhost:3001 (production file server)
- http://localhost:5173 (Vite dev server)
- http://localhost:3000 (Create React App)
- http://localhost:8003 (API server)

## Testing Cities API
```bash
curl "http://localhost:8003/api/get-cities?lang=en"
curl "http://localhost:8003/api/get-cities?lang=he" 
curl "http://localhost:8003/api/get-cities?lang=ru"
```
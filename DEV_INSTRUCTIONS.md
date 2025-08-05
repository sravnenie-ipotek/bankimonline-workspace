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

## Database API Configuration

The application now uses database-driven dropdowns for:

### Cities API
- **API Endpoint**: `/api/get-cities?lang=en|he|ru`
- **Database Table**: `cities` (created by migration `006-cities-table.sql`)
- **Languages**: English, Hebrew, Russian
- **Fallback**: Translation keys if API fails

### Regions API
- **API Endpoint**: `/api/get-regions?lang=en|he|ru`
- **Database Table**: `regions` (created by migration `009-regions-and-professions-tables.sql`)
- **Languages**: English, Hebrew, Russian
- **Purpose**: Legal service areas for lawyers form

### Professions API
- **API Endpoint**: `/api/get-professions?lang=en|he|ru&category=legal`
- **Database Table**: `professions` (created by migration `009-regions-and-professions-tables.sql`)
- **Languages**: English, Hebrew, Russian
- **Categories**: legal, finance, business, technical, medical, education, management, general
- **Purpose**: Professional status options for forms

### Vite Proxy
The Vite dev server automatically proxies `/api/*` requests to `http://localhost:8003`

### CORS
The API server accepts requests from:
- http://localhost:3001 (production file server)
- http://localhost:5173 (Vite dev server)
- http://localhost:3000 (Create React App)
- http://localhost:8003 (API server)

## Testing Database APIs
```bash
# Cities API
curl "http://localhost:8003/api/get-cities?lang=en"
curl "http://localhost:8003/api/get-cities?lang=he" 
curl "http://localhost:8003/api/get-cities?lang=ru"

# Regions API
curl "http://localhost:8003/api/get-regions?lang=en"
curl "http://localhost:8003/api/get-regions?lang=he"
curl "http://localhost:8003/api/get-regions?lang=ru"

# Professions API
curl "http://localhost:8003/api/get-professions?lang=en"
curl "http://localhost:8003/api/get-professions?lang=he&category=legal"
curl "http://localhost:8003/api/get-professions?lang=ru&category=finance"
```

## Static File Synchronization

Some components reference static files that need to be available at the root public directory. If you encounter missing file errors like `src="/static/menu/keys.png"`, run the sync script:

```bash
./sync-static-files.sh
```

This script copies files from `mainapp/public/static/` to `public/static/` to ensure they're available at the expected paths.

### Files that need syncing:
- `/static/menu/keys.png` - Used in TemporaryFranchise component
- `/static/menu/franche_1.png` - Used in TemporaryFranchise component  
- `/static/menu/techRealt.png` - Used in TemporaryFranchise component

Run the sync script after:
- Adding new static files to `mainapp/public/static/`
- Encountering "file not found" errors for static assets
- Setting up the project for the first time
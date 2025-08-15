./start-local-dev.sh

./kill-ports.sh



cd /Users/michaelmishayev/Projects/bankDev2_standalone
cd packages/server && npm run dev

 Modern Development Startup Commands

  🚀 Recommended Modern Way (Monorepo)

  # From project root - starts both server and client together
  npm run dev:all

  This runs:
  - Backend: packages/server/src/server.js on port 8003
  - Frontend: packages/client (mainapp) on port 5173

  📋 Individual Modern Commands

  Backend Only (Modern Server):
  # Option 1: Via workspace (recommended)
  npm run server:dev

  # Option 2: Direct to packages
  cd packages/server && npm run dev

  # Option 3: Using workspace from root
  npm run dev --workspace=@bankimonline/server

  Frontend Only (Modern Client):
  # Option 1: Via workspace (recommended) 
  npm run client:dev

  # Option 2: Direct to mainapp
  cd mainapp && npm run dev

  # Option 3: Using workspace from root
  npm run dev --workspace=@bankimonline/client

  ⚡ Quick Start Commands

  # 1. Install all dependencies (run once)
  npm run install:all

  # 2. Build shared components
  npm run shared:build

  # 3. Start development environment
  npm run dev:all

  🔧 Legacy vs Modern Commands

  | Purpose      | Legacy Command           | Modern Command       |
  |--------------|--------------------------|----------------------|
  | Backend Only | npm run dev              | npm run server:dev   |
  | Full Stack   | node server/start-dev.js | npm run dev:all      |
  | Production   | npm start                | npm run server:start |

  📊 Current Running Status

  Based on our session, you currently have:
  - ✅ Modern server running: packages/server/src/server.js (port 8003)
  - ✅ Authentication fix applied and working
  - ✅ JWT_SECRET configured properly

  🎯 Recommended Development Workflow

  # 1. Stop any running processes
  npm run kill-ports:all

  # 2. Start modern development environment
  npm run dev:all

  # 3. Open browser to:
  #    - Frontend: http://localhost:5173
  #    - Backend API: http://localhost:8003

  🚨 Important Notes

  - The modern way uses packages/server/src/server.js (the one with the authentication
   fix)
  - The legacy way (npm run dev) still works but uses the older server
  - Both servers are synchronized with fixes, but modern is preferred for development
  - Use workspace commands from project root for consistency
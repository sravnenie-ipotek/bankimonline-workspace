@echo off
echo ========================================
echo   Bankimonline Standalone Application
echo ========================================
echo.

set PROJECT_ROOT=%~dp0
cd /d "%PROJECT_ROOT%"

echo Checking dependencies...

REM Check if Node.js is installed
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Install Mock API dependencies if needed
if not exist "node_modules" (
    echo Installing Mock API dependencies...
    npm install
    if %errorlevel% neq 0 (
        echo ERROR: Failed to install Mock API dependencies!
        pause
        exit /b 1
    )
    echo.
)

REM Install React app dependencies if needed
if not exist "mainapp\node_modules" (
    echo Installing React app dependencies...
    cd mainapp
    npm install
    if %errorlevel% neq 0 (
        echo ERROR: Failed to install React app dependencies!
        pause
        exit /b 1
    )
    cd ..
    echo.
)

echo Starting services...
echo.

REM Start Mock API Server
echo - Starting Mock API Server on port 8003...
start "Mock API - Bankimonline" cmd /k "npm start"

REM Wait a moment for API to start
timeout /t 3 /nobreak >nul

REM Start React App
echo - Starting React App on port 5173...
start "React App - Bankimonline" cmd /k "cd mainapp && npm run dev"

echo.
echo ========================================
echo   Standalone Application Started!
echo ========================================
echo.
echo Services running:
echo   📊 Mock API Server: http://localhost:8003
echo   🚀 React App:      http://localhost:5173
echo.
echo 💡 Note: The React app will use mock data from the API server.
echo    No PHP, database, or other services required!
echo.
echo Press any key to continue...
pause >nul 
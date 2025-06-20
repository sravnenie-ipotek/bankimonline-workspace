@echo off
setlocal enabledelayedexpansion

echo ========================================
echo BankDev2 Project Launcher
echo ========================================
echo.

REM Define colors for output
set "GREEN=[92m"
set "RED=[91m"
set "YELLOW=[93m"
set "RESET=[0m"

REM Check prerequisites
echo %YELLOW%Checking prerequisites...%RESET%
echo.

REM Check Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo %RED%ERROR: Node.js is not installed or not in PATH%RESET%
    echo Please install Node.js from https://nodejs.org/
    goto :error
)
for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo %GREEN%✓ Node.js %NODE_VERSION% found%RESET%

REM Check npm
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo %RED%ERROR: npm is not installed or not in PATH%RESET%
    goto :error
)
for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
echo %GREEN%✓ npm %NPM_VERSION% found%RESET%

REM Check PostgreSQL (optional, warn if not found)
where psql >nul 2>nul
if %errorlevel% neq 0 (
    echo %YELLOW%⚠ PostgreSQL client not found in PATH%RESET%
    echo   Database should be running separately or configured via DATABASE_URL
) else (
    echo %GREEN%✓ PostgreSQL client found%RESET%
)

echo.
echo %YELLOW%[1/5] Installing dependencies...%RESET%

REM Install root dependencies
if not exist "node_modules" (
    echo Installing root dependencies...
    call npm install
    if %errorlevel% neq 0 (
        echo %RED%ERROR: Failed to install root dependencies%RESET%
        goto :error
    )
) else (
    echo Root dependencies already installed, updating...
    call npm update
)

REM Install mainapp dependencies
if not exist "mainapp\node_modules" (
    echo Installing mainapp dependencies...
    cd mainapp
    call npm install
    if %errorlevel% neq 0 (
        echo %RED%ERROR: Failed to install mainapp dependencies%RESET%
        cd ..
        goto :error
    )
    cd ..
) else (
    echo Mainapp dependencies already installed, updating...
    cd mainapp
    call npm update
    cd ..
)

echo.
echo %YELLOW%[2/5] Building React application...%RESET%
cd mainapp
call npm run build
if %errorlevel% neq 0 (
    echo %RED%ERROR: Failed to build React application%RESET%
    cd ..
    goto :error
)
cd ..
echo %GREEN%✓ Build completed successfully%RESET%

echo.
echo %YELLOW%[3/5] Checking database connection...%RESET%
REM Try to ping the database (this is optional)
node -e "console.log('Database check skipped - will be verified on server start')"

echo.
echo %YELLOW%[4/5] Starting servers...%RESET%
echo.
echo %GREEN%API Server will run on: http://localhost:8003%RESET%
echo %GREEN%Web Application will run on: http://localhost:3001%RESET%
echo.
echo Press Ctrl+C to stop all servers
echo.

REM Start servers using the existing start-dev script
node start-dev.js

goto :end

:error
echo.
echo %RED%Launch failed!%RESET%
echo Please fix the errors above and try again.
pause
exit /b 1

:end
echo.
echo %YELLOW%Servers stopped.%RESET%
pause
exit /b 0
@echo off
echo ========================================
echo Starting BankDev2 Project
echo ========================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if npm is installed
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: npm is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo [1/4] Installing dependencies...
echo.

REM Install root dependencies
echo Installing root dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install root dependencies
    pause
    exit /b 1
)

REM Install mainapp dependencies
echo Installing mainapp dependencies...
cd mainapp
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install mainapp dependencies
    pause
    exit /b 1
)
cd ..

echo.
echo [2/4] Building React application...
cd mainapp
call npm run build
if %errorlevel% neq 0 (
    echo ERROR: Failed to build React application
    pause
    exit /b 1
)
cd ..

echo.
echo [3/4] Starting servers...
echo.

REM Use the existing start-dev.js script which handles both servers
echo Starting API server on port 8003 and File server on port 3001...
node start-dev.js

REM If the servers exit, pause to see any error messages
echo.
echo Servers stopped.
pause
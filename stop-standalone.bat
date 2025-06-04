@echo off
echo ========================================
echo   Stopping Bankimonline Standalone
echo ========================================
echo.

echo Stopping services on ports...

echo - Port 5173 (React App)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":5173 "') do (
    taskkill /F /PID %%a 2>nul && echo   Stopped React App on port 5173
)

echo - Port 8003 (Mock API)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":8003 "') do (
    taskkill /F /PID %%a 2>nul && echo   Stopped Mock API on port 8003
)

echo.
echo Closing console windows...
taskkill /F /FI "WINDOWTITLE eq Mock API - Bankimonline" 2>nul
taskkill /F /FI "WINDOWTITLE eq React App - Bankimonline" 2>nul

echo.
echo Standalone application stopped.
echo.
pause

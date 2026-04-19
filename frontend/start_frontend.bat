@echo off
title ShopKenya Frontend
color 0B
cd /d "%~dp0"
echo.
echo  =============================================
echo    ShopKenya Frontend  ^|  localhost:3000
echo  =============================================
echo.

node --version >nul 2>&1
if errorlevel 1 (
    echo  [ERROR] Node.js not found.
    echo  Download from https://nodejs.org (choose LTS)
    pause & exit /b 1
)

if not exist "node_modules" (
    echo  Installing packages (first time ~2 min)...
    npm install
    echo  Done.
    echo.
)

echo  Starting React app at http://localhost:3000
echo  Make sure the backend is also running.
echo.
npm start
pause

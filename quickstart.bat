@echo off
REM MathAI Quick Start Script for Windows

echo.
echo ============================================
echo   MathAI - Quick Start
echo ============================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed
    echo Download from https://nodejs.org/
    pause
    exit /b 1
)

echo Node.js detected: 
node --version

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: npm is not installed
    pause
    exit /b 1
)

echo npm version:
npm --version

echo.
echo Installing dependencies...
echo.

REM Install root dependencies
echo Installing root dependencies...
call npm install

REM Install backend dependencies
echo Installing backend dependencies...
cd backend
call npm install
cd ..

REM Install frontend dependencies
echo Installing frontend dependencies...
cd frontend
call npm install
cd ..

echo.
echo ============================================
echo   Setup Complete!
echo ============================================
echo.
echo Next steps:
echo.
echo 1. Configure environment variables:
echo    - Copy backend\.env.example to backend\.env
echo    - Add your API keys
echo.
echo 2. Start services:
echo    - Run: npm run dev
echo.
echo 3. Open browser:
echo    - Frontend: http://localhost:3000
echo    - Backend: http://localhost:5000
echo.
echo 4. Try the solver:
echo    - Click "Launch Solver"
echo    - Enter an equation
echo.
echo For more info, see SETUP.md
echo.
pause

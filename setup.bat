@echo off
echo ==========================================
echo GreenHarvest Setup Script
echo ==========================================

echo.
echo [1/3] Installing Root Dependencies...
call npm install
if %errorlevel% neq 0 (
    echo Failed to install root dependencies.
    pause
    exit /b %errorlevel%
)

echo.
echo [2/3] Installing Backend Dependencies...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo Failed to install backend dependencies.
    pause
    exit /b %errorlevel%
)
cd ..

echo.
echo [3/3] Installing Frontend Dependencies...
cd frontend
call npm install
if %errorlevel% neq 0 (
    echo Failed to install frontend dependencies.
    pause
    exit /b %errorlevel%
)
cd ..

echo.
echo ==========================================
echo Setup Complete!
echo ==========================================
echo.
echo Next Steps:
echo 1. Seed the database:
echo    node seed/index.js
echo.
echo 2. Start the application (Docker):
echo    cd infra
echo    docker compose up --build
echo.
echo 3. Or run manually:
echo    Backend: cd backend ^& npm run dev
echo    Frontend: cd frontend ^& npm run dev
echo.
pause

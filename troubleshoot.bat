@echo off
echo ==========================================
echo GreenHarvest Docker Troubleshooter
echo ==========================================
echo.
echo This script checks if your computer can connect to Docker Hub.
echo The error "context deadline exceeded" means your internet is blocking Docker.
echo.

echo [1/3] Checking Internet Connection (ping google.com)...
ping -n 1 google.com >nul
if %errorlevel% neq 0 (
    echo [FAIL] You seem to be offline. Please check your internet.
    pause
    exit /b 1
) else (
    echo [OK] Internet is reachable.
)

echo.
echo [2/3] Checking Docker Hub Access (ping registry-1.docker.io)...
ping -n 1 registry-1.docker.io >nul
if %errorlevel% neq 0 (
    echo [WARNING] Cannot ping Docker Hub. This is common on VPNs or School Networks.
) else (
    echo [OK] Docker Hub is reachable via ping.
)

echo.
echo [3/3] Trying to pull a test image (hello-world)...
docker pull hello-world
if %errorlevel% neq 0 (
    echo.
    echo [FAIL] Docker cannot download images.
    echo.
    echo POSSIBLE CAUSES:
    echo 1. You are on a VPN. (Turn it off)
    echo 2. You are on a School/Office Wifi that blocks Docker. (Try Mobile Hotspot)
    echo 3. Docker Desktop DNS is broken. (Restart Docker Desktop)
    echo.
    echo SOLUTION:
    echo Try connecting to a different network (like your phone's hotspot) and run this again.
) else (
    echo.
    echo [SUCCESS] Docker is working! You can now run:
    echo cd infra
    echo docker compose up --build
)

pause

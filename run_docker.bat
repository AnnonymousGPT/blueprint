@echo off
echo ===================================================
echo 🐳 Starting Docker Setup for Blueprint Advisor
echo ===================================================

:: Check if docker command is available
where docker >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Docker is not installed or not found in system PATH.
    echo Please install Docker Desktop for Windows: https://www.docker.com/products/docker-desktop
    echo Make sure Docker is running, then run this script again.
    pause
    exit /b 1
)

echo [1/3] Building and launching containers via Docker Compose...
docker compose up -d --build
if %errorlevel% neq 0 (
    echo [ERROR] Failed to start docker containers.
    pause
    exit /b 1
)

echo [2/3] Waiting for PostgreSQL database to be healthy...
timeout /t 5 /nobreak >nul

echo [3/3] Running Prisma migrations and seeding database inside the container...
docker exec -it blueprint_backend npx prisma migrate deploy
docker exec -it blueprint_backend npx prisma db seed

echo ===================================================
echo 🎉 Deployment successful!
echo Server running at http://localhost:5000
echo Nginx Proxy Gateway mapping at http://localhost:80
echo ===================================================
pause

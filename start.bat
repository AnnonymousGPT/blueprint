@echo off
title Blueprint Dev Server Launcher
echo ===================================================
echo 🚀 Starting Blueprint Client & Expert Dev Servers...
echo ===================================================

:: Start Client App on port 5173 (Minimized)
start "Blueprint Client Dev" /min cmd /c "cd /d %~dp0frontend && npm run dev -- --port 5173 --host"
echo [+] Client Dev Server triggered (Port: 5173)

:: Start Expert App on port 5174 (Minimized)
start "Blueprint Expert Dev" /min cmd /c "cd /d %~dp0expert && npm run dev -- --port 5174 --host"
echo [+] Expert Dev Server triggered (Port: 5174)

echo ---------------------------------------------------
echo ✅ Both dev servers are running in the background!
echo 🔗 Client: http://localhost:5173
echo 🔗 Expert: http://localhost:5174
echo ---------------------------------------------------
echo Note: Close the minimized terminal windows to stop the servers.
pause

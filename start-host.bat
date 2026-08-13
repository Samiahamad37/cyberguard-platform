@echo off
cd /d "%~dp0"
echo Starting CyberGuard AI (Next.js frontend + API)...
start "CyberGuard" cmd /k "cd /d %~dp0 && npm run dev -- --hostname 0.0.0.0 --port 3000"
echo.
echo Open http://localhost:3000
echo API is same-origin at /api/v1
pause

@echo off
echo Starting Devclash Hack Servers...

echo [1/3] Starting Express Backend (Port 5001)...
start "Express Backend" cmd /c "node backend\server.js"

echo [2/3] Starting Flask Backend (Port 5000)...
start "Flask Backend" cmd /c "venv\Scripts\activate.bat && python backend\app.py"

echo [3/3] Starting Vite Frontend (Port 5173)...
start "React Frontend" cmd /c "cd frontend && npm run dev"

echo All servers are starting in separate windows!
echo Once they are ready, you can access the app at http://localhost:5173
pause

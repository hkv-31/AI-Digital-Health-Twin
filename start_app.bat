@echo off
echo Starting Backend (FastAPI)...
start cmd /k "uvicorn backend_api:app --reload"

echo Starting Frontend (React)...
cd frontend
start cmd /k "npm run dev"

echo App started! 
echo Frontend: http://localhost:5173
echo Backend: http://localhost:8000

@echo off
echo ========================================
echo Starting UAE Anthem Backend Server
echo ========================================
echo.
echo Activating virtual environment...
call .venv\Scripts\activate.bat
echo.
echo Starting Uvicorn server on port 8000...
echo.
uvicorn api.main:app --reload --host 0.0.0.0 --port 8000

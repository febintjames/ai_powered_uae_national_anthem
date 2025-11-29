@echo off
echo Setting up environment...
echo NEXT_PUBLIC_API_BASE_URL=http://localhost:8000 > .env.local
echo.
echo Environment file created!
echo Starting development server...
echo.
npm run dev

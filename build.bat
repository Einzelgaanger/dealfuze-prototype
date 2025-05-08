@echo off
echo Building DealFuze for production...

echo.
echo Step 1: Building server...
cd server
call npm run build
if %ERRORLEVEL% neq 0 (
  echo Server build failed!
  exit /b %ERRORLEVEL%
)

echo.
echo Step 2: Building frontend...
cd ../frontend
call npm run build
if %ERRORLEVEL% neq 0 (
  echo Frontend build failed!
  exit /b %ERRORLEVEL%
)

echo.
echo Build completed successfully!
echo To start the application in production mode:
echo 1. cd server && npm run start:simple
echo 2. cd frontend && npm run start
echo.

exit /b 0

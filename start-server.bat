@echo off
echo ============================================
echo Amandla Frontend Server
echo ============================================
echo.
echo Starting server on http://localhost:8000
echo.
echo Make sure your backend is running on http://localhost:3004
echo.
echo Press Ctrl+C to stop the server
echo ============================================
echo.

REM Try to start with Python
where python >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo Using Python to serve files...
    python -m http.server 8000
    goto :eof
)

REM Try to start with PHP
where php >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo Using PHP to serve files...
    php -S localhost:8000
    goto :eof
)

REM If neither is available
echo ERROR: Neither Python nor PHP found!
echo Please install Python or PHP, or use another web server.
echo.
echo Alternative: Install Node.js http-server:
echo   npm install -g http-server
echo   http-server -p 8000
pause

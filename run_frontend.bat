@echo off
set "PATH=%SystemRoot%\System32;%SystemRoot%;%PATH%"
title BookNook Frontend - React + Vite
color 0B

echo ============================================================
echo   BOOKNOOK E-COMMERCE - REACT 18 + VITE FRONTEND
echo ============================================================
echo.

:: Check Node.js
call node -v >nul 2>&1
if %errorlevel% neq 0 (
    color 0C
    echo [ERROR] Node.js is not installed or not in your system PATH!
    echo Please install Node.js (LTS version) from https://nodejs.org/
    echo.
    pause
    exit /b 1
)

:: Check npm
call npm -v >nul 2>&1
if %errorlevel% neq 0 (
    color 0C
    echo [ERROR] npm was not found!
    echo.
    pause
    exit /b 1
)

echo [INFO] Node.js version:
call node -v
echo [INFO] npm version:
call npm -v
echo.

cd /d "%~dp0frontend"

:: Check if dependencies are installed
if not exist "node_modules\" (
    echo [INFO] Dependencies not found. Installing packages with 'npm install'...
    call npm install
    if %errorlevel% neq 0 (
        color 0C
        echo [ERROR] npm install failed! Please check your internet connection or npm cache.
        pause
        exit /b 1
    )
)

echo [INFO] Launching Vite development server at http://localhost:5173...
echo.
call npm run dev

if %errorlevel% neq 0 (
    color 0C
    echo.
    echo [ERROR] Vite server failed or exited unexpectedly.
    echo.
    pause
)

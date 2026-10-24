@echo off
title BookNook Backend - Spring Boot
color 0A

echo ============================================================
echo   BOOKNOOK E-COMMERCE - SPRING BOOT 3 REST API BACKEND
echo ============================================================
echo.

:: Check Java
java -version >nul 2>&1
if %errorlevel% neq 0 (
    color 0C
    echo [ERROR] Java is not installed or not in your system PATH!
    echo Please install JDK 17 or higher from https://adoptium.net/
    echo and ensure JAVA_HOME is configured.
    echo.
    pause
    exit /b 1
)

:: Check Maven
set "MVN_CMD=mvn"
call mvn -v >nul 2>&1
if %errorlevel% neq 0 (
    if exist "%~dp0apache-maven-3.9.9\bin\mvn.cmd" (
        set "MVN_CMD=%~dp0apache-maven-3.9.9\bin\mvn.cmd"
    ) else (
        color 0E
        echo [WARNING] Maven ('mvn') was not found in your system PATH.
        echo Please ensure Maven is installed or use Eclipse/VS Code.
        pause
        exit /b 1
    )
)

echo [INFO] Environment check passed:
java -version 2>&1 | findstr /i "version"
call "%MVN_CMD%" -v | findstr /i "Apache Maven"
echo.
echo [INFO] Target database: MySQL 'booknook_db' on localhost:3306
echo [INFO] Starting Spring Boot application on http://localhost:8080...
echo.

cd /d "%~dp0backend"
call "%MVN_CMD%" spring-boot:run

if %errorlevel% neq 0 (
    color 0C
    echo.
    echo [ERROR] Backend failed to start or exited with an error.
    echo Please check if MySQL is running on port 3306 and database credentials match
    echo backend/src/main/resources/application.properties.
    echo.
    pause
)

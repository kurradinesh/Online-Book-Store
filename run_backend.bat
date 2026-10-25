@echo off
set "PATH=%SystemRoot%\System32;%SystemRoot%;%PATH%"
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

:: Check Maven (prioritize bundled Maven)
if exist "%~dp0apache-maven-3.9.9\bin\mvn.cmd" (
    set "MVN_CMD=%~dp0apache-maven-3.9.9\bin\mvn.cmd"
    set "PATH=%~dp0apache-maven-3.9.9\bin;%PATH%"
) else (
    set "MVN_CMD=mvn"
    call mvn -v >nul 2>&1
    if %errorlevel% neq 0 (
        color 0E
        echo [WARNING] Maven command was not found in your system PATH.
        echo Please ensure Maven is installed or use Eclipse/VS Code.
        pause
        exit /b 1
    )
)

:: Database Host Fallback / Sanitization
if "%DB_HOST%"=="mysql-260852e3-kurradinesh93-8620.aivencloud.com" (
    echo [WARNING] Detected expired Aiven cloud DB host: %DB_HOST%
    echo [INFO] Automatically switching to local MySQL on localhost:3306...
    set "DB_HOST=localhost"
    set "DB_PORT=3306"
    set "DB_NAME=booknook_db"
    set "DB_USER=root"
    set "DB_PASSWORD=Bujjibabu@7732"
    set "DB_SSL_MODE=DISABLED"
)

if "%DB_HOST%"=="" set "DB_HOST=localhost"
if "%DB_PORT%"=="" set "DB_PORT=3306"
if "%DB_NAME%"=="" set "DB_NAME=booknook_db"
if "%DB_USER%"=="" set "DB_USER=root"
if "%DB_PASSWORD%"=="" set "DB_PASSWORD=Bujjibabu@7732"
if "%DB_SSL_MODE%"=="" set "DB_SSL_MODE=DISABLED"

echo [INFO] Environment check passed:
java -version 2>&1 | findstr /i "version"
call "%MVN_CMD%" -v | findstr /i "Apache Maven"
echo.
echo [INFO] Target database: MySQL '%DB_NAME%' on %DB_HOST%:%DB_PORT% (User: %DB_USER%)
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

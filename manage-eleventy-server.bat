@echo off
SET PORT=3000
SET ELEVENTY_DIR=C:\Users\al_si\CascadeProjects\ValueAlignEleventy

echo ===== ValueAlign Eleventy Server Manager =====
echo This script will help manage your Eleventy development server
echo.

:menu
echo Choose an option:
echo 1. Start clean server (stops any existing server first)
echo 2. Force rebuild all files
echo 3. Stop all server instances
echo 4. View server status
echo 5. Exit
echo.

set /p option="Enter option (1-5): "

if "%option%"=="1" goto start_server
if "%option%"=="2" goto rebuild
if "%option%"=="3" goto stop_server
if "%option%"=="4" goto status
if "%option%"=="5" goto end

echo Invalid option. Try again.
goto menu

:stop_server
echo.
echo Stopping any running Eleventy servers...
echo.

REM Find PID of process using port 3000
for /f "tokens=5" %%a in ('netstat -aon ^| find ":%PORT%" ^| find "LISTENING"') do (
    echo Found process using port %PORT%: %%a
    echo Attempting to kill process...
    
    REM Try to kill process
    taskkill /F /PID %%a
    
    if %ERRORLEVEL% EQU 0 (
        echo Process terminated successfully.
    ) else (
        echo Failed to terminate process. You may need to run this script as administrator.
        echo Or manually end the process using Task Manager.
    )
)

echo.
echo All server instances should be stopped.
echo.
timeout /t 3 >nul
goto menu

:rebuild
echo.
echo Rebuilding all site files...
cd %ELEVENTY_DIR%
call npx @11ty/eleventy
echo.
echo Rebuild complete!
echo.
timeout /t 3 >nul
goto menu

:start_server
echo.
echo First stopping any existing servers...
goto stop_server_for_start

:stop_server_for_start
for /f "tokens=5" %%a in ('netstat -aon ^| find ":%PORT%" ^| find "LISTENING"') do (
    echo Found process using port %PORT%: %%a
    taskkill /F /PID %%a >nul 2>&1
)

echo.
echo Starting new Eleventy server on port %PORT%...
cd %ELEVENTY_DIR%
start cmd /k "npx @11ty/eleventy --serve --quiet"
echo.
echo Server started! Access your site at http://localhost:%PORT%/
echo.
echo NOTE: A new command window has been opened running the server.
echo To stop the server, close that window or use option 3 from this menu.
echo.
timeout /t 3 >nul
goto menu

:status
echo.
echo Checking server status...
echo.

set "serverRunning=false"
for /f "tokens=5" %%a in ('netstat -aon ^| find ":%PORT%" ^| find "LISTENING"') do (
    echo Eleventy server is RUNNING on port %PORT%
    echo Process ID: %%a
    set "serverRunning=true"
)

if "%serverRunning%"=="false" (
    echo No Eleventy server detected on port %PORT%
)

echo.
echo To view your site, go to: http://localhost:%PORT%/
echo.
timeout /t 5 >nul
goto menu

:end
echo.
echo Thank you for using the ValueAlign Eleventy Server Manager
echo.
exit /b 0

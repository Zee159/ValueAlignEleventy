@echo off
TITLE ValueAlign Eleventy Development Server

:: Check if a server is already running on port 3000
ECHO Checking if an Eleventy server is already running...
netstat -ano | findstr :3000 > nul
IF %ERRORLEVEL% EQU 0 (
    ECHO A server is already running on port 3000
    ECHO Stopping existing server...
    FOR /F "tokens=5" %%P IN ('netstat -ano ^| findstr :3000 ^| findstr LISTENING') DO (
        taskkill /F /PID %%P
    )
    ECHO Waiting for process to end...
    timeout /t 2 > nul
)

:: Start the Eleventy server
ECHO Starting Eleventy development server on port 3000...
ECHO Access your site at http://localhost:3000/
ECHO Press Ctrl+C to stop the server when finished

npx @11ty/eleventy --serve --port=3000

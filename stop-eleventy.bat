@echo off
TITLE Stop ValueAlign Eleventy Server

:: Find and stop any running Eleventy servers on port 3000
ECHO Checking for running Eleventy server...
netstat -ano | findstr :3000 > nul
IF %ERRORLEVEL% EQU 0 (
    ECHO Found server running on port 3000
    ECHO Stopping server...
    FOR /F "tokens=5" %%P IN ('netstat -ano ^| findstr :3000 ^| findstr LISTENING') DO (
        taskkill /F /PID %%P
        ECHO Server with PID %%P stopped.
    )
) ELSE (
    ECHO No server running on port 3000.
)

ECHO Done.
pause

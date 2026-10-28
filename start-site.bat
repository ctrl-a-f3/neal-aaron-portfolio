@echo off
cd /d "%~dp0"
where py >nul 2>nul
if %errorlevel%==0 (
    py -3 launch.py
) else (
    python launch.py
)
if errorlevel 1 (
    echo.
    echo Python 3 is required. You can also open index.html directly.
    pause
)

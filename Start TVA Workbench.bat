@echo off
setlocal
cd /d "%~dp0"
where py >nul 2>nul
if not errorlevel 1 (
  py -3 server.py %*
) else (
  where python >nul 2>nul
  if errorlevel 1 (
    echo Python 3.9 or later is required. Install Python from python.org and reopen this launcher.
    pause
    exit /b 1
  )
  python server.py %*
)
if errorlevel 1 pause

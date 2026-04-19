@echo off
title ShopKenya Backend
color 0A
cd /d "%~dp0"
echo.
echo  =============================================
echo    ShopKenya Backend  ^|  localhost:8000
echo  =============================================
echo.

REM Find Python
set PY=
for %%c in (python python3 py) do (
    if not defined PY (%%c --version >nul 2>&1 && set PY=%%c)
)
if not defined PY (
    echo  [ERROR] Python not found.
    echo  Download Python 3.11 from https://www.python.org/downloads/
    echo  Tick "Add Python to PATH" during install.
    pause & exit /b 1
)

REM Create venv if missing
if not exist "venv\Scripts\activate.bat" (
    echo  Creating virtual environment...
    %PY% -m venv venv
    echo  Done.
)

REM Activate
call venv\Scripts\activate.bat

REM Install if needed
if not exist "venv\Scripts\uvicorn.exe" (
    echo  Installing packages (first time ~1 min)...
    python -m pip install --upgrade pip -q
    pip install -r requirements.txt
    echo  Done.
    echo.
)

echo  Starting server...
echo  API:  http://localhost:8000
echo  Docs: http://localhost:8000/docs
echo.
echo  Press Ctrl+C to stop.
echo.

python -m uvicorn main:app --reload --port 8000
pause

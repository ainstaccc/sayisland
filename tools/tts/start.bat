@echo off
cd /d "%~dp0"
where python >nul 2>nul
if errorlevel 1 (
  echo Python not found. Please install Python 3.9+ from python.org and tick "Add Python to PATH".
  pause
  exit /b
)
echo Installing edge-tts, first run takes about 1 minute...
python -m pip install --quiet --disable-pip-version-check edge-tts
if errorlevel 1 (
  echo Package install failed. Check network and try again.
  pause
  exit /b
)
python gen_audio.py %*
pause

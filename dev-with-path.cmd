@echo off
set "PATH=C:\Program Files\nodejs;%APPDATA%\npm;%PATH%"
cd /d "%~dp0.."
"C:\Program Files\nodejs\npm.cmd" run dev

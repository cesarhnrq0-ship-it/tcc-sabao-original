@echo off
REM Abre o site em modo de desenvolvimento (atualiza sozinho a cada mudança)
cd /d "%~dp0"
if not exist node_modules call npm install
call npm run dev -- --open
pause

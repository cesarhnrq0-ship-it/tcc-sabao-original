@echo off
REM Gera as pastas "publicar" (GitHub Pages) e "publicar-claude" (arquivo único)
cd /d "%~dp0"
if not exist node_modules call npm install
call npm run build
call npm run build:claude
echo.
echo Envie o conteudo da pasta "publicar" para o GitHub.
pause

@echo off
REM Envia o codigo para o GitHub. O site e publicado sozinho em 1 a 2 minutos.
cd /d "%~dp0"
git add -A
set /p MSG="Descreva a mudanca (Enter = Atualiza o site): "
if "%MSG%"=="" set MSG=Atualiza o site
git commit -m "%MSG%"
git push origin main
echo.
echo Pronto! Acompanhe em https://github.com/cesarhnrq0-ship-it/tcc-sabao-original/actions
pause

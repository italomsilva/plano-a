@echo off
echo ========================================================
echo   Plano A - Encerrando Servidores (Portas 3000 e 3001)
echo ========================================================
echo.

echo Encerrando processos na porta 3000 (Frontend Next.js)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":3000 "') do (
    taskkill /F /PID %%a 2>nul
)

echo Encerrando processos na porta 3001 (Backend NestJS)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":3001 "') do (
    taskkill /F /PID %%a 2>nul
)

echo.
echo ========================================================
echo   Todos os servidores foram encerrados com sucesso!
echo ========================================================
echo.
pause


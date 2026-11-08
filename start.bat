@echo off
echo ========================================================
echo   Plano A - Hermes Agent (Iniciando Servidores)
echo ========================================================
echo.
echo Iniciando Backend NestJS na porta 3001...
start "Plano A - Backend" cmd /k "cd backend && npm run start:dev"

echo Iniciando Frontend Next.js na porta 3000...
start "Plano A - Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ========================================================
echo   Aplicacao rodando com sucesso!
echo   Frontend: http://localhost:3000
echo   Backend:  http://localhost:3001/api
echo ========================================================
pause


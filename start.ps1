Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "   Plano A - Hermes Agent (Iniciando Servidores)" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Iniciando Backend NestJS na porta 3001..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; npm run start:dev"

Write-Host "Iniciando Frontend Next.js na porta 3000..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev"

Write-Host ""
Write-Host "========================================================" -ForegroundColor Green
Write-Host "   Aplicacao rodando com sucesso!" -ForegroundColor Green
Write-Host "   Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "   Backend:  http://localhost:3001/api" -ForegroundColor White
Write-Host "========================================================" -ForegroundColor Green


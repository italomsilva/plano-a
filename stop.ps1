Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "   Plano A - Encerrando Servidores (Portas 3000 e 3001) " -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""

$ports = @(3000, 3001)
$killedAny = $false

foreach ($port in $ports) {
    $connections = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    if ($connections) {
        foreach ($conn in $connections) {
            $pId = $conn.OwningProcess
            try {
                Stop-Process -Id $pId -Force -ErrorAction SilentlyContinue
                Write-Host "Processo na porta $port (PID: $pId) encerrado com sucesso." -ForegroundColor Green
                $killedAny = $true
            } catch {
                Write-Host "Não foi possível finalizar o processo $pId." -ForegroundColor Red
            }
        }
    } else {
        Write-Host "Nenhum processo rodando na porta $port." -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "========================================================" -ForegroundColor Green
Write-Host "   Servidores finalizados!" -ForegroundColor Green
Write-Host "========================================================" -ForegroundColor Green


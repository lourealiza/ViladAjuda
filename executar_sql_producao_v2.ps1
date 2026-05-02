# Executar SQL de Temporadas 2026 em Produção
# ========================================

# Credenciais de Produção
$dbHost = "mysql.viladajuda.com.br"
$dbUser = "viladajuda"
$dbPassword = "2026dAjudaVila"
$dbName = "viladajuda"
$dbPort = 3306

# Caminho do arquivo SQL
$sqlFile = ".\backend\src\scripts\inserir_temporadas_2026.sql"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "🚀 Executar SQL em Produção" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📊 Dados de Conexão:" -ForegroundColor Yellow
Write-Host "   Host: $dbHost"
Write-Host "   Database: $dbName"
Write-Host "   User: $dbUser"
Write-Host ""

# Validar arquivo SQL
if (-not (Test-Path $sqlFile)) {
    Write-Host "❌ Arquivo SQL não encontrado: $sqlFile" -ForegroundColor Red
    exit 1
}

# Verificar se mysql está instalado
if (-not (Get-Command mysql -ErrorAction SilentlyContinue)) {
    Write-Host "❌ MySQL CLI não encontrado!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Por favor copie e execute este script no HeidiSQL ou phpMyAdmin:" -ForegroundColor Yellow
    Write-Host "   Arquivo: $sqlFile" -ForegroundColor Green
    Write-Host ""
    exit 1
}

Write-Host "✅ MySQL CLI encontrado" -ForegroundColor Green
Write-Host "⏳ Executando SQL em produção..." -ForegroundColor Yellow
Write-Host ""

# Ler o arquivo SQL
$sqlContent = Get-Content $sqlFile -Raw

# Executar SQL
$output = ($sqlContent | mysql -h $dbHost -u $dbUser -p$dbPassword -P $dbPort $dbName) 2>&1
$exitCode = $LASTEXITCODE

if ($exitCode -eq 0) {
    Write-Host "✅ SQL executado com sucesso em produção!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Temporadas inseridas:" -ForegroundColor Cyan
    Write-Host "   ✓ Semana Santa 2026 (03/04 - 07/04) - R$ 468"
    Write-Host "   ✓ Tiradentes 2026 (17/04 - 21/04) - R$ 364"
    Write-Host "   ✓ Dia do Trabalhador 2026 (01/05 - 04/05) - R$ 351"
    Write-Host "   ✓ Corpus Christi 2026 (04/06 - 07/06) - R$ 351"
    Write-Host "   ✓ São João 2026 (23/06 - 26/06) - R$ 325"
    Write-Host "   ✓ Independência da Bahia 2026 (01/07 - 04/07) - R$ 377"
    Write-Host "   ✓ Julho 2026 (férias) (13/07 - 20/07) - R$ 351"
    Write-Host "   ✓ Agosto 2026 (Baixa) (10/08 - 17/08) - R$ 260"
    Write-Host ""
}
else {
    Write-Host "❌ Erro ao executar SQL (Código: $exitCode)" -ForegroundColor Red
    Write-Host "   Verifique as credenciais e conectividade com o banco" -ForegroundColor Red
    Write-Host ""
    if ($output) {
        Write-Host "Detalhes do erro:" -ForegroundColor DarkGray
        Write-Host $output -ForegroundColor DarkGray
    }
    exit 1
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✨ Operação concluída!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

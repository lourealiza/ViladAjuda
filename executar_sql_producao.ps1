# ========================================
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

# Validar arquivo SQL
if (-not (Test-Path $sqlFile)) {
    Write-Host "❌ Arquivo SQL não encontrado: $sqlFile" -ForegroundColor Red
    exit 1
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "🚀 Executar SQL em Produção" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📊 Dados de Conexão:" -ForegroundColor Yellow
Write-Host "   Host: $dbHost"
Write-Host "   Database: $dbName"
Write-Host "   User: $dbUser"
Write-Host ""

# Verificar se mysql está instalado
if (-not (Get-Command mysql -ErrorAction SilentlyContinue)) {
    Write-Host "❌ MySQL CLI não encontrado!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Opções para executar o SQL:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "1️⃣  Instalar MySQL CLI:" -ForegroundColor Green
    Write-Host "   # Via Chocolatey:"
    Write-Host "   choco install mysql-cli" -ForegroundColor DarkGray
    Write-Host ""
    Write-Host "2️⃣  Usar phpMyAdmin (Alternativa):" -ForegroundColor Green
    Write-Host "   https://www.phpmyadmin.net/" -ForegroundColor DarkGray
    Write-Host ""
    Write-Host "3️⃣  Usar HeidiSQL (Recomendado):" -ForegroundColor Green
    Write-Host "   https://www.heidisql.com/" -ForegroundColor DarkGray
    Write-Host "   - Conectar a: mysql.viladajuda.com.br" -ForegroundColor DarkGray
    Write-Host "   - Copiar e colar o conteúdo de: $sqlFile" -ForegroundColor DarkGray
    Write-Host ""
    Write-Host "4️⃣  Usar MySQL Workbench:" -ForegroundColor Green
    Write-Host "   https://dev.mysql.com/downloads/workbench/" -ForegroundColor DarkGray
    Write-Host ""
    exit 1
}

Write-Host "✅ MySQL CLI encontrado" -ForegroundColor Green
Write-Host ""

# Tentar executar o SQL
Write-Host "⏳ Executando SQL em produção..." -ForegroundColor Yellow
Write-Host ""

try {
    # Ler o arquivo SQL
    $sqlContent = Get-Content $sqlFile -Raw
    
    # Executar com mysql client
    $sqlContent | mysql `
        -h $dbHost `
        -u $dbUser `
        -p$dbPassword `
        -P $dbPort `
        $dbName `
        2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ SQL executado com sucesso em produção!" -ForegroundColor Green
        Write-Host ""
        Write-Host "📋 Resumo:" -ForegroundColor Cyan
        Write-Host "   ✓ 8 períodos inseridos (Semana Santa a Agosto 2026)"
        Write-Host "   ✓ Valores médios configurados"
        Write-Host "   ✓ Multiplicadores calculados"
        Write-Host ""
    }
    else {
        Write-Host ""
        Write-Host "❌ Erro ao executar SQL" -ForegroundColor Red
        Write-Host "   Verifique as credenciais e conectividade com o banco" -ForegroundColor Red
        exit 1
    }
}
catch {
    Write-Host ""
    Write-Host "❌ Erro: $_" -ForegroundColor Red
    exit 1
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✨ Operação concluída!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Script para iniciar o Backend Node.js

Write-Host "========================================" -ForegroundColor Green
Write-Host "Iniciando Backend - Vila d'Ajuda" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# Navegar para a pasta backend
$backendPath = "d:\OneDrive\Vila d'Ajuda\ViladAjuda\backend"
cd $backendPath

# Verificar se o arquivo package.json existe
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Erro: package.json não encontrado em $backendPath" -ForegroundColor Red
    exit
}

# Verificar se node_modules existe
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Instalando dependências..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Erro ao instalar dependências" -ForegroundColor Red
        exit
    }
}

Write-Host ""
Write-Host "✅ Iniciando servidor Node.js..." -ForegroundColor Green
Write-Host "🔗 Backend disponível em: http://localhost:3000" -ForegroundColor Cyan
Write-Host "📡 API disponível em: http://localhost:3000/api" -ForegroundColor Cyan
Write-Host ""
Write-Host "Pressione CTRL+C para parar o servidor" -ForegroundColor Yellow
Write-Host ""

# Iniciar o servidor
npm start

# Script para preparar arquivos para deploy no servidor
# Execute no Windows antes de enviar para o servidor

Write-Host "🚀 Preparando arquivos para deploy no servidor..." -ForegroundColor Green
Write-Host ""

$rootDir = $PSScriptRoot
$backendDir = Join-Path $rootDir "backend"
$frontendDir = Join-Path $rootDir "frontend-deploy"
$deployKinghostDir = Join-Path $rootDir "deploy_kinghost"

# Criar diretório de deploy do frontend
if (Test-Path $frontendDir) {
    Remove-Item $frontendDir -Recurse -Force
}
New-Item -ItemType Directory -Path $frontendDir | Out-Null

Write-Host "📁 Copiando arquivos do frontend..." -ForegroundColor Yellow

# Copiar arquivos principais
Copy-Item (Join-Path $rootDir "index.html") $frontendDir -Force
Copy-Item (Join-Path $rootDir "css") $frontendDir -Recurse -Force
Copy-Item (Join-Path $rootDir "images") $frontendDir -Recurse -Force

# Criar pasta js
$jsDir = Join-Path $frontendDir "js"
if (-not (Test-Path $jsDir)) {
    New-Item -ItemType Directory -Path $jsDir | Out-Null
}

# Copiar e atualizar api.js com URL de produção
Write-Host "🔧 Atualizando URL da API no frontend..." -ForegroundColor Yellow
$apiJs = Get-Content (Join-Path $rootDir "js\api.js") -Raw

# Trocar URL localhost pela URL do servidor
$apiJs = $apiJs -replace "const API_BASE_URL = 'http://localhost:3000/api';", "const API_BASE_URL = 'http://viladajuda.web213.uni5.net:3000/api';"

# Salvar arquivo atualizado
$apiJs | Set-Content (Join-Path $jsDir "api.js") -NoNewline

# Copiar script.js
Copy-Item (Join-Path $rootDir "js\script.js") (Join-Path $jsDir "script.js") -Force

Write-Host "✓ Frontend preparado em: $frontendDir" -ForegroundColor Green
Write-Host ""

# Preparar backend (excluir node_modules e arquivos desnecessários)
Write-Host "📦 Preparando backend..." -ForegroundColor Yellow

$backendDeployDir = Join-Path $rootDir "backend-deploy"
if (Test-Path $backendDeployDir) {
    Remove-Item $backendDeployDir -Recurse -Force
}
New-Item -ItemType Directory -Path $backendDeployDir | Out-Null

# Copiar arquivos do backend (exceto node_modules)
Get-ChildItem $backendDir -Exclude node_modules | Copy-Item -Destination $backendDeployDir -Recurse

# Criar .env de exemplo para produção
$envContent = @"
# Configurações do Servidor
PORT=3000
NODE_ENV=production

# Configurações do Banco de Dados
DB_TYPE=mysql
DB_HOST=mysql66-farm2.uni5.net
DB_USER=viladajuda
DB_PASSWORD=arraial2026
DB_NAME=viladajuda
DB_PORT=3306

# Configurações JWT
JWT_SECRET=viladajuda_production_secret_2026_muito_seguro_mude_isso
JWT_EXPIRE=7d

# CORS
FRONTEND_URL=http://viladajuda.web213.uni5.net
"@

$envContent | Set-Content (Join-Path $backendDeployDir ".env.example") -NoNewline

Write-Host "✓ Backend preparado em: $backendDeployDir" -ForegroundColor Green
Write-Host ""

Write-Host "✅ Preparação concluída!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Próximos passos:" -ForegroundColor Cyan
Write-Host "1. Envie a pasta 'frontend-deploy' para ~/public_html no servidor"
Write-Host "2. Envie a pasta 'backend-deploy' para ~/viladajuda/backend no servidor"
Write-Host "3. No servidor, execute:"
Write-Host "   cd ~/viladajuda/backend"
Write-Host "   npm install --production"
Write-Host "   cp .env.example .env"
Write-Host "   nano .env  # Revise as configurações"
Write-Host "   npm run init-mysql"
Write-Host "   pm2 start src/server.js --name viladajuda-api"
Write-Host ""
Write-Host "OU execute o script automático no servidor:"
Write-Host "   bash scripts-deploy.sh"
Write-Host ""


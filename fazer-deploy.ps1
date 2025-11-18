# Script de Deploy Automático - Vila d'Ajuda
# Execute este script para fazer deploy completo no servidor

param(
    [Parameter(Mandatory=$true)]
    [string]$Servidor,
    
    [Parameter(Mandatory=$true)]
    [string]$Usuario
)

Write-Host "Iniciando deploy da Vila d'Ajuda..." -ForegroundColor Green
Write-Host ""

# Verificar se as pastas existem
if (-not (Test-Path "backend-deploy")) {
    Write-Host "Pasta backend-deploy nao encontrada!" -ForegroundColor Red
    Write-Host "Execute primeiro: preparar-deploy-servidor.ps1" -ForegroundColor Yellow
    exit 1
}

if (-not (Test-Path "frontend-deploy")) {
    Write-Host "Pasta frontend-deploy nao encontrada!" -ForegroundColor Red
    Write-Host "Usando deploy_kinghost como alternativa..." -ForegroundColor Yellow
    if (Test-Path "deploy_kinghost") {
        Copy-Item "deploy_kinghost" "frontend-deploy" -Recurse -Force
    } else {
        Write-Host "Nenhuma pasta de frontend encontrada!" -ForegroundColor Red
        exit 1
    }
}

Write-Host "Preparando arquivos..." -ForegroundColor Cyan

# Criar arquivo .env no backend-deploy se não existir
$envPath = "backend-deploy\.env"
if (-not (Test-Path $envPath)) {
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
    $envContent | Set-Content $envPath -NoNewline
    Write-Host "Arquivo .env criado" -ForegroundColor Green
}

Write-Host ""
Write-Host "Enviando arquivos para o servidor..." -ForegroundColor Cyan
Write-Host "Servidor: $Usuario@$Servidor" -ForegroundColor Yellow
Write-Host ""

# Criar diretórios no servidor
Write-Host "Criando diretorios no servidor..." -ForegroundColor Cyan
ssh "$Usuario@$Servidor" "mkdir -p ~/viladajuda/backend && mkdir -p ~/public_html"

# Enviar backend
Write-Host "Enviando backend..." -ForegroundColor Cyan
scp -r backend-deploy\* "${Usuario}@${Servidor}:~/viladajuda/backend/"

# Enviar frontend
Write-Host "Enviando frontend..." -ForegroundColor Cyan
scp -r frontend-deploy\* "${Usuario}@${Servidor}:~/public_html/"

# Enviar script de deploy
Write-Host "Enviando script de deploy..." -ForegroundColor Cyan
scp scripts-deploy.sh "${Usuario}@${Servidor}:~/"

Write-Host ""
Write-Host "Arquivos enviados com sucesso!" -ForegroundColor Green
Write-Host ""
Write-Host "Executando configuracao no servidor..." -ForegroundColor Cyan
Write-Host ""

# Executar comandos no servidor
$deployCommands = @"
cd ~/viladajuda/backend
npm install --production
npm run test-mysql
npm run init-mysql
npm install -g pm2
pm2 stop viladajuda-api 2>/dev/null || true
pm2 delete viladajuda-api 2>/dev/null || true
pm2 start src/server.js --name viladajuda-api
pm2 save
pm2 startup
"@

ssh "$Usuario@$Servidor" $deployCommands

Write-Host ""
Write-Host "Deploy concluido!" -ForegroundColor Green
Write-Host ""
Write-Host "Verificar status:" -ForegroundColor Cyan
Write-Host "  ssh $Usuario@$Servidor 'pm2 status'" -ForegroundColor White
Write-Host ""
Write-Host "URLs:" -ForegroundColor Cyan
Write-Host "  Frontend: http://viladajuda.web213.uni5.net/" -ForegroundColor White
Write-Host "  Backend:  http://viladajuda.web213.uni5.net:3000/api" -ForegroundColor White
Write-Host ""


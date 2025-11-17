# Script para configurar MySQL no arquivo .env
$envFile = Join-Path $PSScriptRoot ".env"

# Verificar se .env existe, senão criar a partir do exemplo
if (-not (Test-Path $envFile)) {
    Copy-Item (Join-Path $PSScriptRoot "env-example.txt") $envFile
    Write-Host "Arquivo .env criado a partir do env-example.txt"
}

# Ler conteúdo atual
$content = Get-Content $envFile -Raw

# Configurações MySQL
$mysqlConfig = @"
# Configurações do Banco de Dados
# Escolha: 'sqlite' para desenvolvimento local ou 'mysql' para produção
DB_TYPE=mysql

# SQLite (desenvolvimento local)
# DB_PATH=./database.sqlite

# MySQL (produção)
DB_HOST=mysql66-farm2.uni5.net
DB_USER=viladajuda
DB_PASSWORD=arraial2026
DB_NAME=viladajuda
DB_PORT=3306
"@

# Substituir seção de banco de dados
$content = $content -replace '(?s)# Configurações do Banco de Dados.*?DB_PORT=\d+', $mysqlConfig

# Se não encontrou, adicionar após NODE_ENV
if ($content -notmatch 'DB_TYPE=') {
    $content = $content -replace '(NODE_ENV=development)', "`$1`n`n$mysqlConfig"
}

# Salvar arquivo
Set-Content -Path $envFile -Value $content -NoNewline

Write-Host "✅ Configuração MySQL adicionada ao arquivo .env"
Write-Host ""
Write-Host "Configurações:"
Write-Host "  Host: mysql66-farm2.uni5.net"
Write-Host "  Database: viladajuda"
Write-Host "  User: viladajuda"
Write-Host "  Port: 3306"
Write-Host ""
Write-Host "Próximo passo: Execute 'npm run migrate-mysql' para migrar os dados"


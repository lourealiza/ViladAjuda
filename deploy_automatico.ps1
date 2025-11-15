# Script PowerShell para preparar deploy na KingHost
# Este script cria uma versao do site pronta para upload

Write-Host "Preparando site para deploy na KingHost..." -ForegroundColor Cyan
Write-Host ""

# Criar pasta de deploy
$deployFolder = "deploy_kinghost"
if (Test-Path $deployFolder) {
    Write-Host "Removendo pasta de deploy anterior..." -ForegroundColor Yellow
    Remove-Item -Path $deployFolder -Recurse -Force
}

Write-Host "Criando pasta de deploy..." -ForegroundColor Green
New-Item -ItemType Directory -Path $deployFolder | Out-Null

# Copiar arquivos
Write-Host "Copiando arquivos..." -ForegroundColor Green
Copy-Item "index.html" -Destination $deployFolder
Copy-Item "css" -Destination $deployFolder -Recurse
Copy-Item "js" -Destination $deployFolder -Recurse
Copy-Item "images" -Destination $deployFolder -Recurse

# Atualizar URLs no index.html
Write-Host "Atualizando URLs para KingHost..." -ForegroundColor Green
$indexPath = Join-Path $deployFolder "index.html"
$content = Get-Content $indexPath -Raw -Encoding UTF8

# Substituir URLs
$oldUrl = "https://lourealiza.github.io/ViladAjuda/"
$newUrl = "http://viladajuda.web213.uni5.net/"
$content = $content -replace [regex]::Escape($oldUrl), $newUrl

# Salvar arquivo atualizado
$content | Set-Content $indexPath -Encoding UTF8 -NoNewline

# Criar arquivo .htaccess
Write-Host "Criando arquivo .htaccess..." -ForegroundColor Green
$htaccessContent = @"
# Pagina de erro 404
ErrorDocument 404 /index.html

# Habilitar compressao
AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript

# Cache de arquivos estaticos
ExpiresActive On
ExpiresByType image/jpg "access plus 1 year"
ExpiresByType image/jpeg "access plus 1 year"
ExpiresByType image/gif "access plus 1 year"
ExpiresByType image/png "access plus 1 year"
ExpiresByType image/webp "access plus 1 year"
ExpiresByType text/css "access plus 1 month"
ExpiresByType application/javascript "access plus 1 month"
"@

$htaccessPath = Join-Path $deployFolder ".htaccess"
$htaccessContent | Out-File -FilePath $htaccessPath -Encoding ASCII -NoNewline

# Resumo
Write-Host ""
Write-Host "PRONTO!" -ForegroundColor Green
Write-Host ""
Write-Host "Arquivos preparados na pasta: $deployFolder\" -ForegroundColor Cyan
Write-Host ""
Write-Host "Proximo passo:" -ForegroundColor Yellow
Write-Host "   1. Abra a pasta '$deployFolder'" -ForegroundColor White
Write-Host "   2. Selecione todos os arquivos dentro dela" -ForegroundColor White
Write-Host "   3. Faca upload para a pasta 'public_html' na KingHost" -ForegroundColor White
Write-Host ""
Write-Host "URL do seu site: http://viladajuda.web213.uni5.net/" -ForegroundColor Cyan
Write-Host ""

# Abrir pasta de deploy
Invoke-Item $deployFolder
Write-Host "Pasta de deploy foi aberta!" -ForegroundColor Green


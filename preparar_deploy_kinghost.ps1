# Script PowerShell para preparar deploy na KingHost
# Este script cria uma versão do site pronta para upload

Write-Host "🚀 Preparando site para deploy na KingHost..." -ForegroundColor Cyan
Write-Host ""

# Criar pasta de deploy
$deployFolder = "deploy_kinghost"
if (Test-Path $deployFolder) {
    Write-Host "⚠️  Removendo pasta de deploy anterior..." -ForegroundColor Yellow
    Remove-Item -Path $deployFolder -Recurse -Force
}

Write-Host "📁 Criando pasta de deploy..." -ForegroundColor Green
New-Item -ItemType Directory -Path $deployFolder | Out-Null

# Copiar arquivos
Write-Host "📋 Copiando arquivos..." -ForegroundColor Green
Copy-Item "index.html" -Destination $deployFolder
Copy-Item "css" -Destination $deployFolder -Recurse
Copy-Item "js" -Destination $deployFolder -Recurse
Copy-Item "images" -Destination $deployFolder -Recurse

# Atualizar URLs no index.html
Write-Host "🔧 Atualizando URLs para KingHost..." -ForegroundColor Green
$indexPath = Join-Path $deployFolder "index.html"
$content = Get-Content $indexPath -Raw -Encoding UTF8

# Substituir URLs
$oldUrl = "https://lourealiza.github.io/ViladAjuda/"
$newUrl = "http://viladajuda.web213.uni5.net/"
$content = $content -replace [regex]::Escape($oldUrl), $newUrl

# Salvar arquivo atualizado
$content | Set-Content $indexPath -Encoding UTF8 -NoNewline

# Criar arquivo .htaccess
Write-Host "⚙️  Criando arquivo .htaccess..." -ForegroundColor Green
$htaccess = @"
# Configurações de segurança e performance para KingHost

# Página de erro 404
ErrorDocument 404 /index.html

# Habilitar compressão
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript
</IfModule>

# Cache de arquivos estáticos
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/gif "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/webp "access plus 1 year"
    ExpiresByType text/css "access plus 1 month"
    ExpiresByType application/javascript "access plus 1 month"
</IfModule>

# Bloquear acesso a arquivos sensíveis
<FilesMatch "^\.">
    Order allow,deny
    Deny from all
</FilesMatch>

# Permitir CORS para fontes
<FilesMatch "\.(ttf|otf|eot|woff|woff2)$">
    <IfModule mod_headers.c>
        Header set Access-Control-Allow-Origin "*"
    </IfModule>
</FilesMatch>
"@

$htaccess | Set-Content (Join-Path $deployFolder ".htaccess") -Encoding UTF8

# Criar arquivo README para o deploy
Write-Host "📝 Criando instruções de deploy..." -ForegroundColor Green
$readmeDeploy = @"
# INSTRUÇÕES DE DEPLOY - KINGHOST

## Arquivos prontos para upload!

Esta pasta contém todos os arquivos prontos para fazer upload na KingHost.

### O que foi atualizado:
✅ URLs do GitHub Pages alteradas para http://viladajuda.web213.uni5.net/
✅ Arquivo .htaccess criado com configurações de performance
✅ Estrutura de pastas organizada

### Como fazer o upload:

1. Acesse: https://painel.kinghost.com.br
2. Vá em "Gerenciador de Arquivos" ou use FTP
3. Navegue até a pasta `public_html`
4. Faça upload de TODOS os arquivos desta pasta
5. Acesse: http://viladajuda.web213.uni5.net/

### Estrutura para upload:
public_html/
├── index.html
├── .htaccess
├── css/
│   └── style.css
├── js/
│   └── script.js
└── images/
    └── (todas as imagens)

### Checklist após upload:
- [ ] Site carrega corretamente
- [ ] Imagens aparecem
- [ ] Menu funciona
- [ ] Formulário funciona
- [ ] Teste no celular

Problemas? Consulte o arquivo DEPLOY_KINGHOST.md na pasta raiz do projeto.
"@

$readmeDeploy | Set-Content (Join-Path $deployFolder "LEIA-ME.txt") -Encoding UTF8

# Resumo
Write-Host ""
Write-Host "✅ PRONTO!" -ForegroundColor Green
Write-Host ""
Write-Host "📦 Arquivos preparados na pasta: $deployFolder\" -ForegroundColor Cyan
Write-Host ""
Write-Host "📤 Próximo passo:" -ForegroundColor Yellow
Write-Host "   1. Abra a pasta '$deployFolder'" -ForegroundColor White
Write-Host "   2. Selecione todos os arquivos dentro dela" -ForegroundColor White
Write-Host "   3. Faça upload para a pasta 'public_html' na KingHost" -ForegroundColor White
Write-Host ""
Write-Host "🌐 URL do seu site: http://viladajuda.web213.uni5.net/" -ForegroundColor Cyan
Write-Host ""
Write-Host "📖 Para instruções detalhadas, consulte: DEPLOY_KINGHOST.md" -ForegroundColor Gray
Write-Host ""

# Abrir pasta de deploy
$openFolder = Read-Host "Deseja abrir a pasta de deploy agora? (S/N)"
if ($openFolder -eq "S" -or $openFolder -eq "s") {
    Invoke-Item $deployFolder
}


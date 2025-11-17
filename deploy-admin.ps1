# Script PowerShell para Deploy do Painel Admin
# Execute: .\deploy-admin.ps1

$servidor = "viladajuda@www.viladajuda.com.br"

Write-Host "🚀 Fazendo deploy do painel admin..." -ForegroundColor Cyan
Write-Host "Servidor: $servidor" -ForegroundColor Gray
Write-Host ""

# Verificar se os arquivos existem
$arquivos = @(
    "admin.html",
    "css/admin.css",
    "js/admin.js",
    "js/api.js"
)

foreach ($arquivo in $arquivos) {
    if (-not (Test-Path $arquivo)) {
        Write-Host "❌ Arquivo não encontrado: $arquivo" -ForegroundColor Red
        exit 1
    }
}

Write-Host "✅ Todos os arquivos encontrados" -ForegroundColor Green
Write-Host ""

# Fazer upload via SCP
Write-Host "📤 Enviando arquivos..." -ForegroundColor Yellow

try {
    scp admin.html "${servidor}:~/public_html/"
    Write-Host "  ✓ admin.html enviado" -ForegroundColor Green
    
    scp css/admin.css "${servidor}:~/public_html/css/"
    Write-Host "  ✓ css/admin.css enviado" -ForegroundColor Green
    
    scp js/admin.js "${servidor}:~/public_html/js/"
    Write-Host "  ✓ js/admin.js enviado" -ForegroundColor Green
    
    scp js/api.js "${servidor}:~/public_html/js/"
    Write-Host "  ✓ js/api.js enviado" -ForegroundColor Green
    
    Write-Host ""
    Write-Host "✅ Deploy concluído com sucesso!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🌐 Acesse: https://www.viladajuda.com.br/admin" -ForegroundColor Cyan
    Write-Host "🔑 Email: admin@viladajuda.com" -ForegroundColor Yellow
    Write-Host "🔑 Senha: admin123" -ForegroundColor Yellow
    
} catch {
    Write-Host ""
    Write-Host "❌ Erro ao fazer deploy: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 Alternativa: Use os comandos em CRIAR_ADMIN_DIRETO_SERVIDOR.md" -ForegroundColor Yellow
    exit 1
}


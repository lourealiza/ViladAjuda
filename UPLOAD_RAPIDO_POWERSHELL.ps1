# ============================================
# Upload Rápido via PowerShell
# ============================================

Write-Host ""
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host "  UPLOAD RÁPIDO - VILA D'AJUDA" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar e instalar Posh-SSH
$poshSSHInstalled = Get-Module -ListAvailable -Name Posh-SSH
if (-not $poshSSHInstalled) {
    Write-Host "[*] Instalando Posh-SSH..." -ForegroundColor Yellow
    
    # Instalar NuGet provider se necessário
    $nugetProvider = Get-PackageProvider -Name NuGet -ErrorAction SilentlyContinue
    if (-not $nugetProvider) {
        Write-Host "   [*] Instalando NuGet provider..." -ForegroundColor Gray
        Install-PackageProvider -Name NuGet -MinimumVersion 2.8.5.201 -Force -Scope CurrentUser | Out-Null
    }
    
    # Instalar Posh-SSH
    try {
        Install-Module -Name Posh-SSH -Force -Scope CurrentUser -AllowClobber -SkipPublisherCheck -ErrorAction Stop
        Write-Host "[OK] Posh-SSH instalado!" -ForegroundColor Green
    } catch {
        Write-Host "[ERRO] Nao foi possivel instalar Posh-SSH automaticamente." -ForegroundColor Red
        Write-Host "       Execute manualmente: Install-Module -Name Posh-SSH -Scope CurrentUser" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "       OU use FileZilla para fazer upload manualmente." -ForegroundColor Yellow
        exit 1
    }
}

# Importar módulo (tentar múltiplas vezes se necessário)
try {
    Import-Module Posh-SSH -Force -ErrorAction Stop
    Write-Host "[OK] Posh-SSH carregado!" -ForegroundColor Green
} catch {
    Write-Host "[AVISO] Tentando carregar Posh-SSH novamente..." -ForegroundColor Yellow
    Start-Sleep -Seconds 2
    Import-Module Posh-SSH -Force -ErrorAction Stop
}

# Verificar se módulo foi carregado
if (-not (Get-Command Set-SFTPFile -ErrorAction SilentlyContinue)) {
    Write-Host "[ERRO] Posh-SSH nao foi carregado corretamente!" -ForegroundColor Red
    Write-Host "       Tente executar manualmente:" -ForegroundColor Yellow
    Write-Host "       Import-Module Posh-SSH" -ForegroundColor White
    Write-Host ""
    Write-Host "       OU use FileZilla para fazer upload manualmente." -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "[*] Conectando ao servidor..." -ForegroundColor Cyan

# Credenciais
$Servidor = "www.viladajuda.com.br"
$Usuario = "viladajuda"
$Senha = "arraial2026"
$Porta = 22

# Criar credenciais
$securePassword = ConvertTo-SecureString $Senha -AsPlainText -Force
$credential = New-Object System.Management.Automation.PSCredential($Usuario, $securePassword)

# Conectar
try {
    $session = New-SFTPSession -ComputerName $Servidor -Credential $credential -Port $Porta -AcceptKey
    
    if (-not $session) {
        Write-Host "[ERRO] Erro ao conectar!" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "[OK] Conectado ao servidor!" -ForegroundColor Green
    Write-Host ""
    
    # ============================================
    # BACKEND
    # ============================================
    
    Write-Host "[*] Enviando BACKEND..." -ForegroundColor Cyan
    
    $srcLocal = "D:\007-Vila-DAjuda\backend\src"
    $srcRemote = "/home/viladajuda/viladajuda/backend/src"
    
    if (Test-Path $srcLocal) {
        # Criar diretório remoto
        try {
            New-SFTPItem -SessionId $session.SessionId -Path $srcRemote -ItemType Directory -Force | Out-Null
        } catch { }
        
        # Contar arquivos
        $arquivos = Get-ChildItem -Path $srcLocal -Recurse -File
        $total = $arquivos.Count
        $contador = 0
        
        $totalStr = $total.ToString() + " arquivos"
        Write-Host "   Enviando $totalStr..." -ForegroundColor Gray
        
        foreach ($arquivo in $arquivos) {
            $contador++
            $relativePath = $arquivo.FullName.Substring($srcLocal.Length + 1)
            $remotePath = "$srcRemote/$relativePath".Replace('\', '/')
            $remoteDir = Split-Path $remotePath -Parent
            
            # Criar diretório remoto se necessário
            try {
                New-SFTPItem -SessionId $session.SessionId -Path $remoteDir -ItemType Directory -Force | Out-Null
            } catch { }
            
            # Enviar arquivo
            Set-SFTPFile -SessionId $session.SessionId -LocalFile $arquivo.FullName -RemotePath $remotePath -Overwrite | Out-Null
            
            if ($contador % 10 -eq 0) {
                $progressStr = "[$contador/$total]"
                Write-Host "   $progressStr..." -ForegroundColor Gray
            }
        }
        
        $msgBackend = "   [OK] Backend enviado! (" + $total + " arquivos)"
        Write-Host $msgBackend -ForegroundColor Green
    } else {
        Write-Host "   [AVISO] Pasta src/ nao encontrada!" -ForegroundColor Yellow
    }
    
    # Enviar package.json
    $packageJson = "D:\007-Vila-DAjuda\backend\package.json"
    if (Test-Path $packageJson) {
        Set-SFTPFile -SessionId $session.SessionId -LocalFile $packageJson -RemotePath "/home/viladajuda/viladajuda/backend/package.json" -Overwrite | Out-Null
        Write-Host "   [OK] package.json enviado!" -ForegroundColor Green
    }
    
    Write-Host ""
    
    # ============================================
    # FRONTEND
    # ============================================
    
    Write-Host "[*] Enviando FRONTEND..." -ForegroundColor Cyan
    
    # index.html
    $indexHtml = "D:\007-Vila-DAjuda\index.html"
    if (Test-Path $indexHtml) {
        Set-SFTPFile -SessionId $session.SessionId -LocalFile $indexHtml -RemotePath "/www/index.html" -Overwrite | Out-Null
        Write-Host "   [OK] index.html" -ForegroundColor Gray
    }
    
    # js/api.js
    $apiJs = "D:\007-Vila-DAjuda\js\api.js"
    if (Test-Path $apiJs) {
        try {
            New-SFTPItem -SessionId $session.SessionId -Path "/www/js" -ItemType Directory -Force | Out-Null
        } catch { }
        Set-SFTPFile -SessionId $session.SessionId -LocalFile $apiJs -RemotePath "/www/js/api.js" -Overwrite | Out-Null
        Write-Host "   [OK] js/api.js" -ForegroundColor Gray
    }
    
    # js/script.js
    $scriptJs = "D:\007-Vila-DAjuda\js\script.js"
    if (Test-Path $scriptJs) {
        Set-SFTPFile -SessionId $session.SessionId -LocalFile $scriptJs -RemotePath "/www/js/script.js" -Overwrite | Out-Null
        Write-Host "   [OK] js/script.js" -ForegroundColor Gray
    }
    
    # css/style.css
    $styleCss = "D:\007-Vila-DAjuda\css\style.css"
    if (Test-Path $styleCss) {
        try {
            New-SFTPItem -SessionId $session.SessionId -Path "/www/css" -ItemType Directory -Force | Out-Null
        } catch { }
        Set-SFTPFile -SessionId $session.SessionId -LocalFile $styleCss -RemotePath "/www/css/style.css" -Overwrite | Out-Null
        Write-Host "   [OK] css/style.css" -ForegroundColor Gray
    }
    
    Write-Host "   [OK] Frontend enviado!" -ForegroundColor Green
    
    # Fechar sessão
    Remove-SFTPSession -SessionId $session.SessionId
    
    Write-Host ""
    Write-Host "===========================================" -ForegroundColor Cyan
    Write-Host "[OK] UPLOAD CONCLUIDO COM SUCESSO!" -ForegroundColor Green
    Write-Host "===========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "[*] Proximos passos no servidor SSH:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "   cd ~/viladajuda/backend" -ForegroundColor White
    Write-Host "   npm install" -ForegroundColor White
    Write-Host "   pm2 restart viladajuda-api" -ForegroundColor White
    Write-Host ""
    
} catch {
    Write-Host ""
    Write-Host "[ERRO] ERRO:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Yellow
    Write-Host ""
    exit 1
}


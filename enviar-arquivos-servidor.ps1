# ============================================
# Script PowerShell - Enviar Arquivos para Servidor
# ============================================
# 
# Este script envia os arquivos atualizados para o servidor
# via SFTP/SCP usando credenciais do KingHost
#
# ============================================

param(
    [string]$Servidor = "www.viladajuda.com.br",
    [string]$Usuario = "viladajuda",
    [string]$Senha = "arraial2026",
    [string]$Porta = "22"
)

Write-Host ""
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host "  ENVIAR ARQUIVOS PARA SERVIDOR" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar se Posh-SSH está instalado
$poshSSHInstalled = Get-Module -ListAvailable -Name Posh-SSH
if (-not $poshSSHInstalled) {
    Write-Host "⚠️  Módulo Posh-SSH não encontrado!" -ForegroundColor Yellow
    Write-Host "📦 Instalando Posh-SSH..." -ForegroundColor Cyan
    Install-Module -Name Posh-SSH -Force -Scope CurrentUser
    Import-Module Posh-SSH
} else {
    Import-Module Posh-SSH
}

# Verificar se WinSCP está disponível (alternativa)
$winscpPath = "C:\Program Files (x86)\WinSCP\WinSCP.com"
$useWinSCP = Test-Path $winscpPath

if (-not $useWinSCP) {
    Write-Host "📝 Usando Posh-SSH (PowerShell)" -ForegroundColor Green
} else {
    Write-Host "📝 Usando WinSCP (mais rápido)" -ForegroundColor Green
}

Write-Host ""
Write-Host "🔌 Conectando ao servidor..." -ForegroundColor Cyan
Write-Host "   Servidor: $Servidor" -ForegroundColor White
Write-Host "   Usuário: $Usuario" -ForegroundColor White
Write-Host ""

# Caminhos locais
$localBackend = Join-Path $PSScriptRoot "backend"
$localFrontend = Join-Path $PSScriptRoot "."

# Caminhos no servidor
$remoteBackend = "/home/viladajuda/viladajuda/backend"
$remoteFrontend = "/www"

# Verificar se diretórios locais existem
if (-not (Test-Path $localBackend)) {
    Write-Host "❌ Erro: Diretório backend não encontrado!" -ForegroundColor Red
    Write-Host "   Caminho: $localBackend" -ForegroundColor Yellow
    exit 1
}

if (-not (Test-Path (Join-Path $localFrontend "index.html"))) {
    Write-Host "⚠️  Aviso: index.html não encontrado no diretório raiz" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "📁 Estrutura de arquivos:" -ForegroundColor Cyan
Write-Host "   Backend Local:  $localBackend" -ForegroundColor White
Write-Host "   Backend Remoto: $remoteBackend" -ForegroundColor White
Write-Host "   Frontend Local: $localFrontend" -ForegroundColor White
Write-Host "   Frontend Remoto: $remoteFrontend" -ForegroundColor White
Write-Host ""

# ============================================
# MÉTODO 1: Usando Posh-SSH (SCP)
# ============================================

function EnviarComPoshSSH {
    Write-Host "📤 Enviando arquivos com Posh-SSH..." -ForegroundColor Cyan
    
    try {
        # Criar credenciais
        $securePassword = ConvertTo-SecureString $Senha -AsPlainText -Force
        $credential = New-Object System.Management.Automation.PSCredential($Usuario, $securePassword)
        
        # Conectar
        $session = New-SFTPSession -ComputerName $Servidor -Credential $credential -Port $Porta -AcceptKey
        
        if (-not $session) {
            Write-Host "❌ Erro ao conectar ao servidor!" -ForegroundColor Red
            return $false
        }
        
        Write-Host "✅ Conectado!" -ForegroundColor Green
        Write-Host ""
        
        # ============================================
        # BACKEND - Enviar pasta src/
        # ============================================
        
        Write-Host "📦 Enviando backend (src/)..." -ForegroundColor Cyan
        
        $srcLocal = Join-Path $localBackend "src"
        $srcRemote = "$remoteBackend/src"
        
        if (Test-Path $srcLocal) {
            # Criar diretório remoto se não existir
            try {
                New-SFTPItem -SessionId $session.SessionId -Path $srcRemote -ItemType Directory -Force | Out-Null
            } catch {
                # Diretório já existe, continuar
            }
            
            # Enviar arquivos recursivamente
            $arquivos = Get-ChildItem -Path $srcLocal -Recurse -File
            
            foreach ($arquivo in $arquivos) {
                $relativePath = $arquivo.FullName.Substring($srcLocal.Length + 1)
                $remotePath = "$srcRemote/$relativePath".Replace('\', '/')
                $remoteDir = Split-Path $remotePath -Parent
                
                # Criar diretório remoto se necessário
                try {
                    New-SFTPItem -SessionId $session.SessionId -Path $remoteDir -ItemType Directory -Force | Out-Null
                } catch {
                    # Diretório já existe
                }
                
                # Enviar arquivo
                Set-SFTPFile -SessionId $session.SessionId -LocalFile $arquivo.FullName -RemotePath $remotePath -Overwrite
                Write-Host "   ✓ $relativePath" -ForegroundColor Gray
            }
            
            Write-Host "   ✅ Backend enviado!" -ForegroundColor Green
        } else {
            Write-Host "   ⚠️  Pasta src/ não encontrada!" -ForegroundColor Yellow
        }
        
        # Enviar package.json
        $packageJson = Join-Path $localBackend "package.json"
        if (Test-Path $packageJson) {
            Write-Host "📦 Enviando package.json..." -ForegroundColor Cyan
            Set-SFTPFile -SessionId $session.SessionId -LocalFile $packageJson -RemotePath "$remoteBackend/package.json" -Overwrite
            Write-Host "   ✅ package.json enviado!" -ForegroundColor Green
        }
        
        # ============================================
        # FRONTEND - Enviar arquivos atualizados
        # ============================================
        
        Write-Host ""
        Write-Host "🌐 Enviando frontend..." -ForegroundColor Cyan
        
        # index.html
        $indexHtml = Join-Path $localFrontend "index.html"
        if (Test-Path $indexHtml) {
            Set-SFTPFile -SessionId $session.SessionId -LocalFile $indexHtml -RemotePath "$remoteFrontend/index.html" -Overwrite
            Write-Host "   ✓ index.html" -ForegroundColor Gray
        }
        
        # js/api.js
        $apiJs = Join-Path $localFrontend "js\api.js"
        if (Test-Path $apiJs) {
            try {
                New-SFTPItem -SessionId $session.SessionId -Path "$remoteFrontend/js" -ItemType Directory -Force | Out-Null
            } catch { }
            Set-SFTPFile -SessionId $session.SessionId -LocalFile $apiJs -RemotePath "$remoteFrontend/js/api.js" -Overwrite
            Write-Host "   ✓ js/api.js" -ForegroundColor Gray
        }
        
        # js/script.js
        $scriptJs = Join-Path $localFrontend "js\script.js"
        if (Test-Path $scriptJs) {
            Set-SFTPFile -SessionId $session.SessionId -LocalFile $scriptJs -RemotePath "$remoteFrontend/js/script.js" -Overwrite
            Write-Host "   ✓ js/script.js" -ForegroundColor Gray
        }
        
        # css/style.css
        $styleCss = Join-Path $localFrontend "css\style.css"
        if (Test-Path $styleCss) {
            try {
                New-SFTPItem -SessionId $session.SessionId -Path "$remoteFrontend/css" -ItemType Directory -Force | Out-Null
            } catch { }
            Set-SFTPFile -SessionId $session.SessionId -LocalFile $styleCss -RemotePath "$remoteFrontend/css/style.css" -Overwrite
            Write-Host "   ✓ css/style.css" -ForegroundColor Gray
        }
        
        Write-Host "   ✅ Frontend enviado!" -ForegroundColor Green
        
        # Fechar sessão
        Remove-SFTPSession -SessionId $session.SessionId
        
        Write-Host ""
        Write-Host "✅ Todos os arquivos foram enviados com sucesso!" -ForegroundColor Green
        
        return $true
        
    } catch {
        Write-Host ""
        Write-Host "❌ Erro ao enviar arquivos:" -ForegroundColor Red
        Write-Host $_.Exception.Message -ForegroundColor Yellow
        return $false
    }
}

# ============================================
# MÉTODO 2: Usando WinSCP (mais rápido)
# ============================================

function EnviarComWinSCP {
    Write-Host "📤 Enviando arquivos com WinSCP..." -ForegroundColor Cyan
    
    $scriptWinSCP = @"
option batch abort
option confirm off
open sftp://$Usuario`:$Senha@$Servidor`:$Porta
cd $remoteBackend
lcd "$localBackend\src"
synchronize remote .
cd $remoteBackend
put "$localBackend\package.json" package.json
cd $remoteFrontend
lcd "$localFrontend"
put index.html index.html
put js\api.js js\api.js
put js\script.js js\script.js
put css\style.css css\style.css
exit
"@
    
    $scriptFile = Join-Path $env:TEMP "winscp-upload.txt"
    $scriptWinSCP | Out-File -FilePath $scriptFile -Encoding ASCII
    
    try {
        & $winscpPath /script=$scriptFile
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host ""
            Write-Host "✅ Todos os arquivos foram enviados com sucesso!" -ForegroundColor Green
            Remove-Item $scriptFile
            return $true
        } else {
            Write-Host ""
            Write-Host "❌ Erro ao enviar arquivos!" -ForegroundColor Red
            Remove-Item $scriptFile
            return $false
        }
    } catch {
        Write-Host ""
        Write-Host "❌ Erro ao executar WinSCP:" -ForegroundColor Red
        Write-Host $_.Exception.Message -ForegroundColor Yellow
        Remove-Item $scriptFile -ErrorAction SilentlyContinue
        return $false
    }
}

# ============================================
# EXECUTAR
# ============================================

$sucesso = $false

if ($useWinSCP) {
    Write-Host "🚀 Usando WinSCP (método mais rápido)..." -ForegroundColor Green
    $sucesso = EnviarComWinSCP
} else {
    Write-Host "🚀 Usando Posh-SSH..." -ForegroundColor Green
    $sucesso = EnviarComPoshSSH
}

Write-Host ""
Write-Host "===========================================" -ForegroundColor Cyan

if ($sucesso) {
    Write-Host ""
    Write-Host "✅ Upload concluído!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Próximos passos no servidor SSH:" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "   cd ~/viladajuda/backend" -ForegroundColor White
    Write-Host "   npm install" -ForegroundColor White
    Write-Host "   pm2 restart viladajuda-api" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "❌ Upload falhou!" -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 Alternativas:" -ForegroundColor Yellow
    Write-Host "   1. Use FileZilla manualmente" -ForegroundColor White
    Write-Host "   2. Instale WinSCP: https://winscp.net/" -ForegroundColor White
    Write-Host "   3. Verifique as credenciais e conexão" -ForegroundColor White
    Write-Host ""
    exit 1
}


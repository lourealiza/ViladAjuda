# ============================================
# Instalar Posh-SSH (Execute Primeiro)
# ============================================

Write-Host ""
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host "  INSTALAR POSH-SSH" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar se já está instalado
$poshSSHInstalled = Get-Module -ListAvailable -Name Posh-SSH
if ($poshSSHInstalled) {
    Write-Host "[OK] Posh-SSH ja esta instalado!" -ForegroundColor Green
    Write-Host "     Versao: $($poshSSHInstalled.Version)" -ForegroundColor Gray
    exit 0
}

Write-Host "[*] Instalando NuGet provider..." -ForegroundColor Yellow

# Instalar NuGet provider
$nugetProvider = Get-PackageProvider -Name NuGet -ErrorAction SilentlyContinue
if (-not $nugetProvider) {
    try {
        Install-PackageProvider -Name NuGet -MinimumVersion 2.8.5.201 -Force -Scope CurrentUser | Out-Null
        Write-Host "[OK] NuGet provider instalado!" -ForegroundColor Green
    } catch {
        Write-Host "[ERRO] Nao foi possivel instalar NuGet provider." -ForegroundColor Red
        Write-Host "       Tente executar como Administrador." -ForegroundColor Yellow
        exit 1
    }
} else {
    Write-Host "[OK] NuGet provider ja instalado!" -ForegroundColor Green
}

Write-Host ""
Write-Host "[*] Instalando Posh-SSH..." -ForegroundColor Yellow

# Instalar Posh-SSH
try {
    Install-Module -Name Posh-SSH -Force -Scope CurrentUser -AllowClobber -SkipPublisherCheck -ErrorAction Stop
    Write-Host "[OK] Posh-SSH instalado com sucesso!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Agora voce pode executar: .\UPLOAD_RAPIDO_POWERSHELL.ps1" -ForegroundColor Cyan
} catch {
    Write-Host "[ERRO] Nao foi possivel instalar Posh-SSH." -ForegroundColor Red
    Write-Host ""
    Write-Host "Erro: $($_.Exception.Message)" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Alternativas:" -ForegroundColor Yellow
    Write-Host "1. Execute como Administrador" -ForegroundColor White
    Write-Host "2. Use FileZilla para fazer upload manualmente" -ForegroundColor White
    Write-Host "3. Use WinSCP (mais facil)" -ForegroundColor White
    exit 1
}


# Script para fazer upload do database.php via FTP para KingHost
# Credenciais KingHost
$ftpHost = "viladajuda.com.br"
$ftpUser = "viladajuda"
$ftpPass = "2026dAjudaVila"
$ftpUri = "ftp://$ftpHost/home/viladajuda/www/api/config/"

# Arquivo local
$localFile = ".\api\config\database.php"

Write-Host "🔄 Conectando ao FTP KingHost..."
Write-Host "Host: $ftpHost"
Write-Host "Usuário: $ftpUser"
Write-Host "Destino: /home/viladajuda/www/api/config/database.php"
Write-Host ""

# Criar requisição FTP
$ftpRequest = [System.Net.FtpWebRequest]::Create($ftpUri + "database.php")
$ftpRequest.Method = [System.Net.WebRequestMethods+Ftp]::UploadFile
$ftpRequest.Credentials = New-Object System.Net.NetworkCredential($ftpUser, $ftpPass)
$ftpRequest.UseBinary = $true
$ftpRequest.UsePassive = $true
$ftpRequest.KeepAlive = $false

try {
    # Ler arquivo local
    $fileContent = [System.IO.File]::ReadAllBytes($localFile)
    $ftpRequest.ContentLength = $fileContent.Length
    
    # Enviar arquivo
    $requestStream = $ftpRequest.GetRequestStream()
    $requestStream.Write($fileContent, 0, $fileContent.Length)
    $requestStream.Close()
    
    # Obter resposta
    $response = $ftpRequest.GetResponse()
    Write-Host "✅ Arquivo enviado com sucesso!"
    Write-Host "Status: $($response.StatusDescription)"
    $response.Close()
}
catch {
    Write-Host "❌ Erro ao enviar arquivo:"
    Write-Host $_.Exception.Message
    exit 1
}

Write-Host ""
Write-Host "✅ database.php está agora no KingHost!"
Write-Host "Próximo: testar a conexão em https://www.viladajuda.com.br/api/teste-debug.php"

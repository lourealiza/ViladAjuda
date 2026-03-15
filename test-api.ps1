$url = 'https://www.viladajuda.com.br/api/teste-debug.php'
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
[System.Net.ServicePointManager]::ServerCertificateValidationCallback = {$true}
$response = Invoke-WebRequest -Uri $url -UseBasicParsing
Write-Host "Status HTTP: $($response.StatusCode)"
Write-Host "Response:"
Write-Host $response.Content

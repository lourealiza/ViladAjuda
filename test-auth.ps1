$ApiUrl = 'https://backend-dfqv0zc7s-lourealizas-projects.vercel.app/api/auth/login'
$Body = @{email='admin@viladajuda.com'; senha='admin123'} | ConvertTo-Json
$Headers = @{'Content-Type'='application/json'}

try {
  $response = Invoke-WebRequest -Uri $ApiUrl -Method POST -Body $Body -Headers $Headers -UseBasicParsing
  Write-Host 'Status:' $response.StatusCode
  Write-Host $response.Content
} catch {
  Write-Host 'Erro:' $_.Exception.Message
  Write-Host 'Status:' $_.Exception.Response.StatusCode
}

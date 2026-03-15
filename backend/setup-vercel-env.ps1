$vercelToken = 'prj_0SS4noiPmZxh3iLVH9qG7qQAXUGt'
$projectId = 'viladajuda'

# Variáveis de ambiente
$envVars = @(
    @{ key = 'NODE_ENV'; value = 'production' },
    @{ key = 'DB_TYPE'; value = 'mysql' },
    @{ key = 'DB_HOST'; value = 'db4free.net' },
    @{ key = 'DB_USER'; value = 'viladajuda' },
    @{ key = 'DB_PASSWORD'; value = 'ViladAjuda2026!' },
    @{ key = 'DB_NAME'; value = 'viladajuda_db' },
    @{ key = 'DB_PORT'; value = '3306' },
    @{ key = 'JWT_SECRET'; value = 'vila-d-ajuda-secret-key-2026-prod' },
    @{ key = 'FRONTEND_URL'; value = 'https://www.viladajuda.com.br' }
)

Write-Host "... Adicionando variaveis de ambiente ao Vercel..." -ForegroundColor Cyan

# Iterar sobre cada variável e adicionar
for ($i = 0; $i -lt $envVars.Count; $i++) {
    $var = $envVars[$i]
    $headers = @{
        'Authorization' = "Bearer $vercelToken"
        'Content-Type' = 'application/json'
    }
    
    $body = @{
        key = $var.key
        value = $var.value
        target = @('production', 'preview', 'development')
    } | ConvertTo-Json -Depth 10
    
    $url = "https://api.vercel.com/v10/projects/$projectId/env"
    
    $response = Invoke-WebRequest -Uri $url -Method POST -Headers $headers -Body $body -ErrorAction SilentlyContinue
    
    if ($response.StatusCode -eq 201 -or $response.StatusCode -eq 200) {
        Write-Host "  OK $($var.key) adicionado" -ForegroundColor Green
    } else {
        Write-Host "  Erro ao adicionar $($var.key)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Configuracao concluida!" -ForegroundColor Green
Write-Host "Acesse https://vercel.com/lourealizas-projects/viladajuda/settings/environment-variables para confirmar" -ForegroundColor Yellow

$vercelVars = @{
    'NODE_ENV' = 'production'
    'DB_TYPE' = 'mysql'
    'DB_HOST' = 'db4free.net'
    'DB_USER' = 'viladajuda'
    'DB_PASSWORD' = 'ViladAjuda2026!'
    'DB_NAME' = 'viladajuda_db'
    'DB_PORT' = '3306'
    'JWT_SECRET' = 'vila-d-ajuda-secret-key-2026-prod'
    'FRONTEND_URL' = 'https://www.viladajuda.com.br'
}

Write-Host "Adicionando 9 variaveis de ambiente ao Vercel..." -ForegroundColor Cyan
Write-Host ""

foreach ($key in $vercelVars.Keys) {
    $value = $vercelVars[$key]
    Write-Host "  Adicionando: $key" -ForegroundColor Yellow
    
    # Use proper vercel env add syntax
    $value | vercel env add $key production | out-null
}

Write-Host ""
Write-Host "Concluido!" -ForegroundColor Green
Write-Host "Redeploy automatico em andamento no Vercel..." -ForegroundColor Cyan

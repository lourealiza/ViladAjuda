$sqlFile = ".\backend\src\scripts\inserir_temporadas_2026.sql"
$sqlContent = Get-Content $sqlFile -Raw
$output = ($sqlContent | mysql -h mysql.viladajuda.com.br -u viladajuda -p2026dAjudaVila -P 3306 viladajuda) 2>&1
Write-Host $output

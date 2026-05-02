@echo off
REM Executar SQL de Temporadas 2026 em Produção
setlocal enabledelayedexpansion

set DB_HOST=mysql.viladajuda.com.br
set DB_USER=viladajuda
set DB_PASS=2026dAjudaVila
set DB_NAME=viladajuda
set SQL_FILE=backend\src\scripts\inserir_temporadas_2026.sql

echo.
echo ========================================
echo 🚀 Executar SQL em Producao
echo ========================================
echo.
echo Host: %DB_HOST%
echo Database: %DB_NAME%
echo.

if not exist "%SQL_FILE%" (
    echo ❌ Arquivo SQL nao encontrado: %SQL_FILE%
    exit /b 1
)

echo ⏳ Executando SQL em producao...
echo.

mysql -h %DB_HOST% -u %DB_USER% -p%DB_PASS% -P 3306 %DB_NAME% < %SQL_FILE%

if %ERRORLEVEL% equ 0 (
    echo.
    echo ✅ SQL executado com sucesso em producao!
    echo.
    echo 📋 Temporadas inseridas:
    echo    ✓ Semana Santa 2026 (03/04 - 07/04) - R$ 468
    echo    ✓ Tiradentes 2026 (17/04 - 21/04) - R$ 364
    echo    ✓ Dia do Trabalhador 2026 (01/05 - 04/05) - R$ 351
    echo    ✓ Corpus Christi 2026 (04/06 - 07/06) - R$ 351
    echo    ✓ Sao Joao 2026 (23/06 - 26/06) - R$ 325
    echo    ✓ Independencia da Bahia 2026 (01/07 - 04/07) - R$ 377
    echo    ✓ Julho 2026 (ferias) (13/07 - 20/07) - R$ 351
    echo    ✓ Agosto 2026 (Baixa) (10/08 - 17/08) - R$ 260
    echo.
) else (
    echo ❌ Erro ao executar SQL
    exit /b 1
)

echo ========================================
echo ✨ Operacao concluida!
echo ========================================
pause

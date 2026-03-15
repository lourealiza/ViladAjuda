<?php
// Forçar carregamento sem cache
header('Cache-Control: no-cache, no-store, must-revalidate');
header('Pragma: no-cache');
header('Expires: 0');
header('Content-Type: application/json; charset=utf-8');

// Limpar cache
if (function_exists('opcache_reset')) {
    opcache_reset();
}

// Ler arquivo database.php diretamente
$dbConfigPath = __DIR__ . '/config/database.php';
$configContent = file_get_contents($dbConfigPath);

// Verificar o conteúdo
preg_match("/define\('DB_HOST',\s*'([^']+)'/", $configContent, $hostMatch);
preg_match("/define\('DB_USER',\s*'([^']+)'/", $configContent, $userMatch);

// Incluir e conectar
require_once $dbConfigPath;

$response = [
    'status' => 'ok',
    'arquivo' => $dbConfigPath,
    'tamanho' => filesize($dbConfigPath),
    'config_host' => $hostMatch[1] ?? 'not found',
    'config_user' => $userMatch[1] ?? 'not found',
    'php_version' => phpversion(),
    'timestamp' => date('Y-m-d H:i:s'),
];

if (isset($db)) {
    if (!$db->connect_error) {
        $response['conexao'] = 'OK! Conectado ao ' . DB_HOST;
        $response['db_host'] = DB_HOST;
        $response['db_name'] = DB_NAME;
        
        // Testar query
        $result = $db->query("SELECT 1");
        if ($result) {
            $response['teste_query'] = 'OK';
        }
    } else {
        $response['conexao'] = 'ERRO';
        $response['erro'] = $db->connect_error;
        $response['codigo'] = $db->connect_errno;
    }
} else {
    $response['conexao'] = 'Variável $db não definida';
}

echo json_encode($response, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);

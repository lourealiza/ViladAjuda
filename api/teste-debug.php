<?php
/**
 * Arquivo de debug para testar API
 * Acesse: https://www.viladajuda.com.br/api/teste-debug.php
 */

error_reporting(E_ALL);
ini_set('display_errors', 1);

header('Content-Type: application/json; charset=utf-8');

$info = [
    'php_version' => phpversion(),
    'extensions' => [],
    'database' => [],
    'files_exist' => [],
    'api_path' => __DIR__,
    'server_info' => [
        'SERVER_ADDR' => $_SERVER['SERVER_ADDR'] ?? 'N/A',
        'DOCUMENT_ROOT' => $_SERVER['DOCUMENT_ROOT'] ?? 'N/A',
        'REQUEST_URI' => $_SERVER['REQUEST_URI'] ?? 'N/A'
    ]
];

// Verificar extensões necessárias
$info['extensions']['mysqli'] = extension_loaded('mysqli') ? '✅' : '❌';
$info['extensions']['pdo'] = extension_loaded('pdo') ? '✅' : '❌';
$info['extensions']['json'] = extension_loaded('json') ? '✅' : '❌';

// Verificar arquivos
$arquivos = [
    'index.php' => __DIR__ . '/index.php',
    'config/database.php' => __DIR__ . '/config/database.php',
    'controllers/ReservaController.php' => __DIR__ . '/controllers/ReservaController.php',
    'controllers/ChaleController.php' => __DIR__ . '/controllers/ChaleController.php',
    'controllers/DisponibilidadeController.php' => __DIR__ . '/controllers/DisponibilidadeController.php',
    'controllers/AvaliacaoController.php' => __DIR__ . '/controllers/AvaliacaoController.php',
];

foreach ($arquivos as $nome => $caminho) {
    $info['files_exist'][$nome] = file_exists($caminho) ? '✅ EXISTS' : '❌ MISSING';
}

// Tentar conectar ao banco
if (file_exists(__DIR__ . '/config/database.php')) {
    try {
        require_once __DIR__ . '/config/database.php';
        
        if (isset($db) && $db->ping()) {
            $info['database']['status'] = '✅ Connected';
            $info['database']['host'] = DB_HOST;
            $info['database']['database'] = DB_NAME;
            
            // Testar query simples
            $result = $db->query('SELECT COUNT(*) as count FROM chales LIMIT 1');
            if ($result) {
                $row = $result->fetch_assoc();
                $info['database']['chales_count'] = $row['count'];
            }
        } else {
            $info['database']['status'] = '❌ Connection Failed';
            $info['database']['error'] = $db->connect_error ?? 'Unknown error';
        }
    } catch (Exception $e) {
        $info['database']['status'] = '❌ Error';
        $info['database']['error'] = $e->getMessage();
    }
}

echo json_encode($info, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
?>

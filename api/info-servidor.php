<?php
header('Content-Type: application/json; charset=utf-8');

$info = [
    'php_version' => phpversion(),
    'servidor' => $_SERVER['SERVER_NAME'] ?? 'unknown',
    'script' => __FILE__,
    'user' => get_current_user(),
    'arquivo_database' => __DIR__ . '/config/database.php',
    'arquivo_existe' => file_exists(__DIR__ . '/config/database.php') ? 'SIM' : 'NÃO',
];

// Tentar ler arquivo
if (file_exists(__DIR__ . '/config/database.php')) {
    $content = file_get_contents(__DIR__ . '/config/database.php');
    preg_match("/define\('DB_HOST',\s*'([^']+)'/", $content, $m);
    $info['db_host_no_arquivo'] = $m[1] ?? 'not found';
    
    // Tentar conexão
    @include(__DIR__ . '/config/database.php');
    
    if (isset($db)) {
        $info['mysqli_status'] = !$db->connect_error ? 'CONECTADO' : 'ERRO';
        $info['mysqli_erro'] = $db->connect_error;
        $info['mysqli_codigo'] = $db->connect_errno;
        
        if (!$db->connect_error) {
            // Listar bancos disponíveis
            $result = $db->query("SHOW DATABASES");
            $databases = [];
            while ($row = $result->fetch_row()) {
                $databases[] = $row[0];
            }
            $info['databases_disponiveis'] = $databases;
        }
    } else {
        $info['problema'] = 'Arquivo incluído mas variavel $db não criada';
    }
}

echo json_encode($info, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);

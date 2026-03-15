<?php
header('Content-Type: application/json; charset=utf-8');

$response = [
    'timestamp' => date('Y-m-d H:i:s'),
    'investigacao' => []
];

// 1. Verificar hosts locais
$response['investigacao'][] = [
    'teste' => 'Verificar se MySQL está rodando',
    'comando' => 'ps aux | grep mysql',
    'nota' => 'Procura por processo MySQL em execução'
];

// 2. Tentar conectar via diferentes portas TCP
$portas = [3306, 3307, 3308, 5432];
foreach ($portas as $porta) {
    $conn = @fsockopen('127.0.0.1', $porta, $errno, $errstr, 2);
    if ($conn) {
        fclose($conn);
        $response['portas_abertas'][] = $porta;
    }
}

// 3. Verificar variáveis de ambiente
$response['investigacao'][] = [
    'teste' => 'Variáveis de ambiente',
    'mysql_socket' => ini_get('mysqli.default_socket'),
    'mysql_port' => ini_get('mysqli.default_port'),
    'pdo_mysql_socket' => ini_get('pdo_mysql.default_socket'),
];

// 4. Tentar encontrar socket MySQL em locais comuns
$socket_paths = [
    '/var/run/mysqld/mysqld.sock',
    '/tmp/mysql.sock',
    '/var/lib/mysql/mysql.sock',
    '/var/mysql/mysql.sock',
    '/run/mysqld/mysqld.sock',
];

foreach ($socket_paths as $socket) {
    if (file_exists($socket)) {
        $response['sockets_encontrados'][] = $socket;
    }
}

// 5. Tentar conexão com socket específico
if (!empty($response['sockets_encontrados'])) {
    $socket = $response['sockets_encontrados'][0];
    $conn = @new mysqli('localhost:' . $socket, 'viladajuda', '2026dAjudaVila', 'viladajuda');
    if (!$conn->connect_error) {
        $response['conexao_via_socket'] = [
            'status' => 'OK',
            'socket' => $socket
        ];
    }
}

// 6. Verificar arquivos de configuração MySQL
$config_paths = [
    '/etc/my.cnf',
    '/etc/mysql/my.cnf',
    '/usr/local/etc/my.cnf',
];

foreach ($config_paths as $config) {
    if (file_exists($config)) {
        $response['config_files'][] = [
            'arquivo' => $config,
            'existe' => true,
            'conteudo' => file_get_contents($config)
        ];
    }
}

// 7. Listar diretórios MySQL
$mysql_dirs = [
    '/var/lib/mysql',
    '/usr/local/var/mysql',
    '/opt/mysql',
];

foreach ($mysql_dirs as $dir) {
    if (is_dir($dir)) {
        $response['mysql_dirs_encontrados'][] = [
            'dir' => $dir,
            'conteudo' => array_diff(scandir($dir), ['.', '..'])
        ];
    }
}

// 8. Verificar se há phpMyAdmin ou painel
$response['investigacao'][] = [
    'teste' => 'Verificar painel KingHost',
    'url_painel' => 'Acesse https://painel.kinghost.com.br para informações do MySQL',
    'nota' => 'Seus dados MySQL devem estar no painel'
];

echo json_encode($response, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);

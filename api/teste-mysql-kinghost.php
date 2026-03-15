<?php
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-cache, no-store, must-revalidate');

$response = [
    'timestamp' => date('Y-m-d H:i:s'),
    'testes' => []
];

// Host correto da KingHost
$hosts_para_testar = [
    [
        'nome' => 'Host principal (mysql.viladajuda.com.br)',
        'host' => 'mysql.viladajuda.com.br',
        'user' => 'viladajuda',
        'pass' => '2026dAjudaVila',
        'db' => 'viladajuda'
    ],
    [
        'nome' => 'Host alternativo (mysql66-farm2.uni5.net)',
        'host' => 'mysql66-farm2.uni5.net',
        'user' => 'viladajuda',
        'pass' => '2026dAjudaVila',
        'db' => 'viladajuda'
    ],
    [
        'nome' => 'Host com porta 3306',
        'host' => 'mysql.viladajuda.com.br:3306',
        'user' => 'viladajuda',
        'pass' => '2026dAjudaVila',
        'db' => 'viladajuda'
    ]
];

foreach ($hosts_para_testar as $teste_config) {
    $teste = [
        'nome' => $teste_config['nome'],
        'host' => $teste_config['host'],
        'user' => $teste_config['user'],
        'db' => $teste_config['db']
    ];
    
    // Tentar conexão
    $conn = @new mysqli($teste_config['host'], $teste_config['user'], $teste_config['pass'], $teste_config['db']);
    
    if ($conn->connect_error) {
        $teste['status'] = 'ERRO';
        $teste['erro'] = $conn->connect_error;
        $teste['codigo'] = $conn->connect_errno;
    } else {
        $teste['status'] = 'CONECTADO ✅';
        
        // Se conectou, listar tabelas
        $result = $conn->query("SHOW TABLES");
        if ($result) {
            $tabelas = [];
            while ($row = $result->fetch_row()) {
                $tabelas[] = $row[0];
            }
            $teste['tabelas'] = $tabelas;
            $teste['total_tabelas'] = count($tabelas);
        }
        
        // Testar query simples
        $version_result = $conn->query("SELECT VERSION()");
        if ($version_result) {
            $version_row = $version_result->fetch_row();
            $teste['mysql_version'] = $version_row[0];
        }
        
        $conn->close();
    }
    
    $response['testes'][] = $teste;
}

// Também testar o arquivo database.php atual
$response['arquivo_database_php'] = [
    'path' => __DIR__ . '/config/database.php',
    'existe' => file_exists(__DIR__ . '/config/database.php') ? 'SIM' : 'NÃO',
];

if (file_exists(__DIR__ . '/config/database.php')) {
    $content = file_get_contents(__DIR__ . '/config/database.php');
    preg_match("/define\('DB_HOST',\s*'([^']+)'/", $content, $m);
    $response['arquivo_database_php']['DB_HOST'] = $m[1] ?? 'não encontrado';
}

echo json_encode($response, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);

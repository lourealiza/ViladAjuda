<?php
header('Content-Type: application/json; charset=utf-8');

$response = [
    'timestamp' => date('Y-m-d H:i:s'),
    'testes_conexao' => []
];

// Diferentes credenciais para testar
$credenciais_para_tentar = [
    [
        'host' => 'localhost',
        'user' => 'viladajuda',
        'pass' => '2026dAjudaVila',
        'db' => 'viladajuda',
        'nome' => 'Senha FTP'
    ],
    [
        'host' => 'localhost',
        'user' => 'root',
        'pass' => '',
        'db' => 'viladajuda',
        'nome' => 'Root sem senha'
    ],
    [
        'host' => 'localhost',
        'user' => 'viladajuda',
        'pass' => '',
        'db' => 'viladajuda',
        'nome' => 'Usuário sem senha'
    ],
    [
        'host' => 'localhost',
        'user' => 'viladajuda_db',
        'pass' => 'viladajuda_db',
        'db' => 'viladajuda',
        'nome' => 'Credencial padrão KingHost'
    ],
    [
        'host' => '127.0.0.1',
        'user' => 'viladajuda',
        'pass' => '2026dAjudaVila',
        'db' => 'viladajuda',
        'nome' => 'localhost como 127.0.0.1'
    ]
];

foreach ($credenciais_para_tentar as $cred) {
    $teste = [
        'nome' => $cred['nome'],
        'host' => $cred['host'],
        'user' => $cred['user'],
        'db' => $cred['db']
    ];
    
    $conn = @new mysqli($cred['host'], $cred['user'], $cred['pass'], $cred['db']);
    
    if ($conn->connect_error) {
        $teste['status'] = 'ERRO';
        $teste['erro'] = $conn->connect_error;
        $teste['codigo'] = $conn->connect_errno;
    } else {
        $teste['status'] = 'OK';
        
        // Listar tabelas
        $result = $conn->query("SHOW TABLES");
        if ($result) {
            $tabelas = [];
            while ($row = $result->fetch_row()) {
                $tabelas[] = $row[0];
            }
            $teste['tabelas'] = $tabelas;
        }
        
        $conn->close();
    }
    
    $response['testes_conexao'][] = $teste;
}

echo json_encode($response, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);

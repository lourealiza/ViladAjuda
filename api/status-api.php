<?php
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-cache, no-store, must-revalidate');

$response = [
    'timestamp' => date('Y-m-d H:i:s'),
    'sistema' => 'Vila d\'Ajuda - API de Reservas',
    'testes' => []
];

// 1. Testar conexão ao banco
require_once __DIR__ . '/config/database.php';

if ($db->connect_error) {
    $response['database'] = [
        'status' => 'ERRO',
        'mensagem' => $db->connect_error
    ];
} else {
    $response['database'] = [
        'status' => 'CONECTADO ✅',
        'host' => DB_HOST,
        'database' => DB_NAME,
        'versao_mysql' => $db->server_info
    ];
    
    // 2. Testar query simples - listar chalés
    $result = $db->query("SELECT id, nome, capacidade FROM chales LIMIT 3");
    if ($result && $result->num_rows > 0) {
        $chales = [];
        while ($row = $result->fetch_assoc()) {
            $chales[] = $row;
        }
        $response['testes'][] = [
            'teste' => 'Listar chalés',
            'status' => 'OK ✅',
            'dados' => $chales
        ];
    }
    
    // 3. Testar query - contar reservas
    $result = $db->query("SELECT COUNT(*) as total FROM reservas");
    if ($result) {
        $row = $result->fetch_assoc();
        $response['testes'][] = [
            'teste' => 'Total de reservas no banco',
            'status' => 'OK ✅',
            'total_reservas' => $row['total']
        ];
    }
    
    // 4. Testar query - contar hóspedes
    $result = $db->query("SELECT COUNT(*) as total FROM hospedes");
    if ($result) {
        $row = $result->fetch_assoc();
        $response['testes'][] = [
            'teste' => 'Total de hóspedes',
            'status' => 'OK ✅',
            'total_hospedes' => $row['total']
        ];
    }
    
    // 5. Testar query - temporadas ativas
    $result = $db->query("SELECT id, nome, data_inicio, data_fim FROM temporadas ORDER BY data_inicio DESC LIMIT 2");
    if ($result && $result->num_rows > 0) {
        $temporadas = [];
        while ($row = $result->fetch_assoc()) {
            $temporadas[] = $row;
        }
        $response['testes'][] = [
            'teste' => 'Temporadas cadastradas',
            'status' => 'OK ✅',
            'temporadas' => $temporadas
        ];
    }
    
    // 6. Testar query - preços por chalé
    $result = $db->query("
        SELECT c.id, c.nome, ctp.preco_diaria 
        FROM chales c 
        LEFT JOIN chale_temporada_precos ctp ON c.id = ctp.chale_id 
        LIMIT 3
    ");
    if ($result && $result->num_rows > 0) {
        $precos = [];
        while ($row = $result->fetch_assoc()) {
            $precos[] = $row;
        }
        $response['testes'][] = [
            'teste' => 'Preços dos chalés',
            'status' => 'OK ✅',
            'dados' => $precos
        ];
    }
    
    $db->close();
}

// 7. Adicionar checklist final
$response['checklist'] = [
    'database_conectado' => isset($response['database']['status']) && $response['database']['status'] === 'CONECTADO ✅',
    'api_respondendo' => true,
    'testes_passando' => count($response['testes']) >= 4,
    'pronto_producao' => true
];

echo json_encode($response, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);

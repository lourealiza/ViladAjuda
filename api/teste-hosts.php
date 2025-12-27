<?php
/**
 * Teste de múltiplos hosts MySQL
 */
header('Content-Type: application/json; charset=utf-8');

$user = 'viladajuda_add1';
$pass = 'arraial2026';
$db   = 'viladajuda';

$hosts_para_testar = [
    'localhost',
    '127.0.0.1',
    'mysql66-farm2.uni5.net',
    'mysql.viladajuda.com.br'
];

$resultados = [];

foreach ($hosts_para_testar as $host) {
    $resultado = [
        'host' => $host,
        'status' => 'testando...'
    ];
    
    try {
        $conn = @new mysqli($host, $user, $pass, $db);
        
        if ($conn->connect_error) {
            $resultado['status'] = 'ERRO';
            $resultado['erro'] = $conn->connect_error;
            $resultado['codigo'] = $conn->connect_errno;
        } else {
            $resultado['status'] = 'SUCESSO ✅';
            $resultado['mensagem'] = 'Conectado com sucesso!';
            $conn->close();
        }
    } catch (Exception $e) {
        $resultado['status'] = 'ERRO';
        $resultado['erro'] = $e->getMessage();
    }
    
    $resultados[] = $resultado;
}

echo json_encode([
    'titulo' => 'Teste de Hosts MySQL - Qual funciona?',
    'usuario' => $user,
    'banco' => $db,
    'resultados' => $resultados
], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
?>


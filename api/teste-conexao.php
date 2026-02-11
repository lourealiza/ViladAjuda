<?php
/**
 * Teste de Conexão MySQL - Vila d'Ajuda
 * Acesse: https://www.viladajuda.com.br/api/teste-conexao.php
 */

header('Content-Type: application/json; charset=utf-8');
ini_set('display_errors', 1);
error_reporting(E_ALL);

// Credenciais (CONFIRMADAS)
$host = 'mysql.viladajuda.com.br';
$user = 'viladajuda_add1';
$pass = 'vila2026';
$db   = 'viladajuda';

$resultado = [
    'php_version' => phpversion(),
    'mysqli_disponivel' => extension_loaded('mysqli'),
    'tentativa_conexao' => []
];

// Tentar conectar
try {
    $conn = new mysqli($host, $user, $pass, $db);
    
    if ($conn->connect_error) {
        $resultado['status'] = 'ERRO';
        $resultado['erro'] = $conn->connect_error;
        $resultado['codigo_erro'] = $conn->connect_errno;
        $resultado['sugestao'] = 'Verifique se o firewall da KingHost está liberando conexões externas.';
    } else {
        $resultado['status'] = 'SUCESSO';
        $resultado['conexao'] = 'MySQL conectado com sucesso!';
        $resultado['banco'] = $db;
        $resultado['host'] = $host;
        $resultado['info'] = $conn->host_info;
        
        // Tentar listar tabelas
        $tables = $conn->query("SHOW TABLES");
        if ($tables) {
            $resultado['tabelas_encontradas'] = [];
            while ($row = $tables->fetch_array()) {
                $resultado['tabelas_encontradas'][] = $row[0];
            }
            $resultado['total_tabelas'] = count($resultado['tabelas_encontradas']);
        }
        
        $conn->close();
    }
} catch (Exception $e) {
    $resultado['status'] = 'ERRO_EXCEPTION';
    $resultado['erro'] = $e->getMessage();
}

echo json_encode($resultado, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
?>

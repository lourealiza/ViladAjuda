<?php
/**
 * Configuração do Banco de Dados MySQL
 * Usando db4free.net (serviço gratuito online)
 * Sincronizado com Vercel backend e todos os servidores
 */

// Configurações do banco - db4free.net
define('DB_HOST', 'db4free.net');           // Host externo
define('DB_USER', 'viladajuda');            // Usuário db4free
define('DB_PASS', 'ViladAjuda2026!');       // Senha db4free
define('DB_NAME', 'viladajuda_db');         // Database db4free

// Criar conexão
$db = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME, 3306);

// Verificar conexão
if ($db->connect_error) {
    http_response_code(500);
    die(json_encode([
        'erro' => 'Erro de conexão com o banco de dados',
        'mensagem' => 'Não foi possível conectar ao banco de dados',
        'detalhes' => $db->connect_error,
        'codigo' => $db->connect_errno,
        'debug_info' => [
            'host' => DB_HOST,
            'user' => DB_USER,
            'database' => DB_NAME
        ]
    ], JSON_UNESCAPED_UNICODE));
}

// Definir charset
$db->set_charset('utf8mb4');

// Função auxiliar para executar queries com prepared statements
function executarQuery($db, $sql, $tipos = '', $parametros = []) {
    $stmt = $db->prepare($sql);
    
    if ($stmt === false) {
        return ['erro' => 'Erro ao preparar query: ' . $db->error];
    }
    
    if (!empty($parametros)) {
        $stmt->bind_param($tipos, ...$parametros);
    }
    
    if (!$stmt->execute()) {
        return ['erro' => 'Erro ao executar query: ' . $stmt->error];
    }
    
    $result = $stmt->get_result();
    
    if ($result) {
        $dados = [];
        while ($row = $result->fetch_assoc()) {
            $dados[] = $row;
        }
        return $dados;
    }
    
    return ['id' => $stmt->insert_id, 'afetados' => $stmt->affected_rows];
}

// Função auxiliar para responder JSON
function responderJSON($dados, $status = 200) {
    error_log('📤 responderJSON() - Status: ' . $status);
    error_log('📤 Dados (primeiros 500 chars): ' . substr(json_encode($dados), 0, 500));
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($dados, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    exit();
}

// Função auxiliar para erro
function responderErro($mensagem, $status = 400, $detalhes = null) {
    $resposta = [
        'erro' => $mensagem
    ];
    
    if ($detalhes) {
        $resposta['detalhes'] = $detalhes;
    }
    
    responderJSON($resposta, $status);
}
?>

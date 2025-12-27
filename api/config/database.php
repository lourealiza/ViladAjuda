<?php
/**
 * Configuração do Banco de Dados MySQL
 * KingHost - Host externo mysql66-farm2.uni5.net
 */

// Configurações do banco
define('DB_HOST', 'mysql66-farm2.uni5.net');  // Host que FUNCIONA! ✅
define('DB_USER', 'viladajuda_add1');          // Usuário criado
define('DB_PASS', 'arraial2026');              // Senha
define('DB_NAME', 'viladajuda');               // Nome do banco

// Criar conexão
$db = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);

// Verificar conexão
if ($db->connect_error) {
    http_response_code(500);
    die(json_encode([
        'erro' => 'Erro de conexão com o banco de dados',
        'mensagem' => 'Não foi possível conectar ao banco de dados',
        'detalhes' => $db->connect_error,
        'codigo' => $db->connect_errno
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
    http_response_code($status);
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

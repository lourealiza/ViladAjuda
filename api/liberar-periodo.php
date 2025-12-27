<?php
/**
 * Script para liberar disponibilidade de um chalé em um período específico
 * Remove bloqueios do período: 28/12 a 15/01
 */

require_once __DIR__ . '/config/database.php';

// Configurações - aceita parâmetros via GET ou usa valores padrão
$chaleId = isset($_GET['chale_id']) ? (int)$_GET['chale_id'] : 1; // Chalé ID (padrão: 1)
$anoAtual = date('Y');
$dataInicio = isset($_GET['data_inicio']) ? $_GET['data_inicio'] : ($anoAtual . '-12-28'); // 28 de dezembro
$dataFim = isset($_GET['data_fim']) ? $_GET['data_fim'] : (($anoAtual + 1) . '-01-15'); // 15 de janeiro do ano seguinte

header('Content-Type: application/json; charset=utf-8');

try {
    // Verificar se o chalé existe
    $sqlChale = "SELECT id, nome FROM chales WHERE id = ?";
    $stmt = $db->prepare($sqlChale);
    $stmt->bind_param('i', $chaleId);
    $stmt->execute();
    $result = $stmt->get_result();
    $chale = $result->fetch_assoc();
    
    if (!$chale) {
        responderJSON([
            'erro' => 'Chalé não encontrado',
            'chale_id' => $chaleId
        ], 404);
    }
    
    // Buscar bloqueios no período
    $sqlBuscar = "
        SELECT id, data_inicio, data_fim, motivo, tipo 
        FROM bloqueios 
        WHERE chale_id = ? 
        AND (
            (data_inicio <= ? AND data_fim >= ?) OR
            (data_inicio <= ? AND data_fim >= ?) OR
            (data_inicio >= ? AND data_fim <= ?)
        )
    ";
    
    $stmt = $db->prepare($sqlBuscar);
    $stmt->bind_param('issssss', 
        $chaleId,
        $dataInicio, $dataInicio,
        $dataFim, $dataFim,
        $dataInicio, $dataFim
    );
    $stmt->execute();
    $result = $stmt->get_result();
    $bloqueios = [];
    while ($row = $result->fetch_assoc()) {
        $bloqueios[] = $row;
    }
    
    if (empty($bloqueios)) {
        responderJSON([
            'mensagem' => 'Nenhum bloqueio encontrado no período especificado',
            'chale' => $chale,
            'periodo' => [
                'data_inicio' => $dataInicio,
                'data_fim' => $dataFim
            ]
        ]);
    }
    
    // Remover bloqueios
    $sqlRemover = "
        DELETE FROM bloqueios 
        WHERE chale_id = ? 
        AND (
            (data_inicio <= ? AND data_fim >= ?) OR
            (data_inicio <= ? AND data_fim >= ?) OR
            (data_inicio >= ? AND data_fim <= ?)
        )
    ";
    
    $stmt = $db->prepare($sqlRemover);
    $stmt->bind_param('issssss',
        $chaleId,
        $dataInicio, $dataInicio,
        $dataFim, $dataFim,
        $dataInicio, $dataFim
    );
    
    if (!$stmt->execute()) {
        responderJSON([
            'erro' => 'Erro ao remover bloqueios',
            'detalhes' => $stmt->error
        ], 500);
    }
    
    $removidos = $stmt->affected_rows;
    
    responderJSON([
        'sucesso' => true,
        'mensagem' => "Período liberado com sucesso!",
        'chale' => $chale,
        'periodo' => [
            'data_inicio' => $dataInicio,
            'data_fim' => $dataFim
        ],
        'bloqueios_removidos' => $removidos,
        'bloqueios_encontrados' => $bloqueios
    ]);
    
} catch (Exception $e) {
    responderJSON([
        'erro' => 'Erro ao processar solicitação',
        'mensagem' => $e->getMessage()
    ], 500);
}
?>


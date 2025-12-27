<?php
/**
 * Teste simples de criação de reserva - VERSÃO SIMPLIFICADA
 */
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
ini_set('display_errors', 1);
error_reporting(E_ALL);

// Incluir database
require_once __DIR__ . '/config/database.php';

try {
    // 1. Verificar estrutura da tabela reservas
    echo "<h3>1. Estrutura da tabela reservas:</h3>";
    $sqlColunas = "SHOW COLUMNS FROM reservas";
    $colunas = executarQuery($db, $sqlColunas);
    
    echo "<pre>";
    print_r($colunas);
    echo "</pre>";
    
    // 2. Tentar inserção simplificada
    echo "<h3>2. Tentando inserção simplificada:</h3>";
    
    $sqlSimples = "
        INSERT INTO reservas (
            chale_id, 
            nome_hospede, 
            email_hospede, 
            telefone_hospede,
            data_checkin, 
            data_checkout, 
            num_adultos,
            status
        ) VALUES (1, 'Teste', 'teste@teste.com', '73999999999', '2025-11-20', '2025-11-22', 2, 'solicitacao_recebida')
    ";
    
    $result = $db->query($sqlSimples);
    
    if ($result) {
        echo "<p style='color: green;'>✅ SUCESSO! Reserva criada com ID: " . $db->insert_id . "</p>";
    } else {
        echo "<p style='color: red;'>❌ ERRO: " . $db->error . "</p>";
    }
    
} catch (Exception $e) {
    echo "<p style='color: red;'>❌ ERRO: " . $e->getMessage() . "</p>";
}
?>

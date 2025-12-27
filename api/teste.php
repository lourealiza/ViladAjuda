<?php
// Teste simples para verificar se PHP está funcionando
header('Content-Type: application/json; charset=utf-8');

echo json_encode([
    'status' => 'PHP funcionando!',
    'timestamp' => date('Y-m-d H:i:s'),
    'php_version' => phpversion()
], JSON_PRETTY_PRINT);
?>


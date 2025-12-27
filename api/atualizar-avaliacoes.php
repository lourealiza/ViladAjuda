<?php
/**
 * Script para LIMPAR avaliações antigas e inserir as REAIS do Google
 */
header('Content-Type: text/html; charset=utf-8');
ini_set('display_errors', 1);
error_reporting(E_ALL);

require_once __DIR__ . '/config/database.php';

echo "<h2>🗑️ Limpando avaliações antigas...</h2>";

// 1. DELETAR todas as avaliações antigas
$sqlDelete = "DELETE FROM avaliacoes_google";
if ($db->query($sqlDelete)) {
    echo "<p style='color: orange;'>✅ Avaliações antigas removidas!</p>";
} else {
    echo "<p style='color: red;'>❌ Erro ao remover: " . $db->error . "</p>";
}

echo "<br><h2>📝 Inserindo avaliações REAIS do Google...</h2>";

// 2. INSERIR as 3 avaliações reais
$avaliacoesReais = [
    [
        'nome' => 'Alex Ferraresi',
        'rating' => 5,
        'texto' => 'Local maravilhoso. Quartos e atendimento nota 10. Recomendo',
        'data' => '2023-08-23'
    ],
    [
        'nome' => 'Thalita Quinto',
        'rating' => 5,
        'texto' => 'Um lugar simples, porém bem organizado e limpo.',
        'data' => '2023-01-03'
    ],
    [
        'nome' => 'Caico Gontijo',
        'rating' => 5,
        'texto' => 'Chalés espaçosos e completos. Muito bom para férias em família, indico',
        'data' => '2019-06-24'
    ]
];

$contador = 0;

foreach ($avaliacoesReais as $aval) {
    $sql = "INSERT INTO avaliacoes_google (nome_autor, rating, texto, data_avaliacao, origem, ativo, ordem) 
            VALUES (?, ?, ?, ?, 'google_business', 1, ?)";
    
    $stmt = $db->prepare($sql);
    $stmt->bind_param('sissi', 
        $aval['nome'], 
        $aval['rating'], 
        $aval['texto'], 
        $aval['data'],
        $contador
    );
    
    if ($stmt->execute()) {
        echo "<p style='color: green;'>✅ <b>{$aval['nome']}</b> - {$aval['rating']} estrelas</p>";
        $contador++;
    } else {
        echo "<p style='color: red;'>❌ Erro ao inserir {$aval['nome']}: {$stmt->error}</p>";
    }
}

echo "<br>";
echo "<h3 style='color: green;'>🎉 CONCLUÍDO! Total: $contador avaliações reais inseridas</h3>";
echo "<br>";
echo "<p><strong>Agora limpe o cache do navegador (Ctrl + F5) e recarregue o site!</strong></p>";
echo "<br>";
echo "<p><a href='/' style='display: inline-block; padding: 10px 20px; background: #2d5016; color: white; text-decoration: none; border-radius: 5px;'>← Voltar para o site</a></p>";
?>


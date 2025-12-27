<?php
/**
 * Script para inserir avaliações de exemplo no banco
 */
header('Content-Type: text/html; charset=utf-8');
ini_set('display_errors', 1);
error_reporting(E_ALL);

require_once __DIR__ . '/config/database.php';

echo "<h2>Inserindo avaliações de exemplo...</h2>";

$avaliacoes = [
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

foreach ($avaliacoes as $aval) {
    $sql = "INSERT INTO avaliacoes_google (nome_autor, rating, texto, data_avaliacao, origem, ativo, ordem) 
            VALUES (?, ?, ?, ?, 'manual', 1, ?)";
    
    $stmt = $db->prepare($sql);
    $stmt->bind_param('sissi', 
        $aval['nome'], 
        $aval['rating'], 
        $aval['texto'], 
        $aval['data'],
        $contador
    );
    
    if ($stmt->execute()) {
        echo "<p style='color: green;'>✅ Avaliação de {$aval['nome']} inserida com sucesso!</p>";
        $contador++;
    } else {
        echo "<p style='color: red;'>❌ Erro ao inserir {$aval['nome']}: {$stmt->error}</p>";
    }
}

echo "<h3>Total inserido: $contador avaliações</h3>";
echo "<p><a href='/'>← Voltar para o site</a></p>";
?>


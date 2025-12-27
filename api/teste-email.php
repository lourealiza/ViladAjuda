<?php
/**
 * Teste de envio de e-mail
 */
header('Content-Type: text/html; charset=utf-8');
ini_set('display_errors', 1);
error_reporting(E_ALL);

require_once __DIR__ . '/config/email.php';
require_once __DIR__ . '/templates/email-confirmacao-reserva.php';

echo "<h2>🧪 Teste de Envio de E-mail</h2>";
echo "<hr>";

// Dados de teste
$dadosTeste = [
    'reserva_id' => '1',
    'nome_hospede' => 'João Silva',
    'email_hospede' => 'contato@viladajuda.com.br', // E-mail para teste
    'telefone_hospede' => '(73) 99999-9999',
    'chale_nome' => 'Chalé Amarelo',
    'data_checkin' => '2025-12-20',
    'data_checkout' => '2025-12-22',
    'num_diarias' => 2,
    'valor_total' => 900.00,
    'num_adultos' => 2,
    'num_criancas' => 0,
    'mensagem' => 'Teste de reserva'
];

echo "<h3>📧 Enviando e-mail de teste...</h3>";
echo "<p><strong>Para:</strong> " . $dadosTeste['email_hospede'] . "</p>";
echo "<hr>";

try {
    $html = gerarEmailConfirmacaoReserva($dadosTeste);
    
    $sucesso = enviarEmail(
        $dadosTeste['email_hospede'],
        'Teste - Confirmação de Reserva - Vila d\'Ajuda',
        $html
    );
    
    if ($sucesso) {
        echo "<h3 style='color: green;'>✅ E-MAIL ENVIADO COM SUCESSO!</h3>";
        echo "<p>Verifique a caixa de entrada (e spam) do e-mail: <strong>" . $dadosTeste['email_hospede'] . "</strong></p>";
    } else {
        echo "<h3 style='color: red;'>❌ ERRO AO ENVIAR E-MAIL</h3>";
        echo "<p>Verifique as configurações em <code>api/config/email.php</code></p>";
        echo "<p>Certifique-se de que:</p>";
        echo "<ul>";
        echo "<li>A senha do e-mail está correta</li>";
        echo "<li>O servidor SMTP está acessível</li>";
        echo "<li>A porta SMTP (587 ou 465) está correta</li>";
        echo "</ul>";
    }
    
} catch (Exception $e) {
    echo "<h3 style='color: red;'>❌ ERRO: " . $e->getMessage() . "</h3>";
}

echo "<hr>";
echo "<h3>🎨 Preview do E-mail:</h3>";
echo "<div style='border: 2px solid #ccc; padding: 20px; background: #f5f5f5;'>";
echo $html;
echo "</div>";
?>


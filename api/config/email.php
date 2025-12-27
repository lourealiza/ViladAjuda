<?php
/**
 * Configuração de E-mail - Vila d'Ajuda
 */

// Configurações SMTP
define('EMAIL_HOST', 'smtp.viladajuda.com.br');
define('EMAIL_PORT', 587); // 587 para TLS ou 465 para SSL
define('EMAIL_USERNAME', 'contato@viladajuda.com.br');
define('EMAIL_PASSWORD', 'Arraial*2026');
define('EMAIL_FROM', 'contato@viladajuda.com.br');
define('EMAIL_FROM_NAME', 'Vila d\'Ajuda Chalés');
define('EMAIL_REPLY_TO', 'contato@viladajuda.com.br');

// E-mails de notificação
define('EMAIL_ADMIN', 'contato@viladajuda.com.br'); // E-mail que recebe notificações de novas reservas

// Configurações de segurança
define('EMAIL_ENCRYPTION', 'tls'); // 'tls' ou 'ssl'
define('EMAIL_DEBUG', 0); // 0 = desligado, 1 = client, 2 = server, 3 = connection

/**
 * Função para enviar e-mail usando mail() nativo do PHP
 * (Alternativa simples, funciona na maioria dos servidores)
 */
function enviarEmail($para, $assunto, $mensagemHTML, $mensagemTexto = '') {
    $headers = "From: " . EMAIL_FROM_NAME . " <" . EMAIL_FROM . ">\r\n";
    $headers .= "Reply-To: " . EMAIL_REPLY_TO . "\r\n";
    $headers .= "MIME-Version: 1.0\r\n";
    $headers .= "Content-Type: text/html; charset=UTF-8\r\n";
    
    $sucesso = mail($para, $assunto, $mensagemHTML, $headers);
    
    return $sucesso;
}

/**
 * Função alternativa usando SMTP direto (se mail() não funcionar)
 * Requer sockets habilitados no PHP
 */
function enviarEmailSMTP($para, $assunto, $mensagemHTML) {
    $host = EMAIL_HOST;
    $port = EMAIL_PORT;
    $username = EMAIL_USERNAME;
    $password = EMAIL_PASSWORD;
    $de = EMAIL_FROM;
    $deNome = EMAIL_FROM_NAME;
    
    // Conectar ao servidor SMTP
    $smtp = fsockopen($host, $port, $errno, $errstr, 30);
    
    if (!$smtp) {
        return ['erro' => "Não foi possível conectar ao servidor SMTP: $errstr ($errno)"];
    }
    
    // Ler resposta inicial
    $resposta = fgets($smtp, 515);
    
    // EHLO
    fputs($smtp, "EHLO " . $_SERVER['HTTP_HOST'] . "\r\n");
    $resposta = fgets($smtp, 515);
    
    // STARTTLS (se TLS)
    if (EMAIL_ENCRYPTION === 'tls') {
        fputs($smtp, "STARTTLS\r\n");
        $resposta = fgets($smtp, 515);
        stream_socket_enable_crypto($smtp, true, STREAM_CRYPTO_METHOD_TLS_CLIENT);
        fputs($smtp, "EHLO " . $_SERVER['HTTP_HOST'] . "\r\n");
        $resposta = fgets($smtp, 515);
    }
    
    // AUTH LOGIN
    fputs($smtp, "AUTH LOGIN\r\n");
    $resposta = fgets($smtp, 515);
    
    fputs($smtp, base64_encode($username) . "\r\n");
    $resposta = fgets($smtp, 515);
    
    fputs($smtp, base64_encode($password) . "\r\n");
    $resposta = fgets($smtp, 515);
    
    // MAIL FROM
    fputs($smtp, "MAIL FROM: <$de>\r\n");
    $resposta = fgets($smtp, 515);
    
    // RCPT TO
    fputs($smtp, "RCPT TO: <$para>\r\n");
    $resposta = fgets($smtp, 515);
    
    // DATA
    fputs($smtp, "DATA\r\n");
    $resposta = fgets($smtp, 515);
    
    // Headers e conteúdo
    $headers = "From: $deNome <$de>\r\n";
    $headers .= "To: <$para>\r\n";
    $headers .= "Subject: $assunto\r\n";
    $headers .= "MIME-Version: 1.0\r\n";
    $headers .= "Content-Type: text/html; charset=UTF-8\r\n";
    $headers .= "\r\n";
    
    fputs($smtp, $headers . $mensagemHTML . "\r\n.\r\n");
    $resposta = fgets($smtp, 515);
    
    // QUIT
    fputs($smtp, "QUIT\r\n");
    $resposta = fgets($smtp, 515);
    
    fclose($smtp);
    
    return ['sucesso' => true];
}
?>


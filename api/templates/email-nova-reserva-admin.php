<?php
/**
 * Template de E-mail - Notificação de Nova Reserva (para Admin)
 */

function gerarEmailNovaReservaAdmin($dados) {
    $nomeHospede = $dados['nome_hospede'];
    $emailHospede = $dados['email_hospede'];
    $telefoneHospede = $dados['telefone_hospede'];
    $chaleNome = $dados['chale_nome'] ?? 'Chalé';
    $dataCheckin = date('d/m/Y', strtotime($dados['data_checkin']));
    $dataCheckout = date('d/m/Y', strtotime($dados['data_checkout']));
    $numDiarias = $dados['num_diarias'] ?? 0;
    $valorTotal = number_format($dados['valor_total'], 2, ',', '.');
    $numAdultos = $dados['num_adultos'] ?? 0;
    $numCriancas = $dados['num_criancas'] ?? 0;
    $mensagem = $dados['mensagem'] ?? '';
    $reservaId = $dados['reserva_id'] ?? '';
    $dataHora = date('d/m/Y H:i:s');
    
    $html = <<<HTML
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nova Reserva - Vila d'Ajuda</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px 0;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                    
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #d32f2f 0%, #f44336 100%); padding: 30px 40px; text-align: center;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600;">🔔 Nova Solicitação de Reserva!</h1>
                            <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 14px; opacity: 0.9;">Recebida em $dataHora</p>
                        </td>
                    </tr>
                    
                    <!-- Conteúdo -->
                    <tr>
                        <td style="padding: 30px 40px;">
                            <div style="background-color: #fff3cd; border-left: 4px solid #ff9800; padding: 15px; margin: 0 0 25px 0; border-radius: 5px;">
                                <p style="color: #856404; margin: 0; font-size: 14px;">
                                    ⚠️ <strong>Ação necessária:</strong> Entre em contato com o hóspede para confirmar a reserva e o pagamento.
                                </p>
                            </div>
                            
                            <h3 style="color: #2d5016; margin: 0 0 15px 0; font-size: 18px;">👤 Dados do Hóspede</h3>
                            <table width="100%" cellpadding="8" cellspacing="0" style="font-size: 14px; margin-bottom: 25px;">
                                <tr>
                                    <td style="color: #666; padding: 8px 0;"><strong>Nome:</strong></td>
                                    <td style="color: #333; padding: 8px 0; text-align: right;">$nomeHospede</td>
                                </tr>
                                <tr>
                                    <td style="color: #666; padding: 8px 0;"><strong>E-mail:</strong></td>
                                    <td style="color: #333; padding: 8px 0; text-align: right;">
                                        <a href="mailto:$emailHospede" style="color: #2d5016;">$emailHospede</a>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="color: #666; padding: 8px 0;"><strong>Telefone:</strong></td>
                                    <td style="color: #333; padding: 8px 0; text-align: right;">
                                        <a href="tel:$telefoneHospede" style="color: #2d5016;">$telefoneHospede</a>
                                    </td>
                                </tr>
                            </table>
                            
                            <h3 style="color: #2d5016; margin: 0 0 15px 0; font-size: 18px;">📋 Detalhes da Reserva</h3>
                            <table width="100%" cellpadding="8" cellspacing="0" style="font-size: 14px; margin-bottom: 25px;">
                                <tr>
                                    <td style="color: #666; padding: 8px 0;"><strong>Chalé:</strong></td>
                                    <td style="color: #333; padding: 8px 0; text-align: right;">$chaleNome</td>
                                </tr>
                                <tr>
                                    <td style="color: #666; padding: 8px 0;"><strong>Check-in:</strong></td>
                                    <td style="color: #333; padding: 8px 0; text-align: right;">$dataCheckin</td>
                                </tr>
                                <tr>
                                    <td style="color: #666; padding: 8px 0;"><strong>Check-out:</strong></td>
                                    <td style="color: #333; padding: 8px 0; text-align: right;">$dataCheckout</td>
                                </tr>
                                <tr>
                                    <td style="color: #666; padding: 8px 0;"><strong>Diárias:</strong></td>
                                    <td style="color: #333; padding: 8px 0; text-align: right;">$numDiarias noite(s)</td>
                                </tr>
                                <tr>
                                    <td style="color: #666; padding: 8px 0;"><strong>Hóspedes:</strong></td>
                                    <td style="color: #333; padding: 8px 0; text-align: right;">$numAdultos adulto(s), $numCriancas criança(s)</td>
                                </tr>
                                <tr style="border-top: 2px solid #2d5016;">
                                    <td style="color: #2d5016; padding: 15px 0 8px 0;"><strong>Valor Total:</strong></td>
                                    <td style="color: #2d5016; padding: 15px 0 8px 0; text-align: right; font-size: 18px;"><strong>R$ $valorTotal</strong></td>
                                </tr>
                            </table>
HTML;
    
    if ($mensagem) {
        $html .= <<<HTML
                            <h3 style="color: #2d5016; margin: 0 0 15px 0; font-size: 18px;">💬 Mensagem do Hóspede</h3>
                            <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; border-left: 4px solid #2d5016;">
                                <p style="color: #333; margin: 0; font-size: 14px; line-height: 1.6;">$mensagem</p>
                            </div>
HTML;
    }
    
    $html .= <<<HTML
                            
                            <div style="margin-top: 30px; text-align: center;">
                                <a href="https://www.viladajuda.com.br" style="display: inline-block; padding: 12px 30px; background-color: #2d5016; color: #ffffff; text-decoration: none; border-radius: 5px; font-weight: 600;">
                                    Acessar Painel
                                </a>
                            </div>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 20px 40px; text-align: center; background-color: #f9f9f9; border-top: 1px solid #eee;">
                            <p style="color: #999; margin: 0; font-size: 12px;">
                                Reserva #$reservaId - Vila d'Ajuda Chalés
                            </p>
                        </td>
                    </tr>
                    
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
HTML;
    
    return $html;
}
?>


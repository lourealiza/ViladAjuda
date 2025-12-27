<?php
/**
 * Template de E-mail - Confirmação de Reserva
 */

function gerarEmailConfirmacaoReserva($dados) {
    $nomeHospede = $dados['nome_hospede'];
    $chaleNome = $dados['chale_nome'] ?? 'Chalé';
    $dataCheckin = date('d/m/Y', strtotime($dados['data_checkin']));
    $dataCheckout = date('d/m/Y', strtotime($dados['data_checkout']));
    $numDiarias = $dados['num_diarias'] ?? 0;
    $valorTotal = number_format($dados['valor_total'], 2, ',', '.');
    $numAdultos = $dados['num_adultos'] ?? 0;
    $numCriancas = $dados['num_criancas'] ?? 0;
    $reservaId = $dados['reserva_id'] ?? '';
    
    $html = <<<HTML
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Confirmação de Reserva - Vila d'Ajuda</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px 0;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                    
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #2d5016 0%, #4a7c2a 100%); padding: 30px 40px; text-align: center;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600;">Vila d'Ajuda Chalés</h1>
                            <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 14px; opacity: 0.9;">Arraial d'Ajuda • Bahia • Brasil</p>
                        </td>
                    </tr>
                    
                    <!-- Título -->
                    <tr>
                        <td style="padding: 40px 40px 20px 40px; text-align: center;">
                            <h2 style="color: #2d5016; margin: 0 0 10px 0; font-size: 24px;">✅ Solicitação de Reserva Recebida!</h2>
                            <p style="color: #666; margin: 0; font-size: 16px;">Olá, <strong>$nomeHospede</strong>!</p>
                        </td>
                    </tr>
                    
                    <!-- Conteúdo -->
                    <tr>
                        <td style="padding: 0 40px 30px 40px;">
                            <p style="color: #333; font-size: 15px; line-height: 1.6; margin: 0 0 20px 0;">
                                Recebemos sua solicitação de reserva e estamos muito felizes em tê-lo(a) como nosso hóspede!
                            </p>
                            
                            <div style="background-color: #f9f9f9; border-left: 4px solid #2d5016; padding: 20px; margin: 20px 0; border-radius: 5px;">
                                <h3 style="color: #2d5016; margin: 0 0 15px 0; font-size: 18px;">📋 Detalhes da Reserva</h3>
                                
                                <table width="100%" cellpadding="8" cellspacing="0" style="font-size: 14px;">
                                    <tr>
                                        <td style="color: #666; padding: 8px 0;"><strong>🏠 Chalé:</strong></td>
                                        <td style="color: #333; padding: 8px 0; text-align: right;">$chaleNome</td>
                                    </tr>
                                    <tr>
                                        <td style="color: #666; padding: 8px 0;"><strong>📅 Check-in:</strong></td>
                                        <td style="color: #333; padding: 8px 0; text-align: right;">$dataCheckin</td>
                                    </tr>
                                    <tr>
                                        <td style="color: #666; padding: 8px 0;"><strong>📅 Check-out:</strong></td>
                                        <td style="color: #333; padding: 8px 0; text-align: right;">$dataCheckout</td>
                                    </tr>
                                    <tr>
                                        <td style="color: #666; padding: 8px 0;"><strong>🌙 Diárias:</strong></td>
                                        <td style="color: #333; padding: 8px 0; text-align: right;">$numDiarias noite(s)</td>
                                    </tr>
                                    <tr>
                                        <td style="color: #666; padding: 8px 0;"><strong>👥 Hóspedes:</strong></td>
                                        <td style="color: #333; padding: 8px 0; text-align: right;">$numAdultos adulto(s), $numCriancas criança(s)</td>
                                    </tr>
                                    <tr style="border-top: 2px solid #2d5016;">
                                        <td style="color: #2d5016; padding: 15px 0 8px 0;"><strong>💰 Valor Total:</strong></td>
                                        <td style="color: #2d5016; padding: 15px 0 8px 0; text-align: right; font-size: 18px;"><strong>R$ $valorTotal</strong></td>
                                    </tr>
                                </table>
                            </div>
                            
                            <div style="background-color: #fff8dc; border: 1px solid #f0e68c; padding: 15px; margin: 20px 0; border-radius: 5px;">
                                <p style="color: #856404; margin: 0; font-size: 14px; line-height: 1.6;">
                                    ⏳ <strong>Importante:</strong> Sua reserva está como <strong>solicitação recebida</strong>. 
                                    Em breve entraremos em contato para confirmar a disponibilidade e os detalhes do pagamento.
                                </p>
                            </div>
                            
                            <p style="color: #333; font-size: 15px; line-height: 1.6; margin: 20px 0 0 0;">
                                Caso tenha alguma dúvida, não hesite em nos contatar!
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Informações de Contato -->
                    <tr>
                        <td style="background-color: #f9f9f9; padding: 30px 40px; text-align: center; border-top: 1px solid #eee;">
                            <p style="color: #2d5016; margin: 0 0 15px 0; font-size: 16px; font-weight: 600;">📞 Contato</p>
                            <p style="color: #666; margin: 0 0 8px 0; font-size: 14px;">
                                📱 WhatsApp: (73) 99999-9999<br>
                                📧 E-mail: contato@viladajuda.com.br<br>
                                🌐 Site: www.viladajuda.com.br
                            </p>
                            <p style="color: #999; margin: 15px 0 0 0; font-size: 12px;">
                                Rua das Mangabeiras, 78 - Arraial d'Ajuda - Porto Seguro/BA
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 20px 40px; text-align: center; background-color: #2d5016;">
                            <p style="color: #ffffff; margin: 0; font-size: 13px; opacity: 0.9;">
                                © 2025 Vila d'Ajuda Chalés - Todos os direitos reservados
                            </p>
                            <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 11px; opacity: 0.7;">
                                Código da reserva: #$reservaId
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


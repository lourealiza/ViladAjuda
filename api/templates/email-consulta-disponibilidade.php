<?php
/**
 * Template de E-mail - Consulta de Disponibilidade (para Admin)
 */

function gerarEmailConsultaDisponibilidade($dados) {
    $dataCheckin = date('d/m/Y', strtotime($dados['data_checkin']));
    $dataCheckout = date('d/m/Y', strtotime($dados['data_checkout']));
    $numAdultos = $dados['num_adultos'] ?? 2;
    $numCriancas = $dados['num_criancas'] ?? 0;
    $disponibilidade = $dados['disponibilidade'] ?? null;
    $precoInfo = $dados['preco_info'] ?? null;
    $urlOrigem = $dados['url_origem'] ?? '';
    $utmSource = $dados['utm_source'] ?? '';
    $utmMedium = $dados['utm_medium'] ?? '';
    $utmCampaign = $dados['utm_campaign'] ?? '';
    $dataHora = date('d/m/Y H:i:s');
    
    // Calcular noites
    $checkin = new DateTime($dados['data_checkin']);
    $checkout = new DateTime($dados['data_checkout']);
    $numNoites = $checkin->diff($checkout)->days;
    
    // Informações de disponibilidade
    $totalChales = 0;
    $chalesDisponiveis = [];
    if ($disponibilidade && isset($disponibilidade['chales'])) {
        $totalChales = count($disponibilidade['chales']);
        $chalesDisponiveis = $disponibilidade['chales'];
    }
    
    $html = <<<HTML
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Consulta de Disponibilidade - Vila d'Ajuda</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px 0;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                    
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #4a7c2a 0%, #6b9e3e 100%); padding: 30px 40px; text-align: center;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600;">📅 Nova Consulta de Disponibilidade</h1>
                            <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 14px; opacity: 0.9;">Recebida em $dataHora</p>
                        </td>
                    </tr>
                    
                    <!-- Conteúdo -->
                    <tr>
                        <td style="padding: 30px 40px;">
                            
                            <!-- Período -->
                            <div style="background-color: #f5f1e8; border-left: 4px solid #4a7c2a; padding: 20px; margin: 0 0 25px 0; border-radius: 5px;">
                                <h2 style="color: #2d5016; margin: 0 0 15px 0; font-size: 20px;">📅 Período Solicitado</h2>
                                <table width="100%" cellpadding="0" cellspacing="0">
                                    <tr>
                                        <td style="padding: 8px 0; color: #2c2c2c;">
                                            <strong>Check-in:</strong> $dataCheckin
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 8px 0; color: #2c2c2c;">
                                            <strong>Check-out:</strong> $dataCheckout
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 8px 0; color: #2c2c2c;">
                                            <strong>Noites:</strong> $numNoites
                                        </td>
                                    </tr>
                                </table>
                            </div>
                            
                            <!-- Hóspedes -->
                            <div style="background-color: #f5f1e8; border-left: 4px solid #4a7c2a; padding: 20px; margin: 0 0 25px 0; border-radius: 5px;">
                                <h2 style="color: #2d5016; margin: 0 0 15px 0; font-size: 20px;">👥 Hóspedes</h2>
                                <table width="100%" cellpadding="0" cellspacing="0">
                                    <tr>
                                        <td style="padding: 8px 0; color: #2c2c2c;">
                                            <strong>Adultos:</strong> $numAdultos
                                        </td>
                                    </tr>
HTML;
    
    if ($numCriancas > 0) {
        $html .= <<<HTML
                                    <tr>
                                        <td style="padding: 8px 0; color: #2c2c2c;">
                                            <strong>Crianças:</strong> $numCriancas
                                        </td>
                                    </tr>
HTML;
    }
    
    $html .= <<<HTML
                                </table>
                            </div>
                            
                            <!-- Disponibilidade -->
HTML;
    
    if ($totalChales > 0) {
        $html .= <<<HTML
                            <div style="background-color: #d4edda; border-left: 4px solid #28a745; padding: 20px; margin: 0 0 25px 0; border-radius: 5px;">
                                <h2 style="color: #155724; margin: 0 0 15px 0; font-size: 20px;">✅ Disponibilidade</h2>
                                <p style="color: #155724; margin: 0 0 10px 0;">
                                    <strong>$totalChales chalé(s) disponível(is)</strong> para o período solicitado.
                                </p>
HTML;
        
        if (!empty($chalesDisponiveis)) {
            $html .= '<ul style="margin: 10px 0 0 0; padding-left: 20px; color: #155724;">';
            foreach ($chalesDisponiveis as $chale) {
                $nomeChale = htmlspecialchars($chale['nome'] ?? 'Chalé');
                $precoDiaria = isset($chale['preco_diaria']) ? 'R$ ' . number_format($chale['preco_diaria'], 2, ',', '.') : '';
                $html .= "<li style='margin: 5px 0;'>$nomeChale $precoDiaria</li>";
            }
            $html .= '</ul>';
        }
        
        $html .= '</div>';
    } else {
        $html .= <<<HTML
                            <div style="background-color: #fff3cd; border-left: 4px solid #ff9800; padding: 20px; margin: 0 0 25px 0; border-radius: 5px;">
                                <h2 style="color: #856404; margin: 0 0 15px 0; font-size: 20px;">⚠️ Disponibilidade</h2>
                                <p style="color: #856404; margin: 0;">
                                    Não foi possível verificar disponibilidade automaticamente. Verifique manualmente.
                                </p>
                            </div>
HTML;
    }
    
    // Preço estimado
    if ($precoInfo && isset($precoInfo['valor_total'])) {
        $valorTotal = 'R$ ' . number_format($precoInfo['valor_total'], 2, ',', '.');
        $valorMedio = 'R$ ' . number_format($precoInfo['valor_medio_diaria'], 2, ',', '.');
        
        $html .= <<<HTML
                            <div style="background-color: #e7f3ff; border-left: 4px solid #1976d2; padding: 20px; margin: 0 0 25px 0; border-radius: 5px;">
                                <h2 style="color: #0d47a1; margin: 0 0 15px 0; font-size: 20px;">💰 Preço Estimado</h2>
                                <table width="100%" cellpadding="0" cellspacing="0">
                                    <tr>
                                        <td style="padding: 8px 0; color: #2c2c2c;">
                                            <strong>Valor Total:</strong> $valorTotal
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 8px 0; color: #2c2c2c;">
                                            <strong>Média por Noite:</strong> $valorMedio
                                        </td>
                                    </tr>
                                </table>
                            </div>
HTML;
    }
    
    // Dados de rastreamento (se houver)
    if ($urlOrigem || $utmSource || $utmMedium || $utmCampaign) {
        $html .= <<<HTML
                            <div style="background-color: #f5f5f5; border-left: 4px solid #757575; padding: 15px; margin: 0 0 25px 0; border-radius: 5px;">
                                <h3 style="color: #424242; margin: 0 0 10px 0; font-size: 16px;">📊 Dados de Rastreamento</h3>
                                <table width="100%" cellpadding="0" cellspacing="0" style="font-size: 12px; color: #616161;">
HTML;
        
        if ($urlOrigem) {
            $html .= <<<HTML
                                    <tr>
                                        <td style="padding: 4px 0;"><strong>URL Origem:</strong></td>
                                        <td style="padding: 4px 0;">$urlOrigem</td>
                                    </tr>
HTML;
        }
        
        if ($utmSource) {
            $html .= <<<HTML
                                    <tr>
                                        <td style="padding: 4px 0;"><strong>UTM Source:</strong></td>
                                        <td style="padding: 4px 0;">$utmSource</td>
                                    </tr>
HTML;
        }
        
        if ($utmMedium) {
            $html .= <<<HTML
                                    <tr>
                                        <td style="padding: 4px 0;"><strong>UTM Medium:</strong></td>
                                        <td style="padding: 4px 0;">$utmMedium</td>
                                    </tr>
HTML;
        }
        
        if ($utmCampaign) {
            $html .= <<<HTML
                                    <tr>
                                        <td style="padding: 4px 0;"><strong>UTM Campaign:</strong></td>
                                        <td style="padding: 4px 0;">$utmCampaign</td>
                                    </tr>
HTML;
        }
        
        $html .= <<<HTML
                                </table>
                            </div>
HTML;
    }
    
    $html .= <<<HTML
                            
                            <!-- Ação -->
                            <div style="background-color: #fff3cd; border-left: 4px solid #ff9800; padding: 15px; margin: 0 0 25px 0; border-radius: 5px;">
                                <p style="color: #856404; margin: 0; font-size: 14px;">
                                    💡 <strong>Próximo passo:</strong> Entre em contato com o interessado para confirmar a disponibilidade e prosseguir com a reserva.
                                </p>
                            </div>
                            
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f5f1e8; padding: 20px 40px; text-align: center; border-top: 1px solid #e0e0e0;">
                            <p style="color: #555555; margin: 0; font-size: 12px;">
                                Este é um e-mail automático do sistema Vila d'Ajuda.<br>
                                Não responda este e-mail.
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


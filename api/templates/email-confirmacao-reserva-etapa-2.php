<?php
/**
 * Template de e-mail - Confirmação da Reserva (Etapa 2)
 */

function gerarEmailConfirmacaoReservaEtapa2($dados) {
    $nomeCompleto = htmlspecialchars($dados['nome_completo'] ?? '');
    $cpf = htmlspecialchars($dados['cpf'] ?? '');
    $dadosPagamento = nl2br(htmlspecialchars($dados['dados_pagamento'] ?? ''));
    $endereco = trim($dados['endereco'] ?? '');
    $placaCarro = trim($dados['placa_carro'] ?? '');
    $urlOrigem = trim($dados['url_origem'] ?? '');
    $utmSource = trim($dados['utm_source'] ?? '');
    $utmMedium = trim($dados['utm_medium'] ?? '');
    $utmCampaign = trim($dados['utm_campaign'] ?? '');
    $origemFormulario = htmlspecialchars($dados['origem_formulario'] ?? 'confirmacao_reserva_etapa_2');
    $dataEnvio = htmlspecialchars($dados['data_envio'] ?? date('d/m/Y H:i:s'));

    $html = <<<HTML
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Confirmação da Reserva - Etapa 2</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px 0;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                    <tr>
                        <td style="background: linear-gradient(135deg, #8b6f47 0%, #c4a574 100%); padding: 30px 40px; text-align: center;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600;">Etapa 2 recebida</h1>
                            <p style="color: rgba(255,255,255,0.92); margin: 10px 0 0 0; font-size: 14px;">Confirmação da reserva enviada em $dataEnvio</p>
                        </td>
                    </tr>

                    <tr>
                        <td style="padding: 30px 40px;">
                            <div style="background-color: #fff8ef; border-left: 4px solid #8b6f47; padding: 15px; margin: 0 0 25px 0; border-radius: 6px;">
                                <p style="color: #6b4f2b; margin: 0; font-size: 14px;">
                                    <strong>Origem:</strong> $origemFormulario
                                </p>
                            </div>

                            <h3 style="color: #2d5016; margin: 0 0 15px 0; font-size: 18px;">Dados do hóspede</h3>
                            <table width="100%" cellpadding="8" cellspacing="0" style="font-size: 14px; margin-bottom: 25px;">
                                <tr>
                                    <td style="color: #666; padding: 8px 0;"><strong>Nome completo:</strong></td>
                                    <td style="color: #333; padding: 8px 0; text-align: right;">$nomeCompleto</td>
                                </tr>
                                <tr>
                                    <td style="color: #666; padding: 8px 0;"><strong>CPF:</strong></td>
                                    <td style="color: #333; padding: 8px 0; text-align: right;">$cpf</td>
                                </tr>
HTML;

    if ($placaCarro !== '') {
        $placaCarro = htmlspecialchars($placaCarro);
        $html .= <<<HTML
                                <tr>
                                    <td style="color: #666; padding: 8px 0;"><strong>Placa do carro:</strong></td>
                                    <td style="color: #333; padding: 8px 0; text-align: right;">$placaCarro</td>
                                </tr>
HTML;
    }

    $html .= <<<HTML
                            </table>

                            <h3 style="color: #2d5016; margin: 0 0 15px 0; font-size: 18px;">Pagamento</h3>
                            <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; border-left: 4px solid #2d5016; margin-bottom: 25px; color: #333; font-size: 14px; line-height: 1.6;">
                                $dadosPagamento
                            </div>
HTML;

    if ($endereco !== '') {
        $endereco = nl2br(htmlspecialchars($endereco));
        $html .= <<<HTML
                            <h3 style="color: #2d5016; margin: 0 0 15px 0; font-size: 18px;">Endereço informado</h3>
                            <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; border-left: 4px solid #8b6f47; margin-bottom: 25px; color: #333; font-size: 14px; line-height: 1.6;">
                                $endereco
                            </div>
HTML;
    }

    $html .= <<<HTML
                            <h3 style="color: #2d5016; margin: 0 0 15px 0; font-size: 18px;">Termo de ciência</h3>
                            <div style="background-color: #eefbf2; border-left: 4px solid #1f6b37; padding: 15px; border-radius: 8px; margin-bottom: 25px;">
                                <p style="color: #1f6b37; margin: 0; font-size: 14px;">
                                    O hóspede declarou estar ciente das regras da hospedagem.
                                </p>
                            </div>
HTML;

    if ($urlOrigem || $utmSource || $utmMedium || $utmCampaign) {
        $urlOrigem = htmlspecialchars($urlOrigem);
        $utmSource = htmlspecialchars($utmSource);
        $utmMedium = htmlspecialchars($utmMedium);
        $utmCampaign = htmlspecialchars($utmCampaign);

        $html .= <<<HTML
                            <h3 style="color: #2d5016; margin: 0 0 15px 0; font-size: 18px;">Rastreamento</h3>
                            <table width="100%" cellpadding="8" cellspacing="0" style="font-size: 13px; margin-bottom: 10px;">
HTML;

        if ($urlOrigem) {
            $html .= <<<HTML
                                <tr>
                                    <td style="color: #666; padding: 8px 0;"><strong>URL:</strong></td>
                                    <td style="color: #333; padding: 8px 0; text-align: right;">$urlOrigem</td>
                                </tr>
HTML;
        }

        if ($utmSource) {
            $html .= <<<HTML
                                <tr>
                                    <td style="color: #666; padding: 8px 0;"><strong>UTM Source:</strong></td>
                                    <td style="color: #333; padding: 8px 0; text-align: right;">$utmSource</td>
                                </tr>
HTML;
        }

        if ($utmMedium) {
            $html .= <<<HTML
                                <tr>
                                    <td style="color: #666; padding: 8px 0;"><strong>UTM Medium:</strong></td>
                                    <td style="color: #333; padding: 8px 0; text-align: right;">$utmMedium</td>
                                </tr>
HTML;
        }

        if ($utmCampaign) {
            $html .= <<<HTML
                                <tr>
                                    <td style="color: #666; padding: 8px 0;"><strong>UTM Campaign:</strong></td>
                                    <td style="color: #333; padding: 8px 0; text-align: right;">$utmCampaign</td>
                                </tr>
HTML;
        }

        $html .= <<<HTML
                            </table>
HTML;
    }

    $html .= <<<HTML
                            <div style="margin-top: 30px; text-align: center;">
                                <a href="https://www.viladajuda.com.br/confirmacao-reserva" style="display: inline-block; padding: 12px 30px; background-color: #2d5016; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600;">
                                    Abrir página da Etapa 2
                                </a>
                            </div>
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

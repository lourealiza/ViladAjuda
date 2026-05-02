<?php
/**
 * Controller da Etapa 2 - confirmação da reserva
 * Mantém os dados sensíveis fora da tabela de reservas atual e envia apenas para o admin por e-mail.
 */

class ConfirmacaoReservaController {
    private $db;

    public function __construct($db) {
        $this->db = $db;
    }

    public function criar() {
        $json = file_get_contents('php://input');
        $dados = json_decode($json, true);

        if (!$dados) {
            responderErro('Dados invÃ¡lidos', 400);
        }

        $camposObrigatorios = ['nome_completo', 'cpf', 'dados_pagamento', 'aceite_regras'];

        foreach ($camposObrigatorios as $campo) {
            if (!isset($dados[$campo]) || $dados[$campo] === '' || $dados[$campo] === null) {
                responderErro("Campo obrigatÃ³rio ausente: $campo", 400);
            }
        }

        if (!$this->aceiteValido($dados['aceite_regras'])) {
            responderErro('Ã‰ necessÃ¡rio aceitar o termo de ciÃªncia das regras da hospedagem', 400);
        }

        $cpfNormalizado = $this->normalizarCPF($dados['cpf']);
        if (!$this->validarCPF($cpfNormalizado)) {
            responderErro('CPF invÃ¡lido', 400);
        }

        if ($this->possuiDadosDeCartao($dados['dados_pagamento'])) {
            responderErro('NÃ£o envie nÃºmero completo de cartÃ£o, CVV ou senha no campo de pagamento', 400);
        }

        $dadosEmail = [
            'nome_completo' => trim($dados['nome_completo']),
            'cpf' => $this->formatarCPF($cpfNormalizado),
            'dados_pagamento' => trim($dados['dados_pagamento']),
            'endereco' => trim($dados['endereco'] ?? ''),
            'placa_carro' => strtoupper(trim($dados['placa_carro'] ?? '')),
            'aceite_regras' => true,
            'origem_formulario' => $dados['origem_formulario'] ?? 'confirmacao_reserva_etapa_2',
            'url_origem' => $dados['url_origem'] ?? '',
            'utm_source' => $dados['utm_source'] ?? '',
            'utm_medium' => $dados['utm_medium'] ?? '',
            'utm_campaign' => $dados['utm_campaign'] ?? '',
            'data_envio' => date('d/m/Y H:i:s')
        ];

        try {
            $this->enviarEmailNotificacao($dadosEmail);
        } catch (Exception $e) {
            error_log('Erro ao enviar confirmaÃ§Ã£o da reserva por e-mail: ' . $e->getMessage());
            responderErro('NÃ£o foi possÃ­vel concluir o envio da confirmaÃ§Ã£o no momento', 500);
        }

        responderJSON([
            'mensagem' => 'ConfirmaÃ§Ã£o da reserva recebida com sucesso',
            'tipo' => 'confirmacao_reserva',
            'status' => 'recebida'
        ], 201);
    }

    private function enviarEmailNotificacao($dadosEmail) {
        require_once __DIR__ . '/../config/email.php';
        require_once __DIR__ . '/../templates/email-confirmacao-reserva-etapa-2.php';

        $assunto = 'ConfirmaÃ§Ã£o de Reserva - Etapa 2 - ' . $dadosEmail['nome_completo'];
        $htmlEmail = gerarEmailConfirmacaoReservaEtapa2($dadosEmail);

        $sucesso = enviarEmail(EMAIL_ADMIN, $assunto, $htmlEmail);
        if (!$sucesso) {
            enviarEmailSMTP(EMAIL_ADMIN, $assunto, $htmlEmail);
        }
    }

    private function aceiteValido($valor) {
        return $valor === true || $valor === 1 || $valor === '1' || $valor === 'true' || $valor === 'on';
    }

    private function normalizarCPF($cpf) {
        return preg_replace('/\D/', '', (string)$cpf);
    }

    private function formatarCPF($cpf) {
        if (strlen($cpf) !== 11) {
            return $cpf;
        }

        return substr($cpf, 0, 3) . '.' . substr($cpf, 3, 3) . '.' . substr($cpf, 6, 3) . '-' . substr($cpf, 9, 2);
    }

    private function validarCPF($cpf) {
        if (strlen($cpf) !== 11 || preg_match('/^(\d)\1{10}$/', $cpf)) {
            return false;
        }

        for ($t = 9; $t < 11; $t++) {
            $soma = 0;
            for ($c = 0; $c < $t; $c++) {
                $soma += (int)$cpf[$c] * (($t + 1) - $c);
            }

            $digito = ((10 * $soma) % 11) % 10;
            if ((int)$cpf[$c] !== $digito) {
                return false;
            }
        }

        return true;
    }

    private function possuiDadosDeCartao($texto) {
        $texto = (string)$texto;

        if (preg_match('/\b(cvv|cvc|senha do cartao|codigo de seguranca)\b/i', $texto)) {
            return true;
        }

        return preg_match('/(?:^|[^\d])(?:\d[ -]?){13,19}(?:[^\d]|$)/', $texto) === 1;
    }
}
?>

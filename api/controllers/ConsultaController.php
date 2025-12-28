<?php
/**
 * Controller de Consultas de Disponibilidade
 * Recebe consultas e envia email de notificação
 */

// Incluir funções auxiliares
require_once __DIR__ . '/../config/database.php';

class ConsultaController {
    private $db;
    
    public function __construct($db) {
        $this->db = $db;
    }
    
    /**
     * Recebe uma consulta de disponibilidade ou reserva completa e envia email
     * Aceita tanto consultas simples quanto reservas completas
     */
    public function criar() {
        // Obter dados do POST
        $json = file_get_contents('php://input');
        $dados = json_decode($json, true);
        
        if (!$dados) {
            responderErro('Dados inválidos', 400);
        }
        
        // Validar campos obrigatórios
        $camposObrigatorios = ['data_checkin', 'data_checkout'];
        
        foreach ($camposObrigatorios as $campo) {
            if (empty($dados[$campo])) {
                responderErro("Campo obrigatório ausente: $campo", 400);
            }
        }
        
        // Preparar dados
        $dataCheckin = $dados['data_checkin'];
        $dataCheckout = $dados['data_checkout'];
        $numAdultos = $dados['num_adultos'] ?? $dados['adultos'] ?? 2;
        $numCriancas = $dados['num_criancas'] ?? $dados['criancas'] ?? 0;
        
        // Verificar se é uma solicitação de reserva completa (tem nome, email, telefone)
        $ehSolicitacaoReserva = !empty($dados['nome_hospede']) && !empty($dados['email_hospede']) && !empty($dados['telefone_hospede']);
        
        // Calcular valor estimado (se for solicitação de reserva)
        $valorTotal = null;
        if ($ehSolicitacaoReserva) {
            try {
                require_once __DIR__ . '/../config/temporadas.php';
                $calculoEstadia = calcularValorEstadia($dataCheckin, $dataCheckout, $numAdultos);
                $valorTotal = $calculoEstadia['valor_total'];
            } catch (Exception $e) {
                // Se não conseguir calcular preço, continua sem ele
            }
        }
        
        // NÃO criar reserva no banco - apenas enviar email de notificação
        // A reserva será criada manualmente pelo admin após aprovação
        
        // Verificar disponibilidade
        try {
            require_once __DIR__ . '/ReservaController.php';
            $reservaController = new ReservaController($this->db);
            
            // Buscar chalés disponíveis diretamente
            // Simular parâmetros GET temporariamente
            $getBackup = $_GET;
            $_GET['data_checkin'] = $dataCheckin;
            $_GET['data_checkout'] = $dataCheckout;
            $_GET['num_adultos'] = $numAdultos;
            
            // Capturar output do método
            ob_start();
            try {
                $reservaController->buscarChalesDisponiveis();
            } catch (Exception $e) {
                ob_end_clean();
                throw $e;
            }
            $output = ob_get_clean();
            
            // Restaurar $_GET original
            $_GET = $getBackup;
            
            // Decodificar JSON retornado
            $resultado = json_decode($output, true);
            
            if (!$resultado || isset($resultado['erro'])) {
                throw new Exception('Erro ao verificar disponibilidade');
            }
            
            // Calcular preço se disponível
            $precoInfo = null;
            try {
                require_once __DIR__ . '/../config/temporadas.php';
                $calculoEstadia = calcularValorEstadia($dataCheckin, $dataCheckout, $numAdultos);
                $precoInfo = [
                    'valor_total' => $calculoEstadia['valor_total'],
                    'numero_noites' => $calculoEstadia['numero_noites'],
                    'valor_medio_diaria' => $calculoEstadia['valor_medio_diaria']
                ];
            } catch (Exception $e) {
                // Se não conseguir calcular preço, continua sem ele
            }
            
            // Enviar email de notificação
            $this->enviarEmailNotificacao($dados, $resultado, $precoInfo);
            
            responderJSON([
                'mensagem' => $ehSolicitacaoReserva 
                    ? 'Solicitação de reserva recebida! Entraremos em contato em breve para confirmar.' 
                    : 'Consulta recebida com sucesso! Entraremos em contato em breve.',
                'disponibilidade' => $resultado,
                'preco' => $precoInfo ?: ($valorTotal ? ['valor_total' => $valorTotal] : null),
                'tipo' => $ehSolicitacaoReserva ? 'solicitacao_reserva' : 'consulta',
                'status' => 'pendente'
            ], 201);
            
        } catch (Exception $e) {
            // Mesmo com erro na verificação, enviar email
            $this->enviarEmailNotificacao($dados, null, null);
            
            responderJSON([
                'mensagem' => $ehSolicitacaoReserva 
                    ? 'Solicitação de reserva recebida! Entraremos em contato em breve para confirmar.' 
                    : 'Consulta recebida! Entraremos em contato em breve.',
                'aviso' => 'Não foi possível verificar disponibilidade automaticamente',
                'preco' => $valorTotal ? ['valor_total' => $valorTotal] : null,
                'tipo' => $ehSolicitacaoReserva ? 'solicitacao_reserva' : 'consulta',
                'status' => 'pendente'
            ], 201);
        }
    }
    
    /**
     * Envia email de notificação sobre a consulta
     */
    private function enviarEmailNotificacao($dados, $disponibilidade = null, $precoInfo = null) {
        require_once __DIR__ . '/../config/email.php';
        require_once __DIR__ . '/../templates/email-consulta-disponibilidade.php';
        
        // Preparar dados para o template
        $dadosEmail = [
            'data_checkin' => $dados['data_checkin'],
            'data_checkout' => $dados['data_checkout'],
            'num_adultos' => $dados['num_adultos'] ?? $dados['adultos'] ?? 2,
            'num_criancas' => $dados['num_criancas'] ?? $dados['criancas'] ?? 0,
            'disponibilidade' => $disponibilidade,
            'preco_info' => $precoInfo,
            'url_origem' => $dados['url_origem'] ?? '',
            'utm_source' => $dados['utm_source'] ?? '',
            'utm_medium' => $dados['utm_medium'] ?? '',
            'utm_campaign' => $dados['utm_campaign'] ?? '',
            // Dados de reserva completa (se houver)
            'nome_hospede' => $dados['nome_hospede'] ?? '',
            'email_hospede' => $dados['email_hospede'] ?? '',
            'telefone_hospede' => $dados['telefone_hospede'] ?? '',
            'mensagem' => $dados['mensagem'] ?? '',
            'chale_id' => $dados['chale_id'] ?? null
        ];
        
        // Gerar HTML do email
        $htmlEmail = gerarEmailConsultaDisponibilidade($dadosEmail);
        
        // Assunto (ajustar conforme tipo)
        $ehSolicitacaoReserva = !empty($dados['nome_hospede']) && !empty($dados['email_hospede']) && !empty($dados['telefone_hospede']);
        $assunto = $ehSolicitacaoReserva 
            ? "📅 Nova Solicitação de Reserva Pendente - Vila d'Ajuda" 
            : "📅 Nova Consulta de Disponibilidade - Vila d'Ajuda";
        
        // Enviar email
        $sucesso = enviarEmail(EMAIL_ADMIN, $assunto, $htmlEmail);
        
        if (!$sucesso) {
            // Tentar com SMTP se mail() falhar
            enviarEmailSMTP(EMAIL_ADMIN, $assunto, $htmlEmail);
        }
    }
}
?>


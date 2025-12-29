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
        // Log para debug - verificar se está recebendo requisição
        error_log('📥 ConsultaController::criar() - Requisição recebida');
        error_log('📥 Método: ' . $_SERVER['REQUEST_METHOD']);
        error_log('📥 Content-Type: ' . ($_SERVER['CONTENT_TYPE'] ?? 'não informado'));
        
        // Obter dados do POST
        $json = file_get_contents('php://input');
        error_log('📥 JSON recebido (primeiros 500 chars): ' . substr($json, 0, 500));
        
        $dados = json_decode($json, true);
        
        if (!$dados) {
            error_log('❌ Erro: Dados JSON inválidos ou vazios');
            error_log('❌ JSON raw: ' . $json);
            responderErro('Dados inválidos', 400);
        }
        
        error_log('✅ Dados decodificados com sucesso: ' . json_encode($dados));
        
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
        
        // Se for solicitação de reserva completa, salvar no banco de dados
        $reservaId = null;
        if ($ehSolicitacaoReserva) {
            try {
                error_log('💾 Tentando salvar reserva no banco de dados...');
                
                // Calcular valor total se ainda não foi calculado
                if ($valorTotal === null) {
                    require_once __DIR__ . '/../config/temporadas.php';
                    $calculoEstadia = calcularValorEstadia($dataCheckin, $dataCheckout, $numAdultos);
                    $valorTotal = $calculoEstadia['valor_total'];
                }
                
                // Calcular número de diárias
                $checkin = new DateTime($dataCheckin);
                $checkout = new DateTime($dataCheckout);
                $numDiarias = $checkin->diff($checkout)->days;
                
                // Preparar dados para inserção
                $chaleId = !empty($dados['chale_id']) ? (int)$dados['chale_id'] : null;
                $cidadeHospede = $dados['cidade_hospede'] ?? null;
                $mensagem = $dados['mensagem'] ?? null;
                
                error_log('💾 Dados da reserva: ' . json_encode([
                    'chale_id' => $chaleId,
                    'nome_hospede' => $dados['nome_hospede'],
                    'email_hospede' => $dados['email_hospede'],
                    'data_checkin' => $dataCheckin,
                    'data_checkout' => $dataCheckout,
                    'num_adultos' => $numAdultos,
                    'valor_total' => $valorTotal
                ]));
                
                // Inserir reserva no banco de dados
                // Status 'pendente' para aparecer no painel admin
                // Usar SQL diferente dependendo se chale_id é null ou não
                if ($chaleId) {
                    $sqlInserir = "
                        INSERT INTO reservas (
                            chale_id, nome_hospede, email_hospede, telefone_hospede,
                            data_checkin, data_checkout, num_adultos, num_criancas,
                            valor_total, cidade_hospede, mensagem, status
                        ) VALUES (
                            ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pendente'
                        )
                    ";
                    $stmt = $this->db->prepare($sqlInserir);
                    
                    if ($stmt === false) {
                        error_log('❌ Erro ao preparar SQL: ' . $this->db->error);
                        throw new Exception('Erro ao preparar SQL: ' . $this->db->error);
                    }
                    
                    $stmt->bind_param(
                        'isssssiiiss',
                        $chaleId,
                        $dados['nome_hospede'],
                        $dados['email_hospede'],
                        $dados['telefone_hospede'],
                        $dataCheckin,
                        $dataCheckout,
                        $numAdultos,
                        $numCriancas,
                        $valorTotal,
                        $cidadeHospede,
                        $mensagem
                    );
                } else {
                    // Se chale_id for null, não incluir no INSERT
                    $sqlInserir = "
                        INSERT INTO reservas (
                            nome_hospede, email_hospede, telefone_hospede,
                            data_checkin, data_checkout, num_adultos, num_criancas,
                            valor_total, cidade_hospede, mensagem, status
                        ) VALUES (
                            ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pendente'
                        )
                    ";
                    $stmt = $this->db->prepare($sqlInserir);
                    
                    if ($stmt === false) {
                        error_log('❌ Erro ao preparar SQL: ' . $this->db->error);
                        throw new Exception('Erro ao preparar SQL: ' . $this->db->error);
                    }
                    
                    $stmt->bind_param(
                        'sssssiiiss',
                        $dados['nome_hospede'],
                        $dados['email_hospede'],
                        $dados['telefone_hospede'],
                        $dataCheckin,
                        $dataCheckout,
                        $numAdultos,
                        $numCriancas,
                        $valorTotal,
                        $cidadeHospede,
                        $mensagem
                    );
                }
                
                if (!$stmt->execute()) {
                    error_log('❌ Erro ao executar SQL: ' . $stmt->error);
                    throw new Exception('Erro ao criar reserva: ' . $stmt->error);
                }
                
                $reservaId = $stmt->insert_id;
                error_log('✅ Reserva salva no banco com ID: ' . $reservaId);
                
            } catch (Exception $e) {
                error_log('⚠️ Erro ao salvar reserva no banco: ' . $e->getMessage());
                // Continuar mesmo se falhar - pelo menos enviar email
            }
        }
        
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
            error_log('📧 Tentando enviar email de notificação...');
            try {
                $this->enviarEmailNotificacao($dados, $resultado, $precoInfo);
                error_log('✅ Email enviado com sucesso');
            } catch (Exception $e) {
                error_log('⚠️ Erro ao enviar email: ' . $e->getMessage());
                // Continuar mesmo se o email falhar
            }
            
            error_log('✅ Preparando resposta JSON...');
            $resposta = [
                'mensagem' => $ehSolicitacaoReserva 
                    ? 'Solicitação de reserva recebida! Entraremos em contato em breve para confirmar.' 
                    : 'Consulta recebida com sucesso! Entraremos em contato em breve.',
                'disponibilidade' => $resultado,
                'preco' => $precoInfo ?: ($valorTotal ? ['valor_total' => $valorTotal] : null),
                'tipo' => $ehSolicitacaoReserva ? 'solicitacao_reserva' : 'consulta',
                'status' => 'pendente'
            ];
            
            // Adicionar ID da reserva se foi criada
            if ($reservaId) {
                $resposta['reserva_id'] = $reservaId;
                $resposta['mensagem'] = 'Solicitação de reserva enviada com sucesso! Aguardando aprovação. Entraremos em contato em breve.';
            }
            
            error_log('✅ Resposta preparada: ' . json_encode($resposta));
            
            responderJSON($resposta, 201);
            
        } catch (Exception $e) {
            error_log('⚠️ Erro na verificação de disponibilidade: ' . $e->getMessage());
            // Mesmo com erro na verificação, enviar email
            try {
                $this->enviarEmailNotificacao($dados, null, null);
            } catch (Exception $emailErro) {
                error_log('⚠️ Erro ao enviar email: ' . $emailErro->getMessage());
            }
            
            $respostaErro = [
                'mensagem' => $ehSolicitacaoReserva 
                    ? 'Solicitação de reserva recebida! Entraremos em contato em breve para confirmar.' 
                    : 'Consulta recebida! Entraremos em contato em breve.',
                'aviso' => 'Não foi possível verificar disponibilidade automaticamente',
                'preco' => $valorTotal ? ['valor_total' => $valorTotal] : null,
                'tipo' => $ehSolicitacaoReserva ? 'solicitacao_reserva' : 'consulta',
                'status' => 'pendente'
            ];
            
            // Adicionar ID da reserva se foi criada
            if ($reservaId) {
                $respostaErro['reserva_id'] = $reservaId;
            }
            
            responderJSON($respostaErro, 201);
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


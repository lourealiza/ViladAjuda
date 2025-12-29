<?php
/**
 * Controller de Reservas - CORRIGIDO para estrutura real da tabela
 */
class ReservaController {
    private $db;
    
    public function __construct($db) {
        $this->db = $db;
    }
    
    /**
     * Lista todas as reservas
     */
    public function listar() {
        // Ordenar por data de criação (se existir) ou data de checkin
        $sql = "
            SELECT r.*, c.nome as chale_nome
            FROM reservas r
            LEFT JOIN chales c ON r.chale_id = c.id
            ORDER BY COALESCE(r.criado_em, r.data_checkin) DESC, r.data_checkin DESC
        ";
        
        $reservas = executarQuery($this->db, $sql);
        
        if (isset($reservas['erro'])) {
            responderErro('Erro ao buscar reservas', 500, $reservas['erro']);
        }
        
        responderJSON([
            'total' => count($reservas),
            'reservas' => $reservas
        ]);
    }
    
    /**
     * Busca chalés disponíveis para um período
     */
    public function buscarChalesDisponiveis() {
        $dataCheckin = $_GET['data_checkin'] ?? null;
        $dataCheckout = $_GET['data_checkout'] ?? null;
        
        if (!$dataCheckin || !$dataCheckout) {
            responderErro('Parâmetros data_checkin e data_checkout são obrigatórios', 400);
        }
        
        // Buscar todos os chalés ativos
        $sqlChales = "SELECT * FROM chales WHERE ativo = 1 ORDER BY nome";
        $chales = executarQuery($this->db, $sqlChales);
        
        if (isset($chales['erro'])) {
            responderErro('Erro ao buscar chalés', 500, $chales['erro']);
        }
        
        $disponiveis = [];
        
        foreach ($chales as $chale) {
            // Verificar bloqueios
            $sqlBloqueios = "
                SELECT COUNT(*) as total FROM bloqueios 
                WHERE chale_id = ? 
                AND (
                    (data_inicio <= ? AND data_fim >= ?) OR
                    (data_inicio <= ? AND data_fim >= ?) OR
                    (data_inicio >= ? AND data_fim <= ?)
                )
            ";
            
            $bloqueios = executarQuery($this->db, $sqlBloqueios, 'issssss', [
                $chale['id'],
                $dataCheckin, $dataCheckin,
                $dataCheckout, $dataCheckout,
                $dataCheckin, $dataCheckout
            ]);
            
            if ($bloqueios[0]['total'] > 0) {
                continue;
            }
            
            // Verificar reservas
            $sqlReservas = "
                SELECT COUNT(*) as total FROM reservas 
                WHERE chale_id = ? 
                AND status = 'confirmada'
                AND (
                    (data_checkin <= ? AND data_checkout > ?) OR
                    (data_checkin < ? AND data_checkout >= ?) OR
                    (data_checkin >= ? AND data_checkout <= ?)
                )
            ";
            
            $reservas = executarQuery($this->db, $sqlReservas, 'issssss', [
                $chale['id'],
                $dataCheckin, $dataCheckin,
                $dataCheckout, $dataCheckout,
                $dataCheckin, $dataCheckout
            ]);
            
            if ($reservas[0]['total'] == 0) {
                // Processar amenidades e imagens (JSON)
                if ($chale['amenidades']) {
                    $chale['amenidades'] = json_decode($chale['amenidades'], true);
                }
                if ($chale['imagens']) {
                    $chale['imagens'] = json_decode($chale['imagens'], true);
                }
                
                // Calcular preço usando sistema de temporadas
                require_once __DIR__ . '/../config/temporadas.php';
                $numAdultos = $_GET['num_adultos'] ?? 2;
                $calculoEstadia = calcularValorEstadia($dataCheckin, $dataCheckout, $numAdultos);
                
                // Calcular preço dinâmico para a data de check-in (primeira noite)
                $temporadaCheckin = determinarTemporada($dataCheckin);
                
                // Obter preço base do chalé (do banco de dados)
                $precoBase = floatval($chale['preco_diaria'] ?? 350.00);
                
                // Usar multiplicador fixo de 2x
                $multiplicador = 2.0;
                
                // Calcular preço base para casal na temporada
                $precoBaseCasalCheckin = $precoBase * $multiplicador;
                
                // Calcular pessoas adicionais e preço final
                $pessoasAdicionais = max(0, $numAdultos - 2);
                $precoPorPessoaAdicional = 150.00;
                $precoDiariaAtual = $precoBaseCasalCheckin + ($pessoasAdicionais * $precoPorPessoaAdicional);
                
                // Adicionar informações de preço ao chalé
                $chale['preco_diaria_atual'] = round($precoDiariaAtual, 2); // Preço dinâmico para a data de check-in
                $chale['preco_base'] = $precoBase; // Preço base do chalé
                $chale['preco_diaria_media'] = $calculoEstadia['valor_medio_diaria'];
                $chale['preco_total'] = $calculoEstadia['valor_total'];
                $chale['numero_noites'] = $calculoEstadia['numero_noites'];
                $chale['num_adultos'] = $calculoEstadia['num_adultos'];
                $chale['preco_base_casal'] = $calculoEstadia['preco_base_casal'];
                $chale['pessoas_adicionais'] = $calculoEstadia['pessoas_adicionais'];
                $chale['preco_por_pessoa_adicional'] = $calculoEstadia['preco_por_pessoa_adicional'];
                $chale['detalhes_preco'] = $calculoEstadia['detalhes'];
                $chale['temporada'] = $temporadaCheckin['nome']; // Nome da temporada
                $chale['temporada_tipo'] = $temporadaCheckin['tipo']; // Tipo da temporada
                
                $disponiveis[] = $chale;
            }
        }
        
        responderJSON([
            'data_checkin' => $dataCheckin,
            'data_checkout' => $dataCheckout,
            'total' => count($disponiveis),
            'chales' => $disponiveis
        ]);
    }
    
    /**
     * Cria uma nova reserva - CORRIGIDO para campos que existem
     */
    public function criar() {
        // Obter dados do POST
        $json = file_get_contents('php://input');
        $dados = json_decode($json, true);
        
        if (!$dados) {
            responderErro('Dados inválidos', 400);
        }
        
        // Validar campos obrigatórios
        $camposObrigatorios = [
            'chale_id', 'nome_hospede', 'email_hospede', 'telefone_hospede',
            'data_checkin', 'data_checkout'
        ];
        
        foreach ($camposObrigatorios as $campo) {
            if (empty($dados[$campo])) {
                responderErro("Campo obrigatório ausente: $campo", 400);
            }
        }
        
        // Verificar disponibilidade
        $chaleId = $dados['chale_id'];
        $dataCheckin = $dados['data_checkin'];
        $dataCheckout = $dados['data_checkout'];
        
        $sqlVerificar = "
            SELECT COUNT(*) as total FROM reservas 
            WHERE chale_id = ? 
            AND status = 'confirmada'
            AND (
                (data_checkin <= ? AND data_checkout > ?) OR
                (data_checkin < ? AND data_checkout >= ?) OR
                (data_checkin >= ? AND data_checkout <= ?)
            )
        ";
        
        $verificacao = executarQuery($this->db, $sqlVerificar, 'issssss', [
            $chaleId,
            $dataCheckin, $dataCheckin,
            $dataCheckout, $dataCheckout,
            $dataCheckin, $dataCheckout
        ]);
        
        if ($verificacao[0]['total'] > 0) {
            responderErro('Chalé não disponível para este período', 409);
        }
        
        // Calcular número de diárias e valor
        $checkin = new DateTime($dataCheckin);
        $checkout = new DateTime($dataCheckout);
        $numDiarias = $checkin->diff($checkout)->days;
        
        if ($numDiarias <= 0) {
            responderErro('Data de checkout deve ser posterior à data de checkin', 400);
        }
        
        // Buscar preço do chalé (para referência, mas não será usado no cálculo)
        $sqlChale = "SELECT preco_diaria FROM chales WHERE id = ?";
        $chale = executarQuery($this->db, $sqlChale, 'i', [$chaleId]);
        
        if (empty($chale) || isset($chale['erro'])) {
            responderErro('Chalé não encontrado', 404);
        }
        
        // Calcular valor usando sistema de temporadas
        require_once __DIR__ . '/../config/temporadas.php';
        $numAdultos = $dados['num_adultos'] ?? 2;
        $calculoEstadia = calcularValorEstadia($dataCheckin, $dataCheckout, $numAdultos);
        $valorTotal = $calculoEstadia['valor_total'];
        
        // Preparar dados - APENAS campos que existem na tabela
        $numAdultos = $dados['num_adultos'] ?? 2;
        $numCriancas = $dados['num_criancas'] ?? 0;
        $cidadeHospede = $dados['cidade_hospede'] ?? null;
        $mensagem = $dados['mensagem'] ?? null;
        
        // Inserir reserva - APENAS com campos que existem
        // Status 'pendente' para aparecer no painel admin
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
            responderErro('Erro ao preparar SQL: ' . $this->db->error, 500);
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
        
        if (!$stmt->execute()) {
            responderErro('Erro ao criar reserva: ' . $stmt->error, 500);
        }
        
        $reservaId = $stmt->insert_id;
        
        // Buscar reserva criada e dados do chalé
        $sqlBuscar = "
            SELECT r.*, c.nome as chale_nome 
            FROM reservas r
            LEFT JOIN chales c ON r.chale_id = c.id
            WHERE r.id = ?
        ";
        $reserva = executarQuery($this->db, $sqlBuscar, 'i', [$reservaId]);
        
        // NÃO enviar email na criação - apenas notificar admin
        // Email será enviado apenas quando admin aprovar (status = 'confirmada')
        if (!empty($reserva)) {
            // Enviar apenas email de notificação para o admin
            $this->enviarEmailNotificacaoAdmin($reserva[0], $numDiarias);
        }
        
        responderJSON([
            'mensagem' => 'Solicitação de reserva enviada com sucesso! Aguardando aprovação. Entraremos em contato em breve.',
            'reserva' => $reserva[0]
        ], 201);
    }
    
    /**
     * Enviar apenas notificação para admin (sem email para hóspede)
     */
    private function enviarEmailNotificacaoAdmin($reserva, $numDiarias) {
        require_once __DIR__ . '/../config/email.php';
        require_once __DIR__ . '/../templates/email-nova-reserva-admin.php';
        
        $dadosEmail = [
            'reserva_id' => $reserva['id'],
            'nome_hospede' => $reserva['nome_hospede'],
            'email_hospede' => $reserva['email_hospede'],
            'telefone_hospede' => $reserva['telefone_hospede'],
            'chale_nome' => $reserva['chale_nome'] ?? 'Chalé',
            'data_checkin' => $reserva['data_checkin'],
            'data_checkout' => $reserva['data_checkout'],
            'num_diarias' => $numDiarias,
            'valor_total' => $reserva['valor_total'],
            'num_adultos' => $reserva['num_adultos'],
            'num_criancas' => $reserva['num_criancas'],
            'mensagem' => $reserva['mensagem'] ?? ''
        ];
        
        // E-mail apenas para o admin (notificação de nova solicitação)
        try {
            $htmlAdmin = gerarEmailNovaReservaAdmin($dadosEmail);
            enviarEmail(
                EMAIL_ADMIN,
                'Nova Solicitação de Reserva - Vila d\'Ajuda #' . $reserva['id'],
                $htmlAdmin
            );
        } catch (Exception $e) {
            error_log("Erro ao enviar e-mail para admin: " . $e->getMessage());
        }
    }
    
    /**
     * Enviar e-mails de confirmação (após aprovação do admin)
     */
    private function enviarEmailsReserva($reserva, $numDiarias) {
        require_once __DIR__ . '/../config/email.php';
        require_once __DIR__ . '/../templates/email-confirmacao-reserva.php';
        require_once __DIR__ . '/../templates/email-nova-reserva-admin.php';
        
        $dadosEmail = [
            'reserva_id' => $reserva['id'],
            'nome_hospede' => $reserva['nome_hospede'],
            'email_hospede' => $reserva['email_hospede'],
            'telefone_hospede' => $reserva['telefone_hospede'],
            'chale_nome' => $reserva['chale_nome'] ?? 'Chalé',
            'data_checkin' => $reserva['data_checkin'],
            'data_checkout' => $reserva['data_checkout'],
            'num_diarias' => $numDiarias,
            'valor_total' => $reserva['valor_total'],
            'num_adultos' => $reserva['num_adultos'],
            'num_criancas' => $reserva['num_criancas'],
            'mensagem' => $reserva['mensagem'] ?? ''
        ];
        
        // E-mail para o hóspede
        try {
            $htmlHospede = gerarEmailConfirmacaoReserva($dadosEmail);
            enviarEmail(
                $reserva['email_hospede'],
                'Confirmação de Reserva - Vila d\'Ajuda Chalés',
                $htmlHospede
            );
        } catch (Exception $e) {
            // Log do erro mas não falha a reserva
            error_log("Erro ao enviar e-mail para hóspede: " . $e->getMessage());
        }
        
        // E-mail para o admin
        try {
            $htmlAdmin = gerarEmailNovaReservaAdmin($dadosEmail);
            enviarEmail(
                EMAIL_ADMIN,
                'Nova Reserva Recebida - Vila d\'Ajuda #' . $reserva['id'],
                $htmlAdmin
            );
        } catch (Exception $e) {
            // Log do erro mas não falha a reserva
            error_log("Erro ao enviar e-mail para admin: " . $e->getMessage());
        }
    }
    
    /**
     * Atualizar status da reserva (aprovada pelo admin)
     */
    public function atualizarStatus($reservaId) {
        // Obter dados do PATCH
        $json = file_get_contents('php://input');
        $dados = json_decode($json, true);
        
        if (!$dados || !isset($dados['status'])) {
            responderErro('Status é obrigatório', 400);
        }
        
        $novoStatus = $dados['status'];
        
        // Validar status
        $statusValidos = ['solicitacao_recebida', 'aguardando_pagamento', 'confirmada', 'checkin_realizado', 'checkout_realizado', 'cancelada'];
        if (!in_array($novoStatus, $statusValidos)) {
            responderErro('Status inválido', 400);
        }
        
        // Buscar reserva atual
        $sqlBuscar = "
            SELECT r.*, c.nome as chale_nome 
            FROM reservas r
            LEFT JOIN chales c ON r.chale_id = c.id
            WHERE r.id = ?
        ";
        $reserva = executarQuery($this->db, $sqlBuscar, 'i', [$reservaId]);
        
        if (empty($reserva) || isset($reserva['erro'])) {
            responderErro('Reserva não encontrada', 404);
        }
        
        $reservaAtual = $reserva[0];
        $statusAnterior = $reservaAtual['status'];
        
        // Atualizar status
        $sqlAtualizar = "UPDATE reservas SET status = ? WHERE id = ?";
        $stmt = $this->db->prepare($sqlAtualizar);
        
        if ($stmt === false) {
            responderErro('Erro ao preparar SQL: ' . $this->db->error, 500);
        }
        
        $stmt->bind_param('si', $novoStatus, $reservaId);
        
        if (!$stmt->execute()) {
            responderErro('Erro ao atualizar status: ' . $stmt->error, 500);
        }
        
        // Se status mudou para 'confirmada', enviar email de confirmação para o hóspede
        if ($novoStatus === 'confirmada' && $statusAnterior !== 'confirmada') {
            $checkin = new DateTime($reservaAtual['data_checkin']);
            $checkout = new DateTime($reservaAtual['data_checkout']);
            $numDiarias = $checkin->diff($checkout)->days;
            
            // Buscar reserva atualizada
            $reservaAtualizada = executarQuery($this->db, $sqlBuscar, 'i', [$reservaId]);
            
            if (!empty($reservaAtualizada) && !isset($reservaAtualizada['erro'])) {
                // Enviar email de confirmação para o hóspede
                $this->enviarEmailsReserva($reservaAtualizada[0], $numDiarias);
            }
        }
        
        // Buscar reserva atualizada para retornar
        $reservaAtualizada = executarQuery($this->db, $sqlBuscar, 'i', [$reservaId]);
        
        responderJSON([
            'mensagem' => 'Status da reserva atualizado com sucesso',
            'reserva' => $reservaAtualizada[0]
        ]);
    }
    
    /**
     * Calcula o preço de uma reserva sem criá-la
     */
    public function calcularPreco() {
        error_log('💰 calcularPreco() - Requisição recebida');
        error_log('💰 Parâmetros: ' . json_encode($_GET));
        
        $dataCheckin = $_GET['data_checkin'] ?? null;
        $dataCheckout = $_GET['data_checkout'] ?? null;
        $numAdultos = isset($_GET['num_adultos']) ? (int)$_GET['num_adultos'] : 2;
        
        if (!$dataCheckin || !$dataCheckout) {
            error_log('❌ Erro: Parâmetros obrigatórios ausentes');
            responderErro('Parâmetros data_checkin e data_checkout são obrigatórios', 400);
        }
        
        // Validar número de adultos (mínimo 1, máximo 4)
        $numAdultos = max(1, min(4, $numAdultos));
        
        // Validar datas
        $checkin = new DateTime($dataCheckin);
        $checkout = new DateTime($dataCheckout);
        
        if ($checkout <= $checkin) {
            error_log('❌ Erro: Data checkout <= checkin');
            responderErro('Data de checkout deve ser posterior à data de checkin', 400);
        }
        
        // Calcular valor usando sistema de temporadas
        require_once __DIR__ . '/../config/temporadas.php';
        $calculoEstadia = calcularValorEstadia($dataCheckin, $dataCheckout, $numAdultos);
        
        error_log('✅ Cálculo realizado: ' . json_encode($calculoEstadia));
        
        responderJSON([
            'data_checkin' => $dataCheckin,
            'data_checkout' => $dataCheckout,
            'num_adultos' => $numAdultos,
            'numero_noites' => $calculoEstadia['numero_noites'],
            'valor_total' => $calculoEstadia['valor_total'],
            'valor_medio_diaria' => $calculoEstadia['valor_medio_diaria'],
            'preco_base_casal' => $calculoEstadia['preco_base_casal'],
            'pessoas_adicionais' => $calculoEstadia['pessoas_adicionais'],
            'preco_por_pessoa_adicional' => $calculoEstadia['preco_por_pessoa_adicional'],
            'detalhes' => $calculoEstadia['detalhes']
        ]);
    }
    
    /**
     * Deleta uma reserva por ID
     */
    public function deletar($id) {
        // Verificar se a reserva existe
        $sqlVerificar = "
            SELECT r.*, c.nome as chale_nome 
            FROM reservas r
            LEFT JOIN chales c ON r.chale_id = c.id
            WHERE r.id = ?
        ";
        $reserva = executarQuery($this->db, $sqlVerificar, 'i', [$id]);
        
        if (isset($reserva['erro'])) {
            responderErro('Erro ao buscar reserva', 500, $reserva['erro']);
        }
        
        if (empty($reserva)) {
            responderErro('Reserva não encontrada', 404);
        }
        
        // Deletar a reserva
        $sql = "DELETE FROM reservas WHERE id = ?";
        $stmt = $this->db->prepare($sql);
        
        if ($stmt === false) {
            responderErro('Erro ao preparar SQL: ' . $this->db->error, 500);
        }
        
        $stmt->bind_param('i', $id);
        
        if (!$stmt->execute()) {
            responderErro('Erro ao deletar reserva: ' . $stmt->error, 500);
        }
        
        $stmt->close();
        
        responderJSON([
            'mensagem' => 'Reserva deletada com sucesso'
        ]);
    }
}
?>

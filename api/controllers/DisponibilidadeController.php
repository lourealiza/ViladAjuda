<?php
/**
 * Controller de Disponibilidade
 */
class DisponibilidadeController {
    private $db;
    
    public function __construct($db) {
        $this->db = $db;
    }
    
    /**
     * Verificação rápida de disponibilidade (para formulário homepage)
     */
    public function verificarRapida() {
        $dataCheckin = $_GET['data_checkin'] ?? null;
        $dataCheckout = $_GET['data_checkout'] ?? null;
        
        if (!$dataCheckin || !$dataCheckout) {
            responderErro('Parâmetros data_checkin e data_checkout são obrigatórios', 400);
        }
        
        // Buscar todos os chalés ativos
        $sqlChales = "SELECT id, nome FROM chales WHERE ativo = 1 ORDER BY nome";
        $chales = executarQuery($this->db, $sqlChales);
        
        if (isset($chales['erro'])) {
            responderErro('Erro ao buscar chalés', 500, $chales['erro']);
        }
        
        $disponiveis = [];
        $ocupados = [];
        
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
                $ocupados[] = $chale;
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
                $disponiveis[] = $chale;
            } else {
                $ocupados[] = $chale;
            }
        }
        
        responderJSON([
            'data_checkin' => $dataCheckin,
            'data_checkout' => $dataCheckout,
            'total_disponiveis' => count($disponiveis),
            'total_ocupados' => count($ocupados),
            'chales_disponiveis' => $disponiveis,
            'chales_ocupados' => $ocupados
        ]);
    }
    
    /**
     * Retorna calendário de disponibilidade
     */
    public function obterCalendario() {
        $ano = $_GET['ano'] ?? date('Y');
        $mes = $_GET['mes'] ?? date('m');
        $chaleId = $_GET['chale_id'] ?? null;
        
        // Validar ano e mês
        if (!is_numeric($ano) || !is_numeric($mes) || $mes < 1 || $mes > 12) {
            responderErro('Ano ou mês inválido', 400);
        }
        
        // Primeiro e último dia do mês
        $primeiroDia = sprintf('%04d-%02d-01', $ano, $mes);
        $ultimoDia = date('Y-m-t', strtotime($primeiroDia));
        
        // Buscar reservas do período
        $sqlReservas = "
            SELECT 
                r.data_checkin,
                r.data_checkout,
                r.chale_id,
                c.nome as chale_nome
            FROM reservas r
            JOIN chales c ON r.chale_id = c.id
            WHERE r.status = 'confirmada'
            AND (
                (r.data_checkin <= ? AND r.data_checkout >= ?) OR
                (r.data_checkin >= ? AND r.data_checkin <= ?)
            )
        ";
        
        $params = [$ultimoDia, $primeiroDia, $primeiroDia, $ultimoDia];
        $tipos = 'ssss';
        
        if ($chaleId) {
            $sqlReservas .= " AND r.chale_id = ?";
            $params[] = $chaleId;
            $tipos .= 'i';
        }
        
        $reservas = executarQuery($this->db, $sqlReservas, $tipos, $params);
        
        // Buscar bloqueios do período
        $sqlBloqueios = "
            SELECT 
                b.data_inicio,
                b.data_fim,
                b.chale_id,
                b.motivo,
                c.nome as chale_nome
            FROM bloqueios b
            JOIN chales c ON b.chale_id = c.id
            WHERE (
                (b.data_inicio <= ? AND b.data_fim >= ?) OR
                (b.data_inicio >= ? AND b.data_inicio <= ?)
            )
        ";
        
        $paramsBloq = [$ultimoDia, $primeiroDia, $primeiroDia, $ultimoDia];
        $tiposBloq = 'ssss';
        
        if ($chaleId) {
            $sqlBloqueios .= " AND b.chale_id = ?";
            $paramsBloq[] = $chaleId;
            $tiposBloq .= 'i';
        }
        
        $bloqueios = executarQuery($this->db, $sqlBloqueios, $tiposBloq, $paramsBloq);
        
        // Montar calendário dia a dia
        $calendario = [];
        $dataAtual = new DateTime($primeiroDia);
        $dataFim = new DateTime($ultimoDia);
        
        while ($dataAtual <= $dataFim) {
            $dataStr = $dataAtual->format('Y-m-d');
            
            $dia = [
                'data' => $dataStr,
                'disponivel' => true,
                'reservas' => [],
                'bloqueios' => []
            ];
            
            // Verificar reservas
            if (!isset($reservas['erro'])) {
                foreach ($reservas as $reserva) {
                    if ($dataStr >= $reserva['data_checkin'] && $dataStr < $reserva['data_checkout']) {
                        $dia['disponivel'] = false;
                        $dia['reservas'][] = [
                            'chale_id' => $reserva['chale_id'],
                            'chale_nome' => $reserva['chale_nome']
                        ];
                    }
                }
            }
            
            // Verificar bloqueios
            if (!isset($bloqueios['erro'])) {
                foreach ($bloqueios as $bloqueio) {
                    if ($dataStr >= $bloqueio['data_inicio'] && $dataStr <= $bloqueio['data_fim']) {
                        $dia['disponivel'] = false;
                        $dia['bloqueios'][] = [
                            'chale_id' => $bloqueio['chale_id'],
                            'chale_nome' => $bloqueio['chale_nome'],
                            'motivo' => $bloqueio['motivo']
                        ];
                    }
                }
            }
            
            $calendario[] = $dia;
            $dataAtual->modify('+1 day');
        }
        
        responderJSON([
            'ano' => (int)$ano,
            'mes' => (int)$mes,
            'calendario' => $calendario
        ]);
    }
}
?>


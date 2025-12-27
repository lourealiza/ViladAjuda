<?php
/**
 * Controller de Chalés
 */
class ChaleController {
    private $db;
    
    public function __construct($db) {
        $this->db = $db;
    }
    
    /**
     * Lista todos os chalés ativos
     */
    public function listar() {
        $ativo = isset($_GET['ativo']) ? (bool)$_GET['ativo'] : null;
        
        $sql = "SELECT * FROM chales";
        $params = [];
        $tipos = '';
        
        if ($ativo !== null) {
            $sql .= " WHERE ativo = ?";
            $params[] = $ativo ? 1 : 0;
            $tipos = 'i';
        }
        
        $sql .= " ORDER BY nome";
        
        $result = executarQuery($this->db, $sql, $tipos, $params);
        
        if (isset($result['erro'])) {
            responderErro('Erro ao buscar chalés', 500, $result['erro']);
        }
        
        // Processar amenidades e imagens (JSON)
        foreach ($result as &$chale) {
            if ($chale['amenidades']) {
                $chale['amenidades'] = json_decode($chale['amenidades'], true);
            }
            if ($chale['imagens']) {
                $chale['imagens'] = json_decode($chale['imagens'], true);
            }
        }
        
        responderJSON([
            'total' => count($result),
            'chales' => $result
        ]);
    }
    
    /**
     * Busca um chalé específico por ID
     */
    public function buscarPorId($id) {
        $sql = "SELECT * FROM chales WHERE id = ?";
        $result = executarQuery($this->db, $sql, 'i', [$id]);
        
        if (isset($result['erro'])) {
            responderErro('Erro ao buscar chalé', 500, $result['erro']);
        }
        
        if (empty($result)) {
            responderErro('Chalé não encontrado', 404);
        }
        
        $chale = $result[0];
        
        // Processar amenidades e imagens (JSON)
        if ($chale['amenidades']) {
            $chale['amenidades'] = json_decode($chale['amenidades'], true);
        }
        if ($chale['imagens']) {
            $chale['imagens'] = json_decode($chale['imagens'], true);
        }
        
        responderJSON([
            'chale' => $chale
        ]);
    }
    
    /**
     * Verifica disponibilidade de um chalé específico
     */
    public function verificarDisponibilidade($chaleId) {
        $dataCheckin = $_GET['data_checkin'] ?? null;
        $dataCheckout = $_GET['data_checkout'] ?? null;
        
        if (!$dataCheckin || !$dataCheckout) {
            responderErro('Parâmetros data_checkin e data_checkout são obrigatórios', 400);
        }
        
        // Validar formato das datas
        if (!$this->validarData($dataCheckin) || !$this->validarData($dataCheckout)) {
            responderErro('Formato de data inválido. Use YYYY-MM-DD', 400);
        }
        
        // Verificar se o chalé existe
        $sqlChale = "SELECT * FROM chales WHERE id = ? AND ativo = 1";
        $chale = executarQuery($this->db, $sqlChale, 'i', [$chaleId]);
        
        if (isset($chale['erro'])) {
            responderErro('Erro ao buscar chalé', 500, $chale['erro']);
        }
        
        if (empty($chale)) {
            responderErro('Chalé não encontrado ou inativo', 404);
        }
        
        // Verificar bloqueios
        $sqlBloqueios = "
            SELECT * FROM bloqueios 
            WHERE chale_id = ? 
            AND (
                (data_inicio <= ? AND data_fim >= ?) OR
                (data_inicio <= ? AND data_fim >= ?) OR
                (data_inicio >= ? AND data_fim <= ?)
            )
        ";
        
        $bloqueios = executarQuery($this->db, $sqlBloqueios, 'issssss', [
            $chaleId,
            $dataCheckin, $dataCheckin,
            $dataCheckout, $dataCheckout,
            $dataCheckin, $dataCheckout
        ]);
        
        if (!empty($bloqueios) && !isset($bloqueios['erro'])) {
            responderJSON([
                'disponivel' => false,
                'motivo' => 'Período bloqueado',
                'chale' => $chale[0]
            ]);
        }
        
        // Verificar reservas existentes
        $sqlReservas = "
            SELECT * FROM reservas 
            WHERE chale_id = ? 
            AND status = 'confirmada'
            AND (
                (data_checkin <= ? AND data_checkout > ?) OR
                (data_checkin < ? AND data_checkout >= ?) OR
                (data_checkin >= ? AND data_checkout <= ?)
            )
        ";
        
        $reservas = executarQuery($this->db, $sqlReservas, 'issssss', [
            $chaleId,
            $dataCheckin, $dataCheckin,
            $dataCheckout, $dataCheckout,
            $dataCheckin, $dataCheckout
        ]);
        
        $disponivel = empty($reservas) || isset($reservas['erro']);
        
        responderJSON([
            'disponivel' => $disponivel,
            'chale' => $chale[0],
            'data_checkin' => $dataCheckin,
            'data_checkout' => $dataCheckout
        ]);
    }
    
    private function validarData($data) {
        $d = DateTime::createFromFormat('Y-m-d', $data);
        return $d && $d->format('Y-m-d') === $data;
    }
}
?>


<?php
/**
 * Controller de Avaliações Google
 */
class AvaliacaoController {
    private $db;
    
    public function __construct($db) {
        $this->db = $db;
    }
    
    /**
     * Busca avaliações para homepage (limitadas)
     */
    public function buscarParaHomepage() {
        $limite = $_GET['limite'] ?? 6;
        
        $sql = "
            SELECT 
                id, nome_autor, foto_autor, rating, texto, 
                data_avaliacao, origem, criado_em
            FROM avaliacoes_google
            WHERE ativo = 1
            ORDER BY ordem ASC, data_avaliacao DESC
            LIMIT ?
        ";
        
        $stmt = $this->db->prepare($sql);
        
        if ($stmt === false) {
            responderErro('Erro ao preparar SQL: ' . $this->db->error, 500);
        }
        
        $stmt->bind_param('i', $limite);
        
        if (!$stmt->execute()) {
            responderErro('Erro ao buscar avaliações: ' . $stmt->error, 500);
        }
        
        $result = $stmt->get_result();
        $avaliacoes = [];
        
        while ($row = $result->fetch_assoc()) {
            $avaliacoes[] = $row;
        }
        
        // Buscar estatísticas
        $sqlStats = "
            SELECT 
                COUNT(*) as total,
                AVG(rating) as media,
                SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) as cinco_estrelas
            FROM avaliacoes_google
            WHERE ativo = 1
        ";
        
        $resultStats = $this->db->query($sqlStats);
        $estatisticas = $resultStats->fetch_assoc();
        
        responderJSON([
            'avaliacoes' => $avaliacoes,
            'estatisticas' => [
                'total' => (int)$estatisticas['total'],
                'media' => round((float)$estatisticas['media'], 1),
                'cinco_estrelas' => (int)$estatisticas['cinco_estrelas']
            ]
        ]);
    }
    
    /**
     * Busca estatísticas gerais
     */
    public function buscarEstatisticas() {
        $sql = "
            SELECT 
                COUNT(*) as total,
                AVG(rating) as media,
                SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) as cinco_estrelas,
                SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END) as quatro_estrelas,
                SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END) as tres_estrelas,
                SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END) as duas_estrelas,
                SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) as uma_estrela
            FROM avaliacoes_google
            WHERE ativo = 1
        ";
        
        $result = $this->db->query($sql);
        $estatisticas = $result->fetch_assoc();
        
        responderJSON([
            'total' => (int)$estatisticas['total'],
            'media' => round((float)$estatisticas['media'], 1),
            'distribuicao' => [
                '5' => (int)$estatisticas['cinco_estrelas'],
                '4' => (int)$estatisticas['quatro_estrelas'],
                '3' => (int)$estatisticas['tres_estrelas'],
                '2' => (int)$estatisticas['duas_estrelas'],
                '1' => (int)$estatisticas['uma_estrela']
            ]
        ]);
    }
}
?>


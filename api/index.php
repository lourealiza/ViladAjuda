<?php
/**
 * API Backend Vila d'Ajuda - PHP Edition
 * Substituição do backend Node.js para hospedagem compartilhada KingHost
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Tratar preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Incluir configuração do banco
require_once __DIR__ . '/config/database.php';

// Health check
if ($_SERVER['REQUEST_URI'] === '/api/' || $_SERVER['REQUEST_URI'] === '/api') {
    echo json_encode([
        'mensagem' => 'API Vila d\'Ajuda funcionando!',
        'versao' => '2.0.0-PHP',
        'status' => 'online',
        'modulos' => [
            'Motor de Reservas',
            'Verificação de Disponibilidade',
            'Gestão de Chalés'
        ]
    ]);
    exit();
}

if ($_SERVER['REQUEST_URI'] === '/api/health') {
    echo json_encode([
        'status' => 'ok',
        'timestamp' => date('c')
    ]);
    exit();
}

// Roteamento simples
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$path = str_replace('/api', '', $path);
$method = $_SERVER['REQUEST_METHOD'];

// Incluir controladores
require_once __DIR__ . '/controllers/ChaleController.php';
require_once __DIR__ . '/controllers/DisponibilidadeController.php';
require_once __DIR__ . '/controllers/ReservaController.php';
require_once __DIR__ . '/controllers/AvaliacaoController.php';

// Rotas de Chalés
if (preg_match('#^/chales/?$#', $path) && $method === 'GET') {
    $controller = new ChaleController($db);
    $controller->listar();
    exit();
}

if (preg_match('#^/chales/(\d+)/?$#', $path, $matches) && $method === 'GET') {
    $controller = new ChaleController($db);
    $controller->buscarPorId($matches[1]);
    exit();
}

if (preg_match('#^/chales/(\d+)/disponibilidade/?$#', $path, $matches) && $method === 'GET') {
    $controller = new ChaleController($db);
    $controller->verificarDisponibilidade($matches[1]);
    exit();
}

// Rotas de Disponibilidade
if (preg_match('#^/disponibilidade/verificar-rapida/?$#', $path) && $method === 'GET') {
    $controller = new DisponibilidadeController($db);
    $controller->verificarRapida();
    exit();
}

if (preg_match('#^/disponibilidade/calendario/?$#', $path) && $method === 'GET') {
    $controller = new DisponibilidadeController($db);
    $controller->obterCalendario();
    exit();
}

// Rota para liberar período (remover bloqueios)
if (preg_match('#^/disponibilidade/liberar-periodo/?$#', $path) && $method === 'GET') {
    require_once __DIR__ . '/liberar-periodo.php';
    exit();
}

// Rotas de Reservas
if (preg_match('#^/reservas/?$#', $path) && $method === 'GET') {
    $controller = new ReservaController($db);
    $controller->listar();
    exit();
}

if (preg_match('#^/reservas/disponiveis/?$#', $path) && $method === 'GET') {
    $controller = new ReservaController($db);
    $controller->buscarChalesDisponiveis();
    exit();
}

if (preg_match('#^/reservas/calcular-preco/?$#', $path) && $method === 'GET') {
    $controller = new ReservaController($db);
    $controller->calcularPreco();
    exit();
}

if (preg_match('#^/reservas/?$#', $path) && $method === 'POST') {
    $controller = new ReservaController($db);
    $controller->criar();
    exit();
}

if (preg_match('#^/reservas/(\d+)/status/?$#', $path, $matches) && $method === 'PATCH') {
    $controller = new ReservaController($db);
    $controller->atualizarStatus($matches[1]);
    exit();
}

// Rotas de Avaliações
if (preg_match('#^/avaliacoes/homepage/?$#', $path) && $method === 'GET') {
    $controller = new AvaliacaoController($db);
    $controller->buscarParaHomepage();
    exit();
}

if (preg_match('#^/avaliacoes/estatisticas/?$#', $path) && $method === 'GET') {
    $controller = new AvaliacaoController($db);
    $controller->buscarEstatisticas();
    exit();
}

// Rota 404
http_response_code(404);
echo json_encode([
    'erro' => 'Rota não encontrada',
    'mensagem' => "A rota $method $path não existe"
]);
?>


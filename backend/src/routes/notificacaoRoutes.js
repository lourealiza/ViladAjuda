const express = require('express');
const router = express.Router();
const notificacaoController = require('../controllers/notificacaoController');
const { auth: autenticar } = require('../middleware/auth');
const { body } = require('express-validator');

// Middleware de autenticação obrigatório
router.use(autenticar);

/**
 * GET /api/notificacoes
 * Lista notificações do usuário autenticado
 * Query: ?status=XXX&tipo=YYY&nao_lidas=true&limite=20
 */
router.get('/', notificacaoController.listar);

/**
 * GET /api/notificacoes/nao-lidas/contar
 * Conta notificações não lidas
 */
router.get('/nao-lidas/contar', notificacaoController.contarNaoLidas);

/**
 * GET /api/notificacoes/tipos/listar
 * Lista tipos, status e canais disponíveis
 */
router.get('/tipos/listar', notificacaoController.listarTipos);

/**
 * GET /api/notificacoes/recurso/:tipo/:id
 * Busca notificações de um recurso (chale, reserva, pagamento)
 */
router.get('/recurso/:tipo/:id', notificacaoController.buscarPorRecurso);

/**
 * GET /api/notificacoes/:id
 * Obtém detalhes de uma notificação específica
 */
router.get('/:id', notificacaoController.obter);

/**
 * PATCH /api/notificacoes/:id/lida
 * Marca uma notificação como lida
 */
router.patch('/:id/lida', notificacaoController.marcarComoLida);

/**
 * POST /api/notificacoes/marcar-multiplas-lidas
 * Marca múltiplas notificações como lidas
 * Body: { ids: [1, 2, 3] }
 */
router.post('/marcar-multiplas-lidas', notificacaoController.marcarMultiplasComoLidas);

/**
 * DELETE /api/notificacoes/:id
 * Deleta uma notificação
 */
router.delete('/:id', notificacaoController.deletar);

/**
 * POST /api/notificacoes/testar
 * Envia uma notificação de teste (admin)
 * Body: { email: "admin@example.com", tipo: "alerta_sistema" }
 */
router.post(
    '/testar',
    body('email').isEmail().withMessage('Email inválido'),
    notificacaoController.testar
);

/**
 * POST /api/notificacoes
 * Cria e envia uma notificação manual (admin)
 * Body: { titulo, conteudo, tipo, usuario_id?, email?, canais_entrega? }
 */
router.post(
    '/',
    body('titulo').notEmpty().withMessage('Título é obrigatório'),
    body('conteudo').notEmpty().withMessage('Conteúdo é obrigatório'),
    body('tipo').notEmpty().withMessage('Tipo é obrigatório'),
    notificacaoController.criar
);

/**
 * GET /api/notificacoes/pendentes/processar
 * Processa a fila de notificações pendentes (admin)
 */
router.get('/pendentes/processar', notificacaoController.processarPendentes);

module.exports = router;

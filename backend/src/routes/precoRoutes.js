const express = require('express');
const router = express.Router();
const precoController = require('../controllers/precoController');
const precoAvancadoController = require('../controllers/precoAvancadoController');
const { auth: autenticar } = require('../middleware/auth');
const { body, query } = require('express-validator');

// ========== ROTAS PÚBLICAS ==========
// Rotas públicas (sem autenticação)
router.get('/calcular', precoController.calcular);
router.get('/temporada', precoController.obterTemporada);
router.get('/tabela', precoController.obterTabela);

// ========== PRICING DINÂMICO AVANÇADO ==========

/**
 * POST /api/precos/calcular-dinamico
 * Calcula preço completo com todas as regras dinâmicas
 * Body: { chale_id, data_checkin, data_checkout, num_hospedes?, num_criancas? }
 */
router.post(
    '/calcular-dinamico',
    body('chale_id').isInt().withMessage('chale_id deve ser um número'),
    body('data_checkin').isISO8601().withMessage('data_checkin inválida'),
    body('data_checkout').isISO8601().withMessage('data_checkout inválida'),
    precoAvancadoController.calcularDinamico
);

/**
 * GET /api/precos/simular-cenarios
 * Simula múltiplos cenários de preço
 * Query: ?chale_id=X&data_checkin=YYYY-MM-DD&data_checkout=YYYY-MM-DD&num_hospedes=2
 */
router.get('/simular-cenarios', precoAvancadoController.simularCenarios);

/**
 * POST /api/precos/cancelamento
 * Calcula impacto de cancelamento
 * Body: { chale_id, valor_total, dias_antes_checkin? }
 */
router.post(
    '/cancelamento',
    body('chale_id').isInt().withMessage('chale_id deve ser um número'),
    body('valor_total').isFloat({ min: 0 }).withMessage('valor_total inválido'),
    precoAvancadoController.calcularCancelamento
);

/**
 * GET /api/precos/info-tipos
 * Lista tipos de políticas e adicionais disponíveis
 */
router.get('/info-tipos', precoAvancadoController.listarTipos);

// ========== POLÍTICAS DE CANCELAMENTO (Requer autenticação) ==========

/**
 * POST /api/precos/politicas (Admin)
 * Cria política de cancelamento
 */
router.post(
    '/politicas',
    autenticar,
    body('chale_id').isInt().withMessage('chale_id obrigatório'),
    body('tipo').notEmpty().withMessage('tipo obrigatório'),
    precoAvancadoController.criarPolitica
);

/**
 * GET /api/precos/politicas/:chale_id
 * Obtém política de um chalé
 */
router.get('/politicas/:chale_id', precoAvancadoController.obterPolitica);

/**
 * PUT /api/precos/politicas/:id (Admin)
 * Atualiza política
 */
router.put('/politicas/:id', autenticar, precoAvancadoController.atualizarPolitica);

// ========== PREÇOS ADICIONAIS (Requer autenticação) ==========

/**
 * POST /api/precos/adicionais (Admin)
 * Cria preço adicional
 */
router.post(
    '/adicionais',
    autenticar,
    body('chale_id').isInt().withMessage('chale_id obrigatório'),
    body('tipo').notEmpty().withMessage('tipo obrigatório'),
    body('preco_por_noite').isFloat({ min: 0 }).withMessage('preco_por_noite obrigatório'),
    precoAvancadoController.criarAdicional
);

/**
 * GET /api/precos/adicionais/:chale_id
 * Lista preços adicionais
 */
router.get('/adicionais/:chale_id', precoAvancadoController.listarAdicionais);

/**
 * PUT /api/precos/adicionais/:id (Admin)
 * Atualiza preço adicional
 */
router.put('/adicionais/:id', autenticar, precoAvancadoController.atualizarAdicional);

/**
 * DELETE /api/precos/adicionais/:id (Admin)
 * Deleta preço adicional
 */
router.delete('/adicionais/:id', autenticar, precoAvancadoController.deletarAdicional);

module.exports = router;


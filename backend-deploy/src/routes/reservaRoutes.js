const express = require('express');
const router = express.Router();
const reservaController = require('../controllers/reservaController');
const reservaWorkflowController = require('../controllers/reservaWorkflowController');
const { validarReserva, tratarErrosValidacao } = require('../middleware/validacao');
const { auth } = require('../middleware/auth');
const { verificarAdmin, verificarAcessoReservas } = require('../middleware/permissao');

// Rotas públicas
router.post('/', validarReserva, tratarErrosValidacao, reservaController.criar);
router.get('/disponiveis', reservaController.buscarChalesDisponiveis);

// Rotas protegidas (admin ou operador)
router.get('/', auth, verificarAcessoReservas, reservaController.listar);
router.get('/periodo', auth, verificarAcessoReservas, reservaController.buscarPorPeriodo);
router.get('/:id', auth, verificarAcessoReservas, reservaController.buscarPorId);
router.put('/:id', auth, verificarAcessoReservas, reservaController.atualizar);
router.delete('/:id', auth, verificarAdmin, reservaController.deletar);

// Workflow de reservas (admin ou operador)
router.patch('/:id/status', auth, verificarAcessoReservas, reservaWorkflowController.atualizarStatus);
router.get('/:id/proximos-status', auth, verificarAcessoReservas, reservaWorkflowController.obterProximosStatus);
router.get('/:id/resumo', auth, verificarAcessoReservas, reservaWorkflowController.gerarResumo);
router.get('/workflow/estatisticas', auth, verificarAcessoReservas, reservaWorkflowController.obterEstatisticasFunil);

module.exports = router;


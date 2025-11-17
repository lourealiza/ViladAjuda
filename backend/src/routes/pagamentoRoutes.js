const express = require('express');
const router = express.Router();
const PagamentoController = require('../controllers/pagamentoController');
const { auth } = require('../middleware/auth');

// Rotas protegidas (admin)
router.get('/', auth, PagamentoController.listar);
router.get('/:id', auth, PagamentoController.buscarPorId);
router.post('/', auth, PagamentoController.criar);
router.put('/:id/status', auth, PagamentoController.atualizarStatus);
router.post('/:id/confirmar', auth, PagamentoController.confirmarManual);
router.get('/reserva/:reserva_id', auth, PagamentoController.buscarPorReserva);

module.exports = router;


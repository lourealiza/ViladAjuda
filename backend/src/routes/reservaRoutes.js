const express = require('express');
const router = express.Router();
const reservaController = require('../controllers/reservaController');
const { validarReserva, tratarErrosValidacao } = require('../middleware/validacao');
const { auth } = require('../middleware/auth');

// Rotas públicas
router.post('/', validarReserva, tratarErrosValidacao, reservaController.criar);
router.get('/disponiveis', reservaController.buscarChalesDisponiveis);

// Rotas protegidas (apenas administradores)
router.get('/', auth, reservaController.listar);
router.get('/periodo', auth, reservaController.buscarPorPeriodo);
router.get('/:id', auth, reservaController.buscarPorId);
router.put('/:id', auth, reservaController.atualizar);
router.delete('/:id', auth, reservaController.deletar);
router.patch('/:id/status', auth, reservaController.atualizarStatus);

module.exports = router;


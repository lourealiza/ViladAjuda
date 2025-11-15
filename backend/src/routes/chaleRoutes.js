const express = require('express');
const router = express.Router();
const chaleController = require('../controllers/chaleController');
const { validarChale, tratarErrosValidacao } = require('../middleware/validacao');
const { auth } = require('../middleware/auth');

// Rotas públicas
router.get('/', chaleController.listar);
router.get('/:id', chaleController.buscarPorId);
router.get('/:id/disponibilidade', chaleController.verificarDisponibilidade);

// Rotas protegidas (apenas administradores)
router.post('/', auth, validarChale, tratarErrosValidacao, chaleController.criar);
router.put('/:id', auth, tratarErrosValidacao, chaleController.atualizar);
router.delete('/:id', auth, chaleController.deletar);

module.exports = router;


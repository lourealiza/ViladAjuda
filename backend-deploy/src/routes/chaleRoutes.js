const express = require('express');
const router = express.Router();
const chaleController = require('../controllers/chaleController');
const { validarChale, tratarErrosValidacao } = require('../middleware/validacao');
const { auth } = require('../middleware/auth');
const { verificarAdmin } = require('../middleware/permissao');

// Rotas públicas
router.get('/', chaleController.listar);
router.get('/:id', chaleController.buscarPorId);
router.get('/:id/disponibilidade', chaleController.verificarDisponibilidade);

// Rotas protegidas (apenas admin)
router.post('/', auth, verificarAdmin, validarChale, tratarErrosValidacao, chaleController.criar);
router.put('/:id', auth, verificarAdmin, tratarErrosValidacao, chaleController.atualizar);
router.delete('/:id', auth, verificarAdmin, chaleController.deletar);

module.exports = router;

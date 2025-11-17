const express = require('express');
const router = express.Router();
const BloqueioController = require('../controllers/bloqueioController');
const { auth } = require('../middleware/auth');
const { verificarAcessoReservas } = require('../middleware/permissao');

// Rotas públicas
router.get('/verificar', BloqueioController.verificar);

// Rotas protegidas (admin ou operador)
router.get('/', auth, verificarAcessoReservas, BloqueioController.listar);
router.get('/:id', auth, verificarAcessoReservas, BloqueioController.buscarPorId);
router.post('/', auth, verificarAcessoReservas, BloqueioController.criar);
router.put('/:id', auth, verificarAcessoReservas, BloqueioController.atualizar);
router.delete('/:id', auth, verificarAcessoReservas, BloqueioController.deletar);

module.exports = router;

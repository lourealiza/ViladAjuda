const express = require('express');
const router = express.Router();
const AvaliacaoController = require('../controllers/avaliacaoController');
const { auth } = require('../middleware/auth');
const { verificarAdmin } = require('../middleware/permissao');

// Rotas públicas
router.get('/', AvaliacaoController.listar);
router.get('/homepage', AvaliacaoController.buscarParaHomepage);
router.get('/estatisticas', AvaliacaoController.obterEstatisticas);
router.get('/:id', AvaliacaoController.buscarPorId);

// Rotas protegidas (apenas admin)
router.post('/', auth, verificarAdmin, AvaliacaoController.criar);
router.put('/:id', auth, verificarAdmin, AvaliacaoController.atualizar);
router.delete('/:id', auth, verificarAdmin, AvaliacaoController.deletar);

module.exports = router;


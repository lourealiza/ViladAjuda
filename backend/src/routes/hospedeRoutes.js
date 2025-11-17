const express = require('express');
const router = express.Router();
const HospedeController = require('../controllers/hospedeController');
const { auth } = require('../middleware/auth');

// Rotas básicas
router.get('/', auth, HospedeController.listar);
router.get('/:id', auth, HospedeController.buscarPorId);
router.post('/', auth, HospedeController.criar);
router.post('/buscar-ou-criar', auth, HospedeController.buscarOuCriar);
router.put('/:id', auth, HospedeController.atualizar);

// Histórico e estatísticas
router.get('/:id/historico', auth, HospedeController.buscarHistorico);
router.get('/:id/estatisticas', auth, HospedeController.obterEstatisticas);

// Campanhas e segmentação
router.get('/campanhas/retorno', auth, HospedeController.buscarParaCampanhaRetorno);
router.get('/campanhas/localizacao', auth, HospedeController.buscarPorLocalizacao);
router.get('/campanhas/origem/:origem', auth, HospedeController.buscarPorOrigem);

module.exports = router;
